import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { FakeChatService } from '@/lib/services';
import type { Conversation } from '@/lib/types';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function ChatTab() {
  const { user } = useAppStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    FakeChatService.getConversations(user.id)
      .then(setConversations)
      .finally(() => setLoading(false));
  }, [user]);

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p.id !== user?.id);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        style={{
          backgroundColor: '#0d9e6e',
          paddingTop: 56,
          paddingBottom: 24,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}>
        <Text className="text-white font-bold" style={{ fontSize: 26 }}>
          Mensajes 💬
        </Text>
        <Text className="text-white/70 text-sm mt-1">
          {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0d9e6e" />
        </View>
      ) : conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text style={{ fontSize: 64, marginBottom: 16 }}>💬</Text>
          <Text className="text-foreground font-bold text-xl text-center">Sin conversaciones</Text>
          <Text className="text-muted-foreground text-center mt-2">
            Cuando tengas un entrenador asignado, podrás chatear aquí.
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            if (!other) return null;
            return (
              <TouchableOpacity
                key={conv.id}
                onPress={() => router.push(`/chat/${conv.id}` as any)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 18,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: '#f1f5f9',
                }}>
                {/* Avatar */}
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: other.avatar }}
                    style={{ width: 52, height: 52, borderRadius: 26 }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: '#22c55e',
                      borderWidth: 2,
                      borderColor: '#fff',
                    }}
                  />
                </View>
                {/* Info */}
                <View className="flex-1">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-foreground font-bold text-base">{other.name}</Text>
                    <Text className="text-muted-foreground text-xs">
                      {timeAgo(conv.updatedAt)}
                    </Text>
                  </View>
                  <Text
                    className="text-muted-foreground text-sm mt-0.5"
                    numberOfLines={1}
                    style={{ flex: 1 }}>
                    {conv.lastMessage?.type === 'routine'
                      ? '📋 Compartió una rutina'
                      : conv.lastMessage?.text ?? '...'}
                  </Text>
                  <Text
                    style={{
                      color:
                        other.role === 'trainer' ? '#0d9e6e' : '#64748b',
                      fontSize: 11,
                      fontWeight: '600',
                      marginTop: 3,
                    }}>
                    {other.role === 'trainer' ? '🏋️ Entrenador' : '🏃 Atleta'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
