/**
 * TBWA Docs Next - Typography Tokens
 *
 * Type scale and font definitions for consistent text rendering.
 */

export const fonts = {
  // Font families
  families: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace',
    heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Font sizes (rem-based for accessibility)
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },

  // Line heights
  lineHeights: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Font weights
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// Preset text styles for docs
export const textStyles = {
  // Headings
  h1: {
    fontFamily: fonts.families.heading,
    fontSize: fonts.sizes['4xl'],
    fontWeight: fonts.weights.bold,
    lineHeight: fonts.lineHeights.tight,
    letterSpacing: fonts.letterSpacing.tight,
  },
  h2: {
    fontFamily: fonts.families.heading,
    fontSize: fonts.sizes['3xl'],
    fontWeight: fonts.weights.semibold,
    lineHeight: fonts.lineHeights.tight,
    letterSpacing: fonts.letterSpacing.tight,
  },
  h3: {
    fontFamily: fonts.families.heading,
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.semibold,
    lineHeight: fonts.lineHeights.snug,
  },
  h4: {
    fontFamily: fonts.families.heading,
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.semibold,
    lineHeight: fonts.lineHeights.snug,
  },

  // Body text
  body: {
    fontFamily: fonts.families.sans,
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.normal,
    lineHeight: fonts.lineHeights.relaxed,
  },
  bodySmall: {
    fontFamily: fonts.families.sans,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.normal,
    lineHeight: fonts.lineHeights.normal,
  },
  bodyLarge: {
    fontFamily: fonts.families.sans,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.normal,
    lineHeight: fonts.lineHeights.relaxed,
  },

  // Code
  code: {
    fontFamily: fonts.families.mono,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.normal,
    lineHeight: fonts.lineHeights.relaxed,
  },
  codeBlock: {
    fontFamily: fonts.families.mono,
    fontSize: '0.8125rem', // 13px - slightly smaller for code blocks
    fontWeight: fonts.weights.normal,
    lineHeight: fonts.lineHeights.relaxed,
  },

  // UI elements
  label: {
    fontFamily: fonts.families.sans,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.wide,
  },
  caption: {
    fontFamily: fonts.families.sans,
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.normal,
    lineHeight: fonts.lineHeights.normal,
  },
} as const;

export type FontSize = keyof typeof fonts.sizes;
export type TextStyle = keyof typeof textStyles;
