import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { FakeCalendarService } from '@/lib/services';
import type { CalendarDay } from '@/lib/types';

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const STATUS_COLORS = {
  completed: '#0d9e6e',
  planned: '#2563eb',
  skipped: '#f59e0b',
};

export default function CalendarScreen() {
  const { user } = useAppStore();
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const router = useRouter();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  useEffect(() => {
    if (!user) return;
    FakeCalendarService.getCalendar(user.id)
      .then(setCalendarDays)
      .finally(() => setLoading(false));
  }, [user]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const getDayData = (day: number): CalendarDay | undefined => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarDays.find((d) => d.date === dateStr);
  };

  const todayStr = now.toISOString().split('T')[0];
  const selectedDayData = calendarDays.find((d) => d.date === selectedDate);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        style={{
          backgroundColor: '#2563eb',
          paddingTop: 56,
          paddingBottom: 24,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-white/80">← Volver</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold" style={{ fontSize: 26 }}>
          Calendario Fitness 📅
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
          {/* Month navigator */}
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#f1f5f9',
            }}>
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity
                onPress={prevMonth}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#f1f5f9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text className="text-foreground font-bold">‹</Text>
              </TouchableOpacity>
              <Text className="text-foreground font-bold text-lg">
                {MONTHS[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity
                onPress={nextMonth}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#f1f5f9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text className="text-foreground font-bold">›</Text>
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View className="flex-row mb-2">
              {DAYS_OF_WEEK.map((d) => (
                <View key={d} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <View key={`empty-${i}`} style={{ width: '14.28%', aspectRatio: 1 }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayData = getDayData(day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const dotColor = dayData
                  ? STATUS_COLORS[dayData.status ?? 'planned']
                  : null;

                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setSelectedDate(isSelected ? null : dateStr)}
                    style={{
                      width: '14.28%',
                      aspectRatio: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 2,
                    }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: isSelected
                          ? '#2563eb'
                          : isToday
                          ? '#dbeafe'
                          : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          color: isSelected ? '#fff' : isToday ? '#1d4ed8' : '#1e293b',
                          fontSize: 14,
                          fontWeight: isToday || isSelected ? '700' : '400',
                        }}>
                        {day}
                      </Text>
                    </View>
                    {dotColor && (
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 4,
                          width: 5,
                          height: 5,
                          borderRadius: 2.5,
                          backgroundColor: isSelected ? '#fff' : dotColor,
                        }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected day detail */}
          {selectedDate && (
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#dbeafe',
              }}>
              <Text className="text-foreground font-bold text-base mb-3">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
              {selectedDayData ? (
                <View>
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: STATUS_COLORS[selectedDayData.status ?? 'planned'],
                      }}
                    />
                    <Text className="text-foreground font-medium text-sm">
                      {selectedDayData.workoutName}
                    </Text>
                    <View
                      style={{
                        marginLeft: 'auto',
                        backgroundColor:
                          selectedDayData.status === 'completed'
                            ? '#dcfce7'
                            : selectedDayData.status === 'skipped'
                            ? '#fef3c7'
                            : '#dbeafe',
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                      }}>
                      <Text
                        style={{
                          color:
                            selectedDayData.status === 'completed'
                              ? '#16a34a'
                              : selectedDayData.status === 'skipped'
                              ? '#d97706'
                              : '#1d4ed8',
                          fontSize: 11,
                          fontWeight: '600',
                          textTransform: 'capitalize',
                        }}>
                        {selectedDayData.status === 'completed'
                          ? 'Completado'
                          : selectedDayData.status === 'skipped'
                          ? 'Saltado'
                          : 'Planificado'}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <Text className="text-muted-foreground text-sm">Sin entrenamiento programado</Text>
              )}
            </View>
          )}

          {/* Legend */}
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: '#f1f5f9',
            }}>
            <Text className="text-foreground font-bold text-sm mb-3">Leyenda</Text>
            {[
              { color: '#0d9e6e', label: 'Completado' },
              { color: '#2563eb', label: 'Planificado' },
              { color: '#f59e0b', label: 'Saltado' },
            ].map((item) => (
              <View key={item.label} className="flex-row items-center gap-2 mb-1.5">
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: item.color,
                  }}
                />
                <Text className="text-muted-foreground text-xs">{item.label}</Text>
              </View>
            ))}
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}
