import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Button, UserDropdown } from '../../components';
import { useAdventureStore } from '../../store';
import { sendChatMessage } from '../../utils';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { 
    currentAdventure, 
    currentAdventureId, 
    initializeWithMock, 
    appendStep, 
    saveAdventure, 
    saveCurrentStep,
    conversationId,
    setConversationId,
    threadId,
    setThreadId 
  } = useAdventureStore();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const toValidDate = (value: unknown): Date => {
    const candidate = value ? new Date(value as any) : new Date();
    return isNaN(candidate.getTime()) ? new Date() : candidate;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!currentAdventure) initializeWithMock();
  }, [currentAdventure, initializeWithMock]);

  useEffect(() => {
    if (currentAdventure && !currentAdventureId && user?.id) {
      saveAdventure(user.id);
    }
  }, [currentAdventure, currentAdventureId, user?.id, saveAdventure]);

  useEffect(() => {
    if (currentAdventureId && currentAdventure && currentAdventure.steps.length > 1) {
      saveCurrentStep();
    }
  }, [currentAdventure, currentAdventureId, saveCurrentStep]);

  useEffect(() => {
    scrollToBottom();
  }, [currentAdventure?.steps]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const steps = currentAdventure?.steps || [];
    const last = steps[steps.length - 1];
    const nextStepId = last ? last.stepId + 1 : 0;
    const nextTurnIndex = last ? last.turnIndex + 1 : 0;
    const playerText = inputValue.trim();
    const narrativeText = generateGameResponse(playerText);
    const timestamp = new Date().toISOString();

    setInputValue('');
    setIsLoading(true);

    try {
      const result = await sendChatMessage(
        playerText,
        conversationId || undefined,
        { stepId: nextStepId, turnIndex: nextTurnIndex },
        threadId || undefined
      );

      if (result.success) {
        try {
          const raw = result.payload ?? (typeof result.message === 'string' ? JSON.parse(result.message) : result.message);
          let stepToAppend: any = null;
          if (raw && typeof raw === 'object') {
            if (Array.isArray((raw as any).steps)) {
              const arr = (raw as any).steps as any[];
              stepToAppend = arr[arr.length - 1] ?? null;
            } else if ('stepId' in (raw as any) || 'narrative' in (raw as any)) {
              stepToAppend = raw;
            }
          }

          if (stepToAppend) {
            const safeStep = {
              stepId: typeof stepToAppend.stepId === 'number' ? stepToAppend.stepId : nextStepId,
              turnIndex: typeof stepToAppend.turnIndex === 'number' ? stepToAppend.turnIndex : nextTurnIndex,
              timestamp: typeof stepToAppend.timestamp === 'string' ? stepToAppend.timestamp : timestamp,
              playerInput: typeof stepToAppend.playerInput === 'string' ? stepToAppend.playerInput : playerText,
              narrative: typeof stepToAppend.narrative === 'string' ? stepToAppend.narrative : narrativeText,
              imagePrompt: stepToAppend.imagePrompt ?? 'placeholder fantasy illustration, cinematic, high detail',
              imageUrl: stepToAppend.imageUrl ?? null,
              suggestedActions: Array.isArray(stepToAppend.suggestedActions) ? stepToAppend.suggestedActions : undefined,
              contextSummary: typeof stepToAppend.contextSummary === 'string' ? stepToAppend.contextSummary : undefined,
              stateAfter: stepToAppend.stateAfter ?? (currentAdventure ? currentAdventure.state : {
                location: 'Lugar desconocido',
                inventory: [],
                stats: { salud: 100, lucidez: 5 },
                flags: {},
                objetivos: []
              })
            };
            appendStep(safeStep);
            if (result.conversationId) setConversationId(result.conversationId);
            if (result.threadId) setThreadId(result.threadId);
          } else {
            appendStep({
              stepId: nextStepId,
              turnIndex: nextTurnIndex,
              timestamp,
              playerInput: playerText,
              narrative: narrativeText,
              imagePrompt: 'placeholder fantasy illustration, cinematic, high detail',
              imageUrl: null,
              stateAfter: currentAdventure ? currentAdventure.state : {
                location: 'Lugar desconocido',
                inventory: [],
                stats: { salud: 100, lucidez: 5 },
                flags: {},
                objetivos: []
              }
            });
          }
        } catch (e) {
          console.error('Invalid step JSON from API:', e);
          appendStep({
            stepId: nextStepId,
            turnIndex: nextTurnIndex,
            timestamp,
            playerInput: playerText,
            narrative: narrativeText,
            imagePrompt: 'placeholder fantasy illustration, cinematic, high detail',
            imageUrl: null,
            stateAfter: currentAdventure ? currentAdventure.state : {
              location: 'Lugar desconocido',
              inventory: [],
              stats: { salud: 100, lucidez: 5 },
              flags: {},
              objetivos: []
            }
          });
        }
      } else {
        appendStep({
          stepId: nextStepId,
          turnIndex: nextTurnIndex,
          timestamp,
          playerInput: playerText,
          narrative: narrativeText,
          imagePrompt: 'placeholder fantasy illustration, cinematic, high detail',
          imageUrl: null,
          stateAfter: currentAdventure ? currentAdventure.state : {
            location: 'Lugar desconocido',
            inventory: [],
            stats: { salud: 100, lucidez: 5 },
            flags: {},
            objetivos: []
          }
        });
      }
    } catch (err) {
      console.error('Error sending continuation:', err);
    } finally {
      setIsLoading(false);
    }
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
    setConversationId(null);
    setThreadId(null);
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
            {(currentAdventure?.steps || [])
              .slice()
              .sort((a, b) => (a.stepId ?? 0) - (b.stepId ?? 0))
              .flatMap((step, idx) => {
              const list: Message[] = [];
              if (step.playerInput) {
                list.push({
                  id: `u-${typeof step.stepId === 'number' ? step.stepId : idx}-${typeof step.turnIndex === 'number' ? step.turnIndex : 't'}`,
                  content: step.playerInput,
                  isUser: true,
                  timestamp: toValidDate(step.timestamp)
                });
              }
              list.push({
                id: `a-${typeof step.stepId === 'number' ? step.stepId : idx}-${typeof step.turnIndex === 'number' ? step.turnIndex : 't'}`,
                content: step.narrative,
                isUser: false,
                timestamp: toValidDate(step.timestamp)
              });
              return list;
            }).map((message) => (
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
