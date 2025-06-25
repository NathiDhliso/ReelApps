import React from 'react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-12 h-6',
    md: 'w-14 h-7',
    lg: 'w-16 h-8',
  };

  const thumbSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6',
  };

  const translateClasses = {
    sm: theme === 'dark' ? 'translate-x-6' : 'translate-x-1',
    md: theme === 'dark' ? 'translate-x-7' : 'translate-x-1',
    lg: theme === 'dark' ? 'translate-x-8' : 'translate-x-1',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex ${sizeClasses[size]} items-center rounded-full 
          transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 
          focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-[var(--brand-primary)] to-[var(--cta-secondary)]' 
            : 'bg-gradient-to-r from-[var(--border-primary)] to-[var(--border-secondary)]'
          }
          hover:scale-105 active:scale-95
        `}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {/* Toggle Track Background */}
        <div 
          className={`
            absolute inset-0 rounded-full transition-all duration-300
            ${theme === 'dark' 
              ? 'bg-gradient-to-r from-[var(--brand-primary)] to-[var(--cta-secondary)] opacity-100' 
              : 'bg-gradient-to-r from-[var(--border-primary)] to-[var(--border-secondary)] opacity-100'
            }
          `}
        />
        
        {/* Toggle Thumb */}
        <div
          className={`
            relative ${thumbSizeClasses[size]} ${translateClasses[size]}
            bg-white rounded-full shadow-lg transform transition-all duration-300 ease-in-out
            flex items-center justify-center
            ${theme === 'dark' ? 'bg-gradient-to-br from-yellow-200 to-yellow-400' : 'bg-gradient-to-br from-blue-100 to-blue-200'}
          `}
        >
          {/* Icon */}
          <div className="text-xs">
            {theme === 'dark' ? (
              <svg
                className="w-3 h-3 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-3 h-3 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </div>
        </div>

        {/* Glow Effect */}
        <div 
          className={`
            absolute inset-0 rounded-full opacity-75 transition-all duration-300
            ${theme === 'dark' 
              ? 'bg-gradient-to-r from-[var(--brand-primary)] to-[var(--cta-secondary)] blur-sm' 
              : 'bg-gradient-to-r from-[var(--border-primary)] to-[var(--border-secondary)] blur-sm'
            }
            -z-10 scale-110
          `}
        />
      </button>
    </div>
  );
};

export default ThemeToggle; 