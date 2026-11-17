# Sketch: hand-drawn fox mark

Source: `scripts/generate-fox-sketch.mjs` → `src/algorithms/rendering/sketch/fox-sketch-paths.ts`

The chart's top-right fox is drawn, not pasted. A build-time generator reads
the same `~/favicon.svg` the site uses for its CSS-mask mark, samples its path
data, normalises it to a 34px display box and pushes each point through the
sketch jitter primitives. The emitted TypeScript module is committed, so the
runtime never rasterises or traces an image.

```ts
import { FOX_SKETCH_STROKES, FOX_SKETCH_BOUNDS } from "@entropy-tamer/reynard-algorithms";
// each stroke: readonly { x, y }[]; draw with sketchPolyline
```

## Source and stability

| Field | Value |
|---|---|
| Source | `~/favicon.svg` |
| Source SHA-256 | `1037cd524f20e9ce1fd0e04453290ec756848f31c612c242c54d968c667785d6` |
| Generator version | 1 (folded into the per-stroke seed) |
| Display box | 34 x 34 px |
| Strokes | 4 (outline, nose detail, two eyes) |

The generated file carries the source hash. A unit test recomputes the hash
from the favicon and fails if the art changed without a regeneration, so the
drawing cannot silently drift from the site mark.

Because the seed includes the generator version, a deliberate retune produces
a different hand while keeping the same reproducibility guarantee.

## Regenerating

```sh
cd ~/reynard/algorithms
pnpm run build                       # generator imports dist/index.js
node scripts/generate-fox-sketch.mjs
```

The unit suite also regenerates to a temp path and asserts the bytes match the
committed file.

## Placement contract

- Top-right of the chart frame, inside its bounds.
- Decorative: `aria-hidden="true"` on the hosting element.
- Never covering bars, value labels or annotations -- use the `LayoutRect`
  helpers and the renderer's exclusion zone to reserve the corner.
- Desktop 28px / mobile 22px in sly.so; the 34px source box leaves room for the
  wobble.

Under `data-theme="neutral"` the CSS-mask mark is hidden so the hand-drawn
stroke mark is the only fox. Other themes keep the CSS mask.

## Pitfalls

The favicon uses relative `m`, `c`, `l` and `z` commands, including implicit
repeated cubic groups under one `c`. The generator handles those; an SVG with
arcs (`a`) or quadratic curves (`q`) needs the parser extended first.

Do not draw the mark from a live `getPointAtLength()` at runtime: it needs a DOM,
and it makes the stroke count depend on the browser's path implementation.
