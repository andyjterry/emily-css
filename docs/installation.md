# Installation

## Purpose
Set up EmilyCSS in a Node/CommonJS project and generate your first CSS build.

## Minimal Example
```bash
npm install emily-css
npx emily-css init
npx emily-css build
```

## Notes
- `init` detects your framework and chooses a project-appropriate default output path for `emily.css`.
- If an existing `emily.config.json` is found, `init` lets you choose to reuse current values or start fresh.
- If you choose non-system fonts, `init` can optionally install matching `@fontsource/*` packages.
- Helpful flags:
  - `npx emily-css init --fresh`
  - `npx emily-css init --use-existing`
  - `npx emily-css init --skip-font-install`
  - `npx emily-css init --yes`

## Status
This is a starter stub. Expanded install guides for framework-specific setups are still in progress.
