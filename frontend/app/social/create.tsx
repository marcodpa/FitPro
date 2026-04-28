import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, Image, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { FakeSocialService } from '@/lib/services';
import { useAppStore, useTheme } from '@/lib/store';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import {
  ArrowLeft, Send, Image as ImageIcon, Hash, X,
  Camera, FolderOpen, CheckCircle, AlertCircle,
} from 'lucide-react-native';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
  'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600',
];
const HASHTAGS = ['#FitPro', '#Fitness', '#Entrenamiento', '#Progreso', '#Motivacion', '#Gym'];

export default function CreatePostScreen() {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [textFocused, setTextFocused] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const { user } = useAppStore();
  const router = useRouter();
  const t = useTheme();

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2800);
  };

  const pickFromGallery = async () => {
    setShowImagePicker(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { showToast('error', 'Necesitamos acceso a tu galería'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) setSelectedImage(result.assets[0].uri);
  };

  const pickFromCamera = async () => {
    setShowImagePicker(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { showToast('error', 'Necesitamos acceso a tu cámara'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.85 });
    if (!result.canceled && result.assets[0]) setSelectedImage(result.assets[0].uri);
  };

  const canPost = text.trim().length > 0;

  const handlePost = async () => {
    if (!canPost) return;
    setLoading(true);
    try {
      await FakeSocialService.create({ authorId: user?.id, text: text.trim(), imageUrl: selectedImage ?? undefined });
      showToast('success', '¡Publicación creada!');
      setTimeout(() => router.back(), 1200);
    } catch {
      showToast('error', 'No se pudo publicar. Intenta de nuevo.');
      setLoading(false);
    }
  };

  const addHashtag = (tag: string) => {
    setText((prev) => (prev.endsWith(' ') || prev === '' ? prev + tag : prev + ' ' + tag));
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.bg.primary }}>

      {/* Toast */}
      {toast && (
        <View style={{
          position: 'absolute', top: 60, left: SPACING.xl, right: SPACING.xl, zIndex: 100,
          flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
          backgroundColor: toast.type === 'success' ? t.success : t.danger,
          borderRadius: RADIUS.xl, padding: SPACING.lg,
          shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8,
        }}>
          {toast.type === 'success'
            ? <CheckCircle size={18} color="#fff" strokeWidth={2.5} />
            : <AlertCircle size={18} color="#fff" strokeWidth={2.5} />}
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: FONT.sm, flex: 1 }}>{toast.msg}</Text>
        </View>
      )}

      {/* Header */}
      <View style={{
        backgroundColor: t.bg.secondary, paddingTop: 56, paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.xl, borderBottomWidth: 1, borderBottomColor: t.border.subtle,
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} color={t.text.primary} />
        </TouchableOpacity>
        <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, flex: 1 }}>Nueva Publicación</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={loading || !canPost}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: canPost ? t.accent : t.bg.elevated,
            borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm - 2,
            opacity: loading ? 0.7 : 1,
          }}>
          {loading
            ? <ActivityIndicator size="small" color={t.accentText} />
            : <><Send size={14} color={canPost ? t.accentText : t.text.tertiary} /><Text style={{ color: canPost ? t.accentText : t.text.tertiary, fontWeight: '700', fontSize: FONT.sm }}>Publicar</Text></>
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.xl }} keyboardShouldPersistTaps="handled">
        {/* Author */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg }}>
          <Image source={{ uri: user?.avatar }} style={{ width: 46, height: 46, borderRadius: RADIUS.full, borderWidth: 2, borderColor: t.accent }} />
          <View>
            <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>{user?.name}</Text>
            <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>Publicando en FitPro Social</Text>
          </View>
        </View>

        {/* Text input */}
        <View style={{
          backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.md,
          borderWidth: 1.5, borderColor: textFocused ? t.accent : t.border.default, marginBottom: SPACING.xl,
        }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="¿Qué quieres compartir hoy? Comparte tu progreso, tips, motivación..."
            multiline
            onFocus={() => setTextFocused(true)}
            onBlur={() => setTextFocused(false)}
            style={{ color: t.text.primary, fontSize: FONT.base, minHeight: 120, textAlignVertical: 'top', lineHeight: 22 }}
            placeholderTextColor={t.text.tertiary}
            maxLength={280}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.sm }}>
            <Text style={{ color: text.length > 240 ? t.danger : t.text.tertiary, fontSize: FONT.xs }}>{text.length}/280</Text>
          </View>
        </View>

        {/* Hashtags */}
        <View style={{ marginBottom: SPACING.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.sm }}>
            <Hash size={14} color={t.text.secondary} />
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>Hashtags sugeridos</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
            {HASHTAGS.map((tag) => {
              const active = text.includes(tag);
              return (
                <TouchableOpacity key={tag} onPress={() => addHashtag(tag)} style={{
                  backgroundColor: active ? t.accent : t.accentDim, borderRadius: RADIUS.full,
                  paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
                  borderWidth: 1, borderColor: active ? t.accent : t.accent + '40',
                }}>
                  <Text style={{ color: active ? t.accentText : t.accent, fontSize: FONT.sm, fontWeight: '600' }}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Image section */}
        <View style={{ marginBottom: SPACING.xl, gap: SPACING.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: 2 }}>
            <ImageIcon size={14} color={t.text.secondary} />
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>Añadir imagen (opcional)</Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowImagePicker(true)}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
              backgroundColor: t.bg.card, borderRadius: RADIUS.lg, paddingVertical: 14,
              borderWidth: 1.5, borderStyle: 'dashed',
              borderColor: selectedImage ? t.accent : t.border.default,
            }}>
            <ImageIcon size={17} color={selectedImage ? t.accent : t.text.secondary} strokeWidth={2} />
            <Text style={{ color: selectedImage ? t.accent : t.text.secondary, fontWeight: '600', fontSize: FONT.sm }}>
              {selectedImage ? 'Cambiar imagen' : 'Añadir foto'}
            </Text>
          </TouchableOpacity>

          {selectedImage && (
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: selectedImage }} style={{ width: '100%', height: 220, borderRadius: RADIUS.xl, backgroundColor: t.bg.tertiary }} resizeMode="cover" />
              <TouchableOpacity onPress={() => setSelectedImage(null)} style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}

          <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, fontWeight: '600', marginTop: SPACING.xs }}>O elige una imagen de muestra:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              {SAMPLE_IMAGES.map((img) => {
                const isSelected = selectedImage === img;
                return (
                  <TouchableOpacity key={img} onPress={() => setSelectedImage(isSelected ? null : img)} style={{ position: 'relative' }}>
                    <Image source={{ uri: img }} style={{ width: 100, height: 100, borderRadius: RADIUS.lg, borderWidth: isSelected ? 2.5 : 0, borderColor: isSelected ? t.accent : 'transparent' }} />
                    {isSelected && (
                      <View style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: RADIUS.full, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={13} color={t.accentText} strokeWidth={2.5} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Image picker modal */}
      <Modal visible={showImagePicker} transparent animationType="fade" onRequestClose={() => setShowImagePicker(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl }} activeOpacity={1} onPress={() => setShowImagePicker(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ backgroundColor: t.bg.secondary, borderRadius: RADIUS.xxl, width: '100%', maxWidth: 340, overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle }}>
            <View style={{ padding: SPACING.xl, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
              <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, textAlign: 'center' }}>Añadir imagen</Text>
            </View>
            <TouchableOpacity onPress={pickFromCamera} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, padding: SPACING.xl, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
              <View style={{ width: 42, height: 42, borderRadius: RADIUS.md, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={20} color={t.accent} strokeWidth={2} />
              </View>
              <View>
                <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>Cámara</Text>
                <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>Tomar una foto nueva</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickFromGallery} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, padding: SPACING.xl }}>
              <View style={{ width: 42, height: 42, borderRadius: RADIUS.md, backgroundColor: t.infoDim, alignItems: 'center', justifyContent: 'center' }}>
                <FolderOpen size={20} color={t.info} strokeWidth={2} />
              </View>
              <View>
                <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>Galería</Text>
                <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>Elegir de tu galería</Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
