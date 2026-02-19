import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { ErrorBoundary } from './error-boundary';
import { AppProvider, useAppStore } from '@/lib/store';
import React, { useEffect, useState } from 'react';

function NavigationGuard() {
  const { isAuthenticated, isOnboarded } = useAppStore();
  const segments = useSegments();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Wait one tick after mount before navigating
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const inAuthGroup = segments[0] === 'auth';
    const atRoot = segments.length === 0;

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
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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
