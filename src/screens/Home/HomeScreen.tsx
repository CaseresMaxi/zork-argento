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
      <header className="home-header">
        <h1>Welcome to Zork Argento</h1>
        <div className="user-info">
          <span>Hello, {user?.name}!</span>
          <Button onClick={handleLogout} variant="secondary">
            Logout
          </Button>
        </div>
      </header>
      
      <main className="home-content">
        <p>This is the home screen of your application.</p>
        <div className="features">
          <h2>Features</h2>
          <ul>
            <li>User authentication</li>
            <li>Modern UI components</li>
            <li>TypeScript support</li>
            <li>React Router navigation</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
