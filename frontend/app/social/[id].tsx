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
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FakeSocialService } from '@/lib/services';
import { useAppStore } from '@/lib/store';
import type { Post } from '@/lib/types';

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
  const { user } = useAppStore();
  const router = useRouter();

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
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!post) return null;
  const liked = post.likes.includes(user?.id ?? '');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background">
      {/* Header */}
      <View
        style={{
          backgroundColor: '#7c3aed',
          paddingTop: 52,
          paddingBottom: 20,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-white/80">← Volver</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl">Publicación</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Author */}
        <View className="flex-row items-center gap-3 mb-4">
          <Image
            source={{ uri: post.author.avatar }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
          />
          <View>
            <Text className="text-foreground font-bold text-base">{post.author.name}</Text>
            <Text className="text-muted-foreground text-xs">{timeAgo(post.createdAt)}</Text>
          </View>
        </View>

        {/* Content */}
        <Text className="text-foreground text-base leading-6 mb-4">{post.text}</Text>
        {post.imageUrl && (
          <Image
            source={{ uri: post.imageUrl }}
            style={{ width: '100%', height: 250, borderRadius: 16, marginBottom: 16 }}
          />
        )}

        {/* Actions */}
        <View
          className="flex-row gap-2 pb-4 mb-4"
          style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          <TouchableOpacity
            onPress={handleLike}
            className="flex-row items-center gap-2 py-2 px-4"
            style={{
              backgroundColor: liked ? '#fee2e2' : '#f1f5f9',
              borderRadius: 12,
            }}>
            <Text>{liked ? '❤️' : '🤍'}</Text>
            <Text
              style={{ color: liked ? '#ef4444' : '#64748b', fontWeight: '600', fontSize: 13 }}>
              {post.likes.length} Me gusta
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center gap-2 py-2 px-4"
            style={{ backgroundColor: '#f1f5f9', borderRadius: 12 }}>
            <Text>⚠️</Text>
            <Text style={{ color: '#64748b', fontWeight: '600', fontSize: 13 }}>Reportar</Text>
          </TouchableOpacity>
        </View>

        {/* Comments */}
        <Text className="text-foreground font-bold text-base mb-4">
          Comentarios ({post.comments.length})
        </Text>
        {post.comments.map((c) => (
          <View key={c.id} className="flex-row gap-3 mb-4">
            <Image
              source={{ uri: c.author.avatar }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
            <View
              style={{
                flex: 1,
                backgroundColor: '#f8fafc',
                borderRadius: 14,
                padding: 12,
              }}>
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-foreground font-semibold text-sm">{c.author.name}</Text>
                <Text className="text-muted-foreground text-xs">{timeAgo(c.createdAt)}</Text>
              </View>
              <Text className="text-foreground text-sm">{c.text}</Text>
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
          gap: 10,
          padding: 16,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
        }}>
        <Image
          source={{ uri: user?.avatar }}
          style={{ width: 36, height: 36, borderRadius: 18 }}
        />
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Añade un comentario..."
          className="flex-1 bg-secondary text-foreground px-4 py-3 rounded-2xl text-sm"
          placeholderTextColor="#94a3b8"
          multiline
        />
        <TouchableOpacity
          onPress={handleComment}
          disabled={submitting || !comment.trim()}
          style={{
            backgroundColor: comment.trim() ? '#7c3aed' : '#e2e8f0',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}>
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ color: comment.trim() ? '#fff' : '#94a3b8', fontWeight: '600' }}>
              Enviar
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
