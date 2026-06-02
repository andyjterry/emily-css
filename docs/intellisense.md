# IntelliSense

**Last Updated:** 2026-05-23

EmilyCSS can generate a metadata file that powers editor autocomplete for your generated utility classes.

---

## Enable in config

```json
{
  "intellisense": {
    "enabled": true,
    "output": "dist/emily.intellisense.json"
  }
}
```

Shorthand: `"intellisense": true` (outputs to `dist/emily.intellisense.json`)

The file is generated automatically on every `emily-css build`.

---

## VS Code extension

Full editor integration — autocomplete, hover docs, and class validation — is handled by the EmilyCSS VS Code extension. The extension reads the generated `emily.intellisense.json` from your project.

The extension lives at `C:\Users\andyj\Documents\Products\EmilyCSS Framework\vscode-extension` and is developed separately from the core package.

---

## What the file contains

The IntelliSense JSON lists every generated utility class with its CSS property and value. Tooling can read this to offer completions without parsing the CSS output directly.

---

## Notes

- The file is regenerated on every build — commit it if your tooling or CI needs it, otherwise add it to `.gitignore`
- The manifest (`emily.manifest.json`) is a richer schema v2 format with per-class metadata; the IntelliSense file is a lighter format optimised for editor speed
