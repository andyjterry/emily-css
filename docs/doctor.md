# Doctor

**Last Updated:** 2026-05-23

`emily-css doctor` scans your project for problems without running a build. It checks for unknown class names, common accessibility mistakes, and low-contrast token pairs.

---

## Basic usage

```bash
npx emily-css doctor
```

Run from your project root (where `emily.config.json` lives). Doctor reads your configured `sourceGlobs` to find HTML/template files and checks class names against the generated utility set.

---

## What it checks

### Unknown classes

Any class name found in your source files that isn't in the generated utility set. Doctor suggests the closest matching utility if one exists.

```
⚠  Unknown class: "bg-primary"
   Did you mean: bg-brand-80?
```

### Accessibility warnings

Non-blocking warnings for common patterns that signal accessibility problems:

- **Focus removal** — `outline-none` or `outline-0` without a replacement focus style
- **Same-token text and background** — e.g. `bg-brand-80 text-brand-80` (likely invisible text)
- **cursor-pointer on non-interactive elements** — `cursor-pointer` on a `div` or `span`

### Colour contrast

Doctor checks configured token colour pairs against WCAG AA thresholds:

- 4.5:1 for normal text
- 3:1 for large text (18px+ or 14px+ bold)

Low-contrast pairs produce warnings but do not cause doctor to exit with an error code by default.

---

## Strict contrast mode

```bash
npx emily-css doctor --strict-contrast
```

In strict mode, contrast failures cause `doctor` to exit with code `1`. Useful for CI gates where contrast is a hard requirement.

---

## Exit codes

| Code | Meaning |
|------|---------|
| `0`  | No errors (warnings are fine) |
| `1`  | Unknown classes found, or `--strict-contrast` with contrast failures |

---

## CI integration

```yaml
# .github/workflows/test.yml
- name: EmilyCSS doctor
  run: npx emily-css doctor
```

For strict contrast enforcement:

```yaml
- name: EmilyCSS doctor (strict)
  run: npx emily-css doctor --strict-contrast
```

---

## Notes

- Doctor requires a built output to check variant metadata — run `emily-css build` first if you're checking a fresh project.
- Warnings about accessibility are non-blocking. Doctor flags them because they're worth reviewing, not because they're guaranteed bugs.
- The purge safelist has no effect on doctor — it scans all class names it finds.
