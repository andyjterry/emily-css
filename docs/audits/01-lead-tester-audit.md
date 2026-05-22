# Lead Tester Audit

Audit date: 2026-05-22

Scope: `tests/test.js`, `src/test/e2e.test.js`, generator source, CLI entrypoint, purge, manifest, docs, and committed `dist` output.

## Verification Performed

- Ran `npm test`: passed.
- Result: `394/394` main tests passed, followed by 60 randomized config-abuse runs with 0 unhandled crashes.
- Compared committed `dist/emily.css` against a fresh `buildFullFramework()` output in a temp project.
- Checked committed manifest metadata against `package.json`.

## Current Coverage Strengths

- Unit and integration coverage is broad for colour scale generation, spacing, borders, colour utilities, typography, spacing utilities, state variants, responsive variants, purge extraction, config shape checks, font output, generated CSS presence, many utility families, CLI basics, init/uninstall helpers, manifest, IntelliSense, doctor, and migration.
- CSS output tests check actual generated CSS strings for many utilities, not only snapshots.
- Purge tests cover static class attributes, variant classes, responsive classes, decimal class names, Vue object syntax, template strings, and basic false-positive filtering.
- Manifest tests cover base utility extraction, skipped expanded variant selectors, combinator selectors, fallback/custom responsive variants, and IntelliSense payloads.
- Accessibility-specific tests exist for `.sr-only-focusable`, `.focus-ring`, `.focus-ring-inset`, `.focus-ring-none`, doctor focus warnings, ARIA/data variants, and contrast helper math.
- CLI tests cover `version`, no-command usage, unknown commands, `build --profile`, `doctor`, `migrate`, `help`, and package contents.

## High-Priority Findings

### 1. Committed `dist` does not match current full generator output

- Evidence: fresh temp `buildFullFramework()` generated `dist/emily.css` at about `7,322,044` bytes. Committed `dist/emily.css` is `128,141` bytes and is minified/purged.
- Evidence: committed `dist/emily.manifest.json` reports package version `1.2.10`; `package.json` is `1.2.20`; a fresh manifest reports `1.2.20`.
- Risk: tests mostly build in temp directories and do not fail when committed `dist` is stale or production-purged.
- Add tests:
  - A dist freshness test that compares committed `dist` metadata to `package.json`, if `dist` is intended to be authoritative.
  - Or a packaging test asserting `dist` is intentionally excluded and should not be used as source of truth.

### 2. Manifest misses pseudo-class accessibility utilities

- Evidence: `src/generators/accessibility.js` defines `.focus-ring:focus-visible`, `.focus-ring-inset:focus-visible`, `.focus-ring-none:focus-visible`, and `.sr-only-focusable:not(...)`.
- Evidence: `dist/emily.manifest.json` contains `sr-only`, `not-sr-only`, `skip-link`, and `touch-target`, but not `focus-ring`, `focus-ring-inset`, `focus-ring-none`, or `sr-only-focusable`.
- Cause: manifest extraction skips selectors whose class is followed by pseudo selectors.
- Risk: doctor/migrate/IntelliSense may under-report supported accessibility utilities.
- Add tests:
  - Manifest should include base class metadata for intentional pseudo-class utilities.
  - Doctor should accept `focus-ring`, `focus-ring-inset`, and `sr-only-focusable` from manifest, not only via shims.

### 3. Variant metadata overstates generated support

- Evidence: `BASE_VARIANTS` includes `motion-reduce`, `motion-safe`, and `forced-colors`, and manifest entries list them as variants.
- Evidence: generator only creates explicit accessibility media-query classes such as `.motion-reduce\:transition-none`, `.motion-reduce\:animate-none`, `.motion-safe\:transition`, and `.forced-colors\:outline`; it does not generate generic `motion-reduce:*` or `forced-colors:*` variants for every utility.
- Risk: editor tooling and doctor can imply classes exist when CSS does not.
- Add tests:
  - For representative classes, assert manifest variants only include variants generated generically.
  - Add explicit manifest entries for special media-query utilities or mark special variants as constrained.

### 4. Tests accept some invalid config as successful output

- Evidence: randomized e2e run marked cases such as `wrong-type-transitions-string`, `transition-negative-base`, `transition-number-types`, `breakpoints-wrong-type`, `transition-timing-malicious`, and `colours-empty-object` as graceful successes.
- Risk: dangerous or malformed values can pass validation and be emitted into CSS variables or generation paths.
- Add tests:
  - Deterministic validation tests for `transitions`, `breakpoints`, `typography`, `shadows`, `zIndex`, `semanticColours`, and empty `colours`.
  - Reject transition timing values containing `;`, `url(`, unmatched parentheses, or non-timing keywords.

### 5. No snapshot or golden-file tests for full CSS structure

- Evidence: there are many string-inclusion tests, but no stable golden output test for layers, ordering, representative generated sections, or minified production output.
- Risk: broad changes can reorder, duplicate, or drop utility sections without obvious failure if sampled strings remain.
- Add tests:
  - Golden smoke snapshots for full build section order and one representative rule per generator.
  - Separate production build fixture asserting purge/minify behavior and retained `@layer` wrappers.

### 6. Purge tests do not cover common dynamic class patterns deeply enough

- Current coverage includes template strings and Vue object keys.
- Missing coverage:
  - React arrays/conditional helpers (`clsx`, `classnames`, ternaries).
  - Svelte/Astro class directives.
  - Safelist pattern behavior, not only literal safelist.
  - Classes inside Markdown fenced examples if docs are scanned.
  - Negative escaped classes and slash classes in production purge (`-translate-x-4`, `w-1/2`, `basis-1/3`).

### 7. CLI tests do not fully cover watch/release/ship consistency

- `watch.js` helpers are tested, but long-running watch rebuild behavior is not tested through the CLI.
- Release/ship scripts are not tested with mocked git/npm flows.
- Package scripts omit `emily:uninstall` while init adds it; tests check CLI help includes uninstall, but package script parity is incomplete.

## Brittle or Misleading Tests

- Some tests assert literal formatting strings, which is useful for generated CSS but brittle when harmless formatting changes occur.
- The randomized e2e runner is useful for crash detection but not deterministic enough to guarantee every abuse case on every run.
- Test section naming includes future-facing labels such as `v1.3.0` while current package is `1.2.20`; this is confusing in release audit output.
- Some purge tests say “keeps hover variants when base class is used”, but the fixture uses the variant class itself, not just the base class.

## Missing Test Areas by Requested Category

- Unit tests: strong, but validation units need more config keys.
- Snapshot tests: missing.
- CLI tests: good for short commands; weak for watch, release, ship, uninstall end-to-end.
- CSS output tests: broad sampled coverage; no golden full/prod outputs.
- Utility generation tests: good for many families; still missing assertions for every public class family.
- Variant tests: strong for hover/focus/ARIA/data/responsive; weak for dark, motion, forced-colors, group/peer expectations.
- Purge tests: good basics; weak dynamic framework patterns.
- Manifest tests: strong basics; misses pseudo-class utility inclusion and constrained variants.
- Accessibility utility tests: good generator presence; weak manifest/docs/doctor integration for pseudo utilities.
- Regression tests: many patch-regression tests exist, but they are concentrated in one huge file.
- Edge cases: randomized abuse helps, but should become deterministic for every known invalid config family.

## Practical Test Plan

1. Add deterministic validation tests for currently graceful malformed config fields.
2. Add manifest tests for pseudo-class accessibility utilities and constrained variant metadata.
3. Add golden CSS smoke tests for full and production output using a tiny fixture project.
4. Add purge fixtures for React/JS class composition, slash classes, negative classes, safelist patterns, and framework syntax.
5. Split `tests/test.js` by domain once behavior is locked; keep a root runner for local simplicity.
