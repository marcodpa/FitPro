import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FakeChatService } from '@/lib/services';
import { useAppStore, useTheme } from '@/lib/store';
import { MOCK_CONVERSATIONS } from '@/lib/mockData';
import type { ChatMessage } from '@/lib/types';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import {
  ChevronLeft, Send, Dumbbell, User, MoreVertical,
  Phone, Video, CheckCheck, Paperclip, Smile,
} from 'lucide-react-native';

function timeStr(iso: string) {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

function DateSeparator({ label, t }: { label: string; t: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16, paddingHorizontal: SPACING.xl }}>
      <View style={{ flex: 1, height: 1, backgroundColor: t.border.subtle }} />
      <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: t.border.default }}>
        <Text style={{ color: t.text.tertiary, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>{label}</Text>
      </View>
      <View style={{ flex: 1, height: 1, backgroundColor: t.border.subtle }} />
    </View>
  );
}

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAppStore();
  const t = useTheme();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const conv  = MOCK_CONVERSATIONS.find((c) => c.id === id);
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg.primary }}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  const isTrainer = other.role === 'trainer';
  const isAdmin   = other.role === 'admin';
  const roleColor = isTrainer ? t.accent : isAdmin ? t.orange : t.info;
  const roleDim   = isTrainer ? t.accentDim : isAdmin ? t.warningDim : t.infoDim;
  const roleLabel = isTrainer ? 'Tu Entrenador' : isAdmin ? 'Admin' : 'Atleta';
  const RoleIcon  = isTrainer ? Dumbbell : User;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: t.bg.primary }}>
      <StatusBar barStyle={t.isDark ? 'light-content' : 'dark-content'} />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: t.bg.primary,
        paddingTop: 56, paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderBottomWidth: 1, borderBottomColor: t.border.subtle,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 38, height: 38, borderRadius: RADIUS.md, backgroundColor: t.bg.card, borderWidth: 1, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={20} color={t.text.secondary} strokeWidth={2} />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={{ position: 'relative' }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, borderColor: roleColor + '60', padding: 2 }}>
            <Image source={{ uri: other.avatar }} style={{ width: '100%', height: '100%', borderRadius: 20, backgroundColor: t.bg.tertiary }} />
          </View>
          <View style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: t.success, borderWidth: 2, borderColor: t.bg.primary }} />
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.md, letterSpacing: -0.3 }}>
            {other.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: roleDim, borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
              <RoleIcon size={9} color={roleColor} strokeWidth={2.5} />
              <Text style={{ color: roleColor, fontSize: 10, fontWeight: '700' }}>{roleLabel}</Text>
            </View>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: t.success }} />
            <Text style={{ color: t.success, fontSize: 10, fontWeight: '600' }}>En línea</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={{ width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: t.bg.card, borderWidth: 1, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={15} color={t.text.secondary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={{ width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: t.bg.card, borderWidth: 1, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center' }}>
            <MoreVertical size={15} color={t.text.secondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Messages ──────────────────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, backgroundColor: t.bg.primary }}
        contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.xl }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}>

        <DateSeparator label="HOY" t={t} />

        {messages.map((msg, idx) => {
          const isMe = msg.senderId === user?.id;
          const showAvatar = !isMe && (idx === 0 || messages[idx - 1]?.senderId !== msg.senderId);

          if (msg.type === 'routine') {
            return (
              <View key={msg.id} style={{ alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                <View style={{
                  backgroundColor: isMe ? t.accent : t.bg.card,
                  borderRadius: RADIUS.xl, padding: SPACING.lg,
                  maxWidth: '80%',
                  borderWidth: isMe ? 0 : 1, borderColor: t.border.subtle,
                  gap: 8,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 34, height: 34, borderRadius: RADIUS.md, backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                      <Dumbbell size={16} color={isMe ? '#fff' : t.accent} strokeWidth={2} />
                    </View>
                    <View>
                      <Text style={{ color: isMe ? '#fff' : t.accent, fontWeight: '800', fontSize: FONT.sm }}>Rutina compartida</Text>
                      <Text style={{ color: isMe ? 'rgba(255,255,255,0.7)' : t.text.secondary, fontSize: 11 }}>Toca para ver los detalles</Text>
                    </View>
                  </View>
                  <View style={{ height: 1, backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : t.border.subtle }} />
                  <Text style={{ color: isMe ? 'rgba(255,255,255,0.85)' : t.text.secondary, fontSize: FONT.sm, lineHeight: 20 }}>
                    {msg.text}
                  </Text>
                </View>
                <Text style={{ color: t.text.tertiary, fontSize: 10, marginTop: 4, marginHorizontal: 4 }}>
                  {timeStr(msg.sentAt)}
                </Text>
              </View>
            );
          }

          return (
            <View key={msg.id} style={{ alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
              <View style={{ flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8, maxWidth: '82%' }}>
                {/* Other's avatar — only on first of group */}
                {!isMe && (
                  <View style={{ width: 28 }}>
                    {showAvatar ? (
                      <Image source={{ uri: other.avatar }} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t.bg.tertiary }} />
                    ) : null}
                  </View>
                )}

                <View style={{
                  backgroundColor: isMe ? t.accent : t.bg.card,
                  borderRadius: 20,
                  borderBottomRightRadius: isMe ? 4 : 20,
                  borderBottomLeftRadius: isMe ? 20 : 4,
                  paddingHorizontal: SPACING.lg,
                  paddingVertical: 10,
                  borderWidth: isMe ? 0 : 1,
                  borderColor: t.border.subtle,
                  maxWidth: '100%',
                }}>
                  <Text style={{ color: isMe ? t.accentText : t.text.primary, fontSize: FONT.base, lineHeight: 22 }}>
                    {msg.text}
                  </Text>
                </View>
              </View>

              {/* Time + read */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3, marginHorizontal: 40, alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                <Text style={{ color: t.text.tertiary, fontSize: 10 }}>{timeStr(msg.sentAt)}</Text>
                {isMe && <CheckCheck size={12} color={t.accent} strokeWidth={2} />}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ── Input bar ─────────────────────────────────────────────────────── */}
      <View style={{
        flexDirection: 'row', alignItems: 'flex-end', gap: 10,
        paddingHorizontal: SPACING.xl, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 14,
        backgroundColor: t.bg.primary,
        borderTopWidth: 1, borderTopColor: t.border.subtle,
      }}>
        {/* Attach */}
        <TouchableOpacity style={{ width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: t.bg.card, borderWidth: 1, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center' }}>
          <Paperclip size={16} color={t.text.secondary} strokeWidth={2} />
        </TouchableOpacity>

        {/* Text input */}
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'flex-end',
          backgroundColor: t.bg.input, borderRadius: 22,
          borderWidth: 1.5, borderColor: inputFocused ? t.accent : t.border.default,
          paddingHorizontal: SPACING.lg, paddingVertical: 10,
          gap: 8,
        }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escribe un mensaje..."
            multiline
            placeholderTextColor={t.text.tertiary}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            style={{ flex: 1, color: t.text.primary, fontSize: FONT.base, maxHeight: 100, padding: 0, lineHeight: 22 }}
          />
          <TouchableOpacity>
            <Smile size={18} color={t.text.tertiary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Send */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending || !text.trim()}
          activeOpacity={0.85}
          style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: text.trim() ? t.accent : t.bg.card,
            borderWidth: text.trim() ? 0 : 1, borderColor: t.border.default,
            alignItems: 'center', justifyContent: 'center',
          }}>
          {sending
            ? <ActivityIndicator size="small" color={t.accentText} />
            : <Send size={18} color={text.trim() ? t.accentText : t.text.tertiary} strokeWidth={2.5} />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
