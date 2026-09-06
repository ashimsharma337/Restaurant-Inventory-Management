# LocalStack — Local Development Reference

## What is LocalStack?

LocalStack is an open-source tool that emulates AWS cloud services on your local machine. Instead of making real API calls to AWS (which costs money and requires internet), your application talks to LocalStack running on `http://localhost:4566` — and it behaves just like AWS.

Think of it as **a fake AWS running inside Docker on your Mac**.

---

## Why Use LocalStack?

| Problem with Real AWS         | LocalStack Solution                        |
|-------------------------------|--------------------------------------------|
| Costs money per API call      | Completely free (community edition)        |
| Requires internet connection  | Works fully offline                        |
| Slow to provision resources   | Resources created in milliseconds          |
| Risk of misconfiguring prod   | Isolated, throwaway local environment      |
| Needs IAM roles/permissions   | No auth needed — any dummy key works       |

**Common use cases:**
- Testing S3 uploads/downloads locally
- Developing SQS consumers without real queues
- Testing DynamoDB queries before hitting production
- Running integration tests in CI without AWS credentials
- Prototyping new AWS service integrations safely

---

## Community vs Pro

| Feature                        | Community (Free) | Pro (Paid)       |
|--------------------------------|------------------|------------------|
| Core services (S3, SQS, etc.)  | ✅               | ✅               |
| DynamoDB, Lambda, SNS          | ✅               | ✅               |
| EKS, ECS, RDS, AppSync         | ❌               | ✅               |
| Persistence across restarts    | ❌               | ✅               |
| LocalStack Web Dashboard       | Limited          | Full             |
| Account / Auth Token required  | ❌               | ✅               |

> **For local development, Community edition is sufficient.**

---

## Setup

### Prerequisites

- Docker installed and running
- Python + pip (for `awslocal` CLI wrapper)
- AWS CLI installed

### 1. Run LocalStack via Docker (recommended)

Always use a pinned community image — **never** `localstack/localstack-pro`:

```bash
docker run -p 4566:4566 localstack/localstack:4.3.0
```

Or with Docker Compose (recommended for projects):

```yaml
# docker-compose.yml
services:
  localstack:
    image: localstack/localstack:4.3.0
    ports:
      - "4566:4566"
    environment:
      - SERVICES=s3,sqs,dynamodb
      - DEBUG=0
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
```

```bash
docker compose up -d
```

### 2. Install `awslocal` CLI wrapper

```bash
pip install awscli-local
```

`awslocal` is a thin wrapper around `aws` CLI that automatically appends `--endpoint-url=http://localhost:4566`, so you don't have to type it every time.

### 3. Configure AWS Profile (for AWS Toolkit in VS Code)

Add to `~/.aws/credentials`:

```ini
[localstack]
aws_access_key_id = test
aws_secret_access_key = test
```

Add to `~/.aws/config`:

```ini
[profile localstack]
region = us-east-1
endpoint_url = http://localhost:4566
```

> The key/secret values can be anything — LocalStack does not validate them in community mode.

---

## Verify LocalStack is Running

```bash
curl http://localhost:4566/_localstack/health
```

You should see a JSON response listing service statuses like `"s3": "available"`.

---

## Common `awslocal` Commands

### S3

```bash
# Create a bucket
awslocal s3 mb s3://my-bucket

# List buckets
awslocal s3 ls

# Upload a file
awslocal s3 cp ./file.txt s3://my-bucket/

# List files in bucket
awslocal s3 ls s3://my-bucket/

# Download a file
awslocal s3 cp s3://my-bucket/file.txt ./downloaded.txt
```

### SQS

```bash
# Create a queue
awslocal sqs create-queue --queue-name my-queue

# List queues
awslocal sqs list-queues

# Send a message
awslocal sqs send-message \
  --queue-url http://localhost:4566/000000000000/my-queue \
  --message-body "Hello LocalStack"

# Receive messages
awslocal sqs receive-message \
  --queue-url http://localhost:4566/000000000000/my-queue
```

### DynamoDB

```bash
# Create a table
awslocal dynamodb create-table \
  --table-name Users \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# List tables
awslocal dynamodb list-tables

# Put an item
awslocal dynamodb put-item \
  --table-name Users \
  --item '{"id": {"S": "1"}, "name": {"S": "Ashim"}}'

# Scan table
awslocal dynamodb scan --table-name Users
```

---

## Using with AWS SDK (Node.js / Next.js)

Point your SDK client to LocalStack in development:

```javascript
import { S3Client } from "@aws-sdk/client-s3";

const isLocal = process.env.NODE_ENV === "development";

const s3 = new S3Client({
  region: "us-east-1",
  ...(isLocal && {
    endpoint: "http://localhost:4566",
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test",
    },
    forcePathStyle: true, // required for LocalStack S3
  }),
});
```

> `forcePathStyle: true` is important — without it, the SDK uses virtual-hosted URLs like `my-bucket.localhost:4566` which LocalStack does not support.

---

## VS Code Integration

### Recommended Setup (No account needed)

1. Install **AWS Toolkit** extension (by Amazon) from the VS Code marketplace
2. Open the AWS panel in the sidebar
3. Click the profile selector → choose `localstack`
4. Browse S3, DynamoDB, SQS etc. visually inside VS Code

### What about the LocalStack Toolkit extension?

The **LocalStack Toolkit** VS Code extension requires a LocalStack account even for the free tier features (Lambda debugging, resource browser). For basic local development without an account:

- ✅ Use **AWS Toolkit** with the `localstack` AWS profile
- ✅ Manage LocalStack via Docker directly
- ❌ Skip LocalStack Toolkit — not needed for community edition

---

## Gotchas & Tips

### Image tagging trap
Running `localstack start` via the LocalStack CLI pulls `localstack/localstack-pro` and tags it as `localstack/localstack` locally. This causes license errors. Always use `docker run` or `docker compose` with a pinned community image tag.

```bash
# Safe — pinned community image
docker run -p 4566:4566 localstack/localstack:4.3.0

# Dangerous — may pull pro image via CLI
localstack start
```

### Data does not persist
Community edition stores everything in memory. When the container stops, all resources are gone. This is fine for development — just re-create resources on startup using a script or `docker compose` entrypoint.

### Account ID
LocalStack uses `000000000000` as the dummy AWS account ID in all ARNs and queue URLs.

### Supported services (Community)
`s3` · `sqs` · `sns` · `dynamodb` · `lambda` · `iam` · `cloudformation` · `secretsmanager` · `ssm` · `kinesis` · `ses` · `route53` · `logs` · `events`

---

## Quick Start Checklist

- [ ] Docker running
- [ ] `docker run -p 4566:4566 localstack/localstack:4.3.0`
- [ ] `pip install awscli-local`
- [ ] `curl http://localhost:4566/_localstack/health` → services available
- [ ] `~/.aws/credentials` has `[localstack]` profile with dummy keys
- [ ] `~/.aws/config` has `endpoint_url = http://localhost:4566`
- [ ] AWS Toolkit in VS Code connected to `localstack` profile
- [ ] SDK clients pointing to `http://localhost:4566` in development

---

*LocalStack Community Edition — no account, no license, no cost.*
