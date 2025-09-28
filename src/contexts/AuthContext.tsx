import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { User, AuthState, LoginCredentials, SignupCredentials, AuthResult } from '../types';
import { ValidationError } from 'yup';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  signup: (credentials: SignupCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
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
    } catch {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      const validationError = createValidationError('password', 'Che, esas credenciales no están bien. Fijate el email y la contraseña');
      
      throw validationError;
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<AuthResult> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
      return { success: true };
    } catch (error: unknown) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      // Map Firebase errors to Yup validation errors
      let validationError: ValidationError;
      
      switch ((error as { code?: string }).code) {
        case 'auth/email-already-in-use':
          validationError = createValidationError('email', 'Che, ya hay una cuenta con ese email');
          break;
        case 'auth/invalid-email':
          validationError = createValidationError('email', 'Ese email no parece válido, eh');
          break;
        case 'auth/weak-password':
          validationError = createValidationError('password', 'La contraseña está muy débil. Tiene que tener al menos 6 caracteres');
          break;
        case 'auth/operation-not-allowed':
          validationError = createValidationError('email', 'El registro con email no está habilitado');
          break;
        case 'auth/network-request-failed':
          validationError = createValidationError('email', 'Error de conexión. Fijate tu internet, che');
          break;
        default:
          validationError = createValidationError('email', 'Error al crear la cuenta. Probá de nuevo, dale');
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

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await sendPasswordResetEmail(auth, email);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error: unknown) {
      setAuthState(prev => ({ ...prev, isLoading: false }));

      let validationError: ValidationError;
      switch ((error as { code?: string }).code) {
        case 'auth/invalid-email':
          validationError = createValidationError('email', 'Ese email no parece válido, eh');
          break;
        case 'auth/user-not-found':
          validationError = createValidationError('email', 'Si existe, te mandamos un correo para resetear');
          break;
        case 'auth/too-many-requests':
          validationError = createValidationError('email', 'Demasiados intentos. Probá más tarde');
          break;
        case 'auth/network-request-failed':
          validationError = createValidationError('email', 'Error de conexión. Fijate tu internet, che');
          break;
        default:
          validationError = createValidationError('email', 'No pudimos enviar el correo. Probá de nuevo');
      }
      throw validationError;
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    resetPassword,
    loginWithGoogle: async (): Promise<AuthResult> => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: true };
      } catch (error: unknown) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        let validationError: ValidationError;
        switch ((error as { code?: string }).code) {
          case 'auth/popup-blocked':
            validationError = createValidationError('email', 'El popup fue bloqueado. Permitilo y probá de nuevo');
            break;
          case 'auth/popup-closed-by-user':
            validationError = createValidationError('email', 'Cerraste el popup. Intentá de nuevo');
            break;
          case 'auth/cancelled-popup-request':
            validationError = createValidationError('email', 'Se canceló el popup. Probá otra vez');
            break;
          case 'auth/network-request-failed':
            validationError = createValidationError('email', 'Error de conexión. Fijate tu internet, che');
            break;
          default:
            validationError = createValidationError('email', 'No pudimos iniciar con Google. Probá de nuevo');
        }
        throw validationError;
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
