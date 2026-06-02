# Release Action Plan

Audit date: 2026-05-22
Restructured: 2026-05-22

This plan is written for autonomous agent execution. Each task defines exact files, exact functions, step-by-step instructions, and required test assertions. Tasks are ordered by dependency within each phase. Complete all tasks in a phase before moving to the next.

Breaking changes are isolated to Phase 4 (v2.0.0). Phases 1–3 are purely additive or corrective — no existing class names change, no config keys are removed, no default outputs change.

---

## Phase 1 — v1.2.x Patch

These are correctness fixes. No new features. Run `npm test` after each task and confirm all tests pass before continuing.

---

### Task 1 — Resolve stale `dist` policy

**Files:** `dist/`, `.gitignore`, `tests/test.js`, `package.json`

**Instructions:**
1. Add `dist/` to `.gitignore`.
2. Delete `dist/emily.css` and `dist/emily.manifest.json` from source control (`git rm dist/emily.css dist/emily.manifest.json`).
3. In `tests/test.js`, add a test asserting that `dist/emily.css` does not exist in the repo (i.e. is in `.gitignore` and not tracked). Check `.gitignore` content for the `dist/` entry.
4. Update `README.md` to note that `dist/` is generated at build time and not committed.

**Tests required:**
- Assert `dist/` is listed in `.gitignore`.
- Assert `dist/emily.css` is not a tracked git file.

**Depends on:** nothing

---

### Task 2 — Fix accessibility docs class mismatch

**Files:** `docs/accessibility.md`, `src/generators/accessibility.js`

**Instructions:**
1. In `docs/accessibility.md`, replace every occurrence of `.skip-to-content` with `.skip-link`.
2. In `src/generators/accessibility.js`, add `.skip-to-content` as an alias:
   ```css
   .skip-to-content { /* alias for .skip-link */ }
   .skip-to-content:focus { /* same rules as .skip-link:focus */ }
   ```
3. Add a test asserting generated CSS contains `.skip-to-content`.

**Tests required:**
- Assert generated CSS contains `.skip-to-content`.
- Assert `docs/accessibility.md` contains `.skip-link` and not `.skip-to-content` as the primary example.

**Depends on:** nothing

---

### Task 3 — Fix manifest omission for pseudo-class accessibility utilities

**Files:** `src/manifest.js`, `tests/test.js`

**Instructions:**
1. In `src/manifest.js`, locate `extractManifestClassSelectors()` (or equivalent function that parses CSS selectors).
2. Add a known-pseudo-utilities allowlist: `['focus-ring', 'focus-ring-inset', 'focus-ring-none', 'sr-only-focusable']`.
3. When a selector's base class matches an entry in the allowlist, record the base class in the manifest even if the selector has a trailing pseudo-class.
4. Verify `emily.manifest.json` after a fresh build includes all four classes.

**Tests required:**
- Assert manifest contains `focus-ring`.
- Assert manifest contains `focus-ring-inset`.
- Assert manifest contains `focus-ring-none`.
- Assert manifest contains `sr-only-focusable`.
- Assert doctor does not flag these as unknown classes.

**Depends on:** nothing

---

### Task 4 — Correct variant metadata for constrained media variants

**Files:** `src/constants.js`, `src/manifest.js`, `tests/test.js`

**Instructions:**
1. In `src/constants.js`, locate `BASE_VARIANTS` (or equivalent). Remove `motion-reduce`, `motion-safe`, and `forced-colors` from the generic variants list.
2. In `src/manifest.js`, add explicit manifest entries for the constrained utilities that are actually generated:
   - `motion-reduce:transition-none`
   - `motion-reduce:animate-none`
   - `motion-safe:transition`
   - `forced-colors:outline`
   - `forced-colors:outline-1`
   - `forced-colors:forced-color-adjust-none`
   Mark these with `constrained: true` in their manifest entry.
3. Update any test that currently asserts `motion-reduce` appears in generic variant lists.

**Tests required:**
- Assert manifest does not list `motion-reduce` as a generic variant on arbitrary utilities.
- Assert manifest contains explicit entries for the six constrained classes above.
- Assert generated CSS contains each of the six constrained classes.

**Depends on:** Task 3

---

### Task 5 — Expand config validation

**Files:** `src/validate.js`, `src/validateConfig.js`, `tests/test.js`

**Instructions:**
1. Add validation for the following config keys if present:
   - `transitions`: each value must be a valid CSS duration string (`/^\d+(\.\d+)?(ms|s)$/`). Reject values containing `;`, `url(`, or unmatched parentheses.
   - `breakpoints`: each value must be a valid CSS length string.
   - `typography`: `fontSize`, `lineHeight`, `letterSpacing` values must be strings or numbers.
   - `shadows`: each value must be a non-empty string.
   - `zIndex`: each value must be a finite integer or `auto`.
   - `semanticColours`: each value must be a valid hex string or CSS custom property reference.
   - `colours`: object must not be empty.
   - `opacity`: each value must be a number between 0 and 100.
2. For each invalid value, call the existing error reporter with a clear message identifying the key and value.

**Tests required:**
- Add one deterministic test per config key above with an invalid value.
- Assert each invalid config produces an error, not a silent success.
- Assert valid configs still pass.

**Depends on:** nothing

---

### Task 6 — Fix package contents

**Files:** `package.json`, `.npmignore`

**Instructions:**
1. Create or update `.npmignore` to exclude `src/test/` and `src/test/e2e.test.js`.
2. Verify with `npm pack --dry-run` that `src/test/e2e.test.js` is not in the packed file list.
3. Decide whether `docs/` should be included in the published package. If yes, add `docs/` to the `files` array in `package.json`. If no, ensure `docs/` is excluded via `.npmignore`.

**Tests required:**
- Assert `npm pack --dry-run` output does not include `src/test/e2e.test.js`.
- Assert `npm pack --dry-run` output includes `README.md`, `bin/`, `src/` (excluding test), `templates/`.

**Depends on:** nothing

---

## Phase 2 — v1.3.0 Additive Utilities

All tasks in this phase are additive. No existing class names change. No config keys are removed. Run `npm test` after each task.

---

### Task 7 — Add corner style option to init and generate `--radius-base` token

**Files:** `src/init.js`, `src/index.js`, `src/config.js`, `templates/emily.config.json` (or init default), `tests/test.js`

**Instructions:**
1. In `src/init.js`, add a new interactive question after the colour prompt:
   - Question: `"Corner style?"`
   - Options: `square`, `subtle`, `rounded`
   - Default: `rounded`
2. Write the chosen value as `cornerStyle: "rounded"` (or chosen value) in the generated `emily.config.json`.
3. In `src/index.js`, locate `generateCSSVariables()`. Add:
   ```js
   const radiusMap = { square: '0px', subtle: '4px', rounded: '8px' };
   const radiusBase = radiusMap[config.cornerStyle] || '8px';
   css += `  --radius-base: ${radiusBase};\n`;
   ```
4. In `generatePatternComponents()`, replace every hardcoded `border-radius: 8px` with `border-radius: var(--radius-base, 8px)`.
5. Also replace `border-radius: 8px` in the form input and button CSS inside `generatePatternComponents()`.
6. Add `cornerStyle` to the config schema/defaults with value `"rounded"`.

**Tests required:**
- Assert `--radius-base: 0px` is generated when `cornerStyle: "square"`.
- Assert `--radius-base: 4px` is generated when `cornerStyle: "subtle"`.
- Assert `--radius-base: 8px` is generated when `cornerStyle: "rounded"` or when key is absent.
- Assert `.btn` CSS contains `var(--radius-base` not a hardcoded px value.
- Assert form input CSS contains `var(--radius-base`.

**Depends on:** Task 5 (validation should accept `cornerStyle`)

---

### Task 8 — Add gradient stop utilities

**Files:** `src/generators/background.js`, `src/index.js`, `tests/test.js`

**Instructions:**
1. In `src/generators/background.js`, add a `gradientStopUtilities(colours)` function.
2. Generate `from-{name}-{shade}`, `via-{name}-{shade}`, and `to-{name}-{shade}` for every colour in the config:
   ```css
   .from-brand-80 { --emily-gradient-from: var(--color-brand-80); --emily-gradient-stops: var(--emily-gradient-from), var(--emily-gradient-to, transparent); }
   .via-brand-80 { --emily-gradient-via: var(--color-brand-80); --emily-gradient-stops: var(--emily-gradient-from, transparent), var(--emily-gradient-via), var(--emily-gradient-to, transparent); }
   .to-brand-80 { --emily-gradient-to: var(--color-brand-80); }
   ```
3. Also generate `from-white`, `from-black`, `from-transparent`, `to-white`, `to-black`, `to-transparent`, `via-white`, `via-black`, `via-transparent`.
4. Call `gradientStopUtilities(colours)` in `buildFullFramework()` and append to `utilityCss`.

**Tests required:**
- Assert generated CSS contains `.from-brand-80`.
- Assert generated CSS contains `.via-brand-80`.
- Assert generated CSS contains `.to-brand-80`.
- Assert `.from-brand-80` sets `--emily-gradient-from`.
- Assert purge correctly extracts `from-*`, `via-*`, `to-*` class names.

**Depends on:** nothing

---

### Task 9 — Generate shadow utilities from `config.shadows`

**Files:** `src/generators/effects.js`, `src/index.js`, `tests/test.js`

**Instructions:**
1. In `src/generators/effects.js`, update `shadowUtilities()` to accept `config` as a parameter.
2. If `config.shadows` is defined and non-empty, generate `shadow-{key}` utilities from its values:
   ```css
   .shadow-card { box-shadow: var(--shadow-card); }
   ```
3. Keep the existing hardcoded `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, `shadow-inner`, `shadow-none` as defaults when config shadows are not defined.
4. Update the call in `buildFullFramework()` to pass `config`.

**Tests required:**
- Assert custom `config.shadows` produces `shadow-{key}` utilities.
- Assert default shadow utilities still exist when `config.shadows` is absent.
- Assert `shadow-none` always exists.

**Depends on:** Task 5

---

### Task 10 — Generate transition utilities from `config.transitions`

**Files:** `src/generators/effects.js`, `src/index.js`, `tests/test.js`

**Instructions:**
1. In `src/generators/effects.js`, update `transitionUtilities()` to accept `config`.
2. If `config.transitions` defines duration keys (e.g. `fast`, `base`, `slow`), generate:
   ```css
   .duration-fast { transition-duration: var(--duration-fast); }
   .duration-base { transition-duration: var(--duration-base); }
   .duration-slow { transition-duration: var(--duration-slow); }
   ```
3. If `config.transitions` defines a `timing` value, generate:
   ```css
   .ease-brand { transition-timing-function: var(--timing-base); }
   ```
4. Keep all existing hardcoded `duration-75/100/150/200/300/500/700/1000` and `ease-*` utilities.
5. Update the call in `buildFullFramework()` to pass `config`.

**Tests required:**
- Assert custom `config.transitions.fast` produces `.duration-fast` using a CSS variable.
- Assert default hardcoded `duration-200` still exists regardless of config.
- Assert `ease-linear` always exists.

**Depends on:** Task 5

---

### Task 11 — Generate `leading-*` and `tracking-*` from `config.typography`

**Files:** `src/index.js`, `tests/test.js`

**Instructions:**
1. Locate `generateTypographyUtilities(config)` in `src/index.js`.
2. If `config.typography.lineHeight` is defined as an object, generate `leading-{key}` utilities using the values. Example: `{ tight: 1.25, relaxed: 1.75 }` → `.leading-tight { line-height: 1.25; }`.
3. If `config.typography.letterSpacing` is defined as an object, generate `tracking-{key}` utilities. Example: `{ wide: '0.05em' }` → `.tracking-wide { letter-spacing: 0.05em; }`.
4. Keep all existing hardcoded keyword utilities (`leading-tight`, `leading-relaxed`, etc.) as fallbacks when config values are absent.

**Tests required:**
- Assert custom `config.typography.lineHeight` object produces `leading-{key}` utilities.
- Assert hardcoded `leading-tight` still exists when config has no `lineHeight`.
- Assert custom `config.typography.letterSpacing` object produces `tracking-{key}` utilities.

**Depends on:** Task 5

---

### Task 12 — Add `ring-4` and `ring-8`

**Files:** `src/generators/rings.js`, `tests/test.js`

**Instructions:**
1. In `src/generators/rings.js`, locate where `ring-0`, `ring-1`, `ring-2` are generated.
2. Add:
   ```css
   .ring-4 { box-shadow: 0 0 0 4px var(--ring-color, currentColor); }
   .ring-8 { box-shadow: 0 0 0 8px var(--ring-color, currentColor); }
   ```
3. Ensure `ring-4` and `ring-8` respect `ring-offset-*` in the same way as existing ring utilities.

**Tests required:**
- Assert generated CSS contains `.ring-4`.
- Assert generated CSS contains `.ring-8`.
- Assert purge correctly extracts `ring-4` and `ring-8`.

**Depends on:** nothing

---

### Task 13 — Complete backdrop filter family

**Files:** `src/generators/effects.js`, `tests/test.js`

**Instructions:**
1. In `src/generators/effects.js`, locate the backdrop filter section (currently only `backdrop-blur`).
2. Add the following families using the same fixed scales as their filter equivalents:
   - `backdrop-brightness-0/50/75/90/100/110/125/150/200`
   - `backdrop-contrast-0/50/75/100/125/150/200`
   - `backdrop-grayscale-0`, `backdrop-grayscale`
   - `backdrop-opacity-0/5/10/20/25/30/40/50/60/70/75/80/90/95/100`
   - `backdrop-saturate-0/50/100/150/200`
   - `backdrop-sepia-0`, `backdrop-sepia`
3. Each class sets the `backdrop-filter` CSS property with the appropriate function.

**Tests required:**
- Assert generated CSS contains `.backdrop-brightness-75`.
- Assert generated CSS contains `.backdrop-contrast-125`.
- Assert generated CSS contains `.backdrop-grayscale`.
- Assert generated CSS contains `.backdrop-opacity-50`.
- Assert generated CSS contains `.backdrop-saturate-150`.
- Assert generated CSS contains `.backdrop-sepia`.

**Depends on:** nothing

---

### Task 14 — Add tokenized placeholder, caret, and decoration colour utilities

**Files:** `src/generators/forms.js`, `src/index.js`, `tests/test.js`

**Instructions:**
1. In `src/generators/forms.js`, add a `tokenizedFormColourUtilities(colours)` function.
2. Generate `placeholder-{name}-{shade}` for every colour:
   ```css
   .placeholder-brand-80::placeholder { color: var(--color-brand-80); }
   ```
3. Generate `caret-{name}-{shade}` for every colour:
   ```css
   .caret-brand-80 { caret-color: var(--color-brand-80); }
   ```
4. Generate `decoration-{name}-{shade}` for every colour:
   ```css
   .decoration-brand-80 { text-decoration-color: var(--color-brand-80); }
   ```
5. Also generate `caret-current`, `caret-transparent`, `decoration-current`, `decoration-transparent` if not already present.
6. Call this function in `buildFullFramework()` and append to `utilityCss`.

**Tests required:**
- Assert generated CSS contains `.placeholder-brand-80::placeholder`.
- Assert generated CSS contains `.caret-brand-80`.
- Assert generated CSS contains `.decoration-brand-80`.
- Assert purge extracts `placeholder-*`, `caret-*`, `decoration-*` class names.

**Depends on:** nothing

---

### Task 15 — Add logical positioning utilities

**Files:** `src/generators/positioning.js`, `tests/test.js`

**Instructions:**
1. In `src/generators/positioning.js`, add logical position utilities using the spacing scale:
   - `start-{n}` → `inset-inline-start: {value}`
   - `end-{n}` → `inset-inline-end: {value}`
   - `inset-inline-{n}` → `inset-inline: {value}`
   - `inset-block-{n}` → `inset-block: {value}`
2. Include `start-auto`, `end-auto`, `start-full`, `end-full`, `start-0`, `end-0`.
3. Include negative variants `-start-{n}`, `-end-{n}`.

**Tests required:**
- Assert generated CSS contains `.start-4`.
- Assert generated CSS contains `.end-4`.
- Assert generated CSS contains `.start-auto`.
- Assert generated CSS contains `inset-inline-start` in `.start-4`.

**Depends on:** nothing

---

### Task 16 — Add scroll margin and padding utilities

**Files:** `src/generators/layout.js`, `tests/test.js`

**Instructions:**
1. In `src/generators/layout.js`, add scroll margin utilities from the spacing scale:
   - `scroll-m-{n}`, `scroll-mx-{n}`, `scroll-my-{n}`, `scroll-mt-{n}`, `scroll-mr-{n}`, `scroll-mb-{n}`, `scroll-ml-{n}`
2. Add scroll padding utilities:
   - `scroll-p-{n}`, `scroll-px-{n}`, `scroll-py-{n}`, `scroll-pt-{n}`, `scroll-pr-{n}`, `scroll-pb-{n}`, `scroll-pl-{n}`
3. Include `scroll-m-0`, `scroll-p-0`.

**Tests required:**
- Assert generated CSS contains `.scroll-mt-4`.
- Assert generated CSS contains `.scroll-p-6`.
- Assert purge extracts `scroll-m-*` and `scroll-p-*` class names.

**Depends on:** nothing

---

### Task 17 — Surface arbitrary values in `emily-css migrate`

**Files:** `src/migrate.js`, `src/reporters/migrationReporter.js`, `tests/test.js`

**Instructions:**
1. In `src/migrate.js`, add detection for Tailwind arbitrary value syntax: regex `/[\w-]+\[.+?\]/g`.
2. For each matched class, output a migration warning:
   ```
   ❌ w-[37px] — arbitrary value, not supported
   → Add to emily.config.json extend.utilities or replace with a spacing token
   ```
3. Collect all arbitrary values found and include them in a summary section of the migration report.

**Tests required:**
- Assert `emily-css migrate` on a file containing `w-[37px]` produces the expected warning message.
- Assert `emily-css migrate` on a file with no arbitrary values produces no arbitrary value warnings.

**Depends on:** nothing

---

## Phase 3 — v1.4.0 Patterns and Extend System

All tasks in this phase are additive. No existing patterns change. The form element bare-selector styles remain in place (that change is deferred to Phase 4). Run `npm test` after each task.

---

### Task 18 — Extract patterns into `src/generators/patterns.js`

**Files:** `src/index.js`, `src/generators/patterns.js` (new), `src/generators/index.js`, `tests/test.js`

**Instructions:**
1. Create `src/generators/patterns.js`.
2. Move the entire `generatePatternComponents()` function from `src/index.js` into `src/generators/patterns.js`. Export it as `patternComponents(config)`.
3. Update the function signature to accept `config` so it can read `config.cornerStyle` (via `--radius-base` already set in CSS variables by Task 7).
4. In `src/generators/index.js`, add `patternComponents` to the exports.
5. In `src/index.js`, import `patternComponents` from `./generators` and replace the inline call.
6. Run `npm test` and confirm zero CSS diff.

**Tests required:**
- Assert all existing pattern component CSS is still generated after extraction.
- Assert no CSS diff between before and after this task.

**Depends on:** Task 7

---

### Task 19 — Consolidate `.prose` and `.prose-emily`

**Files:** `src/generators/patterns.js`, `tests/test.js`

**Instructions:**
1. In `src/generators/patterns.js`, make `.prose` the scoped rich-text implementation.
2. Generate `.prose-sm`, `.prose-md`, `.prose-lg`, and `.prose-xl` as width-only modifiers.
3. Do not generate `.prose-emily` by default.
4. Add `prose.legacyAlias` for temporary backwards compatibility when existing projects still need `.prose-emily`.
5. Update any docs references.

**Tests required:**
- Assert generated CSS contains `.prose` with heading/paragraph/link styles.
- Assert generated CSS does not contain `.prose-emily` by default.
- Assert `prose.legacyAlias` generates `.prose-emily` when explicitly enabled.

**Depends on:** Task 18

---

### Task 20 — Make `.width-container` max-width config-driven

**Files:** `src/generators/patterns.js`, `src/config.js`, `tests/test.js`

**Instructions:**
1. Add `layout.containerMaxWidth` to the config defaults in `src/config.js` with a default of `"1100px"`.
2. In `src/generators/patterns.js`, update `.width-container` to use `config.layout?.containerMaxWidth ?? '1100px'` for the `max-width` value.
3. Update config validation (Task 5 area) to accept `layout.containerMaxWidth` as a CSS length string.

**Tests required:**
- Assert `.width-container` uses `max-width: 1100px` when config key is absent.
- Assert `.width-container` uses the configured value when `layout.containerMaxWidth: "1200px"` is set.

**Depends on:** Task 18

---

### Task 21 — Add core layout patterns

**Files:** `src/generators/patterns.js`, `tests/test.js`, `docs/`

**Instructions:**
Add the following patterns to `src/generators/patterns.js`. All use CSS custom property token fallbacks. None require nested HTML.

1. `.center` — content centering:
   ```css
   .center { box-sizing: content-box; margin-inline: auto; max-inline-size: 65ch; }
   ```

2. `.sidebar` — intrinsic sidebar layout:
   ```css
   .sidebar { display: flex; flex-wrap: wrap; gap: var(--space-6, 1.5rem); }
   .sidebar > :first-child { flex-basis: 20rem; flex-grow: 1; }
   .sidebar > :last-child { flex-basis: 0; flex-grow: 999; min-inline-size: 50%; }
   ```

3. `.switcher` — intrinsic row-to-stack switcher:
   ```css
   .switcher { display: flex; flex-wrap: wrap; gap: var(--space-4, 1rem); }
   .switcher > * { flex-grow: 1; flex-basis: calc((40rem - 100%) * 999); }
   ```

4. `.cover` — full-height content distribution:
   ```css
   .cover { display: flex; flex-direction: column; min-block-size: 100vh; padding: var(--space-6, 1.5rem); }
   .cover > :first-child { margin-block-start: 0; }
   .cover > :last-child { margin-block-end: 0; }
   .cover > .cover-center { margin-block: auto; }
   ```

5. `.grid-auto`, `.grid-auto-sm`, `.grid-auto-lg`:
   ```css
   .grid-auto { display: grid; gap: var(--space-6, 1.5rem); grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); }
   .grid-auto-sm { display: grid; gap: var(--space-4, 1rem); grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr)); }
   .grid-auto-lg { display: grid; gap: var(--space-6, 1.5rem); grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr)); }
   ```

6. `.equal-columns` — equal-width grid with responsive stack:
   ```css
   .equal-columns { display: grid; gap: var(--space-6, 1.5rem); grid-auto-columns: minmax(0, 1fr); grid-auto-flow: column; }
   @media (max-width: 767.98px) { .equal-columns { grid-auto-flow: row; grid-template-columns: 1fr; } }
   ```

7. `.media-object` — media beside text:
   ```css
   .media-object { display: flex; align-items: flex-start; gap: var(--space-4, 1rem); }
   .media-object > :first-child { flex: 0 0 auto; }
   .media-object > :last-child { min-inline-size: 0; }
   ```

8. `.inline-list`:
   ```css
   .inline-list { display: flex; flex-wrap: wrap; gap: var(--space-2, 0.5rem) var(--space-4, 1rem); padding: 0; margin: 0; list-style: none; }
   ```

9. `.content`, `.content-wide`:
   ```css
   .content { max-inline-size: 65ch; margin-inline: auto; }
   .content-wide { max-inline-size: 80ch; margin-inline: auto; }
   ```

10. `.section`, `.section-sm`, `.section-lg`:
    ```css
    .section { padding-block: var(--space-12, 3rem); }
    .section-sm { padding-block: var(--space-8, 2rem); }
    .section-lg { padding-block: var(--space-16, 4rem); }
    ```

**Tests required:**
- Assert generated CSS contains each of the 13 new classes.
- Assert purge extracts all new class names.

**Depends on:** Task 18

---

### Task 22 — Add stack and cluster variants

**Files:** `src/generators/patterns.js`, `tests/test.js`

**Instructions:**
1. Add `.stack-sm`, `.stack-lg`, `.stack-xl`:
   ```css
   .stack-sm { display: flex; flex-direction: column; gap: var(--space-2, 0.5rem); }
   .stack-lg { display: flex; flex-direction: column; gap: var(--space-6, 1.5rem); }
   .stack-xl { display: flex; flex-direction: column; gap: var(--space-8, 2rem); }
   ```
2. Add `.cluster-start`, `.cluster-between`, `.cluster-end`:
   ```css
   .cluster-start { display: flex; flex-wrap: wrap; gap: var(--space-4, 1rem); align-items: center; justify-content: flex-start; }
   .cluster-between { display: flex; flex-wrap: wrap; gap: var(--space-4, 1rem); align-items: center; justify-content: space-between; }
   .cluster-end { display: flex; flex-wrap: wrap; gap: var(--space-4, 1rem); align-items: center; justify-content: flex-end; }
   ```

**Tests required:**
- Assert generated CSS contains `.stack-sm`, `.stack-lg`, `.stack-xl`.
- Assert generated CSS contains `.cluster-start`, `.cluster-between`, `.cluster-end`.

**Depends on:** Task 18

---

### Task 23 — Add form layout and button group patterns

**Files:** `src/generators/patterns.js`, `tests/test.js`

**Instructions:**
1. Add `.form-row` and `.form-actions`:
   ```css
   .form-row { display: grid; gap: var(--space-2, 0.5rem); }
   @media (min-width: 640px) { .form-row { grid-template-columns: minmax(10rem, 16rem) minmax(0, 1fr); align-items: start; } }
   .form-actions { display: flex; flex-wrap: wrap; gap: var(--space-3, 0.75rem); align-items: center; }
   ```
2. Add `.button-group`:
   ```css
   .button-group { display: inline-flex; flex-wrap: wrap; gap: var(--space-2, 0.5rem); align-items: center; }
   .button-group[role="group"] { isolation: isolate; }
   ```

**Tests required:**
- Assert generated CSS contains `.form-row`.
- Assert generated CSS contains `.form-actions`.
- Assert generated CSS contains `.button-group`.

**Depends on:** Task 18

---

### Task 24 — Add animation control utilities

**Files:** `src/generators/animation.js`, `tests/test.js`

**Instructions:**
1. In `src/generators/animation.js`, add animation duration utilities using `config.transitions` token names if present, plus hardcoded fallbacks:
   ```css
   .animation-duration-fast { animation-duration: var(--duration-fast, 150ms); }
   .animation-duration-base { animation-duration: var(--duration-base, 300ms); }
   .animation-duration-slow { animation-duration: var(--duration-slow, 500ms); }
   ```
2. Add animation delay utilities mirroring the above.
3. Add:
   ```css
   .animation-repeat-once { animation-iteration-count: 1; }
   .animation-repeat-infinite { animation-iteration-count: infinite; }
   .animation-direction-reverse { animation-direction: reverse; }
   .animation-direction-alternate { animation-direction: alternate; }
   .animation-fill-both { animation-fill-mode: both; }
   .animation-fill-forwards { animation-fill-mode: forwards; }
   .animation-pause { animation-play-state: paused; }
   .animation-play { animation-play-state: running; }
   ```

**Tests required:**
- Assert generated CSS contains `.animation-duration-fast`.
- Assert generated CSS contains `.animation-pause`.
- Assert generated CSS contains `.animation-repeat-infinite`.

**Depends on:** nothing

---

### Task 25 — Add `columns-*` multi-column layout utilities

**Files:** `src/generators/layout.js`, `tests/test.js`

**Instructions:**
1. In `src/generators/layout.js`, add column count utilities:
   - `columns-1` through `columns-12` → `column-count: N`
   - `columns-auto` → `column-count: auto`
2. Add named column width utilities:
   - `columns-xs` → `columns: 20rem`
   - `columns-sm` → `columns: 24rem`
   - `columns-md` → `columns: 28rem`
   - `columns-lg` → `columns: 32rem`
   - `columns-xl` → `columns: 36rem`
3. Add `column-gap-*` from spacing scale → `column-gap: {value}`.
4. Add break utilities:
   - `break-before-auto`, `break-before-avoid`, `break-before-column`, `break-before-page`
   - `break-after-auto`, `break-after-avoid`, `break-after-column`, `break-after-page`
   - `break-inside-auto`, `break-inside-avoid`, `break-inside-avoid-column`

**Tests required:**
- Assert generated CSS contains `.columns-3`.
- Assert generated CSS contains `.columns-auto`.
- Assert generated CSS contains `.columns-md`.
- Assert generated CSS contains `.column-gap-4`.
- Assert generated CSS contains `.break-inside-avoid`.

**Depends on:** nothing

---

### Task 26 — Add `content-*` pseudo-element utilities

**Files:** `src/generators/display.js`, `tests/test.js`

**Instructions:**
1. In `src/generators/display.js`, add:
   ```css
   .content-none { content: none; }
   .content-empty { content: ''; }
   .content-space { content: '\0020'; }
   ```
2. Document in code comments that custom string content should use the `extend.utilities` system.

**Tests required:**
- Assert generated CSS contains `.content-none`.
- Assert generated CSS contains `.content-empty`.

**Depends on:** nothing

---

### Task 27 — Implement `extend.utilities` config system

**Files:** `src/config.js`, `src/index.js`, `src/validate.js`, `tests/test.js`, `docs/`

**Instructions:**
1. Add `extend.utilities` to the config schema. Shape:
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
2. In `src/index.js`, in `buildFullFramework()`, after all standard utility generation, iterate over `config.extend.utilities` and generate:
   ```css
   .w-hero { width: 720px; }
   ```
3. Add validation in `src/validate.js`: each extend utility must have a `property` string and a `value` string. Reject entries missing either.
4. Ensure purge correctly extracts extended class names (they follow the same class-name patterns).
5. Update `emily-css migrate` warning for arbitrary values to reference `extend.utilities` as the solution.

**Tests required:**
- Assert a config with `extend.utilities` produces the custom CSS class.
- Assert extended classes are purge-safe (extracted by purge regex).
- Assert invalid extend entries (missing `property` or `value`) fail validation.
- Assert `emily-css migrate` output for arbitrary values mentions `extend.utilities`.

**Depends on:** Task 5, Task 17

---

## Phase 4 — v2.0.0 Breaking Changes

These tasks contain breaking changes. Do not include in a minor or patch release. Ship together as a single major version with a migration guide. Each task must include a MIGRATION note in the changelog.

---

### Task 28 — Move form element styles to opt-in classes

**Files:** `src/generators/patterns.js`, `src/config.js`, `src/init.js`, `tests/test.js`

**Instructions:**
1. Add `formBase: true` to config defaults in `src/config.js`. When `true`, bare-element form styles are generated (current behaviour). When `false`, bare-element styles are suppressed and only class-based utilities are generated.
2. In `src/generators/patterns.js`, wrap all `input[type="text"]`, `select`, `textarea`, `input[type="checkbox"]`, `input[type="radio"]`, `fieldset` bare-element rules in a conditional: `if (config.formBase !== false)`.
3. Add class-based equivalents: `.input`, `.select`, `.textarea`, `.checkbox`, `.radio` with the same CSS rules, generated always regardless of `formBase`.
4. In v2.0.0, change the default for `formBase` to `false`.
5. In `src/init.js`, add a question: "Style form elements globally? (formBase)" defaulting to `false` for new projects.

**MIGRATION:** Users relying on automatic form element styling must either set `formBase: true` in their config or add `.input`, `.select`, `.textarea` classes to their form elements.

**Tests required:**
- Assert bare-element styles are generated when `formBase: true`.
- Assert bare-element styles are absent when `formBase: false`.
- Assert `.input` class styles are always generated.

**Depends on:** Task 18

---

### Task 29 — Consolidate focus ring tokens across all components

**Files:** `src/index.js`, `src/generators/accessibility.js`, `src/generators/patterns.js`, `tests/test.js`

**Instructions:**
1. In `generateCSSVariables()` in `src/index.js`, emit:
   ```css
   --focus-ring-color: var(--color-neutral-80);
   --focus-ring-width: 2px;
   --focus-ring-offset: 3px;
   --focus-ring-glow: rgba(0, 0, 0, 0.1);
   ```
2. In `src/generators/accessibility.js`, update `.focus-ring` and `.focus-ring-inset` to use these variables.
3. In `src/generators/patterns.js`, update all `.btn-*:focus-visible` and form `:focus` rules to use `var(--focus-ring-color)`, `var(--focus-ring-width)`, `var(--focus-ring-offset)`, `var(--focus-ring-glow)` instead of hardcoded values.

**MIGRATION:** Customise focus ring appearance via CSS variables in your project stylesheet rather than overriding individual component focus rules.

**Tests required:**
- Assert `--focus-ring-color` is emitted in CSS variables.
- Assert `.focus-ring:focus-visible` uses `var(--focus-ring-color)`.
- Assert `.btn-primary:focus-visible` uses `var(--focus-ring-color)`.

**Depends on:** Task 18

---

### Task 30 — Separate dev and production CSS output paths

**Files:** `src/init.js`, `src/index.js`, `src/config.js`, `tests/test.js`

**Instructions:**
1. Change the init default config to output `dist/emily.full.css` for development and `dist/emily.css` for production.
2. Update `src/config.js` defaults: `output.css` → `dist/emily.css`, `output.fullCss` → `dist/emily.full.css`.
3. Update build and watch commands to write clearly labelled output:
   - `emily-css build` → writes `output.fullCss` (full unminified CSS)
   - `emily-css purge` → writes `output.css` (purged production CSS)
4. Update all docs and CLI help text to reflect the new distinction.

**MIGRATION:** If you are linking `dist/emily.css` in a development environment, change to `dist/emily.full.css` or run `emily-css build` and update your link tag path.

**Tests required:**
- Assert init default config sets `output.fullCss` to `dist/emily.full.css`.
- Assert `emily-css build` writes to `output.fullCss`.
- Assert `emily-css purge` writes to `output.css`.

**Depends on:** Task 1

---

### Task 31 — Standardise generator function signatures

**Files:** All files in `src/generators/`, `src/index.js`, `tests/test.js`

**Instructions:**
1. Audit every generator function in `src/generators/`. Any function that hard-codes default values that should come from config must be updated to accept `{ config, spacing, colours }` as a parameter object.
2. Specifically: `shadowUtilities`, `transitionUtilities`, `positioningUtilities`, `overflowUtilities` — confirm each reads from config where a config key exists.
3. Update all call sites in `src/index.js` to pass the standardised parameter object.
4. Ensure all existing tests still pass after refactor.

**MIGRATION:** If you are importing generator functions directly from `src/generators/` (not via the public CLI), update call signatures. This is an internal API change.

**Tests required:**
- Assert no generator function uses a hardcoded value where a config equivalent exists.
- Assert full test suite passes with zero regressions.

**Depends on:** Tasks 9, 10, 11

---

### Task 32 — Redesign manifest schema for constrained variants

**Files:** `src/manifest.js`, `src/intellisense.js`, `src/doctor.js`, `tests/test.js`

**Instructions:**
1. Update manifest schema to v2. Each utility entry gains:
   - `selector`: the full CSS selector string
   - `variants`: array of generically-supported variants
   - `constrainedVariants`: array of variants only available for specific utility combinations
   - `availability`: `"full"` | `"constrained"` | `"pseudo-only"`
2. Migrate existing manifest generation to emit the new schema. Bump `schemaVersion` to `2`.
3. Update `src/intellisense.js` and `src/doctor.js` to consume the new schema fields.
4. Keep a `schemaVersion: 1` compatibility read path so old manifest files don't crash tooling.

**MIGRATION:** If you are consuming `emily.manifest.json` programmatically, update your parser to handle `schemaVersion: 2`. The `variants` field is now split into `variants` and `constrainedVariants`.

**Tests required:**
- Assert fresh manifest contains `schemaVersion: 2`.
- Assert `focus-ring` entry has `availability: "pseudo-only"`.
- Assert `motion-reduce:transition-none` appears in `constrainedVariants` of appropriate utilities.
- Assert old schema (`schemaVersion: 1`) manifest does not crash doctor or intellisense.

**Depends on:** Tasks 3, 4

---

### Task 33 — Write complete accessibility documentation

**Files:** `docs/accessibility.md`, `README.md`

**Instructions:**
1. Rewrite `docs/accessibility.md` from scratch. Cover:
   - `sr-only` vs `sr-only-focusable` — when to use each
   - `.skip-link` — markup example, focus behaviour
   - `.focus-ring`, `.focus-ring-inset` — when to use
   - `.focus-ring-none` — danger, when it is and is not safe
   - Reduced motion classes — `motion-reduce:transition-none`, `motion-reduce:animate-none`
   - Forced colours classes — `forced-colors:outline`, etc.
   - ARIA/data-state variants — `aria-expanded:*`, `aria-selected:*`, etc.
   - Accessible form markup — label/hint/error associations
   - Colour contrast warnings — what doctor reports and how to act on them
   - Touch target helpers — `.touch-target`, `.target-44`
2. Remove any reference to `.skip-to-content` as the primary example.
3. Update all version numbers and domain references in docs to current values.

**Tests required:**
- Assert `docs/accessibility.md` does not contain `.skip-to-content` as a primary example.
- Assert `docs/accessibility.md` contains `.skip-link`.
- Assert `docs/accessibility.md` contains `.focus-ring-none` with a safety warning.

**Depends on:** Tasks 2, 29

---

### Task 34 — Add strict contrast mode to doctor

**Files:** `src/doctor.js`, `bin/emilyui.js`, `tests/test.js`

**Instructions:**
1. Add `--strict-contrast` flag to `emily-css doctor`.
2. When flag is present, exit with code `1` if any token pair fails WCAG AA contrast (4.5:1 for normal text, 3:1 for large text).
3. Without the flag, contrast issues remain warnings (current behaviour).
4. Report each failing pair with the contrast ratio and the WCAG requirement.

**Tests required:**
- Assert `emily-css doctor --strict-contrast` exits with code `1` when low-contrast tokens exist in config.
- Assert `emily-css doctor` (no flag) exits with code `0` even when contrast warnings exist.

**Depends on:** nothing

---

### Task 35 — Add larger touch target helper

**Files:** `src/generators/accessibility.js`, `tests/test.js`

**Instructions:**
1. In `src/generators/accessibility.js`, add:
   ```css
   .touch-target-44::before {
     content: '';
     position: absolute;
     top: 50%;
     left: 50%;
     width: max(100%, 44px);
     height: max(100%, 44px);
     transform: translate(-50%, -50%);
   }
   ```
2. Keep existing `.touch-target` (24px minimum, WCAG 2.2 SC 2.5.8 minimum).
3. Document the difference: `.touch-target` = WCAG minimum, `.touch-target-44` = comfortable touch target.

**Tests required:**
- Assert generated CSS contains `.touch-target-44`.
- Assert `.touch-target` (24px) still exists.

**Depends on:** nothing

---

## Summary

| Phase | Version | Tasks | Type |
|-------|---------|-------|------|
| 1 | v1.2.x | 1–6 | Correctness fixes |
| 2 | v1.3.0 | 7–17 | Additive utilities |
| 3 | v1.4.0 | 18–27 | Additive patterns + extend |
| 4 | v2.0.0 | 28–35 | Breaking changes |

**Total: 35 tasks.**

Tasks within each phase are ordered by dependency. Tasks with no `Depends on` entry can be completed in any order within their phase.
