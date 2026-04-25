import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FakeUserService, FakeChatService, FakeRoutineService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import type { User, Routine } from '@/lib/types';
import {
  ArrowLeft,
  MessageCircle,
  UserPlus,
  UserMinus,
  Dumbbell,
  Target,
  Calendar,
  Ruler,
  Weight,
  Users,
} from 'lucide-react-native';

const ROLE_LABELS: Record<string, string> = {
  client:  'Cliente',
  trainer: 'Entrenador',
  admin:   'Admin',
};

const ROLE_COLORS: Record<string, string> = {
  client:  '#6366f1',
  trainer: '#22c55e',
  admin:   '#f59e0b',
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: me } = useAppStore();
  const t = useTheme();
  const router = useRouter();

  const [profile, setProfile]       = useState<User | null>(null);
  const [routines, setRoutines]      = useState<Routine[]>([]);
  const [loading, setLoading]        = useState(true);
  const [following, setFollowing]    = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      FakeUserService.getById(id),
      FakeRoutineService.getByTrainerId(id).catch(() => []),
    ]).then(([u, r]) => {
      setProfile(u);
      setRoutines(r);
    }).finally(() => setLoading(false));
    // Check if we're following
    FakeUserService.getFollowing().then((list) => {
      setFollowing(list.some((u) => u.id === id));
    }).catch(() => {});
  }, [id]);

  const handleFollow = async () => {
    if (!id) return;
    setFollowLoading(true);
    try {
      const res = await FakeUserService.follow(id);
      setFollowing(res.following);
      setFollowerCount(res.followers_count);
    } catch {
      Alert.alert('Error', 'No se pudo completar la acción.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!id) return;
    try {
      let conv = await FakeChatService.getConversationWith('', id);
      if (!conv) {
        conv = await FakeChatService.createConversation(id);
      }
      router.push(`/chat/${conv.id}` as any);
    } catch {
      Alert.alert('Error', 'No se pudo abrir la conversación.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg.primary, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl }}>
        <Text style={{ color: t.text.secondary, fontSize: FONT.base, textAlign: 'center' }}>
          Usuario no encontrado.
        </Text>
      </View>
    );
  }

  const roleColor = ROLE_COLORS[profile.role] ?? t.accent;
  const isMe = me?.id === profile.id;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{
        backgroundColor: t.bg.secondary,
        paddingTop: 56,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: t.border.subtle,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} color={t.text.primary} />
        </TouchableOpacity>
        <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, flex: 1 }}>
          Perfil
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{
          backgroundColor: t.bg.secondary,
          alignItems: 'center',
          paddingVertical: SPACING.xxl,
          paddingHorizontal: SPACING.xl,
          borderBottomWidth: 1,
          borderBottomColor: t.border.subtle,
          gap: SPACING.md,
        }}>
          <Image
            source={{ uri: profile.avatar }}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              borderWidth: 3,
              borderColor: roleColor,
              backgroundColor: t.bg.tertiary,
            }}
          />

          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xxl, letterSpacing: -0.3 }}>
              {profile.name}
            </Text>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm }}>
              {profile.email}
            </Text>
            <View style={{
              backgroundColor: roleColor + '20',
              borderRadius: RADIUS.full,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: roleColor + '50',
              marginTop: 4,
            }}>
              <Text style={{ color: roleColor, fontWeight: '700', fontSize: FONT.xs, letterSpacing: 0.5 }}>
                {ROLE_LABELS[profile.role] ?? profile.role}
              </Text>
            </View>
          </View>

          {profile.bio ? (
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, textAlign: 'center', lineHeight: 20, maxWidth: 280 }}>
              {profile.bio}
            </Text>
          ) : null}

          {/* Action buttons */}
          {!isMe && (
            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm }}>
              <TouchableOpacity
                onPress={handleMessage}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: t.accentDim,
                  borderRadius: RADIUS.xl,
                  paddingVertical: SPACING.md,
                  borderWidth: 1,
                  borderColor: t.accent,
                  minWidth: 130,
                }}>
                <MessageCircle size={16} color={t.accent} strokeWidth={2} />
                <Text style={{ color: t.accent, fontWeight: '700', fontSize: FONT.sm }}>Mensaje</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFollow}
                disabled={followLoading}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: following ? t.bg.elevated : t.bg.card,
                  borderRadius: RADIUS.xl,
                  paddingVertical: SPACING.md,
                  borderWidth: 1,
                  borderColor: following ? t.border.strong : t.border.default,
                  minWidth: 130,
                  opacity: followLoading ? 0.6 : 1,
                }}>
                {followLoading ? (
                  <ActivityIndicator size="small" color={t.text.secondary} />
                ) : following ? (
                  <>
                    <UserMinus size={16} color={t.text.secondary} strokeWidth={2} />
                    <Text style={{ color: t.text.secondary, fontWeight: '700', fontSize: FONT.sm }}>Siguiendo</Text>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} color={t.text.primary} strokeWidth={2} />
                    <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.sm }}>Seguir</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={{ padding: SPACING.xl, gap: SPACING.xl }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: Users,    value: followerCount > 0 ? String(followerCount) : '—', label: 'Seguidores', color: t.info },
              { icon: Weight,   value: profile.weight ? `${profile.weight}kg` : '—',    label: 'Peso',        color: t.accent },
              { icon: Ruler,    value: profile.height ? `${profile.height}cm` : '—',    label: 'Altura',      color: t.orange },
            ].map((s) => (
              <View key={s.label} style={{
                flex: 1,
                backgroundColor: t.bg.card,
                borderRadius: RADIUS.lg,
                padding: 14,
                alignItems: 'center',
                gap: 6,
                borderWidth: 1,
                borderColor: t.border.subtle,
              }}>
                <View style={{ width: 34, height: 34, borderRadius: RADIUS.md, backgroundColor: s.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={16} color={s.color} strokeWidth={2} />
                </View>
                <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xl, letterSpacing: -0.5 }}>{s.value}</Text>
                <Text style={{ color: t.text.secondary, fontSize: 11, fontWeight: '500' }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Goal */}
          {profile.goal ? (
            <View style={{
              backgroundColor: t.bg.card,
              borderRadius: RADIUS.xl,
              padding: SPACING.lg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.md,
              borderWidth: 1,
              borderColor: t.border.subtle,
            }}>
              <View style={{ width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                <Target size={18} color={t.accent} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text.secondary, fontSize: FONT.xs, fontWeight: '600', marginBottom: 2 }}>Objetivo</Text>
                <Text style={{ color: t.text.primary, fontSize: FONT.base, fontWeight: '700' }}>{profile.goal}</Text>
              </View>
            </View>
          ) : null}

          {/* Member since */}
          <View style={{
            backgroundColor: t.bg.card,
            borderRadius: RADIUS.xl,
            padding: SPACING.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.md,
            borderWidth: 1,
            borderColor: t.border.subtle,
          }}>
            <View style={{ width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: t.infoDim, alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} color={t.info} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text.secondary, fontSize: FONT.xs, fontWeight: '600', marginBottom: 2 }}>Miembro desde</Text>
              <Text style={{ color: t.text.primary, fontSize: FONT.base, fontWeight: '700' }}>{profile.joinedAt || '—'}</Text>
            </View>
          </View>

          {/* Routines */}
          {routines.length > 0 && (
            <View>
              <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3, marginBottom: SPACING.md }}>
                Rutinas ({routines.length})
              </Text>
              <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle }}>
                {routines.slice(0, 5).map((r, i) => (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => router.push(`/routines/${r.id}` as any)}
                    activeOpacity={0.75}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: SPACING.md,
                      padding: SPACING.lg,
                      borderBottomWidth: i < Math.min(routines.length, 5) - 1 ? 1 : 0,
                      borderBottomColor: t.border.subtle,
                    }}>
                    <View style={{ width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                      <Dumbbell size={18} color={t.accent} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>{r.name}</Text>
                      <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>{r.duration} min • {r.category}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </View>
  );
}
