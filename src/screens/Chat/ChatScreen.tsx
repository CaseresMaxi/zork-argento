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
    appendStep, 
    saveAdventure, 
    saveCurrentStep,
    conversationId,
    setConversationId,
    threadId,
    setThreadId,
    resetAdventure,
    isLoading: adventureIsLoading
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
    if (adventureIsLoading) {
      console.log('⏳ [ChatScreen] Adventure is loading...');
      return;
    }
    
    if (!currentAdventure) {
      console.log('⚠️ [ChatScreen] No currentAdventure, navigating to home');
      navigate('/home');
    } else {
      const stepsWithImages = currentAdventure.steps?.filter(s => s.imageBase64) || [];
      console.log('📖 [ChatScreen] Adventure loaded:', {
        stepsCount: currentAdventure.steps?.length || 0,
        stepsWithImagesCount: stepsWithImages.length,
        adventureId: currentAdventureId,
        hasSteps: !!currentAdventure.steps,
        stepsArray: Array.isArray(currentAdventure.steps),
        stepsContent: currentAdventure.steps?.slice(0, 2)
      });
    }
  }, [currentAdventure, currentAdventureId, navigate, adventureIsLoading]);

  useEffect(() => {
    const saveNewAdventure = async () => {
      if (currentAdventure && !currentAdventureId && user?.id) {
        console.log('📝 [ChatScreen] Saving new adventure to Firebase...');
        await saveAdventure(user.id);
      }
    };
    saveNewAdventure();
  }, [currentAdventure, currentAdventureId, user?.id, saveAdventure]);


  useEffect(() => {
    scrollToBottom();
  }, [currentAdventure?.steps]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentAdventure) return;

    const playerText = inputValue.trim();
    const steps = currentAdventure.steps || [];
    const lastStep = steps[steps.length - 1];
    const nextStepId = lastStep ? lastStep.stepId + 1 : 0;
    const nextTurnIndex = lastStep ? lastStep.turnIndex + 1 : 0;

    setInputValue('');
    setIsLoading(true);

    try {
      const result = await sendChatMessage(
        playerText,
        conversationId || undefined,
        { stepId: nextStepId, turnIndex: nextTurnIndex },
        threadId || undefined,
        user?.id,
        currentAdventureId || undefined
      );

      if (result.success) {
        if (result.conversationId && !conversationId) {
          setConversationId(result.conversationId);
        }
        if (result.threadId && !threadId) {
          setThreadId(result.threadId);
        }

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

          if (stepToAppend && stepToAppend.narrative) {
            const safeStep = {
              stepId: typeof stepToAppend.stepId === 'number' ? stepToAppend.stepId : nextStepId,
              turnIndex: typeof stepToAppend.turnIndex === 'number' ? stepToAppend.turnIndex : nextTurnIndex,
              timestamp: typeof stepToAppend.timestamp === 'string' ? stepToAppend.timestamp : new Date().toISOString(),
              playerInput: typeof stepToAppend.playerInput === 'string' ? stepToAppend.playerInput : playerText,
              narrative: stepToAppend.narrative,
              imagePrompt: stepToAppend.imagePrompt ?? 'fantasy illustration, cinematic, high detail',
              imageSeed: stepToAppend.imageSeed ?? Math.floor(Math.random() * 1000000),
              imageUrl: result.imageUrl || stepToAppend.imageUrl || null,
              imageBase64: result.imageBase64 ?? null,
              suggestedActions: Array.isArray(stepToAppend.suggestedActions) ? stepToAppend.suggestedActions : [],
              stateAfter: stepToAppend.stateAfter ?? currentAdventure.state
            };
            
            appendStep(safeStep);
            
            console.log('🎯 [ChatScreen] Step appended, attempting to save...', {
              currentAdventureId,
              userId: user?.id,
              stepId: safeStep.stepId,
              totalSteps: currentAdventure.steps.length + 1,
              hasImageUrl: !!safeStep.imageUrl,
              hasImageBase64: !!safeStep.imageBase64
            });
            
            if (!currentAdventureId && user?.id) {
              console.log('⚠️ [ChatScreen] No adventureId yet, saving adventure first...');
              await saveAdventure(user.id);
              console.log('✅ [ChatScreen] Adventure saved');
            }
            
            if (currentAdventureId && user?.id) {
              await saveCurrentStep();
            } else if (!currentAdventureId && user?.id) {
              console.log('⚠️ [ChatScreen] Adventure was just created, steps already saved');
            } else {
              console.warn('⚠️ [ChatScreen] Could not save step - missing userId or adventureId');
            }
          } else {
            console.error('Invalid or missing narrative in step from API:', raw);
            const errorStep = {
              stepId: nextStepId,
              turnIndex: nextTurnIndex,
              timestamp: new Date().toISOString(),
              playerInput: playerText,
              narrative: 'Algo salió mal con la respuesta del servidor. Por favor, intentá de nuevo.',
              imagePrompt: 'error illustration',
              imageSeed: 0,
              imageUrl: null,
              imageBase64: null,
              suggestedActions: ['Intentar de nuevo'],
              stateAfter: currentAdventure.state
            };
            appendStep(errorStep);
            
            if (!currentAdventureId && user?.id) {
              await saveAdventure(user.id);
            }
            if (currentAdventureId && user?.id) {
              await saveCurrentStep();
            }
          }
        } catch (parseError) {
          console.error('Error parsing step JSON from API:', parseError, 'Raw response:', result.message);
          const errorStep = {
            stepId: nextStepId,
            turnIndex: nextTurnIndex,
            timestamp: new Date().toISOString(),
            playerInput: playerText,
            narrative: 'Error al procesar la respuesta. Por favor, intentá de nuevo.',
            imagePrompt: 'error illustration',
            imageSeed: 0,
            imageUrl: null,
            imageBase64: null,
            suggestedActions: ['Reintentar'],
            stateAfter: currentAdventure.state
          };
          appendStep(errorStep);
          
          if (!currentAdventureId && user?.id) {
            await saveAdventure(user.id);
          }
          if (user?.id) {
            await saveCurrentStep();
          }
        }
      } else {
        const errorStep = {
          stepId: nextStepId,
          turnIndex: nextTurnIndex,
          timestamp: new Date().toISOString(),
          playerInput: playerText,
          narrative: result.message || 'Error al conectar con el servidor. Intentá de nuevo.',
          imagePrompt: 'error illustration',
          imageSeed: 0,
          imageUrl: null,
          imageBase64: null,
          suggestedActions: [],
          stateAfter: currentAdventure.state
        };
        appendStep(errorStep);
        
        if (!currentAdventureId && user?.id) {
          await saveAdventure(user.id);
        }
        if (user?.id) {
          await saveCurrentStep();
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorStep = {
        stepId: nextStepId,
        turnIndex: nextTurnIndex,
        timestamp: new Date().toISOString(),
        playerInput: playerText,
        narrative: 'Error de conexión. Por favor, verificá tu conexión a internet e intentá de nuevo.',
        imagePrompt: 'error illustration',
        imageSeed: 0,
        imageUrl: null,
        imageBase64: null,
        suggestedActions: [],
        stateAfter: currentAdventure.state
      };
      appendStep(errorStep);
      
      if (!currentAdventureId && user?.id) {
        await saveAdventure(user.id);
      }
      if (user?.id) {
        await saveCurrentStep();
      }
    } finally {
      setIsLoading(false);
    }
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
    resetAdventure();
    navigate('/home');
  };

  // Detectar si el juego terminó
  const isGameFinished = Boolean(currentAdventure?.state?.flags?.juegoGanado);

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
            {adventureIsLoading ? (
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
                      <span className="typing-text">Cargando aventura...</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              (currentAdventure?.steps || [])
                .filter(step => step.narrative !== 'Error al conectar con el servidor. Intentá de nuevo.')
                .slice()
                .sort((a, b) => (a.stepId ?? 0) - (b.stepId ?? 0))
                .map((step, idx) => {
              const stepId = typeof step.stepId === 'number' ? step.stepId : idx;
              const turnIndex = typeof step.turnIndex === 'number' ? step.turnIndex : idx;
              
              return (
                <div key={`step-${stepId}-${turnIndex}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {step.playerInput && (
                    <div className="message-wrapper user-message-wrapper">
                      <div className="message-content-wrapper">
                        <div className="message-avatar">
                          <span className="avatar-text">Vos</span>
                        </div>
                        <div className="message-bubble">
                          <div className="message-text">
                            {step.playerInput}
                          </div>
                          <div className="message-timestamp">
                            {toValidDate(step.timestamp).toLocaleTimeString('es-AR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="message-wrapper assistant-message-wrapper">
                    <div className="message-content-wrapper">
                      <div className="message-avatar">
                        <span className="avatar-icon">🎮</span>
                      </div>
                      <div className="message-bubble">
                        {(step.imageUrl || step.imageBase64) && (
                          <div style={{ 
                            marginBottom: '1rem',
                            borderRadius: '0.5rem',
                            overflow: 'hidden',
                            width: '100%',
                            maxWidth: '512px'
                          }}>
                            <img 
                              src={step.imageUrl || `data:image/png;base64,${step.imageBase64}`}
                              alt="Scene illustration"
                              style={{ 
                                width: '100%', 
                                height: 'auto',
                                display: 'block'
                              }}
                            />
                          </div>
                        )}
                        <div className="message-text">
                          {step.narrative}
                        </div>
                        
                        {step.suggestedActions && step.suggestedActions.length > 0 && (
                          <div style={{ 
                            marginTop: '1rem', 
                            paddingTop: '1rem', 
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                          }}>
                            <div style={{ fontSize: '0.85rem', opacity: 0.7, fontWeight: 'bold' }}>
                              💡 Acciones sugeridas:
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: '0.5rem' 
                            }}>
                              {step.suggestedActions.map((action, actionIdx) => (
                                <button
                                  key={`action-${stepId}-${actionIdx}`}
                                  onClick={() => !isLoading && setInputValue(action)}
                                  disabled={isLoading}
                                  style={{
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.85rem',
                                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                                    border: '1px solid rgba(139, 92, 246, 0.4)',
                                    borderRadius: '1rem',
                                    color: 'inherit',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: isLoading ? 0.5 : 1
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isLoading) {
                                      e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.3)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                  }}
                                >
                                  {action}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {step.stateAfter && (
                          <div style={{ 
                            marginTop: '1rem', 
                            paddingTop: '1rem', 
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '0.8rem',
                            opacity: 0.6,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.3rem'
                          }}>
                            <div><strong>📍 Ubicación:</strong> {step.stateAfter.location}</div>
                            {step.stateAfter.inventory && step.stateAfter.inventory.length > 0 && (
                              <div><strong>🎒 Inventario:</strong> {step.stateAfter.inventory.join(', ')}</div>
                            )}
                            {/* <div>
                              <strong>❤️ Salud:</strong> {step.stateAfter.stats.salud} | 
                              <strong> 🧠 Lucidez:</strong> {step.stateAfter.stats.lucidez}
                            </div> */}
                          </div>
                        )}
                        
                        <div className="message-timestamp">
                          {toValidDate(step.timestamp).toLocaleTimeString('es-AR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
                })
            )}
            
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
            {isGameFinished && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'rgba(34,197,94,0.15)',
                  borderRadius: '1rem',
                  textAlign: 'center',
                  color: '#22c55e',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                🎉 ¡Felicitaciones! Has finalizado la aventura. <br />
                El juego ha terminado.
              </div>
            )}
            <div className="input-wrapper">
              <textarea
                ref={inputRef}
                className="chat-input-field"
                placeholder="Escribí tu comando... (ej: 'mirar alrededor', 'ir norte', 'abrir puerta')"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                disabled={isLoading || isGameFinished}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || isGameFinished}
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
