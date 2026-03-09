import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/store';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { ChevronLeft, Play, Pause, RotateCcw, Flag, Clock } from 'lucide-react-native';

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function TimerScreen() {
  const router = useRouter();
  const t = useTheme();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  const hours = Math.floor(elapsed / 3600);
  const mins  = Math.floor((elapsed % 3600) / 60);
  const secs  = elapsed % 60;

  const addLap = () => {
    if (!running) return;
    setLaps((l) => [...l, elapsed]);
  };

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  const getLapDiff = (i: number) => {
    const prev = i > 0 ? laps[i - 1] : 0;
    const diff = laps[i] - prev;
    return `${pad(Math.floor(diff / 60))}:${pad(diff % 60)}`;
  };

  const bestLapIdx = laps.length > 1
    ? laps.reduce((best, l, i, arr) => {
        const diff = l - (i > 0 ? arr[i - 1] : 0);
        const bestDiff = arr[best] - (best > 0 ? arr[best - 1] : 0);
        return diff < bestDiff ? i : best;
      }, 0)
    : -1;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <StatusBar barStyle={t.isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={{ paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.xxl, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 4 }}>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '500' }}>Fitness</Text>
            <Text style={{ color: t.text.primary, fontSize: 30, fontWeight: '800', letterSpacing: -1 }}>Cronómetro</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 6, width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: t.bg.card, borderWidth: 1, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={20} color={t.text.secondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── Clock display ─────────────────────────────────────────────────── */}
        <View style={{ alignItems: 'center', paddingTop: 48, paddingBottom: 40 }}>
          <Animated.View style={{
            transform: [{ scale: pulseAnim }],
            width: 260, height: 260, borderRadius: 130,
            backgroundColor: running ? t.accentDim : t.bg.card,
            borderWidth: 8,
            borderColor: running ? t.accent + '50' : t.border.default,
            alignItems: 'center', justifyContent: 'center',
            gap: 0,
          }}>
            {/* Main time */}
            <Text style={{
              fontVariant: ['tabular-nums'],
              color: running ? t.accent : t.text.primary,
              fontSize: hours > 0 ? 52 : 64,
              fontWeight: '800',
              letterSpacing: -2,
              lineHeight: hours > 0 ? 60 : 72,
            }}>
              {hours > 0
                ? `${pad(hours)}:${pad(mins)}`
                : `${pad(mins)}:${pad(secs)}`
              }
            </Text>
            {/* Seconds when showing hours:mins */}
            {hours > 0 && (
              <Text style={{ color: t.text.tertiary, fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: -1 }}>
                {pad(secs)}
              </Text>
            )}
            {/* Milliseconds label */}
            {hours === 0 && (
              <Text style={{ color: t.text.tertiary, fontSize: FONT.sm, fontWeight: '500', marginTop: 4 }}>
                {running ? 'en curso' : elapsed === 0 ? 'listo' : 'pausado'}
              </Text>
            )}
          </Animated.View>

          {/* Lap count badge */}
          {laps.length > 0 && (
            <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: t.bg.card, borderRadius: RADIUS.lg, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: t.border.default }}>
              <Flag size={13} color={t.accent} strokeWidth={2} />
              <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '700' }}>
                {laps.length} {laps.length === 1 ? 'vuelta' : 'vueltas'}
              </Text>
            </View>
          )}
        </View>

        {/* ── Controls ────────────────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 40 }}>
          {/* Vuelta */}
          <TouchableOpacity
            onPress={addLap}
            disabled={!running}
            activeOpacity={0.8}
            style={{
              width: 70, height: 70, borderRadius: 35,
              backgroundColor: running ? t.bg.card : t.bg.tertiary,
              borderWidth: 2,
              borderColor: running ? t.border.strong : t.border.subtle,
              alignItems: 'center', justifyContent: 'center', gap: 3,
            }}>
            <Flag size={18} color={running ? t.text.secondary : t.text.tertiary} strokeWidth={2} />
            <Text style={{ color: running ? t.text.secondary : t.text.tertiary, fontSize: 10, fontWeight: '700' }}>
              Vuelta
            </Text>
          </TouchableOpacity>

          {/* Play / Pause — main button */}
          <TouchableOpacity
            onPress={() => setRunning((r) => !r)}
            activeOpacity={0.88}
            style={{
              width: 96, height: 96, borderRadius: 48,
              backgroundColor: running ? t.danger : t.accent,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: running ? t.danger : t.accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45,
              shadowRadius: 16,
              elevation: 10,
            }}>
            {running
              ? <Pause size={34} color="#fff" strokeWidth={2.5} />
              : <Play  size={34} color="#fff" strokeWidth={2.5} />
            }
          </TouchableOpacity>

          {/* Reset */}
          <TouchableOpacity
            onPress={reset}
            activeOpacity={0.8}
            style={{
              width: 70, height: 70, borderRadius: 35,
              backgroundColor: t.bg.card,
              borderWidth: 2,
              borderColor: t.border.default,
              alignItems: 'center', justifyContent: 'center', gap: 3,
            }}>
            <RotateCcw size={18} color={t.text.secondary} strokeWidth={2} />
            <Text style={{ color: t.text.secondary, fontSize: 10, fontWeight: '700' }}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* ── Laps list ──────────────────────────────────────────────────────── */}
        {laps.length > 0 && (
          <View style={{ marginHorizontal: SPACING.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <View style={{ width: 30, height: 30, borderRadius: RADIUS.md, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={14} color={t.accent} strokeWidth={2} />
              </View>
              <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3 }}>
                Vueltas
              </Text>
            </View>

            <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
                {['Vuelta', 'Parcial', 'Total'].map((h) => (
                  <Text key={h} style={{ flex: 1, textAlign: 'center', color: t.text.tertiary, fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    {h}
                  </Text>
                ))}
              </View>

              {/* Rows — reversed (newest first) */}
              {[...laps].reverse().map((lap, ri) => {
                const i = laps.length - 1 - ri;
                const isBest = i === bestLapIdx;
                return (
                  <View
                    key={i}
                    style={{
                      flexDirection: 'row', alignItems: 'center',
                      paddingHorizontal: 16, paddingVertical: 13,
                      borderBottomWidth: ri < laps.length - 1 ? 1 : 0,
                      borderBottomColor: t.border.subtle,
                      backgroundColor: isBest ? t.successDim : 'transparent',
                    }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '700' }}>
                        {i + 1}
                      </Text>
                      {isBest && (
                        <View style={{ backgroundColor: t.success, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>MEJOR</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ flex: 1, textAlign: 'center', color: isBest ? t.success : t.text.primary, fontWeight: '700', fontSize: FONT.base, fontVariant: ['tabular-nums'] }}>
                      {getLapDiff(i)}
                    </Text>
                    <Text style={{ flex: 1, textAlign: 'center', color: t.text.tertiary, fontSize: FONT.sm, fontVariant: ['tabular-nums'] }}>
                      {pad(Math.floor(lap / 60))}:{pad(lap % 60)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
