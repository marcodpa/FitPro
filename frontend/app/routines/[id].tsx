import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FakeRoutineService } from '@/lib/services';
import type { Routine } from '@/lib/types';
import { useAppStore, useTheme } from '@/lib/store';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import {
  ChevronLeft,
  Edit3,
  Clock,
  Dumbbell,
  Tag,
  Play,
  Mic,
  MicOff,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useVoiceCommands, COMMANDS } from '@/lib/useVoiceCommands';

// ─── Voice commands para la rutina ───────────────────────────────────────────
const ROUTINE_VOICE_COMMANDS = [
  { pattern: /\biniciar?\b|\bempez[ae]r?\b|\bstart\b/i,          label: 'Iniciar',         action: 'start' },
  { pattern: /\bvolver?\b|\bregres[ae]r?\b|\batr[aá]s\b|\bback\b/i, label: 'Volver',      action: 'back' },
  { pattern: /\bejercici[oa]s?\b|\blista\b/i,                    label: 'Ver ejercicios',  action: 'scroll' },
];

// ─── Pulse animation ──────────────────────────────────────────────────────────
function PulseRing({ color, active }: { color: string; active: boolean }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const opacity = React.useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!active) { scale.setValue(1); opacity.setValue(0); return; }
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.6, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1,   duration: 900, easing: Easing.in(Easing.ease),  useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active]);

  if (!active) return null;
  return (
    <Animated.View style={{
      position: 'absolute',
      width: 60, height: 60, borderRadius: 30,
      backgroundColor: color,
      transform: [{ scale }],
      opacity,
    }} />
  );
}

// ─── Voice FAB ────────────────────────────────────────────────────────────────
function VoiceFAB({ voiceEnabled }: { voiceEnabled: boolean }) {
  const t = useTheme();
  const router = useRouter();
  const [lastCmd, setLastCmd] = useState<string | null>(null);

  const handleCommand = useCallback((action: string, label: string) => {
    setLastCmd(label);
    setTimeout(() => setLastCmd(null), 2000);
    if (action === 'start') {
      // handled by parent via ref — we'll just show label here
    } else if (action === 'back') {
      router.back();
    }
    // scroll handled visually via label
  }, [router]);

  const { status, activate } = useVoiceCommands({
    enabled: voiceEnabled,
    onCommand: handleCommand,
  });

  const isListening  = status === 'listening';
  const isStandby    = status === 'standby';
  const isProcessing = status === 'processing';

  if (!voiceEnabled) return null;

  const fabColor = isListening ? t.accent : isStandby ? t.text.tertiary : t.bg.elevated;

  return (
    <View style={{ position: 'absolute', bottom: 110, right: 20, alignItems: 'center', gap: 8 }}>
      {/* Command toast */}
      {lastCmd && (
        <View style={{ backgroundColor: t.accent, borderRadius: RADIUS.lg, paddingHorizontal: 14, paddingVertical: 8, maxWidth: 180 }}>
          <Text style={{ color: t.accentText, fontSize: FONT.sm, fontWeight: '700', textAlign: 'center' }}>
            {lastCmd}
          </Text>
        </View>
      )}

      {/* Transcript label in standby */}
      {isStandby && (
        <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.lg, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: t.border.subtle }}>
          <Text style={{ color: t.text.tertiary, fontSize: 10, fontWeight: '600' }}>Di "Ey Fit Pro"</Text>
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity onPress={activate} activeOpacity={0.85} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <PulseRing color={t.accent} active={isListening} />
        <View style={{
          width: 50, height: 50, borderRadius: 25,
          backgroundColor: isListening ? t.accent : t.bg.card,
          borderWidth: isListening ? 0 : 1.5,
          borderColor: isStandby ? t.border.default : t.accent,
          alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}>
          {isProcessing
            ? <ActivityIndicator size="small" color={t.accent} />
            : isListening
            ? <Mic size={20} color={t.accentText} strokeWidth={2} />
            : <Mic size={18} color={isStandby ? t.text.tertiary : t.accent} strokeWidth={2} />
          }
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ─── Exercise Row ──────────────────────────────────────────────────────────────
function ExerciseRow({ re, idx, t }: { re: any; idx: number; t: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: t.border.subtle }}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: SPACING.lg }}>
        {/* Number */}
        <View style={{ width: 34, height: 34, borderRadius: RADIUS.md, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Text style={{ color: t.accent, fontWeight: '800', fontSize: FONT.sm }}>{idx + 1}</Text>
        </View>
        {/* Info */}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base, letterSpacing: -0.2 }}>
            {re.exercise.name}
          </Text>
          <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '500' }}>
            {re.exercise.muscle} • {re.sets.length} series
          </Text>
        </View>
        {expanded
          ? <ChevronUp  size={16} color={t.text.tertiary} strokeWidth={2} />
          : <ChevronDown size={16} color={t.text.tertiary} strokeWidth={2} />
        }
      </TouchableOpacity>

      {expanded && (
        <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg }}>
          {/* Sets table */}
          <View style={{ backgroundColor: t.bg.tertiary, borderRadius: RADIUS.lg, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
              {['Serie', 'Reps', 'Peso', 'Descanso'].map((h) => (
                <Text key={h} style={{ flex: 1, color: t.text.tertiary, fontSize: 10, fontWeight: '700', textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {h}
                </Text>
              ))}
            </View>
            {re.sets.map((set: any, si: number) => (
              <View key={si} style={{ flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: si < re.sets.length - 1 ? 1 : 0, borderBottomColor: t.border.subtle }}>
                <Text style={{ flex: 1, textAlign: 'center', color: t.accent, fontSize: FONT.sm, fontWeight: '700' }}>{si + 1}</Text>
                <Text style={{ flex: 1, textAlign: 'center', color: t.text.primary, fontSize: FONT.sm }}>{set.duration ? `${set.duration}s` : set.reps}</Text>
                <Text style={{ flex: 1, textAlign: 'center', color: t.text.primary, fontSize: FONT.sm }}>{set.weight ? `${set.weight}kg` : '—'}</Text>
                <Text style={{ flex: 1, textAlign: 'center', color: t.text.secondary, fontSize: FONT.sm }}>{set.rest}s</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { activeRole, voiceEnabled } = useAppStore();
  const t = useTheme();

  useEffect(() => {
    if (!id) return;
    FakeRoutineService.getById(id)
      .then(setRoutine)
      .finally(() => setLoading(false));
  }, [id]);

  const diffStyle = {
    beginner:     { color: t.success,  dim: t.successDim,  label: 'Principiante' },
    intermediate: { color: t.warning,  dim: t.warningDim,  label: 'Intermedio'   },
    advanced:     { color: t.danger,   dim: t.dangerDim,   label: 'Avanzado'     },
  } as const;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg.primary }}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg.primary }}>
        <Text style={{ color: t.text.secondary }}>Rutina no encontrada</Text>
      </View>
    );
  }

  const diff = diffStyle[routine.difficulty as keyof typeof diffStyle] ?? diffStyle.beginner;
  const muscles = Array.from(new Set(routine.exercises.map((e) => e.exercise.muscle)));

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: routine.imageUrl }} style={{ width: '100%', height: 320 }} resizeMode="cover" />
          <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />

          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ position: 'absolute', top: 56, left: 20, width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={22} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Edit (trainer only) */}
          {activeRole === 'trainer' && (
            <TouchableOpacity
              onPress={() => router.push(`/routines/edit/${id}` as any)}
              style={{ position: 'absolute', top: 56, right: 20, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10 }}>
              <Edit3 size={14} color="#fff" strokeWidth={2} />
              <Text style={{ color: '#fff', fontSize: FONT.sm, fontWeight: '700' }}>Editar</Text>
            </TouchableOpacity>
          )}

          {/* Bottom info overlay */}
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingTop: 60, backgroundColor: 'rgba(0,0,0,0.65)' }}>
            {/* Badges */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <View style={{ backgroundColor: diff.dim, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: diff.color + '40' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: diff.color }} />
                  <Text style={{ color: diff.color, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>{diff.label.toUpperCase()}</Text>
                </View>
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>{routine.category.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 28, letterSpacing: -1, lineHeight: 34 }}>
              {routine.name}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={{ padding: SPACING.xxl, gap: SPACING.xxl }}>
          {/* Meta cards */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: Clock,    value: `${routine.duration} min`, label: 'Duración',   color: t.info    },
              { icon: Dumbbell, value: `${routine.exercises.length}`,  label: 'Ejercicios', color: t.accent  },
              { icon: Tag,      value: routine.category,           label: 'Categoría',  color: t.orange  },
            ].map((m) => (
              <View key={m.label} style={{ flex: 1, backgroundColor: t.bg.card, borderRadius: RADIUS.lg, padding: 14, gap: 8, alignItems: 'center', borderWidth: 1, borderColor: t.border.subtle }}>
                <View style={{ width: 34, height: 34, borderRadius: RADIUS.md, backgroundColor: m.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                  <m.icon size={16} color={m.color} strokeWidth={2} />
                </View>
                <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.base, letterSpacing: -0.3 }}>{m.value}</Text>
                <Text style={{ color: t.text.tertiary, fontSize: 10, fontWeight: '500' }}>{m.label}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text style={{ color: t.text.secondary, fontSize: FONT.md, lineHeight: 24 }}>
            {routine.description}
          </Text>

          {/* Muscle tags */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {muscles.map((m) => (
              <View key={m} style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: t.border.default }}>
                <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>{m}</Text>
              </View>
            ))}
          </View>

          {/* Voice hint */}
          {voiceEnabled && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.accentDim, borderRadius: RADIUS.lg, padding: 14, borderWidth: 1, borderColor: t.accent + '30' }}>
              <View style={{ width: 32, height: 32, borderRadius: RADIUS.md, backgroundColor: t.accent + '20', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={14} color={t.accent} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.accent, fontWeight: '700', fontSize: FONT.sm }}>Comandos de voz activos</Text>
                <Text style={{ color: t.text.secondary, fontSize: 11, marginTop: 1 }}>
                  Di "iniciar", "volver" o "Ey Fit Pro" para activar
                </Text>
              </View>
            </View>
          )}

          {/* Exercises */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <View style={{ width: 32, height: 32, borderRadius: RADIUS.md, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={14} color={t.accent} strokeWidth={2} />
              </View>
              <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xl, letterSpacing: -0.4 }}>
                Ejercicios
              </Text>
              <View style={{ marginLeft: 'auto' as any, backgroundColor: t.bg.card, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: t.border.default }}>
                <Text style={{ color: t.text.secondary, fontSize: 11, fontWeight: '700' }}>{routine.exercises.length} ejerc.</Text>
              </View>
            </View>
            {routine.exercises.map((re, idx) => (
              <ExerciseRow key={re.exerciseId} re={re} idx={idx} t={t} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Voice FAB */}
      <VoiceFAB voiceEnabled={!!voiceEnabled} />

      {/* Start button */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.xl, paddingBottom: 32, backgroundColor: t.bg.primary, borderTopWidth: 1, borderTopColor: t.border.subtle }}>
        <TouchableOpacity
          onPress={() => router.push(`/workout/session?routineId=${routine.id}` as any)}
          activeOpacity={0.88}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: t.accent, borderRadius: RADIUS.lg, paddingVertical: 18 }}>
          <Play size={18} color={t.accentText} strokeWidth={2.5} />
          <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3 }}>
            Iniciar Entrenamiento
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
