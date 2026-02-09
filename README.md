# @nibin-org/tokens

<div align="center">

![npm version](https://img.shields.io/npm/v/@nibin-org/tokens?style=for-the-badge&colorA=000000&colorB=5b47fb)
![npm downloads](https://img.shields.io/npm/dm/@nibin-org/tokens.svg?style=for-the-badge&colorA=000000&colorB=5b47fb)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&colorA=000000&colorB=5b47fb)

**Transform your design tokens into a premium, interactive documentation site.**

Visualize colors, spacing, typography, and component tokens with zero configuration.

[Live Demo](https://nibin-org.github.io/tokens/) · [Figma Setup Guide](./GUIDE.md) · [Report Issue](https://github.com/nibin-org/tokens/issues)

</div>

---

## Why This Package

Design token documentation is often static and hard to scan. **@nibin-org/tokens** gives you:

- Beautiful visuals for colors, spacing, sizes, radius, and typography
- Instant search with `Cmd+K` / `Ctrl+K`
- Copy-ready CSS variables and resolved values
- Semantic + component token views with aliases resolved
- Built-in dark mode
- Interactive playground for previews
- No runtime dependencies (React only)

---

## Quick Start

### Install

```bash
npm install @nibin-org/tokens
```

### Use

```tsx
import { TokenDocumentation } from '@nibin-org/tokens';
import '@nibin-org/tokens/styles.css';
import tokens from './tokens.json';

export default function DesignSystem() {
  return <TokenDocumentation tokens={tokens} />;
}
```

---

## What You Get

### Foundation Tokens
Visualize base tokens like colors, spacing, sizes, radius, and typography.

### Semantic Tokens
Show intent-based tokens with resolved values and quick copy.

### Component Tokens
Document component overrides with clean visual grouping.

### Code Export
Export CSS, SCSS, JavaScript, or Tailwind config with high‑contrast syntax highlighting.

### Playground
Preview components using your tokens and custom class names.

---

## Token Structure (Recommended)

### Foundation
```json
{
  "Foundation/Value": {
    "base": {
      "blue": { "500": { "value": "#3B82F6", "type": "color" } }
    }
  }
}
```

### Semantic
```json
{
  "Semantic/Value": {
    "fill": {
      "primary": { "value": "{base.blue.500}", "type": "color" }
    }
  }
}
```

### Components
```json
{
  "Components/Mode 1": {
    "button": {
      "bg": { "value": "{Semantic.fill.primary}", "type": "color" }
    }
  }
}
```

Need a full setup guide? See **[GUIDE.md](./GUIDE.md)**.

---

## API Reference

### `TokenDocumentation`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tokens` | `FigmaTokens` | Required | Tokens object (W3C format or Token Studio) |
| `title` | `string` | `"Design Tokens"` | Main header title |
| `subtitle` | `string` | `"View and copy design tokens"` | Subtitle text |
| `darkMode` | `boolean` | `false` | Initial theme state |
| `onTokenClick` | `(token) => void` | `undefined` | Callback when a token is clicked |

### Standalone Components

Use these to build custom layouts:

- `Colors`
- `Spacing`
- `Sizes`
- `Radius`
- `Typography`

Each accepts `tokens` and optional `title`.

---

## Search and Copy

- Search across token names and values
- Keyboard navigation with Enter to focus
- Copy action returns `var(--token)` when available

---

## Production Ready

- ESM and CJS builds
- Typed exports
- CSS delivered as a single file
- No runtime dependencies besides React
- Compatible with modern React and Next.js

---

## Local Development

```bash
# root package
npm install
npm run build

# demo app
cd demo
npm install
npm run dev
```

Demo will run at `http://localhost:3000`.

---

## Resources

- [Live Demo](https://nibin-org.github.io/tokens/)
- [Figma Setup Guide](./GUIDE.md)
- [GitHub Repository](https://github.com/nibin-org/tokens)
- [Issue Tracker](https://github.com/nibin-org/tokens/issues)

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT © [nibin-org](https://github.com/nibin-org)
