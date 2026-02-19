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
import { useAppStore } from '@/lib/store';
import { FakeWorkoutService, FakeUserService, FakePaymentService } from '@/lib/services';
import type { WorkoutSession, User, Payment } from '@/lib/types';
import {
  Timer,
  CalendarDays,
  MessageCircle,
  BookOpen,
  ChevronRight,
  Zap,
  TrendingUp,
  CheckCircle2,
  Flame,
  Weight,
  Play,
  Users,
  CreditCard,
  ClipboardList,
  BarChart3,
  UserCheck,
  AlertCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const EM = '#10b981';
const EM_DIM = '#d1fae5';

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f0f0f', letterSpacing: -0.3 }}>
        {title}
      </Text>
      {action && (
        <TouchableOpacity
          onPress={onAction}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: EM }}>{action}</Text>
          <ChevronRight size={14} color={EM} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function StatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  value: string;
  label: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
      }}>
      <Icon size={18} color="#fff" strokeWidth={2} />
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17, letterSpacing: -0.5 }}>
        {value}
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '500' }}>
        {label}
      </Text>
    </View>
  );
}

// ─── USER / CLIENT DASHBOARD ──────────────────────────────────────────────────
function UserDashboard() {
  const { user } = useAppStore();
  const [todayWorkout, setTodayWorkout] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    FakeWorkoutService.getTodayWorkout(user.id)
      .then(setTodayWorkout)
      .finally(() => setLoading(false));
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos dias' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const quickActions = [
    { icon: Timer, label: 'Cronometro', route: '/workout/timer', bg: '#0f172a', fg: EM },
    { icon: CalendarDays, label: 'Calendario', route: '/calendar', bg: '#1e1b4b', fg: '#818cf8' },
    { icon: MessageCircle, label: 'Entrenador', route: '/chat', bg: '#1a0533', fg: '#c084fc' },
    { icon: BookOpen, label: 'Ejercicios', route: '/exercises', bg: '#431407', fg: '#fb923c' },
  ];

  const recentActivity = [
    { icon: CheckCircle2, text: 'Completaste Piernas y Gluteos', time: 'Hace 2 dias', iconColor: EM },
    { icon: Flame, text: 'Racha de 5 dias consecutivos', time: 'Ayer', iconColor: '#f97316' },
    { icon: TrendingUp, text: 'Nuevo record: 100kg en sentadilla', time: 'Hace 3 dias', iconColor: '#6366f1' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }} showsVerticalScrollIndicator={false}>
      {/* Hero Header */}
      <View style={{ backgroundColor: '#0a0a0a', paddingTop: 58, paddingBottom: 28, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 2 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' }}>
              {greeting}
            </Text>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.8, marginTop: 1 }}>
              {user?.name?.split(' ')[0]}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.85}>
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: user?.avatar }}
                style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: EM }}
              />
              <View
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 12, height: 12, borderRadius: 6,
                  backgroundColor: EM, borderWidth: 2, borderColor: '#0a0a0a',
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 20 }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatPill icon={Zap} value="14" label="Sesiones" />
          <StatPill icon={Flame} value="5d" label="Racha" />
          <StatPill icon={Weight} value={`${user?.weight}kg`} label="Peso" />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 28 }}>
        {/* Today Workout */}
        <View>
          <SectionHeader title="Entrenamiento de Hoy" />
          {loading ? (
            <View style={{ height: 160, backgroundColor: '#fff', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={EM} size="large" />
            </View>
          ) : todayWorkout ? (
            <TouchableOpacity
              onPress={() => router.push(`/workout/${todayWorkout.id}` as any)}
              activeOpacity={0.88}
              style={{ borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 8 }}>
              <Image source={{ uri: todayWorkout.routine.imageUrl }} style={{ width: '100%', height: 190 }} resizeMode="cover" />
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.42)' }} />
              <View style={{ position: 'absolute', top: 14, left: 14, backgroundColor: EM, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }}>HOY</Text>
              </View>
              <View style={{ position: 'absolute', top: 14, right: 14, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
                <Play size={16} color="#fff" strokeWidth={2.5} />
              </View>
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18, letterSpacing: -0.4 }}>
                  {todayWorkout.routine.name}
                </Text>
                <View style={{ flexDirection: 'row', gap: 14, marginTop: 6 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '500' }}>
                    {todayWorkout.routine.duration} min
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '500' }}>
                    {todayWorkout.routine.exercises.length} ejercicios
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#e4e4e7' }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#f4f4f5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <CalendarDays size={24} color="#a1a1aa" strokeWidth={1.8} />
              </View>
              <Text style={{ color: '#0f0f0f', fontWeight: '700', fontSize: 16, letterSpacing: -0.3 }}>
                Dia de descanso
              </Text>
              <Text style={{ color: '#71717a', fontSize: 13, textAlign: 'center', marginTop: 4, lineHeight: 18 }}>
                No tienes entrenamiento programado para hoy.
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View>
          <SectionHeader title="Accesos Rapidos" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.82}
                style={{
                  width: (width - 52) / 2,
                  backgroundColor: '#fff',
                  borderRadius: 18,
                  padding: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: '#f0f0f0',
                }}>
                <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: action.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <action.icon size={20} color={action.fg} strokeWidth={2} />
                </View>
                <Text style={{ color: '#0f0f0f', fontWeight: '600', fontSize: 13, flex: 1, letterSpacing: -0.1 }}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={{ paddingBottom: 32 }}>
          <SectionHeader title="Actividad Reciente" />
          <View style={{ backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0' }}>
            {recentActivity.map((item, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  paddingHorizontal: 18,
                  paddingVertical: 16,
                  borderBottomWidth: i < recentActivity.length - 1 ? 1 : 0,
                  borderBottomColor: '#f4f4f5',
                }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: item.iconColor + '18', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={18} color={item.iconColor} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: '#0f0f0f', fontSize: 13, fontWeight: '600', letterSpacing: -0.1 }}>
                    {item.text}
                  </Text>
                  <Text style={{ color: '#a1a1aa', fontSize: 11, fontWeight: '500' }}>
                    {item.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── TRAINER DASHBOARD ────────────────────────────────────────────────────────
function TrainerDashboard() {
  const { user } = useAppStore();
  const [clients, setClients] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    FakeUserService.getTrainerClients(user.id).then(setClients);
  }, [user]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: '#0a0a0a', paddingTop: 58, paddingBottom: 28, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 2 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' }}>Panel Entrenador</Text>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.8, marginTop: 1 }}>
              {user?.name?.split(' ')[0]}
            </Text>
          </View>
          <Image source={{ uri: user?.avatar }} style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: '#818cf8' }} />
        </View>
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 20 }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatPill icon={UserCheck} value={clients.length.toString()} label="Clientes" />
          <StatPill icon={Users} value="2" label="Cupos" />
          <StatPill icon={ClipboardList} value="4" label="Rutinas" />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 24 }}>
        <View>
          <SectionHeader title="Mis Clientes" action="Ver chats" onAction={() => router.push('/chat')} />
          <View style={{ backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0' }}>
            {clients.map((client, i) => (
              <View
                key={client.id}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  paddingHorizontal: 18, paddingVertical: 14,
                  borderBottomWidth: i < clients.length - 1 ? 1 : 0, borderBottomColor: '#f4f4f5',
                }}>
                <Image source={{ uri: client.avatar }} style={{ width: 46, height: 46, borderRadius: 23 }} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: '#0f0f0f', fontWeight: '700', fontSize: 14, letterSpacing: -0.2 }}>{client.name}</Text>
                  <Text style={{ color: '#a1a1aa', fontSize: 12 }}>{client.goal}</Text>
                </View>
                <View style={{ backgroundColor: EM_DIM, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ color: '#065f46', fontSize: 11, fontWeight: '700' }}>Activo</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="Proximo Cobro" />
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#fde68a' }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={22} color="#d97706" strokeWidth={2} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: '#0f0f0f', fontWeight: '700', fontSize: 14 }}>Pago pendiente</Text>
              <Text style={{ color: '#92400e', fontSize: 12, fontWeight: '500' }}>Alex Garcia • $50 • Vence 15/Mar</Text>
            </View>
            <AlertCircle size={18} color="#d97706" strokeWidth={2} />
          </View>
        </View>

        <View style={{ paddingBottom: 32 }}>
          <SectionHeader title="Acciones" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push('/routines')}
              activeOpacity={0.85}
              style={{ flex: 1, backgroundColor: '#1e1b4b', borderRadius: 18, padding: 20, alignItems: 'center', gap: 10 }}>
              <ClipboardList size={28} color="#818cf8" strokeWidth={1.8} />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Mis Rutinas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/payments')}
              activeOpacity={0.85}
              style={{ flex: 1, backgroundColor: '#0a2e1e', borderRadius: 18, padding: 20, alignItems: 'center', gap: 10 }}>
              <CreditCard size={28} color={EM} strokeWidth={1.8} />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Pagos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard() {
  const { user } = useAppStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const router = useRouter();

  useEffect(() => {
    FakePaymentService.getAll().then(setPayments);
  }, []);

  const pending = payments.filter((p) => p.status === 'pending');

  const reports = [
    { icon: BarChart3, label: 'Ingresos del mes', value: '$150', sub: '3 pagos validados', color: EM, bg: '#0a2e1e' },
    { icon: Users, label: 'Usuarios activos', value: '3', sub: 'De 4 registrados', color: '#818cf8', bg: '#1e1b4b' },
    { icon: UserCheck, label: 'Entrenadores activos', value: '1', sub: 'Carlos Mendez', color: '#f97316', bg: '#431407' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: '#0a0a0a', paddingTop: 58, paddingBottom: 28, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 2 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' }}>Panel Administracion</Text>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.8, marginTop: 1 }}>FitPro Admin</Text>
          </View>
          <Image source={{ uri: user?.avatar }} style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: '#c084fc' }} />
        </View>
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 20 }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatPill icon={Users} value="4" label="Usuarios" />
          <StatPill icon={UserCheck} value="1" label="Trainers" />
          <StatPill icon={AlertCircle} value={pending.length.toString()} label="Pendientes" />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 24 }}>
        {pending.length > 0 && (
          <View>
            <SectionHeader title="Pagos Pendientes" action="Ver todos" onAction={() => router.push('/payments')} />
            <View style={{ backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0' }}>
              {pending.map((p, i) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => router.push('/payments')}
                  activeOpacity={0.85}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 14,
                    paddingHorizontal: 18, paddingVertical: 16,
                    borderBottomWidth: i < pending.length - 1 ? 1 : 0, borderBottomColor: '#f4f4f5',
                  }}>
                  <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={18} color="#d97706" strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: '#0f0f0f', fontWeight: '700', fontSize: 13 }}>{p.plan}</Text>
                    <Text style={{ color: '#a1a1aa', fontSize: 12 }}>${p.amount} • Vence {p.dueDate}</Text>
                  </View>
                  <View style={{ backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: '#92400e', fontSize: 11, fontWeight: '700' }}>Pendiente</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ paddingBottom: 32 }}>
          <SectionHeader title="Reportes" />
          <View style={{ gap: 10 }}>
            {reports.map((r) => (
              <View
                key={r.label}
                style={{ backgroundColor: '#fff', borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#f0f0f0' }}>
                <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: r.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <r.icon size={22} color={r.color} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: '#0f0f0f', fontWeight: '800', fontSize: 20, letterSpacing: -0.5 }}>{r.value}</Text>
                  <Text style={{ color: '#3f3f46', fontWeight: '600', fontSize: 13 }}>{r.label}</Text>
                  <Text style={{ color: '#a1a1aa', fontSize: 11 }}>{r.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user, activeRole } = useAppStore();
  if (!user) return null;
  if (activeRole === 'trainer') return <TrainerDashboard />;
  if (activeRole === 'admin') return <AdminDashboard />;
  return <UserDashboard />;
}
