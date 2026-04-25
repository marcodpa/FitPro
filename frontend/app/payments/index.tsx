import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FakePaymentService } from '@/lib/services';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import type { Payment, Plan } from '@/lib/types';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Star,
  Check,
  ChevronRight,
  Upload,
  Paperclip,
} from 'lucide-react-native';

const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    icon: Clock,
    color: '#f59e0b',
    dim: 'rgba(245,158,11,0.15)',
  },
  validated: {
    label: 'Validado',
    icon: CheckCircle,
    color: '#22c55e',
    dim: 'rgba(34,197,94,0.15)',
  },
  rejected: {
    label: 'Rechazado',
    icon: XCircle,
    color: '#ef4444',
    dim: 'rgba(239,68,68,0.15)',
  },
  expired: {
    label: 'Vencido',
    icon: AlertCircle,
    color: '#6b7280',
    dim: 'rgba(107,114,128,0.15)',
  },
};

export default function PaymentsScreen() {
  const { user, activeRole } = useAppStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'history' | 'plans' | 'register'>('history');
  const [amount, setAmount] = useState('50');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [focusAmount, setFocusAmount] = useState(false);
  const [receiptModal, setReceiptModal] = useState<string | null>(null); // payment id
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const router = useRouter();
  const t = useTheme();

  useEffect(() => {
    if (!user) return;
    const fetchFn =
      activeRole === 'admin'
        ? FakePaymentService.getAll()
        : FakePaymentService.getByUserId(user.id);
    Promise.all([fetchFn, FakePaymentService.getPlans()])
      .then(([pays, pls]) => {
        setPayments(pays);
        setPlans(pls);
      })
      .finally(() => setLoading(false));
  }, [user, activeRole]);

  const handleSubmitPayment = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }
    setSubmitting(true);
    try {
      const newPay = await FakePaymentService.submitPayment({
        userId: user?.id,
        amount: Number(amount),
        plan: 'Plan Premium - Mensual',
      });
      setPayments((prev) => [newPay, ...prev]);
      setTab('history');
      Alert.alert('Enviado', 'Tu pago fue registrado y está pendiente de validación.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!receiptModal || !receiptUrl.trim()) {
      Alert.alert('Error', 'Ingresa una URL de comprobante válida.');
      return;
    }
    setUploadingReceipt(true);
    try {
      const updated = await FakePaymentService.uploadReceipt(receiptModal, receiptUrl.trim());
      setPayments((prev) => prev.map((p) => (p.id === receiptModal ? updated : p)));
      setReceiptModal(null);
      setReceiptUrl('');
      Alert.alert('Enviado', 'Comprobante enviado. El administrador lo revisará pronto.');
    } catch {
      Alert.alert('Error', 'No se pudo subir el comprobante.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleValidate = async (id: string) => {
    const updated = await FakePaymentService.validatePayment(id);
    setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const handleReject = (id: string) => {
    Alert.alert('Rechazar Pago', '¿Estás seguro de rechazar este pago?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: () => {
          setPayments((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: 'rejected' as const } : p))
          );
        },
      },
    ]);
  };

  const TABS = [
    { key: 'history', label: 'Historial' },
    { key: 'plans', label: 'Planes' },
    { key: 'register', label: 'Registrar' },
  ];

  const METHODS = ['💵 Efectivo', '🏦 Transferencia', '💳 Tarjeta'];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: t.bg.secondary,
          paddingTop: 56,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.xxl,
          borderBottomWidth: 1,
          borderBottomColor: t.border.subtle,
        }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md }}>
          <ArrowLeft size={18} color={t.text.secondary} />
          <Text style={{ color: t.text.secondary, fontSize: FONT.base }}>Volver</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md }}>
          <CreditCard size={22} color={t.accent} />
          <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xxl }}>
            Planes y Pagos
          </Text>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          {TABS.map((tabItem) => {
            const isActive = tab === tabItem.key;
            return (
              <TouchableOpacity
                key={tabItem.key}
                onPress={() => setTab(tabItem.key as any)}
                style={{
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm - 2,
                  borderRadius: RADIUS.full,
                  backgroundColor: isActive ? t.accent : t.bg.elevated,
                  borderWidth: 1,
                  borderColor: isActive ? t.accent : t.border.default,
                }}>
                <Text
                  style={{
                    color: isActive ? t.accentText : t.text.secondary,
                    fontWeight: '700',
                    fontSize: FONT.sm,
                  }}>
                  {tabItem.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.xl }}>
          {/* ─── HISTORY ─── */}
          {tab === 'history' && (
            <>
              <Text
                style={{
                  color: t.text.secondary,
                  fontWeight: '700',
                  fontSize: FONT.sm,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  marginBottom: SPACING.md,
                }}>
                {activeRole === 'admin' ? 'Todos los pagos' : 'Mis Pagos'}
              </Text>

              {payments.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 60, gap: SPACING.md }}>
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: RADIUS.full,
                      backgroundColor: t.bg.elevated,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <CreditCard size={32} color={t.text.tertiary} />
                  </View>
                  <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.lg }}>
                    Sin pagos
                  </Text>
                  <Text style={{ color: t.text.tertiary, fontSize: FONT.base, textAlign: 'center' }}>
                    Aún no tienes historial de pagos
                  </Text>
                </View>
              ) : (
                payments.map((p) => {
                  const cfg = STATUS_CONFIG[p.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <View
                      key={p.id}
                      style={{
                        backgroundColor: t.bg.card,
                        borderRadius: RADIUS.xl,
                        padding: SPACING.lg,
                        marginBottom: SPACING.sm,
                        borderWidth: 1,
                        borderColor: t.border.subtle,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: SPACING.sm,
                        }}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: t.text.primary,
                              fontWeight: '700',
                              fontSize: FONT.base,
                            }}>
                            {p.plan}
                          </Text>
                          <Text
                            style={{
                              color: t.accent,
                              fontWeight: '800',
                              fontSize: FONT.lg,
                              marginTop: 2,
                            }}>
                            ${p.amount} {p.currency}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            backgroundColor: cfg.dim,
                            borderRadius: RADIUS.full,
                            paddingHorizontal: SPACING.sm,
                            paddingVertical: 4,
                          }}>
                          <StatusIcon size={12} color={cfg.color} />
                          <Text
                            style={{
                              color: cfg.color,
                              fontSize: FONT.xs,
                              fontWeight: '700',
                            }}>
                            {cfg.label}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                        <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>
                          📅 {p.date}
                        </Text>
                        <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>
                          ⏰ Vence: {p.dueDate}
                        </Text>
                      </View>

                      {activeRole === 'admin' && p.status === 'pending' && (
                        <View
                          style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md }}>
                          <TouchableOpacity
                            onPress={() => handleValidate(p.id)}
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              backgroundColor: t.successDim,
                              borderRadius: RADIUS.md,
                              paddingVertical: SPACING.sm,
                              borderWidth: 1,
                              borderColor: t.success,
                            }}>
                            <CheckCircle size={14} color={t.success} />
                            <Text
                              style={{
                                color: t.success,
                                fontWeight: '700',
                                fontSize: FONT.sm,
                              }}>
                              Validar
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleReject(p.id)}
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              backgroundColor: t.dangerDim,
                              borderRadius: RADIUS.md,
                              paddingVertical: SPACING.sm,
                              borderWidth: 1,
                              borderColor: t.danger,
                            }}>
                            <XCircle size={14} color={t.danger} />
                            <Text
                              style={{
                                color: t.danger,
                                fontWeight: '700',
                                fontSize: FONT.sm,
                              }}>
                              Rechazar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {activeRole !== 'admin' && p.status === 'pending' && (
                        <TouchableOpacity
                          onPress={() => { setReceiptModal(p.id); setReceiptUrl(''); }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            backgroundColor: t.infoDim,
                            borderRadius: RADIUS.md,
                            paddingVertical: SPACING.sm,
                            marginTop: SPACING.sm,
                            borderWidth: 1,
                            borderColor: t.info,
                          }}>
                          <Paperclip size={14} color={t.info} />
                          <Text style={{ color: t.info, fontWeight: '700', fontSize: FONT.sm }}>
                            Subir Comprobante
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              )}
            </>
          )}

          {/* ─── PLANS ─── */}
          {tab === 'plans' && (
            <>
              <Text
                style={{
                  color: t.text.secondary,
                  fontWeight: '700',
                  fontSize: FONT.sm,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  marginBottom: SPACING.md,
                }}>
                Planes Disponibles
              </Text>

              {plans.map((plan) => {
                const isActive = plan.isActive;
                return (
                  <View
                    key={plan.id}
                    style={{
                      backgroundColor: isActive ? t.accent : t.bg.card,
                      borderRadius: RADIUS.xxl,
                      padding: SPACING.xl,
                      marginBottom: SPACING.md,
                      borderWidth: 1,
                      borderColor: isActive ? t.accent : t.border.default,
                    }}>
                    {isActive && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          backgroundColor: 'rgba(0,0,0,0.15)',
                          borderRadius: RADIUS.full,
                          paddingHorizontal: SPACING.sm,
                          paddingVertical: 4,
                          alignSelf: 'flex-start',
                          marginBottom: SPACING.sm,
                        }}>
                        <Star size={10} color={t.accentText} fill={t.accentText} />
                        <Text
                          style={{
                            color: t.accentText,
                            fontSize: FONT.xs,
                            fontWeight: '800',
                            letterSpacing: 1,
                          }}>
                          PLAN ACTUAL
                        </Text>
                      </View>
                    )}

                    <Text
                      style={{
                        color: isActive ? t.accentText : t.text.primary,
                        fontWeight: '800',
                        fontSize: FONT.xl,
                        marginBottom: 4,
                      }}>
                      {plan.name}
                    </Text>
                    <Text
                      style={{
                        color: isActive ? 'rgba(10,10,10,0.6)' : t.text.tertiary,
                        fontSize: FONT.base,
                        marginBottom: SPACING.md,
                      }}>
                      ${plan.price}/
                      {plan.period === 'monthly'
                        ? 'mes'
                        : plan.period === 'annual'
                          ? 'año'
                          : 'trimestre'}
                    </Text>

                    {plan.features.map((f, i) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          gap: SPACING.sm,
                          marginBottom: SPACING.xs,
                        }}>
                        <View
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: RADIUS.full,
                            backgroundColor: isActive
                              ? 'rgba(0,0,0,0.15)'
                              : t.accentDim,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 1,
                          }}>
                          <Check
                            size={10}
                            color={isActive ? t.accentText : t.accent}
                            strokeWidth={3}
                          />
                        </View>
                        <Text
                          style={{
                            color: isActive ? 'rgba(10,10,10,0.8)' : t.text.secondary,
                            fontSize: FONT.sm,
                            lineHeight: 18,
                            flex: 1,
                          }}>
                          {f}
                        </Text>
                      </View>
                    ))}

                    {!isActive && (
                      <TouchableOpacity
                        onPress={() => setTab('register')}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          backgroundColor: t.accentDim,
                          borderRadius: RADIUS.md,
                          paddingVertical: SPACING.sm,
                          marginTop: SPACING.md,
                          borderWidth: 1,
                          borderColor: t.accent,
                        }}>
                        <Text style={{ color: t.accent, fontWeight: '700', fontSize: FONT.sm }}>
                          Contratar plan
                        </Text>
                        <ChevronRight size={14} color={t.accent} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </>
          )}

          {/* ─── REGISTER ─── */}
          {tab === 'register' && (
            <>
              <Text
                style={{
                  color: t.text.secondary,
                  fontWeight: '700',
                  fontSize: FONT.sm,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  marginBottom: SPACING.md,
                }}>
                Registrar Pago
              </Text>

              <View
                style={{
                  backgroundColor: t.bg.card,
                  borderRadius: RADIUS.xxl,
                  padding: SPACING.xl,
                  borderWidth: 1,
                  borderColor: t.border.default,
                  gap: SPACING.md,
                }}>
                {/* Plan */}
                <View>
                  <Text
                    style={{
                      color: t.text.secondary,
                      fontSize: FONT.sm,
                      fontWeight: '600',
                      marginBottom: SPACING.xs,
                    }}>
                    Plan
                  </Text>
                  <View
                    style={{
                      backgroundColor: t.bg.elevated,
                      paddingHorizontal: SPACING.lg,
                      paddingVertical: SPACING.md,
                      borderRadius: RADIUS.lg,
                      borderWidth: 1,
                      borderColor: t.border.subtle,
                    }}>
                    <Text style={{ color: t.text.primary, fontSize: FONT.base }}>
                      Plan Premium - Mensual
                    </Text>
                  </View>
                </View>

                {/* Amount */}
                <View>
                  <Text
                    style={{
                      color: t.text.secondary,
                      fontSize: FONT.sm,
                      fontWeight: '600',
                      marginBottom: SPACING.xs,
                    }}>
                    Monto (USD)
                  </Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    onFocus={() => setFocusAmount(true)}
                    onBlur={() => setFocusAmount(false)}
                    style={{
                      backgroundColor: t.bg.input,
                      color: t.text.primary,
                      paddingHorizontal: SPACING.lg,
                      paddingVertical: SPACING.md,
                      borderRadius: RADIUS.lg,
                      fontSize: FONT.base,
                      borderWidth: 1.5,
                      borderColor: focusAmount ? t.accent : t.border.default,
                    }}
                    placeholderTextColor={t.text.tertiary}
                  />
                </View>

                {/* Payment method */}
                <View>
                  <Text
                    style={{
                      color: t.text.secondary,
                      fontSize: FONT.sm,
                      fontWeight: '600',
                      marginBottom: SPACING.xs,
                    }}>
                    Método de pago
                  </Text>
                  <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                    {METHODS.map((m) => {
                      const isSelected = selectedMethod === m;
                      return (
                        <TouchableOpacity
                          key={m}
                          onPress={() => setSelectedMethod(isSelected ? null : m)}
                          style={{
                            flex: 1,
                            backgroundColor: isSelected ? t.accentDim : t.bg.elevated,
                            borderRadius: RADIUS.md,
                            paddingVertical: SPACING.sm,
                            alignItems: 'center',
                            borderWidth: 1.5,
                            borderColor: isSelected ? t.accent : t.border.default,
                          }}>
                          <Text
                            style={{
                              fontSize: FONT.xs,
                              color: isSelected ? t.accent : t.text.secondary,
                              fontWeight: '600',
                              textAlign: 'center',
                            }}>
                            {m}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Submit */}
                <TouchableOpacity
                  onPress={handleSubmitPayment}
                  disabled={submitting}
                  style={{
                    backgroundColor: t.accent,
                    borderRadius: RADIUS.xl,
                    paddingVertical: SPACING.lg,
                    alignItems: 'center',
                    marginTop: SPACING.xs,
                    opacity: submitting ? 0.7 : 1,
                  }}>
                  {submitting ? (
                    <ActivityIndicator color={t.accentText} />
                  ) : (
                    <Text
                      style={{
                        color: t.accentText,
                        fontWeight: '800',
                        fontSize: FONT.base + 1,
                      }}>
                      Registrar Pago
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Receipt Upload Modal */}
      <Modal visible={!!receiptModal} transparent animationType="slide" onRequestClose={() => setReceiptModal(null)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
          activeOpacity={1}
          onPress={() => setReceiptModal(null)}>
          <View style={{ flex: 1 }} />
        </TouchableOpacity>
        <View style={{
          backgroundColor: t.bg.secondary,
          borderTopLeftRadius: RADIUS.xxl,
          borderTopRightRadius: RADIUS.xxl,
          padding: SPACING.xxl,
          paddingBottom: 40,
          borderTopWidth: 1,
          borderTopColor: t.border.subtle,
        }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: t.border.strong, alignSelf: 'center', marginBottom: SPACING.xl }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.xl }}>
            <View style={{ width: 42, height: 42, borderRadius: RADIUS.md, backgroundColor: t.infoDim, alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={18} color={t.info} strokeWidth={2} />
            </View>
            <View>
              <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg }}>Subir Comprobante</Text>
              <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>Ingresa el enlace de tu comprobante de pago</Text>
            </View>
          </View>
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600', marginBottom: SPACING.xs }}>
            URL del comprobante
          </Text>
          <TextInput
            value={receiptUrl}
            onChangeText={setReceiptUrl}
            placeholder="https://drive.google.com/..."
            placeholderTextColor={t.text.tertiary}
            autoCapitalize="none"
            keyboardType="url"
            style={{
              backgroundColor: t.bg.input,
              color: t.text.primary,
              paddingHorizontal: SPACING.lg,
              paddingVertical: SPACING.md,
              borderRadius: RADIUS.lg,
              fontSize: FONT.base,
              borderWidth: 1.5,
              borderColor: t.border.default,
              marginBottom: SPACING.lg,
            }}
          />
          <TouchableOpacity
            onPress={handleUploadReceipt}
            disabled={uploadingReceipt || !receiptUrl.trim()}
            style={{
              backgroundColor: receiptUrl.trim() ? t.info : t.bg.elevated,
              borderRadius: RADIUS.xl,
              paddingVertical: SPACING.lg,
              alignItems: 'center',
              opacity: uploadingReceipt ? 0.7 : 1,
            }}>
            {uploadingReceipt ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: receiptUrl.trim() ? '#fff' : t.text.tertiary, fontWeight: '800', fontSize: FONT.base }}>
                Enviar Comprobante
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
