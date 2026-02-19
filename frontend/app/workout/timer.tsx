import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function TimerScreen() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  const totalMs = elapsed * 1000;
  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;

  return (
    <View className="flex-1 bg-background">
      <View
        style={{
          backgroundColor: '#0d9e6e',
          paddingTop: 52,
          paddingBottom: 28,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-white/80">← Volver</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold" style={{ fontSize: 24 }}>
          Cronómetro
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        {/* Clock display */}
        <View
          style={{
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: running ? '#0d9e6e' : '#f8fafc',
            borderWidth: 8,
            borderColor: running ? '#0d9e6e' : '#e2e8f0',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 8,
            marginBottom: 40,
          }}>
          <Text
            style={{
              fontSize: 56,
              fontWeight: '700',
              color: running ? '#fff' : '#1e293b',
              fontVariant: ['tabular-nums'],
            }}>
            {pad(hours > 0 ? hours : mins)}:{pad(hours > 0 ? mins : secs)}
          </Text>
          {hours === 0 && (
            <Text
              style={{
                fontSize: 22,
                color: running ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                fontVariant: ['tabular-nums'],
              }}>
              {pad(secs)}
            </Text>
          )}
        </View>

        {/* Buttons */}
        <View className="flex-row gap-4 mb-8">
          <TouchableOpacity
            onPress={() => setLaps((l) => [...l, elapsed])}
            disabled={!running}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: running ? '#f1f5f9' : '#f8fafc',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: running ? '#e2e8f0' : '#f1f5f9',
            }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: running ? '#475569' : '#cbd5e1' }}>
              Vuelta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRunning((r) => !r)}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: running ? '#dc2626' : '#0d9e6e',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: running ? '#dc2626' : '#0d9e6e',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}>
            <Text style={{ color: '#fff', fontSize: 24 }}>{running ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setRunning(false);
              setElapsed(0);
              setLaps([]);
            }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: '#f1f5f9',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#e2e8f0',
            }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569' }}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Laps */}
        {laps.length > 0 && (
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 16,
              width: '100%',
              borderWidth: 1,
              borderColor: '#f1f5f9',
            }}>
            <Text className="text-foreground font-bold text-base mb-3">
              Vueltas ({laps.length})
            </Text>
            {laps
              .slice()
              .reverse()
              .map((lap, i) => {
                const prev = laps[laps.length - 1 - i - 1] ?? 0;
                const diff = lap - prev;
                const dm = Math.floor(diff / 60);
                const ds = diff % 60;
                return (
                  <View key={i} className="flex-row justify-between py-2 border-b border-border">
                    <Text className="text-muted-foreground text-sm">
                      Vuelta {laps.length - i}
                    </Text>
                    <Text className="text-foreground font-semibold text-sm">
                      +{pad(dm)}:{pad(ds)}
                    </Text>
                    <Text className="text-muted-foreground text-sm">
                      {pad(Math.floor(lap / 60))}:{pad(lap % 60)}
                    </Text>
                  </View>
                );
              })}
          </View>
        )}
      </View>
    </View>
  );
}
