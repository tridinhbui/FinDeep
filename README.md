# FinDeep - AI Financial Analysis Assistant

FinDeep is a modern web application that provides AI-powered financial analysis and planning assistance. Built with React, TypeScript, and Tailwind CSS, it offers intelligent financial insights through integration with OpenAI and Anthropic Claude APIs.

## 🚀 Features

- **AI-Powered Financial Analysis**: Get intelligent insights from OpenAI GPT or Anthropic Claude
- **Multi-User API Key Management**: Each user can connect their own API keys
- **File Upload Support**: Upload financial documents for analysis
- **Modern UI/UX**: Beautiful dark theme with glassmorphism effects
- **Real-time Chat Interface**: Interactive conversation with AI financial advisor
- **Document Viewer**: View and analyze uploaded financial documents
- **Demo Mode**: Works without API keys for testing

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **AI Integration**: OpenAI GPT-3.5-turbo, Anthropic Claude
- **Build Tool**: Create React App
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: React Hooks

## �� Prerequisites

Before running FinDeep, make sure you have:

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **OpenAI API Key** or **Anthropic Claude API Key** (optional - demo mode available)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/FinDeep.git
cd FinDeep
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
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

### 4. Start the Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

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
3. **Ask questions** about your uploaded files

### Example Questions
