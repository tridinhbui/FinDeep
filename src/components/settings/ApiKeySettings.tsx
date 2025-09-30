import React, { useState, useEffect } from 'react';

// Interface for backend settings component props
interface BackendSettingsProps {
  user: { email: string; name: string };  // User information
  onBackendUpdate: (backendUrl: string) => void;  // Callback when backend URL is updated
}

// Backend settings component - allows users to configure FinDeep backend URL
export const ApiKeySettings: React.FC<BackendSettingsProps> = ({ user, onBackendUpdate }) => {
  const [backendUrl, setBackendUrl] = useState('');  // Current backend URL input
  const [isVisible, setIsVisible] = useState(false);  // Visibility toggle for settings panel
  const [isLoading, setIsLoading] = useState(false);  // Loading state for async operations
  const [message, setMessage] = useState('');  // Status message for user feedback

  // Load saved backend URL from localStorage when component mounts
  useEffect(() => {
    const savedBackendUrl = localStorage.getItem(`findeep-backend-url-${user.email}`);
    if (savedBackendUrl) {
      setBackendUrl(savedBackendUrl);  // Use saved URL if available
    } else {
      // Default to the standard FinDeep backend URL
      setBackendUrl('http://localhost:8001');
    }
  }, [user.email]);  // Re-run when user email changes

  const handleSaveBackendUrl = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      if (!backendUrl.trim()) {
        setMessage('Please enter a backend URL');
        return;
      }

      // Validate URL format
      try {
        new URL(backendUrl);
      } catch {
        setMessage('Please enter a valid URL (e.g., http://localhost:8001)');
        return;
      }

      // Save to localStorage
      localStorage.setItem(`findeep-backend-url-${user.email}`, backendUrl);

      // Notify parent component
      onBackendUpdate(backendUrl);

      setMessage('✅ Backend URL saved successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to save backend URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestBackend = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      if (!backendUrl.trim()) {
        setMessage('Please enter a backend URL to test');
        return;
      }

      // Test the backend connection
      const testResult = await testBackendConnection(backendUrl);
      
      if (testResult.success) {
        setMessage('✅ FinDeep Backend connection successful!');
      } else {
        setMessage(`❌ Backend connection failed: ${testResult.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to test backend connection');
    } finally {
      setIsLoading(false);
    }
  };

  const testBackendConnection = async (url: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Test the health endpoint first
      const healthResponse = await fetch(`${url}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (healthResponse.ok) {
        // Test the chat endpoint with a simple message
        const chatResponse = await fetch(`${url}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: 'test-session',
            message: 'Hello'
          }),
        });

        if (chatResponse.ok) {
          return { success: true };
        } else {
          const errorData = await chatResponse.json().catch(() => ({}));
          return { success: false, error: errorData.detail || 'Chat endpoint not responding' };
        }
      } else {
        return { success: false, error: 'Backend not responding' };
      }
    } catch (error) {
      return { success: false, error: 'Connection error - check URL and ensure backend is running' };
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-dark-text-secondary hover:text-accent transition-colors"
        title="Backend Settings"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
        Backend Settings
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">FinDeep Backend Settings</h3>
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
          {/* Backend URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              FinDeep Backend URL
            </label>
            <input
              type="url"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://localhost:8001"
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
              onClick={handleTestBackend}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 text-gray-700"
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={handleSaveBackendUrl}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save URL'}
            </button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Default: http://localhost:8001 (when FinDeep backend is running locally)</p>
            <p>• Make sure the FinDeep backend server is running</p>
            <p>• The backend URL is stored locally and only used by you</p>
          </div>
        </div>
      </div>
    </div>
  );
};
