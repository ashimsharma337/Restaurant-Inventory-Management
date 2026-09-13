#!/bin/sh

BUCKET_NAME="${S3_BUCKET_NAME:-restaurant-inventory-documents}"

awslocal s3 mb "s3://${BUCKET_NAME}" 2>/dev/null || true
awslocal s3api put-bucket-cors \
  --bucket "${BUCKET_NAME}" \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedOrigins": ["http://localhost:3000", "http://localhost:3001"],
        "AllowedMethods": ["PUT", "GET", "HEAD"],
        "AllowedHeaders": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
      }
    ]
  }'