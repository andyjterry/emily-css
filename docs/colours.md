# Colours

**Last Updated:** 2026-05-23

EmilyCSS generates colour utilities from your `emily.config.json`. Two systems are available: token colours with a shade scale, and flat semantic colours.

---

## Token colours (`colours`)

Each hex value in `colours` generates a 10-shade OKLCH scale. The shades are `10` through `100` in steps of 10.

```json
{
  "colours": {
    "brand": "#DB2777",
    "neutral": "#57534E"
  }
}
```

**Shade 80 is always the exact source hex.** The other shades are derived perceptually using OKLCH, which gives consistent lightness steps regardless of hue.

This generates utilities for every shade across every colour property:

| Utility family | Example         | CSS property       |
|----------------|-----------------|--------------------|
| `bg-*`         | `bg-brand-80`   | `background-color` |
| `text-*`       | `text-brand-40` | `color`            |
| `border-*`     | `border-brand-90` | `border-color`   |
| `fill-*`       | `fill-brand-80` | `fill`             |
| `stroke-*`     | `stroke-brand-80` | `stroke`         |
| `accent-*`     | `accent-brand-80` | `accent-color`   |

Lower shade numbers are lighter, higher numbers are darker. Shade `10` is near-white for most palettes; shade `100` is near-black.

```html
<!-- button with hover state -->
<button class="bg-brand-80 hover:bg-brand-90 text-white">
  Submit
</button>

<!-- error state text -->
<p class="text-error-70">This field is required.</p>

<!-- muted border -->
<div class="border border-neutral-30">
```

---

## Semantic colours (`semanticColours`)

Flat values with no shade scale. Use for high-contrast pairs — typically a near-black dark and a near-white light.

```json
{
  "semanticColours": {
    "dark": "#1A1A1A",
    "light": "#FAFAFA"
  }
}
```

Generates the same utility families: `bg-dark`, `text-dark`, `border-dark`, `fill-dark`, `bg-light`, etc.

---

## Built-in white and black

`bg-white`, `text-white`, `bg-black`, and `text-black` are always generated regardless of config.

---

## Colour contrast

EmilyCSS generates OKLCH scales with perceptual consistency, but does not guarantee WCAG contrast ratios for any given pairing — that depends on which shades you choose. Run `emily-css doctor` to check your configured token pairs for contrast issues.

As a rough guide for normal text on a white background:
- Shades `70`–`100` typically pass 4.5:1
- Shades `50`–`60` are borderline — check manually
- Shades `10`–`40` typically fail

---

## Dark mode

Use the `dark:` variant prefix to swap colours in dark mode:

```html
<div class="bg-light dark:bg-dark text-dark dark:text-light">
```

Dark mode uses the `.dark` class strategy — add `class="dark"` to your `<html>` element.
