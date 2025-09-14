import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import { Button } from '../../components';

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleGenerateAdventure = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // TODO: Implement adventure generation logic
      console.log('Generating adventure with prompt:', prompt);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error generating adventure:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateAdventure();
    }
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

        <div className="chat-interface">
          <div className="chat-header">
            <h2>Create Your Adventure</h2>
            <p className="text-secondary">Describe the adventure you want to experience</p>
          </div>
          
          <div className="chat-container">
           
            
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <textarea
                  className="chat-input"
                  placeholder="Describe tu aventura... (ej: 'Una aventura épica en un castillo embrujado donde debo rescatar a un dragón')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={3}
                  disabled={isGenerating}
                />
                <Button
                
                  onClick={handleGenerateAdventure}
                  disabled={(!prompt.trim() || isGenerating) && false}
                  className="send-button"
                  variant="primary"
                >
                Crear Zork
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="features">
          <h2>Mis Zorks 🧉</h2>
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
