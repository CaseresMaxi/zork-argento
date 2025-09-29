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
  initializeWithMock: () => void;
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

const buildInitialStateSnapshot = (): AdventureStateSnapshot => ({
  location: 'Entrada de la cripta',
  inventory: [],
  stats: { salud: 100, lucidez: 5 },
  flags: {},
  objetivos: ['Explorar la cripta']
});

const buildMockAdventure = (): Adventure => {
  const createdAt = new Date().toISOString();
  const stepTimestamp = createdAt;
  const state = buildInitialStateSnapshot();
  const firstStep: AdventureStep = {
    stepId: 0,
    turnIndex: 0,
    timestamp: stepTimestamp,
    playerInput: null,
    narrative: 'El aire huele a piedra húmeda. Ante ti, una escalera desciende a la oscuridad; a la izquierda, una puerta de hierro con relieves de luciérnagas palpita tenuemente. Se oye un goteo lejano. ¿Qué haces?',
    imagePrompt: 'moody underground crypt entrance, damp stone, flickering firefly motifs on iron door, candles, light fog, dramatic chiaroscuro, wide angle, high detail, dark fantasy art',
    imageSeed: 123456,
    imageUrl: null,
    suggestedActions: ['Encender una antorcha', 'Bajar por la escalera', 'Examinar la puerta', 'Escuchar con atención'],
    contextSummary: 'Ubicación: Entrada de la cripta. Inventario: ninguno. Objetivo: Explorar la cripta. Salud: 100, Lucidez: 5.',
    stateAfter: state
  };
  return {
    version: '1.0',
    adventureId: 'adv_mock_0001',
    title: 'La cripta de las luciérnagas',
    genre: 'fantasía oscura',
    language: 'es',
    createdAt,
    seed: 4211337,
    state,
    steps: [firstStep]
  };
};

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
  initializeWithMock: () => {
    const mock = buildMockAdventure();
    set({ currentAdventure: mock, currentAdventureId: null, currentUserId: null, conversationId: null, isLoading: false, error: null });
  },
  initializeAdventure: (adventure) => {
    set({ currentAdventure: adventure, currentAdventureId: null, currentUserId: null, isLoading: false, error: null });
  },
  appendStep: (step) => {
    const state = get().currentAdventure;
    if (!state) return;
    const steps = [...state.steps, step];
    const updatedAdventure = { ...state, steps, state: step.stateAfter };
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
        set({ currentAdventure: adventure, currentAdventureId: adventureId, currentUserId: userId, isLoading: false });
      } else {
        set({ error: 'Adventure not found', isLoading: false });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load adventure', isLoading: false });
    }
  },
  saveCurrentStep: async () => {
    const { currentAdventure, currentAdventureId, currentUserId, isSavingStep } = get();
    if (isSavingStep) return;
    if (!currentAdventure || !currentAdventureId || !currentUserId) {
      return;
    }

    try {
      set({ isSavingStep: true });
      await AdventureService.saveAdventureStep(currentAdventureId, currentAdventure, currentUserId);
      set({ isSavingStep: false });
    } catch (error) {
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
  setConversationId: (id) => set({ conversationId: id }),
  setThreadId: (id) => set({ threadId: id })
}));


