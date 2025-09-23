const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FinDeep Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Simple auth routes for testing
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, name } = req.body;
  
  if (!username || !email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, password, and name are required'
    });
  }
  
  res.json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: Date.now().toString(),
      username,
      email,
      name
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: Date.now().toString(),
      username: email.split('@')[0],
      email,
      name: email.split('@')[0]
    },
    token: 'demo-token-' + Date.now()
  });
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`🚀 FinDeep Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
