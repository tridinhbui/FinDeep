import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleAuth } from '../../components/auth/GoogleAuth';

declare global {
  interface Window {
    google: any;
  }
}

export const NewLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check if Google services are loaded
  useEffect(() => {
    const checkGoogleServices = () => {
      console.log('Checking Google services...');
      console.log('window.google:', window.google);
      console.log('REACT_APP_GOOGLE_CLIENT_ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);

      if (window.google) {
        console.log('Google services are loaded!');
      } else {
        console.log('Google services not loaded yet, retrying in 1 second...');
        setTimeout(checkGoogleServices, 1000);
      }
    };

    checkGoogleServices();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await register({
          username: formData.email,
          email: formData.email,
          password: formData.password,
          name: formData.email.split('@')[0] // Use email prefix as name
        });
      }
      navigate('/chat');
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Check if Google Client ID is configured
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      console.log('Google Client ID:', clientId); // Debug log
      
      if (!clientId || clientId === 'your-google-client-id-here') {
        throw new Error('Google OAuth is not configured. Please set up your Google Client ID in the .env file.');
      }

      // Check if Google Identity Services is loaded
      if (!window.google) {
        throw new Error('Google services not loaded. Please refresh the page and try again.');
      }

      console.log('Google services loaded, initializing...'); // Debug log

      // Initialize Google Identity Services with One-Tap
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          console.log('Google callback received:', response); // Debug log
          try {
            // Use the existing loginWithGoogle function
            await loginWithGoogle(response.credential);
            navigate('/chat');
          } catch (error: any) {
            console.error('Google login error:', error); // Debug log
            setError(error.message || 'Google login failed');
          } finally {
            setIsLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Use One-Tap Sign-In (works better on localhost)
      window.google.accounts.id.prompt((notification: any) => {
        console.log('Google prompt notification:', notification); // Debug log
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsLoading(false);
          if (notification.isNotDisplayed()) {
            setError('Google sign-in was not displayed. Please try again or check your browser settings.');
          }
        }
      });

    } catch (error: any) {
      console.error('Google OAuth error:', error); // Debug log
      setError(error.message || 'Google login failed');
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    setIsLoading(true);
    setError('');

    try {
      await loginWithGoogle(response.credential);
      navigate('/chat');
    } catch (error: any) {
      setError(error.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error: any) => {
    console.error('Google authentication error:', error);
    setError('Google authentication failed. Please try again.');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center shadow-elegant">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">FinDeep</h1>
          <p className="text-gray-600">AI-Powered Financial Analysis</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-border rounded-2xl shadow-elegant p-8">
          {/* Toggle Buttons */}
          <div className="flex mb-6 bg-secondary-light rounded-xl p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                isLogin
                  ? 'bg-white text-black shadow-subtle'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                !isLogin
                  ? 'bg-white text-black shadow-subtle'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-black placeholder-gray-500"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-black placeholder-gray-500"
                placeholder="Enter your password"
              />
            </div>
            
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-black placeholder-gray-500"
                  placeholder="Confirm your password"
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white rounded-xl hover:bg-accent-hover transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In */}
          <GoogleAuth
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signin_with"
            theme="outline"
            size="large"
            width={300}
            disabled={isLoading}
          />

          {/* Demo Login */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-gray-500 text-sm mb-3">
              Want to try without an account?
            </p>
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="w-full py-2 text-primary border border-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 font-medium"
            >
              Continue as Demo User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
