# SVG Icons Guide

This folder contains all built-in SVG icon constants used by the gallery sidebar.

## Structure

```
icons/
├── shapes.ts      # Geometric shapes (circle, square, star, etc.)
├── weather.ts     # Weather icons (sun, moon, cloud, etc.)
├── common.ts      # Common UI icons (home, bell, lock, search, etc.)
├── nature.ts      # Nature icons (tree, flower, leaf, etc.)
├── emoji.ts       # Emoji-style icons (smiley, fire, rocket, etc.)
├── index.ts       # Re-exports all icon files
└── README.md      # This file
```

Each file exports named constants in the format `SVG_<NAME>` containing raw SVG strings.

---

## Adding an icon to an existing category

1. Open the relevant category file (e.g. `common.ts` for a new UI icon).
2. Add a new `export const` following the naming convention:

```ts
// In common.ts
export const SVG_PHONE = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <!-- Your SVG paths here -->
</svg>`;
```

**Rules:**

- Name must start with `SVG_` followed by `UPPER_SNAKE_CASE`.
- Always include `xmlns="http://www.w3.org/2000/svg"` on the root `<svg>` element.
- Always include `viewBox` so it scales correctly in thumbnails.
- Use `width="100" height="100"` as the default size (the gallery strips these for thumbnails automatically).
- Keep colours simple and readable — use named colours or hex values.

3. The icon will be **automatically picked up** by the gallery — no further changes needed.

---

## Adding a new category

1. Create a new file in this folder, e.g. `animals.ts`.

```ts
// src/app/svg-icons/icons/animals.ts

export const SVG_CAT = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <!-- paths -->
</svg>`;

export const SVG_DOG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <!-- paths -->
</svg>`;
```

2. Re-export it from `index.ts`:

```ts
// index.ts  — add this line:
export * from './animals';
```

3. Register it in [`svg-gallery.ts`](../svg-gallery.ts) so it appears under the right category label:

```ts
// svg-gallery.ts
import * as Animals from './icons/animals';

// Add to the SVG_GALLERY array:
export const SVG_GALLERY: SvgIconEntry[] = [
  ...categorize('Shapes', extract(Shapes, 'SVG_')),
  ...categorize('Weather', extract(Weather, 'SVG_')),
  ...categorize('Common', extract(Common, 'SVG_')),
  ...categorize('Nature', extract(Nature, 'SVG_')),
  ...categorize('Emoji', extract(Emoji, 'SVG_')),
  ...categorize('Animals', extract(Animals, 'SVG_')), // ← add this
];
```

That's it — all icons in the new file will appear in the gallery sidebar, searchable by name or category.

---

## Icon naming tips

| Constant name     | Displayed as |
| ----------------- | ------------ |
| `SVG_ARROW_RIGHT` | arrow right  |
| `SVG_THUMBS_UP`   | thumbs up    |
| `SVG_SUN`         | sun          |

The gallery converts `SVG_` prefix removed, underscores replaced with spaces, all lowercase.
