import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Button, UserDropdown, AdventureList } from '../../components';
import { sendChatMessage } from '../../utils';
import { useAdventureStore } from '../../store';

// listado mock removido

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState<string>('');
  const { initializeAdventure, setConversationId, setThreadId } = useAdventureStore();

  const handleLogout = () => {
    logout();
  };

  const handleGenerateAdventure = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setResponse('');
    
    try {
      const convId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? (crypto as any).randomUUID()
          : `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      setConversationId(convId);

      const result = await sendChatMessage(`crear nuevo juego: ${prompt}`, convId);
      
      if (result.success) {
        setResponse(result.message);
        const maybePayload = result.payload;
        const maybeString = result.message;
        try {
          if (maybePayload && typeof maybePayload === 'object') {
            initializeAdventure(maybePayload);
          } else if (typeof maybeString === 'string') {
            const parsed = JSON.parse(maybeString);
            initializeAdventure(parsed);
          } else {
            throw new Error('Unsupported response format');
          }
        } catch (e) {
          console.error('Invalid adventure JSON from API:', e);
        }

        if (result.conversationId) setConversationId(result.conversationId);
        if (result.threadId) setThreadId(result.threadId);
      } else {
        setResponse('Error al generar la aventura. Intentá de nuevo.');
      }
    } catch (error) {
      console.error('Error generating adventure:', error);
      setResponse('Error al conectar con el servidor. Intentá de nuevo.');
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
            {response && (
              <div className="response-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                <div className="response-header">
                  <h3>Tu aventura generada:</h3>
                </div>
                <div className="response-content">
                  <p>{response}</p>
                </div>
                <div className="response-actions" style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  <Button
                    onClick={() => navigate('/chat')}
                    variant="primary"
                    className="start-adventure-button"
                  >
                    ¡Empezar aventura!
                  </Button>
                  <Button
                    onClick={() => {
                      setResponse('');
                      setPrompt('');
                    }}
                    variant="secondary"
                    className="new-adventure-button"
                  >
                    Crear otra aventura
                  </Button>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="loading-container">
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <p>Generando tu aventura...</p>
                </div>
              </div>
            )}
            
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
                  disabled={isGenerating}
                  className="send-button"
                  variant="primary"
                >
                  {isGenerating ? 'Generando...' : '¡Dale, creá el Zork!'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="features">
          <div>
            <h2>Mis Zorks 🧉</h2>
          </div>
          <AdventureList onSelectAdventure={() => navigate('/chat')} />
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
