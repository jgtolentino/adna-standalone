# TBWA Theme for Odoo

This Odoo module applies the TBWA Agency Databank custom theme to the Odoo backend, ensuring visual consistency with the React frontend application.

## Overview

The TBWA Theme module provides a unified design system that matches the design tokens and styles defined in the React frontend (`platforms/creative-ops/ces-jampacked`). This ensures a seamless visual experience across both the decoupled React frontend and the Odoo backend.

## Features

- **TBWA Brand Colors**: Primary Yellow (#FFDD00), Secondary Turquoise (#00FFAA)
- **Custom Typography**: Inter font family for consistent typography
- **Unified Design Tokens**: CSS variables matching React frontend
- **Light and Dark Mode**: Full dark mode support with toggle
- **Component Styling**: Custom styles for all Odoo views and components
- **Portal/Frontend Styling**: Consistent styling for customer-facing portal

## Installation

### Prerequisites

- Odoo 16.0 or later
- Web module (included by default)

### Steps

1. Copy the `tbwa_theme` directory to your Odoo addons path:
   ```bash
   cp -r odoo/tbwa_theme /path/to/odoo/addons/
   ```

2. Update the addons list in Odoo:
   - Go to Apps menu
   - Click "Update Apps List"
   - Search for "TBWA Theme"

3. Install the module:
   - Click Install on the TBWA Theme module

## Theme Tokens

### Brand Colors

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--tbwa-yellow` | `51 100% 50%` | `#FFDD00` | Primary brand color |
| `--tbwa-turquoise` | `160 100% 50%` | `#00FFAA` | Secondary brand color |
| `--tbwa-black` | `0 0% 0%` | `#000000` | Text, navigation backgrounds |
| `--tbwa-white` | `0 0% 100%` | `#FFFFFF` | Backgrounds |
| `--tbwa-gray` | `0 0% 33%` | `#545454` | Secondary text |
| `--tbwa-light-gray` | `0 0% 96%` | `#F5F5F5` | Subtle backgrounds |

### Semantic Colors

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--background` | White | Deep blue-gray |
| `--foreground` | Black | Near white |
| `--primary` | TBWA Yellow | Light text |
| `--secondary` | TBWA Turquoise | Muted blue |
| `--destructive` | Red | Darker red |
| `--muted` | Light gray | Dark gray |

### Spacing & Radius

| Token | Value |
|-------|-------|
| `--radius` | `0.5rem` (8px) |
| `--radius-sm` | `0.375rem` (6px) |
| `--radius-md` | `0.4375rem` (7px) |
| `--radius-lg` | `0.5rem` (8px) |

## File Structure

```
tbwa_theme/
├── __init__.py                 # Module initialization
├── __manifest__.py             # Module manifest
├── README.md                   # This file
├── views/
│   └── assets.xml              # Asset bundles and templates
└── static/
    ├── description/
    │   └── banner.png          # Module banner (optional)
    └── src/
        ├── scss/
        │   ├── variables.scss          # CSS variables & SCSS variables
        │   ├── primary_variables.scss  # Odoo variable overrides
        │   ├── backend.scss            # Backend UI styles
        │   ├── components.scss         # Component-specific styles
        │   ├── dark_mode.scss          # Dark mode overrides
        │   └── frontend.scss           # Portal/website styles
        ├── js/
        │   └── dark_mode.js            # Dark mode toggle functionality
        └── xml/
            └── dark_mode_toggle.xml    # OWL component templates
```

## Customization

### Overriding Colors

To customize the theme colors, you can override the CSS variables in your own module:

```scss
:root {
  --tbwa-yellow: 45 100% 50%;  // Custom yellow
  --primary: var(--tbwa-yellow);
}
```

### Extending Styles

Create a new SCSS file that imports the base variables:

```scss
@import 'tbwa_theme/static/src/scss/variables';

.my-custom-component {
  background-color: hsl(var(--primary));
  border-radius: $radius;
  @include transition-smooth;
}
```

### Dark Mode

The dark mode can be toggled via:
- User menu dropdown (Toggle Dark Mode)
- System preference (`prefers-color-scheme: dark`)
- JavaScript API:

```javascript
import { toggleDarkMode, setDarkModePreference } from '@tbwa_theme/js/dark_mode';

// Toggle dark mode
toggleDarkMode();

// Set specific preference
setDarkModePreference(true);  // Enable dark mode
setDarkModePreference(false); // Disable dark mode
```

## Shared Theme Tokens

The theme tokens are also available in JSON format at `shared/theme/tokens.json`. This can be used to:

- Generate CSS variables programmatically
- Share tokens between React and other frontends
- Build tools that need access to theme values

### Using Shared Tokens in React

```typescript
import tokens from '@shared/theme/tokens.json';

const primaryColor = `hsl(${tokens.colors.brand.yellow.hsl})`;
```

### Using Shared Tokens in Node.js/Build Scripts

```javascript
const tokens = require('../shared/theme/tokens.json');

// Generate CSS variables
const cssVars = Object.entries(tokens.colors.brand)
  .map(([name, value]) => `--tbwa-${name}: ${value.hsl};`)
  .join('\n');
```

## Integration with React Frontend

The Odoo theme is designed to be visually consistent with the React frontend defined in:
- `platforms/creative-ops/ces-jampacked/index.css`
- `platforms/creative-ops/ces-jampacked/tailwind.config.ts`

Both systems use:
- Same HSL color values
- Same CSS variable naming conventions
- Same typography (Inter font)
- Same spacing and border radius values
- Same shadow definitions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Styles Not Loading

1. Clear browser cache
2. Restart Odoo server
3. Run asset compilation: `odoo-bin -u tbwa_theme --stop-after-init`

### Dark Mode Not Working

1. Check browser localStorage for `tbwa_dark_mode` key
2. Verify JavaScript is loading (check console for errors)
3. Ensure `.dark` class is being applied to `<html>` element

### Colors Look Different

1. Verify color profile is consistent (sRGB)
2. Check that HSL values are correct
3. Ensure no conflicting stylesheets are loading

## License

LGPL-3.0

## Author

TBWA Agency

## Support

For issues and feature requests, please contact the TBWA development team.
