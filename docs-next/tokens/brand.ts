/**
 * TBWA Docs Next - Brand Guidelines Tokens
 *
 * Official TBWA\SMP brand colors and visual identity tokens
 * Based on the Suqi Analytics dashboard design system.
 */

export const brand = {
  // === TBWA Core Brand Colors ===
  tbwa: {
    black: '#000000',           // TBWA Primary Black
    yellow: '#FFCC00',          // TBWA Signature Yellow - Primary accent
    orange: '#FF6B00',          // TBWA Orange - Secondary accent
    white: '#FFFFFF',           // Pure white
  },

  // === Suqi Analytics Brand Colors ===
  suqi: {
    primary: '#FFCC00',         // Yellow - Primary actions, highlights
    secondary: '#3B82F6',       // Blue - Navigation active states
    accent: '#14B8A6',          // Teal - "Retail Intelligence" accent
    background: '#F8FAFC',      // Light gray background
    surface: '#FFFFFF',         // Card/panel backgrounds
  },

  // === Functional Colors (from dashboard) ===
  functional: {
    // Metrics
    positive: '#10B981',        // Green - positive trends (↗)
    negative: '#EF4444',        // Red - negative trends (↘)
    neutral: '#6B7280',         // Gray - neutral indicators

    // Funnel colors (Purchase Journey)
    funnelYellow: '#FFCC00',    // Store Visit
    funnelBlue: '#3B82F6',      // Product Browse
    funnelOrange: '#F59E0B',    // Brand Request
    funnelTeal: '#14B8A6',      // Accept Suggestion
    funnelGreen: '#10B981',     // Purchase

    // Status indicators
    active: '#10B981',
    inactive: '#9CA3AF',
    pending: '#F59E0B',
    error: '#EF4444',
  },

  // === Navigation Colors ===
  navigation: {
    sidebarBg: '#FFFFFF',
    sidebarText: '#374151',
    sidebarTextMuted: '#9CA3AF',
    sidebarActive: '#3B82F6',
    sidebarActiveBg: 'rgba(59, 130, 246, 0.1)',
    sidebarHover: '#F3F4F6',
    headerBg: '#FFFFFF',
    headerBorder: '#E5E7EB',
  },

  // === Data Visualization Palette ===
  chart: {
    primary: '#FFCC00',         // Yellow
    secondary: '#3B82F6',       // Blue
    tertiary: '#14B8A6',        // Teal
    quaternary: '#F59E0B',      // Amber
    quinary: '#8B5CF6',         // Purple
    // Extended palette for complex charts
    palette: [
      '#FFCC00', // Yellow
      '#3B82F6', // Blue
      '#14B8A6', // Teal
      '#F59E0B', // Amber
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#10B981', // Emerald
      '#EF4444', // Red
      '#6366F1', // Indigo
      '#84CC16', // Lime
    ],
  },

  // === AI/Insights Colors ===
  ai: {
    insightBg: '#FEF9C3',       // Light yellow for AI insights
    insightBorder: '#FDE047',
    insightIcon: '#CA8A04',
    recommendationBg: '#ECFDF5',
    recommendationBorder: '#6EE7B7',
    suggestionBg: '#F0F9FF',
    suggestionBorder: '#7DD3FC',
  },
} as const;

// === Brand Typography ===
export const brandTypography = {
  // Logo text
  logoFont: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
  logoWeight: '700',

  // Headings (matches Suqi dashboard)
  headingFont: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  headingWeight: '600',

  // Body text
  bodyFont: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  bodyWeight: '400',

  // Metrics/Numbers
  metricsFont: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  metricsWeight: '600',

  // Code
  codeFont: '"JetBrains Mono", "Fira Code", monospace',
};

// === Brand Shadows ===
export const brandShadows = {
  card: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  cardHover: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  dropdown: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  modal: '0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)',
  button: '0 1px 2px rgba(0, 0, 0, 0.05)',
  buttonHover: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

// === Brand Border Radius ===
export const brandRadius = {
  none: '0',
  sm: '0.25rem',    // 4px - small elements
  md: '0.5rem',     // 8px - cards, inputs
  lg: '0.75rem',    // 12px - larger cards
  xl: '1rem',       // 16px - modals, panels
  full: '9999px',   // Pills, avatars
};

// === Brand Spacing (8px grid) ===
export const brandSpacing = {
  0: '0',
  1: '0.25rem',     // 4px
  2: '0.5rem',      // 8px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
};

export type BrandColor = keyof typeof brand.tbwa;
export type ChartColor = keyof typeof brand.chart;
