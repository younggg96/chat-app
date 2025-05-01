import ChatWindow from "./components/ChatWindow";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./components/auth/AuthPage";
import { Toaster } from "./components/ui/shadcn";

function App() {
  const { isAuthenticated } = useAuthStore();
  const { mode } = useThemeStore();
  const isDarkMode = mode === 'dark';
  
  // Set HTML element class based on dark mode
  useEffect(() => {
    // Add global transition styles
    const style = document.createElement('style');
    style.textContent = `
      * {
        transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 400ms;
      }
    `;
    document.head.appendChild(style);
    
    // Add/remove dark class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Update dark mode class when mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`h-screen font-sans antialiased ${
      isDarkMode 
        ? 'bg-black text-gray-100' 
        : 'bg-slate-100 text-gray-800'
      } transition-colors duration-300`}>
      <div className="animate-fadeIn transition-all duration-300 h-full">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/chat" replace /> : <AuthPage />} />
          <Route path="/chat" element={isAuthenticated ? <ChatWindow /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
