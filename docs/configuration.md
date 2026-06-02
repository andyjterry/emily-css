# Configuration

**Last Updated:** 2026-05-23

`emily.config.json` is the single source of truth for tokens, output paths, purge behaviour, and feature flags. Running `emily-css init` generates a config based on your project type.

---

## Minimal config

```json
{
  "output": {
    "css": "dist/emily.css",
    "fullCss": "dist/emily.full.css"
  }
}
```

---

## Full option reference

### `name` / `description`

Metadata only. Used in `emily-css info` output and the manifest. No effect on CSS generation.

---

### `baseUnit` / `baseFontSize`

```json
{
  "baseUnit": "18px",
  "baseFontSize": "18px"
}
```

`baseFontSize` sets the `font-size` on the `html` element in the generated base layer. Both default to `16px` if omitted.

---

### `fontFamily`

```json
{
  "fontFamily": {
    "heading": "atkinson",
    "body": "inter"
  }
}
```

Font family names only — EmilyCSS does not import font files. Load fonts yourself via `@fontsource`, Google Fonts, or a self-hosted stylesheet. The init flow offers `@fontsource` install guidance.

---

### `colours`

```json
{
  "colours": {
    "brand": "#DB2777",
    "accent": "#F59E0B",
    "success": "#017F65",
    "warning": "#FFC107",
    "error": "#B20000",
    "neutral": "#57534E"
  }
}
```

Each hex generates a 10-shade OKLCH scale (`10` through `100`). Shade `80` is always the exact source hex. Generates `bg-*`, `text-*`, `border-*`, `fill-*`, `stroke-*`, and `accent-*` utilities for every shade.

Example: `bg-brand-80`, `text-brand-40`, `border-brand-90`.

---

### `semanticColours`

```json
{
  "semanticColours": {
    "dark": "#1A1A1A",
    "light": "#FAFAFA"
  }
}
```

Flat colour values with no shade scale. Used for high-contrast background/text pairs. Generates the same utility families as `colours`.

---

### `output`

```json
{
  "output": {
    "css": "dist/emily.css",
    "fullCss": "dist/emily.full.css"
  }
}
```

- `css` — path for the purged output (what you ship)
- `fullCss` — path for the full unpurged build (useful for development)

Framework detection during `init` sets sensible defaults: `public/emily.css` for Nuxt/Next/Vite/Astro, `dist/emily.css` for Drupal and static projects.

---

### `manifest`

```json
{
  "manifest": {
    "enabled": true,
    "output": "dist/emily.manifest.json"
  }
}
```

Shorthand: `"manifest": true`

Generates `emily.manifest.json` with schema v2. Each utility entry includes `layer`, `responsive`, `states`, `pseudo`, and `category` fields. Used by tooling, IntelliSense, and the migrate command.

---

### `intellisense`

```json
{
  "intellisense": {
    "enabled": true,
    "output": "dist/emily.intellisense.json"
  }
}
```

Shorthand: `"intellisense": true`

Generates a VS Code-compatible JSON schema for class name completions.

---

### `purge`

```json
{
  "purge": {
    "projectType": "Nuxt",
    "sourceDir": ".",
    "sourceGlobs": [
      "./**/*.{html,vue,astro,njk}"
    ],
    "ignore": [
      "node_modules",
      ".nuxt",
      "dist"
    ],
    "safelist": [
      "bg-dark",
      "text-light"
    ],
    "extensions": [".html", ".vue"]
  }
}
```

- `projectType` — used for display in `emily-css info`, not for build logic
- `sourceGlobs` — fast-glob patterns pointing at your templates/components
- `ignore` — directories excluded from scanning
- `safelist` — classes always kept even if not found in source (useful for dynamically-assembled class strings)
- `extensions` — file extensions scanned for class attributes

Run `emily-css purge` to apply purging. `emily-css build` generates the full CSS; purge is a separate step.

---

### `breakpoints`

```json
{
  "breakpoints": {
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px",
    "2xl": "1536px"
  }
}
```

Controls responsive variant prefixes (`sm:`, `md:`, etc.). All breakpoints are min-width.

---

### `spacing`

```json
{
  "spacing": {
    "scale": {
      "0": "0px",
      "1": "0.25rem",
      "4": "1rem",
      "px": "1px",
      "0.5": "0.125rem"
    },
    "borderWidths": [0, 2, 4, 8],
    "borderRadius": {
      "none": "0",
      "sm": "4px",
      "base": "8px",
      "lg": "16px",
      "full": "9999px"
    }
  }
}
```

`scale` drives `p-*`, `m-*`, `gap-*`, `w-*`, `h-*`, and all spacing utilities. Keys become class suffixes.

---

### `typography`

```json
{
  "typography": {
    "lineHeightRatio": 1.5,
    "fontWeights": {
      "light": 300,
      "normal": 400,
      "bold": 700
    },
    "fontSizes": [
      { "name": "sm", "value": "14px", "lineHeight": 1.5 },
      { "name": "base", "value": "16px", "lineHeight": 1.6 },
      { "name": "xl", "value": "20px", "lineHeight": 1.6 }
    ]
  }
}
```

`fontSizes` generates `text-sm`, `text-base`, `text-xl` etc. `fontWeights` generates `font-light`, `font-normal`, `font-bold` etc.

---

### `shadows`

```json
{
  "shadows": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "base": "0 4px 6px rgba(0,0,0,0.1)",
    "none": "none"
  }
}
```

Generates `shadow-sm`, `shadow-base`, `shadow-none` etc.

---

### `transitions`

```json
{
  "transitions": {
    "fast": "100ms",
    "base": "200ms",
    "slow": "300ms",
    "timing": "cubic-bezier(0.4, 0, 0.2, 1)"
  }
}
```

Generates `transition-fast`, `transition-base`, `transition-slow`. The `timing` key sets the easing function used across all transition utilities.

---

### `zIndex`

```json
{
  "zIndex": {
    "0": "0",
    "10": "10",
    "dropdown": "1000",
    "modal": "1040"
  }
}
```

Generates `z-0`, `z-10`, `z-dropdown`, `z-modal` etc.

---

### `opacity`

```json
{
  "opacity": [0, 5, 10, 25, 50, 75, 90, 95, 100]
}
```

Array of integers 0–100. Generates `opacity-0`, `opacity-50`, `opacity-100` etc.

---

### `formBase`

```json
{
  "formBase": true
}
```

Default: `false` (opt-in).

When `true`, applies base element styles to `input`, `select`, `textarea`, and `fieldset`. Off by default to avoid overriding CMS-generated markup in Drupal, Power Pages, and similar environments.

---

### `extend.utilities`

```json
{
  "extend": {
    "utilities": {
      "w-hero": { "property": "width", "value": "720px" },
      "h-banner": { "property": "height", "value": "320px" }
    }
  }
}
```

Custom one-off utilities generated into `@layer utilities` with full responsive and state variant support.

Extended utility names are normal class names, so the purge system keeps them when it finds them in source files. Use this for one or two project-specific values — if you're adding many, the token system is a better fit.

This generates:

```css
.w-hero { width: 720px; }
.h-banner { height: 320px; }
```
