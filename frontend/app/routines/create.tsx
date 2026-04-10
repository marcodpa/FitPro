import React, { useEffect, useState } from 'react';
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
import { FakeRoutineService, FakeUserService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import type { User } from '@/lib/types';
import {
  ArrowLeft,
  Dumbbell,
  Clock,
  BarChart2,
  Tag,
  Plus,
  Trash2,
  Users,
  CheckCircle2,
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
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const { user, activeRole } = useAppStore();
  const isTrainer = activeRole === 'trainer';
  const router = useRouter();
  const t = useTheme();

  useEffect(() => {
    if (isTrainer && user) {
      FakeUserService.getTrainerClients(user.id).then(setClients);
    }
  }, [isTrainer, user]);

  const toggleClient = (clientId: string) => {
    setSelectedClients((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

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
        assignedTo: selectedClients,
      });
      const msg = selectedClients.length > 0
        ? `Rutina creada y asignada a ${selectedClients.length} cliente(s).`
        : 'Tu rutina fue creada exitosamente.';
      Alert.alert('¡Rutina creada!', msg, [
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

        {/* Assign to clients — trainer only */}
        {isTrainer && clients.length > 0 && (
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
              <Users size={13} color={t.text.secondary} />
              <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.sm, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Asignar a clientes
              </Text>
              {selectedClients.length > 0 && (
                <View style={{ marginLeft: 'auto', backgroundColor: t.accentDim, borderRadius: RADIUS.full, paddingHorizontal: 9, paddingVertical: 2, borderWidth: 1, borderColor: t.accent }}>
                  <Text style={{ color: t.accent, fontSize: FONT.xs, fontWeight: '800' }}>{selectedClients.length}</Text>
                </View>
              )}
            </View>
            <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>
              Selecciona los clientes que recibirán esta rutina.
            </Text>
            {clients.map((client) => {
              const selected = selectedClients.includes(client.id);
              return (
                <TouchableOpacity
                  key={client.id}
                  onPress={() => toggleClient(client.id)}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.md,
                    padding: SPACING.md,
                    borderRadius: RADIUS.lg,
                    backgroundColor: selected ? t.accentDim : t.bg.elevated,
                    borderWidth: 1.5,
                    borderColor: selected ? t.accent : t.border.default,
                  }}>
                  <Image
                    source={{ uri: client.avatar }}
                    style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.bg.tertiary }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.sm }}>{client.name}</Text>
                    <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>{client.goal ?? client.email}</Text>
                  </View>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: selected ? t.accent : t.bg.tertiary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: selected ? 0 : 1,
                      borderColor: t.border.strong,
                    }}>
                    {selected && <CheckCircle2 size={14} color={t.accentText} strokeWidth={2.5} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
