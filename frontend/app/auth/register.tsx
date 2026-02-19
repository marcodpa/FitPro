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
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { FakeAuthService } from '@/lib/services';
import type { UserRole } from '@/lib/types';

const ROLES: { label: string; value: UserRole; icon: string }[] = [
  { label: 'Usuario', value: 'user', icon: '🙋' },
  { label: 'Cliente', value: 'client', icon: '🏃' },
  { label: 'Entrenador', value: 'trainer', icon: '🏋️' },
];

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAppStore();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await FakeAuthService.register({ name, email, password, role });
      login(user, token);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View
          style={{
            backgroundColor: '#0d9e6e',
            paddingTop: 60,
            paddingBottom: 32,
            paddingHorizontal: 32,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}>
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-white/80 text-base">← Volver</Text>
          </TouchableOpacity>
          <Text className="text-white font-bold" style={{ fontSize: 28 }}>
            Crear Cuenta
          </Text>
          <Text className="text-white/80 text-sm mt-1">Únete a la comunidad FitPro</Text>
        </View>

        <View className="flex-1 px-8 pt-8">
          {/* Role selector */}
          <View className="mb-6">
            <Text className="text-muted-foreground text-sm mb-3 font-medium">Soy un...</Text>
            <View className="flex-row gap-3">
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  onPress={() => setRole(r.value)}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    backgroundColor: role === r.value ? '#0d9e6e' : '#f1f5f9',
                    borderWidth: 2,
                    borderColor: role === r.value ? '#0d9e6e' : 'transparent',
                  }}>
                  <Text style={{ fontSize: 24 }}>{r.icon}</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: role === r.value ? '#fff' : '#64748b',
                      marginTop: 4,
                    }}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Name */}
          <View className="mb-4">
            <Text className="text-muted-foreground text-sm mb-2 font-medium">Nombre completo</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              className="bg-secondary text-foreground px-4 py-4 rounded-2xl text-base"
              placeholderTextColor="#9ca3af"
            />
          </View>

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
          <View className="mb-8">
            <Text className="text-muted-foreground text-sm mb-2 font-medium">Contraseña</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
              className="bg-secondary text-foreground px-4 py-4 rounded-2xl text-base"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Register button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={{
              backgroundColor: '#0d9e6e',
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
              marginBottom: 16,
            }}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mb-10">
            <Text className="text-muted-foreground">¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary font-bold">Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
