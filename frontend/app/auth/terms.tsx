import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/lib/store';
import { FONT, RADIUS, SPACING } from '@/lib/theme';
import { ChevronLeft, Shield, FileText } from 'lucide-react-native';

const SECTIONS_TERMINOS = [
  {
    title: '1. Aceptación de los Términos',
    body: 'Al acceder y utilizar FitPro, aceptas quedar vinculado por estos Términos y Condiciones de uso. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.',
  },
  {
    title: '2. Uso del Servicio',
    body: 'FitPro es una plataforma de gestión de entrenamientos personales. Te comprometes a utilizar el servicio únicamente para fines lícitos y de acuerdo con estos términos. Queda prohibido el uso del servicio para actividades ilegales, fraudulentas o que perjudiquen a otros usuarios.',
  },
  {
    title: '3. Cuentas de Usuario',
    body: 'Para acceder a ciertas funciones debes crear una cuenta. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. Debes notificarnos inmediatamente cualquier uso no autorizado de tu cuenta.',
  },
  {
    title: '4. Contenido del Usuario',
    body: 'Al publicar contenido en FitPro (posts, comentarios, imágenes), otorgas a FitPro una licencia no exclusiva para usar, reproducir y mostrar dicho contenido. Eres el único responsable del contenido que publiques.',
  },
  {
    title: '5. Salud y Seguridad',
    body: 'FitPro no es un sustituto del asesoramiento médico profesional. Antes de comenzar cualquier programa de ejercicios, consulta con un médico. FitPro no se responsabiliza por lesiones o daños derivados del uso de los entrenamientos de la plataforma.',
  },
  {
    title: '6. Pagos y Suscripciones',
    body: 'Algunos servicios de FitPro requieren pago. Al suscribirte, aceptas pagar las tarifas correspondientes. Los pagos no son reembolsables salvo que la ley aplicable disponga lo contrario. Nos reservamos el derecho de modificar los precios con previo aviso.',
  },
  {
    title: '7. Propiedad Intelectual',
    body: 'El servicio y su contenido original, características y funcionalidad son propiedad exclusiva de FitPro y están protegidos por leyes de derechos de autor, marcas registradas y otras leyes de propiedad intelectual.',
  },
  {
    title: '8. Limitación de Responsabilidad',
    body: 'FitPro no será responsable de daños indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de usar el servicio. Nuestra responsabilidad total no excederá el monto pagado por ti en los últimos 12 meses.',
  },
  {
    title: '9. Modificaciones',
    body: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos los cambios significativos por correo electrónico o mediante un aviso prominente en la app. El uso continuado del servicio tras los cambios constituye aceptación de los nuevos términos.',
  },
  {
    title: '10. Contacto',
    body: 'Si tienes preguntas sobre estos Términos y Condiciones, contáctanos en: legal@fitpro.com',
  },
];

const SECTIONS_PRIVACIDAD = [
  {
    title: '1. Información que Recopilamos',
    body: 'Recopilamos información que nos proporcionas directamente: nombre, correo electrónico, datos físicos (peso, altura), objetivos de fitness y datos de entrenamientos. También recopilamos automáticamente datos de uso, tipo de dispositivo y dirección IP.',
  },
  {
    title: '2. Uso de la Información',
    body: 'Utilizamos tu información para: proveer y mejorar el servicio, personalizar tu experiencia, enviar notificaciones relevantes, procesar pagos, comunicarnos contigo y cumplir obligaciones legales.',
  },
  {
    title: '3. Compartir Información',
    body: 'No vendemos tu información personal a terceros. Podemos compartirla con: entrenadores asignados a tu cuenta, proveedores de servicios que nos ayudan a operar la plataforma, y autoridades cuando sea requerido por ley.',
  },
  {
    title: '4. Seguridad',
    body: 'Implementamos medidas técnicas y organizativas apropiadas para proteger tu información contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por Internet es 100% seguro.',
  },
  {
    title: '5. Tus Derechos',
    body: 'Tienes derecho a: acceder a tu información personal, corregir datos incorrectos, solicitar la eliminación de tus datos, oponerte al procesamiento de tus datos, y portabilidad de los datos. Para ejercer estos derechos contáctanos en: privacidad@fitpro.com',
  },
  {
    title: '6. Cookies y Tecnologías Similares',
    body: 'Utilizamos cookies y tecnologías similares para mejorar la experiencia de usuario, analizar el uso del servicio y personalizar contenido. Puedes controlar el uso de cookies desde la configuración de tu navegador.',
  },
  {
    title: '7. Retención de Datos',
    body: 'Conservamos tu información mientras tu cuenta esté activa o sea necesaria para proveer el servicio. Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento desde la sección de Perfil.',
  },
  {
    title: '8. Cambios a esta Política',
    body: 'Podemos actualizar esta política periódicamente. Te notificaremos cambios significativos por correo electrónico. La fecha de última actualización aparece al final de esta página.',
  },
];

export default function TermsScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const t = useTheme();
  const isPrivacy = type === 'privacy';

  const sections = isPrivacy ? SECTIONS_PRIVACIDAD : SECTIONS_TERMINOS;
  const title    = isPrivacy ? 'Política de Privacidad' : 'Términos y Condiciones';
  const subtitle = isPrivacy ? 'Última actualización: Marzo 2026' : 'Versión 1.0 — Marzo 2026';
  const Icon     = isPrivacy ? Shield : FileText;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary }}>
      {/* Header */}
      <View style={{ backgroundColor: t.bg.primary, paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.xxl, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ gap: 4, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <View style={{ width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={t.accent} strokeWidth={2} />
              </View>
              <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '500' }}>FitPro</Text>
            </View>
            <Text style={{ color: t.text.primary, fontSize: 26, fontWeight: '800', letterSpacing: -0.8, lineHeight: 32 }}>
              {title}
            </Text>
            <Text style={{ color: t.text.tertiary, fontSize: FONT.sm, marginTop: 2 }}>{subtitle}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 6, width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: t.bg.card, borderWidth: 1, borderColor: t.border.default, alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={20} color={t.text.secondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.xxl, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Intro box */}
        <View style={{ backgroundColor: t.accentDim, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.accent + '30', marginBottom: SPACING.xxl }}>
          <Text style={{ color: t.text.secondary, fontSize: FONT.sm, lineHeight: 22 }}>
            {isPrivacy
              ? 'En FitPro nos tomamos muy en serio tu privacidad. Este documento explica cómo recopilamos, usamos y protegemos tu información personal.'
              : 'Por favor lee estos términos detenidamente antes de usar FitPro. Al usar nuestra app, aceptas quedar vinculado por estos términos.'}
          </Text>
        </View>

        {/* Sections */}
        <View style={{ gap: 16 }}>
          {sections.map((s, i) => (
            <View
              key={i}
              style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: t.border.subtle }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <View style={{ width: 28, height: 28, borderRadius: RADIUS.sm, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Text style={{ color: t.accent, fontSize: 11, fontWeight: '800' }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, color: t.text.primary, fontWeight: '700', fontSize: FONT.base, letterSpacing: -0.2 }}>
                  {s.title.replace(/^\d+\.\s*/, '')}
                </Text>
              </View>
              <Text style={{ color: t.text.secondary, fontSize: FONT.sm, lineHeight: 22 }}>
                {s.body}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={{ marginTop: 32, padding: SPACING.lg, alignItems: 'center', gap: 8 }}>
          <Text style={{ color: t.text.tertiary, fontSize: 12, textAlign: 'center' }}>
            © 2026 FitPro. Todos los derechos reservados.
          </Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={{ color: t.accent, fontSize: FONT.sm, fontWeight: '700' }}>← Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
