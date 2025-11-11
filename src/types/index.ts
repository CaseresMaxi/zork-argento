import type { User as FirebaseUser } from 'firebase/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}

export type FirebaseAuthUser = FirebaseUser

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AdventureStats {
  salud: number;
  lucidez: number;
}

export interface AdventureStateSnapshot {
  location: string;
  inventory: string[];
  stats: AdventureStats;
  flags: Record<string, string | number | boolean>;
  objetivos: string[];
}

export interface AdventureStep {
  stepId: number;
  turnIndex: number;
  timestamp: string;
  playerInput: string | null;
  narrative: string;
  imagePrompt: string;
  imageSeed?: number;
  imageUrl?: string | null;
  imageBase64?: string | null;
  suggestedActions?: string[];

  stateAfter: AdventureStateSnapshot;
}

export interface Adventure {
  version: string;
  adventureId: string;
  title: string;
  genre: string;
  language: string;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
  seed?: number;
  state: AdventureStateSnapshot;
  juegoGanado: boolean;
  steps: AdventureStep[];
  conversationId?: string | null;
  threadId?: string | null;
  coverImageUrl?: string | null;
}

export interface AdventureDocument extends Adventure {
  id?: string;
}
