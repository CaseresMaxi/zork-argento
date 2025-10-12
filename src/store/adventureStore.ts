import { create } from 'zustand';
import type { Adventure, AdventureStep, AdventureStateSnapshot, AdventureDocument } from '../types';
import { AdventureService } from '../utils/adventureService';

interface AdventureStore {
  currentAdventure: Adventure | null;
  currentAdventureId: string | null;
  currentUserId: string | null;
  conversationId: string | null;
  threadId: string | null;
  isLoading: boolean;
  error: string | null;
  isSavingAdventure: boolean;
  isSavingStep: boolean;
  initializeAdventure: (adventure: Adventure) => void;
  appendStep: (step: AdventureStep) => void;
  resetAdventure: () => void;
  setImageUrlForStep: (stepId: number, url: string) => void;
  saveAdventure: (userId: string) => Promise<void>;
  loadAdventure: (adventureId: string, userId: string) => Promise<void>;
  saveCurrentStep: () => Promise<void>;
  getUserAdventures: (userId: string) => Promise<AdventureDocument[]>;
  setConversationId: (id: string | null) => void;
  setThreadId: (id: string | null) => void;
}

export const useAdventureStore = create<AdventureStore>((set, get) => ({
  currentAdventure: null,
  currentAdventureId: null,
  currentUserId: null,
  conversationId: null,
  threadId: null,
  isLoading: false,
  error: null,
  isSavingAdventure: false,
  isSavingStep: false,
  initializeAdventure: (adventure) => {
    set({ 
      currentAdventure: adventure, 
      currentAdventureId: null, 
      currentUserId: null, 
      conversationId: adventure.conversationId || null,
      threadId: adventure.threadId || null,
      isLoading: false, 
      error: null 
    });
  },
  appendStep: (step) => {
    const state = get().currentAdventure;
    if (!state) return;
    const steps = [...state.steps, step];
    const { conversationId, threadId } = get();
    const updatedAdventure = { 
      ...state, 
      steps, 
      state: step.stateAfter,
      conversationId,
      threadId
    };
    set({ currentAdventure: updatedAdventure });
  },
  resetAdventure: () => {
    set({ currentAdventure: null, currentAdventureId: null, currentUserId: null, conversationId: null, threadId: null, isLoading: false, error: null });
  },
  setImageUrlForStep: (stepId, url) => {
    const state = get().currentAdventure;
    if (!state) return;
    const steps = state.steps.map((s) => (s.stepId === stepId ? { ...s, imageUrl: url } : s));
    set({ currentAdventure: { ...state, steps } });
  },
  saveAdventure: async (userId: string) => {
    const { currentAdventure, isSavingAdventure } = get();
    if (isSavingAdventure) return;
    if (!currentAdventure) {
      set({ error: 'No adventure to save' });
      return;
    }

    set({ isLoading: true, error: null, isSavingAdventure: true });
    try {
      const adventureId = await AdventureService.saveAdventure(currentAdventure, userId);
      set({ currentAdventureId: adventureId, currentUserId: userId, isLoading: false, isSavingAdventure: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to save adventure', isLoading: false, isSavingAdventure: false });
    }
  },
  loadAdventure: async (adventureId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const adventure = await AdventureService.getAdventure(adventureId, userId);
      if (adventure) {
        set({ 
          currentAdventure: adventure, 
          currentAdventureId: adventureId, 
          currentUserId: userId, 
          conversationId: adventure.conversationId || null,
          threadId: adventure.threadId || null,
          isLoading: false 
        });
      } else {
        set({ error: 'Adventure not found', isLoading: false });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load adventure', isLoading: false });
    }
  },
  saveCurrentStep: async () => {
    const { currentAdventure, currentAdventureId, currentUserId, conversationId, threadId, isSavingStep } = get();
    
    console.log('🔍 [saveCurrentStep] Attempting to save step:', {
      hasAdventure: !!currentAdventure,
      adventureId: currentAdventureId,
      userId: currentUserId,
      conversationId,
      threadId,
      stepsCount: currentAdventure?.steps?.length,
      isSavingStep
    });
    
    if (isSavingStep) {
      console.log('⏸️ [saveCurrentStep] Already saving, skipping...');
      return;
    }
    
    if (!currentAdventure || !currentAdventureId || !currentUserId) {
      console.warn('⚠️ [saveCurrentStep] Missing required data:', {
        hasAdventure: !!currentAdventure,
        hasAdventureId: !!currentAdventureId,
        hasUserId: !!currentUserId
      });
      return;
    }

    try {
      set({ isSavingStep: true });
      
      console.log('💾 [saveCurrentStep] Saving to Firebase:', {
        adventureId: currentAdventureId,
        userId: currentUserId,
        conversationId,
        threadId,
        steps: currentAdventure.steps.length,
        lastStep: currentAdventure.steps[currentAdventure.steps.length - 1]
      });
      
      await AdventureService.saveAdventureStep(
        currentAdventureId, 
        currentAdventure, 
        currentUserId,
        conversationId,
        threadId
      );
      
      console.log('✅ [saveCurrentStep] Successfully saved step to Firebase');
      set({ isSavingStep: false });
    } catch (error) {
      console.error('❌ [saveCurrentStep] Error saving step:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to save step', isSavingStep: false });
    }
  },
  getUserAdventures: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const adventures = await AdventureService.getUserAdventures(userId);
      set({ isLoading: false });
      return adventures;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to get adventures', isLoading: false });
      return [];
    }
  },
  setConversationId: (id) => {
    set({ conversationId: id });
    const { currentAdventure } = get();
    if (currentAdventure) {
      set({ currentAdventure: { ...currentAdventure, conversationId: id } });
    }
  },
  setThreadId: (id) => {
    set({ threadId: id });
    const { currentAdventure } = get();
    if (currentAdventure) {
      set({ currentAdventure: { ...currentAdventure, threadId: id } });
    }
  }
}));


