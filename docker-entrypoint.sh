#!/bin/sh
set -e

echo "Running database seed (skips automatically if admin already exists)..."
node src/lib/seed.js

echo "Starting app..."
exec npm run start