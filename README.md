# FinDeep - AI Financial Analysis Platform

A modern web application that provides AI-powered financial analysis through intelligent chat interface. Built with React frontend and integrated with FinDeep AI backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- OpenAI API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/tridinhbui/FinDeep.git
cd FinDeep

# Install dependencies
npm install
cd backend && npm install && cd ..

# Start the application
npm start
```

### Configuration

1. **Set up FinDeep AI Backend**:
   - The FinDeep backend is included as a submodule
   - Configure your OpenAI API key in `FinDeep-backend/.env`:
   ```bash
   OPENAI_API_KEY=your-openai-api-key-here
   CHATBOT_SERVICE_PORT=8001
   ```

2. **Start the AI Backend**:
   ```bash
   cd FinDeep-backend
   source venv/bin/activate
   python -m uvicorn app.chatbot_api:app --host 127.0.0.1 --port 8001 --reload
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - AI Backend: http://localhost:8001

## 🎯 Features

- **AI Financial Analysis**: Intelligent chat with FinDeep AI backend
- **User Authentication**: Secure login and registration
- **Real-time Chat**: Interactive financial advisor conversations
- **Document Upload**: Analyze financial documents (PDF, CSV, etc.)
- **Modern UI**: Clean interface with dark/light mode
- **Session Management**: Persistent chat history

## 🏗️ Architecture

```
┌─────────────────┐    HTTP POST     ┌──────────────────┐    OpenAI API    ┌─────────────┐
│   React Frontend│ ────────────────► │ FinDeep Backend  │ ───────────────► │   OpenAI    │
│  (Port 3000)    │ ◄──────────────── │   (Port 8001)    │ ◄─────────────── │   GPT-4o    │
└─────────────────┘    JSON Response  └──────────────────┘    AI Response   └─────────────┘
```

## 📁 Project Structure

```
FinDeep/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── services/          # API integration
│   └── pages/             # Application pages
├── backend/               # Node.js auth server
├── FinDeep-backend/       # AI backend (submodule)
└── docs/                  # Documentation
```

## 🔧 Development

### Frontend Development
```bash
npm start  # Starts React app on port 3000
```

### Backend Development
```bash
# Auth server
cd backend && npm start  # Port 5001

# AI backend
cd FinDeep-backend && python -m uvicorn app.chatbot_api:app --reload  # Port 8001
```

## 📚 Documentation

- [Integration Guide](INTEGRATION_GUIDE.md) - Complete setup and integration details
- [API Setup](docs/API_SETUP.md) - API configuration guide
- [Environment Setup](docs/ENVIRONMENT_SETUP.md) - Environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the integration
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**FinDeep AI Integration**: Successfully connects React frontend with FinDeep AI backend for intelligent financial analysis.