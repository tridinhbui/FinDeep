const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// File paths
const USERS_FILE = path.join(__dirname, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'findeep-secret-key-2024';

// Google OAuth client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper functions
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

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users:', error);
    return false;
  }
}

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

// Google OAuth verification function
async function verifyGoogleToken(token) {
  try {
    // Check if Google Client ID is configured
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id-here') {
      throw new Error('Google OAuth is not configured on the server');
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      googleId: payload['sub'],
      email: payload['email'],
      name: payload['name'],
      picture: payload['picture'],
      emailVerified: payload['email_verified']
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw new Error('Invalid Google token or Google OAuth not configured');
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FinDeep Backend API is running',
    timestamp: new Date().toISOString(),
    usersCount: readUsers().length
  });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, name } = req.body;
  
  if (!username || !email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, password, and name are required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  try {
    const users = readUsers();
    
    // Check if user already exists
    const existingUser = users.find(user => 
      user.email === email || user.username === username
    );
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'User already exists with this email'
          : 'Username already taken'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    // Save user
    users.push(newUser);
    writeUsers(users);

    // Generate token
    const token = generateToken(newUser.id);

    res.status(201).json({
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

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    const users = readUsers();
    
    // Find user by email
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
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

// Google OAuth login endpoint
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Google token is required'
    });
  }

  try {
    // Verify Google token
    const googleUser = await verifyGoogleToken(token);
    
    if (!googleUser.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Google email not verified'
      });
    }

    const users = readUsers();
    
    // Check if user already exists
    let user = users.find(u => u.email === googleUser.email);
    
    if (!user) {
      // Create new user from Google data
      const newUser = {
        id: Date.now().toString(),
        username: googleUser.email.split('@')[0], // Use email prefix as username
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.googleId,
        picture: googleUser.picture,
        password: null, // No password for Google users
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      writeUsers(users);
      user = newUser;
    } else {
      // Update existing user with Google info if not present
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        user.picture = googleUser.picture;
        writeUsers(users);
      }
    }

    // Generate token
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
    res.status(500).json({
      success: false,
      message: 'Server error during Google login'
    });
  }
});

// Google OAuth callback endpoint
app.post('/api/auth/google/callback', async (req, res) => {
  const { code, redirect_uri } = req.body;
  
  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Authorization code is required'
    });
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: '', // We don't need client secret for public clients
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.id_token) {
      throw new Error('No ID token received from Google');
    }

    // Verify the ID token
    const googleUser = await verifyGoogleToken(tokenData.id_token);
    
    if (!googleUser.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Google email not verified'
      });
    }

    const users = readUsers();
    
    // Check if user already exists
    let user = users.find(u => u.email === googleUser.email);
    
    if (!user) {
      // Create new user from Google data
      const newUser = {
        id: Date.now().toString(),
        username: googleUser.email.split('@')[0], // Use email prefix as username
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.googleId,
        picture: googleUser.picture,
        password: null, // No password for Google users
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      writeUsers(users);
      user = newUser;
    } else {
      // Update existing user with Google info if not present
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        user.picture = googleUser.picture;
        writeUsers(users);
      }
    }

    // Generate token
    const jwtToken = generateToken(user.id);

    res.json({
      success: true,
      message: 'Google login successful',
      id_token: tokenData.id_token,
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
    console.error('Google callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google callback'
    });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readUsers();
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
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
        name: user.name
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`🚀 FinDeep Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users storage: ${USERS_FILE}`);
});
