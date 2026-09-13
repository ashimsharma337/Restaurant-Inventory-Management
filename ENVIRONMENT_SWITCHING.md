# Environment Switching Reference

This project supports two S3 targets:

- **LocalStack** for development and offline testing.
- **Real AWS S3** for testing the production integration from your laptop.

The application code uses the same presigned upload and download flow in both modes.

## LocalStack Development

Use this mode for normal local development.

Start the infrastructure:

```bash
./scripts/use-localstack.sh
```

This copies `.env.localstack.example` to the ignored `.env.local`, so the next Next.js process uses LocalStack settings.

Or run the commands manually:

```bash
docker compose up -d postgres localstack pgadmin
npm run dev
```

Open:

```text
http://localhost:3000/dashboard/stock-in
```

LocalStack configuration:

```env
NODE_ENV=development
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1
S3_BUCKET_NAME=restaurant-inventory-documents
S3_ENDPOINT=http://localhost:4566
S3_PUBLIC_ENDPOINT=http://localhost:4566
```

The LocalStack startup hook creates the bucket and applies CORS automatically:

```text
localStack/init/ready.d/10-s3.sh
```

Verify LocalStack:

```bash
curl http://localhost:4566/_localstack/health
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=us-east-1 \
  aws --endpoint-url=http://localhost:4566 s3 ls
```

## Real AWS S3 From Your Laptop

Use this mode to test real S3 without deploying the application.

Prerequisites:

```bash
AWS_PROFILE=restaurant-inventory aws sts get-caller-identity
```

That command must return your AWS account. If it fails, fix the AWS CLI profile before continuing.

Stop the Docker app if it is using port `3000`, but keep PostgreSQL available:

```bash
./scripts/use-aws.sh
```

The script verifies the AWS profile, copies `.env.aws.example` to the ignored `.env.local`, stops the Docker app and LocalStack, and starts PostgreSQL and pgAdmin.

To perform those steps manually:

```bash
docker compose stop app localstack
docker compose up -d postgres pgadmin
```

Start Next.js against real AWS:

```bash
AWS_PROFILE=restaurant-inventory npm run dev
```

The real AWS environment must contain:

```env
NODE_ENV=production
AWS_PROFILE=restaurant-inventory
AWS_REGION=us-east-1
S3_BUCKET_NAME=restaurant-inventory-production-12345
```

Do not set these in real AWS mode:

```env
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
S3_ENDPOINT=http://localhost:4566
S3_PUBLIC_ENDPOINT=http://localhost:4566
```

The S3 client automatically uses AWS when `NODE_ENV=production` and no S3 endpoint is configured.

Real bucket CORS must allow the browser origin. Apply the checked-in policy with:

```bash
AWS_PROFILE=restaurant-inventory aws s3api put-bucket-cors \
  --bucket restaurant-inventory-production-12345 \
  --cors-configuration file://s3-cors.json
```

The IAM identity needs access to `stock-in/*` objects. Keep the bucket private; uploads and downloads use short-lived presigned URLs.

## Return To LocalStack

```bash
./scripts/use-localstack.sh
```

If you switched manually, restore `.env.local` to the LocalStack values and restart Next.js. Environment changes are read when Next.js starts.

## pgAdmin Login

Open:

```text
http://localhost:5050
```

Use:

```text
Email: admin@admin.com
Password: admin
```

For the PostgreSQL server registration inside pgAdmin, use:

```text
Host: postgres
Port: 5432
Database: mydb
Username: postgres
Password: postgres
```

pgAdmin intentionally requires authentication; Compose should not auto-submit the password in a browser because that would expose credentials. The Compose file now persists pgAdmin data in the `pgadmin_data` volume, so your login and registered server survive `docker compose down` followed by `docker compose up -d`.

For convenience, let your browser password manager save the pgAdmin login after the first login. Do not run `docker compose down -v` unless you intentionally want to delete PostgreSQL and pgAdmin volumes.

## Service Checks

```bash
docker compose ps
pg_isready -h localhost -p 5433 -U postgres -d mydb
curl http://localhost:3000/api/health
```

Expected services:

- PostgreSQL: healthy, host port `5433`
- LocalStack: healthy, host port `4566`
- pgAdmin: host port `5050`
- Next.js: host port `3000`

## Common Errors

### `InvalidClientTokenId` or `InvalidAccessKeyId`

The AWS profile is invalid or expired:

```bash
AWS_PROFILE=restaurant-inventory aws sts get-caller-identity
```

### `ERR_NAME_NOT_RESOLVED` for `localstack:4566`

A Docker-internal hostname was sent to the browser. LocalStack browser URLs must use `localhost:4566`. Restart the correct app mode after changing environment variables.

### CORS error during upload

Apply the appropriate CORS configuration. LocalStack does this automatically on startup; real AWS uses:

```bash
AWS_PROFILE=restaurant-inventory aws s3api put-bucket-cors \
  --bucket restaurant-inventory-production-12345 \
  --cors-configuration file://s3-cors.json
```

### Port 3000 is already in use

Stop the existing Next.js process with `Ctrl+C`, or stop the Docker app before starting Next.js directly:

```bash
docker compose stop app
```
