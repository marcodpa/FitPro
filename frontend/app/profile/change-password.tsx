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
import { useTheme } from '@/lib/store';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react-native';

function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  focused,
  onFocus,
  onBlur,
  showPassword,
  onToggleShow,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  showPassword: boolean;
  onToggleShow: () => void;
  error?: string;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: t.text.secondary, fontSize: FONT.xs, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: t.bg.elevated,
          borderRadius: RADIUS.lg,
          borderWidth: 1.5,
          borderColor: error ? t.danger : focused ? t.accent : t.border.default,
          paddingHorizontal: SPACING.lg,
          gap: SPACING.md,
        }}>
        <Lock size={16} color={focused ? t.accent : t.text.tertiary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.text.tertiary}
          secureTextEntry={!showPassword}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{
            flex: 1,
            color: t.text.primary,
            fontSize: FONT.base,
            paddingVertical: 14,
          }}
        />
        <TouchableOpacity onPress={onToggleShow} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {showPassword
            ? <EyeOff size={17} color={t.text.tertiary} />
            : <Eye    size={17} color={t.text.tertiary} />}
        </TouchableOpacity>
      </View>
      {error ? (
        <Text style={{ color: t.danger, fontSize: FONT.xs, marginTop: 2 }}>{error}</Text>
      ) : null}
    </View>
  );
}

function StrengthBar({ password }: { password: string }) {
  const t = useTheme();
  const checks = [
    { label: 'Al menos 8 caracteres', ok: password.length >= 8 },
    { label: 'Letra mayúscula',        ok: /[A-Z]/.test(password) },
    { label: 'Número',                 ok: /[0-9]/.test(password) },
    { label: 'Carácter especial',      ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const labels = ['Muy débil', 'Débil', 'Buena', 'Fuerte'];

  if (!password) return null;

  return (
    <View style={{ gap: SPACING.sm, marginTop: 2 }}>
      {/* Bar */}
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i < score ? colors[score - 1] : t.border.strong,
            }}
          />
        ))}
      </View>
      <Text style={{ color: score > 0 ? colors[score - 1] : t.text.tertiary, fontSize: FONT.xs, fontWeight: '700' }}>
        {labels[score - 1] ?? ''}
      </Text>
      {/* Checklist */}
      <View style={{ gap: 4, marginTop: 4 }}>
        {checks.map((c) => (
          <View key={c.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={13} color={c.ok ? t.success : t.border.strong} strokeWidth={2.5} />
            <Text style={{ color: c.ok ? t.text.secondary : t.text.tertiary, fontSize: FONT.xs }}>
              {c.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const t = useTheme();

  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword,     setNewPassword]        = useState('');
  const [confirmPassword, setConfirmPassword]    = useState('');
  const [focused,         setFocused]            = useState<string | null>(null);
  const [showCurrent,     setShowCurrent]        = useState(false);
  const [showNew,         setShowNew]            = useState(false);
  const [showConfirm,     setShowConfirm]        = useState(false);
  const [loading,         setLoading]            = useState(false);

  const confirmError =
    confirmPassword.length > 0 && newPassword !== confirmPassword
      ? 'Las contraseñas no coinciden'
      : undefined;

  const isValid =
    currentPassword.length >= 1 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    Alert.alert(
      '¡Contraseña actualizada!',
      'Tu contraseña fue cambiada exitosamente.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg.primary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 56,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.xxl,
          backgroundColor: t.bg.secondary,
          borderBottomWidth: 1,
          borderBottomColor: t.border.subtle,
          gap: SPACING.md,
        }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: RADIUS.lg,
            backgroundColor: t.bg.elevated,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: t.border.subtle,
          }}>
          <ArrowLeft size={18} color={t.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xl, letterSpacing: -0.3 }}>
            Cambiar Contraseña
          </Text>
          <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>
            Elige una contraseña segura
          </Text>
        </View>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: RADIUS.lg,
            backgroundColor: t.accentDim,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: t.accent,
          }}>
          <ShieldCheck size={20} color={t.accent} />
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: SPACING.xxl, gap: SPACING.xl }}
        showsVerticalScrollIndicator={false}>

        {/* Current password */}
        <View
          style={{
            backgroundColor: t.bg.card,
            borderRadius: RADIUS.xl,
            padding: SPACING.lg,
            borderWidth: 1,
            borderColor: t.border.subtle,
            gap: SPACING.lg,
          }}>
          <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
            Contraseña actual
          </Text>
          <PasswordField
            label="Contraseña actual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Ingresa tu contraseña actual"
            focused={focused === 'current'}
            onFocus={() => setFocused('current')}
            onBlur={() => setFocused(null)}
            showPassword={showCurrent}
            onToggleShow={() => setShowCurrent((v) => !v)}
          />
        </View>

        {/* New password */}
        <View
          style={{
            backgroundColor: t.bg.card,
            borderRadius: RADIUS.xl,
            padding: SPACING.lg,
            borderWidth: 1,
            borderColor: t.border.subtle,
            gap: SPACING.lg,
          }}>
          <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
            Nueva contraseña
          </Text>
          <PasswordField
            label="Nueva contraseña"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Mínimo 8 caracteres"
            focused={focused === 'new'}
            onFocus={() => setFocused('new')}
            onBlur={() => setFocused(null)}
            showPassword={showNew}
            onToggleShow={() => setShowNew((v) => !v)}
          />
          <StrengthBar password={newPassword} />
          <PasswordField
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repite la nueva contraseña"
            focused={focused === 'confirm'}
            onFocus={() => setFocused('confirm')}
            onBlur={() => setFocused(null)}
            showPassword={showConfirm}
            onToggleShow={() => setShowConfirm((v) => !v)}
            error={confirmError}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isValid || loading}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: SPACING.md,
            backgroundColor: isValid && !loading ? t.accent : t.bg.elevated,
            borderRadius: RADIUS.xl,
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: isValid && !loading ? t.accent : t.border.subtle,
          }}>
          {loading
            ? <ActivityIndicator color={t.accentText} />
            : <>
                <ShieldCheck size={18} color={isValid ? t.accentText : t.text.tertiary} strokeWidth={2.5} />
                <Text
                  style={{
                    fontWeight: '800',
                    fontSize: FONT.base,
                    color: isValid && !loading ? t.accentText : t.text.tertiary,
                  }}>
                  Actualizar Contraseña
                </Text>
              </>}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
