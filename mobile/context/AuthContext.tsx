import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { setAuthToken } from '@/api/client';

const TOKEN_KEY = 'auth_token';

type AuthContextValue = {
  token: string | null;
  isLoading: boolean; // true while we read the saved token on startup
  signIn: (token: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        let saved = null;
        if (Platform.OS !== 'web') {
          saved = await SecureStore.getItemAsync(TOKEN_KEY);
        } else {
          saved = localStorage.getItem(TOKEN_KEY);
        }
        setToken(saved);
      } catch (e) {
        console.error("Token load error", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  // Keep the axios Authorization header in sync with the current token.
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Keep the axios Authorization header in sync with the current token.
  useEffect(() => {
    const loadToken = async () => {
      try {
        let saved = null;
        if (Platform.OS !== 'web') {
          saved = await SecureStore.getItemAsync(TOKEN_KEY);
        } else {
          saved = localStorage.getItem(TOKEN_KEY);
        }
        setToken(saved);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);
  
  // 2. Updated: Persist token based on platform
  const signIn = (t: string) => {
    setToken(t);
    if (Platform.OS !== 'web') {
      SecureStore.setItemAsync(TOKEN_KEY, t);
    } else {
      localStorage.setItem(TOKEN_KEY, t);
    }
  };
  
  // 3. Updated: Remove token based on platform
  const signOut = () => {
    setToken(null);
    if (Platform.OS !== 'web') {
      SecureStore.deleteItemAsync(TOKEN_KEY);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
