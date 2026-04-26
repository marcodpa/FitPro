import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FakeUserService, FakeRoutineService } from '@/lib/services';
import type { User, Routine } from '@/lib/types';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Users,
  MessageCircle,
  Dumbbell,
  ClipboardList,
  X,
  CheckCircle2,
} from 'lucide-react-native';

export default function ClientsScreen() {
  const router             = useRouter();
  const t                  = useTheme();
  const { user: trainer }  = useAppStore();

  const [clients,  setClients]  = useState<User[]>([]);
  const [query,    setQuery]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [assignTarget, setAssignTarget] = useState<User | null>(null); // client being assigned
  const [assigning,    setAssigning]    = useState(false);

  useEffect(() => {
    if (!trainer) return;
    Promise.all([
      FakeUserService.getTrainerClients(trainer.id),
      FakeRoutineService.getAll(),
    ]).then(([list, ruts]) => {
      setClients(list);
      setRoutines(ruts);
      setLoading(false);
    });
  }, [trainer]);

  const handleAssignRoutine = async (routineId: string) => {
    if (!assignTarget) return;
    setAssigning(true);
    try {
      await FakeRoutineService.assignToClients(routineId, [assignTarget.id]);
      setAssignTarget(null);
      Alert.alert('Asignada', `Rutina asignada a ${assignTarget.name.split(' ')[0]}.`);
    } catch {
      Alert.alert('Error', 'No se pudo asignar la rutina.');
    } finally {
      setAssigning(false);
    }
  };

  const filtered = query.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.email.toLowerCase().includes(query.toLowerCase())
      )
    : clients;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: t.bg.secondary,
          paddingTop: 56,
          paddingBottom: SPACING.xl,
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
              Mis Clientes
            </Text>
            <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>
              {clients.length} cliente{clients.length !== 1 ? 's' : ''} activo{clients.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View
            style={{
              width: 40, height: 40, borderRadius: RADIUS.lg,
              backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: t.accent,
            }}>
            <Users size={20} color={t.accent} />
          </View>
        </View>

        {/* Search */}
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
            backgroundColor: t.bg.elevated, borderRadius: RADIUS.lg,
            paddingHorizontal: SPACING.lg, borderWidth: 1, borderColor: t.border.default,
          }}>
          <Search size={16} color={t.text.tertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar cliente..."
            placeholderTextColor={t.text.tertiary}
            style={{ flex: 1, color: t.text.primary, fontSize: FONT.base, paddingVertical: 12 }}
          />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.accent} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: SPACING.xxl, gap: SPACING.sm }}>

          {filtered.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 48, gap: SPACING.md }}>
              <Users size={36} color={t.border.strong} />
              <Text style={{ color: t.text.tertiary, fontSize: FONT.base, fontWeight: '600' }}>
                {query ? 'Sin resultados' : 'No tienes clientes aún'}
              </Text>
            </View>
          )}

          {filtered.map((client) => (
            <TouchableOpacity
              key={client.id}
              onPress={() => router.push(`/trainer/client/${client.id}` as any)}
              activeOpacity={0.8}
              style={{
                backgroundColor: t.bg.card,
                borderRadius: RADIUS.xl,
                padding: SPACING.lg,
                borderWidth: 1,
                borderColor: t.border.subtle,
                flexDirection: 'row',
                alignItems: 'center',
                gap: SPACING.lg,
              }}>
              {/* Avatar */}
              <Image
                source={{ uri: client.avatar }}
                style={{
                  width: 54, height: 54, borderRadius: 27,
                  borderWidth: 2, borderColor: t.border.default,
                  backgroundColor: t.bg.tertiary,
                }}
              />

              {/* Info */}
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
                  {client.name}
                </Text>
                <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>{client.email}</Text>
                {client.goal ? (
                  <Text style={{ color: t.text.accent, fontSize: FONT.xs, fontWeight: '600', marginTop: 1 }}>
                    {client.goal}
                  </Text>
                ) : null}
              </View>

              {/* Actions */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <TouchableOpacity
                  onPress={() => router.push('/chat' as any)}
                  style={{
                    width: 36, height: 36, borderRadius: RADIUS.md,
                    backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center',
                    borderWidth: 1, borderColor: t.accent,
                  }}>
                  <MessageCircle size={16} color={t.accent} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAssignTarget(client)}
                  style={{
                    width: 36, height: 36, borderRadius: RADIUS.md,
                    backgroundColor: t.infoDim, alignItems: 'center', justifyContent: 'center',
                    borderWidth: 1, borderColor: t.info,
                  }}>
                  <ClipboardList size={16} color={t.info} />
                </TouchableOpacity>
                <ChevronRight size={15} color={t.text.tertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Assign Routine Modal */}
      <Modal visible={!!assignTarget} transparent animationType="slide" onRequestClose={() => setAssignTarget(null)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
          activeOpacity={1}
          onPress={() => setAssignTarget(null)}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg }}>Asignar Rutina</Text>
              {assignTarget && (
                <Text style={{ color: t.text.secondary, fontSize: FONT.sm, marginTop: 2 }}>
                  Para {assignTarget.name}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setAssignTarget(null)} style={{ width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color={t.text.secondary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {routines.length === 0 ? (
              <View style={{ alignItems: 'center', padding: SPACING.xl }}>
                <Dumbbell size={32} color={t.border.strong} strokeWidth={1.5} />
                <Text style={{ color: t.text.secondary, fontSize: FONT.sm, marginTop: SPACING.md }}>
                  No tienes rutinas creadas.
                </Text>
                <TouchableOpacity
                  onPress={() => { setAssignTarget(null); router.push('/routines/create' as any); }}
                  style={{ marginTop: SPACING.md, backgroundColor: t.accent, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm }}>
                  <Text style={{ color: t.accentText, fontWeight: '700', fontSize: FONT.sm }}>Crear rutina</Text>
                </TouchableOpacity>
              </View>
            ) : (
              routines.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => handleAssignRoutine(r.id)}
                  disabled={assigning}
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
                    opacity: assigning ? 0.6 : 1,
                  }}>
                  <View style={{ width: 42, height: 42, borderRadius: RADIUS.md, backgroundColor: t.infoDim, alignItems: 'center', justifyContent: 'center' }}>
                    <Dumbbell size={18} color={t.info} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>{r.name}</Text>
                    <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>{r.duration} min • {r.category}</Text>
                  </View>
                  {assigning
                    ? <ActivityIndicator size="small" color={t.accent} />
                    : <CheckCircle2 size={18} color={t.border.strong} strokeWidth={1.5} />
                  }
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
