# 🔐 Google OAuth Setup Guide for FinDeep

This guide will help you set up Google OAuth authentication for your FinDeep application.

## 📋 Prerequisites

- Google Cloud Console account
- FinDeep application running locally

## 🚀 Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `FinDeep OAuth`
4. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google Identity" and enable it

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
6. Click "Create"
7. Copy the **Client ID** (you'll need this)

### 4. Configure Environment Variables

#### Frontend (.env)
```bash
# Add this to your .env file
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
```

#### Backend (backend/.env)
```bash
# Add this to your backend/.env file
GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 5. Test the Integration

1. Start your backend server:
   ```bash
   cd backend
   node persistent-server.js
   ```

2. Start your frontend:
   ```bash
   npm start
   ```

3. Go to `http://localhost:3000/login`
4. Click "Sign in with Google" or "Sign up with Google"
5. Complete the Google OAuth flow

## 🔧 Troubleshooting

### Common Issues

#### 1. "Google services not loaded"
- Make sure the Google script is loaded in `public/index.html`
- Check browser console for errors
- Ensure `REACT_APP_GOOGLE_CLIENT_ID` is set correctly

#### 2. "Invalid client ID"
- Verify the Client ID in your `.env` files
- Make sure the Client ID is for a "Web application" type
- Check that the domain is authorized in Google Cloud Console

#### 3. "Redirect URI mismatch"
- Add your exact domain to authorized redirect URIs
- Include both `http://localhost:3000` and `https://yourdomain.com`
- Don't include trailing slashes

#### 4. "Access blocked"
- Check that Google+ API is enabled
- Verify OAuth consent screen is configured
- Make sure the app is not in testing mode (unless you add test users)

### Debug Mode

Enable debug logging by setting:
```bash
REACT_APP_DEBUG=true
```

## 🎯 Features

### What Users Can Do

1. **Sign Up with Google**: New users can create accounts using their Google profile
2. **Sign In with Google**: Existing users can log in with their Google account
3. **Automatic Profile Sync**: Name, email, and profile picture are automatically imported
4. **Seamless Experience**: No need to remember passwords

### Security Features

1. **Token Verification**: All Google tokens are verified on the backend
2. **Email Verification**: Only verified Google emails are accepted
3. **Secure Storage**: JWT tokens are stored securely in localStorage
4. **Automatic Logout**: Tokens expire after 24 hours

## 📱 User Experience

### Login Flow
1. User clicks "Sign in with Google"
2. Google OAuth popup appears
3. User selects their Google account
4. User is automatically logged into FinDeep
5. Redirected to chat interface

### Signup Flow
1. User clicks "Sign up with Google"
2. Google OAuth popup appears
3. User selects their Google account
4. New FinDeep account is created automatically
5. User is logged in and redirected to chat

## 🔄 Integration with Existing Features

- **Demo Mode**: Still available for users who don't want to create accounts
- **Regular Login**: Email/password login still works alongside Google OAuth
- **User Profiles**: Google profile pictures are displayed in the user menu
- **Chat History**: All chat features work the same with Google-authenticated users

## 🚀 Production Deployment

### Environment Variables for Production

```bash
# Frontend
REACT_APP_GOOGLE_CLIENT_ID=your-production-client-id

# Backend
GOOGLE_CLIENT_ID=your-production-client-id
```

### Google Cloud Console Settings

1. Add your production domain to authorized origins
2. Add your production domain to authorized redirect URIs
3. Configure OAuth consent screen for production
4. Submit for verification if needed

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure Google Cloud Console settings match your domains
4. Test with a different Google account
5. Check that all dependencies are installed

## 🎉 Success!

Once configured, users will see a beautiful "Continue with Google" button on your login page that provides a seamless authentication experience!
