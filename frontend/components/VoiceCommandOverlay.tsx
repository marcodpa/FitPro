/**
 * VoiceCommandOverlay
 * -------------------
 * Floating mic button (bottom-right) + animated transcript bubble.
 * Shown on all screens when voiceEnabled === true in the store.
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
  onToggle: () => void;
}

export default function VoiceCommandOverlay({
  status,
  transcript,
  lastCommand,
  isSupported,
  onToggle,
}: Props) {
  // Pulse animation for the listening ring
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const bubbleY = useRef(new Animated.Value(12)).current;

  // Pulse ring when listening
  useEffect(() => {
    if (status === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1.8, duration: 900, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0.35, duration: 450, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0, duration: 450, useNativeDriver: true }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      pulseOpacity.setValue(0);
    }
  }, [status, pulseAnim, pulseOpacity]);

  // Show / hide transcript bubble
  const showBubble = transcript.length > 0 || status === 'processing';
  useEffect(() => {
    Animated.parallel([
      Animated.timing(bubbleOpacity, {
        toValue: showBubble ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(bubbleY, {
        toValue: showBubble ? 0 : 12,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showBubble, bubbleOpacity, bubbleY]);

  const accentColor = '#c8f65d';
  const accentText  = '#0a0a0a';
  const errorColor  = '#ef4444';
  const darkBg      = 'rgba(12,12,12,0.92)';

  const isListening  = status === 'listening';
  const isError      = status === 'error' || status === 'unsupported';
  const isProcessing = status === 'processing';

  const btnColor = isError
    ? errorColor
    : isListening || isProcessing
    ? accentColor
    : 'rgba(28,28,28,0.95)';

  const iconColor = isListening || isProcessing ? accentText : isError ? '#fff' : accentColor;

  const bubbleText =
    status === 'processing' && lastCommand
      ? lastCommand
      : transcript;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Transcript / command bubble */}
      <Animated.View
        style={[
          styles.bubble,
          {
            opacity: bubbleOpacity,
            transform: [{ translateY: bubbleY }],
            backgroundColor: darkBg,
            borderColor: isProcessing ? accentColor : 'rgba(255,255,255,0.08)',
          },
        ]}
        pointerEvents="none">
        <View style={[styles.bubbleDot, { backgroundColor: isProcessing ? accentColor : '#6b7280' }]} />
        <Text
          style={[
            styles.bubbleText,
            { color: isProcessing ? accentColor : '#e5e7eb' },
          ]}
          numberOfLines={2}>
          {bubbleText || '...'}
        </Text>
      </Animated.View>

      {/* Pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            backgroundColor: accentColor,
            opacity: pulseOpacity,
            transform: [{ scale: pulseAnim }],
          },
        ]}
        pointerEvents="none"
      />

      {/* Mic button */}
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.82}
        style={[
          styles.micBtn,
          {
            backgroundColor: btnColor,
            shadowColor: isListening ? accentColor : '#000',
          },
        ]}>
        {isError ? (
          <AlertCircle size={22} color={iconColor} strokeWidth={2} />
        ) : isListening || isProcessing ? (
          <Mic size={22} color={iconColor} strokeWidth={2.5} />
        ) : (
          <MicOff size={22} color={iconColor} strokeWidth={2} />
        )}
      </TouchableOpacity>

      {/* Unsupported label */}
      {!isSupported && (
        <Text style={styles.unsupportedLabel}>
          No disponible en este navegador
        </Text>
      )}
    </View>
  );
}

const BTN_SIZE = 56;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 90 : 100,
    right: SPACING.xl,
    alignItems: 'flex-end',
    zIndex: 9999,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: SPACING.md,
    maxWidth: 240,
    ...Platform.select({
      web: { backdropFilter: 'blur(12px)' } as any,
    }),
  },
  bubbleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  bubbleText: {
    fontSize: FONT.sm,
    fontWeight: '600',
    flexShrink: 1,
    letterSpacing: 0.2,
  },
  pulseRing: {
    position: 'absolute',
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    bottom: 0,
    right: 0,
  },
  micBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
      web: {
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      } as any,
    }),
  },
  unsupportedLabel: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});
