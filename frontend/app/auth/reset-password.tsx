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
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/lib/store';
import { api } from '@/lib/api';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';

export default function ResetPasswordScreen() {
  const { token, uid } = useLocalSearchParams<{ token?: string; uid?: string }>();
  const router = useRouter();
  const t = useTheme();

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [done,            setDone]            = useState(false);
  const [focusedField,    setFocusedField]    = useState<string | null>(null);

  const passwordsMatch = newPassword === confirmPassword;
  const isValid = newPassword.length >= 6 && passwordsMatch;

  const handleReset = async () => {
    if (!isValid) {
      if (newPassword.length < 6) {
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      } else {
        Alert.alert('Error', 'Las contraseñas no coinciden.');
      }
      return;
    }
    setLoading(true);
    try {
      await api('/auth/reset-password/', {
        method: 'POST',
        body: JSON.stringify({
          token,
          uid,
          new_password: newPassword,
          new_password2: confirmPassword,
        }),
        skipAuth: true,
      });
      setDone(true);
    } catch {
      Alert.alert('Error', 'El enlace ha expirado o es inválido. Solicita uno nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg.primary, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl }}>
        <View style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: t.successDim,
          alignItems: 'center', justifyContent: 'center',
          marginBottom: SPACING.xl,
        }}>
          <CheckCircle2 size={36} color={t.success} strokeWidth={2} />
        </View>
        <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xxl, letterSpacing: -0.5, textAlign: 'center', marginBottom: SPACING.sm }}>
          ¡Contraseña actualizada!
        </Text>
        <Text style={{ color: t.text.secondary, fontSize: FONT.base, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xxl }}>
          Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/auth/login')}
          style={{
            backgroundColor: t.accent,
            borderRadius: RADIUS.xl,
            paddingVertical: SPACING.lg,
            paddingHorizontal: 48,
            alignItems: 'center',
          }}>
          <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.base }}>
            Ir al Login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{
        backgroundColor: t.bg.secondary,
        paddingTop: 56,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: t.border.subtle,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} color={t.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg }}>Nueva Contraseña</Text>
          <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>Ingresa y confirma tu nueva contraseña</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.md }}>
        {/* Icon */}
        <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: t.accentDim,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: SPACING.md,
          }}>
            <Lock size={32} color={t.accent} strokeWidth={2} />
          </View>
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, textAlign: 'center' }}>
            La contraseña debe tener al menos 6 caracteres.
          </Text>
        </View>

        {/* New password */}
        <View>
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600', marginBottom: SPACING.xs }}>
            Nueva contraseña
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: t.bg.input,
            borderRadius: RADIUS.lg,
            borderWidth: 1.5,
            borderColor: focusedField === 'new' ? t.accent : t.border.default,
            paddingHorizontal: SPACING.lg,
          }}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={t.text.tertiary}
              onFocus={() => setFocusedField('new')}
              onBlur={() => setFocusedField(null)}
              style={{ flex: 1, color: t.text.primary, fontSize: FONT.base, paddingVertical: SPACING.md }}
            />
            <TouchableOpacity onPress={() => setShowNew((v) => !v)} style={{ padding: 4 }}>
              {showNew
                ? <EyeOff size={18} color={t.text.tertiary} />
                : <Eye size={18} color={t.text.tertiary} />
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm password */}
        <View>
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600', marginBottom: SPACING.xs }}>
            Confirmar contraseña
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: t.bg.input,
            borderRadius: RADIUS.lg,
            borderWidth: 1.5,
            borderColor: focusedField === 'confirm'
              ? t.accent
              : confirmPassword && !passwordsMatch
              ? t.danger
              : t.border.default,
            paddingHorizontal: SPACING.lg,
          }}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              placeholder="Repite la contraseña"
              placeholderTextColor={t.text.tertiary}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              style={{ flex: 1, color: t.text.primary, fontSize: FONT.base, paddingVertical: SPACING.md }}
            />
            <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={{ padding: 4 }}>
              {showConfirm
                ? <EyeOff size={18} color={t.text.tertiary} />
                : <Eye size={18} color={t.text.tertiary} />
              }
            </TouchableOpacity>
          </View>
          {confirmPassword && !passwordsMatch && (
            <Text style={{ color: t.danger, fontSize: FONT.xs, marginTop: 4, marginLeft: 4 }}>
              Las contraseñas no coinciden
            </Text>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleReset}
          disabled={loading || !isValid}
          style={{
            backgroundColor: isValid ? t.accent : t.bg.elevated,
            borderRadius: RADIUS.xl,
            paddingVertical: SPACING.lg,
            alignItems: 'center',
            marginTop: SPACING.md,
            opacity: loading ? 0.7 : 1,
          }}>
          {loading ? (
            <ActivityIndicator color={t.accentText} />
          ) : (
            <Text style={{ color: isValid ? t.accentText : t.text.tertiary, fontWeight: '800', fontSize: FONT.base }}>
              Cambiar Contraseña
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
