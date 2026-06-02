# Variants

**Last Updated:** 2026-05-23

Variants are prefixes that scope a utility to a specific breakpoint, state, or attribute. Stack them with `:`.

```html
<button class="bg-brand-80 hover:bg-brand-90 md:px-6 aria-expanded:rotate-180">
```

---

## Responsive variants

Prefix any utility with a breakpoint name to apply it from that width upward (min-width).

| Prefix | Min-width |
|--------|-----------|
| `sm:`  | 640px     |
| `md:`  | 768px     |
| `lg:`  | 1024px    |
| `xl:`  | 1280px    |
| `2xl:` | 1536px    |

```html
<div class="flex-col md:flex-row lg:gap-8">
```

Breakpoints are configurable in `emily.config.json` under `breakpoints`.

---

## State variants

| Prefix            | Selector                   |
|-------------------|----------------------------|
| `hover:`          | `:hover`                   |
| `focus:`          | `:focus`                   |
| `focus-visible:`  | `:focus-visible`           |
| `active:`         | `:active`                  |
| `disabled:`       | `:disabled`                |
| `dark:`           | `.dark &` (class strategy) |

```html
<button class="bg-brand-80 hover:bg-brand-90 focus-visible:outline-2 disabled:opacity-50">
```

---

## ARIA state variants

Generated for attributes commonly toggled by interactive patterns. The selector targets the attribute set to `"true"`.

| Prefix              | Attribute selector             |
|---------------------|--------------------------------|
| `aria-expanded:`    | `[aria-expanded="true"]`       |
| `aria-selected:`    | `[aria-selected="true"]`       |
| `aria-checked:`     | `[aria-checked="true"]`        |
| `aria-disabled:`    | `[aria-disabled="true"]`       |
| `aria-current:`     | `[aria-current="true"]`        |
| `aria-current-page:` | `[aria-current="page"]`       |

```html
<!-- accordion trigger — icon rotates when panel is open -->
<button aria-expanded="false" class="aria-expanded:rotate-180">
  <svg class="chevron">...</svg>
</button>

<!-- tab — selected tab gets brand background -->
<button role="tab" aria-selected="false" class="aria-selected:bg-brand-80 aria-selected:text-white">
  Overview
</button>

<!-- nav link — current page gets underline -->
<a aria-current="page" class="aria-current-page:underline">Home</a>
```

---

## Data-state variants

For headless UI libraries (Radix, Headless UI, etc.) that set `data-state` attributes rather than ARIA attributes.

| Prefix              | Attribute selector              |
|---------------------|---------------------------------|
| `data-open:`        | `[data-state="open"]`           |
| `data-closed:`      | `[data-state="closed"]`         |
| `data-checked:`     | `[data-state="checked"]`        |
| `data-unchecked:`   | `[data-state="unchecked"]`      |
| `data-active:`      | `[data-state="active"]`         |
| `data-inactive:`    | `[data-state="inactive"]`       |
| `data-on:`          | `[data-state="on"]`             |
| `data-off:`         | `[data-state="off"]`            |

```html
<!-- dialog overlay — fades in when open -->
<div data-state="closed" class="data-open:opacity-100 data-closed:opacity-0 transition-base">
```

---

## Accessibility variants

| Prefix               | Applies when                              |
|----------------------|-------------------------------------------|
| `motion-reduce:`     | `prefers-reduced-motion: reduce`          |
| `motion-safe:`       | `prefers-reduced-motion: no-preference`   |
| `forced-colors:`     | `forced-colors: active`                  |

```html
<div class="transition-base motion-reduce:transition-none">
```

---

## Stacking variants

Variants can be stacked. Order is prefix-left:

```html
<!-- hover only on md and above -->
<button class="md:hover:bg-brand-90">

<!-- dark mode + hover -->
<div class="dark:hover:bg-neutral-20">

<!-- ARIA + responsive -->
<span class="aria-expanded:rotate-180 md:aria-expanded:rotate-90">
```

---

## Purge safety

Variant classes are extracted by the purge system using pattern matching. Any class in the form `prefix:utility` found in your source files is retained. Dynamically assembled variant strings (e.g. `` `${variant}:bg-brand-80` ``) may not be detected — add those to `purge.safelist` in your config.
