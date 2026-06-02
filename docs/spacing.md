# Spacing

**Last Updated:** 2026-05-23

Spacing utilities are generated from the `spacing.scale` in your config. The same scale drives padding, margin, gap, width, height, and most other size-related utilities.

---

## Scale

```json
{
  "spacing": {
    "scale": {
      "0": "0px",
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "6": "1.5rem",
      "8": "2rem",
      "12": "3rem",
      "16": "4rem",
      "px": "1px",
      "0.5": "0.125rem"
    }
  }
}
```

Keys become the class suffix. String keys (`"px"`) and decimal keys (`"0.5"`) are supported.

---

## Utility families

| Family         | Example       | Property              |
|----------------|---------------|-----------------------|
| `p-*`          | `p-4`         | `padding`             |
| `px-*`         | `px-6`        | `padding-inline`      |
| `py-*`         | `py-2`        | `padding-block`       |
| `pt-*` `pb-*` `pl-*` `pr-*` | `pt-4` | individual sides |
| `m-*`          | `m-4`         | `margin`              |
| `mx-*`         | `mx-auto`     | `margin-inline`       |
| `my-*`         | `my-8`        | `margin-block`        |
| `mt-*` `mb-*` `ml-*` `mr-*` | `mt-6` | individual sides |
| `gap-*`        | `gap-4`       | `gap`                 |
| `gap-x-*`      | `gap-x-4`     | `column-gap`          |
| `gap-y-*`      | `gap-y-2`     | `row-gap`             |
| `space-x-*`    | `space-x-4`   | `margin-inline-start` on children |
| `space-y-*`    | `space-y-4`   | `margin-block-start` on children  |
| `w-*`          | `w-4`         | `width`               |
| `h-*`          | `h-4`         | `height`              |
| `min-w-*`      | `min-w-0`     | `min-width`           |
| `max-w-*`      | `max-w-96`    | `max-width`           |
| `min-h-*`      | `min-h-0`     | `min-height`          |
| `max-h-*`      | `max-h-96`    | `max-height`          |
| `size-*`       | `size-8`      | `width` + `height`    |

Fixed values are also available: `w-full`, `w-screen`, `h-full`, `h-screen`, `w-auto`, `h-auto`, `mx-auto`.

---

## Border widths

```json
{
  "spacing": {
    "borderWidths": [0, 2, 4, 8]
  }
}
```

Generates `border`, `border-2`, `border-4`, `border-8` and the directional variants `border-t-*`, `border-b-*`, `border-l-*`, `border-r-*`.

---

## Border radius

```json
{
  "spacing": {
    "borderRadius": {
      "none": "0",
      "sm": "4px",
      "base": "8px",
      "lg": "16px",
      "full": "9999px"
    }
  }
}
```

Generates `rounded-none`, `rounded-sm`, `rounded-base`, `rounded-lg`, `rounded-full` and directional variants (`rounded-t-*`, `rounded-bl-*` etc.).

The init flow sets `--radius-base` as a CSS custom property. All button and component patterns inherit from it, so changing `borderRadius.base` reskins corners project-wide.

---

## Responsive variants

All spacing utilities support responsive prefixes:

```html
<section class="p-4 md:p-8 lg:p-12">
<div class="gap-2 md:gap-6">
<img class="w-full md:w-1/2">
```

---

## Logical properties

EmilyCSS uses logical properties (`padding-inline`, `margin-block`) for `px`, `py`, `mx`, `my` to support RTL layouts without extra overrides.
