import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import {
  FakeUserService,
  FakeRoutineService,
  FakeChatService,
} from '@/lib/services';
import type { User, Routine } from '@/lib/types';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import {
  ArrowLeft,
  MessageCircle,
  Dumbbell,
  Clock,
  BarChart2,
  ChevronRight,
  Plus,
  Target,
  TrendingUp,
} from 'lucide-react-native';

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     '#22c55e',
  intermediate: '#f97316',
  advanced:     '#ef4444',
};
const DIFFICULTY_LABEL: Record<string, string> = {
  beginner:     'Principiante',
  intermediate: 'Intermedio',
  advanced:     'Avanzado',
};

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const t       = useTheme();
  const { user: trainer } = useAppStore();

  const [client,   setClient]   = useState<User | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [convId,   setConvId]   = useState<string | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!id || !trainer) return;
    Promise.all([
      FakeUserService.getTrainerClients(trainer.id),
      FakeRoutineService.getByTrainerId(trainer.id),
      FakeChatService.getConversationWith(trainer.id, id),
    ]).then(([clients, allRoutines, conv]) => {
      const found = clients.find((c) => c.id === id) ?? null;
      setClient(found);
      setRoutines(
        allRoutines.filter(
          (r) => r.userId === id || (r.assignedTo ?? []).includes(id)
        )
      );
      setConvId(conv?.id ?? null);
      setLoading(false);
    });
  }, [id, trainer]);

  const handleOpenChat = () => {
    if (convId) {
      router.push(`/chat/${convId}` as any);
    } else {
      router.push('/chat' as any);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={t.accent} />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg.primary, alignItems: 'center', justifyContent: 'center', gap: SPACING.md }}>
        <Text style={{ color: t.text.secondary, fontSize: FONT.base }}>Cliente no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: t.accent, fontWeight: '700' }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg.primary }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 48 }}>

      {/* Header */}
      <View
        style={{
          backgroundColor: t.bg.secondary,
          paddingTop: 56,
          paddingBottom: SPACING.xxl,
          paddingHorizontal: SPACING.xxl,
          borderBottomWidth: 1,
          borderBottomColor: t.border.subtle,
          gap: SPACING.xl,
        }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.sm,
            alignSelf: 'flex-start',
          }}>
          <ArrowLeft size={18} color={t.text.secondary} />
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>Mis Clientes</Text>
        </TouchableOpacity>

        {/* Client hero */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.lg }}>
          <Image
            source={{ uri: client.avatar }}
            style={{
              width: 72, height: 72, borderRadius: 36,
              borderWidth: 2.5, borderColor: t.accent,
              backgroundColor: t.bg.tertiary,
            }}
          />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xxl, letterSpacing: -0.3 }}>
              {client.name}
            </Text>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm }}>{client.email}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <Target size={12} color={t.accent} />
              <Text style={{ color: t.text.accent, fontSize: FONT.xs, fontWeight: '600' }}>
                {client.goal ?? 'Sin objetivo definido'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { label: 'Rutinas',   value: String(routines.length), color: t.accent },
            { label: 'Peso',      value: `${client.weight ?? '—'} kg`, color: t.info },
            { label: 'Altura',    value: `${client.height ?? '—'} cm`, color: t.warning },
          ].map((s) => (
            <View
              key={s.label}
              style={{
                flex: 1, backgroundColor: t.bg.elevated, borderRadius: RADIUS.lg,
                paddingVertical: SPACING.md, alignItems: 'center', gap: 4,
                borderWidth: 1, borderColor: t.border.subtle,
              }}>
              <Text style={{ color: s.color, fontWeight: '800', fontSize: FONT.lg }}>{s.value}</Text>
              <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Chat button */}
        <TouchableOpacity
          onPress={handleOpenChat}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            gap: SPACING.md, backgroundColor: t.accent, borderRadius: RADIUS.xl,
            paddingVertical: 14,
          }}>
          <MessageCircle size={18} color={t.accentText} strokeWidth={2.5} />
          <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.base }}>
            Abrir Chat con {client.name.split(' ')[0]}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Routines section */}
      <View style={{ paddingHorizontal: SPACING.xxl, paddingTop: SPACING.xxl, gap: SPACING.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <Dumbbell size={16} color={t.accent} />
            <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg }}>
              Rutinas asignadas
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/routines/create' as any)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 5,
              backgroundColor: t.accentDim, borderRadius: RADIUS.full,
              paddingHorizontal: SPACING.md, paddingVertical: 6,
              borderWidth: 1, borderColor: t.accent,
            }}>
            <Plus size={13} color={t.accent} strokeWidth={2.5} />
            <Text style={{ color: t.accent, fontSize: FONT.xs, fontWeight: '700' }}>Asignar</Text>
          </TouchableOpacity>
        </View>

        {routines.length === 0 ? (
          <View
            style={{
              backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
              padding: SPACING.xl, alignItems: 'center', gap: SPACING.md,
              borderWidth: 1, borderColor: t.border.subtle,
            }}>
            <View
              style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center',
              }}>
              <Dumbbell size={24} color={t.text.tertiary} />
            </View>
            <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.base }}>
              Sin rutinas asignadas
            </Text>
            <Text style={{ color: t.text.tertiary, fontSize: FONT.sm, textAlign: 'center' }}>
              Crea una rutina y asígnala a {client.name.split(' ')[0]} para que aparezca aquí.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/routines/create' as any)}
              style={{
                backgroundColor: t.accent, borderRadius: RADIUS.lg,
                paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
              }}>
              <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.sm }}>
                Crear rutina
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
              overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle,
            }}>
            {routines.map((routine, i) => (
              <TouchableOpacity
                key={routine.id}
                onPress={() => router.push(`/routines/${routine.id}` as any)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
                  padding: SPACING.lg,
                  borderBottomWidth: i < routines.length - 1 ? 1 : 0,
                  borderBottomColor: t.border.subtle,
                }}>
                <Image
                  source={{ uri: routine.imageUrl }}
                  style={{ width: 52, height: 52, borderRadius: RADIUS.md, backgroundColor: t.bg.tertiary }}
                />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
                    {routine.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} color={t.text.tertiary} />
                      <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>{routine.duration} min</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <BarChart2 size={12} color={DIFFICULTY_COLOR[routine.difficulty]} />
                      <Text style={{ color: DIFFICULTY_COLOR[routine.difficulty], fontSize: FONT.xs, fontWeight: '600' }}>
                        {DIFFICULTY_LABEL[routine.difficulty]}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <TrendingUp size={12} color={t.text.tertiary} />
                      <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>
                        {routine.exercises.length} ejercicios
                      </Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={15} color={t.text.tertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
