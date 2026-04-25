import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/store';
import { FakeExerciseService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { ArrowLeft, Save, Dumbbell } from 'lucide-react-native';

const CATEGORIES = ['Fuerza', 'Cardio', 'Core', 'HIIT', 'Movilidad', 'Funcional'];
const MUSCLES    = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Piernas', 'Glúteos', 'Abdomen', 'Full Body'];
const DIFFICULTIES = [
  { value: 'beginner',     label: 'Principiante', color: '#22c55e' },
  { value: 'intermediate', label: 'Intermedio',   color: '#f59e0b' },
  { value: 'advanced',     label: 'Avanzado',     color: '#ef4444' },
];

export default function CreateExerciseScreen() {
  const router = useRouter();
  const t      = useTheme();
  const [saving, setSaving] = useState(false);

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState('Fuerza');
  const [muscle,      setMuscle]      = useState('Pecho');
  const [difficulty,  setDifficulty]  = useState('beginner');
  const [imageUrl,    setImageUrl]    = useState('');
  const [instructions, setInstructions] = useState('');
  const [focused,     setFocused]     = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'El nombre es requerido.'); return; }
    setSaving(true);
    try {
      await FakeExerciseService.create({
        name: name.trim(),
        description: description.trim(),
        category,
        muscle,
        difficulty: difficulty as any,
        imageUrl: imageUrl.trim(),
        instructions: instructions.split('\n').map((s) => s.trim()).filter(Boolean),
      });
      Alert.alert('Guardado', 'Ejercicio creado.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo crear el ejercicio.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = (key: string) => ({
    backgroundColor: t.bg.input, color: t.text.primary,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg, fontSize: FONT.base,
    borderWidth: 1.5, borderColor: focused === key ? t.accent : t.border.default,
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{
        backgroundColor: t.bg.secondary, paddingTop: 56, paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.xl, borderBottomWidth: 1, borderBottomColor: t.border.subtle,
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} color={t.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg }}>Nuevo Ejercicio</Text>
          <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>Solo administradores</Text>
        </View>
        <TouchableOpacity onPress={handleSave} disabled={saving || !name.trim()} style={{ backgroundColor: name.trim() ? t.accent : t.bg.elevated, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {saving ? <ActivityIndicator size="small" color={t.accentText} /> : <>
            <Save size={14} color={name.trim() ? t.accentText : t.text.tertiary} />
            <Text style={{ color: name.trim() ? t.accentText : t.text.tertiary, fontWeight: '700', fontSize: FONT.sm }}>Guardar</Text>
          </>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.md }}>
        {/* Basic */}
        <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle, gap: SPACING.md }}>
          <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.xs, letterSpacing: 0.5, textTransform: 'uppercase' }}>Información</Text>
          {[
            { key: 'name', label: 'Nombre *', value: name, set: setName, placeholder: 'Ej: Press de banca' },
            { key: 'desc', label: 'Descripción', value: description, set: setDescription, placeholder: 'Describe el ejercicio...', multi: true },
            { key: 'img', label: 'URL de imagen', value: imageUrl, set: setImageUrl, placeholder: 'https://...' },
          ].map(({ key, label, value, set, placeholder, multi }) => (
            <View key={key}>
              <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
              <TextInput value={value} onChangeText={set} placeholder={placeholder} placeholderTextColor={t.text.tertiary}
                multiline={multi} numberOfLines={multi ? 3 : 1} onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
                style={{ ...inputStyle(key), textAlignVertical: multi ? 'top' : undefined, minHeight: multi ? 70 : undefined }} />
            </View>
          ))}
        </View>

        {/* Category */}
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

        {/* Muscle */}
        <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle, gap: SPACING.md }}>
          <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.xs, letterSpacing: 0.5, textTransform: 'uppercase' }}>Músculo Principal</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
            {MUSCLES.map((m) => (
              <TouchableOpacity key={m} onPress={() => setMuscle(m)} style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.full, backgroundColor: muscle === m ? t.info + '22' : t.bg.elevated, borderWidth: 1, borderColor: muscle === m ? t.info : t.border.default }}>
                <Text style={{ color: muscle === m ? t.info : t.text.secondary, fontWeight: '600', fontSize: FONT.sm }}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty */}
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

        {/* Instructions */}
        <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle, gap: SPACING.md }}>
          <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.xs, letterSpacing: 0.5, textTransform: 'uppercase' }}>Instrucciones (una por línea)</Text>
          <TextInput value={instructions} onChangeText={setInstructions} placeholder={'1. Acuéstate en el banco...\n2. Baja la barra...'} placeholderTextColor={t.text.tertiary}
            multiline numberOfLines={6} onFocus={() => setFocused('inst')} onBlur={() => setFocused(null)}
            style={{ ...inputStyle('inst'), textAlignVertical: 'top', minHeight: 120 }} />
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
