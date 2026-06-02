# Installation

**Last Updated:** 2026-05-23

---

## Requirements

- Node.js >= 22.0.0
- A project with a `package.json`

---

## Install

```bash
npm install emily-css
```

---

## Initialise

```bash
npx emily-css init
```

The init flow detects your framework (Nuxt, Next, Vite, Astro, Vue, React, Drupal, or static) and sets sensible defaults for your output path. It prompts for:

- Brand and accent colours
- Heading and body fonts
- Corner style (square, subtle, or rounded)
- Optional `@fontsource` package installs

The result is an `emily.config.json` in your project root and npm scripts added to `package.json`.

**Flags:**

| Flag                   | Effect                                              |
|------------------------|-----------------------------------------------------|
| `--yes`                | Skip all prompts, use defaults                      |
| `--fresh`              | Overwrite an existing config from scratch           |
| `--use-existing`       | Keep existing config values, update scripts only    |
| `--skip-font-install`  | Skip the @fontsource install prompt                 |

---

## Build

```bash
npx emily-css build
```

Generates your CSS at the path configured in `output.css`. Optionally also generates the manifest and IntelliSense files if enabled in config.

---

## Link the CSS

Add your generated CSS to your project. The path depends on your `output.css` config and your framework.

**Static HTML:**
```html
<link rel="stylesheet" href="/dist/emily.css">
```

**Nuxt (`nuxt.config.ts`):**
```ts
export default defineNuxtConfig({
  css: ['~/public/emily.css']
})
```

**Vite/Vue:**
```js
// main.js or main.ts
import './public/emily.css'
```

**Astro:**
```astro
---
import '../public/emily.css'
---
```

---

## Development workflow

```bash
npx emily-css watch
```

Rebuilds on file changes. No purging in watch mode — you get the full utility set for development.

---

## Production build

```bash
npx emily-css build
npx emily-css purge
```

`purge` strips unused classes from the output CSS using your `purge.sourceGlobs` config. Typically reduces file size by ~94%.

---

## Uninstall

```bash
npx emily-css uninstall
```

Removes EmilyCSS scripts and runtime wiring from your project. Does not remove the npm package itself — run `npm uninstall emily-css` after if you want to remove it fully.

---

## Verify

```bash
npx emily-css info
```

Prints a project summary: version, detected framework, output path, CSS size (if built), and source file count.
