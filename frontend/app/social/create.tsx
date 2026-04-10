import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { FakeSocialService } from '@/lib/services';
import { useAppStore, useTheme } from '@/lib/store';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { ArrowLeft, Send, Image as ImageIcon, Hash, X, Camera, FolderOpen } from 'lucide-react-native';

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
  const { user } = useAppStore();
  const router = useRouter();
  const t = useTheme();

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para seleccionar imágenes.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara para tomar fotos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePickImage = () => {
    Alert.alert('Añadir imagen', '¿De dónde quieres subir la imagen?', [
      { text: 'Cámara',  onPress: pickFromCamera },
      { text: 'Galería', onPress: pickFromGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const canPost = text.trim().length > 0;

  const handlePost = async () => {
    if (!canPost) {
      Alert.alert('Error', 'Escribe algo para publicar');
      return;
    }
    setLoading(true);
    try {
      await FakeSocialService.create({
        authorId: user?.id,
        text: text.trim(),
        imageUrl: selectedImage ?? undefined,
      });
      Alert.alert('¡Publicado!', 'Tu post fue publicado exitosamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addHashtag = (tag: string) => {
    setText((prev) => (prev.endsWith(' ') || prev === '' ? prev + tag : prev + ' ' + tag));
  };

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

        <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, flex: 1 }}>
          Nueva Publicación
        </Text>

        <TouchableOpacity
          onPress={handlePost}
          disabled={loading || !canPost}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: canPost ? t.accent : t.bg.elevated,
            borderRadius: RADIUS.full,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm - 2,
            opacity: loading ? 0.7 : 1,
          }}>
          {loading ? (
            <ActivityIndicator size="small" color={t.accentText} />
          ) : (
            <>
              <Send size={14} color={canPost ? t.accentText : t.text.tertiary} />
              <Text
                style={{
                  color: canPost ? t.accentText : t.text.tertiary,
                  fontWeight: '700',
                  fontSize: FONT.sm,
                }}>
                Publicar
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.xl }}>
        {/* Author row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.md,
            marginBottom: SPACING.lg,
          }}>
          <Image
            source={{ uri: user?.avatar }}
            style={{
              width: 46,
              height: 46,
              borderRadius: RADIUS.full,
              borderWidth: 2,
              borderColor: t.accent,
            }}
          />
          <View>
            <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
              {user?.name}
            </Text>
            <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>
              Publicando en FitPro Social
            </Text>
          </View>
        </View>

        {/* Text input */}
        <View
          style={{
            backgroundColor: t.bg.card,
            borderRadius: RADIUS.xl,
            padding: SPACING.md,
            borderWidth: 1.5,
            borderColor: textFocused ? t.accent : t.border.default,
            marginBottom: SPACING.xl,
          }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="¿Qué quieres compartir hoy? Comparte tu progreso, tips, motivación..."
            multiline
            onFocus={() => setTextFocused(true)}
            onBlur={() => setTextFocused(false)}
            style={{
              color: t.text.primary,
              fontSize: FONT.base,
              minHeight: 120,
              textAlignVertical: 'top',
              lineHeight: 22,
            }}
            placeholderTextColor={t.text.tertiary}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: SPACING.sm,
            }}>
            <Text
              style={{
                color: text.length > 200 ? t.danger : t.text.tertiary,
                fontSize: FONT.xs,
              }}>
              {text.length}/280
            </Text>
          </View>
        </View>

        {/* Hashtags */}
        <View style={{ marginBottom: SPACING.xl }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.xs,
              marginBottom: SPACING.sm,
            }}>
            <Hash size={14} color={t.text.secondary} />
            <Text
              style={{
                color: t.text.secondary,
                fontSize: FONT.sm,
                fontWeight: '600',
              }}>
              Hashtags sugeridos
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
            {HASHTAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => addHashtag(tag)}
                style={{
                  backgroundColor: t.accentDim,
                  borderRadius: RADIUS.full,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.xs,
                  borderWidth: 1,
                  borderColor: t.accent + '40',
                }}>
                <Text style={{ color: t.accent, fontSize: FONT.sm, fontWeight: '600' }}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Image selection */}
        <View style={{ marginBottom: SPACING.xl, gap: SPACING.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: 2 }}>
            <ImageIcon size={14} color={t.text.secondary} />
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>
              Añadir imagen (opcional)
            </Text>
          </View>

          {/* Picker buttons */}
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <TouchableOpacity
              onPress={pickFromCamera}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: SPACING.sm, backgroundColor: t.bg.card, borderRadius: RADIUS.lg,
                paddingVertical: 13, borderWidth: 1.5, borderColor: t.border.default,
              }}>
              <Camera size={17} color={t.accent} strokeWidth={2} />
              <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.sm }}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickFromGallery}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: SPACING.sm, backgroundColor: t.bg.card, borderRadius: RADIUS.lg,
                paddingVertical: 13, borderWidth: 1.5, borderColor: t.border.default,
              }}>
              <FolderOpen size={17} color={t.info} strokeWidth={2} />
              <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.sm }}>Galería</Text>
            </TouchableOpacity>
          </View>

          {/* Preview selected image from phone */}
          {selectedImage && !SAMPLE_IMAGES.includes(selectedImage) && (
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: selectedImage }}
                style={{ width: '100%', height: 220, borderRadius: RADIUS.xl, backgroundColor: t.bg.tertiary }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 30, height: 30, borderRadius: 15,
                  backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
                }}>
                <X size={14} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}

          {/* Sample images */}
          <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, fontWeight: '600', marginTop: SPACING.xs }}>
            O elige una imagen de muestra:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              {SAMPLE_IMAGES.map((img) => {
                const isSelected = selectedImage === img;
                return (
                  <TouchableOpacity
                    key={img}
                    onPress={() => setSelectedImage(isSelected ? null : img)}>
                    <Image
                      source={{ uri: img }}
                      style={{
                        width: 100, height: 100, borderRadius: RADIUS.lg,
                        borderWidth: 2.5, borderColor: isSelected ? t.accent : 'transparent',
                      }}
                    />
                    {isSelected && (
                      <View
                        style={{
                          position: 'absolute', top: 6, right: 6,
                          width: 22, height: 22, borderRadius: RADIUS.full,
                          backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center',
                        }}>
                        <X size={12} color={t.accentText} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Preview sample image */}
          {selectedImage && SAMPLE_IMAGES.includes(selectedImage) && (
            <View style={{ position: 'relative', marginTop: SPACING.xs }}>
              <Image
                source={{ uri: selectedImage }}
                style={{ width: '100%', height: 200, borderRadius: RADIUS.xl }}
              />
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 30, height: 30, borderRadius: 15,
                  backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
                }}>
                <X size={14} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
