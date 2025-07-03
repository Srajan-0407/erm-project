#!/bin/bash

# 🚀 Development Startup Script
echo "🛠️  Starting Engineering Resource Management System in Development Mode..."

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    sudo systemctl start mongod || {
        echo "❌ Failed to start MongoDB. Please start it manually or use MongoDB Atlas."
        exit 1
    }
fi

echo "🔧 Starting backend server..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

echo "🎨 Starting frontend development server..."
cd ui
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Development servers started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "🔐 Login with:"
echo "   Manager: manager@company.com / password123"
echo "   Engineer: alice@company.com / password123"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait