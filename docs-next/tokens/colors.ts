/**
 * TBWA Docs Next - Color Tokens
 *
 * Design system color palette with semantic tokens.
 * Based on TBWA\SMP Suqi Analytics brand guidelines + accessibility requirements.
 */

export const colors = {
  // TBWA Core Brand Colors
  brand: {
    primary: '#000000',      // TBWA Black
    secondary: '#FFCC00',    // TBWA Signature Yellow (Primary accent)
    accent: '#FF6B00',       // TBWA Orange
    blue: '#3B82F6',         // Suqi Blue (Navigation, secondary actions)
    teal: '#14B8A6',         // Retail Intelligence teal
  },

  // Semantic colors
  semantic: {
    success: '#10B981',      // Emerald 500
    warning: '#F59E0B',      // Amber 500
    error: '#EF4444',        // Red 500
    info: '#3B82F6',         // Blue 500
  },

  // Neutral palette
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },

  // Code block colors
  code: {
    background: '#1E1E1E',
    foreground: '#D4D4D4',
    comment: '#6A9955',
    keyword: '#569CD6',
    string: '#CE9178',
    number: '#B5CEA8',
    function: '#DCDCAA',
    variable: '#9CDCFE',
    operator: '#D4D4D4',
  },

  // Docs-specific colors
  docs: {
    sidebarBg: 'var(--docs-sidebar-bg)',
    sidebarText: 'var(--docs-sidebar-text)',
    contentBg: 'var(--docs-content-bg)',
    contentText: 'var(--docs-content-text)',
    borderColor: 'var(--docs-border)',
    linkColor: 'var(--docs-link)',
    linkHover: 'var(--docs-link-hover)',
  },
} as const;

// CSS variable mappings for theming
export const cssVariables = {
  light: {
    '--docs-sidebar-bg': colors.neutral[50],
    '--docs-sidebar-text': colors.neutral[900],
    '--docs-content-bg': '#FFFFFF',
    '--docs-content-text': colors.neutral[900],
    '--docs-border': colors.neutral[200],
    '--docs-link': colors.brand.accent,
    '--docs-link-hover': '#E55A00',
    '--docs-code-bg': colors.neutral[100],
    '--docs-inline-code-bg': colors.neutral[100],
  },
  dark: {
    '--docs-sidebar-bg': colors.neutral[900],
    '--docs-sidebar-text': colors.neutral[100],
    '--docs-content-bg': colors.neutral[950],
    '--docs-content-text': colors.neutral[100],
    '--docs-border': colors.neutral[800],
    '--docs-link': '#FF8533',
    '--docs-link-hover': colors.brand.secondary,
    '--docs-code-bg': colors.neutral[900],
    '--docs-inline-code-bg': colors.neutral[800],
  },
} as const;

export type ColorToken = keyof typeof colors;
export type SemanticColor = keyof typeof colors.semantic;
