import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    emoji: '🏋️',
    title: 'Entrena Smarter',
    subtitle: 'Rutinas personalizadas, seguimiento en tiempo real y cronómetro integrado.',
    bg: '#0d9e6e',
  },
  {
    id: 2,
    emoji: '🤝',
    title: 'Tu Entrenador,\nSiempre Contigo',
    subtitle: 'Chat directo con tu entrenador personal. Feedback inmediato.',
    bg: '#2563eb',
  },
  {
    id: 3,
    emoji: '🔥',
    title: 'Comunidad Fitness',
    subtitle: 'Comparte tu progreso, inspira y sé inspirado por miles de atletas.',
    bg: '#7c3aed',
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = React.useState(0);
  const router = useRouter();
  const { setOnboarded } = useAppStore();

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1);
    } else {
      setOnboarded();
      router.replace('/auth/login');
    }
  };

  const handleSkip = () => {
    setOnboarded();
    router.replace('/auth/login');
  };

  const slide = SLIDES[current];

  return (
    <View style={{ flex: 1, backgroundColor: slide.bg }}>
      {/* Skip */}
      <View className="absolute right-6 top-14 z-10">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-white/70 text-base font-medium">Omitir</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-8">
        <Text style={{ fontSize: 100, marginBottom: 32 }}>{slide.emoji}</Text>
        <Text
          className="text-white text-center font-bold mb-4"
          style={{ fontSize: 32, lineHeight: 40 }}>
          {slide.title}
        </Text>
        <Text className="text-white/80 text-center text-lg leading-7">
          {slide.subtitle}
        </Text>
      </View>

      {/* Dots */}
      <View className="flex-row justify-center gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === current ? '#ffffff' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </View>

      {/* Button */}
      <View className="px-8 pb-16">
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: 'rgba(255,255,255,0.25)',
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.6)',
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
          }}>
          <Text className="text-white font-bold text-lg">
            {current < SLIDES.length - 1 ? 'Siguiente' : 'Comenzar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
