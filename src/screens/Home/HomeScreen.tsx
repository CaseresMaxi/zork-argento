import React from 'react';
import { useAuth } from '../../hooks';
import { Button } from '../../components';

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="home-screen">
      <header className="home-header glass-effect">
        <div>
          <h1 className="gradient-text">Welcome to Zork Argento</h1>
          <p className="text-secondary">Your adventure awaits</p>
        </div>
        <div className="user-info">
          <div className="user-details">
            <span className="user-greeting">Hello, {user?.name}!</span>
            <span className="user-status">Online</span>
          </div>
          <Button onClick={handleLogout} variant="secondary" size="sm" fullWidth={false}>
            Logout
          </Button>
        </div>
      </header>
      
      <main className="home-content">
        <div className="welcome-section">
          <h2>Ready to explore?</h2>
          <p className="text-secondary">Discover the amazing features of your application</p>
        </div>
        
        <div className="features">
          <h2>✨ Features</h2>
          <ul>
            <li>
              <strong>User Authentication</strong>
              <span>Secure login and registration system</span>
            </li>
            <li>
              <strong>Modern UI Components</strong>
              <span>Beautiful, responsive design elements</span>
            </li>
            <li>
              <strong>TypeScript Support</strong>
              <span>Type-safe development experience</span>
            </li>
            <li>
              <strong>React Router Navigation</strong>
              <span>Seamless page transitions</span>
            </li>
            <li>
              <strong>Dark Theme</strong>
              <span>Easy on the eyes, modern aesthetic</span>
            </li>
            <li>
              <strong>Responsive Design</strong>
              <span>Works perfectly on all devices</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
