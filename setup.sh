#!/bin/bash

# 🛠️ Engineering Resource Management System - Setup Script
echo "🚀 Setting up Engineering Resource Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18+) first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   You can start it with: sudo systemctl start mongod"
    echo "   Or use MongoDB Atlas (update MONGODB_URI in server/.env)"
fi

echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

echo "📦 Installing frontend dependencies..."
cd ui
npm install
cd ..

echo "🔧 Setting up environment variables..."
if [ ! -f server/.env ]; then
    cp server/.env server/.env.backup 2>/dev/null || true
    cat > server/.env << EOL
MONGODB_URI=mongodb://localhost:27017/engineering-management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
EOL
    echo "✅ Created server/.env file"
else
    echo "✅ server/.env already exists"
fi

echo "🌱 Seeding database with sample data..."
cd server
npm run seed
cd ..

echo ""
echo "🎉 Setup complete! Your Engineering Resource Management System is ready."
echo ""
echo "📋 Quick Start:"
echo "   1. Start the backend:  cd server && npm run dev"
echo "   2. Start the frontend: cd ui && npm run dev"
echo "   3. Open: http://localhost:5173"
echo ""
echo "🔐 Login Credentials:"
echo "   Manager: manager@company.com / password123"
echo "   Engineer: alice@company.com / password123"
echo ""
echo "🛠️  Tech Stack:"
echo "   Frontend: React + TypeScript + Tailwind CSS v3.4 + ShadCN UI"
echo "   Backend:  Node.js + Express + MongoDB + JWT"
echo ""
echo "✨ Features Available:"
echo "   ✅ Authentication & User Roles"
echo "   ✅ Engineer Management with Skills & Capacity"
echo "   ✅ Project Management with Timelines"
echo "   ✅ Assignment System with Capacity Validation"
echo "   ✅ Interactive Dashboards"
echo "   ✅ Real-time Capacity Tracking"
echo ""