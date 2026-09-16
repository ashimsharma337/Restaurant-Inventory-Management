import { HeadObjectCommand } from "@aws-sdk/client-s3";
import s3, { DOCUMENT_BUCKET } from "@/lib/s3";
import { query } from "@/utility/db";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { stockInReference, originalName, objectKey, contentType, fileSize } =
    req.body || {};
  if (
    !DOCUMENT_BUCKET ||
    !stockInReference ||
    !originalName ||
    !objectKey ||
    !contentType
  ) {
    return res.status(400).json({ error: "Document details are required" });
  }

  try {
    const object = await s3.send(
      new HeadObjectCommand({ Bucket: DOCUMENT_BUCKET, Key: objectKey }),
    );
    if (
      object.ContentLength !== fileSize ||
      object.ContentType !== contentType
    ) {
      return res
        .status(400)
        .json({ error: "Uploaded file details do not match" });
    }

    const { rows } = await query(
      `INSERT INTO stock_in_documents
        (stock_in_reference, original_name, object_key, content_type, file_size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, stock_in_reference, original_name, content_type, file_size, created_at`,
      [stockInReference, originalName, objectKey, contentType, fileSize],
    );
    return res.status(201).json({ document: rows[0] });
  } catch (error) {
    console.error("[/api/documents/complete] error:", error);
    return res.status(500).json({ error: "Could not save document metadata" });
  }
}
