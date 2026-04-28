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
import { useAppStore, useTheme } from '@/lib/store';
import { AuthService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();
  const { login, setOnboarded } = useAppStore();
  const t = useTheme();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await AuthService.register(name, email, password, 'client');
      login(user, token);
      setOnboarded();
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
      style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View
          style={{
            backgroundColor: t.bg.secondary,
            paddingTop: 60,
            paddingBottom: SPACING.xxxl,
            paddingHorizontal: SPACING.xxxl,
            borderBottomWidth: 1,
            borderBottomColor: t.border.subtle,
          }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.xs,
              marginBottom: SPACING.lg,
            }}>
            <ArrowLeft size={18} color={t.text.secondary} />
            <Text style={{ color: t.text.secondary, fontSize: FONT.base }}>Volver</Text>
          </TouchableOpacity>

          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: RADIUS.full,
              backgroundColor: t.accentDim,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: SPACING.md,
            }}>
            <Text style={{ fontSize: 28 }}>💪</Text>
          </View>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xxxl }}>
            Crear Cuenta
          </Text>
          <Text style={{ color: t.text.secondary, fontSize: FONT.base, marginTop: 4 }}>
            Únete a la comunidad FitPro
          </Text>
        </View>

        <View style={{ flex: 1, paddingHorizontal: SPACING.xxxl, paddingTop: SPACING.xxl }}>
          {/* Name */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text
              style={{
                color: t.text.secondary,
                fontSize: FONT.sm,
                marginBottom: SPACING.xs,
                fontWeight: '600',
              }}>
              Nombre completo
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              style={{
                backgroundColor: t.bg.input,
                color: t.text.primary,
                paddingHorizontal: SPACING.lg,
                paddingVertical: SPACING.md + 2,
                borderRadius: RADIUS.lg,
                fontSize: FONT.base,
                borderWidth: 1.5,
                borderColor: focusedField === 'name' ? t.accent : t.border.default,
              }}
              placeholderTextColor={t.text.tertiary}
            />
          </View>

          {/* Email */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text
              style={{
                color: t.text.secondary,
                fontSize: FONT.sm,
                marginBottom: SPACING.xs,
                fontWeight: '600',
              }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              style={{
                backgroundColor: t.bg.input,
                color: t.text.primary,
                paddingHorizontal: SPACING.lg,
                paddingVertical: SPACING.md + 2,
                borderRadius: RADIUS.lg,
                fontSize: FONT.base,
                borderWidth: 1.5,
                borderColor: focusedField === 'email' ? t.accent : t.border.default,
              }}
              placeholderTextColor={t.text.tertiary}
            />
          </View>

          {/* Password */}
          <View style={{ marginBottom: SPACING.xxl }}>
            <Text
              style={{
                color: t.text.secondary,
                fontSize: FONT.sm,
                marginBottom: SPACING.xs,
                fontWeight: '600',
              }}>
              Contraseña
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: t.bg.input,
              borderRadius: RADIUS.lg,
              borderWidth: 1.5,
              borderColor: focusedField === 'password' ? t.accent : t.border.default,
              paddingHorizontal: SPACING.lg,
            }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={{
                  flex: 1,
                  color: t.text.primary,
                  paddingVertical: SPACING.md + 2,
                  fontSize: FONT.base,
                }}
                placeholderTextColor={t.text.tertiary}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(v => !v)}
                activeOpacity={0.7}
                style={{ padding: 4 }}>
                {showPassword
                  ? <EyeOff size={18} color={t.text.tertiary} strokeWidth={2} />
                  : <Eye    size={18} color={t.text.tertiary} strokeWidth={2} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Register button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={{
              backgroundColor: t.accent,
              borderRadius: RADIUS.xl,
              paddingVertical: SPACING.lg,
              alignItems: 'center',
              marginBottom: SPACING.md,
              opacity: loading ? 0.7 : 1,
            }}>
            {loading ? (
              <ActivityIndicator color={t.accentText} />
            ) : (
              <Text
                style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.base + 1 }}>
                Crear Cuenta
              </Text>
            )}
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 40,
            }}>
            <Text style={{ color: t.text.tertiary, fontSize: FONT.base }}>
              ¿Ya tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text
                style={{
                  color: t.accent,
                  fontWeight: '700',
                  fontSize: FONT.base,
                }}>
                Iniciar Sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
