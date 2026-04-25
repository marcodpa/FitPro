import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FakeCalendarService, FakeRoutineService, FakeWorkoutService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import type { CalendarDay, Routine } from '@/lib/types';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  Flame,
  Plus,
  Dumbbell,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function CalendarScreen() {
  const { user } = useAppStore();
  const t = useTheme();
  const router = useRouter();
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [scheduling, setScheduling] = useState(false);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  useEffect(() => {
    if (!user) return;
    FakeCalendarService.getCalendar(user.id)
      .then(setCalendarDays)
      .finally(() => setLoading(false));
    FakeRoutineService.getByUserId(user.id).then(setRoutines).catch(() => {});
  }, [user]);

  const handleScheduleWorkout = async (routineId: string) => {
    if (!selectedDate) return;
    setScheduling(true);
    try {
      await FakeWorkoutService.schedule(routineId, selectedDate);
      setCalendarDays((prev) => [
        ...prev.filter((d) => d.date !== selectedDate),
        { date: selectedDate, hasWorkout: true, status: 'planned', workoutName: routines.find((r) => r.id === routineId)?.name ?? 'Entrenamiento' },
      ]);
      setShowScheduleModal(false);
      Alert.alert('Programado', `Entrenamiento agendado para ${selectedDate}.`);
    } catch {
      Alert.alert('Error', 'No se pudo agendar el entrenamiento.');
    } finally {
      setScheduling(false);
    }
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = now.toISOString().split('T')[0];
  const selectedDayData = calendarDays.find((d) => d.date === selectedDate);

  const getDayData = (day: number): CalendarDay | undefined => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarDays.find((d) => d.date === dateStr);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // Stats
  const completedCount = calendarDays.filter((d) => d.status === 'completed').length;
  const plannedCount   = calendarDays.filter((d) => d.status === 'planned').length;
  const skippedCount   = calendarDays.filter((d) => d.status === 'skipped').length;

  const statusStyle = {
    completed: { color: t.success,  dim: t.successDim,  icon: CheckCircle2, label: 'Completado' },
    planned:   { color: t.info,     dim: t.infoDim,     icon: Clock,        label: 'Planificado' },
    skipped:   { color: t.warning,  dim: t.warningDim,  icon: XCircle,      label: 'Saltado' },
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{ backgroundColor: t.bg.primary, paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.xxl, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 4 }}>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '500' }}>Tu progreso mensual</Text>
            <Text style={{ color: t.text.primary, fontSize: 30, fontWeight: '800', letterSpacing: -1 }}>Calendario</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 6, width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: t.bg.card, borderWidth: 1, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={20} color={t.text.secondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.xl, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: SPACING.xl }}>
            {[
              { icon: Flame,        value: completedCount, label: 'Completados', color: t.success, dim: t.successDim },
              { icon: Clock,        value: plannedCount,   label: 'Planificados', color: t.info,   dim: t.infoDim },
              { icon: XCircle,      value: skippedCount,   label: 'Saltados',    color: t.warning, dim: t.warningDim },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, backgroundColor: t.bg.card, borderRadius: RADIUS.lg, padding: 14, gap: 8, borderWidth: 1, borderColor: t.border.subtle }}>
                <View style={{ width: 34, height: 34, borderRadius: RADIUS.md, backgroundColor: s.dim, alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={16} color={s.color} strokeWidth={2} />
                </View>
                <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: 22, letterSpacing: -0.8 }}>{s.value}</Text>
                <Text style={{ color: t.text.secondary, fontSize: 10, fontWeight: '500' }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Calendar card */}
          <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle, marginBottom: SPACING.xl }}>
            {/* Month navigator */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity
                onPress={prevMonth}
                style={{ width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: t.bg.tertiary, borderWidth: 1, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={18} color={t.text.secondary} strokeWidth={2} />
              </TouchableOpacity>
              <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.4 }}>
                {MONTHS[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity
                onPress={nextMonth}
                style={{ width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: t.bg.tertiary, borderWidth: 1, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={18} color={t.text.secondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {DAYS_OF_WEEK.map((d) => (
                <View key={d} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 }}>{d}</Text>
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
                const isToday    = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const status     = dayData?.status as keyof typeof statusStyle | undefined;
                const dotColor   = status ? statusStyle[status].color : null;

                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setSelectedDate(isSelected ? null : dateStr)}
                    style={{ width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 }}>
                    <View style={{
                      width: 34, height: 34, borderRadius: RADIUS.md,
                      backgroundColor: isSelected
                        ? t.accent
                        : isToday
                        ? t.accentDim
                        : 'transparent',
                      alignItems: 'center', justifyContent: 'center',
                      borderWidth: isToday && !isSelected ? 1.5 : 0,
                      borderColor: t.accent,
                    }}>
                      <Text style={{
                        color: isSelected ? t.accentText : isToday ? t.accent : t.text.primary,
                        fontSize: 13,
                        fontWeight: isToday || isSelected ? '800' : '400',
                      }}>
                        {day}
                      </Text>
                    </View>
                    {dotColor && (
                      <View style={{
                        position: 'absolute', bottom: 3,
                        width: 5, height: 5, borderRadius: 3,
                        backgroundColor: isSelected ? t.accentText : dotColor,
                      }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected day detail */}
          {selectedDate && (
            <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.xl, borderWidth: 1, borderColor: t.border.subtle }}>
              <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3, marginBottom: 14 }}>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
              {selectedDayData ? (() => {
                const s = statusStyle[selectedDayData.status as keyof typeof statusStyle];
                const StatusIcon = s.icon;
                return (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: s.dim, borderRadius: RADIUS.lg, padding: 14 }}>
                    <View style={{ width: 38, height: 38, borderRadius: RADIUS.md, backgroundColor: s.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                      <StatusIcon size={18} color={s.color} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>{selectedDayData.workoutName}</Text>
                      <Text style={{ color: s.color, fontSize: FONT.sm, fontWeight: '600' }}>{s.label}</Text>
                    </View>
                  </View>
                );
              })() : (
                <View style={{ alignItems: 'center', padding: 20, gap: 12 }}>
                  <View style={{ width: 46, height: 46, borderRadius: RADIUS.lg, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarDays size={20} color={t.text.tertiary} strokeWidth={1.5} />
                  </View>
                  <Text style={{ color: t.text.secondary, fontSize: FONT.sm, textAlign: 'center' }}>
                    Sin entrenamiento programado
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowScheduleModal(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: t.accentDim,
                      borderRadius: RADIUS.lg,
                      paddingHorizontal: SPACING.lg,
                      paddingVertical: SPACING.sm,
                      borderWidth: 1,
                      borderColor: t.accent,
                    }}>
                    <Plus size={14} color={t.accent} strokeWidth={2.5} />
                    <Text style={{ color: t.accent, fontWeight: '700', fontSize: FONT.sm }}>Agendar Entrenamiento</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Legend */}
          <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle }}>
            <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.base, letterSpacing: -0.2, marginBottom: 14 }}>Leyenda</Text>
            <View style={{ gap: 10 }}>
              {(Object.entries(statusStyle) as [keyof typeof statusStyle, typeof statusStyle[keyof typeof statusStyle]][]).map(([key, s]) => {
                const Icon = s.icon;
                return (
                  <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 28, height: 28, borderRadius: RADIUS.sm, backgroundColor: s.dim, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={13} color={s.color} strokeWidth={2} />
                    </View>
                    <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '500' }}>{s.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

        </ScrollView>
      )}

      {/* Schedule Modal */}
      <Modal visible={showScheduleModal} transparent animationType="slide" onRequestClose={() => setShowScheduleModal(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
          activeOpacity={1}
          onPress={() => setShowScheduleModal(false)}>
          <View style={{ flex: 1 }} />
        </TouchableOpacity>
        <View style={{
          backgroundColor: t.bg.secondary,
          borderTopLeftRadius: RADIUS.xxl,
          borderTopRightRadius: RADIUS.xxl,
          padding: SPACING.xxl,
          paddingBottom: 40,
          borderTopWidth: 1,
          borderTopColor: t.border.subtle,
          maxHeight: '70%',
        }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: t.border.strong, alignSelf: 'center', marginBottom: SPACING.xl }} />
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, marginBottom: 4 }}>
            Agendar Entrenamiento
          </Text>
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, marginBottom: SPACING.xl }}>
            {selectedDate} — Elige una rutina:
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {routines.length === 0 ? (
              <View style={{ alignItems: 'center', padding: SPACING.xl }}>
                <Text style={{ color: t.text.secondary, fontSize: FONT.sm }}>No tienes rutinas disponibles.</Text>
              </View>
            ) : (
              routines.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => handleScheduleWorkout(r.id)}
                  disabled={scheduling}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.md,
                    backgroundColor: t.bg.card,
                    borderRadius: RADIUS.xl,
                    padding: SPACING.lg,
                    marginBottom: SPACING.sm,
                    borderWidth: 1,
                    borderColor: t.border.subtle,
                    opacity: scheduling ? 0.6 : 1,
                  }}>
                  <View style={{ width: 42, height: 42, borderRadius: RADIUS.md, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                    <Dumbbell size={18} color={t.accent} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>{r.name}</Text>
                    <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>{r.duration} min • {r.category}</Text>
                  </View>
                  {scheduling && <ActivityIndicator size="small" color={t.accent} />}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
