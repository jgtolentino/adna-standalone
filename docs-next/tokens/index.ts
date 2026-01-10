/**
 * TBWA Docs Next - Design Tokens
 *
 * Centralized export of all design tokens.
 * Based on TBWA\SMP Suqi Analytics brand guidelines.
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './brand';

// Re-export for convenience
import { colors, cssVariables } from './colors';
import { fonts, textStyles } from './typography';
import { spacing, layout, components } from './spacing';
import { brand, brandTypography, brandShadows, brandRadius, brandSpacing } from './brand';

export const tokens = {
  colors,
  cssVariables,
  fonts,
  textStyles,
  spacing,
  layout,
  components,
  brand,
  brandTypography,
  brandShadows,
  brandRadius,
  brandSpacing,
} as const;

export default tokens;
