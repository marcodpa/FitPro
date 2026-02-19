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
  StatusBar,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { FakeAuthService } from '@/lib/services';
import { COLORS } from '@/lib/theme';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  ChevronRight,
} from 'lucide-react-native';

const AC = COLORS.accent.DEFAULT;

export default function LoginScreen() {
  const [email, setEmail] = useState('alex@fitpro.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAppStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await FakeAuthService.login(email, password);
      login(user, token);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Acceso denegado', e.message ?? 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const DEMO_ACCOUNTS = [
    { label: 'Cliente', role: 'client', email: 'alex@fitpro.com', dot: AC },
    { label: 'Entrenador', role: 'trainer', email: 'carlos@fitpro.com', dot: COLORS.info },
    { label: 'Admin', role: 'admin', email: 'admin@fitpro.com', dot: COLORS.orange },
  ];

  const fieldStyle = (field: string) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: focused === field ? AC : COLORS.bg.border,
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: COLORS.bg.primary }}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* ── Header ─────────────────────────────────────── */}
        <View
          style={{
            paddingTop: 72,
            paddingBottom: 40,
            paddingHorizontal: 28,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.bg.border,
          }}>

          {/* Logo mark */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginBottom: 36,
            }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: COLORS.accent.dim,
                borderWidth: 1,
                borderColor: COLORS.accent.dimMid,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Zap size={20} color={AC} strokeWidth={2.2} />
            </View>
            <Text
              style={{
                color: COLORS.text.primary,
                fontSize: 18,
                fontWeight: '800',
                letterSpacing: -0.5,
              }}>
              FitPro
            </Text>
          </View>

          <Text
            style={{
              color: COLORS.text.primary,
              fontSize: 34,
              fontWeight: '800',
              letterSpacing: -1.2,
              lineHeight: 40,
              marginBottom: 10,
            }}>
            Bienvenido{'\n'}de vuelta
          </Text>
          <Text style={{ color: COLORS.text.secondary, fontSize: 15, lineHeight: 22 }}>
            Inicia sesión para continuar tu progreso
          </Text>
        </View>

        {/* ── Form ──────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 32, gap: 16 }}>
          {/* Email field */}
          <View>
            <Text
              style={{
                color: COLORS.text.secondary,
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 1,
                marginBottom: 8,
              }}>
              CORREO ELECTRÓNICO
            </Text>
            <View style={fieldStyle('email')}>
              <Mail
                size={17}
                color={focused === 'email' ? AC : COLORS.text.tertiary}
                strokeWidth={2}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholderTextColor={COLORS.text.tertiary}
                style={{
                  flex: 1,
                  color: COLORS.text.primary,
                  fontSize: 15,
                  fontWeight: '500',
                  padding: 0,
                }}
              />
            </View>
          </View>

          {/* Password field */}
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}>
              <Text
                style={{
                  color: COLORS.text.secondary,
                  fontSize: 12,
                  fontWeight: '700',
                  letterSpacing: 1,
                }}>
                CONTRASEÑA
              </Text>
              <Link href="/auth/forgot-password" asChild>
                <TouchableOpacity>
                  <Text style={{ color: AC, fontSize: 13, fontWeight: '600' }}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
            <View style={fieldStyle('password')}>
              <Lock
                size={17}
                color={focused === 'password' ? AC : COLORS.text.tertiary}
                strokeWidth={2}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPass}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholderTextColor={COLORS.text.tertiary}
                style={{
                  flex: 1,
                  color: COLORS.text.primary,
                  fontSize: 15,
                  fontWeight: '500',
                  padding: 0,
                }}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} activeOpacity={0.7}>
                {showPass ? (
                  <EyeOff size={17} color={COLORS.text.tertiary} strokeWidth={2} />
                ) : (
                  <Eye size={17} color={COLORS.text.tertiary} strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: loading ? COLORS.accent.dark : AC,
              borderRadius: 16,
              paddingVertical: 18,
              marginTop: 6,
            }}>
            {loading ? (
              <ActivityIndicator color={COLORS.text.inverse} />
            ) : (
              <>
                <Text
                  style={{
                    color: COLORS.text.inverse,
                    fontWeight: '800',
                    fontSize: 16,
                    letterSpacing: -0.3,
                  }}>
                  Iniciar Sesión
                </Text>
                <ArrowRight size={18} color={COLORS.text.inverse} strokeWidth={2.5} />
              </>
            )}
          </TouchableOpacity>

          {/* Register link */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
              marginTop: 4,
            }}>
            <Text style={{ color: COLORS.text.secondary, fontSize: 14 }}>
              ¿No tienes cuenta?
            </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text style={{ color: AC, fontSize: 14, fontWeight: '700' }}>
                  Regístrate
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Divider */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginTop: 12,
            }}>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.bg.border }} />
            <Text
              style={{
                color: COLORS.text.tertiary,
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 1.5,
              }}>
              ACCESO RÁPIDO
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.bg.border }} />
          </View>

          {/* Demo accounts */}
          <View
            style={{
              backgroundColor: COLORS.bg.secondary,
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: COLORS.bg.border,
              marginBottom: 40,
            }}>
            {DEMO_ACCOUNTS.map((a, i) => (
              <TouchableOpacity
                key={a.email}
                onPress={() => {
                  setEmail(a.email);
                  setPassword('123456');
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 18,
                  paddingVertical: 15,
                  borderBottomWidth: i < DEMO_ACCOUNTS.length - 1 ? 1 : 0,
                  borderBottomColor: COLORS.bg.border,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: a.dot,
                    }}
                  />
                  <View style={{ gap: 2 }}>
                    <Text
                      style={{
                        color: COLORS.text.primary,
                        fontWeight: '700',
                        fontSize: 14,
                      }}>
                      {a.label}
                    </Text>
                    <Text style={{ color: COLORS.text.tertiary, fontSize: 11 }}>
                      {a.email}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={15} color={COLORS.text.tertiary} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
