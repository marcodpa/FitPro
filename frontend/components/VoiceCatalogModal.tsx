/**
 * VoiceCatalogModal
 * -----------------
 * Exposes the full intent/utterance catalog to the user, following the
 * methodology described in the thesis (Paucar 2021, Fuentes 2022):
 * commands are mapped from utterances → intents → app functions.
 *
 * Shows two sections:
 *   1. Comandos globales  — available everywhere (COMMANDS)
 *   2. En sesión de entreno — workout-specific (WORKOUT_COMMANDS)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  StyleSheet,
} from 'react-native';
import {
  X,
  Mic,
  Navigation,
  Sun,
  Dumbbell,
  LogOut,
  ChevronRight,
  Zap,
} from 'lucide-react-native';
import { COMMANDS, WORKOUT_COMMANDS, type VoiceCommand } from '@/lib/useVoiceCommands';
import { FONT, RADIUS, SPACING } from '@/lib/theme';

const ACCENT      = '#c8f65d';
const ACCENT_TEXT = '#0a0a0a';
const DARK_BG     = '#0f0f0f';
const CARD_BG     = '#161616';
const BORDER      = 'rgba(255,255,255,0.07)';
const MUTED       = 'rgba(255,255,255,0.38)';
const WHITE       = '#f1f1f1';
const WAKE_WORD   = '"Ey Fit Pro"';

// Map action prefix → icon + color
function getIntent(action: string): { icon: React.ReactNode; color: string; group: string } {
  if (action.startsWith('nav:')) {
    const color = '#60a5fa';
    return { icon: <Navigation size={13} color={color} strokeWidth={2.5} />, color, group: 'Navegación' };
  }
  if (action.startsWith('theme:')) {
    const color = '#fbbf24';
    return { icon: <Sun size={13} color={color} strokeWidth={2.5} />, color, group: 'Tema' };
  }
  if (action.startsWith('workout:')) {
    const color = ACCENT;
    return { icon: <Dumbbell size={13} color={color} strokeWidth={2.5} />, color, group: 'Sesión' };
  }
  if (action.startsWith('auth:')) {
    const color = '#f87171';
    return { icon: <LogOut size={13} color={color} strokeWidth={2.5} />, color, group: 'Cuenta' };
  }
  return { icon: <Zap size={13} color={MUTED} strokeWidth={2.5} />, color: MUTED, group: 'General' };
}

function CommandCard({ cmd }: { cmd: VoiceCommand }) {
  const { icon, color } = getIntent(cmd.action);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconPill, { backgroundColor: color + '18', borderColor: color + '30' }]}>
          {icon}
        </View>
        <Text style={styles.cardLabel}>{cmd.label}</Text>
        <View style={[styles.actionChip, { borderColor: color + '40' }]}>
          <Text style={[styles.actionText, { color }]}>{cmd.action}</Text>
        </View>
      </View>
      <View style={styles.utteranceRow}>
        {cmd.utterances.map((u, i) => (
          <View key={i} style={styles.utterancePill}>
            <Text style={styles.utteranceText}>"{u}"</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Section({ title, commands, accent }: { title: string; commands: VoiceCommand[]; accent: string }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: accent }]} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{commands.length} comandos</Text>
      </View>
      {commands.map((cmd) => (
        <CommandCard key={cmd.action} cmd={cmd} />
      ))}
    </View>
  );
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function VoiceCatalogModal({ visible, onClose }: Props) {
  const slideAnim  = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim,   { toValue: 0,  duration: 280, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1,  duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim,   { toValue: 60, duration: 200, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0,  duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        pointerEvents="box-none"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrap}>
              <Mic size={18} color={ACCENT} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Catálogo de voz</Text>
              <Text style={styles.headerSub}>Di {WAKE_WORD} para activar</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <X size={18} color={MUTED} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* ── Wake word banner ── */}
        <View style={styles.wakeBanner}>
          <Text style={styles.wakeBannerLabel}>Palabra de activación</Text>
          <View style={styles.wakeBannerPills}>
            {['"Ey Fit Pro"', '"Hey Fit Pro"', '"Oye Fit Pro"'].map((w) => (
              <View key={w} style={styles.wakeWordPill}>
                <Text style={styles.wakeWordText}>{w}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Scrollable catalog ── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Section
            title="Comandos globales"
            commands={COMMANDS}
            accent="#60a5fa"
          />
          <Section
            title="Durante el entrenamiento"
            commands={WORKOUT_COMMANDS}
            accent={ACCENT}
          />

          {/* Footer note */}
          <View style={styles.footerNote}>
            <ChevronRight size={13} color={MUTED} strokeWidth={2} />
            <Text style={styles.footerNoteText}>
              Los comandos usan intención por patrón (intent mapping), sin ASR propio.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DARK_BG,
    borderTopLeftRadius: RADIUS['2xl'] ?? 24,
    borderTopRightRadius: RADIUS['2xl'] ?? 24,
    maxHeight: '88%',
    borderTopWidth: 1,
    borderColor: BORDER,
    ...Platform.select({
      web: { boxShadow: '0 -8px 40px rgba(0,0,0,0.7)' } as any,
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.6, shadowRadius: 20 },
      android: { elevation: 20 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: ACCENT + '18',
    borderWidth: 1,
    borderColor: ACCENT + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: WHITE,
    fontSize: FONT.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSub: {
    color: MUTED,
    fontSize: FONT.xs,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wakeBanner: {
    marginHorizontal: SPACING.xl,
    marginVertical: SPACING.md,
    padding: SPACING.md,
    backgroundColor: ACCENT + '10',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: ACCENT + '25',
  },
  wakeBannerLabel: {
    color: ACCENT,
    fontSize: FONT.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  wakeBannerPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  wakeWordPill: {
    backgroundColor: ACCENT + '18',
    borderRadius: RADIUS.full ?? 999,
    borderWidth: 1,
    borderColor: ACCENT + '40',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  wakeWordText: {
    color: ACCENT,
    fontSize: FONT.sm,
    fontWeight: '600',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 48,
    gap: SPACING.xl,
  },
  section: { gap: SPACING.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    color: WHITE,
    fontSize: FONT.md,
    fontWeight: '700',
    flex: 1,
  },
  sectionCount: {
    color: MUTED,
    fontSize: FONT.xs,
    fontWeight: '500',
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: RADIUS.xl ?? 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  iconPill: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    color: WHITE,
    fontSize: FONT.sm,
    fontWeight: '600',
    flex: 1,
  },
  actionChip: {
    borderWidth: 1,
    borderRadius: RADIUS.full ?? 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  utteranceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  utterancePill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md ?? 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  utteranceText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: FONT.xs,
    fontStyle: 'italic',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: SPACING.sm,
  },
  footerNoteText: {
    color: MUTED,
    fontSize: FONT.xs,
    lineHeight: 17,
    flex: 1,
    fontStyle: 'italic',
  },
});
