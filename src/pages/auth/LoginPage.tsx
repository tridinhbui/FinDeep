import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleAuth } from '../../components/auth/GoogleAuth';

declare global {
  interface Window {
    google: any;
  }
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Check if Google services are loaded
  useEffect(() => {
    const checkGoogleServices = () => {
      if (window.google) {
        console.log('Google services loaded successfully');
      } else {
        console.log('Google services not loaded yet, retrying...');
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
      await login(formData.email, formData.password);
      navigate('/chat');
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
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
            
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white rounded-xl hover:bg-accent-hover transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Sign In'}
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

          {/* Google Sign-In Button */}
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