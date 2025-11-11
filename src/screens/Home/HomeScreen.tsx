import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Button, UserDropdown, AdventureList } from '../../components';
import { sendChatMessage, buildAdventureGenerationPrompt } from '../../utils';
import { useAdventureStore } from '../../store';

// listado mock removido

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gameLength, setGameLength] = useState<"corta" | "media" | "larga" | null>(null);
  const [response, setResponse] = useState<string>('');
  const { initializeAdventure, setConversationId, setThreadId } = useAdventureStore();
  const [HasError, setHasError] = useState<boolean>(false);

  const handleLogout = () => {
    logout();
  };

  const generateUniqueId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 9);
    return `${timestamp}${randomPart}`;
  };

  const handleGenerateAdventure = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResponse('');
    
    try {
      const uniqueConversationId = generateUniqueId();
      setConversationId(uniqueConversationId);
      
      const adventurePrompt = buildAdventureGenerationPrompt(prompt.trim(),gameLength||undefined);
      
      const result = await sendChatMessage(adventurePrompt, uniqueConversationId);
      
      if (result.success) {
        const maybePayload = result.payload;
        const maybeString = result.message;
        
        try {
          let adventureData = null;
          
          if (maybePayload && typeof maybePayload === 'object') {
            adventureData = maybePayload;
          } else if (typeof maybeString === 'string') {
            adventureData = JSON.parse(maybeString);
          }
          
          if (adventureData && adventureData.steps && adventureData.steps.length > 0) {
            adventureData.conversationId = uniqueConversationId;
            
            if (result.threadId) {
              adventureData.threadId = result.threadId;
              setThreadId(result.threadId);
            }
            
            initializeAdventure(adventureData);
            setResponse(`¡Aventura "${adventureData.title || 'Sin título'}" creada! Hacé clic en "Empezar aventura" para comenzar.`);
          } else {
            throw new Error('Invalid adventure structure');
          }
        } catch (e) {
          console.error('Invalid adventure JSON from API:', e);
          setHasError(true);
          setResponse('Error al procesar la aventura generada. Intentá de nuevo.');
        }
      } else {
        setHasError(true);
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
                  {!HasError && <Button
                    onClick={() => navigate('/chat')}
                    variant="primary"
                    className="start-adventure-button"
                  >
                    ¡Empezar aventura!
                  </Button>}
                  <Button
                    onClick={() => {
                      setResponse('');
                      setPrompt('');
                      setHasError(false);
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
            
            { response === '' && <div className="chat-input-container">
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

                {/* 🔹 Selector de duración */}
                <div 
                    style={{ 
                        marginTop: "0.5rem", /* Margen superior para separarlo del textarea */
                        marginBottom: "0.25rem", /* Margen inferior para separarlo de los botones */
                        fontSize: "0.9rem", 
                        color: "#AAA" /* Color sutil */
                    }}
                >
                    Elegí la duración de tu partida:
                </div>
                <div className="duration-selector" style={{ marginTop: "0.25rem", display: "flex", gap: "0.25rem" }}>
                  {["corta", "media", "larga"].map((option) => (
                    <Button
                      key={option}
                      size='sm'
                      variant={gameLength === option ? "secondary" : "outline"}
                      onClick={() => setGameLength(option as "corta" | "media" | "larga")}
                      disabled={isGenerating}
                      className='duration-selector'
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={handleGenerateAdventure}
                  disabled={isGenerating}
                  className="send-button"
                  variant="primary"
                >
                  {isGenerating ? 'Generando...' : '¡Dale, creá el Zork!'}
                </Button>
              </div>
            </div>}
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
