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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FakeUserService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import {
  ArrowLeft,
  User,
  Mail,
  FileText,
  Weight,
  Ruler,
  Target,
  Check,
  Camera,
} from 'lucide-react-native';

const AVATAR_OPTIONS = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=2',
  'https://i.pravatar.cc/150?img=3',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=7',
  'https://i.pravatar.cc/150?img=8',
  'https://i.pravatar.cc/150?img=10',
  'https://i.pravatar.cc/150?img=12',
];

export default function EditProfileScreen() {
  const { user, updateUser } = useAppStore();
  const router = useRouter();
  const t = useTheme();

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [weight, setWeight] = useState(String(user?.weight ?? 70));
  const [height, setHeight] = useState(String(user?.height ?? 170));
  const [goal, setGoal] = useState(user?.goal ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    setLoading(true);
    try {
      const updated = await FakeUserService.updateProfile(user?.id ?? '', {
        name: name.trim(),
        bio: bio.trim(),
        weight: Number(weight) || 70,
        height: Number(height) || 170,
        goal: goal.trim(),
        avatar,
      });
      updateUser(updated);
      Alert.alert('¡Guardado!', 'Tu perfil fue actualizado exitosamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: 'name',
      label: 'Nombre completo',
      icon: User,
      value: name,
      setter: setName,
      placeholder: 'Tu nombre',
    },
    {
      key: 'bio',
      label: 'Biografía',
      icon: FileText,
      value: bio,
      setter: setBio,
      placeholder: 'Cuéntanos sobre ti...',
      multiline: true,
    },
    {
      key: 'goal',
      label: 'Objetivo',
      icon: Target,
      value: goal,
      setter: setGoal,
      placeholder: 'Tu meta de fitness',
    },
    {
      key: 'weight',
      label: 'Peso (kg)',
      icon: Weight,
      value: weight,
      setter: setWeight,
      placeholder: '70',
      keyboardType: 'decimal-pad' as const,
    },
    {
      key: 'height',
      label: 'Altura (cm)',
      icon: Ruler,
      value: height,
      setter: setHeight,
      placeholder: '170',
      keyboardType: 'number-pad' as const,
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: t.bg.primary }}>

      {/* Header */}
      <View
        style={{
          backgroundColor: t.bg.secondary,
          paddingTop: 56,
          paddingBottom: SPACING.md,
          paddingHorizontal: SPACING.xl,
          borderBottomWidth: 1,
          borderBottomColor: t.border.subtle,
          flexDirection: 'row',
          alignItems: 'center',
          gap: SPACING.md,
        }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: RADIUS.full,
            backgroundColor: t.bg.elevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ArrowLeft size={18} color={t.text.primary} />
        </TouchableOpacity>

        <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, flex: 1 }}>
          Editar Perfil
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: t.accent,
            borderRadius: RADIUS.full,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm - 2,
            opacity: loading ? 0.7 : 1,
          }}>
          {loading ? (
            <ActivityIndicator size="small" color={t.accentText} />
          ) : (
            <>
              <Check size={14} color={t.accentText} strokeWidth={3} />
              <Text style={{ color: t.accentText, fontWeight: '700', fontSize: FONT.sm }}>
                Guardar
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.xl }}>
        {/* Avatar section */}
        <View
          style={{
            backgroundColor: t.bg.card,
            borderRadius: RADIUS.xxl,
            padding: SPACING.xl,
            borderWidth: 1,
            borderColor: t.border.subtle,
            marginBottom: SPACING.md,
            alignItems: 'center',
          }}>
          <View style={{ position: 'relative', marginBottom: SPACING.md }}>
            <Image
              source={{ uri: avatar || user?.avatar }}
              style={{
                width: 96,
                height: 96,
                borderRadius: RADIUS.full,
                borderWidth: 3,
                borderColor: t.accent,
              }}
            />
            <TouchableOpacity
              onPress={() => setShowAvatarPicker(!showAvatarPicker)}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 30,
                height: 30,
                borderRadius: RADIUS.full,
                backgroundColor: t.accent,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: t.bg.card,
              }}>
              <Camera size={14} color={t.accentText} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
            {user?.name}
          </Text>
          <Text style={{ color: t.text.tertiary, fontSize: FONT.sm, marginTop: 2 }}>
            {user?.email}
          </Text>

          {showAvatarPicker && (
            <View style={{ marginTop: SPACING.md }}>
              <Text style={{ color: t.text.secondary, fontSize: FONT.xs, fontWeight: '600', marginBottom: SPACING.sm, textAlign: 'center' }}>
                Elige un avatar
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center' }}>
                {AVATAR_OPTIONS.map((av) => {
                  const isSelected = avatar === av;
                  return (
                    <TouchableOpacity
                      key={av}
                      onPress={() => { setAvatar(av); setShowAvatarPicker(false); }}>
                      <Image
                        source={{ uri: av }}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: RADIUS.full,
                          borderWidth: 2.5,
                          borderColor: isSelected ? t.accent : 'transparent',
                        }}
                      />
                      {isSelected && (
                        <View
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 18,
                            height: 18,
                            borderRadius: RADIUS.full,
                            backgroundColor: t.accent,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Check size={10} color={t.accentText} strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* Form fields */}
        <View
          style={{
            backgroundColor: t.bg.card,
            borderRadius: RADIUS.xxl,
            padding: SPACING.lg,
            borderWidth: 1,
            borderColor: t.border.subtle,
            gap: SPACING.md,
          }}>
          <Text
            style={{
              color: t.text.secondary,
              fontWeight: '700',
              fontSize: FONT.sm,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>
            Información Personal
          </Text>

          {fields.map((field) => {
            const IconComp = field.icon;
            return (
              <View key={field.key}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.xs }}>
                  <IconComp size={13} color={t.text.secondary} />
                  <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>
                    {field.label}
                  </Text>
                </View>
                <TextInput
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  keyboardType={field.keyboardType}
                  multiline={field.multiline}
                  numberOfLines={field.multiline ? 3 : 1}
                  onFocus={() => setFocusedField(field.key)}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    backgroundColor: t.bg.input,
                    color: t.text.primary,
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm + 2,
                    borderRadius: RADIUS.lg,
                    fontSize: FONT.base,
                    borderWidth: 1.5,
                    borderColor: focusedField === field.key ? t.accent : t.border.default,
                    textAlignVertical: field.multiline ? 'top' : 'center',
                    minHeight: field.multiline ? 80 : undefined,
                  }}
                  placeholderTextColor={t.text.tertiary}
                />
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
