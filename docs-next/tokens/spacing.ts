/**
 * TBWA Docs Next - Spacing Tokens
 *
 * Consistent spacing scale based on 4px base unit.
 */

// Base unit: 4px
const BASE_UNIT = 4;

export const spacing = {
  // Pixel values (for reference)
  px: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },

  // Rem values (preferred for scalability)
  rem: {
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
  },
} as const;

// Layout-specific spacing
export const layout = {
  // Page margins
  pageMargin: {
    mobile: spacing.rem[4],    // 16px
    tablet: spacing.rem[6],    // 24px
    desktop: spacing.rem[8],   // 32px
  },

  // Content max widths
  maxWidth: {
    prose: '65ch',             // Optimal reading width
    content: '48rem',          // 768px
    wide: '64rem',             // 1024px
    full: '80rem',             // 1280px
  },

  // Sidebar dimensions
  sidebar: {
    width: '16rem',            // 256px
    collapsedWidth: '4rem',    // 64px
  },

  // Header height
  header: {
    height: '4rem',            // 64px
    mobileHeight: '3.5rem',    // 56px
  },

  // Gaps
  gap: {
    xs: spacing.rem[2],        // 8px
    sm: spacing.rem[3],        // 12px
    md: spacing.rem[4],        // 16px
    lg: spacing.rem[6],        // 24px
    xl: spacing.rem[8],        // 32px
  },
} as const;

// Component-specific spacing
export const components = {
  // Code block
  codeBlock: {
    padding: spacing.rem[4],
    borderRadius: spacing.rem[2],
  },

  // Callout
  callout: {
    padding: spacing.rem[4],
    borderRadius: spacing.rem[2],
    iconSize: spacing.rem[5],
  },

  // Card
  card: {
    padding: spacing.rem[5],
    borderRadius: spacing.rem[3],
    gap: spacing.rem[3],
  },

  // Button
  button: {
    paddingX: spacing.rem[4],
    paddingY: spacing.rem[2],
    borderRadius: spacing.rem[1.5],
    gap: spacing.rem[2],
  },

  // Input
  input: {
    paddingX: spacing.rem[3],
    paddingY: spacing.rem[2],
    borderRadius: spacing.rem[1.5],
  },

  // Table
  table: {
    cellPadding: spacing.rem[3],
    headerPadding: spacing.rem[4],
  },
} as const;

export type SpacingScale = keyof typeof spacing.rem;
