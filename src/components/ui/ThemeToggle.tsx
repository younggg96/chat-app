import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import IconButton from './IconButton';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { mode, toggleMode } = useThemeStore();
  const isDarkMode = mode === 'dark';
  const [isAnimating, setIsAnimating] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    setShowOverlay(true);
    
    // Toggle the mode
    setTimeout(() => {
      toggleMode();
    }, 150);
    
    // Hide overlay after transition completes
    setTimeout(() => {
      setShowOverlay(false);
      setIsAnimating(false);
    }, 600);
  };

  return (
    <>
      {showOverlay && (
        <div 
          className={`fixed inset-0 z-50 pointer-events-none ${
            isDarkMode ? 'bg-gray-100' : 'bg-black'
          } transition-opacity duration-500 ${
            showOverlay ? 'opacity-20' : 'opacity-0'
          }`}
          style={{
            clipPath: 'circle(150% at top right)',
            animation: `${isDarkMode ? 'fadeOutCircle' : 'fadeInCircle'} 600ms ease-in-out forwards`
          }}
        />
      )}
      
      <IconButton
        className={className}
        onClick={handleToggle}
        variant="secondary"
        tooltip={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        icon={
          <div className={`transform ${isAnimating ? 'animate-spinReverse' : ''} transition-all duration-500`}>
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </div>
        }
      />
    </>
  );
};

export default ThemeToggle; 