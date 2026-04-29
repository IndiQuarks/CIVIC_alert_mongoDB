#!/bin/bash

# Get the absolute path to the directory where this script is located
DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$DIR/backend"

echo "======================================"
echo "🚀 Starting Guntur Civic Portal"
echo "======================================"

# Stop any currently running instances so we don't get port conflicts
echo "🧹 Cleaning up any old instances..."
pkill -f "node server.js"
pkill -f "cloudflared tunnel run civic-portal"
sleep 2

# Start Backend Server
echo "📦 Starting Backend Server on port 5000..."
cd "$BACKEND_DIR"
nohup node server.js > server.log 2>&1 &
echo "   ✅ Backend running (logs saved to backend/server.log)"

# Start Cloudflare Tunnel
echo "☁️  Starting Cloudflare Tunnel..."
cd "$DIR"
nohup cloudflared tunnel run civic-portal > tunnel.log 2>&1 &
echo "   ✅ Tunnel running (logs saved to tunnel.log)"

echo ""
echo "🎉 All services have been started in the background!"
echo "🌐 Your website is LIVE at: https://ravulapalli-balaji.tech"
echo ""
echo "To stop the servers, just double-click or run the stop.sh file."
echo "You can now safely close this terminal window."
