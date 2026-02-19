import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { FakeSocialService } from '@/lib/services';
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

function PostCard({ post, currentUserId, onLike, onPress }: {
  post: Post;
  currentUserId: string;
  onLike: (id: string) => void;
  onPress: (id: string) => void;
}) {
  const liked = post.likes.includes(currentUserId);
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}>
      {/* Author */}
      <View
        className="flex-row items-center gap-3 px-4 pt-4 pb-3">
        <Image
          source={{ uri: post.author.avatar }}
          style={{ width: 42, height: 42, borderRadius: 21 }}
        />
        <View className="flex-1">
          <Text className="text-foreground font-bold text-sm">{post.author.name}</Text>
          <Text className="text-muted-foreground text-xs">
            {post.author.role === 'trainer' ? '🏋️ Entrenador' : '🏃 Atleta'} • {timeAgo(post.createdAt)}
          </Text>
        </View>
        <TouchableOpacity>
          <Text className="text-muted-foreground text-xl">···</Text>
        </TouchableOpacity>
      </View>

      {/* Text */}
      <Text className="text-foreground text-sm px-4 pb-3 leading-5">{post.text}</Text>

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

      {/* Actions */}
      <View
        className="flex-row items-center gap-1 px-4 py-3"
        style={{ borderTopWidth: 1, borderTopColor: '#f8fafc', marginTop: 4 }}>
        <TouchableOpacity
          onPress={() => onLike(post.id)}
          className="flex-row items-center gap-1 py-1 px-3">
          <Text style={{ fontSize: 20 }}>{liked ? '❤️' : '🤍'}</Text>
          <Text
            style={{
              color: liked ? '#ef4444' : '#94a3b8',
              fontWeight: '600',
              fontSize: 13,
            }}>
            {post.likes.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onPress(post.id)}
          className="flex-row items-center gap-1 py-1 px-3">
          <Text style={{ fontSize: 20 }}>💬</Text>
          <Text className="text-muted-foreground font-semibold text-sm">
            {post.comments.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center gap-1 py-1 px-3">
          <Text style={{ fontSize: 20 }}>📤</Text>
          <Text className="text-muted-foreground font-semibold text-sm">Compartir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SocialTab() {
  const { user } = useAppStore();
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
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        style={{
          backgroundColor: '#7c3aed',
          paddingTop: 56,
          paddingBottom: 20,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}>
        <View className="flex-row justify-between items-center">
          <Text className="text-white font-bold" style={{ fontSize: 26 }}>
            FitPro Social 🔥
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/social/create')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.25)',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}>
            <Text className="text-white font-bold text-sm">+ Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
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
          <View style={{ height: 16 }} />
        </ScrollView>
      )}
    </View>
  );
}
