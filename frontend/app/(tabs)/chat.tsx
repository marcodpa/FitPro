import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FakeChatService } from '@/lib/services';
import type { Conversation } from '@/lib/types';
import { MessageSquare, Dumbbell, User, ChevronRight } from 'lucide-react-native';
import { FONT, RADIUS, SPACING } from '@/lib/theme';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function ChatTab() {
  const { user } = useAppStore();
  const t = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    FakeChatService.getConversations(user.id)
      .then(setConversations)
      .finally(() => setLoading(false));
  }, [user]);

  const getOther = (conv: Conversation) =>
    conv.participants.find((p) => p.id !== user?.id);

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
        }}>
        <Text style={{ color: t.text.secondary, fontSize: FONT.xs, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
          FitPro
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Text style={{ color: t.text.primary, fontSize: FONT.xxxl, fontWeight: '800', letterSpacing: -0.5 }}>
            Mensajes
          </Text>
          {conversations.length > 0 && (
            <View
              style={{
                backgroundColor: t.accentDim,
                borderRadius: RADIUS.full,
                paddingHorizontal: SPACING.md,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: t.accent,
              }}>
              <Text style={{ color: t.text.accent, fontSize: FONT.xs, fontWeight: '700' }}>
                {conversations.length} activos
              </Text>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: RADIUS.xl,
              backgroundColor: t.bg.tertiary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: SPACING.lg,
              borderWidth: 1,
              borderColor: t.border.default,
            }}>
            <MessageSquare size={32} color={t.text.tertiary} />
          </View>
          <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.xl, textAlign: 'center', marginBottom: 8 }}>
            Sin mensajes
          </Text>
          <Text style={{ color: t.text.secondary, textAlign: 'center', fontSize: FONT.base, lineHeight: 22 }}>
            Cuando tengas un entrenador asignado, podras chatear aqui.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: SPACING.md, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}>
          {conversations.map((conv, i) => {
            const other = getOther(conv);
            if (!other) return null;
            const isTrainer = other.role === 'trainer';
            const lastMsg = conv.lastMessage;
            const isRoutineMsg = lastMsg?.type === 'routine';

            return (
              <TouchableOpacity
                key={conv.id}
                onPress={() => router.push(`/chat/${conv.id}` as any)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SPACING.lg,
                  paddingHorizontal: SPACING.xxl,
                  paddingVertical: SPACING.lg,
                  backgroundColor: 'transparent',
                  borderBottomWidth: i < conversations.length - 1 ? 1 : 0,
                  borderBottomColor: t.border.subtle,
                }}>
                {/* Avatar */}
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: other.avatar }}
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 27,
                      backgroundColor: t.bg.tertiary,
                      borderWidth: 2,
                      borderColor: isTrainer ? t.accentDim : t.border.subtle,
                    }}
                  />
                  {/* Online dot */}
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 1,
                      right: 1,
                      width: 13,
                      height: 13,
                      borderRadius: 7,
                      backgroundColor: t.success,
                      borderWidth: 2,
                      borderColor: t.bg.primary,
                    }}
                  />
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.md }}>
                      {other.name}
                    </Text>
                    <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>
                      {timeAgo(conv.updatedAt)}
                    </Text>
                  </View>

                  {/* Role badge */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    {isTrainer ? (
                      <Dumbbell size={10} color={t.text.accent} />
                    ) : (
                      <User size={10} color={t.text.tertiary} />
                    )}
                    <Text style={{ color: isTrainer ? t.text.accent : t.text.tertiary, fontSize: 10, fontWeight: '600' }}>
                      {isTrainer ? 'Entrenador' : 'Atleta'}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={1}
                    style={{ color: t.text.secondary, fontSize: FONT.sm }}>
                    {isRoutineMsg ? 'Compartio una rutina' : (lastMsg?.text ?? '...')}
                  </Text>
                </View>

                <ChevronRight size={16} color={t.text.tertiary} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
