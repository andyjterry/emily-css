# Framework Guides

**Last Updated:** 2026-05-23

EmilyCSS generates plain CSS — it works anywhere you can serve a stylesheet. The setup steps vary slightly by framework. `emily-css init` detects your framework and handles most of this automatically.

---

## Nuxt

**Output path:** `public/emily.css` → served at `/emily.css`

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/public/emily.css']
})
```

Run `emily-css init` and it configures this automatically. If you use `@fontsource` fonts, init also adds those imports to the `css` array.

---

## Next.js

**Output path:** `public/emily.css` → served at `/emily.css`

```tsx
// app/layout.tsx or pages/_app.tsx
import '../public/emily.css'
```

---

## Vite / Vue

**Output path:** `public/emily.css`

```js
// main.js or main.ts
import './public/emily.css'
```

Or link it directly in `index.html`:

```html
<link rel="stylesheet" href="/emily.css">
```

---

## Astro

**Output path:** `public/emily.css`

Import in your base layout:

```astro
---
// src/layouts/Base.astro
import '../public/emily.css'
---
```

Or use a `<link>` tag in the layout head:

```html
<link rel="stylesheet" href="/emily.css">
```

---

## Static HTML

**Output path:** `dist/emily.css` (default)

```html
<link rel="stylesheet" href="/dist/emily.css">
```

No build tool required. Generate the CSS with `emily-css build`, copy `dist/emily.css` to wherever your static server can find it.

---

## Drupal

**Output path:** `dist/emily.css`

Add to your theme's `.libraries.yml`:

```yaml
global-styling:
  css:
    theme:
      dist/emily.css: {}
```

EmilyCSS is well suited to Drupal — it generates flat, portable CSS with no runtime dependency and works alongside existing theme styles without conflict.

---

## Power Pages

**Output path:** `dist/emily.css`

Upload `emily.css` as a web file in your Power Pages site, then reference it in your page template or content snippet:

```html
<link rel="stylesheet" href="/emily.css">
```

EmilyCSS is a good fit for Power Pages because it requires no build pipeline at runtime and works inside the portal's restricted template environment.

---

## Notes

- `emily-css watch` regenerates on file changes during development — no purging, full utility set
- `emily-css purge` should run as part of your production build to strip unused classes
- The output CSS uses cascade layers (`@layer theme, base, components, utilities`) — if your existing styles conflict, check layer order
