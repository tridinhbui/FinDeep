# 🔧 Environment Setup Guide

## Frontend Environment (.env)

Create a `.env` file in the root directory with:

```bash
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:5000/api

# AI Configuration
REACT_APP_AI_PROVIDER=openai

# Claude API Configuration (Optional)
REACT_APP_CLAUDE_API_KEY=your-claude-api-key-here
REACT_APP_CLAUDE_API_URL=https://api.anthropic.com/v1

# OpenAI API Configuration (Optional)
REACT_APP_OPENAI_API_KEY=your-openai-api-key-here
REACT_APP_OPENAI_API_URL=https://api.openai.com/v1

# Debug mode (set to true for development)
REACT_APP_DEBUG=true
```

## Backend Environment (backend/.env)

Create a `.env` file in the `backend` directory with:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/findeep

# JWT Secret (generate a strong secret key)
JWT_SECRET=findeep-super-secret-jwt-key-2024

# AI API Keys (optional - for global fallback)
OPENAI_API_KEY=your-openai-api-key-here
CLAUDE_API_KEY=your-claude-api-key-here
```

## Quick Setup Commands

```bash
# 1. Create frontend .env
echo "REACT_APP_BACKEND_URL=http://localhost:5000/api
REACT_APP_AI_PROVIDER=openai
REACT_APP_DEBUG=true" > .env

# 2. Create backend .env
echo "PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/findeep
JWT_SECRET=findeep-super-secret-jwt-key-2024" > backend/.env

# 3. Install backend dependencies
cd backend && npm install

# 4. Start backend
npm run dev

# 5. Start frontend (in new terminal)
cd .. && npm start
```
