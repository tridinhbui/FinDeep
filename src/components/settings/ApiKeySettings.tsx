import React, { useState, useEffect } from 'react';

interface ApiKeySettingsProps {
  user: { email: string; name: string };
  onApiKeyUpdate: (provider: string, apiKey: string) => void;
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ user, onApiKeyUpdate }) => {
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('claude');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load saved API keys on mount
  useEffect(() => {
    const savedClaudeKey = localStorage.getItem(`findeep-claude-key-${user.email}`);
    const savedOpenaiKey = localStorage.getItem(`findeep-openai-key-${user.email}`);
    
    if (savedClaudeKey) setClaudeApiKey(savedClaudeKey);
    if (savedOpenaiKey) setOpenaiApiKey(savedOpenaiKey);
  }, [user.email]);

  const handleSaveApiKey = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const apiKey = selectedProvider === 'claude' ? claudeApiKey : openaiApiKey;
      
      if (!apiKey.trim()) {
        setMessage('Please enter an API key');
        return;
      }

      // Save to localStorage
      const keyName = `findeep-${selectedProvider}-key-${user.email}`;
      localStorage.setItem(keyName, apiKey);

      // Notify parent component
      onApiKeyUpdate(selectedProvider, apiKey);

      setMessage(`✅ ${selectedProvider.toUpperCase()} API key saved successfully!`);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to save API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestApiKey = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const apiKey = selectedProvider === 'claude' ? claudeApiKey : openaiApiKey;
      
      if (!apiKey.trim()) {
        setMessage('Please enter an API key to test');
        return;
      }

      // Test the API key
      const testResult = await testApiKey(selectedProvider, apiKey);
      
      if (testResult.success) {
        setMessage(`✅ ${selectedProvider.toUpperCase()} API key is working!`);
      } else {
        setMessage(`❌ ${selectedProvider.toUpperCase()} API key test failed: ${testResult.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to test API key');
    } finally {
      setIsLoading(false);
    }
  };

  const testApiKey = async (provider: string, apiKey: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (provider === 'claude') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hello' }]
          }),
        });

        if (response.ok) {
          return { success: true };
        } else {
          const errorData = await response.json().catch(() => ({}));
          return { success: false, error: errorData.error?.message || 'Unknown error' };
        }
      } else {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hello' }]
          }),
        });

        if (response.ok) {
          return { success: true };
        } else {
          const errorData = await response.json().catch(() => ({}));
          return { success: false, error: errorData.error?.message || 'Unknown error' };
        }
      }
    } catch (error) {
      return { success: false, error: 'Connection error' };
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-dark-text-secondary hover:text-accent transition-colors"
        title="API Settings"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        API Settings
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">API Key Settings</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">AI Provider</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedProvider('claude')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedProvider === 'claude'
                    ? 'bg-accent text-white'
                    : 'bg-dark-surface text-dark-text-secondary hover:text-dark-text'
                }`}
              >
                Claude
              </button>
              <button
                onClick={() => setSelectedProvider('openai')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedProvider === 'openai'
                    ? 'bg-accent text-white'
                    : 'bg-dark-surface text-dark-text-secondary hover:text-dark-text'
                }`}
              >
                OpenAI
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {selectedProvider === 'claude' ? 'Claude' : 'OpenAI'} API Key
            </label>
            <input
              type="password"
              value={selectedProvider === 'claude' ? claudeApiKey : openaiApiKey}
              onChange={(e) => {
                if (selectedProvider === 'claude') {
                  setClaudeApiKey(e.target.value);
                } else {
                  setOpenaiApiKey(e.target.value);
                }
              }}
              placeholder={`Enter your ${selectedProvider} API key`}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-xl text-sm ${
              message.includes('✅') 
                ? 'bg-success/10 border border-success/20 text-success' 
                : 'bg-error/10 border border-error/20 text-error'
            }`}>
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleTestApiKey}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 text-gray-700"
            >
              {isLoading ? 'Testing...' : 'Test Key'}
            </button>
            <button
              onClick={handleSaveApiKey}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Key'}
            </button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Get Claude API key: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a></p>
            <p>• Get OpenAI API key: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com</a></p>
            <p>• Your API keys are stored locally and only used by you</p>
          </div>
        </div>
      </div>
    </div>
  );
};
