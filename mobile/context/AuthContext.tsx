import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

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

  // On app start, restore any saved JWT so the user stays logged in across restarts.
  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY)
      .then((saved) => setToken(saved))
      .finally(() => setIsLoading(false));
  }, []);

  // Keep the axios Authorization header in sync with the current token.
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const signIn = (t: string) => {
    setToken(t);
    SecureStore.setItemAsync(TOKEN_KEY, t); // persist for next launch
  };

  const signOut = () => {
    setToken(null);
    SecureStore.deleteItemAsync(TOKEN_KEY);
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
