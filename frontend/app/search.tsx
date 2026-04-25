import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Image, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/store';
import { FakeUserService } from '@/lib/services';
import type { User } from '@/lib/types';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { ArrowLeft, Search, Dumbbell, User as UserIcon, X } from 'lucide-react-native';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export default function SearchUsersScreen() {
  const router = useRouter();
  const t      = useTheme();
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback((q: string) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await FakeUserService.searchUsers(q);
        setResults(r);
        setSearched(true);
      } catch {
        setResults([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const handleChange = (v: string) => {
    setQuery(v);
    doSearch(v);
  };

  const roleColor: Record<string, string> = {
    trainer: t.accent,
    admin:   t.danger,
    client:  t.info,
    user:    t.text.secondary,
  };
  const roleLabel: Record<string, string> = {
    trainer: 'Entrenador',
    admin:   'Admin',
    client:  'Cliente',
    user:    'Usuario',
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{
        backgroundColor: t.bg.secondary, paddingTop: 56, paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.xl, borderBottomWidth: 1, borderBottomColor: t.border.subtle, gap: SPACING.md,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={18} color={t.text.primary} />
          </TouchableOpacity>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xl }}>Buscar usuarios</Text>
        </View>

        {/* Search input */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
          backgroundColor: t.bg.input, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md,
          borderWidth: 1.5, borderColor: t.border.default,
        }}>
          <Search size={16} color={t.text.tertiary} />
          <TextInput
            value={query}
            onChangeText={handleChange}
            placeholder="Nombre o email..."
            autoFocus
            placeholderTextColor={t.text.tertiary}
            style={{ flex: 1, color: t.text.primary, fontSize: FONT.base, paddingVertical: SPACING.sm + 2 }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleChange('')}>
              <X size={16} color={t.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : !searched ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md }}>
          <Search size={48} color={t.border.strong} strokeWidth={1.5} />
          <Text style={{ color: t.text.secondary, fontSize: FONT.base }}>Escribe para buscar usuarios</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm }}>
          <UserIcon size={48} color={t.border.strong} strokeWidth={1.5} />
          <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.lg }}>Sin resultados</Text>
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm }}>No se encontró "{query}"</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.sm }}>
          <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: SPACING.xs }}>
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </Text>
          {results.map((user) => (
            <TouchableOpacity
              key={user.id}
              onPress={() => router.push(`/profile/user/${user.id}` as any)}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
                backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.md,
                borderWidth: 1, borderColor: t.border.subtle,
              }}>
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.bg.tertiary }}
              />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>{user.name}</Text>
                <Text style={{ color: t.text.secondary, fontSize: FONT.xs }}>{user.email}</Text>
                {user.goal ? (
                  <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }} numberOfLines={1}>{user.goal}</Text>
                ) : null}
              </View>
              <View style={{
                backgroundColor: roleColor[user.role] + '20', borderRadius: RADIUS.full,
                paddingHorizontal: 10, paddingVertical: 4,
                borderWidth: 1, borderColor: roleColor[user.role] + '30',
              }}>
                <Text style={{ color: roleColor[user.role], fontSize: 11, fontWeight: '700' }}>
                  {roleLabel[user.role] ?? user.role}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
