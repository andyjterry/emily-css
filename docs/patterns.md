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
