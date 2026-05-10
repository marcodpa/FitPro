import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const router = useRouter();

  const handleSend = async () => {
    if (!email) {
      Alert.alert('Error', 'Ingresa tu email');
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ detail: string; uid?: string }>('/auth/forgot-password/', {
        method: 'POST',
        body: JSON.stringify({ email }),
        skipAuth: true,
      });
      if (res.uid) setUid(res.uid);
      setSent(true);
    } catch {
      Alert.alert('Error', 'No se pudo enviar el email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background">
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
          Recuperar Contraseña
        </Text>
        <Text className="text-white/80 text-sm mt-1">Te enviaremos un enlace de recuperación</Text>
      </View>

      <View className="flex-1 px-8 pt-10">
        {sent ? (
          <View className="items-center mt-12">
            <Text style={{ fontSize: 80, marginBottom: 20 }}>📬</Text>
            <Text className="text-foreground font-bold text-2xl text-center mb-3">
              Email Enviado
            </Text>
            <Text className="text-muted-foreground text-center text-base mb-8">
              Revisa tu bandeja de entrada. También puedes ingresar tu nueva contraseña directamente.
            </Text>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/auth/reset-password', params: { uid: uid ?? '' } } as any)}
              style={{
                backgroundColor: '#0d9e6e',
                borderRadius: 16,
                paddingVertical: 18,
                width: '100%',
                alignItems: 'center',
                marginBottom: 12,
              }}>
              <Text className="text-white font-bold text-base">Ingresar nueva contraseña</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.replace('/auth/login')}
              style={{ paddingVertical: 12, alignItems: 'center' }}>
              <Text className="text-muted-foreground text-base">Volver al Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text className="text-foreground font-bold text-xl mb-6">
              Ingresa tu email registrado
            </Text>
            <View className="mb-8">
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
            <TouchableOpacity
              onPress={handleSend}
              disabled={loading}
              style={{
                backgroundColor: '#0d9e6e',
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: 'center',
              }}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Enviar Enlace</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
