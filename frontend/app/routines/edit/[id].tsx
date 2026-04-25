import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/lib/store';
import { FakeRoutineService } from '@/lib/services';
import { apiPatch, apiDelete } from '@/lib/api';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { ArrowLeft, Save, Trash2 } from 'lucide-react-native';
import type { Routine } from '@/lib/types';

const DIFFICULTIES = [
  { value: 'beginner',     label: 'Principiante', color: '#22c55e' },
  { value: 'intermediate', label: 'Intermedio',   color: '#f59e0b' },
  { value: 'advanced',     label: 'Avanzado',     color: '#ef4444' },
];

const CATEGORIES = ['strength', 'cardio', 'flexibility', 'hiit', 'yoga', 'full_body'];
const CATEGORY_LABELS: Record<string, string> = {
  strength:    'Fuerza',
  cardio:      'Cardio',
  flexibility: 'Flexibilidad',
  hiit:        'HIIT',
  yoga:        'Yoga',
  full_body:   'Full Body',
};

export default function EditRoutineScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const t       = useTheme();

  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [name,         setName]         = useState('');
  const [description,  setDescription]  = useState('');
  const [duration,     setDuration]     = useState('45');
  const [difficulty,   setDifficulty]   = useState('intermediate');
  const [category,     setCategory]     = useState('strength');
  const [imageUrl,     setImageUrl]     = useState('');
  const [focused,      setFocused]      = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    FakeRoutineService.getById(id)
      .then((r) => {
        setName(r.name ?? '');
        setDescription(r.description ?? '');
        setDuration(String(r.duration ?? 45));
        setDifficulty(r.difficulty ?? 'intermediate');
        setCategory(r.category ?? 'strength');
        setImageUrl(r.imageUrl ?? '');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'El nombre es requerido.'); return; }
    setSaving(true);
    try {
      await apiPatch(`/routines/${id}/`, {
        name:        name.trim(),
        description: description.trim(),
        duration:    Number(duration) || 45,
        difficulty,
        category,
        image_url:   imageUrl.trim(),
      });
      Alert.alert('Guardado', 'Rutina actualizada.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo actualizar la rutina.');
    } finally { setSaving(false); }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar rutina', '¿Estás seguro? Esta acción es irreversible.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDelete(`/routines/${id}/`);
            router.replace('/routines' as any);
          } catch { Alert.alert('Error', 'No se pudo eliminar.'); }
        },
      },
    ]);
  };

  const inp = (key: string) => ({
    backgroundColor: t.bg.input,
    color: t.text.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    fontSize: FONT.base,
    borderWidth: 1.5,
    borderColor: focused === key ? t.accent : t.border.default,
  } as const);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{
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
          style={{ width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} color={t.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg }}>Editar Rutina</Text>
          <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>Modifica los datos de la rutina</Text>
        </View>
        <TouchableOpacity
          onPress={handleDelete}
          style={{ width: 36, height: 36, borderRadius: RADIUS.lg, backgroundColor: t.dangerDim, alignItems: 'center', justifyContent: 'center' }}>
          <Trash2 size={16} color={t.danger} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || !name.trim()}
          style={{
            backgroundColor: name.trim() ? t.accent : t.bg.elevated,
            borderRadius: RADIUS.lg,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}>
          {saving
            ? <ActivityIndicator size="small" color={t.accentText} />
            : <>
                <Save size={14} color={name.trim() ? t.accentText : t.text.tertiary} />
                <Text style={{ color: name.trim() ? t.accentText : t.text.tertiary, fontWeight: '700', fontSize: FONT.sm }}>Guardar</Text>
              </>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.md }} showsVerticalScrollIndicator={false}>
        {/* Basic info */}
        <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle, gap: SPACING.md }}>
          <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.xs, letterSpacing: 0.5, textTransform: 'uppercase' }}>Información</Text>
          {[
            { key: 'name',  label: 'Nombre *',     value: name,        set: setName,        placeholder: 'Ej: Full Body Power', multi: false },
            { key: 'desc',  label: 'Descripción',  value: description, set: setDescription, placeholder: 'Describe la rutina...', multi: true },
            { key: 'img',   label: 'URL de imagen', value: imageUrl,   set: setImageUrl,    placeholder: 'https://...', multi: false },
          ].map(({ key, label, value, set, placeholder, multi }) => (
            <View key={key}>
              <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
              <TextInput
                value={value}
                onChangeText={set}
                placeholder={placeholder}
                placeholderTextColor={t.text.tertiary}
                multiline={multi}
                numberOfLines={multi ? 3 : 1}
                onFocus={() => setFocused(key)}
                onBlur={() => setFocused(null)}
                style={{ ...inp(key), textAlignVertical: multi ? 'top' : undefined, minHeight: multi ? 70 : undefined }}
              />
            </View>
          ))}

          {/* Duration */}
          <View>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600', marginBottom: 6 }}>Duración (minutos)</Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              placeholder="45"
              placeholderTextColor={t.text.tertiary}
              onFocus={() => setFocused('dur')}
              onBlur={() => setFocused(null)}
              style={inp('dur')}
            />
          </View>
        </View>

        {/* Difficulty */}
        <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle, gap: SPACING.md }}>
          <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.xs, letterSpacing: 0.5, textTransform: 'uppercase' }}>Dificultad</Text>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d.value}
                onPress={() => setDifficulty(d.value)}
                style={{
                  flex: 1,
                  paddingVertical: SPACING.sm,
                  borderRadius: RADIUS.lg,
                  alignItems: 'center',
                  backgroundColor: difficulty === d.value ? d.color + '22' : t.bg.elevated,
                  borderWidth: 1.5,
                  borderColor: difficulty === d.value ? d.color : t.border.default,
                }}>
                <Text style={{ color: difficulty === d.value ? d.color : t.text.secondary, fontWeight: '700', fontSize: FONT.xs }}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category */}
        <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle, gap: SPACING.md }}>
          <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.xs, letterSpacing: 0.5, textTransform: 'uppercase' }}>Categoría</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={{
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.xs + 2,
                  borderRadius: RADIUS.full,
                  backgroundColor: category === c ? t.accent : t.bg.elevated,
                  borderWidth: 1,
                  borderColor: category === c ? t.accent : t.border.default,
                }}>
                <Text style={{ color: category === c ? t.accentText : t.text.secondary, fontWeight: '600', fontSize: FONT.sm }}>
                  {CATEGORY_LABELS[c] ?? c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
