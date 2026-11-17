# Sketch: geometry primitives

Source: `src/algorithms/rendering/sketch/primitives.ts`

| Function | Geometry | Returns bounds |
|---|---|---|
| `sketchLine` | straight segment | no |
| `sketchPolyline` | open path (series, axes, break marks) | no |
| `sketchRect` | closed rectangle outline | yes |
| `sketchBar` | bar outline, optional hatch fill | yes |
| `sketchEllipse` | ellipse or circle ring | no |
| `sketchArrow` | dashed leader + two-stroke arrowhead | no |
| `sketchHatchFill` | parallel clipped hatch strokes | no |

Every primitive takes a sink, a seed and `SketchOptions`, resamples its
geometry, and delegates to `sketchStroke`.

```ts
const { bounds } = sketchBar(sink, 100, 120, 40, 60, seed);
expect(rectsIntersect(bounds, labelRect)).toBe(false);
```

## Bounds and layout

Rect-returning primitives give the **un-jittered** `LayoutRect`. Layout
validators must use that, not the wobbled pixels: a label placed just outside a
bar may overlap the wobble by a fraction of a pixel, which is visually fine, but
an overlap against the true bounds is a real collision. The existing
`rectsIntersect` / `intersectionArea` helpers in `collision/layout-rect.ts` are
the gate.

## Hatching

`sketchHatchFill` clips parallel lines to the rect with Liang-Barsky, then
jitter-strokes each line with its own derived seed and a single pass. It
replaces a solid fill in the muted neutral palette: a gray wash made of strokes
reads as pencil shading rather than a colored block.

## Arrows

`sketchArrow` draws the wobbly leader with `sketchStroke`, then re-draws the
straight leader with `setLineDash` for the dashed annotation look, then adds two
short jittered strokes for the arrowhead. The dash is on its own path because
`sketchStroke` clears the dash pattern.

## Pitfalls

Do not let a hatch line run past the bar edge: the clip is exact, but the
jitter can push an endpoint a pixel outside. The bound is accounted for in the
unit tests.

Ellipse sampling uses Ramanujan's circumference approximation. For very flat
ellipses clamp the sample count -- otherwise the ring has more points than the
resampler needs and the stroke cost climbs.
