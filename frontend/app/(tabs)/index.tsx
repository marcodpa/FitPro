import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { FakeWorkoutService, FakeUserService, FakePaymentService } from '@/lib/services';
import { COLORS } from '@/lib/theme';
import type { WorkoutSession, User, Payment } from '@/lib/types';
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
const AC = COLORS.accent.DEFAULT;

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
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}>
      <Text
        style={{
          fontSize: 17,
          fontWeight: '800',
          color: COLORS.text.primary,
          letterSpacing: -0.4,
        }}>
        {title}
      </Text>
      {action && (
        <TouchableOpacity
          onPress={onAction}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: AC }}>{action}</Text>
          <ChevronRight size={13} color={AC} strokeWidth={2.5} />
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
  const ic = iconColor ?? AC;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.bg.secondary,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.bg.border,
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
        <Text
          style={{
            color: COLORS.text.primary,
            fontWeight: '800',
            fontSize: 20,
            letterSpacing: -0.8,
          }}>
          {value}
        </Text>
        <Text style={{ color: COLORS.text.secondary, fontSize: 11, fontWeight: '500' }}>
          {label}
        </Text>
      </View>
    </View>
  );
}

// ─── USER / CLIENT ─────────────────────────────────────────────────────────────
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
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const quickActions = [
    {
      icon: Timer,
      label: 'Cronómetro',
      sublabel: 'Temporizador',
      route: '/workout/timer',
      iconColor: AC,
      bg: COLORS.accent.dim,
      border: COLORS.accent.dimMid,
    },
    {
      icon: CalendarDays,
      label: 'Calendario',
      sublabel: 'Ver semana',
      route: '/calendar',
      iconColor: COLORS.info,
      bg: COLORS.infoDim,
      border: COLORS.info + '30',
    },
    {
      icon: MessageCircle,
      label: 'Entrenador',
      sublabel: 'Chat directo',
      route: '/chat',
      iconColor: COLORS.orange,
      bg: COLORS.orangeDim,
      border: COLORS.orange + '30',
    },
    {
      icon: BookOpen,
      label: 'Ejercicios',
      sublabel: 'Biblioteca',
      route: '/exercises',
      iconColor: COLORS.success,
      bg: COLORS.successDim,
      border: COLORS.success + '30',
    },
  ];

  const activity = [
    {
      icon: CheckCircle2,
      text: 'Completaste Piernas & Glúteos',
      time: 'Hace 2 días',
      color: COLORS.success,
    },
    {
      icon: Flame,
      text: 'Racha activa: 5 días consecutivos',
      time: 'Ayer',
      color: COLORS.orange,
    },
    {
      icon: TrendingUp,
      text: 'Nuevo récord: 100 kg en sentadilla',
      time: 'Hace 3 días',
      color: COLORS.info,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg.primary }}
      showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ─────────────────────────── */}
      <View
        style={{
          paddingTop: 60,
          paddingBottom: 28,
          paddingHorizontal: 24,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.bg.border,
        }}>
        {/* Top row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
          }}>
          <View style={{ gap: 3 }}>
            <Text style={{ color: COLORS.text.secondary, fontSize: 13, fontWeight: '500' }}>
              {greeting}
            </Text>
            <Text
              style={{
                color: COLORS.text.primary,
                fontSize: 28,
                fontWeight: '800',
                letterSpacing: -1,
              }}>
              {user?.name?.split(' ')[0]}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: COLORS.bg.secondary,
                borderWidth: 1,
                borderColor: COLORS.bg.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Bell size={18} color={COLORS.text.secondary} strokeWidth={1.8} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              activeOpacity={0.85}>
              <View>
                <Image
                  source={{ uri: user?.avatar }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: AC,
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 11,
                    height: 11,
                    borderRadius: 6,
                    backgroundColor: COLORS.success,
                    borderWidth: 1.5,
                    borderColor: COLORS.bg.primary,
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MetricCard icon={Zap} value="14" label="Sesiones" iconColor={AC} />
          <MetricCard icon={Flame} value="5 días" label="Racha actual" iconColor={COLORS.orange} />
          <MetricCard
            icon={TrendingUp}
            value={`${user?.weight}kg`}
            label="Peso actual"
            iconColor={COLORS.info}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 28, gap: 28 }}>
        {/* ── Today Workout ───────────────── */}
        <View>
          <SectionHeader title="Entrenamiento de Hoy" />
          {loading ? (
            <View
              style={{
                height: 200,
                backgroundColor: COLORS.bg.secondary,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: COLORS.bg.border,
              }}>
              <ActivityIndicator color={AC} size="large" />
            </View>
          ) : todayWorkout ? (
            <TouchableOpacity
              onPress={() => router.push(`/workout/${todayWorkout.id}` as any)}
              activeOpacity={0.88}
              style={{ borderRadius: 20, overflow: 'hidden' }}>
              <Image
                source={{ uri: todayWorkout.routine.imageUrl }}
                style={{ width: '100%', height: 210 }}
                resizeMode="cover"
              />
              {/* overlay */}
              <View
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                }}
              />
              {/* Badges */}
              <View
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  flexDirection: 'row',
                  gap: 8,
                }}>
                <View
                  style={{
                    backgroundColor: AC,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}>
                  <Text
                    style={{
                      color: COLORS.text.inverse,
                      fontSize: 10,
                      fontWeight: '800',
                      letterSpacing: 1,
                    }}>
                    HOY
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: COLORS.white[10],
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderWidth: 1,
                    borderColor: COLORS.white[15],
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: '700',
                      letterSpacing: 0.5,
                    }}>
                    {todayWorkout.routine.category.toUpperCase()}
                  </Text>
                </View>
              </View>
              {/* Play btn */}
              <View
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: AC,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Play size={18} color={COLORS.text.inverse} strokeWidth={2.5} />
              </View>
              {/* Bottom info */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 18,
                  gap: 6,
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontWeight: '800',
                    fontSize: 20,
                    letterSpacing: -0.6,
                  }}>
                  {todayWorkout.routine.name}
                </Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <Text
                    style={{ color: COLORS.white[70], fontSize: 13, fontWeight: '500' }}>
                    {todayWorkout.routine.duration} min
                  </Text>
                  <Text
                    style={{ color: COLORS.white[70], fontSize: 13, fontWeight: '500' }}>
                    {todayWorkout.routine.exercises.length} ejercicios
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                backgroundColor: COLORS.bg.secondary,
                borderRadius: 20,
                padding: 32,
                alignItems: 'center',
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: COLORS.bg.borderStrong,
              }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: COLORS.bg.tertiary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}>
                <CalendarDays size={24} color={COLORS.text.tertiary} strokeWidth={1.5} />
              </View>
              <Text
                style={{
                  color: COLORS.text.primary,
                  fontWeight: '700',
                  fontSize: 16,
                  letterSpacing: -0.3,
                }}>
                Día de descanso
              </Text>
              <Text
                style={{
                  color: COLORS.text.secondary,
                  fontSize: 13,
                  textAlign: 'center',
                  marginTop: 6,
                  lineHeight: 19,
                }}>
                No tienes entrenamiento programado para hoy.
              </Text>
            </View>
          )}
        </View>

        {/* ── Quick Actions ───────────────── */}
        <View>
          <SectionHeader title="Accesos Rápidos" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {quickActions.map((a) => (
              <TouchableOpacity
                key={a.label}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.8}
                style={{
                  width: (width - 50) / 2,
                  backgroundColor: COLORS.bg.secondary,
                  borderRadius: 18,
                  padding: 16,
                  gap: 12,
                  borderWidth: 1,
                  borderColor: COLORS.bg.border,
                }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: a.bg,
                    borderWidth: 1,
                    borderColor: a.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <a.icon size={18} color={a.iconColor} strokeWidth={2} />
                </View>
                <View style={{ gap: 2 }}>
                  <Text
                    style={{
                      color: COLORS.text.primary,
                      fontWeight: '700',
                      fontSize: 14,
                      letterSpacing: -0.2,
                    }}>
                    {a.label}
                  </Text>
                  <Text style={{ color: COLORS.text.tertiary, fontSize: 11, fontWeight: '500' }}>
                    {a.sublabel}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Recent Activity ─────────────── */}
        <View style={{ paddingBottom: 32 }}>
          <SectionHeader title="Actividad Reciente" />
          <View
            style={{
              backgroundColor: COLORS.bg.secondary,
              borderRadius: 20,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: COLORS.bg.border,
            }}>
            {activity.map((item, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  paddingHorizontal: 18,
                  paddingVertical: 16,
                  borderBottomWidth: i < activity.length - 1 ? 1 : 0,
                  borderBottomColor: COLORS.bg.border,
                }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    backgroundColor: item.color + '18',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <item.icon size={17} color={item.color} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={{
                      color: COLORS.text.primary,
                      fontSize: 13,
                      fontWeight: '600',
                      letterSpacing: -0.1,
                    }}>
                    {item.text}
                  </Text>
                  <Text style={{ color: COLORS.text.tertiary, fontSize: 11, fontWeight: '500' }}>
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

// ─── TRAINER ───────────────────────────────────────────────────────────────────
function TrainerDashboard() {
  const { user } = useAppStore();
  const [clients, setClients] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    FakeUserService.getTrainerClients(user.id).then(setClients);
  }, [user]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg.primary }}
      showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      <View
        style={{
          paddingTop: 60,
          paddingBottom: 28,
          paddingHorizontal: 24,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.bg.border,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
          }}>
          <View style={{ gap: 3 }}>
            <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>
              Panel Entrenador
            </Text>
            <Text
              style={{
                color: COLORS.text.primary,
                fontSize: 28,
                fontWeight: '800',
                letterSpacing: -1,
              }}>
              {user?.name?.split(' ')[0]}
            </Text>
          </View>
          <Image
            source={{ uri: user?.avatar }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: COLORS.info,
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MetricCard
            icon={UserCheck}
            value={clients.length.toString()}
            label="Clientes activos"
            iconColor={AC}
          />
          <MetricCard icon={Users} value="2" label="Cupos libres" iconColor={COLORS.info} />
          <MetricCard
            icon={ClipboardList}
            value="4"
            label="Rutinas creadas"
            iconColor={COLORS.orange}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 28, gap: 24 }}>
        {/* Clients */}
        <View>
          <SectionHeader
            title="Mis Clientes"
            action="Ver chats"
            onAction={() => router.push('/chat')}
          />
          <View
            style={{
              backgroundColor: COLORS.bg.secondary,
              borderRadius: 20,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: COLORS.bg.border,
            }}>
            {clients.map((client, i) => (
              <View
                key={client.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  borderBottomWidth: i < clients.length - 1 ? 1 : 0,
                  borderBottomColor: COLORS.bg.border,
                }}>
                <Image
                  source={{ uri: client.avatar }}
                  style={{ width: 44, height: 44, borderRadius: 12 }}
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={{
                      color: COLORS.text.primary,
                      fontWeight: '700',
                      fontSize: 14,
                    }}>
                    {client.name}
                  </Text>
                  <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                    {client.goal}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: COLORS.successDim,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: COLORS.success + '30',
                  }}>
                  <Text
                    style={{
                      color: COLORS.success,
                      fontSize: 11,
                      fontWeight: '700',
                    }}>
                    Activo
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Payment alert */}
        <View>
          <SectionHeader title="Próximo Cobro" />
          <View
            style={{
              backgroundColor: COLORS.bg.secondary,
              borderRadius: 18,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              borderWidth: 1,
              borderColor: COLORS.warning + '40',
            }}>
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                backgroundColor: COLORS.warningDim,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <CreditCard size={20} color={COLORS.warning} strokeWidth={2} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{ color: COLORS.text.primary, fontWeight: '700', fontSize: 14 }}>
                Pago pendiente
              </Text>
              <Text style={{ color: COLORS.warning, fontSize: 12, fontWeight: '500' }}>
                Alex García • $50 • Vence 15/Mar
              </Text>
            </View>
            <AlertCircle size={18} color={COLORS.warning} strokeWidth={2} />
          </View>
        </View>

        {/* Actions */}
        <View style={{ paddingBottom: 32 }}>
          <SectionHeader title="Acciones Rápidas" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('/routines')}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: COLORS.bg.secondary,
                borderRadius: 18,
                padding: 20,
                alignItems: 'center',
                gap: 10,
                borderWidth: 1,
                borderColor: COLORS.bg.border,
              }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: COLORS.infoDim,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <ClipboardList size={24} color={COLORS.info} strokeWidth={1.8} />
              </View>
              <Text style={{ color: COLORS.text.primary, fontWeight: '700', fontSize: 13 }}>
                Mis Rutinas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/payments')}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: COLORS.bg.secondary,
                borderRadius: 18,
                padding: 20,
                alignItems: 'center',
                gap: 10,
                borderWidth: 1,
                borderColor: COLORS.bg.border,
              }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: COLORS.accent.dim,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <CreditCard size={24} color={AC} strokeWidth={1.8} />
              </View>
              <Text style={{ color: COLORS.text.primary, fontWeight: '700', fontSize: 13 }}>
                Pagos
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── ADMIN ─────────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const { user } = useAppStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const router = useRouter();

  useEffect(() => {
    FakePaymentService.getAll().then(setPayments);
  }, []);

  const pending = payments.filter((p) => p.status === 'pending');

  const kpis = [
    {
      icon: BarChart3,
      value: '$150',
      label: 'Ingresos',
      sublabel: 'Este mes',
      color: AC,
    },
    {
      icon: Users,
      value: '4',
      label: 'Usuarios',
      sublabel: 'Activos',
      color: COLORS.info,
    },
    {
      icon: AlertCircle,
      value: String(pending.length),
      label: 'Pendientes',
      sublabel: 'Pagos por validar',
      color: pending.length > 0 ? COLORS.warning : COLORS.success,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg.primary }}
      showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      <View
        style={{
          paddingTop: 60,
          paddingBottom: 28,
          paddingHorizontal: 24,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.bg.border,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
          }}>
          <View style={{ gap: 3 }}>
            <Text style={{ color: COLORS.text.secondary, fontSize: 13 }}>
              Panel Admin
            </Text>
            <Text
              style={{
                color: COLORS.text.primary,
                fontSize: 28,
                fontWeight: '800',
                letterSpacing: -1,
              }}>
              FitPro
            </Text>
          </View>
          <Image
            source={{ uri: user?.avatar }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: COLORS.orange,
            }}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {kpis.map((k) => (
            <MetricCard
              key={k.label}
              icon={k.icon}
              value={k.value}
              label={k.label}
              iconColor={k.color}
            />
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 28, gap: 24 }}>
        {pending.length > 0 && (
          <View>
            <SectionHeader
              title="Pagos Pendientes"
              action="Ver todos"
              onAction={() => router.push('/payments')}
            />
            <View
              style={{
                backgroundColor: COLORS.bg.secondary,
                borderRadius: 20,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: COLORS.bg.border,
              }}>
              {pending.map((p, i) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => router.push('/payments')}
                  activeOpacity={0.85}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    paddingHorizontal: 18,
                    paddingVertical: 16,
                    borderBottomWidth: i < pending.length - 1 ? 1 : 0,
                    borderBottomColor: COLORS.bg.border,
                  }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 11,
                      backgroundColor: COLORS.warningDim,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <CreditCard size={17} color={COLORS.warning} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={{
                        color: COLORS.text.primary,
                        fontWeight: '700',
                        fontSize: 13,
                      }}>
                      {p.plan}
                    </Text>
                    <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                      ${p.amount} • Vence {p.dueDate}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: COLORS.warningDim,
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}>
                    <Text
                      style={{
                        color: COLORS.warning,
                        fontSize: 11,
                        fontWeight: '700',
                      }}>
                      Pendiente
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Reports */}
        <View style={{ paddingBottom: 32 }}>
          <SectionHeader title="Resumen General" />
          <View style={{ gap: 10 }}>
            {[
              {
                icon: BarChart3,
                label: 'Ingresos del mes',
                value: '$150',
                sub: '3 pagos validados',
                color: AC,
              },
              {
                icon: Users,
                label: 'Usuarios registrados',
                value: '4',
                sub: 'De 4 activos',
                color: COLORS.info,
              },
              {
                icon: UserCheck,
                label: 'Entrenadores activos',
                value: '1',
                sub: 'Carlos Méndez',
                color: COLORS.orange,
              },
            ].map((r) => (
              <View
                key={r.label}
                style={{
                  backgroundColor: COLORS.bg.secondary,
                  borderRadius: 18,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  borderWidth: 1,
                  borderColor: COLORS.bg.border,
                }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 13,
                    backgroundColor: r.color + '18',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <r.icon size={20} color={r.color} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={{
                      color: COLORS.text.primary,
                      fontWeight: '800',
                      fontSize: 22,
                      letterSpacing: -0.8,
                    }}>
                    {r.value}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.text.secondary,
                      fontWeight: '600',
                      fontSize: 13,
                    }}>
                    {r.label}
                  </Text>
                  <Text style={{ color: COLORS.text.tertiary, fontSize: 11 }}>
                    {r.sub}
                  </Text>
                </View>
                <ArrowUpRight size={16} color={COLORS.text.tertiary} strokeWidth={2} />
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
