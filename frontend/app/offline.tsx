import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import {
  WifiOff,
  Dumbbell,
  BookOpen,
  Timer,
  BarChart2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Users,
  CreditCard,
  ArrowLeft,
  ChevronRight,
  Wifi,
} from 'lucide-react-native';

const AVAILABLE_OFFLINE = [
  {
    icon: Dumbbell,
    color: '#c8f65d',
    title: 'Rutinas guardadas',
    description: 'Consulta y ejecuta tus rutinas descargadas.',
    route: '/(tabs)/routines',
  },
  {
    icon: Timer,
    color: '#22c55e',
    title: 'Cronómetro y timer',
    description: 'Usa el temporizador de descanso durante tu entrenamiento.',
    route: '/workout/timer',
  },
  {
    icon: BookOpen,
    color: '#f97316',
    title: 'Biblioteca de ejercicios',
    description: 'Revisa la descripción y técnica de los ejercicios en caché.',
    route: '/exercises',
  },
  {
    icon: BarChart2,
    color: '#818cf8',
    title: 'Historial de sesiones',
    description: 'Ve tu historial de entrenamientos completados localmente.',
    route: '/(tabs)',
  },
];

const UNAVAILABLE_OFFLINE = [
  {
    icon: MessageSquare,
    title: 'Chat',
    description: 'Requiere conexión para enviar y recibir mensajes.',
  },
  {
    icon: Users,
    title: 'Feed social',
    description: 'Las publicaciones y comentarios necesitan internet.',
  },
  {
    icon: CreditCard,
    title: 'Pagos y planes',
    description: 'Las transacciones requieren conexión segura.',
  },
  {
    icon: Dumbbell,
    title: 'Sincronizar progreso',
    description: 'Los datos se sincronizarán cuando vuelva la conexión.',
  },
];

export default function OfflineScreen() {
  const router = useRouter();
  const t = useTheme();
  const { toggleOffline } = useAppStore();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: t.bg.secondary,
          paddingTop: 56,
          paddingBottom: SPACING.xxl,
          paddingHorizontal: SPACING.xxl,
          borderBottomWidth: 1,
          borderBottomColor: t.border.subtle,
          gap: SPACING.lg,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 38, height: 38, borderRadius: RADIUS.lg,
              backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: t.border.subtle,
            }}>
            <ArrowLeft size={18} color={t.text.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xl, letterSpacing: -0.3 }}>
              Modo Sin Conexión
            </Text>
            <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>
              Funciones disponibles sin conexión
            </Text>
          </View>
        </View>

        {/* Status badge */}
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
            backgroundColor: 'rgba(251,191,36,0.10)',
            borderRadius: RADIUS.xl, padding: SPACING.lg,
            borderWidth: 1.5, borderColor: 'rgba(251,191,36,0.4)',
          }}>
          <View
            style={{
              width: 46, height: 46, borderRadius: 23,
              backgroundColor: 'rgba(251,191,36,0.15)',
              alignItems: 'center', justifyContent: 'center',
            }}>
            <WifiOff size={22} color="#fbbf24" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fbbf24', fontWeight: '800', fontSize: FONT.base }}>
              Sin conexión activa
            </Text>
            <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>
              Estás usando la app en modo sin conexión. Algunos datos pueden no estar actualizados.
            </Text>
          </View>
        </View>

        {/* Reconnect button */}
        <TouchableOpacity
          onPress={() => { toggleOffline(); router.back(); }}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            gap: SPACING.md, backgroundColor: t.accent,
            borderRadius: RADIUS.xl, paddingVertical: 13,
          }}>
          <Wifi size={17} color={t.accentText} strokeWidth={2.5} />
          <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.base }}>
            Reconectar ahora
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: SPACING.xxl, gap: SPACING.xxl, paddingBottom: 48 }}>

        {/* Available */}
        <View style={{ gap: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <CheckCircle2 size={15} color={t.success} strokeWidth={2.5} />
            <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg }}>
              Disponible sin conexión
            </Text>
          </View>

          <View
            style={{
              backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
              overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle,
            }}>
            {AVAILABLE_OFFLINE.map((item, i) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.title}
                  activeOpacity={0.75}
                  onPress={() => router.push(item.route as any)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
                    padding: SPACING.lg,
                    borderBottomWidth: i < AVAILABLE_OFFLINE.length - 1 ? 1 : 0,
                    borderBottomColor: t.border.subtle,
                  }}>
                  <View
                    style={{
                      width: 42, height: 42, borderRadius: RADIUS.lg,
                      backgroundColor: item.color + '18',
                      alignItems: 'center', justifyContent: 'center',
                      borderWidth: 1, borderColor: item.color + '30',
                    }}>
                    <Icon size={20} color={item.color} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
                      {item.title}
                    </Text>
                    <Text style={{ color: t.text.secondary, fontSize: FONT.xs, lineHeight: 16 }}>
                      {item.description}
                    </Text>
                  </View>
                  <ChevronRight size={15} color={t.text.tertiary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Unavailable */}
        <View style={{ gap: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <XCircle size={15} color={t.danger} strokeWidth={2.5} />
            <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg }}>
              No disponible sin conexión
            </Text>
          </View>

          <View
            style={{
              backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
              overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle,
            }}>
            {UNAVAILABLE_OFFLINE.map((item, i) => {
              const Icon = item.icon;
              return (
                <View
                  key={item.title}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
                    padding: SPACING.lg,
                    borderBottomWidth: i < UNAVAILABLE_OFFLINE.length - 1 ? 1 : 0,
                    borderBottomColor: t.border.subtle,
                    opacity: 0.55,
                  }}>
                  <View
                    style={{
                      width: 42, height: 42, borderRadius: RADIUS.lg,
                      backgroundColor: t.bg.tertiary,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                    <Icon size={20} color={t.text.tertiary} strokeWidth={1.8} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
                      {item.title}
                    </Text>
                    <Text style={{ color: t.text.secondary, fontSize: FONT.xs, lineHeight: 16 }}>
                      {item.description}
                    </Text>
                  </View>
                  <WifiOff size={14} color={t.text.tertiary} />
                </View>
              );
            })}
          </View>
        </View>

        {/* Info note */}
        <View
          style={{
            backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
            padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle,
            gap: SPACING.sm,
          }}>
          <Text style={{ color: t.text.secondary, fontSize: FONT.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Nota
          </Text>
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, lineHeight: 20 }}>
            Los datos guardados localmente como rutinas y ejercicios estarán disponibles. Al reconectarte, tu progreso se sincronizará automáticamente.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
