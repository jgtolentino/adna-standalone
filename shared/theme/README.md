# TBWA Agency Databank - Shared Theme Tokens

This directory contains the shared design tokens used across the TBWA Agency Databank project, ensuring visual consistency between the React frontend and Odoo backend.

## tokens.json

The `tokens.json` file contains all design tokens in a structured JSON format that can be consumed by various build tools and applications.

### Structure

```json
{
  "colors": {
    "brand": { ... },        // TBWA brand colors
    "semantic": { ... },     // Semantic color mappings
    "light": { ... },        // Light mode colors
    "dark": { ... },         // Dark mode colors
    "sidebar": { ... },      // Sidebar-specific colors
    "navigation": { ... },   // Navigation colors
    "chat": { ... }          // Chat interface colors
  },
  "spacing": { ... },        // Border radius values
  "typography": { ... },     // Font families, sizes, weights
  "shadows": { ... },        // Box shadow definitions
  "transitions": { ... },    // Animation timings
  "gradients": { ... },      // Gradient definitions
  "breakpoints": { ... },    // Responsive breakpoints
  "container": { ... }       // Container configuration
}
```

### Usage

#### React/TypeScript

```typescript
import tokens from '@shared/theme/tokens.json';

// Access brand colors
const primaryColor = tokens.colors.brand.yellow.hex; // "#FFDD00"
const primaryHsl = tokens.colors.brand.yellow.hsl;   // "51 100% 50%"

// Access typography
const fontFamily = tokens.typography.fontFamily.sans;

// Access spacing
const borderRadius = tokens.spacing.radius; // "0.5rem"
```

#### Generate CSS Variables

```javascript
const tokens = require('./tokens.json');

function generateCssVariables(tokens) {
  const lines = [];

  // Brand colors
  Object.entries(tokens.colors.brand).forEach(([name, value]) => {
    lines.push(`  --tbwa-${name}: ${value.hsl};`);
  });

  // Light mode colors
  Object.entries(tokens.colors.light).forEach(([name, value]) => {
    lines.push(`  --${name}: ${value};`);
  });

  return `:root {\n${lines.join('\n')}\n}`;
}

console.log(generateCssVariables(tokens));
```

#### Node.js Build Script

```javascript
const fs = require('fs');
const tokens = require('./tokens.json');

// Generate SCSS variables file
const scssContent = Object.entries(tokens.colors.brand)
  .map(([name, value]) => `$tbwa-${name}: hsl(${value.hsl});`)
  .join('\n');

fs.writeFileSync('_generated-variables.scss', scssContent);
```

### Color Format

All colors are provided in three formats:
- **HSL**: `"51 100% 50%"` - For CSS custom properties
- **Hex**: `"#FFDD00"` - For tools that require hex values
- **RGB**: `"255, 221, 0"` - For RGBA usage

### Consumers

These tokens are consumed by:

1. **React Frontend** (`platforms/creative-ops/ces-jampacked`)
   - Uses CSS variables in `index.css`
   - Mapped to Tailwind in `tailwind.config.ts`

2. **Odoo Backend** (`odoo/tbwa_theme`)
   - Converted to SCSS in `variables.scss`
   - Applied to Odoo components in `backend.scss`

3. **Scout Dashboard** (`apps/scout-dashboard`)
   - Uses similar tokens in `globals.css`

### Updating Tokens

When updating the design tokens:

1. Modify `tokens.json` with new values
2. Update React CSS variables in the frontend
3. Update Odoo SCSS variables in `tbwa_theme/static/src/scss/variables.scss`
4. Test both frontends to ensure consistency

### Token Categories

| Category | Description |
|----------|-------------|
| `brand` | Core TBWA brand colors |
| `semantic` | Contextual color mappings (primary, secondary, etc.) |
| `light` | Light mode specific colors |
| `dark` | Dark mode specific colors |
| `sidebar` | Sidebar component colors |
| `navigation` | Navigation bar colors |
| `chat` | Chat interface colors |
| `spacing` | Border radius values |
| `typography` | Font configuration |
| `shadows` | Box shadow definitions |
| `transitions` | Animation timings |
| `gradients` | Gradient definitions |
| `breakpoints` | Responsive breakpoints |
| `container` | Container sizing |

## Design Principles

1. **HSL First**: All colors use HSL format for easy manipulation
2. **Semantic Naming**: Colors have semantic names (primary, secondary) mapped to brand colors
3. **Dark Mode Ready**: All colors have light/dark variants
4. **Consistent Spacing**: Border radius and spacing follow a consistent scale
5. **Accessible**: Color combinations meet WCAG contrast requirements
