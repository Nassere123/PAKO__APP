import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Credentials, AuthUser, UserRole } from '../types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_USERS: Record<UserRole, AuthUser> = {
  driver: {
    id: 'driver-1',
    phone: '+2250700000000',
    fullName: 'Livreur Plateau',
    role: 'driver',
  },
  agent: {
    id: 'agent-1',
    phone: '+2250500000000',
    fullName: 'Agent Treichville',
    role: 'agent',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async ({ role, phone, password, fullName }: Credentials) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockUser = MOCK_USERS[role];
      if (mockUser && mockUser.phone === phone && password.length >= 4) {
        setUser(mockUser);
        return;
      }

      if (fullName) {
        setUser({
          id: `${role}-${Date.now()}`,
          phone,
          fullName,
          role,
        });
        return;
      }

      throw new Error("Identifiants invalides. Vérifiez le numéro ou le mot de passe.");
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signOut,
    }),
    [loading, signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

