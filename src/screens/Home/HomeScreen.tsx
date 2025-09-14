import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import { Button, UserDropdown } from '../../components';

const mockZorks = [
  {
    id: 1,
    title: "El Castillo Embrujado",
    description: "Una aventura en un castillo lleno de fantasmas y misterios"
  },
  {
    id: 2,
    title: "La Cueva del Dragón",
    description: "Explora una cueva profunda donde vive un dragón legendario"
  },
  {
    id: 3,
    title: "El Bosque Encantado",
    description: "Navega por un bosque mágico lleno de criaturas fantásticas"
  },
  {
    id: 4,
    title: "La Ciudad Perdida",
    description: "Descubre los secretos de una antigua civilización"
  },
  {
    id: 5,
    title: "La Torre del Mago",
    description: "Escala una torre mágica llena de hechizos y trampas"
  }
];

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
          <UserDropdown 
            userName={user?.name || 'Usuario'} 
            onLogout={handleLogout} 
          />
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
            {mockZorks.map((zork) => (
              <li key={zork.id}>
                <strong>{zork.title}</strong>
                <span>{zork.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
