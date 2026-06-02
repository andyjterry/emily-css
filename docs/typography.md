# Typography

**Last Updated:** 2026-05-23

Typography utilities are generated from the `typography` and `fontFamily` sections of your config.

---

## Font families

```json
{
  "fontFamily": {
    "heading": "atkinson",
    "body": "inter"
  }
}
```

Generates `font-heading` and `font-body` utilities. EmilyCSS does not load font files — load them yourself via `@fontsource`, Google Fonts, or a self-hosted stylesheet before using these classes.

---

## Font sizes

```json
{
  "typography": {
    "fontSizes": [
      { "name": "xs",   "value": "12px", "lineHeight": 1.5 },
      { "name": "sm",   "value": "14px", "lineHeight": 1.5 },
      { "name": "base", "value": "16px", "lineHeight": 1.6 },
      { "name": "lg",   "value": "18px", "lineHeight": 1.6 },
      { "name": "xl",   "value": "20px", "lineHeight": 1.6 },
      { "name": "2xl",  "value": "24px", "lineHeight": 1.4 },
      { "name": "3xl",  "value": "30px", "lineHeight": 1.4 },
      { "name": "4xl",  "value": "36px", "lineHeight": 1.3 },
      { "name": "5xl",  "value": "48px", "lineHeight": 1.15 }
    ]
  }
}
```

Each entry generates a `text-{name}` utility that sets both `font-size` and `line-height`.

```html
<h1 class="text-4xl">Heading</h1>
<p class="text-base">Body copy.</p>
<small class="text-sm">Caption</small>
```

---

## Font weights

```json
{
  "typography": {
    "fontWeights": {
      "light":    300,
      "normal":   400,
      "medium":   500,
      "semibold": 600,
      "bold":     700
    }
  }
}
```

Generates `font-light`, `font-normal`, `font-medium`, `font-semibold`, `font-bold`.

```html
<h2 class="text-2xl font-semibold">Section title</h2>
<p class="text-base font-normal">Regular body text.</p>
```

---

## Text alignment

`text-left`, `text-center`, `text-right`, `text-justify`, `text-start`, `text-end`

---

## Line height

Standalone line height utilities generated from `lineHeightRatio` and fixed scale:

`leading-none`, `leading-tight`, `leading-snug`, `leading-normal`, `leading-relaxed`, `leading-loose`

---

## Letter spacing

`tracking-tighter`, `tracking-tight`, `tracking-normal`, `tracking-wide`, `tracking-wider`, `tracking-widest`

---

## Text decoration

`underline`, `overline`, `line-through`, `no-underline`

`underline-offset-1`, `underline-offset-2`, `underline-offset-4`, `underline-offset-8`

---

## Text transform

`uppercase`, `lowercase`, `capitalize`, `normal-case`

---

## Text overflow

`truncate`, `text-ellipsis`, `text-clip`, `whitespace-nowrap`, `whitespace-normal`, `whitespace-pre`, `whitespace-pre-wrap`

---

## Numeric variants

`tabular-nums`, `oldstyle-nums`, `proportional-nums`, `diagonal-fractions`, `slashed-zero`

---

## Responsive

All text utilities support responsive prefixes:

```html
<h1 class="text-2xl md:text-4xl lg:text-5xl font-bold">
```
