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
import { Mail, Lock, Eye, EyeOff, ArrowRight, Dumbbell } from 'lucide-react-native';

const EM = '#10b981';

export default function LoginScreen() {
  const [email, setEmail] = useState('alex@fitpro.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAppStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await FakeAuthService.login(email, password);
      login(user, token);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error al ingresar', e.message ?? 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const DEMO_ACCOUNTS = [
    { label: 'Cliente', email: 'alex@fitpro.com', color: EM },
    { label: 'Entrenador', email: 'carlos@fitpro.com', color: '#818cf8' },
    { label: 'Admin', email: 'admin@fitpro.com', color: '#f97316' },
  ];

  const inputStyle = (field: string) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: focusedField === field ? EM : '#e4e4e7',
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Top brand block */}
        <View
          style={{
            backgroundColor: '#0a0a0a',
            paddingTop: 72,
            paddingBottom: 40,
            paddingHorizontal: 28,
          }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 17,
              backgroundColor: '#0a2e1e',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              borderWidth: 1,
              borderColor: EM + '30',
            }}>
            <Dumbbell size={26} color={EM} strokeWidth={1.8} />
          </View>
          <Text
            style={{
              color: '#fff',
              fontSize: 30,
              fontWeight: '800',
              letterSpacing: -1,
              lineHeight: 36,
            }}>
            Bienvenido{'\n'}de vuelta
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginTop: 8 }}>
            Inicia sesion para continuar tu progreso
          </Text>
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 24, paddingTop: 32, gap: 16 }}>
          {/* Email */}
          <View>
            <Text style={{ color: '#3f3f46', fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.1 }}>
              Correo electronico
            </Text>
            <View style={inputStyle('email')}>
              <Mail size={17} color={focusedField === 'email' ? EM : '#a1a1aa'} strokeWidth={2} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholderTextColor="#d4d4d8"
                style={{ flex: 1, color: '#0f0f0f', fontSize: 15, fontWeight: '500', padding: 0 }}
              />
            </View>
          </View>

          {/* Password */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: '#3f3f46', fontSize: 13, fontWeight: '600', letterSpacing: 0.1 }}>
                Contrasena
              </Text>
              <Link href="/auth/forgot-password" asChild>
                <TouchableOpacity>
                  <Text style={{ color: EM, fontSize: 13, fontWeight: '600' }}>
                    Olvidaste tu contrasena?
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
            <View style={inputStyle('password')}>
              <Lock size={17} color={focusedField === 'password' ? EM : '#a1a1aa'} strokeWidth={2} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPass}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholderTextColor="#d4d4d8"
                style={{ flex: 1, color: '#0f0f0f', fontSize: 15, fontWeight: '500', padding: 0 }}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} activeOpacity={0.7}>
                {showPass ? (
                  <EyeOff size={17} color="#a1a1aa" strokeWidth={2} />
                ) : (
                  <Eye size={17} color="#a1a1aa" strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.88}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: loading ? '#6ee7b7' : '#0a0a0a',
              borderRadius: 14,
              paddingVertical: 17,
              marginTop: 4,
            }}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: -0.3 }}>
                  Iniciar Sesion
                </Text>
                <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
              </>
            )}
          </TouchableOpacity>

          {/* Register link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Text style={{ color: '#a1a1aa', fontSize: 14 }}>No tienes cuenta?</Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text style={{ color: EM, fontSize: 14, fontWeight: '700' }}>Registrate</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e4e4e7' }} />
            <Text style={{ color: '#d4d4d8', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
              CUENTAS DEMO
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e4e4e7' }} />
          </View>

          {/* Demo accounts */}
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#f0f0f0',
              marginBottom: 40,
            }}>
            {DEMO_ACCOUNTS.map((a, i) => (
              <TouchableOpacity
                key={a.email}
                onPress={() => setEmail(a.email)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  borderBottomWidth: i < DEMO_ACCOUNTS.length - 1 ? 1 : 0,
                  borderBottomColor: '#f4f4f5',
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: a.color,
                    }}
                  />
                  <Text style={{ color: '#0f0f0f', fontWeight: '600', fontSize: 14 }}>
                    {a.label}
                  </Text>
                </View>
                <Text style={{ color: '#a1a1aa', fontSize: 12 }}>{a.email}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
