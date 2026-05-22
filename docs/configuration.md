# Configuration

## Purpose
Explain how `emily.config.json` controls tokens, output files, purge settings, and feature flags.

## Minimal Example
```json
{
  "output": {
    "css": "dist/emily.css",
    "fullCss": "dist/emily.full.css"
  },
  "manifest": true,
  "intellisense": true
}
```

## Extended Utilities
Use `extend.utilities` when a project needs a named custom utility that should be generated with the framework instead of written as an arbitrary value in templates.

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

This generates:

```css
.w-hero { width: 720px; }
.h-banner { height: 320px; }
```

Extended utility names are normal class names, so production purge can keep them when it finds matching class attributes in source files.

## Status
This is a starter stub. Full option-by-option reference will be expanded.
