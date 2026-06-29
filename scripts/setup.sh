#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== KarrerLenz Local Setup ==="

# 1. Backend deps
if [ ! -d "backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  (cd backend && npm install)
fi

# 2. Frontend deps
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  (cd frontend && npm install)
fi

# 3. ML service
if [ ! -d "ml-service/.venv" ]; then
  echo "Setting up Python virtual environment..."
  (cd ml-service && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt)
fi

# 4. Env files
[ -f backend/.env ] || cp backend/.env.example backend/.env
[ -f frontend/.env ] || cp frontend/.env.example frontend/.env

# 5. Database
echo "Running database migration..."
(cd backend && npm run migrate)

echo ""
echo "=== Setup complete! Start services in 3 terminals: ==="
echo ""
echo "  Terminal 1: cd ml-service && source .venv/bin/activate && python app.py"
echo "  Terminal 2: cd backend && npm run dev"
echo "  Terminal 3: cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
