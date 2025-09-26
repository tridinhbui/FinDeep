/**
 * FinDeep Backend Server
 * 
 * Clean, simple backend API server with:
 * - User authentication (local + Google OAuth)
 * - JWT token management
 * - User data persistence
 * - CORS support
 * 
 * @author FinDeep Team
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Google OAuth setup
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// User data file
const USERS_FILE = path.join(__dirname, 'users.json');

/**
 * Utility Functions
 */

// Read users from JSON file
function readUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

// Write users to JSON file
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users:', error);
  }
}

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Verify Google token
async function verifyGoogleToken(token) {
  try {
    console.log('Google Client ID configured:', GOOGLE_CLIENT_ID);
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id-here') {
      console.error('Google OAuth not configured - GOOGLE_CLIENT_ID missing');
      throw new Error('Google OAuth not configured');
    }
    
    console.log('Attempting to verify Google token...');
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    console.log('Token verification successful for:', payload['email']);
    
    return {
      googleId: payload['sub'],
      email: payload['email'],
      name: payload['name'],
      picture: payload['picture'],
      emailVerified: payload['email_verified']
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    console.error('Error details:', error.message);
    throw new Error('Invalid Google token: ' + error.message);
  }
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
}

/**
 * API Routes
 */

// Health check
app.get('/api/health', (req, res) => {
  const users = readUsers();
  res.json({
    success: true,
    message: 'FinDeep Backend API is running',
    timestamp: new Date().toISOString(),
    usersCount: users.length
  });
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const users = readUsers();

    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    if (users.find(u => u.username === username)) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    const token = generateToken(newUser.id);

    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const users = readUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        picture: user.picture
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Google OAuth login
app.post('/api/auth/google', async (req, res) => {
  try {
    console.log('Google auth request received');
    const { token } = req.body;
    
    if (!token) {
      console.log('No Google token provided');
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    console.log('Verifying Google token...');
    const googleUser = await verifyGoogleToken(token);
    console.log('Google user verified:', { email: googleUser.email, name: googleUser.name });
    
    if (!googleUser.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Google email not verified'
      });
    }

    let users = readUsers();
    let user = users.find(u => u.email === googleUser.email);

    if (!user) {
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        username: googleUser.email.split('@')[0],
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.googleId,
        picture: googleUser.picture,
        password: null,
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      writeUsers(users);
      user = newUser;
    } else {
      // Update existing user
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        user.picture = googleUser.picture;
        writeUsers(users);
      }
    }

    const jwtToken = generateToken(user.id);

    res.json({
      success: true,
      message: 'Google login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        picture: user.picture
      },
      token: jwtToken
    });

  } catch (error) {
    console.error('Google login error:', error);
    const errorMessage = error.message || 'Server error during Google login';
    console.error('Error details:', errorMessage);
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FinDeep Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users storage: ${USERS_FILE}`);
  
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id-here') {
    console.log('⚠️  Google OAuth not configured - set GOOGLE_CLIENT_ID in .env');
  } else {
    console.log('✅ Google OAuth configured');
  }
});

module.exports = app;
