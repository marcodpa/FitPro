import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/lib/store';
import { FakeExerciseService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { ArrowLeft, Save, Trash2 } from 'lucide-react-native';
import type { Exercise } from '@/lib/types';

const CATEGORIES  = ['Fuerza', 'Cardio', 'Core', 'HIIT', 'Movilidad', 'Funcional'];
const MUSCLES     = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Piernas', 'Glúteos', 'Abdomen', 'Full Body'];
const DIFFICULTIES = [
  { value: 'beginner',     label: 'Principiante', color: '#22c55e' },
  { value: 'intermediate', label: 'Intermedio',   color: '#f59e0b' },
  { value: 'advanced',     label: 'Avanzado',     color: '#ef4444' },
];

export default function EditExerciseScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const router   = useRouter();
  const t        = useTheme();
  const [loading, setLoading]    = useState(true);
  const [saving,  setSaving]     = useState(false);
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState('Fuerza');
  const [muscle,      setMuscle]      = useState('Pecho');
  const [difficulty,  setDifficulty]  = useState('beginner');
  const [imageUrl,    setImageUrl]    = useState('');
  const [instructions, setInstructions] = useState('');
  const [focused,     setFocused]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    FakeExerciseService.getById(id)
      .then((ex) => {
        setName(ex.name);
        setDescription(ex.description ?? '');
        setCategory(ex.category ?? 'Fuerza');
        setMuscle(ex.muscle ?? 'Pecho');
        setDifficulty(ex.difficulty ?? 'beginner');
        setImageUrl(ex.imageUrl ?? '');
        setInstructions((ex.instructions ?? []).join('\n'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'El nombre es requerido.'); return; }
    setSaving(true);
    try {
      // Use PATCH via apiPatch
      const { apiPatch } = await import('@/lib/api');
      await apiPatch(`/exercises/${id}/`, {
        name: name.trim(), description: description.trim(),
        category, muscle, difficulty,
        image_url: imageUrl.trim(),
        instructions: instructions.split('\n').map((s) => s.trim()).filter(Boolean),
      });
      Alert.alert('Guardado', 'Ejercicio actualizado.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo actualizar.');
    } finally { setSaving(false); }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar ejercicio', '¿Seguro? Esta acción es irreversible.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await FakeExerciseService.delete(id!);
          router.replace('/exercises' as any);
        } catch { Alert.alert('Error', 'No se pudo eliminar.'); }
      }},
    ]);
  };

  const inp = (key: string) => ({
    backgroundColor: t.bg.input, color: t.text.primary,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg, fontSize: FONT.base,
    borderWidth: 1.5, borderColor: focused === key ? t.accent : t.border.default,
  } as const);

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={t.accent} />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <View style={{ backgroundColor: t.bg.secondary, paddingTop: 56, paddingBottom: SPACING.md, paddingHorizontal: SPACING.xl, borderBottomWidth: 1, borderBottomColor: t.border.subtle, flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} color={t.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg }}>Editar Ejercicio</Text>
          <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>Solo administradores</Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={{ width: 36, height: 36, borderRadius: RADIUS.lg, backgroundColor: t.dangerDim, alignItems: 'center', justifyContent: 'center' }}>
          <Trash2 size={16} color={t.danger} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} disabled={saving || !name.trim()} style={{ backgroundColor: name.trim() ? t.accent : t.bg.elevated, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {saving ? <ActivityIndicator size="small" color={t.accentText} /> : <>
            <Save size={14} color={name.trim() ? t.accentText : t.text.tertiary} />
            <Text style={{ color: name.trim() ? t.accentText : t.text.tertiary, fontWeight: '700', fontSize: FONT.sm }}>Guardar</Text>
          </>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.md }}>
        <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle, gap: SPACING.md }}>
          <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.xs, letterSpacing: 0.5, textTransform: 'uppercase' }}>Información</Text>
          {[
            { key: 'name', label: 'Nombre *', value: name, set: setName, placeholder: 'Ej: Press de banca' },
            { key: 'desc', label: 'Descripción', value: description, set: setDescription, placeholder: 'Describe el ejercicio...', multi: true },
            { key: 'img',  label: 'URL de imagen', value: imageUrl, set: setImageUrl, placeholder: 'https://...' },
          ].map(({ key, label, value, set, placeholder, multi }) => (
            <View key={key}>
              <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
              <TextInput value={value} onChangeText={set} placeholder={placeholder} placeholderTextColor={t.text.tertiary}
                multiline={multi} numberOfLines={multi ? 3 : 1}
                onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
                style={{ ...inp(key), textAlignVertical: multi ? 'top' : undefined, minHeight: multi ? 70 : undefined }} />
            </View>
          ))}
        </View>

        <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle, gap: SPACING.md }}>
          <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.xs, letterSpacing: 0.5, textTransform: 'uppercase' }}>Categoría</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c} onPress={() => setCategory(c)} style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.full, backgroundColor: category === c ? t.accent : t.bg.elevated, borderWidth: 1, borderColor: category === c ? t.accent : t.border.default }}>
                <Text style={{ color: category === c ? t.accentText : t.text.secondary, fontWeight: '600', fontSize: FONT.sm }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle, gap: SPACING.md }}>
          <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.xs, letterSpacing: 0.5, textTransform: 'uppercase' }}>Músculo</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
            {MUSCLES.map((m) => (
              <TouchableOpacity key={m} onPress={() => setMuscle(m)} style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.full, backgroundColor: muscle === m ? t.info + '22' : t.bg.elevated, borderWidth: 1, borderColor: muscle === m ? t.info : t.border.default }}>
                <Text style={{ color: muscle === m ? t.info : t.text.secondary, fontWeight: '600', fontSize: FONT.sm }}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle, gap: SPACING.md }}>
          <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.xs, letterSpacing: 0.5, textTransform: 'uppercase' }}>Dificultad</Text>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity key={d.value} onPress={() => setDifficulty(d.value)} style={{ flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, alignItems: 'center', backgroundColor: difficulty === d.value ? d.color + '22' : t.bg.elevated, borderWidth: 1.5, borderColor: difficulty === d.value ? d.color : t.border.default }}>
                <Text style={{ color: difficulty === d.value ? d.color : t.text.secondary, fontWeight: '700', fontSize: FONT.xs }}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle, gap: SPACING.md }}>
          <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.xs, letterSpacing: 0.5, textTransform: 'uppercase' }}>Instrucciones (una por línea)</Text>
          <TextInput value={instructions} onChangeText={setInstructions} multiline numberOfLines={6}
            placeholder={'1. Paso 1...\n2. Paso 2...'} placeholderTextColor={t.text.tertiary}
            onFocus={() => setFocused('inst')} onBlur={() => setFocused(null)}
            style={{ ...inp('inst'), textAlignVertical: 'top', minHeight: 120 }} />
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
