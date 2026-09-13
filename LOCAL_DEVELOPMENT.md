# Local Development Runbook

This guide starts and verifies the restaurant inventory application, PostgreSQL, LocalStack S3, and the document upload workflow.

## Prerequisites

- Docker Desktop is running.
- Node.js `>=20.9.0` is installed.
- npm is installed.
- AWS CLI is installed for LocalStack checks.
- PostgreSQL CLI tools are installed if you want to run `psql` checks from the host.

## Project Services

| Service | Purpose | Host address |
| --- | --- | --- |
| Next.js | Web application and API routes | `http://localhost:3000` |
| PostgreSQL | Product and document metadata | `localhost:5433` |
| LocalStack S3 | Local AWS S3 emulator | `http://localhost:4566` |
| pgAdmin | Optional database UI | `http://localhost:5050` |

The document feature stores file contents in S3 and stores only metadata in PostgreSQL. The SQLite database in `src/lib/db.js` is a separate local search cache and is not used for document metadata.

When connecting through pgAdmin, use the Compose service address rather than the host address:

| pgAdmin field | Value |
| --- | --- |
| Host name/address | `postgres` |
| Port | `5432` |
| Maintenance database | `mydb` |
| Username | `postgres` |
| Password | `postgres` |

Use `localhost:5433` only for tools running directly on your Mac. Inside Docker, `localhost` refers to the current container.

## Environment Files

Next.js loads `.env.local` with higher priority than `.env`. Keep the PostgreSQL values consistent with `docker-compose.yml`:

```dotenv
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_DB=mydb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DB_SSL=false

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
S3_BUCKET_NAME=restaurant-inventory-documents
S3_ENDPOINT=http://localhost:4566
```

The `test` AWS credentials are dummy credentials accepted by LocalStack. Do not use them with real AWS. Do not commit real credentials to the repository.

Docker Compose overrides the host-oriented values for the app container: it uses PostgreSQL at `postgres:5432` and LocalStack at `localstack:4566`. The host-oriented values in `.env.local` use `localhost:5433` and `localhost:4566` for running Next.js directly on your Mac.

The S3 client selects LocalStack only when `NODE_ENV=development`. In production, `S3_ENDPOINT` and `S3_PUBLIC_ENDPOINT` are ignored and the AWS SDK uses the real S3 service automatically.

For real S3 browser uploads, configure bucket CORS after creating the bucket:

```bash
AWS_PROFILE=restaurant-inventory aws s3api put-bucket-cors \
  --bucket restaurant-inventory-production-12345 \
  --cors-configuration file://s3-cors.json
```

The policy is stored in `s3-cors.json`. Replace `https://your-production-domain.com` with the actual production frontend origin before deploying. Keep `http://localhost:3000` while testing from the local browser.

For real AWS S3, use production settings similar to:

```dotenv
NODE_ENV=production
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-production-bucket
# Do not set S3_ENDPOINT or S3_PUBLIC_ENDPOINT.
```

## First-Time Setup

Install dependencies:

```bash
npm install
```

Start PostgreSQL and LocalStack:

```bash
docker compose up -d postgres localstack
```

LocalStack automatically creates the `restaurant-inventory-documents` bucket and applies local browser CORS through `localStack/init/ready.d/10-s3.sh`.

Check service state:

```bash
docker compose ps
```

Create the local S3 bucket. This is safe to run once; if the bucket already exists, AWS CLI reports that it already exists.

```bash
AWS_ACCESS_KEY_ID=test \
AWS_SECRET_ACCESS_KEY=test \
AWS_DEFAULT_REGION=us-east-1 \
aws --endpoint-url=http://localhost:4566 \
s3 mb s3://restaurant-inventory-documents
```

Apply the stock-in document table migration:

```bash
PGPASSWORD=postgres psql \
  -h localhost -p 5433 \
  -U postgres -d mydb \
  -f database/schema/stock_in_documents.sql
```

Initialize the SQLite search cache if this is a new checkout:

```bash
node scripts/seed-local.js
node scripts/setup-fts.js
```

## Start the Application

Start the Next.js development server:

```bash
npm run dev
```

Open:

- Application: <http://localhost:3000>
- Stock-in documents: <http://localhost:3000/dashboard/stock-in>
- Health endpoint: <http://localhost:3000/api/health>

If port `3000` is already in use, use another port:

```bash
PORT=3001 npm run dev
```

Only run one Next.js dev server for this workspace at a time. Multiple instances can conflict over `.next/dev/lock`.

## Verify Each Service

### Docker and containers

```bash
docker info
docker compose ps
```

Expected Compose services:

- `postgres_db`: `healthy`
- `localstack`: `running` or `healthy`

### PostgreSQL

```bash
pg_isready -h localhost -p 5433 -U postgres -d mydb
```

Expected result:

```text
localhost:5433 - accepting connections
```

Check the document table:

```bash
PGPASSWORD=postgres psql \
  -h localhost -p 5433 \
  -U postgres -d mydb \
  -c "\\dt stock_in_documents"
```

Inspect uploaded document metadata:

```bash
PGPASSWORD=postgres psql \
  -h localhost -p 5433 \
  -U postgres -d mydb \
  -c "SELECT id, stock_in_reference, original_name, object_key, file_size, created_at FROM stock_in_documents ORDER BY created_at DESC;"
```

### LocalStack S3

Check LocalStack health:

```bash
curl http://localhost:4566/_localstack/health
```

The response should show:

```json
"s3": "available"
```

List buckets:

```bash
AWS_ACCESS_KEY_ID=test \
AWS_SECRET_ACCESS_KEY=test \
AWS_DEFAULT_REGION=us-east-1 \
aws --endpoint-url=http://localhost:4566 \
s3api list-buckets
```

List uploaded document objects:

```bash
AWS_ACCESS_KEY_ID=test \
AWS_SECRET_ACCESS_KEY=test \
AWS_DEFAULT_REGION=us-east-1 \
aws --endpoint-url=http://localhost:4566 \
s3 ls s3://restaurant-inventory-documents/stock-in/
```

### Next.js API

Check the application health route:

```bash
curl http://localhost:3000/api/health
```

Check document metadata for a stock-in reference:

```bash
curl "http://localhost:3000/api/documents?stockInReference=DELIVERY-001"
```

## Test the Upload Workflow

1. Open `/dashboard/stock-in`.
2. Enter a stock-in reference, such as `DELIVERY-001`.
3. Select a PDF, JPG, or PNG file no larger than 10 MB.
4. Click **Upload document**.
5. Confirm the document appears in the attached documents list.
6. Confirm the metadata exists in PostgreSQL using the query above.
7. Confirm the object exists in LocalStack using the S3 listing command above.
8. Click **Download** and confirm the file is retrieved.

The upload sequence is:

```text
Browser -> POST /api/documents/presign
Browser -> PUT signed URL -> LocalStack S3
Browser -> POST /api/documents/complete
Next.js -> HEAD object in S3
Next.js -> INSERT metadata in PostgreSQL
```

A successful presign response alone does not prove that S3 or PostgreSQL is working. The browser must also complete the S3 PUT and the metadata completion request must return `201`.

## Common Problems

### `POST /api/documents/presign` returns `500`

Check that `S3_BUCKET_NAME` is present and that the Next.js process was restarted after changing `.env.local`.

### Presign succeeds but the browser upload fails

Check LocalStack:

```bash
curl http://localhost:4566/_localstack/health
```

Also verify that the URL in the presign response uses `http://localhost:4566` and that Compose publishes port `4566`:

```bash
docker compose ps
```

### Completion returns `500`

Check both services and the table:

```bash
docker compose ps
pg_isready -h localhost -p 5433 -U postgres -d mydb
PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d mydb -c "\\dt stock_in_documents"
```

The most common causes are:

- PostgreSQL is stopped.
- `.env.local` points to port `5432` instead of `5433`.
- `.env.local` uses the wrong database or password.
- `database/schema/stock_in_documents.sql` has not been applied.
- The S3 object was not uploaded before `/api/documents/complete` ran.

### `psql "$DATABASE_URL"` connects to the wrong place

The shell does not automatically load `.env` or `.env.local`. Use the explicit `PGPASSWORD`, host, port, database, and user commands in this guide, or load environment variables yourself before running `psql`.

### `.next/dev/lock` already exists

Another Next.js development server is running. Stop the existing server with `Ctrl+C`, then run:

```bash
npm run dev
```

Do not delete the lock while another Next.js process is still running.

### LocalStack is running but `localhost:4566` is unreachable

A standalone LocalStack container may be running without a host port mapping. Check:

```bash
docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'
```

Start the project-managed service instead:

```bash
docker compose up -d localstack
```

The ports should include:

```text
0.0.0.0:4566->4566/tcp
```

## Stop Services

Stop the application with `Ctrl+C`, then stop Compose services:

```bash
docker compose down
```

This does not remove the PostgreSQL volume. To remove local PostgreSQL data as well, use this only when you intentionally want a clean database:

```bash
docker compose down -v
```

## Useful Project Files

- `docker-compose.yml`: PostgreSQL and LocalStack service definitions
- `.env.local`: local environment overrides loaded by Next.js
- `database/schema/stock_in_documents.sql`: document metadata migration
- `src/lib/s3.js`: S3 client configuration
- `src/pages/api/documents/`: upload, completion, listing, and download APIs
- `src/components/dashboard/StockInDocuments.js`: upload and download UI
- `src/utility/db.js`: PostgreSQL connection
- `src/lib/db.js`: SQLite search-cache connection
