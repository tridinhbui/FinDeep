import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  // Add entrance animation
  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call - replace with real authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, accept any email/password
      if (email && password) {
        localStorage.setItem('findeep-user', JSON.stringify({ email, name: email.split('@')[0] }));
        navigate('/chat');
      } else {
        setError('Please enter both email and password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@findeep.com');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-accent/20 to-accent-light/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-accent-light/10 to-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-accent/30 to-accent-light/30 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        
        {/* Animated dots */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-accent rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className={`relative w-full max-w-md transition-all duration-1000 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-modern-gradient flex items-center justify-center shadow-glow-lg animate-pulse-glow relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
              <span className="text-white font-bold text-3xl relative z-10">F</span>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-3xl bg-modern-gradient blur-xl opacity-50 animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent via-accent-light to-accent bg-clip-text text-transparent mb-3 animate-fade-in">
            FinDeep
          </h1>
          <p className="text-dark-text-secondary text-lg animate-fade-in delay-200">
            AI-Powered Finance Assistant
          </p>
          <div className="mt-4 flex justify-center space-x-2 animate-fade-in delay-300">
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-accent-light rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200"></div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-card-gradient backdrop-blur-xl border border-dark-border/50 rounded-3xl shadow-modern-lg p-8 relative overflow-hidden">
          {/* Form background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent-light/5 rounded-3xl"></div>
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-dark-text mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-dark-surface/80 border border-dark-border rounded-2xl focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-300 text-dark-text placeholder-dark-text-muted backdrop-blur-sm group-hover:border-accent/50"
                  placeholder="Enter your email address"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/10 to-accent-light/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-dark-text mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-12 bg-dark-surface/80 border border-dark-border rounded-2xl focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-300 text-dark-text placeholder-dark-text-muted backdrop-blur-sm group-hover:border-accent/50"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-text-muted hover:text-accent transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/10 to-accent-light/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/30 rounded-2xl p-4 backdrop-blur-sm animate-slide-up">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-error text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-modern-gradient text-white rounded-2xl hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center justify-center gap-3 relative overflow-hidden group btn-modern"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Demo Login */}
          <div className="mt-8 pt-6 border-t border-dark-border/50 relative z-10">
            <button
              onClick={handleDemoLogin}
              className="w-full py-3 text-dark-text-secondary hover:text-accent transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2 group"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Try Demo Account
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 space-y-4 relative z-10">
            <h3 className="text-sm font-semibold text-dark-text flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Key Features
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-dark-surface/30 rounded-xl backdrop-blur-sm border border-dark-border/30 hover:border-accent/30 transition-all duration-300 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent/20 to-accent-light/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm text-dark-text-secondary group-hover:text-dark-text transition-colors duration-200">AI-powered financial analysis</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-dark-surface/30 rounded-xl backdrop-blur-sm border border-dark-border/30 hover:border-accent/30 transition-all duration-300 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent/20 to-accent-light/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm text-dark-text-secondary group-hover:text-dark-text transition-colors duration-200">Document attachment & preview</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-dark-surface/30 rounded-xl backdrop-blur-sm border border-dark-border/30 hover:border-accent/30 transition-all duration-300 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent/20 to-accent-light/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-sm text-dark-text-secondary group-hover:text-dark-text transition-colors duration-200">Real-time chat interface</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 animate-fade-in delay-500">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-dark-border to-transparent"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-dark-border to-transparent"></div>
          </div>
          <p className="text-xs text-dark-text-muted">
            © 2024 FinDeep. All rights reserved.
          </p>
          <p className="text-xs text-dark-text-muted mt-1">
            Powered by AI • Secure • Modern
          </p>
        </div>
      </div>
    </div>
  );
};

