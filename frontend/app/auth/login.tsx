import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { FakeAuthService } from '@/lib/services';

export default function LoginScreen() {
  const [email, setEmail] = useState('alex@fitpro.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAppStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await FakeAuthService.login(email, password);
      login(user, token);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const DEMO_ACCOUNTS = [
    { label: 'Cliente', email: 'alex@fitpro.com' },
    { label: 'Entrenador', email: 'carlos@fitpro.com' },
    { label: 'Admin', email: 'admin@fitpro.com' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View
          style={{
            backgroundColor: '#0d9e6e',
            paddingTop: 80,
            paddingBottom: 48,
            paddingHorizontal: 32,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}>
          <Text style={{ fontSize: 48, marginBottom: 8 }}>💪</Text>
          <Text className="text-white font-bold" style={{ fontSize: 32 }}>
            FitPro
          </Text>
          <Text className="text-white/80 text-base mt-1">Tu plataforma fitness personal</Text>
        </View>

        <View className="flex-1 px-8 pt-10">
          <Text className="text-foreground font-bold text-2xl mb-8">Iniciar Sesión</Text>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-muted-foreground text-sm mb-2 font-medium">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-secondary text-foreground px-4 py-4 rounded-2xl text-base"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Password */}
          <View className="mb-2">
            <Text className="text-muted-foreground text-sm mb-2 font-medium">Contraseña</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              className="bg-secondary text-foreground px-4 py-4 rounded-2xl text-base"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Forgot */}
          <View className="items-end mb-8">
            <Link href="/auth/forgot-password" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-medium text-sm">¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Login button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: '#0d9e6e',
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
              marginBottom: 20,
            }}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Register */}
          <View className="flex-row justify-center mb-10">
            <Text className="text-muted-foreground">¿No tienes cuenta? </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-bold">Regístrate</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Demo accounts */}
          <View
            className="bg-secondary rounded-2xl p-4 mb-8"
            style={{ borderWidth: 1, borderColor: '#e2e8f0' }}>
            <Text className="text-muted-foreground text-xs font-medium mb-3 uppercase tracking-widest">
              Cuentas Demo
            </Text>
            {DEMO_ACCOUNTS.map((a) => (
              <TouchableOpacity
                key={a.email}
                onPress={() => setEmail(a.email)}
                className="flex-row justify-between items-center py-2">
                <Text className="text-foreground font-medium text-sm">{a.label}</Text>
                <Text className="text-muted-foreground text-xs">{a.email}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
