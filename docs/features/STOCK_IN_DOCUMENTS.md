# Stock-in Documents: Technical and Functional Guide

This document explains how the stock-in document page works, from the page route through upload, persistence, listing, and download.

## What `stock-in.js` Does

The page at `/dashboard/stock-in` is intentionally thin. It imports and renders the feature component:

```js
import StockInDocuments from "@/components/dashboard/StockInDocuments";

export default function StockIn() {
  return <StockInDocuments />;
}
```

The page itself contains no upload or download logic. That behavior lives in `StockInDocuments`, which owns the form state, API calls, and attached-document list.

## Functional Behavior

The stock-in document screen lets a user:

1. Enter a stock-in reference, defaulting to `DELIVERY-001`.
2. Select one PDF, JPG, or PNG file.
3. Upload a file up to 10 MB.
4. See documents already associated with that stock-in reference.
5. Download an attached document.

When the reference changes, the component calls `GET /api/documents` and refreshes the list. After a successful upload, it calls the same endpoint again so the new document appears immediately.

## End-to-end Flow

```text
Browser: /dashboard/stock-in
  |
  | 1. POST /api/documents/presign
  |    Sends reference, filename, MIME type, and file size
  v
Next.js API route: presign.js
  |
  | Creates a random stock-in/<uuid>.<extension> key
  | Signs an S3 PutObject request for 15 minutes
  v
Browser -- PUT signed URL --> S3 or LocalStack S3
  |
  | 2. POST /api/documents/complete
  |    Sends reference, original filename, object key, type, and size
  v
Next.js API route: complete.js
  |
  | HEAD object in S3 to verify size and content type
  | INSERT metadata into PostgreSQL
  v
PostgreSQL: stock_in_documents

Later:
Browser -- GET /api/documents/:id/download --> Next.js
Next.js -- signed GetObject URL --> S3
Browser follows redirect and downloads the object
```

## Upload Details

### 1. The component requests a presigned URL

`src/components/dashboard/StockInDocuments.js` sends the file metadata to `/api/documents/presign`:

```js
const presignResponse = await fetch("/api/documents/presign", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    stockInReference: reference.trim(),
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
  }),
});

const presign = await presignResponse.json();
if (!presignResponse.ok) throw new Error(presign.error);
```

The browser does not send the file through the Next.js server. The server only validates the metadata and creates a temporary signed S3 request.

### 2. The presign route validates and creates the S3 key

`src/pages/api/documents/presign.js` accepts only these MIME types:

- `application/pdf`
- `image/jpeg`
- `image/png`

The maximum file size is `10 * 1024 * 1024` bytes. The object key is generated server-side, so the user-provided filename is not used as the storage path:

```js
const extension = fileName.includes(".")
  ? fileName.split(".").pop().toLowerCase()
  : "bin";
const objectKey = `stock-in/${crypto.randomUUID()}.${extension}`;

const uploadUrl = await getSignedUrl(
  s3ForBrowser,
  new PutObjectCommand({
    Bucket: DOCUMENT_BUCKET,
    Key: objectKey,
    ContentType: contentType,
    ContentLength: fileSize,
  }),
  { expiresIn: 900 },
);

return res.status(200).json({ uploadUrl, objectKey });
```

The response contains:

- `uploadUrl`: a presigned `PUT` URL that expires after 15 minutes.
- `objectKey`: the generated S3 key, later stored in PostgreSQL.

### 3. The browser uploads directly to S3

The component uses the presigned URL and sends the file body directly to S3:

```js
const uploadResponse = await fetch(presign.uploadUrl, {
  method: "PUT",
  headers: { "Content-Type": file.type },
  body: file,
});

if (!uploadResponse.ok) throw new Error("S3 upload failed");
```

In local development, this request goes to LocalStack through the public endpoint. In production, it goes to the configured AWS S3 endpoint.

### 4. The component completes the upload

After the S3 `PUT` succeeds, the browser calls `/api/documents/complete`:

```js
const completeResponse = await fetch("/api/documents/complete", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    stockInReference: reference.trim(),
    originalName: file.name,
    objectKey: presign.objectKey,
    contentType: file.type,
    fileSize: file.size,
  }),
});
```

`complete.js` uses `HeadObjectCommand` to confirm that the object exists and that its stored `ContentLength` and `ContentType` match the values sent by the browser. Only after this check passes does it insert a metadata row into PostgreSQL.

```js
const object = await s3.send(
  new HeadObjectCommand({ Bucket: DOCUMENT_BUCKET, Key: objectKey }),
);

if (object.ContentLength !== fileSize || object.ContentType !== contentType) {
  return res.status(400).json({ error: "Uploaded file details do not match" });
}

await query(
  `INSERT INTO stock_in_documents
    (stock_in_reference, original_name, object_key, content_type, file_size)
   VALUES ($1, $2, $3, $4, $5)`,
  [stockInReference, originalName, objectKey, contentType, fileSize],
);
```

## Storage Model

The file contents and document metadata are stored separately:

| Data               | Location            | Purpose                                                              |
| ------------------ | ------------------- | -------------------------------------------------------------------- |
| File bytes         | S3 or LocalStack S3 | Stores the PDF, JPG, or PNG object                                   |
| Original filename  | PostgreSQL          | Displayed in the attached-document list and used for download naming |
| S3 object key      | PostgreSQL          | Connects a metadata row to its S3 object                             |
| Stock-in reference | PostgreSQL          | Associates the document with a delivery or stock-in record           |
| MIME type and size | PostgreSQL          | Display and integrity metadata                                       |
| Created timestamp  | PostgreSQL          | Sorts newest attachments first                                       |

The table is created by `database/migrations/001-create-tables.sql` and indexed by
`database/migrations/003-create-indexes.sql`:

```sql
CREATE TABLE IF NOT EXISTS stock_in_documents (
  id BIGSERIAL PRIMARY KEY,
  stock_in_reference TEXT NOT NULL,
  original_name TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The SQLite database used by the local search cache is not involved in this feature.

## Listing Attached Documents

On initial render, and whenever the reference is blurred or an upload completes, the component requests:

```text
GET /api/documents?stockInReference=DELIVERY-001
```

`src/pages/api/documents/index.js` queries PostgreSQL by exact reference and returns document metadata ordered by newest first. The response does not contain the file bytes or a permanent S3 URL.

The UI renders each document with a download link built from its database ID:

```jsx
<a href={`/api/documents/${document.id}/download`}>Download</a>
```

## How and Where Documents Are Downloaded

Downloads are initiated from the **Download** link in `StockInDocuments`. The link requests:

```text
GET /api/documents/:id/download
```

The route is `src/pages/api/documents/[id]/download.js`. It performs these steps:

1. Looks up `object_key` and `original_name` in PostgreSQL using the document ID.
2. Creates a five-minute presigned S3 `GetObject` URL.
3. Sets `ResponseContentDisposition` to `attachment` and sanitizes the original filename.
4. Returns an HTTP `307` redirect to the signed URL.
5. The browser follows the redirect and downloads the object directly from S3 or LocalStack.

The core implementation is:

```js
const downloadUrl = await getSignedUrl(
  s3,
  new GetObjectCommand({
    Bucket: DOCUMENT_BUCKET,
    Key: rows[0].object_key,
    ResponseContentDisposition: `attachment; filename="${rows[0].original_name.replace(
      /[^a-zA-Z0-9._ -]/g,
      "_",
    )}"`,
  }),
  { expiresIn: 300 },
);

return res.redirect(307, downloadUrl);
```

Therefore, the Next.js route authorizes and signs the download, but it does not stream the file through the application server.

## S3 Client Configuration

`src/lib/s3.js` exposes two clients:

- `s3ForBrowser`: used to create presigned upload URLs. In development it uses `S3_PUBLIC_ENDPOINT`, which must be reachable from the browser.
- `s3`: used by server-side API routes for `HEAD` and `GET` signing. In development it uses `S3_ENDPOINT`, which can be the internal Docker hostname.

Relevant environment variables are:

```dotenv
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
S3_BUCKET_NAME=restaurant-inventory-documents
S3_ENDPOINT=http://localhost:4566
S3_PUBLIC_ENDPOINT=http://localhost:4566
```

When the app runs inside Docker Compose, the server-side endpoint is overridden to `http://localstack:4566` while the browser-facing endpoint remains `http://localhost:4566`. In production, `NODE_ENV=production` causes the custom LocalStack endpoints to be ignored and the AWS SDK uses standard AWS S3 configuration.

LocalStack creates the bucket and applies browser CORS in `localStack/init/ready.d/10-s3.sh`. The CORS configuration allows `PUT`, `GET`, and `HEAD` from the local application origins.

## Error and Consistency Behavior

- Missing reference or file: the component shows a validation message and makes no request.
- Invalid type or file larger than 10 MB: the presign route returns `400`.
- S3 upload failure: completion is not attempted and the user sees `S3 upload failed`.
- Missing S3 object or metadata mismatch: completion returns an error and no metadata row is created.
- Missing database row during download: the download route returns `404`.
- Presigned URLs are temporary: upload URLs last 15 minutes and download URLs last 5 minutes.

One important operational detail is that the S3 object is uploaded before the PostgreSQL metadata row is inserted. If completion fails after the `PUT` succeeds, an unreferenced S3 object can remain and may require cleanup.

## Main Files

- `src/pages/dashboard/stock-in.js`: route-level page wrapper.
- `src/components/dashboard/StockInDocuments.js`: upload form, state, listing, and download link.
- `src/pages/api/documents/presign.js`: validates input and signs S3 `PutObject` requests.
- `src/pages/api/documents/complete.js`: verifies the S3 object and stores metadata.
- `src/pages/api/documents/index.js`: lists metadata by stock-in reference.
- `src/pages/api/documents/[id]/download.js`: signs `GetObject` and redirects the browser.
- `src/lib/s3.js`: creates S3 clients and selects LocalStack versus AWS behavior.
- `database/migrations/001-create-tables.sql`: PostgreSQL metadata table.
- `localStack/init/ready.d/10-s3.sh`: local bucket and CORS initialization.
