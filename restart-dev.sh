#!/bin/bash

# Restart development server with CORS proxy
echo "🔄 Restarting development server with CORS proxy..."

# Kill any existing processes on port 8081
echo "🛑 Stopping existing server..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Start the development server
echo "🚀 Starting development server on port 8081 with CORS proxy..."
echo "📡 API requests will be proxied to http://localhost:8080"
echo "🌐 Frontend will be available at http://localhost:8081"
echo ""
echo "Make sure your Thoth backend is running on port 8080!"
echo ""

npm run dev
