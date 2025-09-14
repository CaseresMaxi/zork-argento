import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { User, AuthState, LoginCredentials, SignupCredentials, AuthResult } from '../types';

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

  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      return { success: true };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<AuthResult> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
      return { success: true };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error.message || 'Signup failed' 
      };
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
