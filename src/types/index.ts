import { User as FirebaseUser } from 'firebase/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}

export interface FirebaseAuthUser extends FirebaseUser {}

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
