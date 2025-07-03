# 🚀 Quick Start Guide

## ⚡ 1-Minute Setup

```bash
# Clone and setup (or use existing directory)
cd Engineering-management

# Run automated setup
./setup.sh

# Start development servers
./start-dev.sh
```

## 🔐 Login

- **Manager**: `manager@company.com` / `password123`
- **Engineer**: `alice@company.com` / `password123`

## 🎯 Key Features Ready to Use

### ✅ **For Managers:**
1. **Add Engineers** - Click "Add Engineer" on Engineers page
2. **Create Projects** - Click "New Project" on Projects page  
3. **Assign Engineers** - Click "Assign" on any engineer or project
4. **View Dashboard** - Real-time team capacity and utilization

### ✅ **For Engineers:**
1. **View Assignments** - See current and upcoming projects
2. **Update Profile** - Edit skills and capacity
3. **Track Workload** - Visual capacity utilization

## 🛠️ Manual Setup (if automated script doesn't work)

### Backend:
```bash
cd server
npm install
npm run seed    # Loads sample data
npm run dev     # Starts on :5000
```

### Frontend:
```bash
cd ui
npm install
npm run dev     # Starts on :5173
```

## 📊 Sample Data Included

- **5 Engineers** with different skills and seniority levels
- **4 Projects** with varying priorities and requirements
- **5 Active Assignments** showing realistic capacity allocation
- **1 Manager** account to manage everything

## 🎨 UI Features

- **Tailwind CSS v3.4** for styling
- **ShadCN UI** components throughout
- **Responsive design** for all screen sizes
- **Dark mode support** (toggle in UI)
- **Interactive forms** with validation
- **Real-time toasts** for feedback

## 🔧 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + ShadCN UI
- **Backend**: Node.js + Express + MongoDB + JWT
- **Styling**: Tailwind CSS v3.4
- **State**: Zustand + React Hook Form

## 🚨 Troubleshooting

**MongoDB not found?**
```bash
# Install MongoDB or use Atlas
sudo systemctl start mongod
```

**Port conflicts?**
- Frontend auto-selects next available port
- Backend uses :5000 (configurable in .env)

**Build issues?**
```bash
cd ui
npm run build  # Should complete successfully
```

## 🎉 You're Ready!

Open http://localhost:5173 and start managing your engineering team!