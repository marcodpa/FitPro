import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RoutineService, WorkoutService } from '@/lib/services';
import type { Routine } from '@/lib/types';
import { useAppStore, useTheme } from '@/lib/store';
import { useVoiceCommands } from '@/lib/useVoiceCommands';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import {
  X,
  Play,
  CheckCircle2,
  SkipForward,
  ChevronRight,
  Dumbbell,
  Clock,
  Zap,
  Trophy,
  Mic,
  RotateCcw,
} from 'lucide-react-native';

type Phase = 'idle' | 'working' | 'resting' | 'done';

function pad(n: number) { return String(n).padStart(2, '0'); }
function formatTime(s: number) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

// ─── Circular progress ring ────────────────────────────────────────────────────
function CircularTimer({
  value, max, size = 220, color, children,
}: { value: number; max: number; size?: number; color: string; children: React.ReactNode }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const dashOffset = circ * (1 - progress);
  const animRef = useRef(new Animated.Value(circ)).current;

  useEffect(() => {
    Animated.timing(animRef, {
      toValue: dashOffset,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [dashOffset]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 8, borderColor: color + '20' }} />
      {/* Progress indicator — simple View approach */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: 8, borderColor: color,
        borderTopColor: progress < 0.25 ? 'transparent' : color,
        borderRightColor: progress < 0.5 ? 'transparent' : color,
        borderBottomColor: progress < 0.75 ? 'transparent' : color,
        transform: [{ rotate: `${progress * 360 - 90}deg` }],
        opacity: progress > 0 ? 1 : 0,
      }} />
      {children}
    </View>
  );
}

// ─── Phase card ────────────────────────────────────────────────────────────────
function PhaseCard({ phase, elapsed, restTimer, currentSet, t }: {
  phase: Phase;
  elapsed: number;
  restTimer: number;
  currentSet: any;
  t: any;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (phase === 'working') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [phase]);

  if (phase === 'resting') {
    const maxRest = currentSet?.rest ?? 60;
    return (
      <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
        <Text style={{ color: t.info, fontSize: FONT.sm, fontWeight: '700', letterSpacing: 1.5, marginBottom: 20 }}>
          DESCANSANDO
        </Text>
        <CircularTimer value={maxRest - restTimer} max={maxRest} size={220} color={t.info}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: t.text.primary, fontSize: 64, fontWeight: '800', letterSpacing: -2, lineHeight: 72 }}>
              {formatTime(restTimer)}
            </Text>
            <Text style={{ color: t.text.tertiary, fontSize: FONT.sm, fontWeight: '500' }}>restante</Text>
          </View>
        </CircularTimer>
      </View>
    );
  }

  if (phase === 'working') {
    return (
      <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
        <Text style={{ color: t.accent, fontSize: FONT.sm, fontWeight: '700', letterSpacing: 1.5, marginBottom: 20 }}>
          EN PROGRESO
        </Text>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <CircularTimer value={elapsed} max={Math.max(elapsed, 1)} size={220} color={t.accent}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: t.accent, fontSize: 64, fontWeight: '800', letterSpacing: -2, lineHeight: 72 }}>
                {formatTime(elapsed)}
              </Text>
              <Text style={{ color: t.text.tertiary, fontSize: FONT.sm, fontWeight: '500' }}>transcurrido</Text>
            </View>
          </CircularTimer>
        </Animated.View>
      </View>
    );
  }

  // idle
  return (
    <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
      <Text style={{ color: t.text.tertiary, fontSize: FONT.sm, fontWeight: '700', letterSpacing: 1.5, marginBottom: 20 }}>
        PRÓXIMA SERIE
      </Text>
      <View style={{ width: 220, height: 220, borderRadius: 110, backgroundColor: t.bg.card, borderWidth: 8, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <View style={{ width: 52, height: 52, borderRadius: RADIUS.xl, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
          <Dumbbell size={24} color={t.accent} strokeWidth={2} />
        </View>
        <Text style={{ color: t.text.primary, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
          {currentSet?.duration ? `${currentSet.duration}s` : `${currentSet?.reps ?? '—'} reps`}
        </Text>
        {currentSet?.weight ? (
          <Text style={{ color: t.text.secondary, fontSize: FONT.base, fontWeight: '600' }}>
            {currentSet.weight} kg
          </Text>
        ) : null}
        <Text style={{ color: t.text.tertiary, fontSize: FONT.sm }}>Listo para comenzar</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function WorkoutSessionScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const router = useRouter();
  const t = useTheme();
  const { voiceEnabled } = useAppStore();

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

  useEffect(() => {
    if (!routineId) return;
    RoutineService.getById(routineId).then(setRoutine).catch(() => {});
  }, [routineId]);


  useEffect(() => {
    totalRef.current = setInterval(() => setTotalElapsed((s) => s + 1), 1000);
    return () => { if (totalRef.current) clearInterval(totalRef.current); };
  }, []);

  useEffect(() => {
    if (phase === 'working') {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (phase === 'resting') {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
      const rest = routine?.exercises[currentExIdx]?.sets[currentSetIdx]?.rest ?? 60;
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const markSetDone = useCallback(() => {
    setCompletedSets((prev) => ({ ...prev, [`${currentExIdx}-${currentSetIdx}`]: true }));
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

  const skipRest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('idle');
    nextSet();
  }, [nextSet]);

  const confirmExit = () => {
    Alert.alert('Salir del entrenamiento', '¿Seguro que quieres salir? Se perderá el progreso.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  // ── Voice commands during workout ────────────────────────────────────────
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const handleVoiceCommand = useCallback((action: string) => {
    const p = phaseRef.current;
    switch (action) {
      case 'workout:start':   if (p === 'idle')    setPhase('working'); break;
      case 'workout:done':    if (p === 'working') markSetDone();       break;
      case 'workout:skip':    if (p === 'resting') skipRest();          break;
      case 'workout:next':    nextSet();                                 break;
      case 'workout:finish':  setPhase('done');                         break;
      case 'nav:back':        confirmExit();                            break;
    }
  }, [markSetDone, skipRest, nextSet]); // eslint-disable-line

  useVoiceCommands({
    enabled: voiceEnabled,
    lang: 'es-ES',
    onCommand: handleVoiceCommand,
    extraCommands: [
      { pattern: /\b(iniciar|empezar|comenzar)\s*(serie|set)?\b/i,           action: 'workout:start',  label: 'Iniciar serie' },
      { pattern: /\b(complet[ao]|hech[ao]|listo|termina[do]?)\s*(serie)?\b/i, action: 'workout:done',   label: 'Serie completada' },
      { pattern: /\b(saltar?)\s*(descanso)?\b/i,                              action: 'workout:skip',   label: 'Saltar descanso' },
      { pattern: /\b(siguiente|sigue)\b/i,                                    action: 'workout:next',   label: 'Siguiente ejercicio' },
      { pattern: /\b(finalizar|terminar|acabar)\s*(entrenamiento)?\b/i,       action: 'workout:finish', label: 'Finalizar entrenamiento' },
      { pattern: /\b(salir|volver)\b/i,                                       action: 'nav:back',       label: 'Salir' },
    ],
  });

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (!routine) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 56, height: 56, borderRadius: RADIUS.xl, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={24} color={t.accent} strokeWidth={2} />
        </View>
        <Text style={{ color: t.text.secondary, fontSize: FONT.base, marginTop: 14 }}>Cargando rutina...</Text>
      </View>
    );
  }

  // ── Done screen ──────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const completedCount = Object.keys(completedSets).length;
    const totalSetsAll = routine.exercises.reduce((a, e) => a + e.sets.length, 0);
    return (
      <View style={{ flex: 1, backgroundColor: t.bg.primary, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxxl ?? 32 }}>
        <StatusBar barStyle={t.isDark ? 'light-content' : 'dark-content'} />
        {/* Trophy */}
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: t.accentDim, borderWidth: 3, borderColor: t.accent + '40', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
          <Trophy size={44} color={t.accent} strokeWidth={1.8} />
        </View>
        <Text style={{ color: t.text.primary, fontSize: 32, fontWeight: '800', letterSpacing: -1, textAlign: 'center', lineHeight: 38 }}>
          ¡Entrenamiento{'\n'}Completado!
        </Text>
        <Text style={{ color: t.text.secondary, fontSize: FONT.base, marginTop: 10, marginBottom: 36, textAlign: 'center' }}>
          Lo hiciste increíble. Así se construye el progreso.
        </Text>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 40 }}>
          {[
            { icon: Clock,    value: formatTime(totalElapsed), label: 'Duración' },
            { icon: Dumbbell, value: `${completedCount}/${totalSetsAll}`, label: 'Series' },
            { icon: Zap,      value: `${routine.exercises.length}`, label: 'Ejercicios' },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: t.border.subtle }}>
              <View style={{ width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={16} color={t.accent} strokeWidth={2} />
              </View>
              <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.5 }}>{s.value}</Text>
              <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '500' }}>{s.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.88}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: t.accent, borderRadius: RADIUS.lg, paddingVertical: 18, paddingHorizontal: 48 }}>
          <CheckCircle2 size={18} color={t.accentText} strokeWidth={2.5} />
          <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3 }}>Ver Resumen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Session ──────────────────────────────────────────────────────────────────
  const currentEx  = routine.exercises[currentExIdx];
  const currentSet = currentEx.sets[currentSetIdx];
  const totalSets  = routine.exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets   = Object.keys(completedSets).length;
  const progress   = doneSets / Math.max(totalSets, 1);
  const isLastSet  = currentExIdx === routine.exercises.length - 1 && currentSetIdx === currentEx.sets.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <StatusBar barStyle={t.isDark ? 'light-content' : 'dark-content'} />

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <View style={{ paddingTop: 56, paddingHorizontal: SPACING.xxl, paddingBottom: SPACING.lg, backgroundColor: t.bg.primary, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          {/* Exit */}
          <TouchableOpacity
            onPress={confirmExit}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, width: 80, height: 36, borderRadius: RADIUS.md, backgroundColor: t.bg.card, borderWidth: 1, borderColor: t.border.default, justifyContent: 'center' }}>
            <X size={14} color={t.danger} strokeWidth={2.5} />
            <Text style={{ color: t.danger, fontSize: FONT.sm, fontWeight: '700' }}>Salir</Text>
          </TouchableOpacity>

          {/* Total timer */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.accent }} />
            <Text style={{ color: t.text.primary, fontSize: FONT.xl, fontWeight: '800', letterSpacing: -0.5 }}>
              {formatTime(totalElapsed)}
            </Text>
          </View>

          {/* Series counter / Voice indicator */}
          {voiceEnabled ? (
            <View style={{ width: 80, height: 36, borderRadius: RADIUS.md, backgroundColor: t.accentDim, borderWidth: 1, borderColor: t.accent + '40', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 }}>
              <Mic size={12} color={t.accent} strokeWidth={2.5} />
              <Text style={{ color: t.accent, fontSize: FONT.xs, fontWeight: '700' }}>VOZ</Text>
            </View>
          ) : (
            <View style={{ width: 80, height: 36, borderRadius: RADIUS.md, backgroundColor: t.bg.card, borderWidth: 1, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '700' }}>
                {doneSets}/{totalSets}
              </Text>
            </View>
          )}
        </View>

        {/* Progress bar */}
        <View style={{ height: 6, backgroundColor: t.bg.elevated, borderRadius: 3, overflow: 'hidden' }}>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: t.accent, width: `${progress * 100}%` }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
          <Text style={{ color: t.text.tertiary, fontSize: 10, fontWeight: '600' }}>
            {Math.round(progress * 100)}% completado
          </Text>
          <Text style={{ color: t.text.tertiary, fontSize: 10, fontWeight: '600' }}>
            {totalSets - doneSets} series restantes
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* ── Current exercise info ─────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: SPACING.xxl, paddingTop: SPACING.xl }}>
          <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}>
            EJERCICIO {currentExIdx + 1} DE {routine.exercises.length}
          </Text>
          <Text style={{ color: t.text.primary, fontSize: 28, fontWeight: '800', letterSpacing: -0.8, lineHeight: 34 }}>
            {currentEx.exercise.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: t.border.default }}>
              <Text style={{ color: t.text.secondary, fontSize: 11, fontWeight: '600' }}>{currentEx.exercise.muscle}</Text>
            </View>
            <View style={{ backgroundColor: t.accentDim, borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: t.accent + '30' }}>
              <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700' }}>
                Serie {currentSetIdx + 1} de {currentEx.sets.length}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Timer / Phase card ────────────────────────────────────────────── */}
        <PhaseCard
          phase={phase}
          elapsed={elapsed}
          restTimer={restTimer}
          currentSet={currentSet}
          t={t}
        />

        {/* ── Set details strip ─────────────────────────────────────────────── */}
        <View style={{ marginHorizontal: SPACING.xxl, backgroundColor: t.bg.card, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: t.border.subtle, overflow: 'hidden', marginBottom: SPACING.xl }}>
          <View style={{ flexDirection: 'row' }}>
            {[
              { label: 'Series',         value: `${currentSetIdx + 1}/${currentEx.sets.length}` },
              { label: 'Reps/Duración',  value: currentSet.duration ? `${currentSet.duration}s` : `${currentSet.reps}` },
              { label: 'Peso',           value: currentSet.weight ? `${currentSet.weight}kg` : '—' },
              { label: 'Descanso',       value: `${currentSet.rest}s` },
            ].map((item, i, arr) => (
              <View
                key={item.label}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 16, borderRightWidth: i < arr.length - 1 ? 1 : 0, borderRightColor: t.border.subtle }}>
                <Text style={{ color: t.text.tertiary, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase' }}>
                  {item.label}
                </Text>
                <Text style={{ color: t.text.primary, fontSize: FONT.lg, fontWeight: '800', letterSpacing: -0.3 }}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Exercise list ─────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: SPACING.xxl, marginBottom: SPACING.xl }}>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3, marginBottom: 14 }}>
            Orden de ejercicios
          </Text>
          <View style={{ gap: 8 }}>
            {routine.exercises.map((ex, i) => {
              const isDone    = i < currentExIdx;
              const isCurrent = i === currentExIdx;
              return (
                <View
                  key={ex.exerciseId}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    padding: SPACING.lg, borderRadius: RADIUS.lg,
                    backgroundColor: isCurrent ? t.accentDim : t.bg.card,
                    borderWidth: 1,
                    borderColor: isCurrent ? t.accent + '40' : isDone ? t.success + '30' : t.border.subtle,
                  }}>
                  {/* Status circle */}
                  <View style={{
                    width: 32, height: 32, borderRadius: RADIUS.md,
                    backgroundColor: isDone ? t.success : isCurrent ? t.accent : t.bg.elevated,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isDone
                      ? <CheckCircle2 size={16} color="#fff" strokeWidth={2.5} />
                      : <Text style={{ color: isCurrent ? t.accentText : t.text.tertiary, fontWeight: '800', fontSize: FONT.sm }}>{i + 1}</Text>
                    }
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isCurrent ? t.accent : isDone ? t.text.tertiary : t.text.primary, fontWeight: isCurrent ? '800' : '600', fontSize: FONT.base, letterSpacing: -0.2 }}>
                      {ex.exercise.name}
                    </Text>
                    <Text style={{ color: t.text.tertiary, fontSize: 11, marginTop: 2 }}>
                      {ex.sets.length} series • {ex.exercise.muscle}
                    </Text>
                  </View>
                  {isCurrent && <ChevronRight size={14} color={t.accent} strokeWidth={2.5} />}
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* ── Bottom action area ────────────────────────────────────────────────── */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: t.bg.primary, borderTopWidth: 1, borderTopColor: t.border.subtle,
        padding: SPACING.xl, paddingBottom: 32, gap: 10,
      }}>
        {/* IDLE */}
        {phase === 'idle' && (
          <>
            <TouchableOpacity
              onPress={() => setPhase('working')}
              activeOpacity={0.88}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: t.accent, borderRadius: RADIUS.lg, paddingVertical: 18 }}>
              <Play size={18} color={t.accentText} strokeWidth={2.5} />
              <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3 }}>
                Iniciar Serie
              </Text>
            </TouchableOpacity>
            {doneSets > 0 && !isLastSet && (
              <TouchableOpacity
                onPress={nextSet}
                activeOpacity={0.8}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: t.bg.card, borderRadius: RADIUS.lg, paddingVertical: 14, borderWidth: 1, borderColor: t.border.default }}>
                <SkipForward size={15} color={t.text.secondary} strokeWidth={2} />
                <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.base }}>Saltar al siguiente</Text>
              </TouchableOpacity>
            )}
            {isLastSet && doneSets > 0 && (
              <TouchableOpacity
                onPress={() => setPhase('done')}
                activeOpacity={0.88}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: t.accent + '20', borderRadius: RADIUS.lg, paddingVertical: 14, borderWidth: 1, borderColor: t.accent + '40' }}>
                <Trophy size={16} color={t.accent} strokeWidth={2} />
                <Text style={{ color: t.accent, fontWeight: '800', fontSize: FONT.base }}>Finalizar Entrenamiento</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* WORKING */}
        {phase === 'working' && (
          <TouchableOpacity
            onPress={markSetDone}
            activeOpacity={0.88}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: t.accent, borderRadius: RADIUS.lg, paddingVertical: 18 }}>
            <CheckCircle2 size={18} color={t.accentText} strokeWidth={2.5} />
            <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3 }}>
              Serie Completada
            </Text>
          </TouchableOpacity>
        )}

        {/* RESTING */}
        {phase === 'resting' && (
          <TouchableOpacity
            onPress={skipRest}
            activeOpacity={0.88}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: t.bg.card, borderRadius: RADIUS.lg, paddingVertical: 18, borderWidth: 1, borderColor: t.info + '40' }}>
            <SkipForward size={18} color={t.info} strokeWidth={2.5} />
            <Text style={{ color: t.info, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3 }}>
              Saltar descanso
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
