import ChatWindow from "./components/ChatWindow";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./components/auth/AuthPage";

function App() {
  const { isAuthenticated } = useAuthStore();
  const { mode } = useThemeStore();
  const isDarkMode = mode === 'dark';
  
  // 根据暗黑模式设置应用HTML元素的class
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
        : 'bg-slate-50 text-gray-900'
      } transition-colors duration-200`}>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/chat" replace /> : <AuthPage />} />
        <Route path="/chat" element={isAuthenticated ? <ChatWindow /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
