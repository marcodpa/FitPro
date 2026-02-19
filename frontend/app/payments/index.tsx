import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { FakePaymentService } from '@/lib/services';
import type { Payment, Plan } from '@/lib/types';

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', bg: '#fef3c7', color: '#d97706', icon: '⏳' },
  validated: { label: 'Validado', bg: '#dcfce7', color: '#16a34a', icon: '✅' },
  rejected: { label: 'Rechazado', bg: '#fee2e2', color: '#dc2626', icon: '❌' },
  expired: { label: 'Vencido', bg: '#f1f5f9', color: '#64748b', icon: '⌛' },
};

export default function PaymentsScreen() {
  const { user, activeRole } = useAppStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'history' | 'plans' | 'register'>('history');
  const [amount, setAmount] = useState('50');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

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

  const handleValidate = async (id: string) => {
    const updated = await FakePaymentService.validatePayment(id);
    setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        style={{
          backgroundColor: '#7c3aed',
          paddingTop: 56,
          paddingBottom: 24,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-white/80">← Volver</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold" style={{ fontSize: 26 }}>
          Planes y Pagos 💳
        </Text>
        {/* Tabs */}
        <View className="flex-row gap-2 mt-4">
          {[
            { key: 'history', label: 'Historial' },
            { key: 'plans', label: 'Planes' },
            { key: 'register', label: 'Registrar' },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key as any)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  tab === t.key ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
              }}>
              <Text
                style={{
                  color: tab === t.key ? '#7c3aed' : '#fff',
                  fontWeight: '600',
                  fontSize: 13,
                }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
          {tab === 'history' && (
            <>
              <Text className="text-foreground font-bold text-base mb-4">
                {activeRole === 'admin' ? 'Todos los pagos' : 'Mis Pagos'}
              </Text>
              {payments.length === 0 ? (
                <View className="items-center mt-10">
                  <Text style={{ fontSize: 48, marginBottom: 12 }}>💳</Text>
                  <Text className="text-foreground font-bold text-lg">Sin pagos</Text>
                </View>
              ) : (
                payments.map((p) => {
                  const s = STATUS_CONFIG[p.status];
                  return (
                    <View
                      key={p.id}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: '#f1f5f9',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 6,
                        elevation: 2,
                      }}>
                      <View className="flex-row justify-between items-start mb-2">
                        <View>
                          <Text className="text-foreground font-bold text-base">{p.plan}</Text>
                          <Text className="text-muted-foreground text-xs mt-0.5">
                            ${p.amount} {p.currency}
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: s.bg,
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                          <Text style={{ fontSize: 12 }}>{s.icon}</Text>
                          <Text style={{ color: s.color, fontSize: 11, fontWeight: '700' }}>
                            {s.label}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row gap-4">
                        <Text className="text-muted-foreground text-xs">
                          📅 Fecha: {p.date}
                        </Text>
                        <Text className="text-muted-foreground text-xs">
                          ⏰ Vence: {p.dueDate}
                        </Text>
                      </View>
                      {activeRole === 'admin' && p.status === 'pending' && (
                        <View className="flex-row gap-2 mt-3">
                          <TouchableOpacity
                            onPress={() => handleValidate(p.id)}
                            style={{
                              flex: 1,
                              backgroundColor: '#0d9e6e',
                              borderRadius: 10,
                              paddingVertical: 10,
                              alignItems: 'center',
                            }}>
                            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                              Validar
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              backgroundColor: '#fee2e2',
                              borderRadius: 10,
                              paddingVertical: 10,
                              alignItems: 'center',
                            }}>
                            <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 13 }}>
                              Rechazar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </>
          )}

          {tab === 'plans' && (
            <>
              <Text className="text-foreground font-bold text-base mb-4">Planes Disponibles</Text>
              {plans.map((plan) => (
                <View
                  key={plan.id}
                  style={{
                    backgroundColor: plan.isActive ? '#7c3aed' : '#fff',
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 14,
                    borderWidth: plan.isActive ? 0 : 1,
                    borderColor: '#f1f5f9',
                    shadowColor: plan.isActive ? '#7c3aed' : '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: plan.isActive ? 0.3 : 0.06,
                    shadowRadius: 12,
                    elevation: plan.isActive ? 8 : 3,
                  }}>
                  {plan.isActive && (
                    <View
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        alignSelf: 'flex-start',
                        marginBottom: 10,
                      }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                        PLAN ACTUAL
                      </Text>
                    </View>
                  )}
                  <Text
                    style={{
                      color: plan.isActive ? '#fff' : '#1e293b',
                      fontWeight: '700',
                      fontSize: 20,
                      marginBottom: 4,
                    }}>
                    {plan.name}
                  </Text>
                  <Text
                    style={{
                      color: plan.isActive ? 'rgba(255,255,255,0.8)' : '#64748b',
                      fontSize: 13,
                      marginBottom: 12,
                    }}>
                    ${plan.price}/{plan.period === 'monthly' ? 'mes' : plan.period === 'annual' ? 'año' : 'trimestre'}
                  </Text>
                  {plan.features.map((f, i) => (
                    <View key={i} className="flex-row items-start gap-2 mb-1.5">
                      <Text
                        style={{
                          color: plan.isActive ? '#a7f3d0' : '#0d9e6e',
                          fontSize: 14,
                        }}>
                        ✓
                      </Text>
                      <Text
                        style={{
                          color: plan.isActive ? 'rgba(255,255,255,0.9)' : '#475569',
                          fontSize: 13,
                          lineHeight: 18,
                          flex: 1,
                        }}>
                        {f}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}

          {tab === 'register' && (
            <>
              <Text className="text-foreground font-bold text-base mb-6">Registrar Pago</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#f1f5f9' }}>
                <Text className="text-muted-foreground text-sm mb-2 font-medium">Plan</Text>
                <View className="bg-secondary px-4 py-4 rounded-2xl mb-4">
                  <Text className="text-foreground">Plan Premium - Mensual</Text>
                </View>

                <Text className="text-muted-foreground text-sm mb-2 font-medium">Monto (USD)</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  className="bg-secondary text-foreground px-4 py-4 rounded-2xl mb-4 text-base"
                  placeholderTextColor="#9ca3af"
                />

                <Text className="text-muted-foreground text-sm mb-2 font-medium">Método de pago</Text>
                <View className="flex-row gap-2 mb-6">
                  {['💵 Efectivo', '🏦 Transferencia', '💳 Tarjeta'].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={{
                        flex: 1,
                        backgroundColor: '#f8fafc',
                        borderRadius: 12,
                        paddingVertical: 12,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                      }}>
                      <Text style={{ fontSize: 11, color: '#475569', fontWeight: '600', textAlign: 'center' }}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleSubmitPayment}
                  disabled={submitting}
                  style={{
                    backgroundColor: '#7c3aed',
                    borderRadius: 16,
                    paddingVertical: 18,
                    alignItems: 'center',
                  }}>
                  <Text className="text-white font-bold text-base">
                    {submitting ? 'Enviando...' : 'Registrar Pago'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}
