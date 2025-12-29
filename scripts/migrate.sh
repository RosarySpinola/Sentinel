#!/bin/bash
set -e

echo "==================================="
echo "Sentinel Database Migration Script"
echo "==================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    exit 1
fi

# Check if sqlx-cli is installed
if ! command -v sqlx &> /dev/null; then
    echo "sqlx-cli is not installed. Installing..."
    cargo install sqlx-cli --no-default-features --features postgres
fi

echo ""
echo "Running database migrations..."
cd "$(dirname "$0")/../api"

# Run migrations
sqlx migrate run

echo ""
echo "Migrations completed successfully!"
echo ""
echo "Current migration status:"
sqlx migrate info

echo ""
echo "==================================="
