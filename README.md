# @nibin-org/tokens

<div align="center">

![npm version](https://img.shields.io/badge/version-1.14.0-5b47fb?style=for-the-badge&colorA=000000)
![npm downloads](https://img.shields.io/npm/dm/@nibin-org/tokens.svg?style=for-the-badge&colorA=000000&colorB=5b47fb)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&colorA=000000&colorB=5b47fb)

**Transform your design tokens into beautiful, interactive documentation.**

Visualize colors, spacing, typography, and more with zero configuration.

[Live Demo](https://nibin-org.github.io/tokens/) · [Figma Setup Guide](./GUIDE.md) · [Report Issue](https://github.com/nibin-org/tokens/issues)

</div>

---

## ✨ Why This Package?

Most design token documentation is boring, static, and hard to navigate. **@nibin-org/tokens** gives you:

- 🎨 **Beautiful Visuals** - Interactive color palettes, spacing scales, and component previews
- 🎮 **Interactive Playground** - Live preview components with your tokens and custom class names
- ⚡ **Instant Search** - Press `Cmd+K` to find any token instantly
- 📤 **Code Export** - Generate CSS, SCSS, JavaScript, or Tailwind configs with **premium syntax highlighting**
- 🌙 **Dark Mode** - Seamless theme switching built-in
- 🔗 **Smart Aliases** - Automatically resolves Figma Token Studio references
- 📦 **Zero Dependencies** - Lightweight and fast

> **Perfect for design systems, component libraries, and developer handoffs.**

---

## 🚀 Quick Start

### Installation

```bash
npm install @nibin-org/tokens
```

### Basic Usage

Import your tokens JSON file (from Figma Token Studio, Style Dictionary, or any W3C Design Token format) and you're done:

```tsx
import { TokenDocumentation } from '@nibin-org/tokens';
import '@nibin-org/tokens/styles.css';
import tokens from './tokens.json';

export default function DesignSystem() {
  return <TokenDocumentation tokens={tokens} />;
}
```

That's it! 🎉 Your tokens are now beautifully documented with:
- Interactive color swatches with hex/RGB values
- Visual spacing and sizing scales
- Border radius previews
- Copy-to-clipboard functionality
- Global search with `Cmd+K`

---

## 📋 What You Get

### Foundation Tokens
Display your primitive values (base colors, spacing units, sizes) with automatic color family grouping and visual scales.

### Semantic Tokens
Document intent-based tokens (primary, danger, success) with their resolved values and usage context.

### Component Tokens
Showcase component-specific overrides with mode switching (light/dark, compact/comfortable, etc.).

### Code Export
Generate production-ready code in multiple formats with **premium, high-contrast syntax highlighting**:
- **CSS** - Custom properties with proper scoping and `:root` support
- **SCSS** - Variables and comprehensive maps with color-coded keys
- **JavaScript** - Clean object structures for technical projects
- **Tailwind** - Ready-to-paste theme extensions in JS format

### 🎮 Interactive Playground
Test your tokens on real components before exporting. The playground includes:
- **Live Preview** - See token changes instantly on interactive UI elements
- **Custom Class Names** - Customize the output CSS/SCSS/Tailwind class names
- **Premium Themes** - Differentiated syntax highlighting for every language (Sublime Sass, Official Tailwind, etc.)

---

## 🎯 Advanced Usage

### Custom Components

Use standalone components to build custom documentation layouts:

```tsx
import { Colors, Spacing, Radius, Typography } from '@nibin-org/tokens';
import tokens from './tokens.json';

export default function CustomDocs() {
  return (
    <div className="design-system">
      <h1>Our Color Palette</h1>
      <Colors tokens={tokens} title="Brand Colors" />
      
      <h1>Spacing System</h1>
      <Spacing tokens={tokens} title="Layout Spacing" />
      
      <h1>Border Radius</h1>
      <Radius tokens={tokens} title="Corner Styles" />
    </div>
  );
}
```

### Configuration

Customize the appearance and behavior:

```tsx
<TokenDocumentation 
  tokens={tokens}
  title="Acme Design System"
  subtitle="v2.0.0"
  darkMode={true}
  onTokenClick={(token) => console.log('Token clicked:', token)}
/>
```

---

## 📖 Token Structure Guide

For the best experience, organize your tokens using our **recommended 3-layer architecture**:

### 🏗️ Layer 1: Foundation
Raw primitive values that form the foundation of your design system.

```json
{
  "Foundation/Value": {
    "base": {
      "blue": { "500": { "value": "#3B82F6", "type": "color" } }
    }
  }
}
```

### 🎨 Layer 2: Semantic  
Intent-based tokens that define how primitives should be used.

```json
{
  "Semantic/Value": {
    "fill": {
      "primary": { "value": "{base.blue.500}", "type": "color" }
    }
  }
}
```

### 🧩 Layer 3: Components
Component-specific overrides and variations.

```json
{
  "Components/Mode 1": {
    "button": {
      "bg": { "value": "{Semantic.fill.primary}", "type": "color" }
    }
  }
}
```

> **Need detailed setup instructions?** Check out our **[Figma Token Workflow Guide](./GUIDE.md)** for step-by-step instructions with screenshots.

---

## 🛠️ API Reference

### `<TokenDocumentation />`

Main component that renders the complete token documentation interface.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tokens` | `FigmaTokens` | **Required** | Design tokens object (W3C format) |
| `title` | `string` | `"Design Tokens"` | Main header title |
| `subtitle` | `string` | `"View and copy design tokens"` | Subtitle text |
| `darkMode` | `boolean` | `false` | Initial theme state |
| `onTokenClick` | `(token) => void` | `null` | Callback when token is clicked |

### Standalone Components

Each component accepts `tokens` and optional `title` prop:

- `<Colors tokens={tokens} />` - Color palette visualization
- `<Spacing tokens={tokens} />` - Spacing scale display
- `<Sizes tokens={tokens} />` - Size scale display  
- `<Radius tokens={tokens} />` - Border radius previews
- `<Typography tokens={tokens} />` - Font family and style display

---

## 🔍 Features Deep Dive

### Global Search (`Cmd+K`)
- **Fuzzy matching** - Find tokens by partial names
- **Multi-field search** - Search by name, value, or hex code
- **Keyboard navigation** - Arrow keys + Enter for speed
- **Instant results** - No lag, even with 1000+ tokens

### Code Export
Click the export button to generate:
- **CSS Variables** - `--token-name: value;`
- **SCSS Variables** - `$token-name: value;`
- **JavaScript Object** - `{ tokenName: 'value' }`
- **Tailwind Config** - `theme.extend.colors`

All exports include proper formatting, comments, and alias resolution.

### Alias Resolution
Automatically resolves token references in formats:
- `{category.item.value}` (Figma Token Studio)
- `$ref` (W3C DTCG)
- Nested references (recursive resolution)

---

## 🔗 Resources

- **[Live Demo](https://nibin-org.github.io/tokens/)** - Try it out with sample tokens
- **[Figma Setup Guide](./GUIDE.md)** - Complete workflow with screenshots
- **[GitHub Repository](https://github.com/nibin-org/tokens)** - Source code and examples
- **[Issue Tracker](https://github.com/nibin-org/tokens/issues)** - Report bugs or request features

---

## 💻 Local Development

Want to contribute or customize?

```bash
# Clone the repository
git clone https://github.com/nibin-org/tokens.git
cd tokens

# Install dependencies and build
npm install
npm run build

# Run the demo playground
cd demo
npm install
npm run dev
```

The demo will be available at `http://localhost:5173`

---

## 📝 Supported Token Types

| Type | Visualization | Features |
|------|--------------|----------|
| `color` | Color swatch cards | Hex, RGB, HSL, Contrast checker |
| `dimension` / `spacing` | Visual scale bars | Pixel/rem values, usage examples |
| `sizing` | Size previews | Width/height visualization |
| `borderRadius` | Corner previews | Interactive radius display |
| `typography` | Font previews | Family, weight, size display |

*More types coming soon!*

---

## 🤝 Contributing

We love contributions! Whether it's:
- 🐛 Bug fixes
- ✨ New features
- 📖 Documentation improvements
- 🎨 UI enhancements

Check out our [contributing guidelines](./CONTRIBUTING.md) to get started.

---

## 📄 License

MIT © [nibin-org](https://github.com/nibin-org)

---

## 👤 Author

**Nibin Kurian**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nibin-kurian)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nibin-org)

**Made with ❤️ for designers and developers**
