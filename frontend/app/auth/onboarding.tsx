import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { Dumbbell, MessageSquare, Users, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const EM = '#10b981';

const SLIDES = [
  {
    id: 1,
    Icon: Dumbbell,
    iconColor: EM,
    iconBg: '#0a2e1e',
    accent: '#10b981',
    title: 'Entrena con\nPropósito',
    subtitle:
      'Rutinas personalizadas, seguimiento en tiempo real y cronómetro integrado para cada sesión.',
    label: '01',
  },
  {
    id: 2,
    Icon: MessageSquare,
    iconColor: '#818cf8',
    iconBg: '#1e1b4b',
    accent: '#818cf8',
    title: 'Tu Entrenador,\nSiempre Contigo',
    subtitle:
      'Chat directo con tu entrenador personal. Feedback inmediato y planes ajustados a ti.',
    label: '02',
  },
  {
    id: 3,
    Icon: Users,
    iconColor: '#f97316',
    iconBg: '#431407',
    accent: '#f97316',
    title: 'Comunidad\nFitness Real',
    subtitle:
      'Comparte tu progreso, celebra logros e inspira a otros atletas en tu comunidad.',
    label: '03',
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = React.useState(0);
  const router = useRouter();
  const { setOnboarded } = useAppStore();

  const slide = SLIDES[current];

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

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <StatusBar barStyle="light-content" />

      {/* Skip */}
      <TouchableOpacity
        onPress={handleSkip}
        style={{ position: 'absolute', top: 56, right: 24, zIndex: 10, paddingVertical: 6, paddingHorizontal: 14 }}>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' }}>Omitir</Text>
      </TouchableOpacity>

      {/* Number label */}
      <View
        style={{
          position: 'absolute',
          top: 56,
          left: 28,
          zIndex: 10,
        }}>
        <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: '700', letterSpacing: 2 }}>
          {slide.label} / 03
        </Text>
      </View>

      {/* Icon area */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 100,
          paddingBottom: 40,
          paddingHorizontal: 32,
        }}>
        {/* Big icon block */}
        <View
          style={{
            width: 128,
            height: 128,
            borderRadius: 36,
            backgroundColor: slide.iconBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 48,
            borderWidth: 1,
            borderColor: slide.accent + '30',
          }}>
          <slide.Icon size={56} color={slide.iconColor} strokeWidth={1.6} />
        </View>

        {/* Accent line */}
        <View
          style={{
            width: 40,
            height: 3,
            borderRadius: 2,
            backgroundColor: slide.accent,
            marginBottom: 24,
            alignSelf: 'flex-start',
          }}
        />

        <Text
          style={{
            color: '#fff',
            fontSize: 36,
            fontWeight: '800',
            letterSpacing: -1.2,
            lineHeight: 44,
            alignSelf: 'flex-start',
            marginBottom: 18,
          }}>
          {slide.title}
        </Text>

        <Text
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 16,
            lineHeight: 24,
            alignSelf: 'flex-start',
            letterSpacing: -0.1,
          }}>
          {slide.subtitle}
        </Text>
      </View>

      {/* Bottom */}
      <View style={{ paddingHorizontal: 28, paddingBottom: 52 }}>
        {/* Progress dots */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                height: 3,
                borderRadius: 2,
                backgroundColor: i === current ? slide.accent : 'rgba(255,255,255,0.15)',
                width: i === current ? 28 : 8,
              }}
            />
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.88}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            backgroundColor: slide.accent,
            borderRadius: 16,
            paddingVertical: 18,
          }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: -0.3 }}>
            {current < SLIDES.length - 1 ? 'Siguiente' : 'Comenzar ahora'}
          </Text>
          <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
