#!/bin/bash

echo "======================================"
echo "🛑 Stopping Guntur Civic Portal"
echo "======================================"

echo "Killing Node.js backend server..."
pkill -f "node server.js"

echo "Killing Cloudflare tunnel..."
pkill -f "cloudflared tunnel run civic-portal"

echo "✅ All services stopped."
