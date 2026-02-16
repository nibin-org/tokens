# Tokvista Migration Implementation Plan

## Goal
Rebrand and migrate npm package:

- @nibin-org/tokens
- to tokvista

Do this without breaking repository integrity and with clean deprecation of the old package.

## Phase 1 — Local Package Rename
1. Update package.json
Modify:

```
{
  "name": "tokvista",
  "version": "1.0.0",
  "description": "Interactive visual documentation for design tokens.",
  "repository": {
    "type": "git",
    "url": "https://github.com/<your-username>/tokvista.git"
  }
}
```

Important:

- Reset version to 1.0.0
- Update repository URL
- Update homepage field if exists
- Update bugs URL if exists

2. Update Internal References
Search entire repo for:

- @nibin-org/tokens

Replace with:

- tokvista

Update:

- README.md
- Installation instructions
- Demo folder package.json
- Docs site content
- Any CLI output text
- Any badges

3. Rename Repository
On GitHub:

- Go to Settings
- Rename repository: tokens → tokvista

GitHub automatically redirects old URLs.

## Phase 2 — Clean Build Verification
Before publishing:

- rm -rf node_modules
- rm package-lock.json
- npm install
- npm run build

Verify:

- No broken imports
- No old scoped references
- No build warnings

## Phase 3 — Publish New Package
Login:

- npm login

Publish:

- npm publish --access public

This creates:

- tokvista@1.0.0

on npm.

## Phase 4 — Deprecate Old Package
After successful publish:

- npm deprecate @nibin-org/tokens "Package renamed to tokvista. Please migrate."

This prevents future installs silently using old package.

## Phase 5 — Tag Release
Create Git tag:

- git tag v1.0.0
- git push origin v1.0.0

Optional but recommended.

## Phase 6 — README Repositioning
Update README header:

- # Tokvista
- The visual layer for your design system.

Add:

- ## Installation
- npm install tokvista

Add migration section:

- ## Migration from @nibin-org/tokens
- npm uninstall @nibin-org/tokens
- npm install tokvista

## Phase 7 — Post-Migration Checklist
- npm page shows correct name
- GitHub repo renamed
- Demo works
- Playground works
- No scoped references remain
- Old package deprecated

## Optional Phase 8 — Branding Upgrade
- Add logo
- Add hero banner
- Add roadmap section
- Add architecture diagram
- Add comparison section vs other tools

This helps for recruiters, open-source visibility, and startup positioning.

## Important Notes for Codex Agent
- Do not change package entry points (main, module, types) unless broken
- Do not modify internal export structure
- Only rename brand identity and references
- Ensure build passes before publish

## Final Result
Old:

- @nibin-org/tokens

New:

- tokvista
