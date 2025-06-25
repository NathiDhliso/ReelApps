import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark';
  enableAutoMode?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'dark', // Default to dark mode as requested
  enableAutoMode = false,
}) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(defaultTheme);

  // Initialize theme on mount
  useEffect(() => {
    // Check for stored theme preference
    const storedTheme = localStorage.getItem('reelapp-theme') as 'light' | 'dark' | null;
    
    if (storedTheme) {
      setThemeState(storedTheme);
    } else if (enableAutoMode) {
      // Check system preference if auto mode is enabled
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    } else {
      // Use default theme (dark)
      setThemeState(defaultTheme);
    }
  }, [defaultTheme, enableAutoMode]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme class
    root.removeAttribute('data-theme');
    
    // Apply new theme
    root.setAttribute('data-theme', theme);
    
    // Store preference
    localStorage.setItem('reelapp-theme', theme);
    
    // Add gradient background class for enhanced visual appeal
    document.body.classList.add('gradient-background');
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1A202C' : '#F5F5F5');
    }
  }, [theme]);

  // Listen for system theme changes if auto mode is enabled
  useEffect(() => {
    if (!enableAutoMode) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const storedTheme = localStorage.getItem('reelapp-theme');
      if (!storedTheme) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableAutoMode]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className="theme-container" data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Hook for theme-aware styling
export const useThemeStyles = () => {
  const { theme } = useTheme();
  
  return {
    isDark: theme === 'dark',
    isLight: theme === 'light',
    getGradientClass: (type: 'primary' | 'secondary' | 'tertiary' | 'hero' | 'card' | 'glass') => {
      const gradientMap = {
        primary: 'gradient-primary',
        secondary: 'gradient-secondary', 
        tertiary: 'gradient-tertiary',
        hero: 'gradient-hero',
        card: 'card-gradient',
        glass: 'glass-effect',
      };
      return gradientMap[type];
    },
    getThemeClass: (lightClass: string, darkClass: string) => {
      return theme === 'dark' ? darkClass : lightClass;
    },
  };
};

export default ThemeProvider; 