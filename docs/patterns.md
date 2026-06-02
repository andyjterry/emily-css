# Patterns

EmilyCSS includes a small pattern layer for common layout compositions. These classes do not require framework-specific markup.

## Layout

- `.center` constrains readable content to `65ch` and centers it.
- `.sidebar` creates an intrinsic sidebar and content layout.
- `.switcher` wraps from row to stack based on available space.
- `.cover` distributes content across the viewport height; use `.cover-center` on the item that should sit in the middle.
- `.grid-auto`, `.grid-auto-sm`, and `.grid-auto-lg` create responsive auto-fit grids.
- `.equal-columns` creates equal-width columns and stacks on small screens.
- `.media-object` places media beside text while allowing the text column to shrink safely.
- `.inline-list` removes list styling and lays items out inline with wrapping.
- `.content` and `.content-wide` provide centered text measures.
- `.section`, `.section-sm`, and `.section-lg` provide tokenized vertical section spacing.

Existing patterns such as `.stack`, `.cluster`, `.width-container`, `.prose`, `.field-container`, `.error-summary`, and `.btn` remain available.

## Prose

Use `.prose` for scoped rich-text content generated from `emily.config.json`.

```html
<article class="prose prose-md text-xl p-4 mx-auto">
  ...
</article>
```

Use `.prose-sm`, `.prose-md`, `.prose-lg`, and `.prose-xl` to control reading width only. Font size remains controlled by typography utilities such as `text-lg` and `text-xl`.

EmilyCSS does not generate `.prose-emily` by default. Existing projects can temporarily enable it with:

```json
{
  "prose": {
    "legacyAlias": true
  }
}
```
