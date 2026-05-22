# Senior Front-End Developer Utility Gap Audit

Audit date: 2026-05-22

Scope: `src/index.js`, `src/generators/*`, generated manifest, committed `dist`, README/docs.

## Current Coverage Summary

EmilyCSS now covers many expected Tailwind/Uno-style utility families: display, visibility, float/clear, box sizing, spacing, negative margins, flex, grid, sizing including `h-20` and `w-20`, typography, colour tokens, semantic colours, borders/radius, shadows, opacity, overflow, object fit/position, z-index, transforms, transitions, animation, filters, cursor/pointer/select/touch/resize/isolation/will-change, screen-reader utilities, responsive variants, state variants, ARIA/data variants, reduced-motion helpers, and forced-colors helpers.

The main gaps are not “copy Tailwind wholesale” gaps. They are consistency, token integration, constrained variant truthfulness, missing real-world primitives, and docs/tooling alignment.

## Utility Gaps

### 1. Generic motion and forced-colors variants are advertised but not generated

- Missing class/family: generic `motion-reduce:*`, `motion-safe:*`, `forced-colors:*`.
- Why it matters: manifest variants and doctor can imply broad support that CSS does not contain.
- Tailwind/Uno equivalent: `motion-reduce:transition-none`, `motion-safe:hover:scale-105`, `forced-colors:*`.
- Suggested EmilyCSS naming: keep explicit generated classes or implement real variant expansion for a safe allowlist.
- Token source: none.
- Priority: P0.

### 2. Group and peer variants are extracted but not generated

- Missing class/family: `group-hover:*`, `group-focus:*`, `peer-focus:*`, `peer-checked:*`, `peer-disabled:*`.
- Why it matters: purge tests extract group/peer tokens, but CSS generation and variant metadata do not provide them.
- Tailwind/Uno equivalent: `group-hover:block`, `peer-checked:bg-brand-80`.
- Suggested EmilyCSS naming: `group-hover:*`, `group-focus-visible:*`, `peer-checked:*`, limited to common interactive states.
- Token source: none.
- Priority: P1.

### 3. Print and support-query variants are missing

- Missing class/family: `print:*`, `supports-*:*`.
- Why it matters: common for printable hiding, print typography, and progressive enhancement.
- Tailwind/Uno equivalent: `print:hidden`, `supports-[display:grid]:grid`.
- Suggested EmilyCSS naming: `print:hidden`, `print:block`, `supports-grid:grid`, `supports-subgrid:grid-cols-subgrid`.
- Token source: none.
- Priority: P2.

### 4. Colour utilities lack gradient stop classes

- Missing class/family: `from-*`, `via-*`, `to-*`.
- Why it matters: `bg-gradient-to-*` exists but there is no generated way to define `--emily-gradient-stops`.
- Tailwind/Uno equivalent: `from-blue-500 via-white to-pink-500`.
- Suggested EmilyCSS naming: `from-brand-80`, `via-accent-60`, `to-neutral-100`.
- Token source: `config.colours` shade scales and semantic colours.
- Priority: P1.

### 5. Text decoration colour utilities are missing

- Missing class/family: `decoration-brand-80`, `decoration-current`, `decoration-transparent`.
- Why it matters: link styling often needs token-coloured underlines independent of text colour.
- Tailwind/Uno equivalent: `decoration-sky-500`.
- Suggested EmilyCSS naming: `decoration-brand-80`, `decoration-error-80`.
- Token source: colour tokens.
- Priority: P2.

### 6. Placeholder colour utilities are incomplete

- Missing class/family: tokenized `placeholder-*`.
- Why it matters: `placeholder-transparent` and `placeholder-current` exist, but real forms need neutral/error placeholder colours.
- Tailwind/Uno equivalent: `placeholder-neutral-50`.
- Suggested EmilyCSS naming: `placeholder-neutral-50`, `placeholder-error-70`.
- Token source: colour tokens.
- Priority: P2.

### 7. Caret colour utilities are incomplete

- Missing class/family: tokenized `caret-*`.
- Why it matters: forms and editors often need brand caret colour.
- Tailwind/Uno equivalent: `caret-pink-600`.
- Suggested EmilyCSS naming: `caret-brand-80`, `caret-error-80`.
- Token source: colour tokens.
- Priority: P2.

### 8. Border opacity/text opacity/background opacity are missing

- Missing class/family: opacity modifiers for colour utilities.
- Why it matters: token-first systems still need predictable alpha variants for overlays, borders, and muted text.
- Tailwind/Uno equivalent: `bg-blue-500/50`, `text-black/70`.
- Suggested EmilyCSS naming: avoid slash arbitrary syntax initially; add `bg-brand-80-alpha-50`, `text-neutral-90-alpha-75`, or tokenized alpha variables.
- Token source: colour tokens plus opacity scale.
- Priority: P3.

### 9. Inset logical aliases are incomplete

- Missing class/family: logical position utilities.
- Why it matters: spacing utilities have `ps-*` and `pe-*`, borders have logical side support, but positioning lacks `start-*`/`end-*`.
- Tailwind/Uno equivalent: `start-0`, `end-4`.
- Suggested EmilyCSS naming: `start-*`, `end-*`, `inset-inline-*`, `inset-block-*`.
- Token source: spacing scale.
- Priority: P2.

### 10. Flex/grid minmax pattern utilities are missing

- Missing class/family: auto-fit/auto-fill grid utilities.
- Why it matters: developers repeatedly combine CSS grid declarations for card layouts.
- Tailwind/Uno equivalent: arbitrary `grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]`.
- Suggested EmilyCSS naming: `grid-auto`, `grid-auto-sm`, `grid-auto-lg`.
- Token source: spacing/sizing tokens.
- Priority: P1.

### 11. Grid named area utilities are not supported

- Missing class/family: grid areas.
- Why it matters: real layouts often use named areas, but this may be too project-specific for core.
- Tailwind/Uno equivalent: mostly arbitrary/plugin-driven.
- Suggested EmilyCSS naming: plugin-based `area-*` generated from config.
- Token source: config-defined area names.
- Priority: P4.

### 12. Container query variants are missing

- Missing class/family: `@container` variants.
- Why it matters: container type utilities exist, but no generated way to respond to container size.
- Tailwind/Uno equivalent: `@sm:flex`, `@md:grid`.
- Suggested EmilyCSS naming: `cq-sm:flex`, `cq-md:grid`, using config `containerQueries`.
- Token source: new config section.
- Priority: P3.

### 13. Scroll margin/padding utilities are too thin

- Missing class/family: `scroll-m-*`, `scroll-mt-*`, `scroll-p-*`, `scroll-pt-*`.
- Why it matters: sticky headers and anchor navigation need tokenized scroll offsets.
- Tailwind/Uno equivalent: `scroll-mt-16`, `scroll-px-4`.
- Suggested EmilyCSS naming: `scroll-m-*`, `scroll-mt-*`, `scroll-p-*`, `scroll-pt-*`, logical aliases.
- Token source: spacing scale.
- Priority: P2.

### 14. List marker utilities are missing

- Missing class/family: `marker-*`.
- Why it matters: prose and content-heavy interfaces need brand/error/success list markers.
- Tailwind/Uno equivalent: `marker:text-brand-80` or `marker:text-sky-500`.
- Suggested EmilyCSS naming: `marker-brand-80`, `marker-neutral-60`.
- Token source: colour tokens.
- Priority: P3.

### 15. Divide and space use physical directions only

- Missing class/family: logical `space-s-*`, `space-e-*`, logical divide.
- Why it matters: RTL support is inconsistent with logical padding/border naming.
- Tailwind/Uno equivalent: Tailwind still mostly uses physical, but logical support is common in modern systems.
- Suggested EmilyCSS naming: `space-inline-*`, `space-block-*`, `divide-inline`, `divide-block`.
- Token source: spacing and border tokens.
- Priority: P3.

### 16. Transition values ignore configured transition tokens

- Missing class/family: config-driven durations/easing utilities.
- Why it matters: `config.transitions.fast/base/slow/timing` are emitted as variables, but utilities hard-code Tailwind-like values.
- Tailwind/Uno equivalent: `duration-200`, `ease-in-out`; Emily should prefer tokens.
- Suggested EmilyCSS naming: `duration-fast`, `duration-base`, `duration-slow`, `ease-brand`.
- Token source: `config.transitions`.
- Priority: P1.

### 17. Shadow utilities ignore configured shadow tokens

- Missing class/family: config-driven shadow generation.
- Why it matters: `config.shadows` emits variables, but `shadowUtilities()` hard-codes values.
- Tailwind/Uno equivalent: `shadow-sm`, `shadow-lg`.
- Suggested EmilyCSS naming: keep `shadow-*`, generate from `config.shadows`.
- Token source: `config.shadows`.
- Priority: P1.

### 18. Z-index utilities ignore configured z-index tokens

- Missing class/family: fully config-driven z utilities.
- Why it matters: `config.zIndex` emits variables, but `positioningUtilities()` hard-codes the same default map instead of using config.
- Tailwind/Uno equivalent: `z-10`, `z-auto`.
- Suggested EmilyCSS naming: keep `z-*`, generate from `config.zIndex`.
- Token source: `config.zIndex`.
- Priority: P2.

### 19. Border width generation is not fully token-consistent

- Missing class/family: `border-1` if configured; current defaults omit 1 except bare `.border`.
- Why it matters: teams may configure border widths and expect all side/axis variants.
- Tailwind/Uno equivalent: `border`, `border-0`, `border-2`, `border-x`.
- Suggested EmilyCSS naming: generate from `config.spacing.borderWidths`, with explicit default `.border`.
- Token source: `config.spacing.borderWidths`.
- Priority: P3.

### 20. Arbitrary values should not be implemented — use a config extend system instead

- Missing class/family: arbitrary `w-[37px]`, `grid-cols-[...]`.
- Why it matters: Tailwind migrations hit arbitrary values constantly. Without any escape hatch, developers resort to raw CSS alongside EmilyCSS.
- Tailwind/Uno equivalent: JIT arbitrary values.
- Why NOT to implement Tailwind-style arbitrary values: Tailwind's bracket syntax requires either JIT compilation (runtime scanning) or AST parsing of source templates. Both contradict EmilyCSS's build-time-first, "config goes in, predictable CSS comes out" design principle. It would also introduce magic that the core audience (Drupal, Power Pages, CMS teams) neither needs nor expects.
- Correct solution: a config `extend.utilities` system. Users name the utility intentionally in config:
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
  This is config-driven, build-time, predictable, and consistent with EmilyCSS's constraints-enable-better-decisions principle. It prevents arbitrary values being scattered through templates.
- Migration surface: `emily-css migrate` should detect arbitrary values in scanned source and output:
  ```
  ❌ w-[37px] — arbitrary value, not supported
  → Add to emily.config.json extend.utilities or replace with a spacing token
  ```
- Token source: config `extend` map.
- Priority: P2 (extend system); migrate surfacing is P1 as it unblocks Tailwind migrations.

### 21. Accessibility target-size options are too narrow

- Missing class/family: larger target helpers.
- Why it matters: `.touch-target` uses 24px minimum. Many product teams prefer 44px for comfortable touch targets.
- Tailwind/Uno equivalent: usually custom.
- Suggested EmilyCSS naming: `.target-24`, `.target-44`, `.target-size`.
- Token source: none or accessibility config.
- Priority: P1.

### 22. Safe-area utilities are missing

- Missing class/family: safe area padding/inset helpers.
- Why it matters: mobile web apps need notches/home indicator spacing.
- Tailwind/Uno equivalent: plugin/custom utilities.
- Suggested EmilyCSS naming: `pt-safe`, `pb-safe`, `px-safe`, `safe-area`.
- Token source: CSS env values plus spacing fallback.
- Priority: P3.

### 23. Form control utilities are too small for token-first customization

- Missing class/family: `.input`, `.select`, `.textarea`, `.checkbox`, `.radio` are generated, but tokenized state variants for invalid/disabled/read-only are sparse.
- Why it matters: forms are central to accessible enterprise UI.
- Tailwind/Uno equivalent: forms plugin/custom.
- Suggested EmilyCSS naming: `.field`, `.field-invalid`, `.field-disabled`, `aria-invalid:border-error-80`.
- Token source: colour, spacing, radius.
- Priority: P2.

### 24. Content/prose utilities are basic

- Missing class/family: rich prose spacing, headings, links, lists, tables.
- Why it matters: docs/CMS pages need readable defaults without composing many classes.
- Tailwind/Uno equivalent: typography plugin.
- Suggested EmilyCSS naming: `.prose`, `.prose-sm`, `.prose-lg`, but keep token-first and lightweight.
- Token source: typography, spacing, colours.
- Priority: P3.

### 25. Ring width values are too thin

- Missing class/family: `ring-4`, `ring-8`.
- Why it matters: only `ring-0`, `ring-1`, `ring-2` exist. Focus rings and call-to-action highlights commonly need larger ring widths.
- Tailwind/Uno equivalent: `ring-4`, `ring-8`.
- Suggested EmilyCSS naming: keep same pattern; add `ring-4` and `ring-8`.
- Token source: none — fixed values, same as existing ring widths.
- Priority: P1 (low effort, real gap).

### 26. Backdrop filter families are incomplete

- Missing class/family: `backdrop-brightness-*`, `backdrop-contrast-*`, `backdrop-grayscale`, `backdrop-opacity-*`, `backdrop-saturate-*`, `backdrop-sepia`.
- Why it matters: only `backdrop-blur` exists. The filter equivalents (`brightness-*`, `contrast-*`, etc.) are all implemented — this is a gap in `generators/effects.js`, not a new concept. Used for modal overlays, hero image treatments, and glassmorphism-style surfaces.
- Tailwind/Uno equivalent: full `backdrop-*` family.
- Suggested EmilyCSS naming: mirror the existing filter naming — `backdrop-brightness-75`, `backdrop-contrast-125`, `backdrop-opacity-50`, etc.
- Token source: none — use same fixed scales as the filter equivalents.
- Priority: P1.

### 27. Animation control utilities are missing

- Missing class/family: `duration-*` (animation), `delay-*` (animation), `repeat-*`, `direction-*`, `fill-mode-*`, `play-state-*`.
- Why it matters: `animate-spin/ping/pulse/bounce` exist but there is no way to override their speed or delay without writing custom CSS. `duration-*` and `delay-*` already exist for transitions — animation equivalents are missing.
- Tailwind/Uno equivalent: `animate-duration-*`, `animate-delay-*`, `animate-repeat-*`, `animate-direction-*`, `animate-fill-*`, `animate-play-*`.
- Suggested EmilyCSS naming: `animation-duration-fast`, `animation-duration-slow`, `animation-delay-*` from `config.transitions` tokens; `animation-repeat-once`, `animation-repeat-infinite`; `animation-direction-reverse`, `animation-fill-both`, `animation-pause`, `animation-play`.
- Token source: `config.transitions` (durations, delays).
- Priority: P2.

### 28. Multi-column layout utilities are missing

- Missing class/family: `columns-*`.
- Why it matters: no support for CSS `column-count` or `column-width`. Used for newspaper-style layouts, masonry-adjacent patterns, and long-form content across government/CMS projects. Entirely absent from EmilyCSS.
- Tailwind/Uno equivalent: `columns-2`, `columns-3`, `columns-auto`, `columns-xs` through `columns-7xl`.
- Suggested EmilyCSS naming: `columns-1` through `columns-12`, `columns-auto`; named size variants (`columns-xs/sm/md/lg/xl`) from a fixed width scale; `column-gap-*` from spacing tokens; `break-before/after/inside-*` for column flow control.
- Token source: spacing scale for `column-gap`; fixed count/width scale for `columns-*`.
- Priority: P2.

### 29. Typography token consistency gap — leading and tracking are keyword-only

- Missing class/family: config-driven `leading-*` and `tracking-*`.
- Why it matters: `leading-*` uses keyword values (`tight`, `snug`, `normal`, `relaxed`, `loose`) and `tracking-*` uses keyword values (`tighter`, `tight`, `normal`, `wide`, etc.). Neither reads from `config.typography`. If a team configures custom line heights or letter spacing, utilities won't reflect them. This is the same token-consistency problem as shadows and transitions (items 16–17 in this audit).
- Suggested fix: generate `leading-*` and `tracking-*` from `config.typography.lineHeight` and `config.typography.letterSpacing` maps if defined, falling back to keyword defaults.
- Token source: `config.typography`.
- Priority: P2 (same release as shadow/transition token fixes, v1.3.0).

### 30. `background-blend-mode` utilities are missing

- Missing class/family: `bg-blend-*`.
- Why it matters: `mix-blend-mode` (`mix-*`) already exists. `background-blend-mode` is a different property — it controls how a background image blends with the background colour on the same element. Common for tinted hero images.
- Tailwind/Uno equivalent: `bg-blend-multiply`, `bg-blend-overlay`, etc.
- Suggested EmilyCSS naming: `bg-blend-normal/multiply/screen/overlay/darken/lighten/color-dodge/color-burn/hard-light/soft-light/difference/exclusion/hue/saturation/color/luminosity`.
- Token source: none — keyword values.
- Priority: P3.

### 31. `border-spacing` utilities are missing

- Missing class/family: `border-spacing-*`.
- Why it matters: `border-separate` exists as a table utility, but there is no way to set the spacing between borders when using it. The pairing is incomplete.
- Tailwind/Uno equivalent: `border-spacing-*`, `border-spacing-x-*`, `border-spacing-y-*`.
- Suggested EmilyCSS naming: `border-spacing-*`, `border-spacing-x-*`, `border-spacing-y-*` from spacing scale.
- Token source: spacing scale.
- Priority: P3.

### 32. `text-indent` utilities are missing

- Missing class/family: `indent-*`.
- Why it matters: used for first-line indentation in content-heavy pages, definition list alignment, and accessible list formatting — relevant to the public sector/CMS use case.
- Tailwind/Uno equivalent: `indent-*` from spacing scale.
- Suggested EmilyCSS naming: `indent-*` from spacing scale; include negative values.
- Token source: spacing scale.
- Priority: P3.

### 33. `word-spacing` utilities are missing

- Missing class/family: `word-spacing-*`.
- Why it matters: minor typographic control useful for heading treatments and branded copy. Same pattern as `letter-spacing`.
- Tailwind/Uno equivalent: not in Tailwind core — usually custom.
- Suggested EmilyCSS naming: `word-spacing-tight`, `word-spacing-normal`, `word-spacing-wide` from `config.typography` if defined.
- Token source: `config.typography`.
- Priority: P3.

### 34. `content-*` pseudo-element utilities are missing

- Missing class/family: `content-none`, `content-['']`, `content-[attr(*)]`.
- Why it matters: `::before` and `::after` pseudo-elements require a `content` value to render. Without utilities, developers must write raw CSS for decorative elements, required field markers, icons via data attributes, and tooltip patterns.
- Tailwind/Uno equivalent: `content-none`, `before:content-['*']`, `after:content-[attr(data-label)]`.
- Suggested EmilyCSS naming: `content-none`, `content-empty` (empty string), `content-space` (single space); the arbitrary value problem means custom strings would need the extend system rather than inline bracket syntax — document this clearly.
- Token source: none.
- Priority: P2.

## Recommended Utility Release Focus

For v1.3.0, prioritize:

1. Fix variant metadata truthfulness.
2. Add gradient stop utilities.
3. Generate shadow, transition, leading, and tracking utilities from config tokens (items 16, 17, 29).
4. Add tokenized placeholder/caret/decoration colours.
5. Add auto grid utility family.
6. Add target-size helpers.
7. Add `ring-4` and `ring-8`.
8. Add full backdrop filter family.
9. Surface arbitrary values in `emily-css migrate` output with extend.utilities guidance.

For v1.4.0:

10. Implement `extend.utilities` config system.
11. Add animation control utilities.
12. Add `columns-*` multi-column layout utilities.

For v1.5.0 or later:

13. `bg-blend-*`, `border-spacing-*`, `text-indent` (P3 items).
