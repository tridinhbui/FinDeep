import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ChatWithPreview } from "./pages/chat";
import { LoginPage } from "./pages/auth/LoginPage";
import "./App.css";

interface User {
  email: string;
  name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('findeep-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('findeep-user');
      }
    } else {
      // Create a default demo user if no user is logged in
      setUser({
        email: 'demo@findeep.com',
        name: 'Demo User'
      });
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('findeep-user');
    setUser({
      email: 'demo@findeep.com',
      name: 'Demo User'
    });
  };

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

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              <LoginPage />
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ChatWithPreview user={user!} onLogout={handleLogout} />
            } 
          />
          <Route 
            path="/" 
            element={
              <Navigate to="/chat" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
