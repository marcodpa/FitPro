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
import { FakeAuthService } from '@/lib/services';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    if (!email) {
      Alert.alert('Error', 'Ingresa tu email');
      return;
    }
    setLoading(true);
    try {
      await FakeAuthService.forgotPassword(email);
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
            <Text className="text-muted-foreground text-center text-base mb-10">
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/auth/login')}
              style={{
                backgroundColor: '#0d9e6e',
                borderRadius: 16,
                paddingVertical: 18,
                paddingHorizontal: 40,
                alignItems: 'center',
              }}>
              <Text className="text-white font-bold text-base">Volver al Login</Text>
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
