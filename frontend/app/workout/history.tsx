import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/store';
import { FakeWorkoutService } from '@/lib/services';
import type { WorkoutSession } from '@/lib/types';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { ArrowLeft, CheckCircle, Clock, Dumbbell, Flame, TrendingUp, Calendar } from 'lucide-react-native';

function pad(n: number) { return String(n).padStart(2, '0'); }

function formatDuration(mins?: number) {
  if (!mins) return '—';
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function difficultyColor(d?: string) {
  if (d === 'beginner')     return '#22c55e';
  if (d === 'intermediate') return '#f59e0b';
  if (d === 'advanced')     return '#ef4444';
  return '#6b7280';
}

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const t      = useTheme();
  const [sessions,   setSessions]   = useState<WorkoutSession[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await FakeWorkoutService.getHistory('');
      setSessions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch { /* offline fallback — empty list */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const completed = sessions.filter((s) => s.status === 'completed');
  const totalMins = completed.reduce((sum, s) => sum + (s.duration ?? 0), 0);
  const streak = (() => {
    const dates = completed.map((s) => s.date).sort().reverse();
    let count = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (dates[i] === expected.toISOString().split('T')[0]) count++;
      else break;
    }
    return count;
  })();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{
        backgroundColor: t.bg.secondary, paddingTop: 56, paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.xl, borderBottomWidth: 1, borderBottomColor: t.border.subtle,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={18} color={t.text.primary} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xl }}>Historial</Text>
            <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>Tus entrenamientos completados</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          {[
            { icon: CheckCircle, value: String(completed.length), label: 'Sesiones', color: t.success },
            { icon: Clock,       value: totalMins >= 60 ? `${Math.floor(totalMins/60)}h` : `${totalMins}m`, label: 'Total', color: t.info },
            { icon: Flame,       value: streak > 0 ? `${streak}d` : '—', label: 'Racha', color: t.orange },
          ].map((s) => (
            <View key={s.label} style={{
              flex: 1, backgroundColor: t.bg.elevated, borderRadius: RADIUS.lg,
              padding: SPACING.md, alignItems: 'center', gap: 4,
              borderWidth: 1, borderColor: t.border.subtle,
            }}>
              <s.icon size={16} color={s.color} />
              <Text style={{ color: t.text.primary, fontWeight: '900', fontSize: FONT.xl }}>{s.value}</Text>
              <Text style={{ color: t.text.tertiary, fontSize: 10, fontWeight: '600' }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : sessions.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md, padding: SPACING.xxl }}>
          <View style={{ width: 64, height: 64, borderRadius: RADIUS.xl, backgroundColor: t.bg.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.border.subtle }}>
            <Dumbbell size={28} color={t.text.tertiary} strokeWidth={1.5} />
          </View>
          <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.lg }}>Sin entrenamientos</Text>
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, textAlign: 'center' }}>
            Completa tu primer entrenamiento para verlo aquí.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/routines' as any)}
            style={{ backgroundColor: t.accent, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm + 2 }}>
            <Text style={{ color: t.accentText, fontWeight: '700' }}>Ver rutinas</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.md }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={t.accent} />}>

          {sessions.map((session) => {
            const isCompleted = session.status === 'completed';
            const routineName = session.routine?.name ?? 'Rutina';
            const routineImg  = session.routine?.imageUrl;
            const diff        = session.routine?.difficulty;
            return (
              <TouchableOpacity
                key={session.id}
                onPress={() => session.routine?.id && router.push(`/routines/${session.routine.id}` as any)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
                  overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle,
                  flexDirection: 'row',
                }}>
                {/* Thumbnail */}
                <View style={{ width: 80 }}>
                  {routineImg ? (
                    <Image source={{ uri: routineImg }} style={{ width: 80, height: '100%', minHeight: 80 }} resizeMode="cover" />
                  ) : (
                    <View style={{ width: 80, height: 80, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
                      <Dumbbell size={24} color={t.text.tertiary} />
                    </View>
                  )}
                  {/* Status overlay */}
                  <View style={{
                    position: 'absolute', top: 6, left: 6,
                    width: 22, height: 22, borderRadius: 11,
                    backgroundColor: isCompleted ? t.success : '#6b728080',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckCircle size={12} color="#fff" />
                  </View>
                </View>

                {/* Info */}
                <View style={{ flex: 1, padding: SPACING.md, gap: 4 }}>
                  <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }} numberOfLines={1}>
                    {routineName}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                    <Calendar size={11} color={t.text.tertiary} />
                    <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>{formatDate(session.date)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: 2 }}>
                    {session.duration ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: t.bg.elevated, borderRadius: RADIUS.sm, paddingHorizontal: 7, paddingVertical: 3 }}>
                        <Clock size={10} color={t.info} />
                        <Text style={{ color: t.info, fontSize: 10, fontWeight: '700' }}>{formatDuration(session.duration)}</Text>
                      </View>
                    ) : null}
                    {diff ? (
                      <View style={{ borderRadius: RADIUS.sm, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: difficultyColor(diff) + '20' }}>
                        <Text style={{ color: difficultyColor(diff), fontSize: 10, fontWeight: '700' }}>
                          {diff === 'beginner' ? 'Principiante' : diff === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                        </Text>
                      </View>
                    ) : null}
                    {!isCompleted && (
                      <View style={{ borderRadius: RADIUS.sm, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: t.border.subtle }}>
                        <Text style={{ color: t.text.tertiary, fontSize: 10, fontWeight: '700' }}>Saltado</Text>
                      </View>
                    )}
                  </View>
                  {session.notes ? (
                    <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }} numberOfLines={1}>
                      {session.notes}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 16 }} />
        </ScrollView>
      )}
    </View>
  );
}
