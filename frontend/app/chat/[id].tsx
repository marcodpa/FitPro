import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FakeChatService } from '@/lib/services';
import { useAppStore } from '@/lib/store';
import { MOCK_CONVERSATIONS } from '@/lib/mockData';
import type { ChatMessage } from '@/lib/types';

function timeStr(iso: string) {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  const conv = MOCK_CONVERSATIONS.find((c) => c.id === id);
  const other = conv?.participants.find((p) => p.id !== user?.id);

  useEffect(() => {
    if (!id) return;
    FakeChatService.getMessages(id)
      .then(setMessages)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSend = async () => {
    if (!text.trim() || !user || !id) return;
    setSending(true);
    const msg = await FakeChatService.sendMessage({
      conversationId: id,
      senderId: user.id,
      text: text.trim(),
      type: 'text',
    });
    setMessages((prev) => [...prev, msg]);
    setText('');
    setSending(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  if (!other || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0d9e6e" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
      style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#0d9e6e',
          paddingTop: 52,
          paddingBottom: 16,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white/80 text-base font-medium">←</Text>
        </TouchableOpacity>
        <Image
          source={{ uri: other.avatar }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
        <View className="flex-1">
          <Text className="text-white font-bold text-base">{other.name}</Text>
          <Text className="text-white/70 text-xs">
            {other.role === 'trainer' ? '🏋️ Tu entrenador' : '🏃 Cliente'} • En línea
          </Text>
        </View>
        <TouchableOpacity>
          <Text className="text-white/80 text-xl">···</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 8 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <View
              key={msg.id}
              style={{
                alignItems: isMe ? 'flex-end' : 'flex-start',
                marginBottom: 6,
              }}>
              {msg.type === 'routine' ? (
                <View
                  style={{
                    backgroundColor: isMe ? '#0d9e6e' : '#fff',
                    borderRadius: 16,
                    padding: 14,
                    maxWidth: '80%',
                    borderWidth: isMe ? 0 : 1,
                    borderColor: '#e2e8f0',
                  }}>
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text style={{ fontSize: 20 }}>📋</Text>
                    <Text
                      style={{
                        color: isMe ? '#fff' : '#0d9e6e',
                        fontWeight: '700',
                        fontSize: 13,
                      }}>
                      Rutina compartida
                    </Text>
                  </View>
                  <Text style={{ color: isMe ? 'rgba(255,255,255,0.8)' : '#64748b', fontSize: 12 }}>
                    {msg.text}
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: isMe ? '#0d9e6e' : '#fff',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    borderBottomRightRadius: isMe ? 4 : 18,
                    borderBottomLeftRadius: isMe ? 18 : 4,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    maxWidth: '78%',
                    borderWidth: isMe ? 0 : 1,
                    borderColor: '#e2e8f0',
                  }}>
                  <Text
                    style={{
                      color: isMe ? '#fff' : '#1e293b',
                      fontSize: 14,
                      lineHeight: 20,
                    }}>
                    {msg.text}
                  </Text>
                </View>
              )}
              <Text
                style={{ color: '#94a3b8', fontSize: 10, marginTop: 3, marginHorizontal: 4 }}>
                {timeStr(msg.sentAt)}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Input */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 10,
          padding: 12,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
        }}>
        <TouchableOpacity
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: '#f1f5f9',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text>📎</Text>
        </TouchableOpacity>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escribe un mensaje..."
          multiline
          className="flex-1 bg-secondary text-foreground px-4 py-2 rounded-2xl text-sm"
          placeholderTextColor="#94a3b8"
          style={{ maxHeight: 100 }}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending || !text.trim()}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: text.trim() ? '#0d9e6e' : '#e2e8f0',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ fontSize: 18 }}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
