import React, { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken } from '@/api/client';

type AuthContextValue = {
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // TODO(persistence): on mount, load a saved JWT from expo-secure-store so the
  // user stays logged in across restarts. Set isLoading=true while reading, then false.

  // Keep the axios Authorization header in sync with the current token.
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const signIn = (t: string) => setToken(t);
  const signOut = () => setToken(null);

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
