import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FakeSocialService } from '@/lib/services';
import type { Post } from '@/lib/types';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Plus,
  Dumbbell,
  User,
} from 'lucide-react-native';
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

function PostCard({
  post,
  currentUserId,
  onLike,
  onPress,
}: {
  post: Post;
  currentUserId: string;
  onLike: (id: string) => void;
  onPress: (id: string) => void;
}) {
  const t = useTheme();
  const liked = post.likes.includes(currentUserId);

  return (
    <View
      style={{
        backgroundColor: t.bg.card,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: t.border.subtle,
      }}>
      {/* Author row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: SPACING.lg,
          paddingTop: SPACING.lg,
          paddingBottom: SPACING.md,
        }}>
        <Image
          source={{ uri: post.author.avatar }}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.bg.tertiary }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
            {post.author.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
            {post.author.role === 'trainer' ? (
              <Dumbbell size={11} color={t.accent} />
            ) : (
              <User size={11} color={t.text.tertiary} />
            )}
            <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>
              {post.author.role === 'trainer' ? 'Entrenador' : 'Atleta'} · {timeAgo(post.createdAt)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            width: 34,
            height: 34,
            borderRadius: RADIUS.md,
            backgroundColor: t.bg.tertiary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <MoreHorizontal size={16} color={t.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Text */}
      <Text
        style={{
          color: t.text.primary,
          fontSize: FONT.base,
          lineHeight: 22,
          paddingHorizontal: SPACING.lg,
          paddingBottom: post.imageUrl ? SPACING.md : SPACING.lg,
        }}>
        {post.text}
      </Text>

      {/* Image */}
      {post.imageUrl && (
        <TouchableOpacity onPress={() => onPress(post.id)}>
          <Image
            source={{ uri: post.imageUrl }}
            style={{ width: '100%', height: 220 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      {/* Action bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.md,
          borderTopWidth: 1,
          borderTopColor: t.border.subtle,
          gap: 4,
        }}>
        {/* Like */}
        <TouchableOpacity
          onPress={() => onLike(post.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: RADIUS.lg,
            backgroundColor: liked ? t.dangerDim : 'transparent',
          }}>
          <Heart
            size={17}
            color={liked ? t.danger : t.text.secondary}
            fill={liked ? t.danger : 'none'}
          />
          <Text
            style={{
              color: liked ? t.danger : t.text.secondary,
              fontSize: FONT.sm,
              fontWeight: '600',
            }}>
            {post.likes.length}
          </Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          onPress={() => onPress(post.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: RADIUS.lg,
          }}>
          <MessageCircle size={17} color={t.text.secondary} />
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>
            {post.comments.length}
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: RADIUS.lg,
          }}>
          <Share2 size={17} color={t.text.secondary} />
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>
            Compartir
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SocialTab() {
  const { user } = useAppStore();
  const t = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadPosts = useCallback(async () => {
    const data = await FakeSocialService.getFeed();
    setPosts(data);
  }, []);

  useEffect(() => {
    loadPosts().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  const handleLike = async (postId: string) => {
    if (!user) return;
    const updated = await FakeSocialService.toggleLike(postId, user.id);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  };

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
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}>
        <View>
          <Text style={{ color: t.text.secondary, fontSize: FONT.xs, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            FitPro
          </Text>
          <Text style={{ color: t.text.primary, fontSize: FONT.xxxl, fontWeight: '800', letterSpacing: -0.5 }}>
            Comunidad
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/social/create')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: t.accent,
            borderRadius: RADIUS.lg,
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
          }}>
          <Plus size={16} color={t.accentText} strokeWidth={2.5} />
          <Text style={{ color: t.accentText, fontWeight: '700', fontSize: FONT.sm }}>
            Publicar
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />
          }>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id ?? ''}
              onLike={handleLike}
              onPress={(id) => router.push(`/social/${id}` as any)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
