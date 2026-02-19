import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FakeRoutineService } from '@/lib/services';
import type { Routine, RoutineExercise, WorkoutSet } from '@/lib/types';

type Phase = 'idle' | 'working' | 'resting' | 'done';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${pad(m)}:${pad(s)}`;
}

export default function WorkoutSessionScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!routineId) return;
    FakeRoutineService.getById(routineId).then(setRoutine);
  }, [routineId]);

  useEffect(() => {
    totalRef.current = setInterval(() => setTotalElapsed((t) => t + 1), 1000);
    return () => {
      if (totalRef.current) clearInterval(totalRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'working') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (phase === 'resting') {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
      const currentEx = routine?.exercises[currentExIdx];
      const currentSet = currentEx?.sets[currentSetIdx];
      const rest = currentSet?.rest ?? 60;
      setRestTimer(rest);
      timerRef.current = setInterval(() => {
        setRestTimer((r) => {
          if (r <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setPhase('idle');
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const markSetDone = useCallback(() => {
    const key = `${currentExIdx}-${currentSetIdx}`;
    setCompletedSets((prev) => ({ ...prev, [key]: true }));
    setPhase('resting');
  }, [currentExIdx, currentSetIdx]);

  const nextSet = useCallback(() => {
    if (!routine) return;
    const currentEx = routine.exercises[currentExIdx];
    if (currentSetIdx < currentEx.sets.length - 1) {
      setCurrentSetIdx((i) => i + 1);
      setPhase('idle');
    } else if (currentExIdx < routine.exercises.length - 1) {
      setCurrentExIdx((i) => i + 1);
      setCurrentSetIdx(0);
      setPhase('idle');
    } else {
      setPhase('done');
    }
  }, [routine, currentExIdx, currentSetIdx]);

  const handleFinish = () => {
    Alert.alert(
      '🎉 Entrenamiento Completado',
      `Duración: ${formatTime(totalElapsed)}\nEjercicios: ${routine?.exercises.length}`,
      [{ text: 'Ver Resumen', onPress: () => router.back() }]
    );
  };

  if (!routine) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground">Cargando...</Text>
      </View>
    );
  }

  if (phase === 'done') {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text style={{ fontSize: 80, marginBottom: 16 }}>🎉</Text>
        <Text className="text-foreground font-bold text-2xl text-center mb-2">
          ¡Entrenamiento Completado!
        </Text>
        <Text className="text-muted-foreground text-center mb-8">
          Duración total: {formatTime(totalElapsed)}
        </Text>
        <TouchableOpacity
          onPress={handleFinish}
          style={{
            backgroundColor: '#0d9e6e',
            borderRadius: 16,
            paddingVertical: 18,
            paddingHorizontal: 48,
          }}>
          <Text className="text-white font-bold text-base">Ver Resumen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentEx = routine.exercises[currentExIdx];
  const currentSet = currentEx.sets[currentSetIdx];
  const totalSets = routine.exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = Object.keys(completedSets).length;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        style={{
          backgroundColor: '#0d9e6e',
          paddingTop: 52,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}>
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Salir', '¿Seguro que quieres salir del entrenamiento?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Salir', style: 'destructive', onPress: () => router.back() },
              ]);
            }}>
            <Text className="text-white/80 font-medium">✕ Salir</Text>
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">{formatTime(totalElapsed)}</Text>
          <Text className="text-white/80 text-sm">
            {doneSets}/{totalSets} series
          </Text>
        </View>
        {/* Progress bar */}
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: 4,
            height: 6,
            marginTop: 12,
          }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 4,
              height: 6,
              width: `${(doneSets / Math.max(totalSets, 1)) * 100}%`,
            }}
          />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Current exercise */}
        <View className="mb-4">
          <Text className="text-muted-foreground text-sm font-medium mb-1">
            Ejercicio {currentExIdx + 1} de {routine.exercises.length}
          </Text>
          <Text className="text-foreground font-bold" style={{ fontSize: 26 }}>
            {currentEx.exercise.name}
          </Text>
          <Text className="text-muted-foreground text-sm">
            {currentEx.exercise.muscle} • Serie {currentSetIdx + 1} de {currentEx.sets.length}
          </Text>
        </View>

        {/* Timer / Phase area */}
        {phase === 'resting' ? (
          <View
            style={{
              backgroundColor: '#2563eb',
              borderRadius: 24,
              padding: 32,
              alignItems: 'center',
              marginBottom: 20,
            }}>
            <Text className="text-white/80 text-sm mb-2">Descansando...</Text>
            <Text className="text-white font-bold" style={{ fontSize: 72, lineHeight: 80 }}>
              {formatTime(restTimer)}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                setPhase('idle');
                nextSet();
              }}
              style={{
                marginTop: 16,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 10,
              }}>
              <Text className="text-white font-semibold">Saltar descanso →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
              backgroundColor: phase === 'working' ? '#0d9e6e' : '#f8fafc',
              borderRadius: 24,
              padding: 32,
              alignItems: 'center',
              marginBottom: 20,
              borderWidth: 2,
              borderColor: phase === 'working' ? '#0d9e6e' : '#e2e8f0',
            }}>
            {phase === 'working' ? (
              <>
                <Text className="text-white/80 text-sm mb-2">En progreso</Text>
                <Text className="text-white font-bold" style={{ fontSize: 72, lineHeight: 80 }}>
                  {formatTime(elapsed)}
                </Text>
              </>
            ) : (
              <>
                <Text className="text-muted-foreground text-sm mb-4">
                  {currentSet.duration
                    ? `Duración: ${currentSet.duration}s`
                    : `${currentSet.reps} reps${currentSet.weight ? ` × ${currentSet.weight}kg` : ''}`}
                </Text>
                <Text
                  className="text-foreground font-bold text-center"
                  style={{ fontSize: 18 }}>
                  Listo para comenzar
                </Text>
              </>
            )}
          </Animated.View>
        )}

        {/* Set details */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#f1f5f9',
          }}>
          <View className="items-center">
            <Text className="text-muted-foreground text-xs mb-1">Series</Text>
            <Text className="text-foreground font-bold text-xl">
              {currentSetIdx + 1}/{currentEx.sets.length}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-muted-foreground text-xs mb-1">Reps/Duración</Text>
            <Text className="text-foreground font-bold text-xl">
              {currentSet.duration ? `${currentSet.duration}s` : currentSet.reps}
            </Text>
          </View>
          {currentSet.weight && (
            <View className="items-center">
              <Text className="text-muted-foreground text-xs mb-1">Peso</Text>
              <Text className="text-foreground font-bold text-xl">{currentSet.weight}kg</Text>
            </View>
          )}
          <View className="items-center">
            <Text className="text-muted-foreground text-xs mb-1">Descanso</Text>
            <Text className="text-foreground font-bold text-xl">{currentSet.rest}s</Text>
          </View>
        </View>

        {/* Voice commands hint */}
        <View
          style={{
            backgroundColor: '#f0fdf4',
            borderRadius: 14,
            padding: 14,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#bbf7d0',
          }}>
          <Text style={{ color: '#16a34a', fontWeight: '600', fontSize: 13, marginBottom: 4 }}>
            🎤 Comandos de voz disponibles
          </Text>
          <Text style={{ color: '#15803d', fontSize: 12 }}>
            "Iniciar" • "Siguiente ejercicio" • "Descanso" • "Finalizar"
          </Text>
        </View>

        {/* Exercise list overview */}
        <Text className="text-foreground font-bold text-base mb-3">Ejercicios de la rutina</Text>
        {routine.exercises.map((ex, i) => (
          <View
            key={ex.exerciseId}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              borderRadius: 12,
              marginBottom: 8,
              backgroundColor: i === currentExIdx ? '#f0fdf4' : '#fff',
              borderWidth: 1,
              borderColor: i === currentExIdx ? '#86efac' : '#f1f5f9',
            }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: i < currentExIdx ? '#0d9e6e' : i === currentExIdx ? '#dcfce7' : '#f1f5f9',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
              <Text
                style={{
                  color: i < currentExIdx ? '#fff' : i === currentExIdx ? '#16a34a' : '#94a3b8',
                  fontSize: 12,
                  fontWeight: '700',
                }}>
                {i < currentExIdx ? '✓' : i + 1}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                style={{
                  color: i === currentExIdx ? '#16a34a' : '#1e293b',
                  fontWeight: i === currentExIdx ? '700' : '500',
                  fontSize: 14,
                }}>
                {ex.exercise.name}
              </Text>
              <Text className="text-muted-foreground text-xs">
                {ex.sets.length} series
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom action buttons */}
      <View
        style={{
          padding: 16,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          gap: 10,
        }}>
        {phase === 'idle' && (
          <TouchableOpacity
            onPress={() => setPhase('working')}
            style={{
              backgroundColor: '#0d9e6e',
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
            }}>
            <Text className="text-white font-bold text-base">▶ Iniciar Serie</Text>
          </TouchableOpacity>
        )}
        {phase === 'working' && (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={markSetDone}
              style={{
                flex: 1,
                backgroundColor: '#0d9e6e',
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: 'center',
              }}>
              <Text className="text-white font-bold text-base">✓ Serie Completada</Text>
            </TouchableOpacity>
          </View>
        )}
        {phase === 'idle' && doneSets > 0 && (
          <TouchableOpacity
            onPress={nextSet}
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: 'center',
            }}>
            <Text className="text-foreground font-semibold text-sm">Siguiente →</Text>
          </TouchableOpacity>
        )}
        {phase === 'idle' && currentExIdx === routine.exercises.length - 1 && currentSetIdx === currentEx.sets.length - 1 && (
          <TouchableOpacity
            onPress={handleFinish}
            style={{
              backgroundColor: '#7c3aed',
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: 'center',
            }}>
            <Text className="text-white font-bold text-sm">🏁 Finalizar Entrenamiento</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
