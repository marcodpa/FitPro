import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/store';
import { FakePaymentService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import type { Plan } from '@/lib/types';
import {
  ArrowLeft,
  Zap,
  Star,
  Check,
  ChevronRight,
  ShieldCheck,
  Users,
  Dumbbell,
  MessageCircle,
  BarChart3,
  Infinity,
} from 'lucide-react-native';

const PLAN_ICONS: Record<string, React.ComponentType<any>> = {
  basic:    Dumbbell,
  premium:  Zap,
  pro:      Star,
  elite:    ShieldCheck,
};

const PLAN_COLORS = ['#818cf8', '#c8f65d', '#f97316', '#22c55e'];
const PLAN_DARK   = ['rgba(129,140,248,0.14)', 'rgba(200,246,93,0.14)', 'rgba(249,115,22,0.14)', 'rgba(34,197,94,0.14)'];

const PERIOD_LABEL: Record<string, string> = {
  monthly:   'mes',
  annual:    'año',
  quarterly: 'trimestre',
};

const FEATURE_ICONS: Record<string, React.ComponentType<any>> = {
  rutina:    Dumbbell,
  cliente:   Users,
  chat:      MessageCircle,
  progreso:  BarChart3,
  ilimitado: Infinity,
};

function featureIcon(feature: string) {
  const lower = feature.toLowerCase();
  for (const [key, Icon] of Object.entries(FEATURE_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return Check;
}

export default function PlansScreen() {
  const router = useRouter();
  const t = useTheme();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    FakePaymentService.getPlans()
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activePlan = plans.find(p => p.isActive);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{
        paddingTop: 56, paddingBottom: SPACING.xxl,
        paddingHorizontal: SPACING.xl,
        backgroundColor: t.bg.secondary,
        borderBottomWidth: 1, borderBottomColor: t.border.subtle,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
            marginBottom: SPACING.lg,
          }}>
          <View style={{
            width: 36, height: 36, borderRadius: RADIUS.md,
            backgroundColor: t.bg.tertiary, borderWidth: 1, borderColor: t.border.subtle,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowLeft size={17} color={t.text.primary} strokeWidth={2} />
          </View>
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm }}>Volver</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <View style={{
            width: 46, height: 46, borderRadius: RADIUS.lg,
            backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: t.accent,
          }}>
            <Zap size={22} color={t.accent} strokeWidth={2} />
          </View>
          <View>
            <Text style={{ color: t.text.primary, fontSize: FONT.xxl, fontWeight: '800', letterSpacing: -0.5 }}>
              Planes FitPro
            </Text>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, marginTop: 2 }}>
              Elige el plan ideal para ti
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: SPACING.xl, paddingBottom: 60, gap: SPACING.md }}>

          {/* Active plan banner */}
          {activePlan && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
              backgroundColor: t.accentDim, borderRadius: RADIUS.xl,
              padding: SPACING.lg, borderWidth: 1, borderColor: t.accent,
              marginBottom: SPACING.sm,
            }}>
              <View style={{
                width: 40, height: 40, borderRadius: RADIUS.md,
                backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={18} color={t.accentText} strokeWidth={2.5} fill={t.accentText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
                  Plan actual: <Text style={{ color: t.accent }}>{activePlan.name}</Text>
                </Text>
                <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>
                  ${activePlan.price}/{PERIOD_LABEL[activePlan.period] ?? activePlan.period}
                </Text>
              </View>
              <ShieldCheck size={18} color={t.accent} strokeWidth={2} />
            </View>
          )}

          {/* Plans */}
          {plans.map((plan, idx) => {
            const color  = PLAN_COLORS[idx % PLAN_COLORS.length];
            const dimBg  = PLAN_DARK[idx % PLAN_DARK.length];
            const PlanIcon = PLAN_ICONS[plan.id?.toLowerCase()] ?? Zap;
            const isActive   = plan.isActive;
            const isSelected = selected === plan.id;

            return (
              <TouchableOpacity
                key={plan.id}
                activeOpacity={0.85}
                onPress={() => setSelected(isSelected ? null : plan.id)}
                style={{
                  borderRadius: RADIUS.xxl,
                  overflow: 'hidden',
                  borderWidth: isActive ? 2 : isSelected ? 1.5 : 1,
                  borderColor: isActive ? t.accent : isSelected ? color : t.border.subtle,
                  backgroundColor: t.bg.card,
                }}>

                {/* Top bar */}
                <View style={{
                  backgroundColor: isActive ? t.accent : dimBg,
                  paddingHorizontal: SPACING.xl,
                  paddingVertical: SPACING.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SPACING.md,
                }}>
                  <View style={{
                    width: 44, height: 44, borderRadius: RADIUS.lg,
                    backgroundColor: isActive ? 'rgba(0,0,0,0.12)' : t.bg.card,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: isActive ? 'rgba(0,0,0,0.1)' : color + '40',
                  }}>
                    <PlanIcon size={20} color={isActive ? t.accentText : color} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: isActive ? t.accentText : t.text.primary,
                      fontWeight: '800', fontSize: FONT.lg, letterSpacing: -0.3,
                    }}>
                      {plan.name}
                    </Text>
                    {isActive && (
                      <View style={{
                        flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3,
                        backgroundColor: 'rgba(0,0,0,0.15)',
                        borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2,
                        alignSelf: 'flex-start',
                      }}>
                        <Star size={9} color={t.accentText} fill={t.accentText} />
                        <Text style={{ color: t.accentText, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>
                          TU PLAN ACTUAL
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{
                      color: isActive ? t.accentText : color,
                      fontWeight: '900', fontSize: 22, letterSpacing: -1,
                    }}>
                      ${plan.price}
                    </Text>
                    <Text style={{
                      color: isActive ? 'rgba(0,0,0,0.5)' : t.text.tertiary,
                      fontSize: FONT.xs, fontWeight: '600',
                    }}>
                      /{PERIOD_LABEL[plan.period] ?? plan.period}
                    </Text>
                  </View>
                </View>

                {/* Features */}
                <View style={{ padding: SPACING.xl, gap: SPACING.sm }}>
                  {plan.features.map((f, i) => {
                    const FeatureIcon = featureIcon(f);
                    return (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md }}>
                        <View style={{
                          width: 22, height: 22, borderRadius: RADIUS.sm,
                          backgroundColor: dimBg,
                          alignItems: 'center', justifyContent: 'center',
                          borderWidth: 1, borderColor: color + '30',
                          marginTop: 1,
                        }}>
                          <FeatureIcon size={11} color={color} strokeWidth={2.5} />
                        </View>
                        <Text style={{
                          flex: 1,
                          color: t.text.secondary, fontSize: FONT.sm, lineHeight: 19,
                        }}>
                          {f}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* CTA */}
                {!isActive && (
                  <TouchableOpacity
                    onPress={() => router.push('/payments' as any)}
                    style={{
                      marginHorizontal: SPACING.xl,
                      marginBottom: SPACING.xl,
                      backgroundColor: isSelected ? color : t.bg.tertiary,
                      borderRadius: RADIUS.xl,
                      paddingVertical: 13,
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
                      borderWidth: 1,
                      borderColor: isSelected ? color : t.border.default,
                    }}>
                    <Text style={{
                      color: isSelected ? (idx === 1 ? t.accentText : '#fff') : t.text.secondary,
                      fontWeight: '700', fontSize: FONT.sm,
                    }}>
                      Contratar este plan
                    </Text>
                    <ChevronRight size={15} color={isSelected ? (idx === 1 ? t.accentText : '#fff') : t.text.secondary} strokeWidth={2.5} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Guarantee note */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
            backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
            padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle,
            marginTop: SPACING.sm,
          }}>
            <ShieldCheck size={20} color={t.success} strokeWidth={1.8} />
            <Text style={{ flex: 1, color: t.text.secondary, fontSize: FONT.xs, lineHeight: 17 }}>
              <Text style={{ color: t.text.primary, fontWeight: '700' }}>Garantía de 7 días.</Text>
              {' '}Si no estás satisfecho, te devolvemos tu dinero sin preguntas.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
