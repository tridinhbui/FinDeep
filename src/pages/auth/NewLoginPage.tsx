import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const NewLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/chat');
      } else {
        // Registration validation
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (!formData.username || !formData.email || !formData.name) {
          throw new Error('All fields are required');
        }

        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
        navigate('/chat');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg to-dark-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-modern-gradient flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-3xl">F</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
            FinDeep
          </h1>
          <p className="text-dark-text-secondary mt-2">
            AI-Powered Financial Analysis
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card-gradient border border-dark-border rounded-2xl shadow-modern-lg p-8 backdrop-blur-sm">
          {/* Toggle Buttons */}
          <div className="flex mb-6 bg-dark-surface rounded-xl p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-modern-gradient text-white shadow-glow'
                  : 'text-dark-text-secondary hover:text-dark-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-modern-gradient text-white shadow-glow'
                  : 'text-dark-text-secondary hover:text-dark-text'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-300 text-dark-text placeholder-dark-text-muted"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-300 text-dark-text placeholder-dark-text-muted"
                    placeholder="Choose a username"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-300 text-dark-text placeholder-dark-text-muted"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-300 text-dark-text placeholder-dark-text-muted"
                placeholder="Enter your password"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-300 text-dark-text placeholder-dark-text-muted"
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-modern-gradient text-white rounded-xl hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Demo Login */}
          <div className="mt-6 pt-6 border-t border-dark-border">
            <p className="text-center text-sm text-dark-text-muted mb-3">
              Want to try without an account?
            </p>
            <button
              onClick={() => navigate('/chat')}
              className="w-full py-2 px-4 bg-dark-surface border border-dark-border rounded-xl hover:bg-dark-surface-hover transition-colors text-sm font-medium text-dark-text"
            >
              Continue as Demo User
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-dark-text-muted">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};
