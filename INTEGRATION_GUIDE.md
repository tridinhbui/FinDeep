# FinDeep Frontend-Backend Integration Guide

This guide explains how the frontend chatbot has been integrated with the FinDeep AI backend.

## Architecture Overview

```
Frontend (React)          Backend Services
├── Chat Interface   ──►  ├── FinDeep AI Backend (Port 8001)
├── Authentication   ──►  └── Node.js Auth Backend (Port 5001)
└── File Upload
```

## Backend Services

### 1. FinDeep AI Backend (Port 8001)
- **Purpose**: AI-powered financial analysis and chat
- **Technology**: FastAPI + Python
- **Location**: `FinDeep-backend/`
- **API Endpoint**: `POST /chat`
- **Request Format**:
  ```json
  {
    "session_id": "string",
    "message": "string"
  }
  ```
- **Response Format**:
  ```json
  {
    "session_id": "string", 
    "response": "string"
  }
  ```

### 2. Node.js Auth Backend (Port 5001)
- **Purpose**: User authentication and management
- **Technology**: Express.js + Node.js
- **Location**: `backend/`
- **Endpoints**: `/api/auth/login`, `/api/auth/register`, `/api/auth/google`

## Integration Changes Made

### Frontend API Service (`src/services/api.ts`)
- ✅ Removed direct OpenAI/Claude API integration
- ✅ Added FinDeep backend integration
- ✅ Implemented session management
- ✅ Added fallback to demo responses when backend unavailable

### Settings Component (`src/components/settings/ApiKeySettings.tsx`)
- ✅ Converted from API key settings to backend URL settings
- ✅ Added backend connection testing
- ✅ User-specific backend URL storage

### Configuration
- ✅ Environment variable: `REACT_APP_FINDDEEP_BACKEND_URL` (default: `http://localhost:8001`)
- ✅ User can configure custom backend URL in settings

## Setup Instructions

### 1. Start FinDeep AI Backend
```bash
cd FinDeep-backend
./start.sh
```

Or manually:
```bash
cd FinDeep-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Edit .env file with your OpenAI API key
uvicorn app.chatbot_api:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Start Node.js Auth Backend
```bash
cd backend
npm install
npm start
```

### 3. Start Frontend
```bash
npm install
npm start
```

## Environment Variables

### Frontend (.env)
```env
REACT_APP_FINDDEEP_BACKEND_URL=http://localhost:8001
REACT_APP_BACKEND_URL=http://localhost:5001/api
```

### FinDeep Backend (.env)
```env
CHATBOT_SERVICE_PORT=8001
OPENAI_API_KEY=your-openai-api-key-here
```

## Features

### ✅ Working Features
- User authentication (Node.js backend)
- Chat interface with FinDeep AI backend
- File upload and attachment support
- Session management
- Backend URL configuration
- Fallback demo responses
- Debug mode logging

### 🔧 Demo Mode
When the FinDeep backend is not available, the frontend automatically falls back to demo responses to maintain functionality for development and testing.

## Testing the Integration

1. **Start both backends** (FinDeep AI + Node.js Auth)
2. **Open frontend** in browser
3. **Login/Register** a user account
4. **Open Backend Settings** and test connection
5. **Send a chat message** to verify AI integration

## Troubleshooting

### Common Issues

1. **Backend not responding**
   - Check if FinDeep backend is running on port 8001
   - Verify OpenAI API key in FinDeep backend .env file
   - Check console logs for connection errors

2. **Authentication issues**
   - Ensure Node.js auth backend is running on port 5001
   - Check Google OAuth configuration if using Google login

3. **Demo mode active**
   - This is normal when FinDeep backend is not available
   - Check backend connection in settings
   - Look for "Demo Mode" messages in chat responses

## Development Notes

- The frontend maintains backward compatibility with demo responses
- User-specific backend URLs are stored in localStorage
- Session IDs are generated based on user email for consistency
- All API calls include proper error handling and fallbacks
