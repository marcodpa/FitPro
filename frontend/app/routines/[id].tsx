import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FakeRoutineService } from '@/lib/services';
import type { Routine } from '@/lib/types';
import { useAppStore } from '@/lib/store';

const DIFFICULTIES = {
  beginner: { label: 'Principiante', color: '#16a34a', bg: '#dcfce7' },
  intermediate: { label: 'Intermedio', color: '#d97706', bg: '#fef3c7' },
  advanced: { label: 'Avanzado', color: '#dc2626', bg: '#fee2e2' },
};

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { activeRole } = useAppStore();

  useEffect(() => {
    if (!id) return;
    FakeRoutineService.getById(id)
      .then(setRoutine)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0d9e6e" />
      </View>
    );
  }

  if (!routine) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Rutina no encontrada</Text>
      </View>
    );
  }

  const diff = DIFFICULTIES[routine.difficulty];

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: routine.imageUrl }} style={{ width: '100%', height: 280 }} />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.35)',
            }}
          />
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: 52,
              left: 20,
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderRadius: 12,
              padding: 10,
            }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>←</Text>
          </TouchableOpacity>
          {activeRole === 'trainer' && (
            <TouchableOpacity
              onPress={() => router.push(`/routines/${id}/edit` as any)}
              style={{
                position: 'absolute',
                top: 52,
                right: 20,
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: 12,
                padding: 10,
              }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Editar</Text>
            </TouchableOpacity>
          )}
          <View
            style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <View
              style={{
                backgroundColor: diff.bg,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
                alignSelf: 'flex-start',
                marginBottom: 8,
              }}>
              <Text style={{ color: diff.color, fontSize: 12, fontWeight: '700' }}>
                {diff.label}
              </Text>
            </View>
            <Text
              className="text-white font-bold"
              style={{ fontSize: 26, lineHeight: 32 }}>
              {routine.name}
            </Text>
          </View>
        </View>

        <View className="px-6 pt-6">
          {/* Meta */}
          <View className="flex-row gap-3 mb-5">
            {[
              { icon: '⏱', value: `${routine.duration} min` },
              { icon: '💪', value: `${routine.exercises.length} ejerc.` },
              { icon: '🏷', value: routine.category },
            ].map((m) => (
              <View
                key={m.value}
                style={{
                  flex: 1,
                  backgroundColor: '#f8fafc',
                  borderRadius: 14,
                  padding: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                }}>
                <Text style={{ fontSize: 20 }}>{m.icon}</Text>
                <Text
                  className="text-foreground font-semibold text-sm mt-1">
                  {m.value}
                </Text>
              </View>
            ))}
          </View>

          <Text className="text-muted-foreground text-base mb-6">{routine.description}</Text>

          {/* Exercises */}
          <Text className="text-foreground font-bold text-xl mb-4">Ejercicios</Text>
          {routine.exercises.map((re, idx) => (
            <View
              key={re.exerciseId}
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#f1f5f9',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}>
              <View className="flex-row items-center gap-3 mb-3">
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#dcfce7',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{ color: '#16a34a', fontWeight: '700', fontSize: 13 }}>
                    {idx + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-base">
                    {re.exercise.name}
                  </Text>
                  <Text className="text-muted-foreground text-xs">
                    {re.exercise.muscle} • {re.exercise.category}
                  </Text>
                </View>
              </View>
              {/* Sets table */}
              <View
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: 12,
                  padding: 12,
                }}>
                <View className="flex-row mb-2">
                  {['Serie', 'Reps', 'Peso', 'Descanso'].map((h) => (
                    <Text
                      key={h}
                      style={{
                        flex: 1,
                        color: '#94a3b8',
                        fontSize: 11,
                        fontWeight: '600',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                      }}>
                      {h}
                    </Text>
                  ))}
                </View>
                {re.sets.map((set, si) => (
                  <View key={si} className="flex-row py-1">
                    <Text
                      style={{ flex: 1, textAlign: 'center', color: '#475569', fontSize: 13, fontWeight: '600' }}>
                      {si + 1}
                    </Text>
                    <Text
                      style={{ flex: 1, textAlign: 'center', color: '#1e293b', fontSize: 13 }}>
                      {set.duration ? `${set.duration}s` : set.reps}
                    </Text>
                    <Text
                      style={{ flex: 1, textAlign: 'center', color: '#1e293b', fontSize: 13 }}>
                      {set.weight ? `${set.weight}kg` : '—'}
                    </Text>
                    <Text
                      style={{ flex: 1, textAlign: 'center', color: '#1e293b', fontSize: 13 }}>
                      {set.rest}s
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Start button */}
      <View
        style={{
          padding: 20,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
        }}>
        <TouchableOpacity
          onPress={() => router.push(`/workout/session?routineId=${routine.id}` as any)}
          style={{
            backgroundColor: '#0d9e6e',
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
          }}>
          <Text className="text-white font-bold text-base">🚀 Iniciar Entrenamiento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
