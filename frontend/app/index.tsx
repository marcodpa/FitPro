import { View, Text, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';

export default function SplashRedirect() {
  const { isAuthenticated, isOnboarded } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      if (!isOnboarded) {
        router.replace('/auth/onboarding');
      } else if (!isAuthenticated) {
        router.replace('/auth/login');
      } else {
        router.replace('/(tabs)');
      }
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <View
      style={{ flex: 1, backgroundColor: '#0d9e6e', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 72, marginBottom: 16 }}>💪</Text>
      <Text style={{ color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: -1 }}>
        FitPro
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: 8 }}>
        Tu plataforma fitness personal
      </Text>
      <ActivityIndicator color="rgba(255,255,255,0.6)" size="small" style={{ marginTop: 40 }} />
    </View>
  );
}
