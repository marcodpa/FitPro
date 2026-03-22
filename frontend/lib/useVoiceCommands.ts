/**
 * useVoiceCommands
 * ----------------
 * Web Speech API-based voice command engine with WAKE WORD support.
 *
 * Flow:
 *   1. Starts in "standby" mode — runs a silent background loop listening ONLY
 *      for the wake word "ey fit pro" (or variants).
 *   2. When wake word detected → transitions to "listening" (full command mode)
 *      + plays a short beep to confirm activation.
 *   3. After a command is recognized (or 6s silence) → back to standby.
 *
 * Status values:
 *   standby     → background wake-word loop running (tiny mic icon, dim)
 *   listening   → full command mode (mic lit up, pulse ring)
 *   processing  → command matched, showing result label
 *   error       → microphone permission denied
 *   unsupported → browser has no Web Speech API
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export type VoiceStatus = 'standby' | 'idle' | 'listening' | 'processing' | 'error' | 'unsupported';

export interface VoiceCommand {
  pattern: RegExp;
  label: string;
  action: string;
}

export const COMMANDS: VoiceCommand[] = [
  // Navigation
  { pattern: /\binicio\b|\bhome\b|\bprincipal\b/i,             label: 'Ir a Inicio',           action: 'nav:home' },
  { pattern: /\brutinas?\b/i,                                   label: 'Ir a Rutinas',          action: 'nav:routines' },
  { pattern: /\bsocial\b|\bcomunidad\b/i,                       label: 'Ir a Social',           action: 'nav:social' },
  { pattern: /\bchat\b|\bmensajes?\b/i,                         label: 'Ir a Chat',             action: 'nav:chat' },
  { pattern: /\bperfil\b|\bprofil\b/i,                          label: 'Ir a Perfil',           action: 'nav:profile' },
  // Theme
  { pattern: /\boscur[oa]\b|\bnoche\b|\bdark\b/i,               label: 'Modo Oscuro',           action: 'theme:dark' },
  { pattern: /\bclar[oa]\b|\bluz\b|\blight\b/i,                 label: 'Modo Claro',            action: 'theme:light' },
  // Workout
  { pattern: /\bempez[ae]r?\b.*\bentren\b|\biniciar?\b.*\bsesi[oó]n\b|\bentren[ae]r?\b/i,
                                                                  label: 'Iniciar Entrenamiento', action: 'nav:workout' },
  // Session
  { pattern: /\bcerrar sesi[oó]n\b|\bsalir\b|\bdesconectar\b/i, label: 'Cerrar Sesión',        action: 'auth:logout' },
];

// Wake word patterns — catches: "ey fit pro", "hey fit pro", "oye fit pro", "ei fit pro"
const WAKE_WORD = /\b(ey|hey|oye|ei)\s+(fit\s+pro|fitpro)\b/i;

export interface UseVoiceCommandsOptions {
  enabled: boolean;
  lang?: string;
  onCommand: (action: string, label: string) => void;
  onTranscript?: (text: string, interim: boolean) => void;
  onWakeWord?: () => void;
  /** Additional context-specific commands merged with global COMMANDS */
  extraCommands?: Array<{ pattern: RegExp; action: string; label?: string }>;
}

export interface UseVoiceCommandsReturn {
  status: VoiceStatus;
  transcript: string;
  lastCommand: string | null;
  isSupported: boolean;
  activate: () => void;   // manually trigger command mode (tap mic)
  stop: () => void;
}

// ─── Web Speech API type stubs ────────────────────────────────────────────────
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}
interface SpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Play a short confirmation beep using Web Audio API
function playBeep(freq = 880, durationMs = 120, volume = 0.18) {
  try {
    if (typeof window === 'undefined') return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // AudioContext not available — silently skip
  }
}

function makeSR(lang: string): SpeechRecognition | null {
  if (typeof window === 'undefined') return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = lang;
  r.interimResults = true;
  r.continuous = false;
  r.maxAlternatives = 3;
  return r;
}

export function useVoiceCommands({
  enabled,
  lang = 'es-ES',
  onCommand,
  onTranscript,
  onWakeWord,
  extraCommands = [],
}: UseVoiceCommandsOptions): UseVoiceCommandsReturn {
  const isSupported =
    typeof window !== 'undefined' &&
    (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  // Refs to hold the two recognizer instances
  const wakeRef    = useRef<SpeechRecognition | null>(null);
  const cmdRef     = useRef<SpeechRecognition | null>(null);
  const modeRef    = useRef<'standby' | 'command'>('standby');
  const enabledRef = useRef(enabled);
  const cmdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  // ── Command mode recognizer ──────────────────────────────────────────────
  const startCommandMode = useCallback(() => {
    if (modeRef.current === 'command') return;
    modeRef.current = 'command';

    // Stop wake-word loop
    wakeRef.current?.abort();
    wakeRef.current = null;

    playBeep(880, 100);
    setStatus('listening');
    onWakeWord?.();

    const r = makeSR(lang);
    if (!r) return;
    cmdRef.current = r;

    // Auto-return to standby after 6s if no speech
    cmdTimeoutRef.current = setTimeout(() => {
      cmdRef.current?.stop();
    }, 6000);

    r.onstart = () => setStatus('listening');

    r.onresult = (event) => {
      if (cmdTimeoutRef.current) {
        clearTimeout(cmdTimeoutRef.current);
        cmdTimeoutRef.current = null;
      }
      const resultList = event.results;
      const last: SpeechRecognitionResult = resultList[resultList.length - 1];
      const text = last[0].transcript.trim();
      const isFinal = last.isFinal;

      setTranscript(text);
      onTranscript?.(text, !isFinal);

      if (isFinal) {
        setStatus('processing');
        let matched = false;
        // Check extra (context-specific) commands first
        for (const cmd of extraCommands) {
          if (cmd.pattern.test(text)) {
            const label = cmd.label ?? cmd.action;
            setLastCommand(label);
            onCommand(cmd.action, label);
            matched = true;
            break;
          }
        }
        // Then global commands
        if (!matched) {
          for (const cmd of COMMANDS) {
            if (cmd.pattern.test(text)) {
              setLastCommand(cmd.label);
              onCommand(cmd.action, cmd.label);
              matched = true;
              break;
            }
          }
        }
        if (!matched) setLastCommand(null);
        setTimeout(() => {
          setTranscript('');
          cmdRef.current?.stop();
        }, 1200);
      }
    };

    r.onerror = (e) => {
      if (e.error === 'not-allowed') { setStatus('error'); return; }
    };

    r.onend = () => {
      cmdRef.current = null;
      modeRef.current = 'standby';
      if (cmdTimeoutRef.current) {
        clearTimeout(cmdTimeoutRef.current);
        cmdTimeoutRef.current = null;
      }
      setTranscript('');
      setStatus('standby');
      // Re-start wake word loop
      if (enabledRef.current) setTimeout(startWakeLoop, 300);
    };

    try { r.start(); } catch { modeRef.current = 'standby'; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, onCommand, onTranscript, onWakeWord]);

  // ── Wake-word loop ───────────────────────────────────────────────────────
  const startWakeLoop = useCallback(() => {
    if (!enabledRef.current || !isSupported) return;
    if (modeRef.current === 'command') return;

    const r = makeSR(lang);
    if (!r) return;
    wakeRef.current = r;

    r.onstart  = () => setStatus('standby');
    r.onerror  = (e) => {
      if (e.error === 'not-allowed') setStatus('error');
      // no-speech / aborted → just restart
    };
    r.onend    = () => {
      wakeRef.current = null;
      if (enabledRef.current && modeRef.current !== 'command') {
        setTimeout(startWakeLoop, 300);
      }
    };
    r.onresult = (event) => {
      const resultList = event.results;
      const last: SpeechRecognitionResult = resultList[resultList.length - 1];
      const text = last[0].transcript.trim();

      if (WAKE_WORD.test(text)) {
        wakeRef.current?.abort();
        wakeRef.current = null;
        startCommandMode();
      }
    };

    try { r.start(); } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported, lang, startCommandMode]);

  // ── Lifecycle: start / stop based on `enabled` ──────────────────────────
  useEffect(() => {
    if (enabled && isSupported) {
      modeRef.current = 'standby';
      startWakeLoop();
    } else {
      wakeRef.current?.abort();
      wakeRef.current = null;
      cmdRef.current?.abort();
      cmdRef.current = null;
      modeRef.current = 'standby';
      setStatus('idle');
      setTranscript('');
    }
    return () => {
      wakeRef.current?.abort();
      cmdRef.current?.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Manual tap → go straight to command mode
  const activate = useCallback(() => {
    if (!isSupported) { setStatus('unsupported'); return; }
    if (modeRef.current === 'command') return;
    startCommandMode();
  }, [isSupported, startCommandMode]);

  const stop = useCallback(() => {
    wakeRef.current?.abort();
    cmdRef.current?.abort();
    wakeRef.current = null;
    cmdRef.current = null;
    modeRef.current = 'standby';
    setStatus('idle');
    setTranscript('');
  }, []);

  return { status, transcript, lastCommand, isSupported, activate, stop };
}
