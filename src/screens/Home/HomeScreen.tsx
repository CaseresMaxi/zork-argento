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
          <h1 className="gradient-text">¡Bienvenido a Zork Argento!</h1>
          <p className="text-secondary">Tu aventura te está esperando, che</p>
        </div>
        <div className="user-info">
          <div className="user-details">
            <span className="user-greeting">¡Hola, {user?.name}!</span>
            <span className="user-status">Conectado</span>
          </div>
          <Button onClick={handleLogout} variant="secondary" size="sm" fullWidth={false}>
            Salir
          </Button>
        </div>
      </header>
      
      <main className="home-content">

        <div className="chat-interface">
          <div className="chat-header">
            <h2>Creá tu aventura</h2>
            <p className="text-secondary">Contanos qué aventura querés vivir</p>
          </div>
          
          <div className="chat-container">
           
            
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <textarea
                  className="chat-input"
                  placeholder="Contanos tu aventura... (ej: 'Una aventura épica en un castillo embrujado donde tengo que rescatar a un dragón')"
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
                ¡Dale, creá el Zork!
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="features">
          <h2>Mis Zorks 🧉</h2>
          <ul>
            <li>
              <strong>Autenticación de usuarios</strong>
              <span>Sistema seguro de login y registro</span>
            </li>
            <li>
              <strong>Componentes modernos</strong>
              <span>Diseño hermoso y responsivo</span>
            </li>
            <li>
              <strong>Soporte TypeScript</strong>
              <span>Desarrollo con tipos seguros</span>
            </li>
            <li>
              <strong>Navegación con React Router</strong>
              <span>Transiciones suaves entre páginas</span>
            </li>
            <li>
              <strong>Tema oscuro</strong>
              <span>Fácil para los ojos, estética moderna</span>
            </li>
            <li>
              <strong>Diseño responsivo</strong>
              <span>Funciona perfecto en todos los dispositivos</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
