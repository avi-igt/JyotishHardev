/**
 * JyotishHardev design tokens.
 *
 * Rules enforced here:
 * - Gold (#C9A84C) is NEVER used for text — only fills, borders, confidence bars.
 * - All touch targets minimum 44×44px.
 * - Spacing on a 4px base unit scale.
 */

// ─── Colours ────────────────────────────────────────────────────────────────────

export const Colors = {
  /** App background — warm cream */
  background: '#F5F0E8',
  /** Cards, chat message surfaces */
  surface: '#FFFFFF',
  /** Deep indigo — headers, primary actions, trust strip */
  primary: '#1B1F4A',
  /**
   * Temple gold — confidence bars, accents, borders, icons.
   * NEVER use as text color (contrast ratio 2.9:1 on white — fails WCAG AA).
   */
  gold: '#C9A84C',
  /** Near-black — body copy */
  text: '#1A1A2E',
  /** Soft indigo-grey — secondary text, placeholders */
  muted: '#6B6B8A',
  /** Deep red — errors only, never decorative */
  error: '#C0392B',
  /** Confirmation green — event confirmed, payment success */
  success: '#27AE60',
  /** Dividers, card borders */
  border: '#E8E2D9',
  /** Semi-transparent overlay */
  overlay: 'rgba(27, 31, 74, 0.6)',
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────────

export const Fonts = {
  /** Tiro Devanagari — headings, screen titles, the astrologer persona */
  heading: 'TiroDevanagari_400Regular',
  /** Inter — body copy, UI labels, secondary text */
  body: 'System',   // falls back to -apple-system / Roboto
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
} as const;

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// ─── Spacing (4px base unit) ─────────────────────────────────────────────────────

export const Spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
} as const;

// ─── Component tokens ─────────────────────────────────────────────────────────────

export const Radius = {
  /** Cards, sheets */
  card: 12,
  /** Buttons, pills */
  pill: 24,
  /** Chips, tags */
  chip: 4,
  /** Input fields */
  input: 8,
} as const;

export const Shadow = {
  /** Indigo-tinted card shadow */
  card: {
    shadowColor: '#1B1F4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  /** Stronger shadow for modals/sheets */
  modal: {
    shadowColor: '#1B1F4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const Transition = {
  /** Standard UI transition: 200ms */
  fast: 200,
  /** Planetary animation: deliberate, not rushed */
  slow: 500,
} as const;

export const TouchTarget = {
  /** Minimum touch target per Apple HIG + WCAG 2.5.5 */
  min: 44,
} as const;

// ─── Domain icons ─────────────────────────────────────────────────────────────────

export const DomainIcon: Record<string, string> = {
  career: '⚡',
  love: '❤',
  health: '🌿',
  finance: '💰',
  family: '🏠',
  other: '◎',
} as const;

// ─── Sanskrit planet abbreviations ────────────────────────────────────────────────

export const PlanetAbbrev: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Bu',
  Jupiter: 'Gu',
  Venus: 'Sk',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
} as const;

// South Indian chart house layout (4×4 grid)
// House numbers in each grid position (row-major, 0-indexed)
// Traditional South Indian layout:
//   12  1  2  3
//   11  .  .  4
//   10  .  .  5
//    9  8  7  6
export const SOUTH_INDIAN_GRID: (number | null)[][] = [
  [12,  1,  2,  3],
  [11, null, null, 4],
  [10, null, null, 5],
  [ 9,  8,  7,  6],
] as const;
