# @nibin-org/tokens

<div align="center">

![npm version](https://img.shields.io/npm/v/@nibin-org/tokens.svg?style=for-the-badge&colorA=000000&colorB=5b47fb)
![npm downloads](https://img.shields.io/npm/dm/@nibin-org/tokens.svg?style=for-the-badge&colorA=000000&colorB=5b47fb)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&colorA=000000&colorB=5b47fb)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&colorA=000000&colorB=5b47fb)

### 🎨 Beautiful, Interactive Visual Documentation for Design Tokens

**Transform your Figma tokens into living, interactive documentation**

[View Demo](https://nibin-org.github.io/tokens/) · [Report Bug](https://github.com/nibin-org/tokens/issues) · [Request Feature](https://github.com/nibin-org/tokens/issues)

</div>

---

## ✨ Why @nibin-org/tokens?

Transform your static design tokens into **living, interactive documentation** that designers and developers will actually love using. Export from Figma, import into React, and get beautiful documentation instantly.

```tsx
import { TokenDocumentation } from '@nibin-org/tokens';
import '@nibin-org/tokens/styles.css';
import tokens from './tokens.json'; // Exported from Figma

<TokenDocumentation tokens={tokens} />
```

That's it. Beautiful documentation in one line. ✨

## 🎯 What's New in v1.8.0

<table>
  <tr>
    <td width="50%">
      <h3>🧩 Three-Tab Architecture</h3>
      <p>Organized navigation with <strong>Foundation</strong>, <strong>Semantic</strong>, and <strong>Components</strong> tabs for intuitive token discovery</p>
    </td>
    <td width="50%">
      <h3>📍 Sticky Sidebar Navigation</h3>
      <p>Each tab features a contextual sidebar - Colors, Spacing, Sizes in Foundation; Fill, Stroke, Text in Semantic</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🎯 Smart Color Grouping</h3>
      <p>Semantic colors automatically grouped by base color (e.g., all red variants together)</p>
    </td>
    <td width="50%">
      <h3>📋 One-Click Copy</h3>
      <p>Click any token to copy <code>var(--token-name)</code> format - ready to paste into CSS</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>⚡ Fixed Navbar</h3>
      <p>Persistent navigation bar with smooth scrolling and improved UX</p>
    </td>
    <td width="50%">
      <h3>🔧 Component Dimension Display</h3>
      <p>Component tokens show all dimensions (font-size, padding, radius) in organized groups</p>
    </td>
  </tr>
</table>

## 🚀 Quick Start

### Installation

```bash
npm install @nibin-org/tokens
# or
yarn add @nibin-org/tokens
# or
pnpm add @nibin-org/tokens
```

### Basic Usage

```tsx
import { TokenDocumentation } from '@nibin-org/tokens';
import '@nibin-org/tokens/styles.css';
import tokens from './tokens.json';

export default function DesignTokensPage() {
  return (
    <TokenDocumentation 
      tokens={tokens}
      title="My Design System"
      subtitle="Design tokens synced from Figma"
    />
  );
}
```

### Next.js Setup (Required)

For Next.js projects, add the package to `transpilePackages` in `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nibin-org/tokens'],
};

export default nextConfig;
```

> **💡 Tip**: If you experience issues with Next.js 16+ Turbopack during local development with linked packages, use `next dev --webpack` as a workaround.

## 📖 Figma Token Structure

This library works seamlessly with tokens exported from [Figma Tokens Studio](https://tokens.studio/). Here's the production-ready structure:

### Foundation Tokens

Foundation tokens define your base design primitives. Structure them under `Foundation/Value.base`:

```json
{
  "Foundation/Value": {
    "base": {
      "green": {
        "5": { "value": "#fafffc", "type": "color" },
        "10": { "value": "#ecfal4", "type": "color" },
        "50": { "value": "#28b97b", "type": "color" },
        "90": { "value": "#0e412b", "type": "color" }
      },
      "blue": {
        "5": { "value": "#f0f9ff", "type": "color" },
        "50": { "value": "#3b82f6", "type": "color" },
        "90": { "value": "#1e3a8a", "type": "color" }
      },
      "space": {
        "xs": { "value": "4px", "type": "dimension" },
        "sm": { "value": "8px", "type": "dimension" },
        "md": { "value": "16px", "type": "dimension" },
        "lg": { "value": "24px", "type": "dimension" }
      },
      "size": {
        "sm": { "value": "12px", "type": "dimension" },
        "md": { "value": "16px", "type": "dimension" },
        "lg": { "value": "24px", "type": "dimension" }
      },
      "radius": {
        "sm": { "value": "4px", "type": "dimension" },
        "md": { "value": "8px", "type": "dimension" },
        "lg": { "value": "16px", "type": "dimension" }
      },
      "font-size": {
        "sm": { "value": "12px", "type": "dimension" },
        "md": { "value": "14px", "type": "dimension" },
        "lg": { "value": "16px", "type": "dimension" }
      },
      "line-height": {
        "sm": { "value": "1.25", "type": "dimension" },
        "md": { "value": "1.5", "type": "dimension" },
        "lg": { "value": "1.75", "type": "dimension" }
      }
    }
  }
}
```

**CSS Variables Generated:**
- Colors: `--base-green-5`, `--base-blue-50`
- Spacing: `--base-space-md`
- Others: `--base-size-lg`, `--base-radius-md`

### Semantic Tokens

Semantic tokens reference foundation tokens and provide contextual meaning:

```json
{
  "Semantic/Value": {
    "fill": {
      "primary": { "value": "{base.blue.50}", "type": "color" },
      "success": { "value": "{base.green.50}", "type": "color" },
      "error": { "value": "{base.red.50}", "type": "color" }
    },
    "stroke": {
      "default": { "value": "{base.gray.30}", "type": "color" },
      "active": { "value": "{base.blue.50}", "type": "color" }
    },
    "text": {
      "primary": { "value": "{base.gray.90}", "type": "color" },
      "secondary": { "value": "{base.gray.60}", "type": "color" },
      "link": { "value": "{base.blue.50}", "type": "color" }
    }
  }
}
```

**CSS Variables Generated:**
- Fill: `--fill-primary`, `--fill-success`
- Stroke: `--stroke-default`, `--stroke-active`
- Text: `--text-primary`, `--text-link`

### Component Tokens

Component tokens define specific component properties:

```json
{
  "Components/Mode 1": {
    "button": {
      "font-size": {
        "sm": { "value": "{base.font-size.sm}", "type": "dimension" },
        "md": { "value": "{base.font-size.md}", "type": "dimension" },
        "lg": { "value": "{base.font-size.lg}", "type": "dimension" }
      },
      "padding": {
        "sm": { "value": "{base.space.sm}", "type": "dimension" },
        "md": { "value": "{base.space.md}", "type": "dimension" },
        "lg": { "value": "{base.space.lg}", "type": "dimension" }
      },
      "radius": {
        "sm": { "value": "{base.radius.sm}", "type": "dimension" },
        "md": { "value": "{base.radius.md}", "type": "dimension" }
      },
      "height": {
        "sm": { "value": "{base.size.xl}", "type": "dimension" },
        "md": { "value": "{base.size.2xl}", "type": "dimension" },
        "lg": { "value": "{base.size.3xl}", "type": "dimension" }
      }
    }
  }
}
```

## 🎨 Figma Setup Guide

### Step 1: Install Figma Tokens Studio

1. Open Figma
2. Go to Plugins → Browse all plugins
3. Install [Tokens Studio for Figma](https://tokens.studio/)

### Step 2: Create Token Sets

Create three token sets matching the structure above:

1. **Foundation/Value** - Your base design primitives
2. **Semantic/Value** - Contextual token references  
3. **Components/Mode 1** - Component-specific tokens

### Step 3: Organize Colors

For color tokens, use this naming convention:

```
base
  ├── green
  │   ├── 5 (lightest)
  │   ├── 10
  │   ├── 20
  │   ├── ...
  │   └── 90 (darkest)
  ├── blue
  ├── red
  └── gray
```

### Step 4: Set Up GitHub Sync

1. In Tokens Studio, click Settings → Sync
2. Choose "GitHub" as sync method
3. Authenticate with your GitHub account
4. Configure sync settings:
   - **Repository**: Your project repo
   - **Branch**: main (or your default branch)
   - **File Path**: `tokens.json`
   - **Commit message template**: `chore: update design tokens`

5. Click "Save" and perform initial sync

### Step 5: Enable Auto-Sync (Optional)

Enable "Push to GitHub on Save" for automatic updates whenever you modify tokens in Figma.

## 📋 Complete API Reference

### `<TokenDocumentation />` - Main Component

```tsx
<TokenDocumentation
  tokens={tokens}              // Required: Your tokens.json content
  title="Design Tokens"        // Optional: Page title
  subtitle="v1.8.0"           // Optional: Subtitle text
  onTokenClick={(token) => {   // Optional: Callback when token clicked
    console.log('Clicked:', token);
  }}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tokens` | `FigmaTokens` | **required** | Your tokens.json content |
| `title` | `string` | `"Design Tokens"` | Page title |
| `subtitle` | `string` | `"View and copy design tokens"` | Subtitle text |
| `onTokenClick` | `(token) => void` | `undefined` | Callback when token is clicked |

### Individual Components

For custom layouts, use components individually:

#### FoundationTab

```tsx
import { FoundationTab } from '@nibin-org/tokens';

<FoundationTab 
  tokens={tokens['Foundation/Value'].base}
  tokenMap={tokenMap}
  onTokenClick={(token) => console.log(token)}
/>
```

#### SemanticTab

```tsx
import { SemanticTab } from '@nibin-org/tokens';

<SemanticTab 
  tokens={tokens['Semantic/Value']}
  tokenMap={tokenMap}
  onTokenClick={(token) => console.log(token)}
/>
```

#### ComponentsTab

```tsx
import { ComponentsTab } from '@nibin-org/tokens';

<ComponentsTab 
  components={mergedComponents}
  onCopy={(value, label) => console.log(value)}
/>
```

#### SpacingScale

```tsx
import { SpacingScale } from '@nibin-org/tokens';

<SpacingScale 
  tokens={tokens['Foundation/Value'].base.space}
  onTokenClick={(token) => console.log(token)}
/>
```

#### SizeScale

```tsx
import { SizeScale } from '@nibin-org/tokens';

<SizeScale 
  tokens={tokens['Foundation/Value'].base.size}
  onTokenClick={(token) => console.log(token)}
/>
```

#### RadiusShowcase

```tsx
import { RadiusShowcase } from '@nibin-org/tokens';

<RadiusShowcase 
  tokens={tokens['Foundation/Value'].base.radius}
  onTokenClick={(token) => console.log(token)}
/>
```

## 🎯 Production Workflow

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│                 │      │                  │      │                 │
│   Figma +       │─────▶│  tokens.json    │─────▶│   Live Docs +   │
│   Token Studio  │      │  (GitHub Sync)   │      │   CSS Variables │
│                 │      │                  │      │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
         │                         │                        │
    Design tokens            Auto-sync via             @nibin-org/tokens
    managed in Figma         Token Studio              generates beautiful
                             plugin                     interactive docs
```

### Benefits

✅ **Single Source of Truth**: Figma remains the design authority  
✅ **Automatic Sync**: Changes in Figma instantly update documentation  
✅ **Developer-Friendly**: JSON format works with any build system  
✅ **Visual Documentation**: Interactive docs that designers and developers love  
✅ **Token References**: Semantic tokens automatically resolve base values  
✅ **Version Control**: All changes tracked in Git with full history

## 🎨 UX Features

### Smart Copy Behavior

Click any token to copy the full CSS variable format:

- **Foundation colors**: Copies `var(--base-blue-50)` 
- **Semantic colors**: Copies `var(--fill-primary)`
- **Spacing**: Copies `var(--base-space-md)`
- **Sizes**: Copies `var(--base-size-lg)`

Ready to paste directly into your CSS! ✨

### Responsive Toast Notifications

- ✅ Shows what was copied
- ✅ Auto-dismisses after 2 seconds
- ✅ Handles rapid clicking (clears previous toast)
- ✅ Premium animation

### Visual Hierarchy

- **Full cards are clickable** - Entire token card is the click target
- **Variables highlighted** - CSS variable name shown with opacity
- **Hex values for reference** - Display-only, not separately clickable
- **Cursor feedback** - Pointer cursor on clickable areas only

## 🛠️ Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/nibin-org/tokens.git
cd tokens

# Install dependencies
npm install

# Build the package
npm run build

# Run demo in development mode
cd demo
npm install
npm run dev
```

### Project Structure

```
@nibin-org/tokens/
├── src/
│   ├── components/
│   │   ├── TokenDocumentation.tsx    # Main wrapper component
│   │   ├── FoundationTab.tsx         # Foundation token display (v1.8.0)
│   │   ├── SemanticTab.tsx           # Semantic token display (v1.8.0)
│   │   ├── ComponentsTab.tsx         # Component token display (v1.8.0)
│   │   ├── SpacingScale.tsx          # Spacing visualization
│   │   ├── SizeScale.tsx             # Size visualization
│   │   └── RadiusShowcase.tsx        # Border radius showcase
│   ├── types.ts                      # TypeScript definitions
│   ├── utils.ts                      # Utility functions
│   ├── index.ts                      # Package exports
│   └── styles.css                    # Component styles
├── demo/                             # Next.js demo app
├── dist/                             # Built files (generated)
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

### Building

```bash
npm run build
```

This generates:
- `dist/index.js` - ESM bundle
- `dist/index.cjs` - CommonJS bundle
- `dist/index.d.ts` - TypeScript definitions
- Styles copied to dist for import

## 📝 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```tsx
import type { 
  TokenDocumentationProps,
  FigmaTokens,
  ParsedColorToken,
  NestedTokens
} from '@nibin-org/tokens';

const tokens: FigmaTokens = {
  'Foundation/Value': {
    base: { /* ... */ }
  },
  'Semantic/Value': {
    fill: { /* ... */ }
  }
};

const handleTokenClick = (token: ParsedColorToken) => {
  console.log(token.cssVariable); // Type-safe!
  console.log(token.value); // Type-safe!
};
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'release: Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Publishing (Maintainers)

The package auto-publishes to npm when commit messages contain `release:`:

```bash
git commit -m "release: Version 1.8.0 - Enhanced sidebar navigation"
git push origin main
```

The GitHub Action will automatically:
- Run tests
- Build the package
- Publish to npm with provenance

## 📄 License

MIT © [nibin-org](https://github.com/nibin-org)

See [LICENSE](LICENSE) for more information.

## 🙏 Acknowledgments

- Built with ❤️ for design systems teams
- Inspired by [Figma Tokens Studio](https://tokens.studio/)
- Compatible with [Style Dictionary](https://amzn.github.io/style-dictionary/)

## 📬 Support

- 💬 [GitHub Discussions](https://github.com/nibin-org/tokens/discussions)
- 🐛 [Issue Tracker](https://github.com/nibin-org/tokens/issues)
- 📖 [Live Demo](https://nibin-org.github.io/tokens/)

---

<div align="center">

**[⬆ back to top](#nibin-orgtokens)**

Made with ❤️ for design systems

</div>