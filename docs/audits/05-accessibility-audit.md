# Accessibility Specialist Audit

Audit date: 2026-05-22

Scope: `src/generators/accessibility.js`, focus/form components in `src/index.js`, doctor warnings, docs, manifest, generated CSS.

## Current Accessibility Strengths

- `.sr-only` exists and uses the conventional visually-hidden pattern.
- `.not-sr-only` exists.
- `.sr-only-focusable:not(:focus):not(:focus-within)` exists.
- `.skip-link` exists and reveals on focus.
- `.focus-ring`, `.focus-ring-inset`, and `.focus-ring-none` exist.
- `.touch-target` exists with a 24px minimum hit area pseudo-element.
- Reduced-motion helpers exist for `motion-reduce:transition-none`, `motion-reduce:animate-none`, and `motion-safe:transition`.
- Forced-colors helpers exist for `forced-colors:outline`, `forced-colors:outline-1`, and `forced-colors:forced-color-adjust-none`.
- ARIA/data-state variants exist for expanded, selected, checked, current, disabled, open/closed, checked/unchecked, active/inactive.
- Form defaults provide visible focus styling, larger checkbox/radio controls, invalid border treatment, and error-summary styles.
- Doctor includes non-failing warnings for low-contrast tokens, same-token text/background, focus-ring removal, cursor-pointer misuse, and missing font packages.

## High-Priority Findings

### 1. Docs use the wrong skip-link class

- Evidence: `docs/accessibility.md` example uses `skip-to-content`, but generated CSS defines `.skip-link`.
- Impact: users following docs get no skip-link behavior.
- Fix: change docs and examples to `.skip-link`, or add `.skip-to-content` as an alias.
- Priority: P0.

### 2. Manifest omits key accessibility utilities

- Evidence: manifest lacks `focus-ring`, `focus-ring-inset`, `focus-ring-none`, and `sr-only-focusable`.
- Cause: manifest skips selectors with pseudo selectors after the class.
- Impact: IntelliSense/doctor/migrate can fail to represent accessible utilities accurately.
- Fix: record intentional pseudo-class utilities in manifest.
- Priority: P0.

### 3. `.focus-ring-none` is hazardous as a first-class utility

- Evidence: `.focus-ring-none:focus-visible { outline: none; }` exists.
- Mitigation exists: doctor warns when no replacement focus utility is present.
- Impact: users can still ship inaccessible focus removal, especially without running doctor.
- Fix: keep only if strongly documented; consider renaming to `.focus-ring-reset` or requiring replacement patterns in docs.
- Priority: P1.

### 4. Generic motion/forced-colors support is overstated

- Evidence: constants list `motion-reduce`, `motion-safe`, and `forced-colors` as variants, but CSS only includes a few explicit classes.
- Impact: users may expect `motion-reduce:animate-spin` or `forced-colors:border-brand-80` to work when not generated.
- Fix: either generate constrained variants broadly or document them as explicit utility classes only.
- Priority: P1.

### 5. Colour contrast is warned, not enforced

- Evidence: doctor reports many low-contrast token warnings for the default config, including `text-brand-80` at about `4.4:1` on light backgrounds and warning/accent shades around `1.5-2.1:1`.
- Impact: “accessibility-native” claims are only partially enforced. Tokens can produce low-contrast text utilities.
- Fix: document contrast assumptions, add optional strict mode, and consider generating `on-*` accessible foreground tokens.
- Priority: P1.

### 6. Touch target helper only targets 24px

- Evidence: `.touch-target::before` uses `max(100%, 24px)`.
- Impact: meets WCAG 2.2 minimum target size exception area, but many touch-first UIs expect 44px.
- Fix: add `.target-44` or `.touch-target-lg`.
- Priority: P2.

### 7. Focus styles are not consistently tokenized

- Evidence: `.focus-ring` uses `var(--color-brand-80)`, while component form/button focus often uses `var(--color-neutral-80)` plus `--focus-ring-glow`.
- Impact: focus appearance varies by component and utility.
- Fix: introduce `--focus-ring-color`, `--focus-ring-width`, and `--focus-ring-offset` variables.
- Priority: P2.

### 8. Skip link has hard-coded physical placement

- Evidence: `.skip-link:focus` uses `top: 1rem; left: 1rem`.
- Impact: less friendly for RTL/logical layout systems.
- Fix: use logical properties: `inset-block-start`, `inset-inline-start`.
- Priority: P3.

### 9. ARIA current only supports `aria-current="page"`

- Evidence: variant selector is `[aria-current="page"]`.
- Impact: valid ARIA current values such as `step`, `location`, `date`, `time`, and `true` are not supported.
- Fix: add variants such as `aria-current-page:*`, `aria-current-step:*`, or use `[aria-current]:not([aria-current="false"])`.
- Priority: P2.

### 10. Disabled support is split between native and ARIA

- Evidence: `disabled:*` uses `:disabled`; `aria-disabled:*` exists separately.
- Impact: good foundation, but docs need to explain semantic differences and keyboard handling for `aria-disabled`.
- Fix: document `aria-disabled` must be paired with JS behavior to prevent activation.
- Priority: P3.

## Utility-Specific Review

- `sr-only`: good baseline; consider adding `clip-path: inset(50%)` for modern robustness while keeping `clip` fallback.
- `not-sr-only`: present and useful.
- `sr-only-focusable`: present in CSS, missing from manifest.
- `skip-link`: present; docs mismatch; logical placement improvement recommended.
- `focus-ring`: present; should use shared focus tokens and be in manifest.
- `forced-colors`: explicit helper classes present; broader support unclear.
- `reduced-motion`: explicit helper classes present; broader support unclear.
- `target-size`: `.touch-target` exists; add 44px option.
- Form accessibility: good starting defaults; docs should show label/hint/error associations.
- ARIA/state utilities: useful; need expanded `aria-current` support and docs.

## Documentation Gaps

- `docs/accessibility.md` is a starter stub and contains a wrong class name.
- There is no guidance for:
  - when to use `.sr-only` vs `.sr-only-focusable`;
  - safe use of `.focus-ring-none`;
  - reduced-motion classes;
  - forced-colors classes;
  - ARIA/data-state variants;
  - accessible form markup;
  - contrast warnings and token selection;
  - touch target helpers.

## Recommended Accessibility Release Scope

For v1.5.0:

1. Fix skip-link docs/class alias immediately.
2. Fix manifest/IntelliSense for pseudo-class accessibility utilities.
3. Add shared focus ring tokens.
4. Add strict contrast mode to doctor.
5. Add accessible form examples and ARIA/data-state docs.
6. Add larger target-size helpers.
