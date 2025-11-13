import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, UserDropdown } from '../../components';
import { useAuth } from '../../hooks';
import { useAdventureStore } from '../../store';
import { generateImageForChatStep, generateAudioForStep, sendChatMessage } from '../../utils';
//import { motion, AnimatePresence } from "framer-motion";

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
    isLoading: adventureIsLoading,
    updateStep,
    isSavingStep
  } = useAdventureStore();
  const [inputValue, setInputValue] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [audioStates, setAudioStates] = useState<{[key: number]: { isLoading: boolean; isPlaying: boolean; audioUrl?: string }}>({});
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
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
      setImageErrors(new Set());
      setAudioStates({});
    } else {
      const stepsWithImages = currentAdventure.steps?.filter(s => s.imageBase64) || [];
      const stepsWithAudio = currentAdventure.steps?.filter(s => s.audioUrl) || [];

      console.log('📖 [ChatScreen] Adventure loaded:', {
        stepsCount: currentAdventure.steps?.length || 0,
        stepsWithImagesCount: stepsWithImages.length,
        stepsWithAudioCount: stepsWithAudio.length,
        adventureId: currentAdventureId,
        hasSteps: !!currentAdventure.steps,
        stepsArray: Array.isArray(currentAdventure.steps),
        stepsContent: currentAdventure.steps?.slice(0, 2),
        juegoGanado: currentAdventure.juegoGanado
      });

      setImageErrors(new Set());

      // Initialize audio states for existing audio URLs
      const initialAudioStates: {[key: number]: { isLoading: boolean; isPlaying: boolean; audioUrl?: string }} = {};
      currentAdventure.steps?.forEach(step => {
        if (step.audioUrl) {
          initialAudioStates[step.stepId] = {
            isLoading: false,
            isPlaying: false,
            audioUrl: step.audioUrl
          };
        }
      });
      setAudioStates(initialAudioStates);
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
  }, [currentAdventure?.steps, isLoadingImage]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoadingChat || !currentAdventure) return;

    const playerText = inputValue.trim();
    const steps = currentAdventure.steps || [];
    const lastStep = steps[steps.length - 1];
    const nextStepId = lastStep ? lastStep.stepId + 1 : 0;
    const nextTurnIndex = lastStep ? lastStep.turnIndex + 1 : 0;

    setInputValue('');
    setIsLoadingChat(true);

    try {
      const result = await sendChatMessage(
        playerText,
        conversationId || undefined,
        { stepId: nextStepId, turnIndex: nextTurnIndex },
        threadId || undefined
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
          // Detectar si el juego terminó
          currentAdventure.juegoGanado = Boolean(raw?.juegoGanado);

          if (stepToAppend && stepToAppend.narrative) {
            const finalStepId = typeof stepToAppend.stepId === 'number' ? stepToAppend.stepId : nextStepId;
            const imagePrompt = stepToAppend.imagePrompt ?? 'fantasy illustration, cinematic, high detail';
            
            const safeStep = {
              stepId: finalStepId,
              turnIndex: typeof stepToAppend.turnIndex === 'number' ? stepToAppend.turnIndex : nextTurnIndex,
              timestamp: typeof stepToAppend.timestamp === 'string' ? stepToAppend.timestamp : new Date().toISOString(),
              playerInput: typeof stepToAppend.playerInput === 'string' ? stepToAppend.playerInput : playerText,
              narrative: stepToAppend.narrative,
              imagePrompt: imagePrompt,
              imageSeed: stepToAppend.imageSeed ?? Math.floor(Math.random() * 1000000),
              imageUrl: null,
              imageBase64: null,
              suggestedActions: Array.isArray(stepToAppend.suggestedActions) ? stepToAppend.suggestedActions : [],
              stateAfter: stepToAppend.stateAfter ?? currentAdventure.state
            };
            
            appendStep(safeStep);
            setCurrentStepId(finalStepId);
            
            console.log('🎯 [ChatScreen] Step appended, attempting to save...', {
              currentAdventureId,
              userId: user?.id,
              stepId: safeStep.stepId,
              totalSteps: currentAdventure.steps.length + 1
            });
            
            if (!currentAdventureId && user?.id) {
              console.log('⚠️ [ChatScreen] No adventureId yet, saving adventure first...');
              await saveAdventure(user.id);
              console.log('✅ [ChatScreen] Adventure saved');
            }
            
            const updatedAdventureId = useAdventureStore.getState().currentAdventureId || currentAdventureId;
            
            if (updatedAdventureId && user?.id) {
              await saveCurrentStep();
            } else if (!updatedAdventureId && user?.id) {
              console.log('⚠️ [ChatScreen] Adventure was just created, steps already saved');
            } else {
              console.warn('⚠️ [ChatScreen] Could not save step - missing userId or adventureId');
            }
            
            setIsLoadingChat(false);
            
            if (imagePrompt && stepToAppend.narrative) {
              setIsLoadingImage(true);
              try {
                const imageResult = await generateImageForChatStep(
                  stepToAppend.narrative,
                  imagePrompt,
                  finalStepId,
                  user?.id,
                  updatedAdventureId || undefined
                );
                
                if (imageResult.imageBase64 || imageResult.imageUrl) {
                  updateStep(finalStepId, {
                    imageBase64: imageResult.imageBase64 || null,
                    imageUrl: imageResult.imageUrl || null
                  });
                  
                  setImageErrors(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(finalStepId);
                    return newSet;
                  });
                  
                  const finalAdventureId = useAdventureStore.getState().currentAdventureId;
                  if (finalAdventureId && user?.id) {
                    await saveCurrentStep();
                  }
                } else {
                  setImageErrors(prev => new Set(prev).add(finalStepId));
                }
              } catch (imageError) {
                console.error('Error generating image:', imageError);
                setImageErrors(prev => new Set(prev).add(finalStepId));
              } finally {
                setIsLoadingImage(false);
                setCurrentStepId(null);
              }
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
            setIsLoadingChat(false);
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
          setIsLoadingChat(false);
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
        setIsLoadingChat(false);
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
      setIsLoadingChat(false);
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

  const handleRetryImage = async (stepId: number) => {
    if (!currentAdventure || isLoadingImage) return;

    const step = currentAdventure.steps?.find(s => s.stepId === stepId);
    if (!step || !step.imagePrompt || !step.narrative) return;

    setIsLoadingImage(true);
    setCurrentStepId(stepId);

    try {
      const updatedAdventureId = useAdventureStore.getState().currentAdventureId || currentAdventureId;
      const imageResult = await generateImageForChatStep(
        step.narrative,
        step.imagePrompt,
        stepId,
        user?.id,
        updatedAdventureId || undefined
      );

      if (imageResult.imageBase64 || imageResult.imageUrl) {
        updateStep(stepId, {
          imageBase64: imageResult.imageBase64 || null,
          imageUrl: imageResult.imageUrl || null
        });

        setImageErrors(prev => {
          const newSet = new Set(prev);
          newSet.delete(stepId);
          return newSet;
        });

        if (updatedAdventureId && user?.id) {
          await saveCurrentStep();
        }
      } else {
        setImageErrors(prev => new Set(prev).add(stepId));
      }
    } catch (imageError) {
      console.error('Error regenerating image:', imageError);
      setImageErrors(prev => new Set(prev).add(stepId));
    } finally {
      setIsLoadingImage(false);
      setCurrentStepId(null);
    }
  };

  const handleGenerateAudio = async (stepId: number, narrative: string) => {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);

      // Find and stop the currently playing audio
      const currentlyPlayingStepId = Object.keys(audioStates).find(key =>
        audioStates[parseInt(key)]?.isPlaying
      );

      if (currentlyPlayingStepId) {
        setAudioStates(prev => ({
          ...prev,
          [parseInt(currentlyPlayingStepId)]: {
            ...prev[parseInt(currentlyPlayingStepId)],
            isPlaying: false
          }
        }));
      }
    }

    // Set loading state
    setAudioStates(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], isLoading: true, isPlaying: false }
    }));

    try {
      const updatedAdventureId = useAdventureStore.getState().currentAdventureId || currentAdventureId;
      const audioUrl = await generateAudioForStep(
        narrative,
        user?.id,
        updatedAdventureId || undefined,
        stepId
      );

      if (audioUrl) {
        setAudioStates(prev => ({
          ...prev,
          [stepId]: { isLoading: false, isPlaying: true, audioUrl }
        }));

        // Save audio URL to the step if it was uploaded to Firebase Storage
        if (audioUrl.includes('firebasestorage')) {
          updateStep(stepId, { audioUrl });
          if (currentAdventureId && user?.id) {
            saveCurrentStep();
          }
        }

        // Create and play audio
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);

        audio.onended = () => {
          setAudioStates(prev => ({
            ...prev,
            [stepId]: { ...prev[stepId], isPlaying: false }
          }));
          setCurrentAudio(null);
        };

        audio.onerror = () => {
          setAudioStates(prev => ({
            ...prev,
            [stepId]: { isLoading: false, isPlaying: false }
          }));
          setCurrentAudio(null);
        };

        await audio.play();
      } else {
        setAudioStates(prev => ({
          ...prev,
          [stepId]: { isLoading: false, isPlaying: false }
        }));
      }
    } catch (error) {
      console.error('Error generating or playing audio:', error);
      setAudioStates(prev => ({
        ...prev,
        [stepId]: { isLoading: false, isPlaying: false }
      }));
    }
  };

  const handleToggleAudio = async (stepId: number, narrative: string) => {
    const currentState = audioStates[stepId];
    const step = currentAdventure?.steps?.find(s => s.stepId === stepId);

    // Check if step has saved audioUrl from Firebase
    if (step?.audioUrl && !currentState?.audioUrl) {
      setAudioStates(prev => ({
        ...prev,
        [stepId]: { isLoading: false, isPlaying: false, audioUrl: step.audioUrl || undefined }
      }));
    }

    const updatedState = audioStates[stepId] || currentState;

    if (updatedState?.isPlaying) {
      // Stop current audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
      }
      setAudioStates(prev => ({
        ...prev,
        [stepId]: { ...prev[stepId], isPlaying: false }
      }));
    } else if (updatedState?.audioUrl) {
      // Play existing audio
      const audio = new Audio(updatedState.audioUrl);
      setCurrentAudio(audio);
      setAudioStates(prev => ({
        ...prev,
        [stepId]: { ...prev[stepId], isPlaying: true }
      }));

      audio.onended = () => {
        setAudioStates(prev => ({
          ...prev,
          [stepId]: { ...prev[stepId], isPlaying: false }
        }));
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        setAudioStates(prev => ({
          ...prev,
          [stepId]: { isLoading: false, isPlaying: false }
        }));
        setCurrentAudio(null);
      };

      await audio.play();
    } else {
      // Generate new audio
      await handleGenerateAudio(stepId, narrative);
    }
  };

  // Detectar si el juego terminó
  const isGameFinished = Boolean(currentAdventure?.juegoGanado);


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
                        {(step.imageUrl || step.imageBase64) ? (
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
                        ) : (isLoadingImage && currentStepId === stepId) ? (
                          <div style={{ 
                            marginBottom: '1rem',
                            borderRadius: '0.5rem',
                            overflow: 'hidden',
                            width: '100%',
                            maxWidth: '512px',
                            minHeight: '200px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '2px dashed rgba(139, 92, 246, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            padding: '2rem'
                          }}>
                            <div className="image-loading-spinner"></div>
                            <span className="image-loading-text">Generando imagen...</span>
                          </div>
                        ) : (imageErrors.has(stepId) && step.imagePrompt) ? (
                          <div 
                            onClick={() => handleRetryImage(stepId)}
                            style={{ 
                              marginBottom: '1rem',
                              borderRadius: '0.5rem',
                              overflow: 'hidden',
                              width: '100%',
                              maxWidth: '512px',
                              minHeight: '200px',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '2px dashed rgba(239, 68, 68, 0.3)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '1rem',
                              padding: '2rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                            }}
                            className="image-error-placeholder"
                          >
                            <div style={{ fontSize: '2rem' }}>🖼️</div>
                            <span style={{ 
                              fontSize: '0.875rem',
                              color: 'rgba(239, 68, 68, 0.9)',
                              fontWeight: 500,
                              textAlign: 'center'
                            }}>
                              Error al generar imagen
                            </span>
                            <span style={{ 
                              fontSize: '0.75rem',
                              color: 'rgba(239, 68, 68, 0.7)',
                              textAlign: 'center'
                            }}>
                              Click para intentar de nuevo
                            </span>
                          </div>
                        ) : null}
                        <div className="message-text">
                          {step.narrative}
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginTop: '0.5rem'
                        }}>
                          <button
                            onClick={() => handleToggleAudio(step.stepId, step.narrative)}
                            disabled={audioStates[step.stepId]?.isLoading}
                            style={{
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.85rem',
                              backgroundColor: audioStates[step.stepId]?.isPlaying
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(139, 92, 246, 0.2)',
                              border: audioStates[step.stepId]?.isPlaying
                                ? '1px solid rgba(239, 68, 68, 0.4)'
                                : '1px solid rgba(139, 92, 246, 0.4)',
                              borderRadius: '1rem',
                              color: 'inherit',
                              cursor: audioStates[step.stepId]?.isLoading ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',
                              opacity: audioStates[step.stepId]?.isLoading ? 0.5 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                            onMouseEnter={(e) => {
                              if (!audioStates[step.stepId]?.isLoading) {
                                const isPlaying = audioStates[step.stepId]?.isPlaying;
                                e.currentTarget.style.backgroundColor = isPlaying
                                  ? 'rgba(239, 68, 68, 0.3)'
                                  : 'rgba(139, 92, 246, 0.3)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              const isPlaying = audioStates[step.stepId]?.isPlaying;
                              e.currentTarget.style.backgroundColor = isPlaying
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(139, 92, 246, 0.2)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            {audioStates[step.stepId]?.isLoading ? (
                              <>
                                <div style={{
                                  width: '12px',
                                  height: '12px',
                                  border: '2px solid currentColor',
                                  borderTop: '2px solid transparent',
                                  borderRadius: '50%',
                                  animation: 'spin 1s linear infinite'
                                }}></div>
                                Generando...
                              </>
                            ) : audioStates[step.stepId]?.isPlaying ? (
                              <>
                                <span>⏸️</span>
                                Pausar
                              </>
                            ) : audioStates[step.stepId]?.audioUrl ? (
                              <>
                                <span>▶️</span>
                                Reproducir
                              </>
                            ) : (
                              <>
                                <span>🔊</span>
                                Escuchar
                              </>
                            )}
                          </button>
                        </div>
                        
                        {!isGameFinished && step.suggestedActions && step.suggestedActions.length > 0 && (
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
                                  onClick={() => !isLoadingChat && setInputValue(action)}
                                  disabled={isLoadingChat}
                                  style={{
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.85rem',
                                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                                    border: '1px solid rgba(139, 92, 246, 0.4)',
                                    borderRadius: '1rem',
                                    color: 'inherit',
                                    cursor: isLoadingChat ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: isLoadingChat ? 0.5 : 1
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isLoadingChat) {
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
                              flexDirection: 'row', // <-- CAMBIO CLAVE: Los dos grupos irán en una fila
                              justifyContent: 'space-between', // <-- CAMBIO CLAVE: Separa los grupos
                              gap: '1rem', // Opcional: espacio entre los dos grandes grupos
                              flexWrap: 'wrap' // Asegura que se ajusten en pantallas pequeñas si fuera necesario
                              }}>
                              
                              {/* === GRUPO IZQUIERDA (Ubicación & Inventario) === */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                  <div><strong>📍 Ubicación:</strong> {step.stateAfter.location}</div>
                                  
                                  {step.stateAfter.inventory.length > 0 && (
                                      <div><strong>🎒 Inventario:</strong> {step.stateAfter.inventory.join(', ')}</div>
                                  )}
                              </div>
                              
                              {/* === GRUPO DERECHA (Salud & Lucidez) === */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', textAlign: 'right' }}>
                                  {/* Opcional: Puedes usar textAlign: 'right' para alinear el texto de la derecha */}
                                  <div><strong>❤️ Salud:</strong> {step.stateAfter.stats.salud}</div>
                                  <div><strong>🧠 Lucidez:</strong> {step.stateAfter.stats.lucidez}</div>
                              </div>

                          </div>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              );
                })
            )}
            
            {isLoadingChat && (
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
        

          {isSavingStep && (
            <div className="saving-step-indicator">
              <div className="saving-step-content">
                <div className="saving-step-spinner"></div>
                <span className="saving-step-text">Guardando paso...</span>
              </div>
            </div>
          )}

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
          {!isGameFinished && <div className="input-container">            
            <div className="input-wrapper">
              <textarea
                ref={inputRef}
                className="chat-input-field"
                placeholder="Escribí tu comando... (ej: 'mirar alrededor', 'ir norte', 'abrir puerta')"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                disabled={isLoadingChat || isGameFinished}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoadingChat || isGameFinished}
                className="send-button-chat"
                variant="primary"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m22 2-7 20-4-9-9-4z"/>
                  <path d="M22 2 11 13"/>
                </svg>
              </Button>
            </div>
          </div>}
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
                El juego ha terminado. 🎉
              </div>
            )}
        </div>
          </div>
      </main>
    </div>
  );
};

export default ChatScreen;
