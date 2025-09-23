import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ChatWithPreview } from "./pages/chat";
import { NewLoginPage } from "./pages/auth/NewLoginPage";
import "./App.css";

// Demo user interface for backward compatibility
interface DemoUser {
  email: string;
  name: string;
}

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-bg to-dark-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-modern-gradient flex items-center justify-center shadow-glow animate-pulse">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <p className="text-dark-text-secondary">Loading FinDeep...</p>
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
          isAuthenticated ? <Navigate to="/chat" replace /> : <NewLoginPage />
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
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
