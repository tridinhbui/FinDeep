import React, { useEffect } from 'react';

interface GoogleAuthProps {
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: number;
  disabled?: boolean;
}

declare global {
  interface Window {
    google: any;
    googleCallback: (response: any) => void;
  }
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({
  onSuccess,
  onError,
  text = 'signin_with',
  theme = 'outline',
  size = 'large',
  width = 300,
  disabled = false
}) => {
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            onSuccess(response);
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: theme,
            size: size,
            text: text,
            width: width,
            disabled: disabled
          }
        );
      }
    };

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [onSuccess, onError, text, theme, size, width, disabled]);

  return (
    <div className="w-full flex justify-center">
      <div id="google-signin-button" className="flex justify-center"></div>
    </div>
  );
};

// Alternative: Custom styled Google button
export const CustomGoogleButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  text?: string;
}> = ({ onClick, disabled = false, text = "Continue with Google" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-border rounded-xl hover:bg-secondary-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-black"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span className="text-black font-medium">{text}</span>
    </button>
  );
};
