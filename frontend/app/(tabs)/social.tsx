import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl, Alert, Share, Modal, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FakeSocialService } from '@/lib/services';
import type { Post } from '@/lib/types';
import {
  Heart, MessageCircle, Share2, MoreHorizontal, Plus,
  Dumbbell, User, Pencil, Trash2, Flag, X, Search,
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
  post, currentUserId, onLike, onPress, onEdit, onDelete, onReport, onShare, onAuthorPress,
}: {
  post: Post; currentUserId: string;
  onLike: (id: string) => void;
  onPress: (id: string) => void;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  onReport: (id: string) => void;
  onShare: (post: Post) => void;
  onAuthorPress?: (authorId: string) => void;
}) {
  const t = useTheme();
  const liked = post.likes.includes(currentUserId);
  const isOwner = post.authorId === currentUserId;
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={{
      backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
      overflow: 'hidden', marginBottom: SPACING.lg,
      borderWidth: 1, borderColor: t.border.subtle,
    }}>
      {/* Author row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md }}>
        <TouchableOpacity onPress={() => onAuthorPress ? onAuthorPress(post.author.id) : onPress(post.id)}>
          <Image source={{ uri: post.author.avatar }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.bg.tertiary }} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => onAuthorPress ? onAuthorPress(post.author.id) : onPress(post.id)}>
            <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>{post.author.name}</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
            {post.author.role === 'trainer' ? <Dumbbell size={11} color={t.accent} /> : <User size={11} color={t.text.tertiary} />}
            <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>
              {post.author.role === 'trainer' ? 'Entrenador' : 'Atleta'} · {timeAgo(post.createdAt)}
            </Text>
          </View>
        </View>
        {/* Menu */}
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ width: 34, height: 34, borderRadius: RADIUS.md, backgroundColor: t.bg.tertiary, alignItems: 'center', justifyContent: 'center' }}>
          <MoreHorizontal size={16} color={t.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Text */}
      <Text style={{ color: t.text.primary, fontSize: FONT.base, lineHeight: 22, paddingHorizontal: SPACING.lg, paddingBottom: post.imageUrl ? SPACING.md : SPACING.lg }}>
        {post.text}
      </Text>

      {/* Image */}
      {post.imageUrl && (
        <TouchableOpacity onPress={() => onPress(post.id)}>
          <Image source={{ uri: post.imageUrl }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
        </TouchableOpacity>
      )}

      {/* Action bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderTopWidth: 1, borderTopColor: t.border.subtle, gap: 4 }}>
        <TouchableOpacity onPress={() => onLike(post.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, backgroundColor: liked ? t.dangerDim : 'transparent' }}>
          <Heart size={17} color={liked ? t.danger : t.text.secondary} fill={liked ? t.danger : 'none'} />
          <Text style={{ color: liked ? t.danger : t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>{post.likes.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onPress(post.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg }}>
          <MessageCircle size={17} color={t.text.secondary} />
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>{post.comments.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onShare(post)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg }}>
          <Share2 size={17} color={t.text.secondary} />
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>Compartir</Text>
        </TouchableOpacity>
      </View>

      {/* Options modal */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={{ backgroundColor: t.bg.secondary, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.xl, paddingBottom: 40, gap: SPACING.sm }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: t.border.strong, alignSelf: 'center', marginBottom: SPACING.md }} />
            <TouchableOpacity onPress={() => { setMenuVisible(false); onShare(post); }} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, padding: SPACING.lg, borderRadius: RADIUS.lg, backgroundColor: t.bg.elevated }}>
              <Share2 size={18} color={t.info} />
              <Text style={{ color: t.text.primary, fontWeight: '600', fontSize: FONT.base }}>Compartir publicación</Text>
            </TouchableOpacity>
            {isOwner && (
              <TouchableOpacity onPress={() => { setMenuVisible(false); onEdit(post); }} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, padding: SPACING.lg, borderRadius: RADIUS.lg, backgroundColor: t.bg.elevated }}>
                <Pencil size={18} color={t.accent} />
                <Text style={{ color: t.text.primary, fontWeight: '600', fontSize: FONT.base }}>Editar publicación</Text>
              </TouchableOpacity>
            )}
            {isOwner && (
              <TouchableOpacity onPress={() => { setMenuVisible(false); onDelete(post.id); }} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, padding: SPACING.lg, borderRadius: RADIUS.lg, backgroundColor: t.dangerDim }}>
                <Trash2 size={18} color={t.danger} />
                <Text style={{ color: t.danger, fontWeight: '600', fontSize: FONT.base }}>Eliminar publicación</Text>
              </TouchableOpacity>
            )}
            {!isOwner && (
              <TouchableOpacity onPress={() => { setMenuVisible(false); onReport(post.id); }} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, padding: SPACING.lg, borderRadius: RADIUS.lg, backgroundColor: t.bg.elevated }}>
                <Flag size={18} color={t.warning} />
                <Text style={{ color: t.text.primary, fontWeight: '600', fontSize: FONT.base }}>Reportar publicación</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function SocialTab() {
  const { user } = useAppStore();
  const t = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [editText, setEditText] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const router = useRouter();

  const loadPosts = useCallback(async () => {
    const data = await FakeSocialService.getFeed();
    setPosts(data);
  }, []);

  useEffect(() => { loadPosts().finally(() => setLoading(false)); }, []);

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

  const handleShare = async (post: Post) => {
    try {
      await Share.share({ message: `${post.author.name} en FitPro:\n\n${post.text}`, title: 'Compartir publicación' });
    } catch {}
  };

  const handleDelete = (postId: string) => {
    Alert.alert('Eliminar publicación', '¿Seguro que quieres eliminar esta publicación?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await FakeSocialService.deletePost(postId);
          setPosts((prev) => prev.filter((p) => p.id !== postId));
        } catch {
          // optimistic removal anyway
          setPosts((prev) => prev.filter((p) => p.id !== postId));
        }
      }},
    ]);
  };

  const handleReport = (postId: string) => {
    Alert.alert('Reportar publicación', '¿Por qué reportas esta publicación?', [
      { text: 'Spam', onPress: () => Alert.alert('Reporte enviado', 'Gracias, lo revisaremos pronto.') },
      { text: 'Contenido inapropiado', onPress: () => Alert.alert('Reporte enviado', 'Gracias, lo revisaremos pronto.') },
      { text: 'Información falsa', onPress: () => Alert.alert('Reporte enviado', 'Gracias, lo revisaremos pronto.') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleEditSave = async () => {
    if (!editPost || !editText.trim()) return;
    setEditSaving(true);
    try {
      const updated = await FakeSocialService.updatePost(editPost.id, { text: editText.trim() });
      setPosts((prev) => prev.map((p) => (p.id === editPost.id ? updated : p)));
      setEditPost(null);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar la publicación.');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{ backgroundColor: t.bg.secondary, paddingTop: 56, paddingBottom: SPACING.xxl, paddingHorizontal: SPACING.xxl, borderBottomWidth: 1, borderBottomColor: t.border.subtle, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: t.text.secondary, fontSize: FONT.xs, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>FitPro</Text>
          <Text style={{ color: t.text.primary, fontSize: FONT.xxxl, fontWeight: '800', letterSpacing: -0.5 }}>Comunidad</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          <TouchableOpacity onPress={() => router.push('/search' as any)} style={{ width: 40, height: 40, borderRadius: RADIUS.lg, backgroundColor: t.bg.elevated, borderWidth: 1, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center' }}>
            <Search size={16} color={t.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/social/create')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: t.accent, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md }}>
            <Plus size={16} color={t.accentText} strokeWidth={2.5} />
            <Text style={{ color: t.accentText, fontWeight: '700', fontSize: FONT.sm }}>Publicar</Text>
          </TouchableOpacity>
        </View>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id ?? ''}
              onLike={handleLike}
              onPress={(id) => router.push(`/social/${id}` as any)}
              onEdit={(p) => { setEditPost(p); setEditText(p.text); }}
              onDelete={handleDelete}
              onReport={handleReport}
              onShare={handleShare}
              onAuthorPress={(authorId) => router.push(`/profile/user/${authorId}` as any)}
            />
          ))}
        </ScrollView>
      )}

      {/* Edit modal */}
      <Modal visible={!!editPost} transparent animationType="slide" onRequestClose={() => setEditPost(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: t.bg.secondary, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.xxl, paddingBottom: 48, gap: SPACING.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg }}>Editar publicación</Text>
              <TouchableOpacity onPress={() => setEditPost(null)}>
                <X size={20} color={t.text.secondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              multiline
              style={{ backgroundColor: t.bg.elevated, color: t.text.primary, borderRadius: RADIUS.lg, padding: SPACING.lg, fontSize: FONT.base, lineHeight: 22, minHeight: 100, borderWidth: 1, borderColor: t.border.default, textAlignVertical: 'top' }}
              placeholderTextColor={t.text.tertiary}
            />
            <TouchableOpacity
              onPress={handleEditSave}
              disabled={editSaving || !editText.trim()}
              style={{ backgroundColor: editText.trim() ? t.accent : t.bg.elevated, borderRadius: RADIUS.xl, paddingVertical: 14, alignItems: 'center' }}>
              {editSaving ? <ActivityIndicator color={t.accentText} /> : <Text style={{ color: editText.trim() ? t.accentText : t.text.tertiary, fontWeight: '800', fontSize: FONT.base }}>Guardar cambios</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
