import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { User, AuthState, LoginCredentials, SignupCredentials, AuthResult } from '../types';
import { ValidationError } from 'yup';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  signup: (credentials: SignupCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  id: firebaseUser.uid,
  email: firebaseUser.email || '',
  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
  photoURL: firebaseUser.photoURL || undefined
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setAuthState({
          user: mapFirebaseUser(firebaseUser),
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const createValidationError = (field: string, message: string): ValidationError => {
    const error = new ValidationError(message);
    error.path = field;
    return error;
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      return { success: true };
    } catch (error: unknown) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      const validationError = createValidationError('password', 'Credenciales incorrectas. Verifica tu email y contraseña');
      
      throw validationError;
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<AuthResult> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
      return { success: true };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      // Map Firebase errors to Yup validation errors
      let validationError: ValidationError;
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          validationError = createValidationError('email', 'Ya existe una cuenta con este correo electrónico');
          break;
        case 'auth/invalid-email':
          validationError = createValidationError('email', 'El correo electrónico no es válido');
          break;
        case 'auth/weak-password':
          validationError = createValidationError('password', 'La contraseña es muy débil. Debe tener al menos 6 caracteres');
          break;
        case 'auth/operation-not-allowed':
          validationError = createValidationError('email', 'El registro con email no está habilitado');
          break;
        case 'auth/network-request-failed':
          validationError = createValidationError('email', 'Error de conexión. Verifica tu internet');
          break;
        default:
          validationError = createValidationError('email', 'Error al crear la cuenta. Intenta de nuevo');
      }
      
      throw validationError;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
