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
import { FakeSocialService } from '@/lib/services';
import { useAppStore } from '@/lib/store';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
  'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600',
];

export default function CreatePostScreen() {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAppStore();
  const router = useRouter();

  const handlePost = async () => {
    if (!text.trim()) {
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
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white/80 font-medium">Cancelar</Text>
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Nueva Publicación</Text>
          <TouchableOpacity
            onPress={handlePost}
            disabled={loading || !text.trim()}
            style={{
              backgroundColor: text.trim() ? 'rgba(255,255,255,0.25)' : 'transparent',
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 6,
            }}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={{
                  color: text.trim() ? '#fff' : 'rgba(255,255,255,0.4)',
                  fontWeight: '700',
                }}>
                Publicar
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Author */}
        <View className="flex-row items-center gap-3 mb-5">
          <Image
            source={{ uri: user?.avatar }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
          />
          <View>
            <Text className="text-foreground font-bold text-base">{user?.name}</Text>
            <Text className="text-muted-foreground text-xs">Publicando en FitPro Social</Text>
          </View>
        </View>

        {/* Text input */}
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="¿Qué quieres compartir hoy? Comparte tu progreso, tips, motivación..."
          multiline
          numberOfLines={6}
          className="text-foreground text-base"
          placeholderTextColor="#94a3b8"
          style={{ minHeight: 120, textAlignVertical: 'top', lineHeight: 24 }}
        />

        <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 20 }} />

        {/* Image selection */}
        <Text className="text-foreground font-bold text-base mb-3">
          Añadir Imagen (opcional)
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {SAMPLE_IMAGES.map((img) => (
              <TouchableOpacity
                key={img}
                onPress={() => setSelectedImage(selectedImage === img ? null : img)}>
                <Image
                  source={{ uri: img }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 12,
                    borderWidth: 3,
                    borderColor: selectedImage === img ? '#7c3aed' : 'transparent',
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {selectedImage && (
          <View className="mt-4">
            <Text className="text-muted-foreground text-xs mb-2">Vista previa:</Text>
            <Image
              source={{ uri: selectedImage }}
              style={{ width: '100%', height: 200, borderRadius: 16 }}
            />
          </View>
        )}

        {/* Hashtag suggestions */}
        <View className="mt-6">
          <Text className="text-muted-foreground text-xs mb-2 font-medium">Hashtags sugeridos</Text>
          <View className="flex-row flex-wrap gap-2">
            {['#FitPro', '#Fitness', '#Entrenamiento', '#Progreso', '#Motivacion', '#Gym'].map(
              (tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setText((t) => t + ' ' + tag)}
                  style={{
                    backgroundColor: '#f0f4ff',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}>
                  <Text style={{ color: '#4f46e5', fontSize: 13, fontWeight: '500' }}>{tag}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
