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
import { FakeRoutineService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import {
  ArrowLeft,
  Dumbbell,
  Clock,
  BarChart2,
  Tag,
  Plus,
  Trash2,
  ChevronDown,
} from 'lucide-react-native';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'beginner', label: 'Principiante', color: '#22c55e' },
  { value: 'intermediate', label: 'Intermedio', color: '#f59e0b' },
  { value: 'advanced', label: 'Avanzado', color: '#ef4444' },
];

const CATEGORIES = ['Fuerza', 'Cardio', 'HIIT', 'Yoga', 'Movilidad', 'Funcional', 'Core'];

interface SimpleExercise {
  name: string;
  sets: number;
  reps: number;
  rest: number;
}

export default function CreateRoutineScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('45');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [category, setCategory] = useState('Fuerza');
  const [exercises, setExercises] = useState<SimpleExercise[]>([
    { name: '', sets: 3, reps: 12, rest: 60 },
  ]);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { user } = useAppStore();
  const router = useRouter();
  const t = useTheme();

  const addExercise = () => {
    setExercises((prev) => [...prev, { name: '', sets: 3, reps: 12, rest: 60 }]);
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof SimpleExercise, value: string | number) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre de la rutina es requerido');
      return;
    }
    if (exercises.some((e) => !e.name.trim())) {
      Alert.alert('Error', 'Todos los ejercicios deben tener nombre');
      return;
    }
    setLoading(true);
    try {
      await FakeRoutineService.create({
        name: name.trim(),
        description: description.trim(),
        duration: Number(duration) || 45,
        difficulty,
        category,
        trainerId: user?.id ?? 't1',
        userId: user?.id,
      });
      Alert.alert('¡Rutina creada!', 'Tu rutina fue creada exitosamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Error al crear rutina');
    } finally {
      setLoading(false);
    }
  };

  const canCreate = name.trim().length > 0 && exercises.length > 0;

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

        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg }}>
            Nueva Rutina
          </Text>
          <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>
            Crea una rutina personalizada
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading || !canCreate}
          style={{
            backgroundColor: canCreate ? t.accent : t.bg.elevated,
            borderRadius: RADIUS.lg,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            opacity: loading ? 0.7 : 1,
          }}>
          {loading ? (
            <ActivityIndicator size="small" color={t.accentText} />
          ) : (
            <Text
              style={{
                color: canCreate ? t.accentText : t.text.tertiary,
                fontWeight: '700',
                fontSize: FONT.sm,
              }}>
              Crear
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.xl }}>
        {/* Basic info */}
        <View
          style={{
            backgroundColor: t.bg.card,
            borderRadius: RADIUS.xl,
            padding: SPACING.lg,
            borderWidth: 1,
            borderColor: t.border.subtle,
            marginBottom: SPACING.md,
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
            Información General
          </Text>

          {/* Name */}
          <View>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600', marginBottom: SPACING.xs }}>
              Nombre de la rutina *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej: Full Body Fuerza"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              style={{
                backgroundColor: t.bg.input,
                color: t.text.primary,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm + 2,
                borderRadius: RADIUS.lg,
                fontSize: FONT.base,
                borderWidth: 1.5,
                borderColor: focusedField === 'name' ? t.accent : t.border.default,
              }}
              placeholderTextColor={t.text.tertiary}
            />
          </View>

          {/* Description */}
          <View>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600', marginBottom: SPACING.xs }}>
              Descripción
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe el objetivo de esta rutina..."
              multiline
              numberOfLines={3}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              style={{
                backgroundColor: t.bg.input,
                color: t.text.primary,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm + 2,
                borderRadius: RADIUS.lg,
                fontSize: FONT.base,
                borderWidth: 1.5,
                borderColor: focusedField === 'description' ? t.accent : t.border.default,
                textAlignVertical: 'top',
                minHeight: 80,
              }}
              placeholderTextColor={t.text.tertiary}
            />
          </View>

          {/* Duration */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.xs }}>
              <Clock size={13} color={t.text.secondary} />
              <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>
                Duración (minutos)
              </Text>
            </View>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              onFocus={() => setFocusedField('duration')}
              onBlur={() => setFocusedField(null)}
              style={{
                backgroundColor: t.bg.input,
                color: t.text.primary,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm + 2,
                borderRadius: RADIUS.lg,
                fontSize: FONT.base,
                borderWidth: 1.5,
                borderColor: focusedField === 'duration' ? t.accent : t.border.default,
              }}
              placeholderTextColor={t.text.tertiary}
            />
          </View>
        </View>

        {/* Difficulty */}
        <View
          style={{
            backgroundColor: t.bg.card,
            borderRadius: RADIUS.xl,
            padding: SPACING.lg,
            borderWidth: 1,
            borderColor: t.border.subtle,
            marginBottom: SPACING.md,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md }}>
            <BarChart2 size={13} color={t.text.secondary} />
            <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.sm, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Dificultad
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {DIFFICULTIES.map((d) => {
              const isSelected = difficulty === d.value;
              return (
                <TouchableOpacity
                  key={d.value}
                  onPress={() => setDifficulty(d.value)}
                  style={{
                    flex: 1,
                    paddingVertical: SPACING.sm,
                    borderRadius: RADIUS.lg,
                    alignItems: 'center',
                    backgroundColor: isSelected ? d.color + '22' : t.bg.elevated,
                    borderWidth: 1.5,
                    borderColor: isSelected ? d.color : t.border.default,
                  }}>
                  <Text style={{ color: isSelected ? d.color : t.text.secondary, fontWeight: '700', fontSize: FONT.xs }}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Category */}
        <View
          style={{
            backgroundColor: t.bg.card,
            borderRadius: RADIUS.xl,
            padding: SPACING.lg,
            borderWidth: 1,
            borderColor: t.border.subtle,
            marginBottom: SPACING.md,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md }}>
            <Tag size={13} color={t.text.secondary} />
            <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.sm, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Categoría
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={{
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.xs + 2,
                    borderRadius: RADIUS.full,
                    backgroundColor: isSelected ? t.accent : t.bg.elevated,
                    borderWidth: 1,
                    borderColor: isSelected ? t.accent : t.border.default,
                  }}>
                  <Text style={{ color: isSelected ? t.accentText : t.text.secondary, fontWeight: '600', fontSize: FONT.sm }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Exercises */}
        <View
          style={{
            backgroundColor: t.bg.card,
            borderRadius: RADIUS.xl,
            padding: SPACING.lg,
            borderWidth: 1,
            borderColor: t.border.subtle,
            marginBottom: SPACING.md,
            gap: SPACING.md,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
              <Dumbbell size={13} color={t.text.secondary} />
              <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.sm, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Ejercicios ({exercises.length})
              </Text>
            </View>
            <TouchableOpacity
              onPress={addExercise}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: t.accentDim,
                borderRadius: RADIUS.full,
                paddingHorizontal: SPACING.sm,
                paddingVertical: 4,
              }}>
              <Plus size={12} color={t.accent} />
              <Text style={{ color: t.accent, fontSize: FONT.xs, fontWeight: '700' }}>Añadir</Text>
            </TouchableOpacity>
          </View>

          {exercises.map((ex, index) => (
            <View
              key={index}
              style={{
                backgroundColor: t.bg.elevated,
                borderRadius: RADIUS.lg,
                padding: SPACING.md,
                gap: SPACING.sm,
                borderWidth: 1,
                borderColor: t.border.subtle,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: RADIUS.full,
                    backgroundColor: t.accentDim,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{ color: t.accent, fontWeight: '800', fontSize: FONT.xs }}>
                    {index + 1}
                  </Text>
                </View>
                <TextInput
                  value={ex.name}
                  onChangeText={(v) => updateExercise(index, 'name', v)}
                  placeholder="Nombre del ejercicio"
                  style={{
                    flex: 1,
                    backgroundColor: t.bg.input,
                    color: t.text.primary,
                    paddingHorizontal: SPACING.sm,
                    paddingVertical: SPACING.xs + 2,
                    borderRadius: RADIUS.md,
                    fontSize: FONT.sm,
                    borderWidth: 1,
                    borderColor: t.border.default,
                  }}
                  placeholderTextColor={t.text.tertiary}
                />
                {exercises.length > 1 && (
                  <TouchableOpacity onPress={() => removeExercise(index)}>
                    <Trash2 size={16} color={t.danger} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                {[
                  { label: 'Series', field: 'sets' as const, value: ex.sets },
                  { label: 'Reps', field: 'reps' as const, value: ex.reps },
                  { label: 'Descanso (s)', field: 'rest' as const, value: ex.rest },
                ].map(({ label, field, value }) => (
                  <View key={field} style={{ flex: 1 }}>
                    <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, marginBottom: 4, textAlign: 'center' }}>
                      {label}
                    </Text>
                    <TextInput
                      value={String(value)}
                      onChangeText={(v) => updateExercise(index, field, Number(v) || 0)}
                      keyboardType="number-pad"
                      style={{
                        backgroundColor: t.bg.input,
                        color: t.text.primary,
                        paddingVertical: SPACING.xs + 2,
                        borderRadius: RADIUS.md,
                        fontSize: FONT.sm,
                        fontWeight: '700',
                        borderWidth: 1,
                        borderColor: t.border.default,
                        textAlign: 'center',
                      }}
                      placeholderTextColor={t.text.tertiary}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
