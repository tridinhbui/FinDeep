import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ChatWithPreview } from "./pages/chat";
import { LoginPage } from "./pages/auth/LoginPage";
import "./App.css";
import "./styles/theme.css";

// Demo user interface for backward compatibility
interface DemoUser {
  email: string;
  name: string;
}

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center theme-transition">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-accent)] flex items-center justify-center shadow-[var(--shadow-elegant)] animate-pulse">
            <span className="text-[var(--color-text-inverse)] font-bold text-2xl">F</span>
          </div>
          <p className="text-[var(--color-text-secondary)] theme-transition">Loading FinDeep...</p>
        </div>
      </div>
    );
  }

  // Create demo user for backward compatibility
  const demoUser: DemoUser = {
    email: 'demo@findeep.com',
    name: 'Demo User'
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/chat" replace /> : <LoginPage />
        } 
      />
      <Route 
        path="/chat" 
        element={
          <ChatWithPreview 
            user={user ? {
              email: user.email,
              name: user.name
            } : demoUser} 
            onLogout={logout} 
            isAuthenticated={isAuthenticated}
            realUser={user}
          />
        } 
      />
      <Route 
        path="/" 
        element={
          <Navigate to="/chat" replace />
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
