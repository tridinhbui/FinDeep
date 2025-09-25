import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'account' | 'api'>('general');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-elegant w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-light rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-48 bg-secondary-light p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'general'
                    ? 'bg-primary text-white'
                    : 'text-text hover:bg-white'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'account'
                    ? 'bg-primary text-white'
                    : 'text-text hover:bg-white'
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'api'
                    ? 'bg-primary text-white'
                    : 'text-text hover:bg-white'
                }`}
              >
                API Keys
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text">General Settings</h3>
                
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text">Theme</h4>
                    <p className="text-sm text-text-muted">Choose your preferred theme</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${theme === 'light' ? 'text-primary font-medium' : 'text-text-muted'}`}>
                      Light
                    </span>
                    <button
                      onClick={toggleTheme}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm ${theme === 'dark' ? 'text-primary font-medium' : 'text-text-muted'}`}>
                      Dark
                    </span>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text">Account Settings</h3>
                
                {/* User Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={user?.username || ''}
                      disabled
                      className="w-full px-3 py-2 border border-border rounded-lg bg-gray-50 text-text"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-border rounded-lg bg-gray-50 text-text"
                    />
                  </div>
                </div>

                {/* Logout Button */}
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text">API Keys</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your OpenAI API key"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white text-text"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Claude API Key
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your Claude API key"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-white text-text"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your API keys are stored locally and never shared with our servers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
