#!/bin/bash

# Sentinel Development Setup Script
# This script sets up the local development environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "================================================"
echo "  Sentinel Development Setup"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 found"
        return 0
    else
        echo -e "${RED}✗${NC} $1 not found"
        return 1
    fi
}

MISSING_DEPS=0

check_command "node" || MISSING_DEPS=1
check_command "npm" || MISSING_DEPS=1

# Optional checks
check_command "cargo" || echo -e "${YELLOW}  (optional - needed for API)${NC}"
check_command "aptos" || echo -e "${YELLOW}  (optional - needed for Move contracts)${NC}"

if [ $MISSING_DEPS -eq 1 ]; then
    echo ""
    echo -e "${RED}Missing required dependencies. Please install Node.js 20+${NC}"
    exit 1
fi

echo ""
echo "================================================"
echo "  Step 1: Installing Frontend Dependencies"
echo "================================================"
echo ""

cd "$PROJECT_ROOT/frontend"

if [ -d "node_modules" ]; then
    echo "node_modules exists, skipping npm install..."
else
    echo "Running npm install..."
    npm install
fi

echo ""
echo "================================================"
echo "  Step 2: Setting Up Environment File"
echo "================================================"
echo ""

ENV_FILE="$PROJECT_ROOT/frontend/.env.local"

if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠${NC}  .env.local already exists"
    echo "    Location: $ENV_FILE"
else
    echo "Creating .env.local template..."
    cat > "$ENV_FILE" << 'EOF'
# Clerk Authentication (REQUIRED)
# Get these from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_REPLACE_ME
CLERK_SECRET_KEY=sk_test_REPLACE_ME

# API URL (optional - falls back to localhost:8080)
NEXT_PUBLIC_API_URL=http://localhost:8080

# Sentry (optional - for error tracking)
# NEXT_PUBLIC_SENTRY_DSN=
EOF
    echo -e "${GREEN}✓${NC} Created $ENV_FILE"
fi

echo ""
echo "================================================"
echo "  Step 3: Installing Playwright (for E2E tests)"
echo "================================================"
echo ""

cd "$PROJECT_ROOT/frontend"
echo "Installing Playwright browsers..."
npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium

echo ""
echo "================================================"
echo "  Step 4: Verifying Move Contracts"
echo "================================================"
echo ""

cd "$PROJECT_ROOT/move"

if [ -f "Move.toml" ]; then
    echo -e "${GREEN}✓${NC} Move.toml exists"
    echo "  Contracts: $(ls -1 sources/*.move 2>/dev/null | wc -l | tr -d ' ') files"
    echo "  Tests: $(ls -1 tests/*.move 2>/dev/null | wc -l | tr -d ' ') files"
else
    echo -e "${RED}✗${NC} Move.toml not found"
fi

echo ""
echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo "MANUAL STEP REQUIRED:"
echo ""
echo "  1. Go to https://clerk.com and create a free account"
echo "  2. Create a new application"
echo "  3. Copy your API keys to: frontend/.env.local"
echo ""
echo "     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx"
echo "     CLERK_SECRET_KEY=sk_test_xxx"
echo ""
echo "Once you've added your Clerk keys, run:"
echo ""
echo "  cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
