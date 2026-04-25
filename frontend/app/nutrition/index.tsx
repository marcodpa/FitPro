import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import {
  ArrowLeft,
  Droplets,
  Flame,
  Apple,
  Beef,
  Wheat,
  Zap,
  Clock,
  CheckCircle2,
  Info,
} from 'lucide-react-native';

interface Meal {
  time: string;
  name: string;
  description: string;
  calories: number;
  emoji: string;
}

interface MacroBar {
  label: string;
  grams: number;
  calories: number;
  color: string;
  percent: number;
}

export default function NutritionScreen() {
  const { user } = useAppStore();
  const t = useTheme();
  const router = useRouter();

  const weight = user?.weight ?? 70;
  const height = user?.height ?? 170;
  const goal   = (user?.goal ?? '').toLowerCase();

  const bmr   = Math.round(10 * weight + 6.25 * height - 5 * 25 + 5);
  const tdee  = Math.round(bmr * 1.55);
  const targetCalories = goal.includes('bajar') || goal.includes('perder')
    ? Math.round(tdee * 0.85)
    : goal.includes('masa') || goal.includes('ganar') || goal.includes('volumen')
    ? Math.round(tdee * 1.1)
    : tdee;

  const waterLiters = (weight * 0.035).toFixed(1);

  const protein = Math.round(weight * 1.8);
  const fat     = Math.round((targetCalories * 0.25) / 9);
  const carbs   = Math.round((targetCalories - protein * 4 - fat * 9) / 4);

  const macros: MacroBar[] = useMemo(() => {
    const total = protein * 4 + fat * 9 + carbs * 4;
    return [
      { label: 'Proteínas', grams: protein, calories: protein * 4, color: t.accent,   percent: Math.round((protein * 4 / total) * 100) },
      { label: 'Carbohidratos', grams: carbs,   calories: carbs * 4,   color: t.info,    percent: Math.round((carbs * 4 / total) * 100) },
      { label: 'Grasas',      grams: fat,     calories: fat * 9,     color: t.warning, percent: Math.round((fat * 9 / total) * 100) },
    ];
  }, [protein, carbs, fat, t]);

  const meals: Meal[] = [
    { time: '07:00', name: 'Desayuno', description: 'Avena con frutas y proteína en polvo', calories: Math.round(targetCalories * 0.20), emoji: '🥣' },
    { time: '10:30', name: 'Merienda AM', description: 'Fruta + puñado de nueces', calories: Math.round(targetCalories * 0.10), emoji: '🍎' },
    { time: '13:00', name: 'Almuerzo', description: 'Pollo, arroz integral y verduras', calories: Math.round(targetCalories * 0.30), emoji: '🍗' },
    { time: '16:30', name: 'Merienda PM', description: 'Yogur griego con granola', calories: Math.round(targetCalories * 0.10), emoji: '🥛' },
    { time: '19:30', name: 'Cena', description: 'Salmón, quinoa y ensalada', calories: Math.round(targetCalories * 0.30), emoji: '🐟' },
  ];

  const tips = [
    { icon: Droplets, text: `Bebe ${waterLiters}L de agua al día`, color: t.info },
    { icon: Clock,    text: 'Come cada 3-4 horas para mantener el metabolismo', color: t.orange },
    { icon: Beef,     text: `Consume ${protein}g de proteína por día`, color: t.accent },
    { icon: Apple,    text: 'Incluye 5 porciones de frutas y verduras', color: t.success },
    { icon: Zap,      text: 'Come carbohidratos complejos antes de entrenar', color: t.warning },
    { icon: CheckCircle2, text: 'Prepara tus comidas con anticipación', color: t.info },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{
        backgroundColor: t.bg.secondary,
        paddingTop: 56,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: t.border.subtle,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: t.bg.elevated, alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} color={t.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg }}>Nutrición</Text>
          <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>Plan personalizado según tu perfil</Text>
        </View>
        <View style={{ width: 38, height: 38, borderRadius: RADIUS.full, backgroundColor: t.successDim, alignItems: 'center', justifyContent: 'center' }}>
          <Apple size={18} color={t.success} strokeWidth={2} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.xl }} showsVerticalScrollIndicator={false}>

        {/* Calorie card */}
        <View style={{
          backgroundColor: t.accent,
          borderRadius: RADIUS.xxl,
          padding: SPACING.xl,
          alignItems: 'center',
          gap: SPACING.sm,
        }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <Flame size={24} color={t.accentText} strokeWidth={2} />
          </View>
          <Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: FONT.sm, fontWeight: '600' }}>CALORÍAS DIARIAS OBJETIVO</Text>
          <Text style={{ color: t.accentText, fontSize: 52, fontWeight: '900', letterSpacing: -2 }}>{targetCalories}</Text>
          <Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: FONT.sm }}>kcal / día</Text>

          <View style={{ flexDirection: 'row', gap: SPACING.xl, marginTop: SPACING.sm }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.xl }}>{waterLiters}L</Text>
              <Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: 11 }}>Agua</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(0,0,0,0.15)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.xl }}>{bmr}</Text>
              <Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: 11 }}>BMR</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(0,0,0,0.15)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.xl }}>{tdee}</Text>
              <Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: 11 }}>TDEE</Text>
            </View>
          </View>
        </View>

        {/* Macros */}
        <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle, gap: SPACING.lg }}>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3 }}>Macronutrientes</Text>

          {/* Combined bar */}
          <View style={{ height: 12, borderRadius: 6, overflow: 'hidden', flexDirection: 'row' }}>
            {macros.map((m, i) => (
              <View key={i} style={{ flex: m.percent, backgroundColor: m.color }} />
            ))}
          </View>

          {/* Legend */}
          {macros.map((m) => (
            <View key={m.label} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: m.color }} />
                  <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>{m.label}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                  <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>{m.calories} kcal</Text>
                  <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.sm }}>{m.grams}g</Text>
                </View>
              </View>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: t.bg.tertiary }}>
                <View style={{ width: `${m.percent}%`, height: '100%', borderRadius: 3, backgroundColor: m.color }} />
              </View>
            </View>
          ))}
        </View>

        {/* Meal plan */}
        <View>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3, marginBottom: SPACING.md }}>
            Plan de Comidas
          </Text>
          <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle }}>
            {meals.map((meal, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SPACING.md,
                  padding: SPACING.lg,
                  borderBottomWidth: i < meals.length - 1 ? 1 : 0,
                  borderBottomColor: t.border.subtle,
                }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: RADIUS.md,
                  backgroundColor: t.bg.tertiary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 22 }}>{meal.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>{meal.name}</Text>
                    <View style={{ backgroundColor: t.bg.tertiary, borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ color: t.text.tertiary, fontSize: 10, fontWeight: '600' }}>{meal.time}</Text>
                    </View>
                  </View>
                  <Text style={{ color: t.text.secondary, fontSize: FONT.xs, lineHeight: 16 }}>{meal.description}</Text>
                </View>
                <Text style={{ color: t.accent, fontWeight: '800', fontSize: FONT.sm }}>{meal.calories}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View>
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3, marginBottom: SPACING.md }}>
            Consejos Nutricionales
          </Text>
          <View style={{ gap: SPACING.sm }}>
            {tips.map((tip, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SPACING.md,
                  backgroundColor: t.bg.card,
                  borderRadius: RADIUS.xl,
                  padding: SPACING.lg,
                  borderWidth: 1,
                  borderColor: t.border.subtle,
                }}>
                <View style={{ width: 38, height: 38, borderRadius: RADIUS.md, backgroundColor: tip.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                  <tip.icon size={17} color={tip.color} strokeWidth={2} />
                </View>
                <Text style={{ color: t.text.primary, fontSize: FONT.sm, fontWeight: '500', flex: 1, lineHeight: 19 }}>
                  {tip.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={{
          flexDirection: 'row',
          gap: SPACING.md,
          backgroundColor: t.infoDim,
          borderRadius: RADIUS.xl,
          padding: SPACING.lg,
          borderWidth: 1,
          borderColor: t.info + '30',
        }}>
          <Info size={16} color={t.info} strokeWidth={2} style={{ marginTop: 2 }} />
          <Text style={{ color: t.text.secondary, fontSize: FONT.xs, lineHeight: 18, flex: 1 }}>
            Este plan es una estimación basada en tu perfil. Consulta a un nutricionista para un plan personalizado más preciso.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
