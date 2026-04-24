import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, UserRole } from './types';
import { getTheme, type Theme } from './theme';
import { TokenStorage } from './api';

const STORAGE_KEYS = {
  USER: '@fitpro:user',
  TOKEN: '@fitpro:token',
  ONBOARDED: '@fitpro:onboarded',
  DARK_MODE: '@fitpro:darkMode',
  VOICE: '@fitpro:voice',
};

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
  theme: Theme;
  // Voice
  voiceEnabled: boolean;
  // Hydration
  isHydrated: boolean;
  // Actions
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    const hydrate = async () => {
      try {
        const [storedUser, storedToken, storedOnboarded, storedDark, storedVoice] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.USER),
            AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
            AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
            AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE),
            AsyncStorage.getItem(STORAGE_KEYS.VOICE),
          ]);

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedToken) {
          setToken(storedToken);
          // Sincroniza con TokenStorage para que api.ts pueda leerlo
          await AsyncStorage.setItem('access_token', storedToken);
        }
        if (storedOnboarded === 'true') setIsOnboarded(true);
        if (storedDark !== null) setIsDarkMode(storedDark === 'true');
        if (storedVoice === 'true') setVoiceEnabled(true);
      } catch (_) {
        // ignore storage errors
      } finally {
        setIsHydrated(true);
      }
    };
    hydrate();
  }, []);

  const login = useCallback((u: User, t: string) => {
    setUser(u);
    setToken(t);
    AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
    AsyncStorage.setItem(STORAGE_KEYS.TOKEN, t);
    AsyncStorage.setItem('access_token', t);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      TokenStorage.clear(),
    ]);
  }, []);

  const setOnboarded = useCallback(() => {
    setIsOnboarded(true);
    AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
  }, []);

  const setRole = useCallback(
    (role: UserRole) => {
      if (user) {
        const updated = { ...user, role };
        setUser(updated);
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      }
    },
    [user]
  );

  const toggleOffline = useCallback(() => setIsOffline((v) => !v), []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((v) => {
      AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, String(!v));
      return !v;
    });
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((v) => {
      AsyncStorage.setItem(STORAGE_KEYS.VOICE, String(!v));
      return !v;
    });
  }, []);

  const updateUser = useCallback(
    (data: Partial<User>) => {
      if (user) {
        const updated = { ...user, ...data };
        setUser(updated);
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      }
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
        theme: getTheme(isDarkMode),
        voiceEnabled,
        isHydrated,
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

/** Shorthand hook — use when you only need theme tokens */
export function useTheme() {
  return useAppStore().theme;
}
