import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { WorkoutService, CalendarService, FakePaymentService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import type { WorkoutSession, CalendarDay } from '@/lib/types';
import {
  Timer,
  CalendarDays,
  MessageCircle,
  BookOpen,
  ChevronRight,
  Zap,
  Flame,
  Play,
  Users,
  CreditCard,
  ClipboardList,
  BarChart3,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Bell,
  ArrowUpRight,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ─── Shared UI ────────────────────────────────────────────────────────────────
function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <Text style={{ fontSize: FONT.lg, fontWeight: '800', color: t.text.primary, letterSpacing: -0.4 }}>
        {title}
      </Text>
      {action && (
        <TouchableOpacity onPress={onAction} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Text style={{ fontSize: FONT.sm, fontWeight: '600', color: t.accent }}>{action}</Text>
          <ChevronRight size={13} color={t.accent} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
  iconColor,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  value: string;
  label: string;
  iconColor?: string;
}) {
  const t = useTheme();
  const ic = iconColor ?? t.accent;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.bg.card,
        borderRadius: RADIUS.lg,
        padding: 14,
        borderWidth: 1,
        borderColor: t.border.subtle,
        gap: 8,
      }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: ic + '18',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon size={17} color={ic} strokeWidth={2} />
      </View>
      <View style={{ gap: 2 }}>
        <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: 20, letterSpacing: -0.8 }}>
          {value}
        </Text>
        <Text style={{ color: t.text.secondary, fontSize: 11, fontWeight: '500' }}>{label}</Text>
      </View>
    </View>
  );
}

// ─── USER / CLIENT ─────────────────────────────────────────────────────────────
function UserDashboard() {
  const { user } = useAppStore();
  const t = useTheme();
  const [todayWorkout, setTodayWorkout] = useState<WorkoutSession | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    Promise.all([
      WorkoutService.getTodayWorkout(user.id),
      CalendarService.getCalendar(user.id),
    ]).then(([workout, calendar]) => {
      setTodayWorkout(workout);
      setCalendarDays(calendar);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const completedSessions = calendarDays.filter(d => d.status === 'completed').length;
  const streak = (() => {
    const today = new Date();
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = calendarDays.find(c => c.date === dateStr);
      if (entry?.status === 'completed') count++;
      else if (i > 0) break;
    }
    return count;
  })();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos dias' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const quickActions = [
    { icon: Timer,        label: 'Cronometro', sublabel: 'Temporizador', route: '/workout/timer', iconColor: t.accent,   bg: t.accentDim },
    { icon: CalendarDays, label: 'Calendario',  sublabel: 'Ver semana',   route: '/calendar',     iconColor: t.info,    bg: t.infoDim },
    { icon: MessageCircle,label: 'Entrenador',  sublabel: 'Chat directo', route: '/chat',          iconColor: t.orange,  bg: t.orangeDim },
    { icon: BookOpen,     label: 'Ejercicios',  sublabel: 'Biblioteca',   route: '/exercises',    iconColor: t.success, bg: t.successDim },
  ];

  const activity = [
    { icon: CheckCircle2, text: 'Completaste Piernas & Gluteos', time: 'Hace 2 dias', color: t.success },
    { icon: Flame,         text: 'Racha activa: 5 dias consecutivos', time: 'Ayer',          color: t.orange },
    { icon: TrendingUp,    text: 'Nuevo record: 100 kg en sentadilla', time: 'Hace 3 dias', color: t.info },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg.primary }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View
        style={{
          paddingTop: 60,
          paddingBottom: SPACING.xxl,
          paddingHorizontal: SPACING.xxl,
          borderBottomWidth: 1,
          borderBottomColor: t.border.subtle,
          backgroundColor: t.bg.secondary,
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xxl }}>
          <View style={{ gap: 3 }}>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '500' }}>{greeting}</Text>
            <Text style={{ color: t.text.primary, fontSize: FONT.xxxl, fontWeight: '800', letterSpacing: -1 }}>
              {user?.name?.split(' ')[0]}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                width: 40, height: 40, borderRadius: RADIUS.md,
                backgroundColor: t.bg.tertiary, borderWidth: 1, borderColor: t.border.subtle,
                alignItems: 'center', justifyContent: 'center',
              }}>
              <Bell size={18} color={t.text.secondary} strokeWidth={1.8} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.85}>
              <View>
                <Image
                  source={{ uri: user?.avatar }}
                  style={{ width: 40, height: 40, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: t.accent }}
                />
                <View
                  style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 11, height: 11, borderRadius: 6,
                    backgroundColor: t.success, borderWidth: 1.5, borderColor: t.bg.primary,
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MetricCard icon={Zap}       value={String(completedSessions)} label="Sesiones"    iconColor={t.accent}  />
          <MetricCard icon={Flame}     value={streak > 0 ? `${streak}d` : '—'} label="Racha" iconColor={t.orange}  />
          <MetricCard icon={TrendingUp} value={user?.weight ? `${user.weight}kg` : '—'} label="Peso" iconColor={t.info} />
        </View>
      </View>

      <View style={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxl, gap: SPACING.xxl }}>
        {/* Today Workout */}
        <View>
          <SectionHeader title="Entrenamiento de Hoy" />
          {loading ? (
            <View
              style={{
                height: 200, backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
                alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.border.subtle,
              }}>
              <ActivityIndicator color={t.accent} size="large" />
            </View>
          ) : todayWorkout ? (
            <TouchableOpacity
              onPress={() => router.push(`/workout/${todayWorkout.id}` as any)}
              activeOpacity={0.88}
              style={{ borderRadius: RADIUS.xl, overflow: 'hidden' }}>
              <Image source={{ uri: todayWorkout.routine.imageUrl }} style={{ width: '100%', height: 210 }} resizeMode="cover" />
              <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.52)' }} />
              {/* Badges */}
              <View style={{ position: 'absolute', top: 14, left: 14, flexDirection: 'row', gap: 8 }}>
                <View style={{ backgroundColor: t.accent, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: t.accentText, fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>HOY</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>
                    {todayWorkout.routine.category.toUpperCase()}
                  </Text>
                </View>
              </View>
              {/* Play */}
              <View style={{ position: 'absolute', top: 14, right: 14, width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Play size={18} color={t.accentText} strokeWidth={2.5} />
              </View>
              {/* Info */}
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18, gap: 6 }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 20, letterSpacing: -0.6 }}>
                  {todayWorkout.routine.name}
                </Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' }}>
                    {todayWorkout.routine.duration} min
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' }}>
                    {todayWorkout.routine.exercises.length} ejercicios
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: 32,
                alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: t.border.strong,
              }}>
              <View style={{ width: 56, height: 56, borderRadius: RADIUS.lg, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <CalendarDays size={24} color={t.text.tertiary} strokeWidth={1.5} />
              </View>
              <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.lg, letterSpacing: -0.3 }}>
                Dia de descanso
              </Text>
              <Text style={{ color: t.text.secondary, fontSize: FONT.sm, textAlign: 'center', marginTop: 6, lineHeight: 19 }}>
                No tienes entrenamiento programado para hoy.
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View>
          <SectionHeader title="Accesos Rapidos" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {quickActions.map((a) => (
              <TouchableOpacity
                key={a.label}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.8}
                style={{
                  width: (width - 50) / 2,
                  backgroundColor: t.bg.card,
                  borderRadius: RADIUS.xl,
                  padding: SPACING.lg,
                  gap: 12,
                  borderWidth: 1,
                  borderColor: t.border.subtle,
                }}>
                <View style={{ width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: a.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <a.icon size={18} color={a.iconColor} strokeWidth={2} />
                </View>
                <View style={{ gap: 2 }}>
                  <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base, letterSpacing: -0.2 }}>{a.label}</Text>
                  <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '500' }}>{a.sublabel}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={{ paddingBottom: 32 }}>
          <SectionHeader title="Actividad Reciente" />
          <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle }}>
            {activity.map((item, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  paddingHorizontal: 18, paddingVertical: 16,
                  borderBottomWidth: i < activity.length - 1 ? 1 : 0,
                  borderBottomColor: t.border.subtle,
                }}>
                <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: item.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={17} color={item.color} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: t.text.primary, fontSize: FONT.sm, fontWeight: '600', letterSpacing: -0.1 }}>{item.text}</Text>
                  <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '500' }}>{item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── TRAINER ───────────────────────────────────────────────────────────────────
function TrainerDashboard() {
  const { user } = useAppStore();
  const t = useTheme();
  const [clients, setClients] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    FakeUserService.getTrainerClients(user.id).then(setClients);
  }, [user]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg.primary }} showsVerticalScrollIndicator={false}>
      <View
        style={{
          paddingTop: 60, paddingBottom: SPACING.xxl, paddingHorizontal: SPACING.xxl,
          borderBottomWidth: 1, borderBottomColor: t.border.subtle, backgroundColor: t.bg.secondary,
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xxl }}>
          <View style={{ gap: 3 }}>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm }}>Panel Entrenador</Text>
            <Text style={{ color: t.text.primary, fontSize: FONT.xxxl, fontWeight: '800', letterSpacing: -1 }}>
              {user?.name?.split(' ')[0]}
            </Text>
          </View>
          <Image source={{ uri: user?.avatar }} style={{ width: 44, height: 44, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: t.info }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MetricCard icon={UserCheck}    value={clients.length.toString()} label="Clientes" iconColor={t.accent}  />
          <MetricCard icon={Users}        value="2"                          label="Cupos"    iconColor={t.info}    />
          <MetricCard icon={ClipboardList} value="4"                         label="Rutinas"  iconColor={t.orange}  />
        </View>
      </View>

      <View style={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxl, gap: SPACING.xxl }}>
        {/* Clients */}
        <View>
          <SectionHeader title="Mis Clientes" action="Ver chats" onAction={() => router.push('/chat')} />
          <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle }}>
            {clients.map((client, i) => (
              <View
                key={client.id}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  paddingHorizontal: 18, paddingVertical: 14,
                  borderBottomWidth: i < clients.length - 1 ? 1 : 0,
                  borderBottomColor: t.border.subtle,
                }}>
                <Image source={{ uri: client.avatar }} style={{ width: 44, height: 44, borderRadius: RADIUS.md }} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>{client.name}</Text>
                  <Text style={{ color: t.text.secondary, fontSize: FONT.sm }}>{client.goal}</Text>
                </View>
                <View style={{ backgroundColor: t.successDim, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ color: t.success, fontSize: 11, fontWeight: '700' }}>Activo</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Payment alert */}
        <View>
          <SectionHeader title="Proximo Cobro" />
          <View
            style={{
              backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg,
              flexDirection: 'row', alignItems: 'center', gap: 14,
              borderWidth: 1, borderColor: t.warning + '40',
            }}>
            <View style={{ width: 46, height: 46, borderRadius: RADIUS.md, backgroundColor: t.warningDim, alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} color={t.warning} strokeWidth={2} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>Pago pendiente</Text>
              <Text style={{ color: t.warning, fontSize: FONT.sm, fontWeight: '500' }}>Alex Garcia • $50 • Vence 15/Mar</Text>
            </View>
            <AlertCircle size={18} color={t.warning} strokeWidth={2} />
          </View>
        </View>

        {/* Actions */}
        <View style={{ paddingBottom: 32 }}>
          <SectionHeader title="Acciones Rapidas" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: ClipboardList, label: 'Mis Rutinas', route: '/routines', color: t.info,  bg: t.infoDim },
              { icon: CreditCard,    label: 'Pagos',       route: '/payments', color: t.accent, bg: t.accentDim },
            ].map((a) => (
              <TouchableOpacity
                key={a.label}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.85}
                style={{ flex: 1, backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: 20, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: t.border.subtle }}>
                <View style={{ width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: a.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <a.icon size={24} color={a.color} strokeWidth={1.8} />
                </View>
                <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.sm }}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── ADMIN ─────────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const { user } = useAppStore();
  const t = useTheme();
  const [payments, setPayments] = useState<Payment[]>([]);
  const router = useRouter();

  useEffect(() => {
    FakePaymentService.getAll().then(setPayments);
  }, []);

  const pending = payments.filter((p) => p.status === 'pending');

  const kpis = [
    { icon: BarChart3,   value: '$150',              label: 'Ingresos',   color: t.accent  },
    { icon: Users,       value: '4',                  label: 'Usuarios',   color: t.info    },
    { icon: AlertCircle, value: String(pending.length), label: 'Pendientes', color: pending.length > 0 ? t.warning : t.success },
  ];

  const reports = [
    { icon: BarChart3, label: 'Ingresos del mes',    value: '$150', sub: '3 pagos validados',  color: t.accent  },
    { icon: Users,     label: 'Usuarios registrados', value: '4',   sub: 'De 4 activos',        color: t.info    },
    { icon: UserCheck, label: 'Entrenadores activos', value: '1',   sub: 'Carlos Mendez',        color: t.orange  },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg.primary }} showsVerticalScrollIndicator={false}>
      <View
        style={{
          paddingTop: 60, paddingBottom: SPACING.xxl, paddingHorizontal: SPACING.xxl,
          borderBottomWidth: 1, borderBottomColor: t.border.subtle, backgroundColor: t.bg.secondary,
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xxl }}>
          <View style={{ gap: 3 }}>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm }}>Panel Admin</Text>
            <Text style={{ color: t.text.primary, fontSize: FONT.xxxl, fontWeight: '800', letterSpacing: -1 }}>FitPro</Text>
          </View>
          <Image source={{ uri: user?.avatar }} style={{ width: 44, height: 44, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: t.orange }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {kpis.map((k) => (
            <MetricCard key={k.label} icon={k.icon} value={k.value} label={k.label} iconColor={k.color} />
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxl, gap: SPACING.xxl }}>
        {pending.length > 0 && (
          <View>
            <SectionHeader title="Pagos Pendientes" action="Ver todos" onAction={() => router.push('/payments')} />
            <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle }}>
              {pending.map((p, i) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => router.push('/payments')}
                  activeOpacity={0.85}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 14,
                    paddingHorizontal: 18, paddingVertical: 16,
                    borderBottomWidth: i < pending.length - 1 ? 1 : 0, borderBottomColor: t.border.subtle,
                  }}>
                  <View style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: t.warningDim, alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={17} color={t.warning} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.sm }}>{p.plan}</Text>
                    <Text style={{ color: t.text.secondary, fontSize: FONT.sm }}>${p.amount} • Vence {p.dueDate}</Text>
                  </View>
                  <View style={{ backgroundColor: t.warningDim, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: t.warning, fontSize: 11, fontWeight: '700' }}>Pendiente</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ paddingBottom: 32 }}>
          <SectionHeader title="Resumen General" />
          <View style={{ gap: 10 }}>
            {reports.map((r) => (
              <View
                key={r.label}
                style={{
                  backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg,
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  borderWidth: 1, borderColor: t.border.subtle,
                }}>
                <View style={{ width: 46, height: 46, borderRadius: RADIUS.md, backgroundColor: r.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                  <r.icon size={20} color={r.color} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xxl, letterSpacing: -0.8 }}>{r.value}</Text>
                  <Text style={{ color: t.text.secondary, fontWeight: '600', fontSize: FONT.sm }}>{r.label}</Text>
                  <Text style={{ color: t.text.tertiary, fontSize: 11 }}>{r.sub}</Text>
                </View>
                <ArrowUpRight size={16} color={t.text.tertiary} strokeWidth={2} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user, activeRole } = useAppStore();
  if (!user) return null;
  if (activeRole === 'trainer') return <TrainerDashboard />;
  if (activeRole === 'admin') return <AdminDashboard />;
  return <UserDashboard />;
}
