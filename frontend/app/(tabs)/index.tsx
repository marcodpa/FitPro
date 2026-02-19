import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { FakeWorkoutService, FakeUserService, FakePaymentService } from '@/lib/services';
import type { WorkoutSession, User, Payment } from '@/lib/types';

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

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Buenos días' : greetingHour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View
        style={{
            backgroundColor: '#0d9e6e',
          paddingTop: 56,
          paddingBottom: 32,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white/80 text-sm">{greeting} 👋</Text>
            <Text className="text-white font-bold" style={{ fontSize: 24, marginTop: 2 }}>
              {user?.name?.split(' ')[0]}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Image
              source={{ uri: user?.avatar }}
              style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: '#fff' }}
            />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View className="flex-row gap-3 mt-6">
          {[
            { label: 'Sesiones', value: '14', icon: '🏋️' },
            { label: 'Racha', value: '5 días', icon: '🔥' },
            { label: 'Peso', value: `${user?.weight}kg`, icon: '⚖️' },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 14,
                padding: 12,
                alignItems: 'center',
              }}>
              <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
              <Text className="text-white font-bold text-lg">{stat.value}</Text>
              <Text className="text-white/70 text-xs">{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="px-6 pt-6">
        {/* Today's workout */}
        <Text className="text-foreground font-bold text-xl mb-4">Entrenamiento de Hoy</Text>
        {loading ? (
          <ActivityIndicator color="#0d9e6e" size="large" />
        ) : todayWorkout ? (
          <TouchableOpacity
            onPress={() =>           router.push(`/workout/${todayWorkout.id}` as any)}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}>
            <Image
              source={{ uri: todayWorkout.routine.imageUrl }}
              style={{ width: '100%', height: 180 }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: 16,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
              }}>
              <Text className="text-white font-bold text-lg">{todayWorkout.routine.name}</Text>
              <View className="flex-row gap-4 mt-1">
                <Text className="text-white/80 text-sm">
                  ⏱ {todayWorkout.routine.duration} min
                </Text>
                <Text className="text-white/80 text-sm">
                  💪 {todayWorkout.routine.exercises.length} ejercicios
                </Text>
              </View>
            </View>
            <View
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: '#0d9e6e',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}>
              <Text className="text-white font-bold text-xs uppercase tracking-wide">Hoy</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              marginBottom: 24,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: '#e2e8f0',
            }}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>😴</Text>
            <Text className="text-foreground font-bold text-base">Sin entrenamiento hoy</Text>
            <Text className="text-muted-foreground text-sm text-center mt-1">
              Tómate un día de descanso o crea una sesión
            </Text>
          </View>
        )}

        {/* Quick actions */}
        <Text className="text-foreground font-bold text-xl mb-4">Accesos Rápidos</Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {[
            { icon: '⏱', label: 'Cronómetro', route: '/workout/timer', color: '#0d9e6e' },
            { icon: '📅', label: 'Calendario', route: '/calendar', color: '#2563eb' },
            { icon: '💬', label: 'Mi Entrenador', route: '/chat', color: '#7c3aed' },
            { icon: '📚', label: 'Ejercicios', route: '/exercises', color: '#ea580c' },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => router.push(action.route as any)}
              style={{
                width: '47%',
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 1,
                borderColor: '#f1f5f9',
              }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: action.color + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ fontSize: 20 }}>{action.icon}</Text>
              </View>
              <Text className="text-foreground font-semibold text-sm">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent activity */}
        <Text className="text-foreground font-bold text-xl mb-4">Actividad Reciente</Text>
        {[
          { icon: '✅', text: 'Completaste Piernas & Glúteos', time: 'Hace 2 días' },
          { icon: '🔥', text: 'Nueva racha de 5 días', time: 'Ayer' },
          { icon: '💪', text: 'Récord: 100kg en sentadilla', time: 'Hace 3 días' },
        ].map((item, i) => (
          <View
            key={i}
            className="flex-row items-center gap-3 mb-3"
            style={{
              backgroundColor: '#fff',
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: '#f1f5f9',
            }}>
            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            <View className="flex-1">
              <Text className="text-foreground text-sm font-medium">{item.text}</Text>
              <Text className="text-muted-foreground text-xs mt-0.5">{item.time}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 24 }} />
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
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <View
        style={{
          backgroundColor: '#2563eb',
          paddingTop: 56,
          paddingBottom: 32,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white/80 text-sm">Panel Entrenador</Text>
            <Text className="text-white font-bold" style={{ fontSize: 24, marginTop: 2 }}>
              {user?.name?.split(' ')[0]}
            </Text>
          </View>
          <Image
            source={{ uri: user?.avatar }}
            style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: '#fff' }}
          />
        </View>

        <View className="flex-row gap-3 mt-6">
          {[
            { label: 'Clientes', value: clients.length.toString(), icon: '👥' },
            { label: 'Cupos', value: '2', icon: '🎯' },
            { label: 'Rutinas', value: '4', icon: '📋' },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 14,
                padding: 12,
                alignItems: 'center',
              }}>
              <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
              <Text className="text-white font-bold text-lg">{stat.value}</Text>
              <Text className="text-white/70 text-xs">{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="px-6 pt-6">
        {/* Clients */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-foreground font-bold text-xl">Mis Clientes</Text>
          <TouchableOpacity onPress={() => router.push('/chat')}>
            <Text className="text-primary text-sm font-medium">Ver chats →</Text>
          </TouchableOpacity>
        </View>
        {clients.map((client) => (
          <View
            key={client.id}
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: '#f1f5f9',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}>
            <Image
              source={{ uri: client.avatar }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
            <View className="flex-1">
              <Text className="text-foreground font-bold text-base">{client.name}</Text>
              <Text className="text-muted-foreground text-xs mt-0.5">{client.goal}</Text>
            </View>
            <View
              style={{
                backgroundColor: '#dcfce7',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}>
              <Text style={{ color: '#16a34a', fontSize: 11, fontWeight: '600' }}>Activo</Text>
            </View>
          </View>
        ))}

        {/* Upcoming */}
        <Text className="text-foreground font-bold text-xl mb-4 mt-4">Próximo Cobro</Text>
        <View
          style={{
            backgroundColor: '#fef3c7',
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: '#fde68a',
          }}>
          <Text style={{ fontSize: 32 }}>💰</Text>
          <View>
            <Text style={{ color: '#92400e', fontWeight: '700', fontSize: 16 }}>
              Pago pendiente
            </Text>
            <Text style={{ color: '#b45309', fontSize: 13 }}>Alex García • $50 • Vence 15/Mar</Text>
          </View>
        </View>

        {/* Quick actions */}
        <Text className="text-foreground font-bold text-xl mb-4 mt-6">Acciones</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push('/routines')}
            style={{
              flex: 1,
              backgroundColor: '#2563eb',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
            }}>
            <Text style={{ fontSize: 28 }}>📋</Text>
            <Text className="text-white font-bold text-sm mt-1">Mis Rutinas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/payments')}
            style={{
              flex: 1,
              backgroundColor: '#0d9e6e',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
            }}>
            <Text style={{ fontSize: 28 }}>💳</Text>
            <Text className="text-white font-bold text-sm mt-1">Pagos</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
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

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <View
        style={{
          backgroundColor: '#7c3aed',
          paddingTop: 56,
          paddingBottom: 32,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white/80 text-sm">Panel Admin</Text>
            <Text className="text-white font-bold" style={{ fontSize: 24, marginTop: 2 }}>
              FitPro Admin
            </Text>
          </View>
          <Image
            source={{ uri: user?.avatar }}
            style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: '#fff' }}
          />
        </View>
        <View className="flex-row gap-3 mt-6">
          {[
            { label: 'Usuarios', value: '4', icon: '👥' },
            { label: 'Entrenadores', value: '1', icon: '🏋️' },
            { label: 'Pendientes', value: pending.length.toString(), icon: '⏳' },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 14,
                padding: 12,
                alignItems: 'center',
              }}>
              <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
              <Text className="text-white font-bold text-lg">{stat.value}</Text>
              <Text className="text-white/70 text-xs">{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="px-6 pt-6">
        <Text className="text-foreground font-bold text-xl mb-4">Pagos Pendientes</Text>
        {pending.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => router.push('/payments')}
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 16,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: '#fde68a',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#fef3c7',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 20 }}>💰</Text>
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-bold text-sm">{p.plan}</Text>
              <Text className="text-muted-foreground text-xs">
                ${p.amount} • Vence {p.dueDate}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#fef3c7',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}>
              <Text style={{ color: '#92400e', fontSize: 11, fontWeight: '600' }}>Pendiente</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Reports */}
        <Text className="text-foreground font-bold text-xl mb-4 mt-4">Reportes Rápidos</Text>
        {[
          { icon: '📊', label: 'Ingresos del mes', value: '$150', sub: '3 pagos validados' },
          { icon: '👥', label: 'Usuarios activos', value: '3', sub: 'De 4 registrados' },
          { icon: '🏋️', label: 'Entrenadores activos', value: '1', sub: 'Carlos Mendez' },
        ].map((r) => (
          <View
            key={r.label}
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 16,
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              borderWidth: 1,
              borderColor: '#f1f5f9',
            }}>
            <Text style={{ fontSize: 28 }}>{r.icon}</Text>
            <View className="flex-1">
              <Text className="text-foreground font-bold text-base">{r.value}</Text>
              <Text className="text-muted-foreground text-xs">{r.label}</Text>
              <Text className="text-muted-foreground text-xs">{r.sub}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </View>
    </ScrollView>
  );
}

// ─── MAIN HOME SCREEN ─────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user, activeRole } = useAppStore();

  if (!user) return null;

  if (activeRole === 'trainer') return <TrainerDashboard />;
  if (activeRole === 'admin') return <AdminDashboard />;
  return <UserDashboard />;
}
