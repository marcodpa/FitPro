import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  BookOpen,
  Dumbbell,
  CreditCard,
  User,
  Wifi,
  Shield,
  ExternalLink,
  Send,
  CheckCircle,
} from 'lucide-react-native';

const FAQS = [
  {
    category: 'Cuenta',
    icon: User,
    color: '#818cf8',
    items: [
      {
        q: '¿Cómo cambio mi contraseña?',
        a: 'Ve a Perfil → Cambiar Contraseña. Necesitarás ingresar tu contraseña actual y luego la nueva dos veces para confirmarla.',
      },
      {
        q: '¿Cómo edito mi perfil?',
        a: 'En la pestaña Perfil, toca el botón "Editar Perfil". Puedes cambiar tu nombre, bio, peso, altura y objetivo.',
      },
      {
        q: '¿Puedo tener múltiples roles?',
        a: 'No, cada cuenta tiene un rol fijo (cliente, entrenador o admin). Si quieres ser entrenador, puedes enviar una solicitud desde tu perfil.',
      },
    ],
  },
  {
    category: 'Entrenamientos',
    icon: Dumbbell,
    color: '#c8f65d',
    items: [
      {
        q: '¿Cómo inicio una sesión de entrenamiento?',
        a: 'Desde el Dashboard, toca el botón ▶ en la tarjeta de "Entrenamiento de Hoy". También puedes ir a Rutinas y seleccionar una.',
      },
      {
        q: '¿Cómo creo una rutina personalizada?',
        a: 'Ve a la pestaña Rutinas y toca el botón "+ Nueva Rutina". Solo los entrenadores y admins pueden crear rutinas para asignarlas a clientes.',
      },
      {
        q: '¿Qué es el temporizador HIIT?',
        a: 'El temporizador HIIT te permite alternar entre intervalos de trabajo y descanso con alertas sonoras. Accede desde Dashboard → Accesos Rápidos → Cronómetro.',
      },
    ],
  },
  {
    category: 'Pagos',
    icon: CreditCard,
    color: '#f59e0b',
    items: [
      {
        q: '¿Cómo registro un pago?',
        a: 'Ve a Perfil → Planes y Pagos → pestaña "Registrar". Ingresa el monto y método de pago. El administrador validará tu pago.',
      },
      {
        q: '¿Cuánto tarda en validarse un pago?',
        a: 'Normalmente entre 24 y 48 horas hábiles. Recibirás una notificación cuando tu pago sea validado o rechazado.',
      },
      {
        q: '¿Puedo subir un comprobante de pago?',
        a: 'Sí. En Historial de Pagos, los pagos pendientes muestran un botón "Subir Comprobante" donde puedes añadir un enlace al comprobante.',
      },
    ],
  },
  {
    category: 'Conexión',
    icon: Wifi,
    color: '#22c55e',
    items: [
      {
        q: '¿Qué es el Modo Sin Conexión?',
        a: 'El Modo Sin Conexión te permite ver tus rutinas y datos guardados sin internet. Los cambios se sincronizarán cuando vuelvas a conectarte.',
      },
      {
        q: '¿La app funciona en todos los dispositivos?',
        a: 'FitPro funciona en iOS, Android y web. Para la mejor experiencia recomendamos usar la app nativa en móvil.',
      },
    ],
  },
  {
    category: 'Privacidad',
    icon: Shield,
    color: '#f97316',
    items: [
      {
        q: '¿Quién puede ver mi información?',
        a: 'Tu entrenador asignado y los administradores pueden ver tu perfil y progreso. Otros usuarios solo ven tu nombre y foto pública.',
      },
      {
        q: '¿Cómo elimino mi cuenta?',
        a: 'Para eliminar tu cuenta contacta al soporte técnico vía email. El proceso tarda hasta 72 horas y es irreversible.',
      },
    ],
  },
];

const QUICK_LINKS = [
  { icon: BookOpen,  label: 'Documentación',        sub: 'Guías y tutoriales',      color: '#818cf8' },
  { icon: MessageCircle, label: 'Chat en Vivo',    sub: 'Respuesta inmediata',     color: '#22c55e' },
  { icon: Mail,      label: 'soporte@fitpro.app',   sub: 'Respuesta en 24-48h',     color: '#f59e0b' },
];

export default function SupportScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const t = useTheme();

  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const toggleFaq = (key: string) => setOpenFaq(prev => prev === key ? null : key);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
    setMessage('');
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{
        paddingTop: 56, paddingBottom: SPACING.xl,
        paddingHorizontal: SPACING.xl,
        backgroundColor: t.bg.secondary,
        borderBottomWidth: 1, borderBottomColor: t.border.subtle,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg }}>
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
            backgroundColor: t.infoDim, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: t.info + '50',
          }}>
            <HelpCircle size={22} color={t.info} strokeWidth={2} />
          </View>
          <View>
            <Text style={{ color: t.text.primary, fontSize: FONT.xxl, fontWeight: '800', letterSpacing: -0.5 }}>
              Ayuda y Soporte
            </Text>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, marginTop: 2 }}>
              Estamos aquí para ayudarte
            </Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* Quick contacts */}
        <View style={{ padding: SPACING.xl, gap: SPACING.sm }}>
          <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: SPACING.xs }}>
            Contacto rápido
          </Text>
          {QUICK_LINKS.map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.8}
              onPress={item.label === 'soporte@fitpro.app'
                ? () => Linking.openURL('mailto:soporte@fitpro.app').catch(() => {})
                : undefined}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
                backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
                padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle,
              }}>
              <View style={{
                width: 42, height: 42, borderRadius: RADIUS.md,
                backgroundColor: item.color + '18',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: item.color + '30',
              }}>
                <item.icon size={18} color={item.color} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>{item.label}</Text>
                <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>{item.sub}</Text>
              </View>
              <ExternalLink size={14} color={t.text.tertiary} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact form */}
        <View style={{ paddingHorizontal: SPACING.xl, marginBottom: SPACING.xxl }}>
          <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: SPACING.md }}>
            Enviar mensaje
          </Text>
          <View style={{
            backgroundColor: t.bg.card, borderRadius: RADIUS.xxl,
            padding: SPACING.xl, borderWidth: 1, borderColor: t.border.subtle, gap: SPACING.md,
          }}>
            {/* User info pill */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
              backgroundColor: t.bg.tertiary, borderRadius: RADIUS.lg,
              padding: SPACING.md, borderWidth: 1, borderColor: t.border.default,
            }}>
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: t.accentDim, borderWidth: 1, borderColor: t.accent,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={13} color={t.accent} strokeWidth={2.5} />
              </View>
              <Text style={{ color: t.text.secondary, fontSize: FONT.xs, fontWeight: '600' }}>
                Enviando como: <Text style={{ color: t.text.primary }}>{user?.name ?? 'Usuario'}</Text>
              </Text>
            </View>

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Describe tu problema o pregunta..."
              placeholderTextColor={t.text.tertiary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              style={{
                backgroundColor: t.bg.input,
                color: t.text.primary,
                borderRadius: RADIUS.lg,
                padding: SPACING.lg,
                fontSize: FONT.base,
                borderWidth: 1.5,
                borderColor: message.length > 0 ? t.info + '80' : t.border.default,
                minHeight: 110,
                lineHeight: 22,
              }}
            />
            <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, alignSelf: 'flex-end' }}>
              {message.length}/500
            </Text>

            <TouchableOpacity
              onPress={handleSend}
              disabled={sending || !message.trim()}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
                backgroundColor: message.trim() ? t.info : t.bg.tertiary,
                borderRadius: RADIUS.xl, paddingVertical: 14,
                opacity: sending ? 0.7 : 1,
                borderWidth: 1,
                borderColor: message.trim() ? t.info : t.border.default,
              }}>
              {sent
                ? <><CheckCircle size={16} color="#fff" strokeWidth={2.5} /><Text style={{ color: '#fff', fontWeight: '700', fontSize: FONT.base }}>Mensaje enviado</Text></>
                : <><Send size={15} color={message.trim() ? '#fff' : t.text.tertiary} strokeWidth={2.5} /><Text style={{ color: message.trim() ? '#fff' : t.text.tertiary, fontWeight: '700', fontSize: FONT.base }}>Enviar mensaje</Text></>
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={{ paddingHorizontal: SPACING.xl }}>
          <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: SPACING.lg }}>
            Preguntas frecuentes
          </Text>

          {FAQS.map((section) => (
            <View key={section.category} style={{ marginBottom: SPACING.xl }}>
              {/* Category header */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
                marginBottom: SPACING.md,
              }}>
                <View style={{
                  width: 28, height: 28, borderRadius: RADIUS.sm,
                  backgroundColor: section.color + '18', alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderColor: section.color + '30',
                }}>
                  <section.icon size={13} color={section.color} strokeWidth={2.5} />
                </View>
                <Text style={{ color: section.color, fontWeight: '700', fontSize: FONT.sm, letterSpacing: 0.3 }}>
                  {section.category}
                </Text>
              </View>

              {/* FAQ items */}
              <View style={{
                backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
                overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle,
              }}>
                {section.items.map((item, idx) => {
                  const key = `${section.category}-${idx}`;
                  const isOpen = openFaq === key;
                  return (
                    <View
                      key={key}
                      style={{
                        borderBottomWidth: idx < section.items.length - 1 ? 1 : 0,
                        borderBottomColor: t.border.subtle,
                      }}>
                      <TouchableOpacity
                        onPress={() => toggleFaq(key)}
                        activeOpacity={0.8}
                        style={{
                          flexDirection: 'row', alignItems: 'center',
                          paddingHorizontal: SPACING.lg, paddingVertical: 15, gap: SPACING.md,
                        }}>
                        <View style={{
                          width: 24, height: 24, borderRadius: RADIUS.sm,
                          backgroundColor: isOpen ? section.color + '18' : t.bg.tertiary,
                          alignItems: 'center', justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: isOpen ? section.color + '30' : t.border.default,
                        }}>
                          <HelpCircle size={12} color={isOpen ? section.color : t.text.tertiary} strokeWidth={2.5} />
                        </View>
                        <Text style={{
                          flex: 1,
                          color: isOpen ? t.text.primary : t.text.secondary,
                          fontSize: FONT.sm, fontWeight: isOpen ? '700' : '500',
                          lineHeight: 19,
                        }}>
                          {item.q}
                        </Text>
                        {isOpen
                          ? <ChevronUp size={15} color={section.color} strokeWidth={2.5} />
                          : <ChevronDown size={15} color={t.text.tertiary} strokeWidth={2} />}
                      </TouchableOpacity>
                      {isOpen && (
                        <View style={{
                          paddingHorizontal: SPACING.lg,
                          paddingBottom: SPACING.lg,
                          paddingLeft: SPACING.lg + 24 + SPACING.md,
                        }}>
                          <View style={{
                            backgroundColor: section.color + '08',
                            borderRadius: RADIUS.lg,
                            padding: SPACING.md,
                            borderLeftWidth: 3,
                            borderLeftColor: section.color + '60',
                          }}>
                            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, lineHeight: 20 }}>
                              {item.a}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={{ paddingHorizontal: SPACING.xl, marginTop: SPACING.sm }}>
          <View style={{
            backgroundColor: t.bg.card, borderRadius: RADIUS.xl,
            padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle,
            alignItems: 'center', gap: SPACING.sm,
          }}>
            <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, fontWeight: '600' }}>
              FitPro v1.0.0
            </Text>
            <Text style={{ color: t.text.tertiary, fontSize: FONT.xs }}>
              © 2026 FitPro. Todos los derechos reservados.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
