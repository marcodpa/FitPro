import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/lib/store';
import { FakeUserService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import type { User } from '@/lib/types';
import { ArrowLeft, UserPlus, UserMinus, Search, Users } from 'lucide-react-native';

export default function FollowersScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const router = useRouter();
  const t = useTheme();

  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    tab === 'following' ? 'following' : 'followers'
  );
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    Promise.all([
      FakeUserService.getFollowers(),
      FakeUserService.getFollowing(),
    ])
      .then(([frs, fing]) => {
        setFollowers(frs);
        setFollowing(fing);
        setFollowingSet(new Set(fing.map(u => u.id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = useCallback(async (userId: string) => {
    try {
      const res = await FakeUserService.follow(userId);
      setFollowingSet(prev => {
        const next = new Set(prev);
        if (res.following) next.add(userId);
        else next.delete(userId);
        return next;
      });
    } catch {}
  }, []);

  const list = activeTab === 'followers' ? followers : following;
  const filtered = query
    ? list.filter(u => u.name.toLowerCase().includes(query.toLowerCase()))
    : list;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 56,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.xl,
          backgroundColor: t.bg.secondary,
          borderBottomWidth: 1,
          borderBottomColor: t.border.subtle,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, marginBottom: SPACING.lg }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 38, height: 38, borderRadius: RADIUS.md,
              backgroundColor: t.bg.tertiary, borderWidth: 1, borderColor: t.border.subtle,
              alignItems: 'center', justifyContent: 'center',
            }}>
            <ArrowLeft size={18} color={t.text.primary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={{ color: t.text.primary, fontSize: FONT.xl, fontWeight: '800', letterSpacing: -0.5 }}>
            Conexiones
          </Text>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', backgroundColor: t.bg.tertiary, borderRadius: RADIUS.lg, padding: 3 }}>
          {(['followers', 'following'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => { setActiveTab(tab); setQuery(''); }}
              style={{
                flex: 1, paddingVertical: 9, borderRadius: RADIUS.md, alignItems: 'center',
                backgroundColor: activeTab === tab ? t.bg.card : 'transparent',
                borderWidth: activeTab === tab ? 1 : 0,
                borderColor: activeTab === tab ? t.border.subtle : 'transparent',
              }}>
              <Text style={{
                color: activeTab === tab ? t.text.primary : t.text.secondary,
                fontWeight: activeTab === tab ? '700' : '500',
                fontSize: FONT.sm,
              }}>
                {tab === 'followers'
                  ? `Seguidores ${followers.length > 0 ? `(${followers.length})` : ''}`
                  : `Siguiendo ${following.length > 0 ? `(${following.length})` : ''}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
          backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
          paddingHorizontal: SPACING.lg, paddingVertical: 10,
          borderWidth: 1, borderColor: t.border.subtle,
        }}>
          <Search size={15} color={t.text.tertiary} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar..."
            placeholderTextColor={t.text.tertiary}
            style={{ flex: 1, color: t.text.primary, fontSize: FONT.sm }}
          />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.accent} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md, paddingHorizontal: SPACING.xxxl }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} color={t.text.tertiary} strokeWidth={1.5} />
          </View>
          <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.lg, textAlign: 'center' }}>
            {query ? 'Sin resultados' : activeTab === 'followers' ? 'Aún no tienes seguidores' : 'No sigues a nadie aún'}
          </Text>
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, textAlign: 'center', lineHeight: 20 }}>
            {query ? 'Intenta con otro nombre' : activeTab === 'followers' ? 'Cuando alguien te siga aparecerá aquí' : 'Busca usuarios y síguelos para verlos aquí'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={u => u.id}
          contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingBottom: 32, gap: SPACING.sm }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: u }) => {
            const isFollowing = followingSet.has(u.id);
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(`/profile/user/${u.id}` as any)}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
                  backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
                  padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle,
                }}>
                <Image
                  source={{ uri: u.avatar }}
                  style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: t.bg.tertiary }}
                />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
                    {u.name}
                  </Text>
                  <Text style={{ color: t.text.secondary, fontSize: FONT.xs }} numberOfLines={1}>
                    {u.bio || u.goal || u.email}
                  </Text>
                  <View style={{
                    alignSelf: 'flex-start',
                    backgroundColor: u.role === 'trainer' ? t.successDim : u.role === 'admin' ? '#f59e0b18' : t.accentDim,
                    borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2,
                    borderWidth: 1,
                    borderColor: u.role === 'trainer' ? t.success + '50' : u.role === 'admin' ? '#f59e0b50' : t.accent + '50',
                  }}>
                    <Text style={{
                      color: u.role === 'trainer' ? t.success : u.role === 'admin' ? '#f59e0b' : t.accent,
                      fontSize: 10, fontWeight: '700', textTransform: 'capitalize',
                    }}>
                      {u.role === 'trainer' ? 'Entrenador' : u.role === 'admin' ? 'Admin' : 'Cliente'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleFollow(u.id)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.lg,
                    backgroundColor: isFollowing ? t.bg.tertiary : t.accent,
                    borderWidth: 1,
                    borderColor: isFollowing ? t.border.strong : t.accent,
                  }}>
                  {isFollowing
                    ? <UserMinus size={14} color={t.text.secondary} strokeWidth={2} />
                    : <UserPlus  size={14} color={t.accentText}     strokeWidth={2} />}
                  <Text style={{
                    color: isFollowing ? t.text.secondary : t.accentText,
                    fontSize: 12, fontWeight: '700',
                  }}>
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
