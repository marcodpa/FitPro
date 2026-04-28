import React, { useState, useEffect } from 'react';
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
import { FakeUserService } from '@/lib/services';
import { FakeWorkoutService, FakeRoutineService } from '@/lib/services';
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
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
} from 'lucide-react-native';
import { FONT, RADIUS, SPACING } from '@/lib/theme';


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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [trainerRequestStatus, setTrainerRequestStatus] = useState<'none' | 'pending' | 'sent'>('none');
  const [pendingRequests, setPendingRequests] = useState<import('@/lib/types').User[]>([]);
  const [trainerInfo, setTrainerInfo] = useState<import('@/lib/types').User | null>(null);
  const [stats, setStats] = useState({ sessions: 0, routines: 0, followers: 0 });

  // Load stats
  useEffect(() => {
    if (!user) return;
    FakeUserService.getStats()
      .then(s => setStats({ sessions: s.sessions, routines: s.routines, followers: s.followers }))
      .catch(() => {});
  }, [user]);

  // Load assigned trainer for client
  useEffect(() => {
    if (activeRole !== 'client' || !user?.trainerId) return;
    FakeUserService.getById(user.trainerId).then(setTrainerInfo).catch(() => {});
  }, [user, activeRole]);

  // Load pending trainer requests for admin
  useEffect(() => {
    if (activeRole !== 'admin') return;
    FakeUserService.getPendingTrainers().then(setPendingRequests).catch(() => {});
  }, [activeRole]);

  // Set trainer request status from user data
  useEffect(() => {
    if (user?.trainerRequestPending) setTrainerRequestStatus('sent');
  }, [user]);

  const handleApproveRequest = async (id: string) => {
    try {
      await FakeUserService.approveTrainer(id);
    } catch {}
    setPendingRequests((r) => r.filter((x) => x.id !== id));
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await FakeUserService.rejectTrainer(id);
    } catch {}
    setPendingRequests((r) => r.filter((x) => x.id !== id));
  };

  const handleTrainerRequest = async () => {
    try {
      await FakeUserService.requestTrainer();
    } catch {}
    setTrainerRequestStatus('sent');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    router.replace('/auth/login');
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
          { label: 'Sesiones',   value: String(stats.sessions),  icon: <Dumbbell size={16} color={t.text.accent} /> },
          { label: 'Rutinas',    value: String(stats.routines),   icon: <BookOpen  size={16} color={t.info} /> },
          { label: 'Seguidores', value: String(stats.followers),  icon: <Users size={16} color={t.success} /> },
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
      <SectionHeader title="Información personal" />
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
      <SectionHeader title="Configuración" />
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
            label="Modo sin conexión"
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
                  MICRÓFONO ACTIVO
                </Text>
                <Text style={{ color: t.text.secondary, fontSize: FONT.xs, lineHeight: 16 }}>
                  Di "ir a rutinas", "modo oscuro", "empezar entrenamiento" y mas. El icono del microfono aparece en pantalla.
                </Text>
              </View>
            )}
          </View>
          <MenuRow icon={<CalendarDays size={17} color={t.info}    />} label="Calendario"               onPress={() => router.push('/calendar' as any)} />
          <MenuRow icon={<CreditCard   size={17} color={t.success} />} label="Planes y Pagos"           onPress={() => router.push('/payments' as any)} />
          <MenuRow icon={<BookOpen     size={17} color={t.warning}  />} label="Biblioteca Ejercicios"   onPress={() => router.push('/exercises' as any)} />
          <MenuRow icon={<Zap          size={17} color="#f97316"    />} label="Historial Entrenamientos" onPress={() => router.push('/workout/history' as any)} />
          <MenuRow icon={<Bell         size={17} color="#22c55e"    />} label="Nutrición"                onPress={() => router.push('/nutrition' as any)} />
          <MenuRow icon={<User         size={17} color="#6366f1"    />} label="Gráficas de Progreso"     onPress={() => router.push('/progress' as any)} />
          <MenuRow icon={<ShieldCheck  size={17} color={t.info}     />} label="Medidas Corporales"       onPress={() => router.push('/measurements' as any)} />
          <MenuRow icon={<Lock         size={17} color="#818cf8"    />} label="Cambiar Contraseña"       onPress={() => router.push('/profile/change-password' as any)} />
          <MenuRow icon={<HelpCircle   size={17} color={t.text.secondary} />} label="Ayuda y Soporte" last />
        </View>

        {/* Mi Entrenador — only shown to clients that have one assigned */}
        {(activeRole === 'client' || activeRole === 'user') && trainerInfo && (
          <>
            <SectionHeader title="Mi Entrenador" />
            <View style={{ paddingHorizontal: SPACING.xxl }}>
              <TouchableOpacity
                onPress={() => router.push(`/profile/user/${trainerInfo.id}` as any)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.lg,
                  flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
                  borderWidth: 1, borderColor: t.border.subtle,
                }}>
                <Image
                  source={{ uri: trainerInfo.avatar }}
                  style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: t.bg.tertiary, borderWidth: 2, borderColor: t.success }}
                />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.base }}>{trainerInfo.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.success }} />
                    <Text style={{ color: t.success, fontSize: FONT.xs, fontWeight: '600' }}>Entrenador activo</Text>
                  </View>
                  {trainerInfo.bio ? (
                    <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, marginTop: 1 }} numberOfLines={1}>{trainerInfo.bio}</Text>
                  ) : null}
                </View>
                <View style={{ gap: SPACING.sm }}>
                  <TouchableOpacity
                    onPress={() => router.push('/chat' as any)}
                    style={{ width: 34, height: 34, borderRadius: RADIUS.md, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.accent }}>
                    <Send size={14} color={t.accent} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Alert.alert('Cambiar Entrenador', '¿Deseas cambiar o cancelar tu suscripción con este entrenador?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Cambiar', onPress: async () => { try { await FakeUserService.changeTrainer('cancel'); setTrainerInfo(null); } catch {} } },
                ])}
                style={{ marginTop: SPACING.sm, alignItems: 'center', paddingVertical: 10 }}>
                <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, fontWeight: '600' }}>Cambiar o cancelar entrenador</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Trainer request — only shown to clients */}
        {(activeRole === 'client' || activeRole === 'user') && (
          <>
            <SectionHeader title="Conviértete en Entrenador" />
            <View style={{ paddingHorizontal: SPACING.xxl }}>
              {trainerRequestStatus === 'sent' ? (
                /* Sent state */
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.lg,
                    backgroundColor: 'rgba(251,191,36,0.08)',
                    borderRadius: RADIUS.xl,
                    padding: SPACING.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(251,191,36,0.3)',
                  }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: RADIUS.lg,
                      backgroundColor: 'rgba(251,191,36,0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Clock size={20} color="#fbbf24" strokeWidth={2.5} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
                      Solicitud enviada
                    </Text>
                    <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>
                      En revisión · Te notificaremos pronto
                    </Text>
                  </View>
                  <CheckCircle size={18} color="#fbbf24" strokeWidth={2} />
                </View>
              ) : (
                /* CTA state */
                <TouchableOpacity
                  onPress={handleTrainerRequest}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.lg,
                    backgroundColor: 'rgba(129,140,248,0.08)',
                    borderRadius: RADIUS.xl,
                    padding: SPACING.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(129,140,248,0.3)',
                  }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: RADIUS.lg,
                      backgroundColor: 'rgba(129,140,248,0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Dumbbell size={20} color="#818cf8" strokeWidth={2.5} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>
                      Solicitar ser Entrenador
                    </Text>
                    <Text style={{ color: t.text.secondary, fontSize: FONT.xs, marginTop: 2 }}>
                      Crea rutinas y acompaña a tus clientes
                    </Text>
                  </View>
                  <Send size={16} color="#818cf8" strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* Admin: trainer requests panel */}
        {activeRole === 'admin' && (
          <>
            <SectionHeader title="Solicitudes de Entrenador" />
            <View style={{ paddingHorizontal: SPACING.xxl }}>
              {pendingRequests.length === 0 ? (
                <View style={{
                  backgroundColor: t.bg.card, borderRadius: RADIUS.xl, padding: SPACING.xl,
                  alignItems: 'center', gap: SPACING.sm, borderWidth: 1, borderColor: t.border.subtle,
                }}>
                  <CheckCircle size={28} color={t.success} strokeWidth={1.8} />
                  <Text style={{ color: t.text.secondary, fontSize: FONT.sm, fontWeight: '600' }}>
                    Sin solicitudes pendientes
                  </Text>
                </View>
              ) : (
                <View style={{ backgroundColor: t.bg.card, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: t.border.subtle }}>
                  {/* Badge header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: t.border.subtle }}>
                    <Bell size={15} color={t.warning} strokeWidth={2.5} />
                    <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.sm, flex: 1 }}>
                      Solicitudes pendientes
                    </Text>
                    <View style={{ backgroundColor: t.warning + '20', borderRadius: RADIUS.full, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: t.warning + '40' }}>
                      <Text style={{ color: t.warning, fontWeight: '800', fontSize: FONT.xs }}>{pendingRequests.length}</Text>
                    </View>
                  </View>

                  {pendingRequests.map((req, i) => (
                    <View
                      key={req.id}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
                        padding: SPACING.lg,
                        borderBottomWidth: i < pendingRequests.length - 1 ? 1 : 0,
                        borderBottomColor: t.border.subtle,
                      }}>
                      <Image
                        source={{ uri: req.avatar }}
                        style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.bg.tertiary }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.sm }}>{req.name}</Text>
                        <Text style={{ color: t.text.tertiary, fontSize: FONT.xs, marginTop: 1 }}>{req.email}</Text>
                        <Text style={{ color: t.text.tertiary, fontSize: 10, marginTop: 1 }}>{req.joinedAt}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                        <TouchableOpacity
                          onPress={() => handleApproveRequest(req.id)}
                          style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: t.success + '15', borderWidth: 1, borderColor: t.success + '40', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle size={17} color={t.success} strokeWidth={2.5} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRejectRequest(req.id)}
                          style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: t.danger + '15', borderWidth: 1, borderColor: t.danger + '40', alignItems: 'center', justifyContent: 'center' }}>
                          <XCircle size={17} color={t.danger} strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* Logout */}
        <View style={{ paddingHorizontal: SPACING.xxl, paddingTop: SPACING.xl }}>
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
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout confirmation modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl }}
          activeOpacity={1}
          onPress={() => setShowLogoutConfirm(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={{
              backgroundColor: t.bg.secondary,
              borderRadius: RADIUS.xxl,
              padding: SPACING.xxl,
              width: '100%',
              maxWidth: 340,
              borderWidth: 1,
              borderColor: t.border.subtle,
              gap: SPACING.xl,
            }}>
            <View style={{ alignItems: 'center', gap: SPACING.md }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: t.dangerDim, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.danger }}>
                <LogOut size={22} color={t.danger} />
              </View>
              <Text style={{ color: t.text.primary, fontWeight: '800', fontSize: FONT.lg, textAlign: 'center' }}>
                Cerrar Sesión
              </Text>
              <Text style={{ color: t.text.secondary, fontSize: FONT.sm, textAlign: 'center' }}>
                ¿Estás seguro que quieres salir?
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
              <TouchableOpacity
                onPress={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, paddingVertical: SPACING.lg, borderRadius: RADIUS.xl, backgroundColor: t.bg.tertiary, alignItems: 'center', borderWidth: 1, borderColor: t.border.subtle }}>
                <Text style={{ color: t.text.primary, fontWeight: '700', fontSize: FONT.base }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmLogout}
                style={{ flex: 1, paddingVertical: SPACING.lg, borderRadius: RADIUS.xl, backgroundColor: t.danger, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: FONT.base }}>Salir</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Voice Commands Sheet Modal — outside ScrollView, inside fragment */}
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
            { group: 'Navegación', items: ['"ir a inicio"', '"ir a rutinas"', '"ir a social"', '"ir a chat"', '"ir a perfil"'] },
            { group: 'Entrenamiento', items: ['"empezar entrenamiento"', '"iniciar sesión"', '"entrenar"'] },
            { group: 'Ajustes', items: ['"modo oscuro"', '"modo claro"', '"cerrar sesión"'] },
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
    </>
  );
}
