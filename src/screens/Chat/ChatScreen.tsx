import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Button, UserDropdown } from '../../components';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Bienvenido a Zork Argento! Estás parado en un campo abierto al oeste de una casa blanca, con una puerta principal cerrada. Hay un pequeño buzón aquí. ¿Qué querés hacer?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate game response
    setTimeout(() => {
      const gameResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateGameResponse(userMessage.content),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, gameResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1500);
  };

  const generateGameResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('norte') || input.includes('north')) {
      return 'Te dirigís hacia el norte. El sendero se vuelve más empinado y podés escuchar el sonido de agua corriendo a lo lejos.';
    }
    if (input.includes('sur') || input.includes('south')) {
      return 'Caminás hacia el sur. El terreno se vuelve más plano y ves una pequeña cabaña de madera en la distancia.';
    }
    if (input.includes('este') || input.includes('east')) {
      return 'Te movés hacia el este. Hay un bosque denso que bloquea tu camino, pero podés ver un sendero serpenteante entre los árboles.';
    }
    if (input.includes('oeste') || input.includes('west')) {
      return 'Vas hacia el oeste. Te acercás a la casa blanca. La puerta principal sigue cerrada, pero notás que hay una ventana entreabierta.';
    }
    if (input.includes('abrir') || input.includes('open')) {
      if (input.includes('puerta') || input.includes('door')) {
        return 'Intentás abrir la puerta principal, pero está cerrada con llave. Necesitás encontrar una forma de entrar.';
      }
      if (input.includes('buzón') || input.includes('mailbox')) {
        return 'Abrís el buzón y encontrás una carta amarillenta. Al leerla dice: "La llave está donde el sol nunca llega."';
      }
      return 'No podés abrir eso desde acá.';
    }
    if (input.includes('mirar') || input.includes('look') || input.includes('examinar')) {
      return 'Estás en un campo abierto rodeado de colinas suaves. Al oeste hay una casa blanca de dos pisos con una puerta principal de madera. Un pequeño buzón de metal está plantado cerca del sendero. El cielo está despejado y se siente una brisa fresca.';
    }
    if (input.includes('inventario') || input.includes('inventory')) {
      return 'Tu inventario está vacío. Vas a necesitar encontrar algunos objetos útiles para tu aventura.';
    }
    if (input.includes('ayuda') || input.includes('help')) {
      return 'Podés usar comandos como: mirar, ir [dirección], abrir [objeto], tomar [objeto], usar [objeto], inventario. ¡Explorá y usá tu imaginación!';
    }
    
    return `No entiendo qué querés hacer con "${userInput}". Probá con comandos como "mirar", "ir norte", "abrir puerta", o "ayuda" para más opciones.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleGoBack = () => {
    navigate('/home');
  };

  return (
    <div className="chat-screen">
      <header style={{margin: "1rem 2rem"}} className="home-header glass-effect">
        <div className="header-content">
          <div className="header-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={handleGoBack}
                className="back-button"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2.5rem',
                  cursor: 'pointer',
                  color: 'inherit',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ←
              </button>
              <div>
                <h1>🧉 Zork Argento</h1>
                <p>Aventura de texto interactiva</p>
              </div>
            </div>
          </div>
          <UserDropdown 
            userName={user?.name || 'Usuario'} 
            onLogout={handleLogout} 
          />
        </div>
      </header>

      <main className="chat-main">
        <div className="chat-container-full">
          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-wrapper ${message.isUser ? 'user-message-wrapper' : 'assistant-message-wrapper'}`}
              >
                <div className="message-content-wrapper">
                  <div className="message-avatar">
                    {message.isUser ? (
                      <span className="avatar-text">Vos</span>
                    ) : (
                      <span className="avatar-icon">🎮</span>
                    )}
                  </div>
                  <div className="message-bubble">
                    <div className="message-text">
                      {message.content}
                    </div>
                    <div className="message-timestamp">
                      {message.timestamp.toLocaleTimeString('es-AR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-wrapper assistant-message-wrapper">
                <div className="message-content-wrapper">
                  <div className="message-avatar">
                    <span className="avatar-icon">🎮</span>
                  </div>
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="typing-text">El juego está pensando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                ref={inputRef}
                className="chat-input-field"
                placeholder="Escribí tu comando... (ej: 'mirar alrededor', 'ir norte', 'abrir puerta')"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="send-button-chat"
                variant="primary"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m22 2-7 20-4-9-9-4z"/>
                  <path d="M22 2 11 13"/>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatScreen;
