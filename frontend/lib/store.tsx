import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from './types';

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  // Role
  activeRole: UserRole | null;
  // Offline
  isOffline: boolean;
  // Theme
  isDarkMode: boolean;
  // Voice
  voiceEnabled: boolean;
  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  setOnboarded: () => void;
  setRole: (role: UserRole) => void;
  toggleOffline: () => void;
  toggleDarkMode: () => void;
  toggleVoice: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const login = useCallback((u: User, t: string) => {
    setUser(u);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const setOnboarded = useCallback(() => setIsOnboarded(true), []);

  const setRole = useCallback(
    (role: UserRole) => {
      if (user) setUser({ ...user, role });
    },
    [user]
  );

  const toggleOffline = useCallback(() => setIsOffline((v) => !v), []);
  const toggleDarkMode = useCallback(() => setIsDarkMode((v) => !v), []);
  const toggleVoice = useCallback(() => setVoiceEnabled((v) => !v), []);

  const updateUser = useCallback(
    (data: Partial<User>) => {
      if (user) setUser({ ...user, ...data });
    },
    [user]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isOnboarded,
        activeRole: user?.role ?? null,
        isOffline,
        isDarkMode,
        voiceEnabled,
        login,
        logout,
        setOnboarded,
        setRole,
        toggleOffline,
        toggleDarkMode,
        toggleVoice,
        updateUser,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used inside AppProvider');
  return ctx;
}
