# 🏗️ FinDeep Project Structure

## 📋 Overview

FinDeep is a comprehensive AI-powered financial analysis platform with a modern React frontend, Node.js authentication backend, and Python AI backend. This document provides a complete overview of the project structure and architecture.

## 🎯 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Node.js Auth   │    │  Python AI      │
│   (Frontend)    │◄──►│   Backend       │    │   Backend       │
│   Port: 3000    │    │   Port: 5001    │    │   Port: 8001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Google OAuth  │
                    │   Authentication│
                    └─────────────────┘
```

## 📁 Project Structure

```
FinDeep/
├── 📱 Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── chat/           # Chat interface components
│   │   │   ├── settings/       # Settings and configuration
│   │   │   └── viewer/         # Document viewer components
│   │   ├── contexts/           # React context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Main application pages
│   │   ├── services/           # API and service layer
│   │   ├── styles/             # CSS and styling
│   │   └── types/              # TypeScript type definitions
│   ├── public/                 # Static assets
│   ├── package.json            # Frontend dependencies
│   └── .env                    # Frontend environment variables
│
├── 🔐 Authentication Backend (Node.js)
│   ├── backend/
│   │   ├── server.js           # Main authentication server
│   │   ├── users.json          # User data storage
│   │   ├── package.json        # Backend dependencies
│   │   └── .env                # Backend environment variables
│
├── 🧠 AI Backend (Python + FastAPI)
│   ├── FinDeep-backend/
│   │   ├── app/                # FastAPI application
│   │   │   ├── chatbot_api.py  # Main AI API endpoints
│   │   │   ├── chatbot_route.py # Chat routing logic
│   │   │   └── request_schema.py # Request/response schemas
│   │   ├── pipeline/           # AI processing pipeline
│   │   │   ├── agents/         # AI agents and processing
│   │   │   ├── constant/       # Constants and configurations
│   │   │   └── main.py         # Pipeline entry point
│   │   ├── data_setup/         # Data processing and embeddings
│   │   ├── requirements.txt    # Python dependencies
│   │   └── start.sh            # Startup script
│
└── 📚 Documentation
    ├── README.md               # Main project documentation
    └── PROJECT_STRUCTURE.md    # This file
```

## 🔧 Component Details

### Frontend Components (`src/components/`)

#### Authentication (`src/components/auth/`)
- **`GoogleAuth.tsx`** - Google OAuth sign-in component
  - Handles Google Identity Services integration
  - Provides both default and custom styled buttons
  - Manages OAuth callback and token handling

#### Chat Interface (`src/components/chat/`)
- **`MessageItem.tsx`** - Individual chat message component
  - Displays user and AI messages
  - Handles file attachments and rich content
  - Supports markdown rendering
- **`FileUpload.tsx`** - File upload component
  - Drag-and-drop file upload
  - Multiple file format support
  - File preview and validation
- **`ChatHistorySidebar.tsx`** - Chat history management
  - Session history display
  - Conversation switching
  - History search and filtering

#### Settings (`src/components/settings/`)
- **`SettingsPanel.tsx`** - Main settings interface
  - Theme configuration
  - Account management
  - Backend URL configuration
- **`ThemeToggle.tsx`** - Theme switching component
  - Light/dark mode toggle
  - Theme persistence

#### Document Viewer (`src/components/viewer/`)
- **`DocumentViewer.tsx`** - Document display component
  - PDF, CSV, and text file viewing
  - Tabbed interface for multiple documents
  - Search and navigation features

### Services (`src/services/`)

#### API Service (`src/services/api.ts`)
- **Main AI Communication**: Connects to Python backend
- **Session Management**: Handles conversation tracking
- **File Processing**: Manages file uploads and attachments
- **Demo Mode**: Fallback responses when AI backend unavailable
- **Error Handling**: Graceful degradation and user feedback

#### Authentication Service (`src/services/authService.ts`)
- **User Management**: Login, registration, logout
- **Google OAuth**: Integration with Google authentication
- **Token Management**: JWT token handling and storage
- **Session Persistence**: User state management

### Contexts (`src/contexts/`)

#### Authentication Context (`src/contexts/AuthContext.tsx`)
- **Global Auth State**: User authentication status
- **Auth Methods**: Login, logout, registration functions
- **User Data**: Current user information and profile

#### Theme Context (`src/contexts/ThemeContext.tsx`)
- **Theme Management**: Light/dark mode switching
- **Theme Persistence**: Local storage integration
- **System Preference**: Automatic theme detection

## 🔐 Backend Services

### Authentication Backend (`backend/`)

#### Main Server (`backend/server.js`)
- **Express.js Server**: RESTful API endpoints
- **Google OAuth**: Token verification and user management
- **JWT Authentication**: Secure token-based auth
- **User Storage**: JSON-based user data persistence
- **CORS Support**: Cross-origin request handling

#### Key Endpoints:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth login
- `GET /api/user/profile` - User profile data
- `GET /api/health` - Health check

### AI Backend (`FinDeep-backend/`)

#### FastAPI Application (`app/`)
- **`chatbot_api.py`** - Main AI API endpoints
  - Chat message processing
  - AI response generation
  - Session management
- **`chatbot_route.py`** - Request routing and validation
- **`request_schema.py`** - Data validation schemas

#### AI Pipeline (`pipeline/`)
- **`agents/`** - AI processing agents
  - Message analysis and synthesis
  - Qdrant vector retrieval
  - Financial data processing
- **`constant/`** - Configuration and prompts
- **`main.py`** - Pipeline orchestration

#### Data Processing (`data_setup/`)
- **Embeddings**: Vector embeddings for financial data
- **Data Sources**: CSV and Excel financial datasets
- **MiniLM Integration**: Sentence transformer models

## 🌐 Environment Configuration

### Frontend Environment (`.env`)
```bash
# Backend API Configuration
REACT_APP_BACKEND_URL=http://localhost:5001/api

# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id

# AI Backend Configuration
REACT_APP_FINDDEEP_BACKEND_URL=http://localhost:8001

# Debug Mode
REACT_APP_DEBUG=true
```

### Authentication Backend Environment (`backend/.env`)
```bash
# Server Configuration
PORT=5001
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-jwt-secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
```

### AI Backend Environment (`FinDeep-backend/.env`)
```bash
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Server Configuration
CHATBOT_SERVICE_PORT=8001
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.9+ and pip
- Google Cloud Console account (for OAuth)
- OpenAI API key (for AI functionality)

### Installation Steps

1. **Clone and Setup Frontend**
   ```bash
   cd FinDeep
   npm install
   cp .env.example .env  # Configure environment variables
   ```

2. **Setup Authentication Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure environment variables
   ```

3. **Setup AI Backend**
   ```bash
   cd FinDeep-backend
   pip install -r requirements.txt
   cp .env.example .env  # Configure environment variables
   ```

4. **Start All Services**
   ```bash
   # Terminal 1: AI Backend
   cd FinDeep-backend && ./start.sh
   
   # Terminal 2: Auth Backend
   cd backend && node server.js
   
   # Terminal 3: Frontend
   npm start
   ```

## 🔄 Data Flow

### Authentication Flow
1. User clicks "Sign in with Google"
2. Google OAuth popup opens
3. User authorizes application
4. Google returns authorization code
5. Frontend sends code to Node.js backend
6. Backend verifies with Google
7. Backend creates/updates user record
8. Backend returns JWT token
9. Frontend stores token and user data

### Chat Flow
1. User sends message in chat interface
2. Frontend calls `apiService.sendMessage()`
3. API service sends request to Python AI backend
4. AI backend processes message through pipeline
5. AI backend returns response with attachments
6. Frontend displays AI response
7. Conversation history is maintained

### File Upload Flow
1. User drags/drops files into chat
2. Frontend processes files locally
3. File metadata is sent with chat message
4. AI backend receives file information
5. AI processes file content and context
6. AI returns analysis with file insights

## 🛠️ Development

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Auth Backend**: Node.js, Express, JWT, Google OAuth
- **AI Backend**: Python, FastAPI, OpenAI, Qdrant
- **Database**: JSON files (development), Vector embeddings
- **Authentication**: Google OAuth 2.0, JWT tokens

### Development Commands
```bash
# Frontend development
npm start              # Start development server
npm run build          # Build for production
npm run typecheck      # TypeScript type checking

# Backend development
cd backend && node server.js           # Start auth server
cd FinDeep-backend && python -m uvicorn app.chatbot_api:app --reload  # Start AI server
```

## 📊 Features

### Core Features
- ✅ **Google OAuth Authentication** - Secure sign-in with Google
- ✅ **AI-Powered Chat** - Financial analysis and insights
- ✅ **File Upload & Analysis** - Document processing and insights
- ✅ **Theme Support** - Light/dark mode switching
- ✅ **Session Management** - Conversation history and persistence
- ✅ **Responsive Design** - Mobile and desktop support

### AI Capabilities
- 📈 **Financial Analysis** - Revenue, profit, cash flow analysis
- 📊 **Budget Planning** - Budget creation and forecasting
- 💰 **Investment Analysis** - ROI calculations and recommendations
- 📋 **Report Generation** - Automated financial reports
- 🔍 **Document Processing** - PDF, CSV, Excel file analysis

## 🔒 Security

### Authentication Security
- JWT token-based authentication
- Google OAuth 2.0 integration
- Secure token storage in localStorage
- Automatic token expiration and refresh

### API Security
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Error handling without sensitive data exposure
- Rate limiting and request validation

## 📈 Performance

### Frontend Optimization
- React 18 with concurrent features
- Code splitting and lazy loading
- Optimized bundle size
- Efficient state management

### Backend Optimization
- FastAPI async/await for high performance
- Vector embeddings for fast similarity search
- Efficient data processing pipeline
- Caching for frequently accessed data

## 🧪 Testing

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Performance testing for AI responses

## 🚀 Deployment

### Production Considerations
- Environment variable configuration
- HTTPS and secure cookies
- Database migration from JSON to proper database
- Load balancing for high availability
- Monitoring and logging setup

## 📝 Contributing

### Development Guidelines
- Follow TypeScript best practices
- Use consistent code formatting
- Write comprehensive documentation
- Test all new features thoroughly
- Follow security best practices

---

## 📞 Support

For questions or issues:
1. Check the main README.md for setup instructions
2. Review environment variable configuration
3. Ensure all services are running on correct ports
4. Check browser console for frontend errors
5. Review backend logs for API issues

**Happy coding with FinDeep! 🚀**
