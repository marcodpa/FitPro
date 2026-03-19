import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FakeSocialService } from '@/lib/services';
import { useAppStore, useTheme } from '@/lib/store';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import type { Post } from '@/lib/types';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  Flag,
  MoreHorizontal,
} from 'lucide-react-native';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentFocused, setCommentFocused] = useState(false);
  const { user } = useAppStore();
  const router = useRouter();
  const t = useTheme();

  useEffect(() => {
    if (!id) return;
    FakeSocialService.getById(id).then(setPost).finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!post || !user) return;
    const updated = await FakeSocialService.toggleLike(post.id, user.id);
    setPost(updated);
  };

  const handleComment = async () => {
    if (!comment.trim() || !post || !user) return;
    setSubmitting(true);
    try {
      const newComment = await FakeSocialService.addComment(post.id, {
        authorId: user.id,
        author: user,
        text: comment.trim(),
      });
      setPost({ ...post, comments: [...post.comments, newComment] });
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg.primary }}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  if (!post) return null;
  const liked = post.likes.includes(user?.id ?? '');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: t.bg.primary }}>

      {/* Header */}
      <View
        style={{
          backgroundColor: t.bg.secondary,
          paddingTop: 56,
          paddingBottom: SPACING.md,
          paddingHorizontal: SPACING.xl,
          borderBottomWidth: 1,
          borderBottomColor: t.border.subtle,
          flexDirection: 'row',
          alignItems: 'center',
          gap: SPACING.md,
        }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: RADIUS.full,
            backgroundColor: t.bg.elevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ArrowLeft size={18} color={t.text.primary} />
        </TouchableOpacity>
        <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg }}>
          Publicación
        </Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={{
            width: 38,
            height: 38,
            borderRadius: RADIUS.full,
            backgroundColor: t.bg.elevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <MoreHorizontal size={18} color={t.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.xl }}>
        {/* Author card */}
        <View
          style={{
            backgroundColor: t.bg.card,
            borderRadius: RADIUS.xxl,
            padding: SPACING.xl,
            borderWidth: 1,
            borderColor: t.border.subtle,
            marginBottom: SPACING.md,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.md,
              marginBottom: SPACING.md,
            }}>
            <Image
              source={{ uri: post.author.avatar }}
              style={{
                width: 48,
                height: 48,
                borderRadius: RADIUS.full,
                borderWidth: 2,
                borderColor: t.accent,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
                {post.author.name}
              </Text>
              <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>
                {timeAgo(post.createdAt)}
              </Text>
            </View>
          </View>

          {/* Content */}
          <Text
            style={{
              color: t.text.primary,
              fontSize: FONT.base,
              lineHeight: 22,
              marginBottom: post.imageUrl ? SPACING.md : 0,
            }}>
            {post.text}
          </Text>

          {post.imageUrl && (
            <Image
              source={{ uri: post.imageUrl }}
              style={{ width: '100%', height: 220, borderRadius: RADIUS.lg }}
            />
          )}
        </View>

        {/* Actions */}
        <View
          style={{
            flexDirection: 'row',
            gap: SPACING.sm,
            marginBottom: SPACING.xl,
          }}>
          <TouchableOpacity
            onPress={handleLike}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: SPACING.xs,
              paddingVertical: SPACING.sm,
              backgroundColor: liked ? 'rgba(239,68,68,0.12)' : t.bg.elevated,
              borderRadius: RADIUS.lg,
              borderWidth: 1,
              borderColor: liked ? t.danger : t.border.default,
            }}>
            <Heart
              size={16}
              color={liked ? t.danger : t.text.secondary}
              fill={liked ? t.danger : 'none'}
            />
            <Text
              style={{
                color: liked ? t.danger : t.text.secondary,
                fontWeight: '700',
                fontSize: FONT.sm,
              }}>
              {post.likes.length} Me gusta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: SPACING.xs,
              paddingHorizontal: SPACING.lg,
              paddingVertical: SPACING.sm,
              backgroundColor: t.bg.elevated,
              borderRadius: RADIUS.lg,
              borderWidth: 1,
              borderColor: t.border.default,
            }}>
            <Flag size={14} color={t.text.tertiary} />
            <Text style={{ color: t.text.tertiary, fontWeight: '600', fontSize: FONT.sm }}>
              Reportar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comments header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.sm,
            marginBottom: SPACING.md,
          }}>
          <MessageCircle size={16} color={t.text.secondary} />
          <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
            Comentarios ({post.comments.length})
          </Text>
        </View>

        {post.comments.length === 0 && (
          <View
            style={{
              alignItems: 'center',
              paddingVertical: SPACING.xxl,
              gap: SPACING.sm,
            }}>
            <MessageCircle size={32} color={t.text.tertiary} />
            <Text style={{ color: t.text.tertiary, fontSize: FONT.sm }}>
              Sé el primero en comentar
            </Text>
          </View>
        )}

        {post.comments.map((c) => (
          <View
            key={c.id}
            style={{
              flexDirection: 'row',
              gap: SPACING.sm,
              marginBottom: SPACING.md,
            }}>
            <Image
              source={{ uri: c.author.avatar }}
              style={{ width: 36, height: 36, borderRadius: RADIUS.full }}
            />
            <View
              style={{
                flex: 1,
                backgroundColor: t.bg.card,
                borderRadius: RADIUS.lg,
                padding: SPACING.md,
                borderWidth: 1,
                borderColor: t.border.subtle,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}>
                <Text
                  style={{
                    color: t.text.primary,
                    fontWeight: '700',
                    fontSize: FONT.sm,
                  }}>
                  {c.author.name}
                </Text>
                <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>
                  {timeAgo(c.createdAt)}
                </Text>
              </View>
              <Text style={{ color: t.text.secondary, fontSize: FONT.sm, lineHeight: 18 }}>
                {c.text}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Comment input */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: SPACING.sm,
          padding: SPACING.md,
          backgroundColor: t.bg.secondary,
          borderTopWidth: 1,
          borderTopColor: t.border.subtle,
        }}>
        <Image
          source={{ uri: user?.avatar }}
          style={{ width: 34, height: 34, borderRadius: RADIUS.full }}
        />
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Añade un comentario..."
          onFocus={() => setCommentFocused(true)}
          onBlur={() => setCommentFocused(false)}
          style={{
            flex: 1,
            backgroundColor: t.bg.input,
            color: t.text.primary,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: RADIUS.full,
            fontSize: FONT.sm,
            borderWidth: 1.5,
            borderColor: commentFocused ? t.accent : t.border.default,
          }}
          placeholderTextColor={t.text.tertiary}
          multiline
        />
        <TouchableOpacity
          onPress={handleComment}
          disabled={submitting || !comment.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: RADIUS.full,
            backgroundColor: comment.trim() ? t.accent : t.bg.elevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {submitting ? (
            <ActivityIndicator size="small" color={t.accentText} />
          ) : (
            <Send size={16} color={comment.trim() ? t.accentText : t.text.tertiary} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
