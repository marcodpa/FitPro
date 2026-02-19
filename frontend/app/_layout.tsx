import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { ErrorBoundary } from './error-boundary';
import { AppProvider, useAppStore } from '@/lib/store';
import React, { useEffect, useRef } from 'react';

function NavigationGuard() {
  const { isAuthenticated, isOnboarded } = useAppStore();
  const segments = useSegments();
  const router = useRouter();
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isOnboarded && segments[0] !== 'auth') {
      router.replace('/auth/onboarding');
      return;
    }

    if (isOnboarded && !isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login');
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isOnboarded, segments, isMounted.current]);

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
