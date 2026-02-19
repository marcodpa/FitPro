// ─── FitPro Design System ─────────────────────────────────────────────────────
// Single source of truth for all design tokens

export const COLORS = {
  // Background layers
  bg: {
    primary: '#080808',
    secondary: '#111111',
    tertiary: '#191919',
    elevated: '#202020',
    border: '#2a2a2a',
    borderStrong: '#3a3a3a',
  },

  // Accent — electric lime-green
  accent: {
    DEFAULT: '#c8f65d',
    dim: 'rgba(200,246,93,0.12)',
    dimMid: 'rgba(200,246,93,0.2)',
    glow: 'rgba(200,246,93,0.08)',
    text: '#c8f65d',
    dark: '#a3d43a',
  },

  // Text scale
  text: {
    primary: '#f2f2f2',
    secondary: '#8a8a8a',
    tertiary: '#555555',
    inverse: '#0a0a0a',
    accent: '#c8f65d',
  },

  // Semantic
  success: '#22c55e',
  successDim: 'rgba(34,197,94,0.15)',
  warning: '#f59e0b',
  warningDim: 'rgba(245,158,11,0.15)',
  danger: '#ef4444',
  dangerDim: 'rgba(239,68,68,0.15)',
  info: '#818cf8',
  infoDim: 'rgba(129,140,248,0.15)',
  orange: '#f97316',
  orangeDim: 'rgba(249,115,22,0.15)',

  // Difficulty
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#ef4444',

  // White alpha
  white: {
    5: 'rgba(255,255,255,0.05)',
    8: 'rgba(255,255,255,0.08)',
    10: 'rgba(255,255,255,0.10)',
    15: 'rgba(255,255,255,0.15)',
    20: 'rgba(255,255,255,0.20)',
    30: 'rgba(255,255,255,0.30)',
    50: 'rgba(255,255,255,0.50)',
    70: 'rgba(255,255,255,0.70)',
  },
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FONT = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  display: 36,
} as const;
