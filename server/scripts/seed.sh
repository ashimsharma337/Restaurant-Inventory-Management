#!/bin/bash

echo "Seeding MongoDB database..."

# Navigate to project root (server folder)
cd "$(dirname "$0")/.."

# Run seed file
node data/seed.js

echo "Done."
