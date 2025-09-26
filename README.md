# FinDeep - AI Financial Analysis Assistant

FinDeep is a modern web application that provides AI-powered financial analysis and planning assistance. Built with React, TypeScript, and Tailwind CSS, it offers intelligent financial insights through integration with OpenAI and Anthropic Claude APIs.

## 🚀 Features

- **AI-Powered Financial Analysis**: Get intelligent insights from OpenAI GPT or Anthropic Claude
- **User Authentication**: Secure registration and login with unique user accounts
- **Google OAuth Integration**: Sign in with Google accounts
- **Chat History Persistence**: All conversations saved to database
- **Multi-User API Key Management**: Each user can connect their own API keys
- **File Upload Support**: Upload financial documents for analysis (PDF, CSV, Markdown, Text, HTML, JSON)
- **Modern UI/UX**: Clean white-black theme with intelligent dark/light mode toggle
- **Simplified File Upload**: Clean attachment chips without cluttered messages
- **Real-time Chat Interface**: Interactive conversation with AI financial advisor
- **Chat History Sidebar**: Persistent chat history with smooth slide animations
- **Document Viewer**: View and analyze uploaded financial documents
- **Demo Mode**: Works without API keys for testing

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, JSON file storage (MongoDB ready)
- **AI Integration**: OpenAI GPT-3.5-turbo, Anthropic Claude
- **Authentication**: JWT tokens with bcrypt password hashing, Google OAuth
- **Database**: JSON file storage (easily upgradeable to MongoDB)
- **Build Tool**: Create React App
- **Styling**: Tailwind CSS with intelligent theme system (light/dark mode)
- **State Management**: React Hooks with Context API (Auth, Theme)
- **Theme System**: CSS variables with smooth transitions and persistent preferences

## �� Prerequisites

Before running FinDeep, make sure you have:

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **OpenAI API Key** or **Anthropic Claude API Key** (optional - demo mode available)
- **Google OAuth Client ID** (optional - for Google sign-in)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/FinDeep.git
cd FinDeep
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Configuration

#### Frontend Environment
Create a `.env` file in the root directory:

```bash
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:5001/api

# Google OAuth (Optional)
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here

# AI Configuration (Optional - for global fallback)
REACT_APP_AI_PROVIDER=openai
REACT_APP_OPENAI_API_KEY=your-openai-api-key-here
REACT_APP_CLAUDE_API_KEY=your-claude-api-key-here

# Debug mode (set to true for development)
REACT_APP_DEBUG=true
```

#### Backend Environment
Create a `.env` file in the `backend` directory:

```bash
# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id-here

# JWT Secret (generate a strong secret key)
JWT_SECRET=your-super-secret-jwt-key-here

# AI API Keys (optional - for global fallback)
OPENAI_API_KEY=your-openai-api-key-here
CLAUDE_API_KEY=your-claude-api-key-here
```

### 4. Start the Development Servers

```bash
# Start the backend server (in one terminal)
cd backend
node server.js

# Start the frontend server (in another terminal)
cd ..
npm start
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5001`

## 🔑 API Key Setup

### Option 1: Global API Keys (Recommended for Development)

1. **Get API Keys**:
   - **OpenAI**: Visit [platform.openai.com](https://platform.openai.com) → API Keys
   - **Claude**: Visit [console.anthropic.com](https://console.anthropic.com) → API Keys

2. **Add to .env file**:
   ```bash
   REACT_APP_OPENAI_API_KEY=sk-proj-your-openai-key-here
   REACT_APP_CLAUDE_API_KEY=sk-ant-your-claude-key-here
   REACT_APP_AI_PROVIDER=openai  # or 'claude'
   ```

3. **Restart the development server**:
   ```bash
   npm start
   ```

### Option 2: User-Specific API Keys (Production Ready)

1. **Login to the application** (use any email/password for demo)
2. **Click the gear icon (⚙️)** in the top-right corner
3. **Select AI Provider** (OpenAI or Claude)
4. **Enter your API key**
5. **Click "Save & Test"**

Each user can now use their own API keys without affecting others.

## 🎯 Usage

### Demo Login
- **Email**: Any email address (e.g., `demo@example.com`)
- **Password**: Any password (e.g., `password123`)

### Chat with AI
1. **Type your financial question** in the chat box
2. **Press Enter** or click **Send**
3. **Get intelligent responses** from your chosen AI provider

### Upload Documents
1. **Click the paperclip icon** (📎) next to the chat input
2. **Select financial documents** (PDF, CSV, etc.)
3. **Files appear as clean attachment chips** - no cluttered messages
4. **Ask questions** about your uploaded files

### Example Questions

- "How should I allocate my monthly budget of $5000?"
- "What's the best investment strategy for a 25-year-old?"
- "Analyze this CSV file of my expenses and suggest improvements"
- "Create a retirement plan for someone with $100k savings"

## 🎨 Current Features

### ✅ **Implemented & Working:**
- **User Authentication**: Sign up, login, logout with persistent sessions
- **Google OAuth**: Sign in with Google accounts (email-based login)
- **AI Chat Interface**: Real-time conversation with OpenAI/Claude
- **File Upload**: Support for PDF, CSV, Markdown, Text, HTML, JSON files
- **Chat History Sidebar**: Smooth slide animations with persistent history
- **Simplified File Display**: Clean attachment chips without cluttered messages
- **Document Viewer**: View and analyze uploaded documents
- **Intelligent Theme System**: Light/dark mode toggle with persistent preferences
- **Settings Panel**: Theme toggle, API key management
- **Clean UI**: Professional white-black theme with smooth transitions
- **Demo Mode**: Works without API keys for testing
- **User-Specific API Keys**: Each user can use their own API keys
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Enhanced Animations**: Smooth slide transitions for chat history sidebar

### 🔄 **Ready for Enhancement:**
- **MongoDB Integration**: Currently uses JSON file storage, easily upgradeable
- **Chat History**: Basic persistence, ready for full database integration
- **Advanced Analytics**: Ready for financial data analysis features

## 🆕 **Recent Improvements**

### **Chat History & Animation Enhancement**
- ✅ **Smooth Slide Animations**: Enhanced chat history sidebar with smooth slide transitions
- ✅ **Cubic-bezier Easing**: Natural motion feel with (0.4, 0, 0.2, 1) easing curves
- ✅ **Dual-Layer Animation**: Coordinated width expansion and content sliding
- ✅ **Debounced Interactions**: Prevents rapid clicking issues on hamburger menu
- ✅ **Responsive Integration**: Seamless mobile and desktop animations
- ✅ **Background Transitions**: Smooth backdrop opacity changes for better UX

### **Theme System Enhancement**
- ✅ **Intelligent Dark/Light Mode**: Smooth transitions with persistent user preferences
- ✅ **CSS Variables**: Dynamic theming with proper contrast ratios
- ✅ **Theme Toggle**: Compact toggle in chat interface header
- ✅ **Persistent Storage**: Theme preference saved to localStorage

### **File Upload Experience**
- ✅ **Simplified Display**: Clean attachment chips without cluttered text messages
- ✅ **Professional UI**: File type icons with clear "Click to view" indicators
- ✅ **Better UX**: Files appear directly without unnecessary "I've uploaded" messages
- ✅ **Smart Message Handling**: Support for text-only, file-only, or combined messages

### **Authentication Improvements**
- ✅ **Email-Based Login**: Changed from username to email for Google OAuth compatibility
- ✅ **Input Field Visibility**: Fixed text color issues in login forms
- ✅ **Google Sign-In Button**: Improved text visibility and styling
- ✅ **Form Validation**: Better error handling and user feedback

## 📁 Project Structure

```
FinDeep/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   │   ├── auth/          # Authentication components
│   │   │   └── GoogleAuth.tsx        # Google OAuth button
│   │   ├── chat/          # Chat components
│   │   │   ├── ChatHistorySidebar.tsx # Chat history sidebar
│   │   │   ├── FileUpload.tsx        # File upload component
│   │   │   └── MessageItem.tsx       # Individual chat messages
│   │   ├── settings/      # Settings components
│   │   │   ├── ApiKeySettings.tsx    # API key management
│   │   │   ├── SettingsPanel.tsx     # Settings panel
│   │   │   └── ThemeToggle.tsx       # Theme toggle button
│   │   └── viewer/        # Document viewer components
│   │       └── DocumentViewer.tsx    # PDF/document viewer
│   ├── pages/             # Main application pages
│   │   ├── auth/          # Login and registration pages
│   │   │   ├── LoginPage.tsx         # Main login page
│   │   │   └── NewLoginPage.tsx      # Alternative login page
│   │   └── chat/          # Main chat interface
│   │       └── index.tsx             # Chat page with history sidebar
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.tsx           # Authentication state
│   │   └── ThemeContext.tsx          # Theme state management
│   ├── services/          # API and authentication services
│   │   ├── api.ts         # Main API service
│   │   ├── authService.ts # Authentication service
│   │   └── backendApi.ts  # Backend API service
│   ├── types/             # TypeScript type definitions
│   │   └── chat.ts        # Chat message and attachment types
│   └── lib/               # Utility libraries
│       └── storage/       # Local storage utilities
│           └── viewerState.ts         # Document viewer state
├── backend/               # Node.js backend server
│   ├── server.js         # Main server file
│   ├── persistent-server.js # Persistent data server
│   ├── users.json        # User data storage
│   ├── package.json      # Backend dependencies
│   └── README.md         # Backend setup guide
├── public/               # Static assets (index.html)
├── src/App.css           # Global styles with theme variables
├── README.md             # This file
├── API_SETUP.md          # API configuration guide
├── GOOGLE_OAUTH_SETUP.md # Google OAuth setup guide
├── ENVIRONMENT_SETUP.md  # Environment configuration guide
├── OPENAI_SETUP.md       # OpenAI API setup guide
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Frontend dependencies
```

## 🚀 Deployment

### Development
```bash
# Start both servers
cd backend && node server.js &
cd .. && npm start
```

### Production
```bash
# Build frontend
npm run build

# Start backend
cd backend && node server.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the setup guides in the repository
- Review the API configuration documentation
- Test with demo mode first before adding API keys
