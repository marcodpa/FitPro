import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { COLORS } from '@/lib/theme';
import {
  Dumbbell,
  MessageSquare,
  Users,
  ArrowRight,
  Zap,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const AC = COLORS.accent.DEFAULT;

const SLIDES = [
  {
    id: 1,
    Icon: Dumbbell,
    iconColor: AC,
    bgTop: '#0d1f0d',
    bgBottom: '#080808',
    accentLine: AC,
    tag: '01 / 03',
    title: 'Entrena con\nPropósito',
    subtitle:
      'Rutinas personalizadas, cronómetro integrado y seguimiento de cada serie en tiempo real.',
    stat1: { value: '4', label: 'Rutinas activas' },
    stat2: { value: '14', label: 'Sesiones completadas' },
  },
  {
    id: 2,
    Icon: MessageSquare,
    iconColor: COLORS.info,
    bgTop: '#0d0d1f',
    bgBottom: '#080808',
    accentLine: COLORS.info,
    tag: '02 / 03',
    title: 'Tu Entrenador,\nSiempre Contigo',
    subtitle:
      'Chat directo con tu entrenador. Feedback inmediato, ajuste de planes y soporte constante.',
    stat1: { value: '1:1', label: 'Chat dedicado' },
    stat2: { value: '24h', label: 'Respuesta media' },
  },
  {
    id: 3,
    Icon: Users,
    iconColor: COLORS.orange,
    bgTop: '#1f0d08',
    bgBottom: '#080808',
    accentLine: COLORS.orange,
    tag: '03 / 03',
    title: 'Comunidad\nFitness Real',
    subtitle:
      'Comparte logros, celebra tu progreso e inspira a cientos de atletas en tu comunidad.',
    stat1: { value: '+500', label: 'Atletas activos' },
    stat2: { value: '5★', label: 'Valoración media' },
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = React.useState(0);
  const anim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { setOnboarded } = useAppStore();

  const slide = SLIDES[current];

  const handleNext = () => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start(() => {
      if (current < SLIDES.length - 1) {
        setCurrent(current + 1);
      } else {
        setOnboarded();
        router.replace('/auth/login');
      }
    });
  };

  const handleSkip = () => {
    setOnboarded();
    router.replace('/auth/login');
  };

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg.primary }}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient blocks */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: height * 0.55,
          backgroundColor: slide.bgTop,
          opacity: 0.6,
        }}
      />

      {/* Top bar */}
      <View
        style={{
          position: 'absolute',
          top: 56,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 28,
          zIndex: 20,
        }}>
        {/* Brand mark */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: COLORS.accent.dim,
              borderWidth: 1,
              borderColor: COLORS.accent.dimMid,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Zap size={16} color={AC} strokeWidth={2.2} />
          </View>
          <Text
            style={{
              color: COLORS.text.primary,
              fontWeight: '800',
              fontSize: 15,
              letterSpacing: -0.3,
            }}>
            FitPro
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSkip}
          style={{
            backgroundColor: COLORS.white[10],
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderWidth: 1,
            borderColor: COLORS.bg.border,
          }}>
          <Text style={{ color: COLORS.text.secondary, fontSize: 13, fontWeight: '600' }}>
            Omitir
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <Animated.View style={{ flex: 1, opacity }}>
        {/* Icon block */}
        <View
          style={{
            flex: 1,
            paddingTop: 130,
            paddingHorizontal: 28,
            justifyContent: 'space-between',
            paddingBottom: 40,
          }}>

          {/* Large icon */}
          <View style={{ alignItems: 'flex-start', gap: 32 }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 28,
                backgroundColor: COLORS.bg.secondary,
                borderWidth: 1,
                borderColor: COLORS.bg.borderStrong,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <slide.Icon size={48} color={slide.iconColor} strokeWidth={1.5} />
            </View>

            {/* Tag */}
            <Text
              style={{
                color: COLORS.text.tertiary,
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 2.5,
              }}>
              {slide.tag}
            </Text>

            {/* Accent line */}
            <View
              style={{
                width: 36,
                height: 3,
                borderRadius: 2,
                backgroundColor: slide.accentLine,
              }}
            />

            {/* Title */}
            <Text
              style={{
                color: COLORS.text.primary,
                fontSize: 40,
                fontWeight: '800',
                letterSpacing: -1.5,
                lineHeight: 48,
              }}>
              {slide.title}
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                color: COLORS.text.secondary,
                fontSize: 16,
                lineHeight: 25,
                letterSpacing: -0.2,
                maxWidth: width * 0.85,
              }}>
              {slide.subtitle}
            </Text>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[slide.stat1, slide.stat2].map((s, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.bg.secondary,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: COLORS.bg.border,
                  gap: 4,
                }}>
                <Text
                  style={{
                    color: slide.accentLine,
                    fontSize: 22,
                    fontWeight: '800',
                    letterSpacing: -0.8,
                  }}>
                  {s.value}
                </Text>
                <Text
                  style={{ color: COLORS.text.secondary, fontSize: 12, fontWeight: '500' }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Bottom controls */}
      <View style={{ paddingHorizontal: 28, paddingBottom: 52, gap: 20 }}>
        {/* Progress bar */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                height: 3,
                borderRadius: 2,
                backgroundColor:
                  i === current ? slide.accentLine : COLORS.white[10],
                flex: i === current ? 2 : 1,
              }}
            />
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            backgroundColor: current === SLIDES.length - 1 ? AC : COLORS.bg.elevated,
            borderRadius: 18,
            paddingVertical: 18,
            borderWidth: current === SLIDES.length - 1 ? 0 : 1,
            borderColor: COLORS.bg.borderStrong,
          }}>
          <Text
            style={{
              color:
                current === SLIDES.length - 1 ? COLORS.text.inverse : COLORS.text.primary,
              fontWeight: '800',
              fontSize: 16,
              letterSpacing: -0.3,
            }}>
            {current < SLIDES.length - 1 ? 'Continuar' : 'Comenzar ahora'}
          </Text>
          <ArrowRight
            size={18}
            color={current === SLIDES.length - 1 ? COLORS.text.inverse : COLORS.text.secondary}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
