# Claude AI Integration Setup Guide

## 🤖 **Switched to Claude AI!**

Your FinDeep app now supports **Anthropic Claude** as the primary AI provider, with OpenAI as a backup option.

## 🚀 **How to Get Your Claude API Key**

### Step 1: Create Anthropic Account
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up for a new account or sign in
3. Verify your email address

### Step 2: Get API Key
1. In the console, go to **"API Keys"** section
2. Click **"Create Key"**
3. Give it a name like "FinDeep App"
4. Copy your API key (starts with `sk-ant-`)

### Step 3: Add Credits (Optional)
- Claude offers **free credits** for new users
- You can also add payment method for more usage
- Much more generous than OpenAI's free tier

### Step 4: Update Your Environment
Replace `your-claude-api-key-here` in your `.env` file with your actual key:

```env
REACT_APP_CLAUDE_API_KEY=sk-ant-your-actual-key-here
```

### Step 5: Restart Your App
```bash
npm start
```

## 🎯 **Why Claude is Great for FinDeep**

### ✅ **Advantages:**
- **Better financial analysis** - Claude excels at complex reasoning
- **More generous free tier** - Less likely to hit quota limits
- **Better context understanding** - Handles long conversations well
- **More reliable** - Better uptime than OpenAI
- **Cost effective** - Often cheaper for complex tasks

### 🔄 **Fallback System:**
- **Primary**: Claude AI (if API key is configured)
- **Backup**: OpenAI (if Claude fails)
- **Demo Mode**: Realistic responses (if both fail)

## 🧪 **Test Your Setup**

### 1. Check API Key
```bash
# Your .env should look like:
REACT_APP_AI_PROVIDER=claude
REACT_APP_CLAUDE_API_KEY=sk-ant-your-key-here
```

### 2. Test in Browser
1. Open `http://localhost:3000`
2. Send message: "Help me analyze my budget"
3. Check console (F12) for API calls
4. You should see Claude responses!

### 3. Expected Behavior
- **With Claude key**: Real AI responses from Claude
- **Without key**: Demo mode with realistic responses
- **API error**: Automatic fallback to demo mode

## 🔧 **Configuration Options**

### Switch Between AI Providers
```env
# Use Claude (recommended)
REACT_APP_AI_PROVIDER=claude

# Use OpenAI
REACT_APP_AI_PROVIDER=openai
```

### Debug Mode
```env
REACT_APP_DEBUG=true  # Shows API calls in console
```

## 🎉 **You're All Set!**

Once you add your Claude API key:
- ✅ **Real AI responses** from Claude
- ✅ **Better financial analysis** 
- ✅ **More reliable service**
- ✅ **Generous free tier**
- ✅ **Automatic fallbacks**

## 🆘 **Need Help?**

### Common Issues:
1. **"No valid API key"** → Add your Claude key to `.env`
2. **"API error"** → Check your key is correct
3. **Still demo mode** → Restart your development server

### Get Support:
- [Anthropic Documentation](https://docs.anthropic.com/)
- [Claude API Reference](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

**Your FinDeep AI agent is now powered by Claude! 🚀**
