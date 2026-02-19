/**
 * useVoiceCommands
 * ----------------
 * Web Speech API-based voice command engine.
 * Works in Chrome, Edge, Safari 16+.
 *
 * Commands supported:
 *   Navigation   → "ir a inicio" | "ir a rutinas" | "ir a social" | "ir a chat" | "ir a perfil"
 *   Actions      → "modo oscuro" | "modo claro" | "cerrar sesion" | "buscar"
 *   Workout      → "empezar entrenamiento" | "iniciar sesion"
 *
 * Returns state + imperative controls. The component layer renders UI.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'error' | 'unsupported';

export interface VoiceCommand {
  pattern: RegExp;
  label: string;         // shown in transcript bubble
  action: string;        // dispatched to the handler
}

export const COMMANDS: VoiceCommand[] = [
  // Navigation
  { pattern: /\binicio\b|\bhome\b|\bprincipal\b/i,           label: 'Ir a Inicio',              action: 'nav:home' },
  { pattern: /\brutinas?\b/i,                                  label: 'Ir a Rutinas',             action: 'nav:routines' },
  { pattern: /\bsocial\b|\bcomunidad\b/i,                      label: 'Ir a Social',              action: 'nav:social' },
  { pattern: /\bchat\b|\bmensajes?\b/i,                        label: 'Ir a Chat',                action: 'nav:chat' },
  { pattern: /\bperfil\b|\bprofil\b/i,                         label: 'Ir a Perfil',              action: 'nav:profile' },
  // Theme
  { pattern: /\boscur[oa]\b|\bnoche\b|\bdark\b/i,              label: 'Modo Oscuro',              action: 'theme:dark' },
  { pattern: /\bclar[oa]\b|\bluz\b|\blight\b/i,                label: 'Modo Claro',               action: 'theme:light' },
  // Workout
  { pattern: /\bempez[ae]r?\b.*\bentren\b|\biniciar?\b.*\bsesi[oó]n\b|\bentren[ae]r?\b/i,
                                                                label: 'Iniciar Entrenamiento',    action: 'nav:workout' },
  // Session
  { pattern: /\bcerrar sesi[oó]n\b|\bsalir\b|\bdesconectar\b/i, label: 'Cerrar Sesión',          action: 'auth:logout' },
];

export interface UseVoiceCommandsOptions {
  enabled: boolean;
  lang?: string;
  onCommand: (action: string, label: string) => void;
  onTranscript?: (text: string, interim: boolean) => void;
}

export interface UseVoiceCommandsReturn {
  status: VoiceStatus;
  transcript: string;
  lastCommand: string | null;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

// ─── Web Speech API type stubs (not in lib.dom.d.ts by default in RN) ─────────
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

export function useVoiceCommands({
  enabled,
  lang = 'es-ES',
  onCommand,
  onTranscript,
}: UseVoiceCommandsOptions): UseVoiceCommandsReturn {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  const buildRecognition = useCallback((): SpeechRecognition | null => {
    if (!isSupported) return null;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = lang;
    r.interimResults = true;
    r.continuous = false; // restart manually for reliability
    r.maxAlternatives = 3;
    return r;
  }, [isSupported, lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setStatus('idle');
  }, []);

  const start = useCallback(() => {
    if (!isSupported) { setStatus('unsupported'); return; }
    if (status === 'listening') return;

    const r = buildRecognition();
    if (!r) return;
    recognitionRef.current = r;

    r.onstart = () => setStatus('listening');
    r.onend   = () => {
      // auto-restart if still enabled
      if (enabled && recognitionRef.current) {
        setStatus('idle');
        recognitionRef.current = null;
        setTimeout(() => {
          if (enabled) start();
        }, 400);
      } else {
        setStatus('idle');
        recognitionRef.current = null;
      }
    };
    r.onerror = (e) => {
      if (e.error === 'not-allowed') { setStatus('error'); return; }
      if (e.error === 'no-speech')   { /* silently restart */ return; }
      setStatus('idle');
    };

    r.onresult = (event: SpeechRecognitionEvent) => {
      const resultList = event.results;
      const last: SpeechRecognitionResult = resultList[resultList.length - 1];
      const text = last[0].transcript.trim();
      const isFinal = last.isFinal;

      setTranscript(text);
      onTranscript?.(text, !isFinal);

      if (isFinal) {
        setStatus('processing');
        // Match against known commands
        for (const cmd of COMMANDS) {
          if (cmd.pattern.test(text)) {
            setLastCommand(cmd.label);
            onCommand(cmd.action, cmd.label);
            break;
          }
        }
        setTimeout(() => {
          setTranscript('');
          setStatus('idle');
        }, 1200);
      }
    };

    try {
      r.start();
    } catch {
      setStatus('idle');
    }
  }, [isSupported, status, enabled, buildRecognition, onCommand, onTranscript]);

  // Auto-start/stop based on `enabled`
  useEffect(() => {
    if (enabled && isSupported) {
      start();
    } else {
      stop();
    }
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const toggle = useCallback(() => {
    if (status === 'listening') stop();
    else start();
  }, [status, start, stop]);

  return { status, transcript, lastCommand, isSupported, start, stop, toggle };
}
