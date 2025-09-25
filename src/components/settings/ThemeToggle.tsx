import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md',
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]}
          relative rounded-full 
          bg-surface border border-border
          hover:bg-surface-hover
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
          dark:focus:ring-offset-surface
          theme-transition
          shadow-modern hover:shadow-modern-lg
        `}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {/* Background circle that moves */}
        <div className={`
          absolute inset-1 rounded-full 
          ${theme === 'light' ? 'bg-primary' : 'bg-secondary'}
          transition-all duration-300 ease-in-out
          theme-transition
        `}>
          {/* Icon container */}
          <div className={`
            absolute inset-0 flex items-center justify-center
            transition-transform duration-300 ease-in-out
            ${theme === 'light' ? 'translate-x-0' : 'translate-x-full'}
          `}>
            {theme === 'light' ? (
              // Sun icon for light mode
              <svg 
                className={`${iconSizes[size]} ${theme === 'light' ? 'text-secondary' : 'text-primary'} theme-transition`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                />
              </svg>
            ) : (
              // Moon icon for dark mode
              <svg 
                className={`${iconSizes[size]} ${theme === 'dark' ? 'text-primary' : 'text-secondary'} theme-transition`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                />
              </svg>
            )}
          </div>
        </div>
      </button>
      
      {showLabel && (
        <span className="text-sm text-text-secondary theme-transition">
          {theme === 'light' ? 'Light' : 'Dark'} Mode
        </span>
      )}
    </div>
  );
};

// Alternative compact toggle for headers/toolbars
export const CompactThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg
        bg-surface hover:bg-surface-hover
        border border-border
        text-text-secondary hover:text-text
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
        dark:focus:ring-offset-surface
        theme-transition
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
};
