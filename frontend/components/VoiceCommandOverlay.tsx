/**
 * VoiceCommandOverlay
 * -------------------
 * Floating mic button (bottom-right corner), shown on all screens when voiceEnabled === true.
 *
 * States:
 *   standby    → small dim mic, shows "Di 'Ey Fit Pro'..." label
 *   listening  → lit-up mic with pulse ring, ready for command
 *   processing → shows matched command label in bubble
 *   error      → red alert icon (permission denied)
 *   unsupported→ hidden (browser can't do it)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { Mic, MicOff, AlertCircle } from 'lucide-react-native';
import type { VoiceStatus } from '@/lib/useVoiceCommands';
import { FONT, RADIUS, SPACING } from '@/lib/theme';

interface Props {
  status: VoiceStatus;
  transcript: string;
  lastCommand: string | null;
  isSupported: boolean;
  onActivate: () => void;
}

const ACCENT       = '#c8f65d';
const ACCENT_TEXT  = '#0a0a0a';
const ERROR_COLOR  = '#ef4444';
const DARK_BG      = 'rgba(12,12,12,0.93)';
const BTN_SIZE     = 52;
const BTN_SIZE_STANDBY = 42;

export default function VoiceCommandOverlay({
  status,
  transcript,
  lastCommand,
  isSupported,
  onActivate,
}: Props) {
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const bubbleY       = useRef(new Animated.Value(10)).current;
  const btnScale      = useRef(new Animated.Value(1)).current;

  const isStandby    = status === 'standby';
  const isListening  = status === 'listening';
  const isProcessing = status === 'processing';
  const isError      = status === 'error' || status === 'unsupported';

  // Pulse ring when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim,    { toValue: 1.9,  duration: 800, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0.3,  duration: 400, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim,    { toValue: 1,    duration: 800, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0,    duration: 400, useNativeDriver: true }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseOpacity.stopAnimation();
      Animated.parallel([
        Animated.timing(pulseAnim,    { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isListening, pulseAnim, pulseOpacity]);

  // Scale button when activated
  useEffect(() => {
    if (isListening) {
      Animated.sequence([
        Animated.timing(btnScale, { toValue: 1.15, duration: 120, useNativeDriver: true }),
        Animated.timing(btnScale, { toValue: 1,    duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [isListening, btnScale]);

  // Bubble visibility
  const showBubble = transcript.length > 0 || isProcessing;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(bubbleOpacity, { toValue: showBubble ? 1 : 0, duration: 160, useNativeDriver: true }),
      Animated.timing(bubbleY,       { toValue: showBubble ? 0 : 10, duration: 160, useNativeDriver: true }),
    ]).start();
  }, [showBubble, bubbleOpacity, bubbleY]);

  if (!isSupported || status === 'idle') return null;

  const btnColor = isError
    ? ERROR_COLOR
    : isListening || isProcessing
    ? ACCENT
    : 'rgba(18,18,18,0.88)';

  const iconColor = isListening || isProcessing
    ? ACCENT_TEXT
    : isError
    ? '#fff'
    : 'rgba(200,246,93,0.55)';

  const currentBtnSize = isStandby ? BTN_SIZE_STANDBY : BTN_SIZE;

  const bubbleText = isProcessing && lastCommand ? lastCommand : transcript;

  return (
    <View style={styles.container} pointerEvents="box-none">

      {/* Transcript / command bubble */}
      {showBubble && (
        <Animated.View
          style={[
            styles.bubble,
            {
              opacity: bubbleOpacity,
              transform: [{ translateY: bubbleY }],
              backgroundColor: DARK_BG,
              borderColor: isProcessing ? ACCENT : 'rgba(255,255,255,0.08)',
            },
          ]}
          pointerEvents="none">
          <View style={[styles.bubbleDot, { backgroundColor: isProcessing ? ACCENT : '#6b7280' }]} />
          <Text
            style={[styles.bubbleText, { color: isProcessing ? ACCENT : '#e5e7eb' }]}
            numberOfLines={2}>
            {bubbleText || '...'}
          </Text>
        </Animated.View>
      )}

      {/* Standby hint label */}
      {isStandby && !showBubble && (
        <View style={styles.wakeHint} pointerEvents="none">
          <Text style={styles.wakeHintText}>Di "Ey Fit Pro"</Text>
        </View>
      )}

      {/* Pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: currentBtnSize,
            height: currentBtnSize,
            borderRadius: currentBtnSize / 2,
            backgroundColor: ACCENT,
            opacity: pulseOpacity,
            transform: [{ scale: pulseAnim }],
          },
        ]}
        pointerEvents="none"
      />

      {/* Mic button */}
      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <TouchableOpacity
          onPress={onActivate}
          activeOpacity={0.8}
          style={[
            styles.micBtn,
            {
              width: currentBtnSize,
              height: currentBtnSize,
              borderRadius: currentBtnSize / 2,
              backgroundColor: btnColor,
              shadowColor: isListening ? ACCENT : '#000',
              borderWidth: isStandby ? 1 : 0,
              borderColor: isStandby ? 'rgba(200,246,93,0.2)' : 'transparent',
            },
          ]}>
          {isError ? (
            <AlertCircle size={isStandby ? 17 : 21} color={iconColor} strokeWidth={2} />
          ) : (
            <Mic size={isStandby ? 17 : 21} color={iconColor} strokeWidth={isListening ? 2.5 : 2} />
          )}
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 88 : 100,
    right: SPACING.xl,
    alignItems: 'flex-end',
    zIndex: 9999,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginBottom: SPACING.md,
    maxWidth: 230,
    ...Platform.select({
      web: { backdropFilter: 'blur(14px)' } as any,
    }),
  },
  bubbleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  bubbleText: {
    fontSize: FONT.sm,
    fontWeight: '600',
    flexShrink: 1,
    letterSpacing: 0.2,
  },
  pulseRing: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  micBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
      },
      android: { elevation: 10 },
      web: {
        boxShadow: '0 4px 18px rgba(0,0,0,0.55)',
        cursor: 'pointer',
      } as any,
    }),
  },
  wakeHint: {
    backgroundColor: 'rgba(12,12,12,0.82)',
    borderRadius: RADIUS.lg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: 'rgba(200,246,93,0.15)',
    ...Platform.select({
      web: { backdropFilter: 'blur(8px)' } as any,
    }),
  },
  wakeHintText: {
    color: 'rgba(200,246,93,0.55)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
