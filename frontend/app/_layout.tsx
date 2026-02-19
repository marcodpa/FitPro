import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './error-boundary';
import { AppProvider, useAppStore } from '@/lib/store';
import React, { useEffect, useState } from 'react';

function NavigationGuard() {
  const { isAuthenticated, isOnboarded, isDarkMode } = useAppStore();
  const segments = useSegments();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
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
  }, [ready, isAuthenticated, isOnboarded, segments[0]]);

  return null;
}

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
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <RootLayoutInner />
      </AppProvider>
    </ErrorBoundary>
  );
}
