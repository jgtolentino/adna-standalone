# TBWA Docs Next

> Best-in-class documentation platform for TBWA Agency Databank

Based on the **Replicate Docs Next** spec - a documentation platform that combines generated API reference, runnable guides, interactive playground, and CI-validated snippets.

## Design System

Built on TBWA\SMP brand guidelines from the Suqi Analytics dashboard:

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-brand-primary` | `#000000` | TBWA Black |
| `--color-brand-secondary` | `#FFCC00` | TBWA Signature Yellow |
| `--color-brand-blue` | `#3B82F6` | Navigation, links |
| `--color-brand-teal` | `#14B8A6` | Accents |

### Typography

- **Body**: Inter
- **Code**: JetBrains Mono
- **Headings**: Inter (600-700 weight)

### Components

- `CodeBlock` - Syntax highlighted code with language tabs and copy
- `Callout` - Info/warning/error/success callouts
- `APIEndpoint` - API endpoint display with method badges
- `SchemaTable` - API schema field documentation
- `Sidebar` - Navigation matching Suqi dashboard

## Structure

```
docs-next/
├── src/
│   ├── components/     # React components
│   ├── lib/            # Utilities
│   ├── styles/         # Global CSS
│   └── hooks/          # React hooks
├── content/
│   ├── guides/         # How-to guides
│   ├── reference/      # API reference
│   └── examples/       # Code examples
├── gen/                # Generated reference pages
├── tokens/             # Design tokens
└── tools/              # Build tools
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
```

## Spec Files

See the full specification in:

- `.specify/memory/constitution.md` - Core principles
- `specs/001-replicate-docs-next/spec.md` - Product requirements
- `specs/001-replicate-docs-next/plan.md` - Implementation plan
- `specs/001-replicate-docs-next/tasks.md` - Task breakdown

## CI Validation

The documentation platform includes automated validation:

- Markdown linting
- Link checking
- TypeScript type checking
- Design token validation
- Spec file structure validation

## License

Internal TBWA\SMP use only.
