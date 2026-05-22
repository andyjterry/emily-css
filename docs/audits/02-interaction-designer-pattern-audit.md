# Lead Interaction Designer Pattern Audit

Audit date: 2026-05-22

Scope: generated utilities, `generatePatternComponents()` in `src/index.js`, `src/generators/*`, docs, committed `dist`.

## Existing Confirmed Patterns

- `.stack`: vertical flex column with token gap.
- `.cluster`: wrapping horizontal group with token gap and centered cross-axis alignment.
- `.width-container`: constrained page container with responsive padding.
- `.center-screen` and `.center-absolute`: centering helpers.
- `.field-container`, `.form-hint`, `.form-error-message`, `.error-summary`, `.checkbox-group`, `.radio-group`: form patterns.
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-lg`: button patterns.
- `.skip-link`, `.focus-ring`, `.touch-target`: accessibility interaction helpers.

The existing patterns are useful, but they are not documented as a coherent pattern layer, and some are absent from manifest metadata because of pseudo selectors.

## Suggested Pattern Utilities

### 1. Stack With Scale Variants

- Use case: repeated vertical rhythm without manually combining `flex flex-col gap-*`.
- Proposed class names: `.stack`, `.stack-sm`, `.stack-lg`, `.stack-xl`.
- Generated CSS:
```css
.stack { display: flex; flex-direction: column; gap: var(--space-4, 1rem); }
.stack-sm { display: flex; flex-direction: column; gap: var(--space-2, 0.5rem); }
.stack-lg { display: flex; flex-direction: column; gap: var(--space-6, 1.5rem); }
.stack-xl { display: flex; flex-direction: column; gap: var(--space-8, 2rem); }
```
- Accessibility notes: preserves source order; no special ARIA needed.
- Placement: core.

### 2. Cluster With Alignment Variants

- Use case: tags, action rows, meta links, icon lists, button rows.
- Proposed class names: `.cluster`, `.cluster-start`, `.cluster-between`, `.cluster-end`.
- Generated CSS:
```css
.cluster { display: flex; flex-wrap: wrap; gap: var(--space-4, 1rem); align-items: center; }
.cluster-start { justify-content: flex-start; }
.cluster-between { justify-content: space-between; }
.cluster-end { justify-content: flex-end; }
```
- Accessibility notes: use semantic lists for nav/tag collections when order matters.
- Placement: core.

### 3. Sidebar

- Use case: resilient main/sidebar layouts that wrap naturally without brittle breakpoints.
- Proposed class name: `.sidebar`.
- Generated CSS:
```css
.sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-6, 1.5rem);
}
.sidebar > :first-child {
  flex-basis: 20rem;
  flex-grow: 1;
}
.sidebar > :last-child {
  flex-basis: 0;
  flex-grow: 999;
  min-inline-size: 50%;
}
```
- Accessibility notes: source order must match reading order; do not use for visual-only reordering.
- Placement: core.

### 4. Switcher

- Use case: layout switches from row to stack based on available width, useful for nav blocks and feature groups.
- Proposed class name: `.switcher`.
- Generated CSS:
```css
.switcher {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4, 1rem);
}
.switcher > * {
  flex-grow: 1;
  flex-basis: calc((40rem - 100%) * 999);
}
```
- Accessibility notes: source order is preserved; avoid when visual order should differ from DOM order.
- Placement: optional core pattern.

### 5. Center

- Use case: center content horizontally with an optional readable max width.
- Proposed class name: `.center`.
- Generated CSS:
```css
.center {
  box-sizing: content-box;
  margin-inline: auto;
  max-inline-size: 65ch;
}
```
- Accessibility notes: pairs well with readable text widths; do not over-constrain data tables or code blocks.
- Placement: core.

### 6. Cover

- Use case: hero, empty state, or card section that vertically distributes header/main/footer.
- Proposed class name: `.cover`.
- Generated CSS:
```css
.cover {
  display: flex;
  flex-direction: column;
  min-block-size: 100vh;
  padding: var(--space-6, 1.5rem);
}
.cover > :first-child { margin-block-start: 0; }
.cover > :last-child { margin-block-end: 0; }
.cover > :only-child,
.cover > .cover-center {
  margin-block: auto;
}
```
- Accessibility notes: keep headings first in DOM; ensure skip links can bypass full-height hero areas.
- Placement: optional core pattern.

### 7. Auto-Fit Grid

- Use case: responsive card grids without manual breakpoint classes.
- Proposed class names: `.grid-auto`, `.grid-auto-sm`, `.grid-auto-lg`.
- Generated CSS:
```css
.grid-auto {
  display: grid;
  gap: var(--space-6, 1.5rem);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
}
.grid-auto-sm { grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr)); }
.grid-auto-lg { grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr)); }
```
- Accessibility notes: visual grid does not change DOM order; suitable for cards and lists.
- Placement: core.

### 8. Equal Columns

- Use case: equal-width columns for pricing, comparison, or stat groups.
- Proposed class name: `.equal-columns`.
- Generated CSS:
```css
.equal-columns {
  display: grid;
  gap: var(--space-6, 1.5rem);
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
}
@media (max-width: 767.98px) {
  .equal-columns {
    grid-auto-flow: row;
    grid-template-columns: 1fr;
  }
}
```
- Accessibility notes: source order must remain logical; use real tables for tabular comparisons.
- Placement: optional.

### 9. Media Object

- Use case: avatar/media beside text content.
- Proposed class name: `.media-object`.
- Generated CSS:
```css
.media-object {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4, 1rem);
}
.media-object > :first-child {
  flex: 0 0 auto;
}
.media-object > :last-child {
  min-inline-size: 0;
}
```
- Accessibility notes: images need meaningful alt text or empty `alt=""` when decorative.
- Placement: core.

### 10. Form Row

- Use case: label/control rows and responsive inline form groups.
- Proposed class names: `.form-row`, `.form-actions`.
- Generated CSS:
```css
.form-row {
  display: grid;
  gap: var(--space-2, 0.5rem);
}
@media (min-width: 640px) {
  .form-row {
    grid-template-columns: minmax(10rem, 16rem) minmax(0, 1fr);
    align-items: start;
  }
}
.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3, 0.75rem);
  align-items: center;
}
```
- Accessibility notes: keep explicit `<label for>` and visible error/help text associations.
- Placement: core.

### 11. Button Group

- Use case: related actions and segmented controls.
- Proposed class name: `.button-group`.
- Generated CSS:
```css
.button-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem);
  align-items: center;
}
.button-group[role="group"] {
  isolation: isolate;
}
```
- Accessibility notes: use `role="group"` and accessible group label when actions are related.
- Placement: core.

### 12. Inline List

- Use case: nav links, breadcrumbs, metadata lists.
- Proposed class name: `.inline-list`.
- Generated CSS:
```css
.inline-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 0.5rem) var(--space-4, 1rem);
  padding: 0;
  margin: 0;
  list-style: none;
}
```
- Accessibility notes: keep actual `<ul>` or `<ol>` where the content is a list.
- Placement: core.

### 13. Content Wrapper

- Use case: readable document/article content.
- Proposed class names: `.content`, `.content-wide`.
- Generated CSS:
```css
.content {
  max-inline-size: 65ch;
  margin-inline: auto;
}
.content-wide {
  max-inline-size: 80ch;
  margin-inline: auto;
}
```
- Accessibility notes: readable line length helps cognitive accessibility.
- Placement: core.

### 14. Page Section

- Use case: consistent vertical section spacing with token defaults.
- Proposed class names: `.section`, `.section-sm`, `.section-lg`.
- Generated CSS:
```css
.section { padding-block: var(--space-12, 3rem); }
.section-sm { padding-block: var(--space-8, 2rem); }
.section-lg { padding-block: var(--space-16, 4rem); }
```
- Accessibility notes: pair with headings to maintain page structure.
- Placement: optional.

### 15. Accessible Focus/Skip Bundle

- Use case: consistent keyboard affordances.
- Proposed class names: keep `.skip-link`; add `.focus-ring-strong`, `.target-size`.
- Generated CSS:
```css
.focus-ring-strong:focus-visible {
  outline: 3px solid var(--color-brand-80);
  outline-offset: 3px;
}
.target-size {
  min-width: 44px;
  min-height: 44px;
}
```
- Accessibility notes: `.target-size` supports the larger practical touch target even though `.touch-target` currently targets WCAG 2.2 minimum 24px.
- Placement: core accessibility pattern.

## Codebase Review Findings (2026-05-22)

A direct read of `src/index.js` `generatePatternComponents()` revealed the following issues not covered above.

### `.prose` vs `.prose-emily` is confusing and should be consolidated

- `.prose` is just two lines: `max-width: 65ch; margin-inline: auto`. `.prose-emily` is the real implementation with heading styles, spacing, links, and code.
- A developer reaching for `.prose` gets almost nothing useful. This will cause confusion and bugs.
- Fix: remove `.prose` or make it an alias for `.prose-emily`. Document clearly which one to use.

### Form element styles are global, not opt-in

- `input[type="text"]`, `select`, `textarea`, and related elements are styled on bare element selectors in `@layer components`.
- This means EmilyCSS styles every form field the moment the stylesheet is linked — which can conflict with CMS-generated markup, existing styles, or Drupal/Power Pages themes.
- Fix: move to `.input`, `.select`, `.textarea` class-based styling, or clearly document this as opinionated base styles with instructions for opting out.
- Risk: medium — affects the primary target audience (CMS/Drupal/Power Pages environments).

### `.width-container` max-width is hardcoded

- `max-width: 1100px` is hardcoded in the pattern. This should read from config (e.g. `config.layout.maxWidth` or the existing spacing scale).
- Fix: pass config into `generatePatternComponents()` and use a config value with `1100px` as the fallback.

### `.btn` focus styles use a hardcoded colour fallback

- All `.btn-*` variants use `var(--focus-ring-glow, rgba(219, 39, 119, 0.1))` — a hardcoded pink fallback value.
- Once shared focus ring tokens land (from the accessibility audit), these should use `var(--focus-ring-color)` and `var(--focus-ring-glow)` consistently.
- Fix: update after focus token system ships in v1.5.0.

### No `.card` or component patterns — and that is correct

- EmilyCSS should not add card, badge, tooltip, modal, accordion, or similar patterns.
- These require nested HTML structure — they are component patterns, not layout utilities.
- EmilyCSS provides the layout layer (stack, sidebar, grid-auto, etc.) and the token system. What goes inside the layout is the developer's responsibility.
- This boundary must be maintained as the pattern layer grows.

## Pattern Documentation Gaps

- `docs/accessibility.md`, `docs/variants.md`, and other docs are starter stubs.
- There is no single pattern reference showing when to use `.stack`, `.cluster`, `.width-container`, form patterns, or button patterns.
- Existing pattern classes are mixed into `src/index.js`, while many atomic generators live under `src/generators`; consider moving components to a dedicated `src/generators/patterns.js`.

## Recommended Pattern Release Scope

v1.4.0 core layout layer (no opinions, just composition):
- Stack variants (`.stack-sm`, `.stack-lg`, `.stack-xl`)
- Cluster variants (`.cluster-start`, `.cluster-between`, `.cluster-end`)
- `.sidebar`
- `.switcher`
- `.grid-auto`, `.grid-auto-sm`, `.grid-auto-lg`
- `.equal-columns`
- `.media-object`
- `.inline-list`
- `.content`, `.content-wide`
- `.section`, `.section-sm`, `.section-lg`
- `.center` (content centering with `max-inline-size: 65ch`)
- `.cover`

v1.4.0 form layout layer (layout wrappers only, not component styling):
- `.form-row`, `.form-actions`
- `.button-group`

v1.4.0 housekeeping:
- Consolidate `.prose` / `.prose-emily`
- Move form element styles to class-based opt-in
- Make `.width-container` max-width config-driven
- Move all patterns from `src/index.js` to `src/generators/patterns.js`

Do not add: card, badge, tooltip, modal, accordion, drawer, or any pattern requiring nested HTML structure. EmilyCSS provides layout utilities, not a component library.
