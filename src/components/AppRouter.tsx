import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen, SignupScreen, HomeScreen, ChatScreen } from '../screens';
import { ForgotPasswordScreen } from '../screens';
import { useAuth } from '../hooks';

const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuth();


  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginScreen /> : <Navigate to="/home" replace />} 
        />
        <Route 
          path="/signup" 
          element={!isAuthenticated ? <SignupScreen /> : <Navigate to="/home" replace />} 
        />
        <Route 
          path="/forgot-password" 
          element={!isAuthenticated ? <ForgotPasswordScreen /> : <Navigate to="/home" replace />} 
        />
        <Route 
          path="/home" 
          element={isAuthenticated ? <HomeScreen /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/chat" 
          element={isAuthenticated ? <ChatScreen /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
