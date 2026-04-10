import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FakeUserService } from '@/lib/services';
import type { User } from '@/lib/types';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Users,
  MessageCircle,
  Dumbbell,
} from 'lucide-react-native';

export default function ClientsScreen() {
  const router             = useRouter();
  const t                  = useTheme();
  const { user: trainer }  = useAppStore();

  const [clients, setClients] = useState<User[]>([]);
  const [query,   setQuery]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trainer) return;
    FakeUserService.getTrainerClients(trainer.id).then((list) => {
      setClients(list);
      setLoading(false);
    });
  }, [trainer]);

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
                  onPress={() => router.push(`/trainer/client/${client.id}` as any)}
                  style={{
                    width: 36, height: 36, borderRadius: RADIUS.md,
                    backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center',
                    borderWidth: 1, borderColor: t.border.subtle,
                  }}>
                  <Dumbbell size={16} color={t.text.secondary} />
                </TouchableOpacity>
                <ChevronRight size={15} color={t.text.tertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
