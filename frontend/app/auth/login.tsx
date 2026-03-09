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
import { useAppStore, useTheme } from '@/lib/store';
import { FakeAuthService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  ChevronRight,
  CheckSquare,
  Square,
} from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('alex@fitpro.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();
  const { login } = useAppStore();
  const t = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }
    if (!acceptedTerms) {
      Alert.alert('Términos y condiciones', 'Debes aceptar los términos y condiciones para continuar.');
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
    { label: 'Cliente',     role: 'client',  email: 'alex@fitpro.com',   dot: t.accent  },
    { label: 'Entrenador',  role: 'trainer', email: 'carlos@fitpro.com', dot: t.info    },
    { label: 'Admin',       role: 'admin',   email: 'admin@fitpro.com',  dot: t.orange  },
  ];

  const fieldStyle = (field: string) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: t.bg.input,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: focused === field ? t.accent : t.border.default,
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <StatusBar barStyle={t.isDark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ paddingTop: 72, paddingBottom: 40, paddingHorizontal: 28, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
          {/* Logo */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 36 }}>
            <View style={{ width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: t.accentDim, borderWidth: 1, borderColor: t.accent + '30', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color={t.accent} strokeWidth={2.2} />
            </View>
            <Text style={{ color: t.text.primary, fontSize: FONT.xl, fontWeight: '800', letterSpacing: -0.5 }}>FitPro</Text>
          </View>

          <Text style={{ color: t.text.primary, fontSize: 34, fontWeight: '800', letterSpacing: -1.2, lineHeight: 40, marginBottom: 10 }}>
            Bienvenido{'\n'}de vuelta
          </Text>
          <Text style={{ color: t.text.secondary, fontSize: FONT.md, lineHeight: 22 }}>
            Inicia sesion para continuar tu progreso
          </Text>
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: SPACING.xxl, paddingTop: SPACING.xxxl, gap: 16 }}>
          {/* Email */}
          <View>
            <Text style={{ color: t.text.secondary, fontSize: FONT.xs, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>
              CORREO ELECTRONICO
            </Text>
            <View style={fieldStyle('email')}>
              <Mail size={17} color={focused === 'email' ? t.accent : t.text.tertiary} strokeWidth={2} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholderTextColor={t.text.tertiary}
                style={{ flex: 1, color: t.text.primary, fontSize: FONT.md, fontWeight: '500', padding: 0 }}
              />
            </View>
          </View>

          {/* Password */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: t.text.secondary, fontSize: FONT.xs, fontWeight: '700', letterSpacing: 1 }}>CONTRASENA</Text>
              <Link href="/auth/forgot-password" asChild>
                <TouchableOpacity>
                  <Text style={{ color: t.accent, fontSize: FONT.sm, fontWeight: '600' }}>Olvide mi contrasena</Text>
                </TouchableOpacity>
              </Link>
            </View>
            <View style={fieldStyle('password')}>
              <Lock size={17} color={focused === 'password' ? t.accent : t.text.tertiary} strokeWidth={2} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPass}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholderTextColor={t.text.tertiary}
                style={{ flex: 1, color: t.text.primary, fontSize: FONT.md, fontWeight: '500', padding: 0 }}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} activeOpacity={0.7}>
                {showPass
                  ? <EyeOff size={17} color={t.text.tertiary} strokeWidth={2} />
                  : <Eye    size={17} color={t.text.tertiary} strokeWidth={2} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Términos y condiciones */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <TouchableOpacity onPress={() => setAcceptedTerms(!acceptedTerms)} activeOpacity={0.7}>
              {acceptedTerms
                ? <CheckSquare size={20} color={t.accent} strokeWidth={2} />
                : <Square size={20} color={t.text.tertiary} strokeWidth={2} />}
            </TouchableOpacity>
            <Text style={{ flex: 1, color: t.text.secondary, fontSize: FONT.sm, lineHeight: 22 }}>
              Acepto los{' '}
              <Text
                onPress={() => router.push('/auth/terms' as any)}
                style={{ color: t.accent, fontWeight: '700' }}>
                Términos y Condiciones
              </Text>
              {' '}y la{' '}
              <Text
                onPress={() => router.push('/auth/terms?type=privacy' as any)}
                style={{ color: t.accent, fontWeight: '700' }}>
                Política de Privacidad
              </Text>
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading || !acceptedTerms}
            activeOpacity={0.85}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: acceptedTerms ? t.accent : t.text.tertiary, borderRadius: RADIUS.lg, paddingVertical: 18, marginTop: 6, opacity: acceptedTerms ? 1 : 0.5 }}>
            {loading
              ? <ActivityIndicator color={t.accentText} />
              : <>
                  <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3 }}>Iniciar Sesion</Text>
                  <ArrowRight size={18} color={t.accentText} strokeWidth={2.5} />
                </>}
          </TouchableOpacity>

          {/* Register link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Text style={{ color: t.text.secondary, fontSize: FONT.base }}>No tienes cuenta?</Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text style={{ color: t.accent, fontSize: FONT.base, fontWeight: '700' }}>Registrate</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: t.border.default }} />
            <Text style={{ color: t.text.tertiary, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}>ACCESO RAPIDO</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: t.border.default }} />
          </View>

          {/* Demo accounts */}
          <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle, marginBottom: 40 }}>
            {DEMO_ACCOUNTS.map((a, i) => (
              <TouchableOpacity
                key={a.email}
                onPress={() => { setEmail(a.email); setPassword('123456'); }}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15, borderBottomWidth: i < DEMO_ACCOUNTS.length - 1 ? 1 : 0, borderBottomColor: t.border.subtle }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: a.dot }} />
                  <View style={{ gap: 2 }}>
                    <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>{a.label}</Text>
                    <Text style={{ color: t.text.tertiary, fontSize: 11 }}>{a.email}</Text>
                  </View>
                </View>
                <ChevronRight size={15} color={t.text.tertiary} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
