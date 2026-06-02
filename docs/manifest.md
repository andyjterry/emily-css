# Manifest

**Last Updated:** 2026-05-23

`emily-css manifest` generates `emily.manifest.json` — a machine-readable description of every utility class in your build. Schema v2 ships with EmilyCSS v2.0.0+.

---

## Enable in config

```json
{
  "manifest": {
    "enabled": true,
    "output": "dist/emily.manifest.json"
  }
}
```

Shorthand: `"manifest": true`

Generated automatically on every `emily-css build` when enabled. Also available as a standalone command:

```bash
npx emily-css manifest
```

---

## Schema v2 shape

```json
{
  "schemaVersion": "1",
  "manifestVersion": "1.1.0",
  "package": "emily-css",
  "version": "2.0.2",
  "generatedAt": "2026-05-23T10:00:00.000Z",
  "utilities": [
    {
      "class": "bg-brand-80",
      "category": "colour",
      "property": "background-color",
      "value": "oklch(52% 0.22 350)",
      "token": "var(--color-brand-80)",
      "declarations": [
        { "property": "background-color", "value": "oklch(52% 0.22 350)" }
      ],
      "variants": {
        "responsive": ["sm", "md", "lg", "xl", "2xl"],
        "states": ["hover", "focus", "focus-visible", "active", "disabled", "dark"]
      },
      "source": "generated-css"
    }
  ]
}
```

### Fields

| Field            | Type     | Description                                              |
|------------------|----------|----------------------------------------------------------|
| `schemaVersion`  | string   | Always `"1"` — tracks breaking schema changes           |
| `manifestVersion`| string   | Semver of the manifest generator itself                  |
| `package`        | string   | npm package name                                         |
| `version`        | string   | Package version at time of generation                    |
| `generatedAt`    | string   | ISO 8601 timestamp                                       |
| `utilities`      | array    | One entry per utility class                              |

### Per-utility fields

| Field          | Type     | Description                                              |
|----------------|----------|----------------------------------------------------------|
| `class`        | string   | The class name without leading `.`                       |
| `category`     | string   | Inferred category (`colour`, `spacing`, `typography`, etc.) |
| `property`     | string   | Primary CSS property                                     |
| `value`        | string   | Computed value                                           |
| `token`        | string \| null | CSS custom property reference if token-driven      |
| `declarations` | array    | All `{ property, value }` pairs in the rule              |
| `variants`     | object   | `responsive` and `states` arrays listing available variants |
| `source`       | string   | Always `"generated-css"` for framework output            |

---

## What it powers

- `emily-css migrate` — reads the manifest to match Tailwind classes against available EmilyCSS equivalents
- VS Code extension — reads the manifest for completions and hover documentation
- `emily-css doctor` — uses the manifest to validate class names found in source files
- Custom tooling — any tool that needs a structured list of available utilities

---

## Versioning

The manifest is regenerated on every build. If you commit it, treat it like a generated lockfile — meaningful diffs show what utilities changed between versions. If you don't need it in version control, add `emily.manifest.json` to `.gitignore`.
