# FinDeep Backend

Clean and simple backend API server for FinDeep application.

## Features

- ✅ User authentication (local + Google OAuth)
- ✅ JWT token management
- ✅ User data persistence (JSON file)
- ✅ CORS support
- ✅ Health monitoring

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
Create `.env` file:
```bash
PORT=5001
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
FRONTEND_URL=http://localhost:3000
```

### 3. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `GET /api/user/profile` - User profile

## File Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── users.json         # User data (auto-created)
├── .env               # Environment variables
└── README.md          # This file
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000` to authorized origins
4. Copy Client ID to `.env` file

## Security

- Change JWT_SECRET in production
- Use HTTPS in production
- Validate all input data