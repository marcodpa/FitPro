// ─── FitPro Design System ─────────────────────────────────────────────────────
// getTheme(isDark) returns a fully-typed token set.
// NEVER use hardcoded colors in screens — always use these tokens.

export const ACCENT = '#c8f65d';
export const ACCENT_DARK = '#a3d43a';
export const ACCENT_DIM = 'rgba(200,246,93,0.14)';
export const ACCENT_TEXT = '#0a0a0a'; // text ON accent background

export function getTheme(isDark: boolean) {
  if (isDark) {
    return {
      isDark: true,
      bg: {
        primary:  '#080808',
        secondary:'#111111',
        tertiary: '#191919',
        elevated: '#202020',
        card:     '#131313',
        input:    '#161616',
      },
      border: {
        subtle:  '#202020',
        default: '#2a2a2a',
        strong:  '#3a3a3a',
      },
      text: {
        primary:   '#f2f2f2',
        secondary: '#888888',
        tertiary:  '#555555',
        inverse:   '#0a0a0a',
        accent:    ACCENT,
      },
      accent: ACCENT,
      accentDark: ACCENT_DARK,
      accentDim: ACCENT_DIM,
      accentText: ACCENT_TEXT,

      // Semantic
      success:    '#22c55e',
      successDim: 'rgba(34,197,94,0.15)',
      warning:    '#f59e0b',
      warningDim: 'rgba(245,158,11,0.15)',
      danger:     '#ef4444',
      dangerDim:  'rgba(239,68,68,0.15)',
      info:       '#818cf8',
      infoDim:    'rgba(129,140,248,0.15)',
      orange:     '#f97316',
      orangeDim:  'rgba(249,115,22,0.15)',

      // Difficulty
      beginner:     '#22c55e',
      intermediate: '#f59e0b',
      advanced:     '#ef4444',

      // Alpha whites
      white10: 'rgba(255,255,255,0.10)',
      white15: 'rgba(255,255,255,0.15)',
      white20: 'rgba(255,255,255,0.20)',
      white30: 'rgba(255,255,255,0.30)',
      white50: 'rgba(255,255,255,0.50)',
      white70: 'rgba(255,255,255,0.70)',

      // Nav theme for @react-navigation
      nav: {
        background: '#080808',
        card:       '#111111',
        border:     '#2a2a2a',
        text:       '#f2f2f2',
        primary:    ACCENT,
        notification: ACCENT,
      },
    } as const;
  }

  // ── LIGHT ──────────────────────────────────────────────────────────────────
  return {
    isDark: false,
    bg: {
      primary:  '#f9f9f9',
      secondary:'#ffffff',
      tertiary: '#f2f2f2',
      elevated: '#ffffff',
      card:     '#ffffff',
      input:    '#f4f4f4',
    },
    border: {
      subtle:  '#ebebeb',
      default: '#e0e0e0',
      strong:  '#cccccc',
    },
    text: {
      primary:   '#0a0a0a',
      secondary: '#666666',
      tertiary:  '#999999',
      inverse:   '#f9f9f9',
      accent:    '#4a7a0a', // lime-green readable on white
    },
    accent: ACCENT,
    accentDark: ACCENT_DARK,
    accentDim: 'rgba(163,212,58,0.12)',
    accentText: '#0a0a0a',

    // Semantic
    success:    '#16a34a',
    successDim: 'rgba(22,163,74,0.12)',
    warning:    '#d97706',
    warningDim: 'rgba(217,119,6,0.12)',
    danger:     '#dc2626',
    dangerDim:  'rgba(220,38,38,0.10)',
    info:       '#4f46e5',
    infoDim:    'rgba(79,70,229,0.10)',
    orange:     '#ea580c',
    orangeDim:  'rgba(234,88,12,0.10)',

    // Difficulty
    beginner:     '#16a34a',
    intermediate: '#d97706',
    advanced:     '#dc2626',

    // Alpha blacks (equivalent to white alphas in dark)
    white10: 'rgba(0,0,0,0.06)',
    white15: 'rgba(0,0,0,0.09)',
    white20: 'rgba(0,0,0,0.12)',
    white30: 'rgba(0,0,0,0.20)',
    white50: 'rgba(0,0,0,0.45)',
    white70: 'rgba(0,0,0,0.65)',

    // Nav theme for @react-navigation
    nav: {
      background: '#f9f9f9',
      card:       '#ffffff',
      border:     '#e0e0e0',
      text:       '#0a0a0a',
      primary:    '#4a7a0a',
      notification: '#4a7a0a',
    },
  } as const;
}

export type Theme = ReturnType<typeof getTheme>;

// Legacy static (dark only) — kept for backward compat with old screens
export const COLORS = getTheme(true);

export const RADIUS = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, full: 9999,
} as const;

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
} as const;

export const FONT = {
  xs: 11, sm: 12, base: 14, md: 15, lg: 16, xl: 18, xxl: 22,
  xxxl: 28, display: 36,
} as const;
