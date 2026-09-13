#!/bin/sh
set -eu

cp .env.localstack.example .env.local
docker compose up -d postgres localstack pgadmin
echo "LocalStack services are running. Start the app with: npm run dev"
echo "Dashboard: http://localhost:3000/dashboard/stock-in"
echo "pgAdmin:   http://localhost:5050"