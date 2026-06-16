#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

bash "$ROOT/scripts/setup.sh"

echo "Starting all services..."

(cd "$ROOT/ml-service" && source .venv/bin/activate && python app.py) &
ML_PID=$!

(cd "$ROOT/backend" && npm run dev) &
BACKEND_PID=$!

(cd "$ROOT/frontend" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "Services started:"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:3000/api/health"
echo "  ML:        http://localhost:5000/health"
echo ""
echo "Press Ctrl+C to stop all services."

trap "kill $ML_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
