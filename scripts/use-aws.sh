#!/bin/sh
set -eu

profile="${AWS_PROFILE:-restaurant-inventory}"

AWS_PROFILE="$profile" aws sts get-caller-identity >/dev/null
sed "s/^AWS_PROFILE=.*/AWS_PROFILE=$profile/" .env.aws.example > .env.local
docker compose stop app localstack
docker compose up -d postgres pgadmin

echo "AWS profile verified: $profile"
echo "Start the app with: AWS_PROFILE=$profile npm run dev"
echo "Dashboard: http://localhost:3000/dashboard/stock-in"
echo "Real bucket: $(sed -n 's/^S3_BUCKET_NAME=//p' .env.aws.example)"