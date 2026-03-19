import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FakeChatService } from '@/lib/services';
import type { Conversation } from '@/lib/types';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { MessageSquare, Dumbbell, User, ChevronRight, Edit2, CheckCheck } from 'lucide-react-native';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

export default function ChatTab() {
  const { user } = useAppStore();
  const t = useTheme();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    FakeChatService.getConversations(user.id)
      .then(setConversations)
      .finally(() => setLoading(false));
  }, [user]);

  const getOther = (conv: Conversation) =>
    conv.participants.find((p) => p.id !== user?.id);

  const unreadTotal = conversations.filter((c: any) => c.unreadCount && c.unreadCount > 0).length;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <StatusBar barStyle={t.isDark ? 'light-content' : 'dark-content'} />

      <View style={{ backgroundColor: t.bg.primary, paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.xxl, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ gap: 4 }}>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '500' }}>Comunícate</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ color: t.text.primary, fontSize: 30, fontWeight: '800', letterSpacing: -1 }}>Mensajes</Text>
              {unreadTotal > 0 && (
                <View style={{ backgroundColor: t.accent, borderRadius: RADIUS.full, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
                  <Text style={{ color: t.accentText, fontSize: 11, fontWeight: '800' }}>{unreadTotal}</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.8} style={{ marginTop: 6, width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: t.accentDim, borderWidth: 1, borderColor: t.accent + '40', alignItems: 'center', justifyContent: 'center' }}>
            <Edit2 size={16} color={t.accent} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16 }}>
          <View style={{ width: 80, height: 80, borderRadius: RADIUS.xl, backgroundColor: t.bg.card, borderWidth: 1, borderStyle: 'dashed', borderColor: t.border.strong, alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={32} color={t.text.tertiary} strokeWidth={1.5} />
          </View>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xl }}>Sin conversaciones</Text>
            <Text style={{ color: t.text.secondary, textAlign: 'center', fontSize: FONT.sm, lineHeight: 22 }}>
              Cuando tengas un entrenador asignado podrás chatear aquí.
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: SPACING.md, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          {conversations.map((conv: Conversation, i: number) => {
            const other = getOther(conv);
            if (!other) return null;
            const isTrainer = other.role === 'trainer';
            const isAdmin   = other.role === 'admin';
            const lastMsg   = conv.lastMessage;
            const isRoutineMsg = lastMsg?.type === 'routine';
            const hasUnread = ((conv as any).unreadCount ?? 0) > 0;
            const roleColor = isTrainer ? t.accent : isAdmin ? t.orange : t.info;
            const roleDim   = isTrainer ? t.accentDim : isAdmin ? t.warningDim : t.infoDim;
            const roleLabel = isTrainer ? 'Entrenador' : isAdmin ? 'Admin' : 'Atleta';
            const RoleIcon  = isTrainer ? Dumbbell : User;

            return (
              <TouchableOpacity
                key={conv.id}
                onPress={() => router.push(`/chat/${conv.id}` as any)}
                activeOpacity={0.75}
                style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, paddingHorizontal: SPACING.xxl, paddingVertical: 14, backgroundColor: hasUnread ? t.accentDim + '60' : 'transparent', borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>

                {/* Avatar */}
                <View style={{ position: 'relative' }}>
                  <View style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2.5, borderColor: isTrainer ? t.accent + '60' : t.border.default, padding: 2 }}>
                    <Image source={{ uri: other.avatar }} style={{ width: '100%', height: '100%', borderRadius: 26, backgroundColor: t.bg.tertiary }} />
                  </View>
                  <View style={{ position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: 7, backgroundColor: t.success, borderWidth: 2.5, borderColor: t.bg.primary }} />
                </View>

                {/* Body */}
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: t.text.primary, fontWeight: hasUnread ? '800' : '700', fontSize: FONT.md, letterSpacing: -0.2 }}>{other.name}</Text>
                    <Text style={{ color: hasUnread ? t.accent : t.text.tertiary, fontSize: 11, fontWeight: hasUnread ? '700' : '400' }}>{timeAgo(conv.updatedAt)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: roleDim, borderRadius: RADIUS.sm, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: roleColor + '30' }}>
                      <RoleIcon size={9} color={roleColor} strokeWidth={2.5} />
                      <Text style={{ color: roleColor, fontSize: 10, fontWeight: '700' }}>{roleLabel}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {lastMsg && !isRoutineMsg && <CheckCheck size={13} color={t.text.tertiary} strokeWidth={2} />}
                    <Text numberOfLines={1} style={{ flex: 1, color: hasUnread ? t.text.primary : t.text.secondary, fontSize: FONT.sm, fontWeight: hasUnread ? '600' : '400' }}>
                      {isRoutineMsg ? '📋 Compartió una rutina' : (lastMsg?.text ?? 'Sin mensajes')}
                    </Text>
                  </View>
                </View>

                {hasUnread ? (
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: t.accentText, fontSize: 11, fontWeight: '800' }}>{(conv as any).unreadCount}</Text>
                  </View>
                ) : (
                  <ChevronRight size={16} color={t.text.tertiary} strokeWidth={2} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
