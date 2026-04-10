import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './error-boundary';
import { AppProvider, useAppStore } from '@/lib/store';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useVoiceCommands } from '@/lib/useVoiceCommands';
import VoiceCommandOverlay from '@/components/VoiceCommandOverlay';

// ─── Navigation guard ──────────────────────────────────────────────────────────
function NavigationGuard() {
  const { isAuthenticated, isOnboarded, isHydrated } = useAppStore();
  const segments = useSegments();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || !isHydrated) return;
    const inAuthGroup = segments[0] === 'auth';
    const atRoot = (segments as string[]).length === 0;

    if (!isOnboarded && !inAuthGroup) {
      router.replace('/auth/onboarding');
      return;
    }
    if (isOnboarded && !isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login');
      return;
    }
    if (isAuthenticated && (inAuthGroup || atRoot)) {
      router.replace('/(tabs)');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isHydrated, isAuthenticated, isOnboarded, segments[0]]);

  return null;
}

// ─── Voice layer ───────────────────────────────────────────────────────────────
function VoiceLayer() {
  const {
    voiceEnabled,
    toggleVoice,
    isDarkMode,
    toggleDarkMode,
    logout,
    isAuthenticated,
  } = useAppStore();
  const router = useRouter();

  const handleCommand = useCallback(
    (action: string, label: string) => {
      switch (action) {
        case 'nav:home':
          router.push('/(tabs)' as any);
          break;
        case 'nav:routines':
          router.push('/(tabs)/routines' as any);
          break;
        case 'nav:social':
          router.push('/(tabs)/social' as any);
          break;
        case 'nav:chat':
          router.push('/(tabs)/chat' as any);
          break;
        case 'nav:profile':
          router.push('/(tabs)/profile' as any);
          break;
        case 'nav:workout':
          router.push('/workout/session' as any);
          break;
        case 'theme:dark':
          if (!isDarkMode) toggleDarkMode();
          break;
        case 'theme:light':
          if (isDarkMode) toggleDarkMode();
          break;
        case 'auth:logout':
          if (isAuthenticated) {
            Alert.alert('Cerrar Sesion', `Comando de voz: "${label}". Salir?`, [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Salir',
                style: 'destructive',
                onPress: async () => {
                  await logout();
                  router.replace('/auth/login');
                },
              },
            ]);
          }
          break;
      }
    },
    [router, isDarkMode, toggleDarkMode, logout, isAuthenticated]
  );

  const voice = useVoiceCommands({
    enabled: voiceEnabled,
    lang: 'es-ES',
    onCommand: handleCommand,
  });

  if (!isAuthenticated) return null;

  return (
    <VoiceCommandOverlay
      status={voice.status}
      transcript={voice.transcript}
      lastCommand={voice.lastCommand}
      isSupported={voice.isSupported}
        onActivate={voice.activate}
    />
  );
}

// ─── Root inner ────────────────────────────────────────────────────────────────
function RootLayoutInner() {
  const { isDarkMode, theme } = useAppStore();

  const navTheme = isDarkMode
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background:   theme.bg.primary,
          card:         theme.bg.secondary,
          border:       theme.border.default,
          text:         theme.text.primary,
          primary:      theme.accent,
          notification: theme.accent,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background:   theme.bg.primary,
          card:         theme.bg.secondary,
          border:       theme.border.default,
          text:         theme.text.primary,
          primary:      theme.accent,
          notification: theme.accent,
        },
      };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
      <NavigationGuard />
      <VoiceLayer />
    </ThemeProvider>
  );
}

// ─── Root export ───────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <RootLayoutInner />
      </AppProvider>
    </ErrorBoundary>
  );
}
