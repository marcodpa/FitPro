import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FakeWorkoutService } from '@/lib/services';
import type { WorkoutSession } from '@/lib/types';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { ArrowLeft, TrendingUp, Flame, Dumbbell, Clock, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CHART_W = width - SPACING.xl * 2 - 32;
const CHART_H = 120;

function LineChart({ points, color }: { points: number[]; color: string }) {
  const t = useTheme();
  if (points.length < 2) return (
    <View style={{ height: CHART_H, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>Sin suficientes datos</Text>
    </View>
  );
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const normalized = points.map((v) => ((v - min) / range) * (CHART_H - 20));
  const segW = CHART_W / (points.length - 1);

  return (
    <View style={{ height: CHART_H, position: 'relative' }}>
      {/* Grid lines */}
      {[0, 0.5, 1].map((f) => (
        <View key={f} style={{
          position: 'absolute', left: 0, right: 0,
          top: f * (CHART_H - 20),
          height: 1, backgroundColor: t.border.subtle,
        }} />
      ))}
      {/* Points and lines */}
      {normalized.map((y, i) => {
        const x = i * segW;
        const top = CHART_H - 20 - y;
        return (
          <React.Fragment key={i}>
            {i > 0 && (() => {
              const prevY = CHART_H - 20 - normalized[i - 1];
              const prevX = (i - 1) * segW;
              const dx = x - prevX;
              const dy = top - prevY;
              const len = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * 180 / Math.PI;
              return (
                <View style={{
                  position: 'absolute',
                  left: prevX, top: prevY + 4,
                  width: len, height: 2,
                  backgroundColor: color + '80',
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: '0 50%',
                }} />
              );
            })()}
            <View style={{
              position: 'absolute', left: x - 4, top: top,
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: i === points.length - 1 ? color : t.bg.card,
              borderWidth: 2, borderColor: color,
            }} />
          </React.Fragment>
        );
      })}
      {/* Labels */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: t.text.tertiary, fontSize: 9 }}>{min}</Text>
        <Text style={{ color: t.text.tertiary, fontSize: 9 }}>{max}</Text>
      </View>
    </View>
  );
}

function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const t = useTheme();
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.max(8, (CHART_W / data.length) - 6);
  return (
    <View style={{ height: CHART_H + 20 }}>
      <View style={{ height: CHART_H, flexDirection: 'row', alignItems: 'flex-end', gap: 4, justifyContent: 'space-around' }}>
        {data.map((d, i) => (
          <View key={i} style={{ alignItems: 'center', gap: 3 }}>
            <View style={{ width: barW, height: Math.max(4, (d.value / max) * (CHART_H - 20)), backgroundColor: color, borderRadius: 3, opacity: i === data.length - 1 ? 1 : 0.5 }} />
            <Text style={{ color: t.text.tertiary, fontSize: 9 }}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const router = useRouter();
  const t      = useTheme();
  const { user } = useAppStore();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    FakeWorkoutService.getHistory('').then(setSessions).finally(() => setLoading(false));
  }, []);

  const completed = sessions.filter((s) => s.status === 'completed');

  // Sessions per week (last 8 weeks)
  const weeklyData = (() => {
    const weeks: { label: string; value: number }[] = [];
    for (let w = 7; w >= 0; w--) {
      const start = new Date(); start.setDate(start.getDate() - w * 7 - 6);
      const end   = new Date(); end.setDate(end.getDate() - w * 7);
      const count = completed.filter((s) => {
        const d = new Date(s.date);
        return d >= start && d <= end;
      }).length;
      weeks.push({ label: `S${8 - w}`, value: count });
    }
    return weeks;
  })();

  // Minutes per session (last 10)
  const durationPoints = completed.slice(-10).map((s) => s.duration ?? 0);

  // Monthly count (last 6 months)
  const monthlyData = (() => {
    const months: { label: string; value: number }[] = [];
    const mNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    for (let m = 5; m >= 0; m--) {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      const y = d.getFullYear(); const mo = d.getMonth();
      const count = completed.filter((s) => {
        const sd = new Date(s.date);
        return sd.getFullYear() === y && sd.getMonth() === mo;
      }).length;
      months.push({ label: mNames[mo], value: count });
    }
    return months;
  })();

  const totalMins = completed.reduce((s, x) => s + (x.duration ?? 0), 0);
  const avgMins   = completed.length ? Math.round(totalMins / completed.length) : 0;
  const streak = (() => {
    const dates = [...new Set(completed.map((s) => s.date))].sort().reverse();
    let c = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < dates.length; i++) {
      const exp = new Date(today); exp.setDate(exp.getDate() - i);
      if (dates[i] === exp.toISOString().split('T')[0]) c++;
      else break;
    }
    return c;
  })();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <View style={{ backgroundColor: t.bg.secondary, paddingTop: 56, paddingBottom: SPACING.md, paddingHorizontal: SPACING.xl, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={18} color={t.text.primary} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xl }}>Progreso</Text>
            <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>Tu evolución en el tiempo</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.md }}>
          {/* Summary cards */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
            {[
              { icon: Dumbbell, label: 'Sesiones',  value: String(completed.length),  color: t.accent  },
              { icon: Flame,    label: 'Racha',      value: streak > 0 ? `${streak}d` : '—', color: t.orange },
              { icon: Clock,    label: 'Prom. min',  value: avgMins > 0 ? `${avgMins}` : '—', color: t.info },
              { icon: TrendingUp, label: 'Total hrs', value: totalMins >= 60 ? `${(totalMins/60).toFixed(1)}h` : `${totalMins}m`, color: t.success },
            ].map((s) => (
              <View key={s.label} style={{ width: (width - SPACING.xl * 2 - SPACING.sm) / 2, backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm, borderWidth: 1, borderColor: t.border.subtle }}>
                <View style={{ width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: s.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={18} color={s.color} />
                </View>
                <Text style={{ color: t.text.primary, fontWeight: '900', fontSize: 26, letterSpacing: -1 }}>{s.value}</Text>
                <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, fontWeight: '600' }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Weekly bar chart */}
          <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md }}>
              <Calendar size={13} color={t.text.secondary} />
              <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.sm, letterSpacing: 0.5, textTransform: 'uppercase' }}>Sesiones por semana</Text>
            </View>
            <BarChart data={weeklyData} color={t.accent} />
          </View>

          {/* Duration line chart */}
          <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md }}>
              <Clock size={13} color={t.text.secondary} />
              <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.sm, letterSpacing: 0.5, textTransform: 'uppercase' }}>Duración (últimas 10 sesiones)</Text>
            </View>
            <LineChart points={durationPoints} color={t.info} />
            <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, marginTop: SPACING.xs }}>Minutos por sesión</Text>
          </View>

          {/* Monthly chart */}
          <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md }}>
              <TrendingUp size={13} color={t.text.secondary} />
              <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.sm, letterSpacing: 0.5, textTransform: 'uppercase' }}>Sesiones por mes</Text>
            </View>
            <BarChart data={monthlyData} color={t.success} />
          </View>

          {completed.length === 0 && (
            <View style={{ backgroundColor: t.bg.elevated, borderRadius: RADIUS.xl, padding: SPACING.xxl, alignItems: 'center', gap: SPACING.sm, borderWidth: 1, borderStyle: 'dashed', borderColor: t.border.strong }}>
              <TrendingUp size={36} color={t.text.tertiary} strokeWidth={1.5} />
              <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.lg }}>Sin datos aún</Text>
              <Text style={{ color: t.text.secondary, fontSize: FONT.sm, textAlign: 'center' }}>Completa entrenamientos para ver tu progreso aquí.</Text>
            </View>
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}
