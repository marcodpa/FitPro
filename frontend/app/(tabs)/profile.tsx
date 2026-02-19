import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, useTheme } from '@/lib/store';
import type { UserRole } from '@/lib/types';
import {
  Pencil,
  Moon,
  WifiOff,
  Mic,
  CalendarDays,
  CreditCard,
  BookOpen,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Dumbbell,
  ShieldCheck,
  Users,
  User,
  Zap,
} from 'lucide-react-native';
import { FONT, RADIUS, SPACING } from '@/lib/theme';

const ROLE_OPTIONS: { label: string; value: UserRole; color: string }[] = [
  { label: 'Cliente',     value: 'client',  color: '#22c55e' },
  { label: 'Entrenador',  value: 'trainer', color: '#818cf8' },
  { label: 'Admin',       value: 'admin',   color: '#f59e0b' },
  { label: 'Usuario',     value: 'user',    color: '#64748b' },
];

function SectionHeader({ title }: { title: string }) {
  const t = useTheme();
  return (
    <Text
      style={{
        color: t.text.tertiary,
        fontSize: FONT.xs,
        fontWeight: '700',
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        marginTop: SPACING.xxl,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.xxl,
      }}>
      {title}
    </Text>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const t = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        paddingVertical: 15,
        backgroundColor: t.bg.card,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.border.subtle,
      }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: RADIUS.md,
          backgroundColor: t.bg.tertiary,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {icon}
      </View>
      <Text style={{ flex: 1, color: t.text.primary, fontSize: FONT.base, fontWeight: '500' }}>
        {label}
      </Text>
      <ChevronRight size={15} color={t.text.tertiary} />
    </TouchableOpacity>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onToggle,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        paddingVertical: 15,
        backgroundColor: t.bg.card,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.border.subtle,
      }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: RADIUS.md,
          backgroundColor: t.bg.tertiary,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {icon}
      </View>
      <Text style={{ flex: 1, color: t.text.primary, fontSize: FONT.base, fontWeight: '500' }}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: t.border.strong, true: t.accent }}
        thumbColor={value ? t.accentText : t.text.secondary}
      />
    </View>
  );
}

export default function ProfileTab() {
  const {
    user,
    logout,
    activeRole,
    setRole,
    isDarkMode,
    toggleDarkMode,
    isOffline,
    toggleOffline,
    voiceEnabled,
    toggleVoice,
  } = useAppStore();
  const t = useTheme();
  const router = useRouter();
  const [showVoiceSheet, setShowVoiceSheet] = useState(false);

  const handleLogout = () => {
    Alert.alert('Cerrar Sesion', 'Estas seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  return (
    <>
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg.primary }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Hero Header */}
      <View
        style={{
          backgroundColor: t.bg.secondary,
          paddingTop: 60,
          paddingBottom: SPACING.xxl,
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: t.border.subtle,
        }}>
        {/* Avatar */}
        <View style={{ position: 'relative', marginBottom: SPACING.lg }}>
          <Image
            source={{ uri: user?.avatar }}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: t.bg.tertiary,
              borderWidth: 3,
              borderColor: t.accent,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: t.success,
              borderWidth: 2,
              borderColor: t.bg.secondary,
            }}
          />
        </View>

        <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xxl, letterSpacing: -0.3 }}>
          {user?.name}
        </Text>
        <Text style={{ color: t.text.secondary, fontSize: FONT.sm, marginTop: 3 }}>
          {user?.email}
        </Text>

        {/* Role chip */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: t.accentDim,
            borderRadius: RADIUS.full,
            paddingHorizontal: SPACING.lg,
            paddingVertical: 6,
            marginTop: SPACING.md,
            borderWidth: 1,
            borderColor: t.accent,
          }}>
          <Zap size={11} color={t.text.accent} fill={t.text.accent} />
          <Text style={{ color: t.text.accent, fontWeight: '700', fontSize: FONT.xs, textTransform: 'capitalize', letterSpacing: 0.5 }}>
            {activeRole}
          </Text>
        </View>
      </View>

      {/* Stats row */}
      <View
        style={{
          flexDirection: 'row',
          gap: 1,
          backgroundColor: t.border.subtle,
          borderBottomWidth: 1,
          borderBottomColor: t.border.subtle,
        }}>
        {[
          { label: 'Sesiones', value: '14', icon: <Dumbbell size={16} color={t.text.accent} /> },
          { label: 'Rutinas',  value: '4',  icon: <BookOpen  size={16} color={t.info} /> },
          { label: 'Seguidores', value: '28', icon: <Users size={16} color={t.success} /> },
        ].map((s) => (
          <View
            key={s.label}
            style={{
              flex: 1,
              backgroundColor: t.bg.secondary,
              paddingVertical: SPACING.lg,
              alignItems: 'center',
              gap: 4,
            }}>
            {s.icon}
            <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.xl }}>
              {s.value}
            </Text>
            <Text style={{ color: t.text.secondary, fontSize: FONT.xs }}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Edit profile */}
      <View style={{ paddingHorizontal: SPACING.xxl, paddingTop: SPACING.xl }}>
        <TouchableOpacity
          onPress={() => router.push('/profile/edit' as any)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.lg,
            backgroundColor: t.accentDim,
            borderRadius: RADIUS.xl,
            padding: SPACING.lg,
            borderWidth: 1,
            borderColor: t.accent,
          }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: RADIUS.lg,
              backgroundColor: t.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Pencil size={18} color={t.accentText} strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
              Editar Perfil
            </Text>
            <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>
              Nombre, bio, peso, altura, objetivo
            </Text>
          </View>
          <ChevronRight size={16} color={t.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Personal info */}
      <SectionHeader title="Informacion personal" />
      <View
        style={{
          marginHorizontal: SPACING.xxl,
          backgroundColor: t.bg.card,
          borderRadius: RADIUS.xl,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: t.border.subtle,
        }}>
        {[
          { label: 'Objetivo',       value: user?.goal },
          { label: 'Peso',           value: `${user?.weight ?? '—'} kg` },
          { label: 'Altura',         value: `${user?.height ?? '—'} cm` },
          { label: 'Miembro desde',  value: user?.joinedAt },
        ].map((info, i, arr) => (
          <View
            key={info.label}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: SPACING.lg,
              paddingVertical: 13,
              borderBottomWidth: i < arr.length - 1 ? 1 : 0,
              borderBottomColor: t.border.subtle,
            }}>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm }}>{info.label}</Text>
            <Text style={{ color: t.text.primary, fontSize: FONT.sm, fontWeight: '600' }}>
              {info.value ?? '—'}
            </Text>
          </View>
        ))}
      </View>

      {/* Settings */}
      <SectionHeader title="Configuracion" />
      <View
        style={{
          marginHorizontal: SPACING.xxl,
          backgroundColor: t.bg.card,
          borderRadius: RADIUS.xl,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: t.border.subtle,
        }}>
          <ToggleRow
            icon={<Moon size={17} color={t.info} />}
            label="Modo Oscuro"
            value={isDarkMode}
            onToggle={toggleDarkMode}
          />
          <ToggleRow
            icon={<WifiOff size={17} color={t.warning} />}
            label="Modo Offline"
            value={isOffline}
            onToggle={toggleOffline}
          />
          {/* Voice commands toggle + info */}
          <View
            style={{
              backgroundColor: t.bg.card,
              borderTopWidth: 1,
              borderTopColor: t.border.subtle,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: SPACING.lg,
                paddingHorizontal: SPACING.lg,
                paddingVertical: 15,
              }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: RADIUS.md,
                  backgroundColor: voiceEnabled ? 'rgba(200,246,93,0.12)' : t.bg.tertiary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: voiceEnabled ? 1 : 0,
                  borderColor: voiceEnabled ? t.accent : 'transparent',
                }}>
                <Mic size={17} color={voiceEnabled ? t.accent : t.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text.primary, fontSize: FONT.base, fontWeight: '500' }}>
                  Comandos de Voz
                </Text>
                {voiceEnabled && (
                  <TouchableOpacity onPress={() => setShowVoiceSheet(true)}>
                    <Text style={{ color: t.text.accent, fontSize: FONT.xs, marginTop: 2, fontWeight: '600' }}>
                      Ver comandos disponibles
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <Switch
                value={voiceEnabled}
                onValueChange={toggleVoice}
                trackColor={{ false: t.border.strong, true: t.accent }}
                thumbColor={voiceEnabled ? t.accentText : t.text.secondary}
              />
            </View>
            {voiceEnabled && (
              <View
                style={{
                  marginHorizontal: SPACING.lg,
                  marginBottom: SPACING.lg,
                  backgroundColor: 'rgba(200,246,93,0.06)',
                  borderRadius: RADIUS.lg,
                  padding: SPACING.md,
                  borderWidth: 1,
                  borderColor: 'rgba(200,246,93,0.2)',
                }}>
                <Text style={{ color: t.text.accent, fontSize: FONT.xs, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 }}>
                  MICROFONO ACTIVO
                </Text>
                <Text style={{ color: t.text.secondary, fontSize: FONT.xs, lineHeight: 16 }}>
                  Di "ir a rutinas", "modo oscuro", "empezar entrenamiento" y mas. El icono del microfono aparece en pantalla.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

        {/* Voice Commands Sheet Modal */}
        <Modal
          visible={showVoiceSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowVoiceSheet(false)}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
            activeOpacity={1}
            onPress={() => setShowVoiceSheet(false)}>
            <View style={{ flex: 1 }} />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: t.bg.secondary,
              borderTopLeftRadius: RADIUS.xxl,
              borderTopRightRadius: RADIUS.xxl,
              padding: SPACING.xxl,
              paddingBottom: 40,
              borderTopWidth: 1,
              borderTopColor: t.border.subtle,
            }}>
            {/* Handle */}
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: t.border.strong,
                alignSelf: 'center',
                marginBottom: SPACING.xl,
              }}
            />
            <Text
              style={{
                color: t.text.primary,
                fontSize: FONT.lg,
                fontWeight: '800',
                letterSpacing: -0.3,
                marginBottom: 4,
              }}>
              Comandos de Voz
            </Text>
            <Text style={{ color: t.text.secondary, fontSize: FONT.sm, marginBottom: SPACING.xl }}>
              Habla claramente en espanol. El microfono escucha continuamente.
            </Text>
            {[
              { group: 'Navegacion', items: ['"ir a inicio"', '"ir a rutinas"', '"ir a social"', '"ir a chat"', '"ir a perfil"'] },
              { group: 'Entrenamiento', items: ['"empezar entrenamiento"', '"iniciar sesion"', '"entrenar"'] },
              { group: 'Ajustes', items: ['"modo oscuro"', '"modo claro"', '"cerrar sesion"'] },
            ].map((section) => (
              <View key={section.group} style={{ marginBottom: SPACING.xl }}>
                <Text
                  style={{
                    color: t.text.accent,
                    fontSize: FONT.xs,
                    fontWeight: '700',
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    marginBottom: SPACING.md,
                  }}>
                  {section.group}
                </Text>
                <View
                  style={{
                    backgroundColor: t.bg.card,
                    borderRadius: RADIUS.xl,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: t.border.subtle,
                  }}>
                  {section.items.map((cmd, i) => (
                    <View
                      key={cmd}
                      style={{
                        paddingHorizontal: SPACING.lg,
                        paddingVertical: 12,
                        borderBottomWidth: i < section.items.length - 1 ? 1 : 0,
                        borderBottomColor: t.border.subtle,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: SPACING.md,
                      }}>
                      <Mic size={13} color={t.accent} />
                      <Text style={{ color: t.text.primary, fontSize: FONT.sm, fontWeight: '500' }}>
                        {cmd}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => setShowVoiceSheet(false)}
              style={{
                backgroundColor: t.accent,
                borderRadius: RADIUS.xl,
                paddingVertical: SPACING.lg,
                alignItems: 'center',
              }}>
              <Text style={{ color: t.accentText, fontWeight: '800', fontSize: FONT.base }}>
                Entendido
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

      {/* Role switcher */}
      <SectionHeader title="Cambiar Rol (Demo)" />
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: SPACING.sm,
          paddingHorizontal: SPACING.xxl,
        }}>
        {ROLE_OPTIONS.map((r) => {
          const isActive = activeRole === r.value;
          return (
            <TouchableOpacity
              key={r.value}
              onPress={() => setRole(r.value)}
              style={{
                paddingHorizontal: SPACING.lg,
                paddingVertical: SPACING.md,
                borderRadius: RADIUS.lg,
                backgroundColor: isActive ? r.color : t.bg.card,
                borderWidth: 1,
                borderColor: isActive ? r.color : t.border.default,
              }}>
              <Text
                style={{
                  color: isActive ? '#fff' : t.text.secondary,
                  fontWeight: '700',
                  fontSize: FONT.sm,
                }}>
                {r.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* More options */}
      <SectionHeader title="Mas opciones" />
      <View
        style={{
          marginHorizontal: SPACING.xxl,
          backgroundColor: t.bg.card,
          borderRadius: RADIUS.xl,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: t.border.subtle,
        }}>
        <MenuRow icon={<CalendarDays size={17} color={t.info}    />} label="Calendario"           onPress={() => router.push('/calendar' as any)} />
        <MenuRow icon={<CreditCard   size={17} color={t.success} />} label="Planes y Pagos"       onPress={() => router.push('/payments' as any)} />
        <MenuRow icon={<BookOpen     size={17} color={t.warning}  />} label="Biblioteca Ejercicios" onPress={() => router.push('/exercises' as any)} />
        <MenuRow icon={<Lock         size={17} color={t.text.secondary} />} label="Privacidad" />
        <MenuRow icon={<HelpCircle   size={17} color={t.text.secondary} />} label="Ayuda y Soporte" last />
      </View>

      {/* Logout */}
      <View style={{ paddingHorizontal: SPACING.xxl, paddingTop: SPACING.xl, paddingBottom: 48 }}>
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: SPACING.md,
            backgroundColor: t.dangerDim,
            borderRadius: RADIUS.xl,
            paddingVertical: SPACING.lg,
            borderWidth: 1,
            borderColor: t.danger,
          }}>
          <LogOut size={17} color={t.danger} />
          <Text style={{ color: t.danger, fontWeight: '700', fontSize: FONT.base }}>
            Cerrar Sesion
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
