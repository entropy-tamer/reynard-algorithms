# Sketch: hand-lettered text

Source: `src/algorithms/rendering/sketch/text.ts`

Glyphs come from the font (`@entropy-tamer/reynard-font-humor`). This module
supplies the two things a font cannot: a deterministic baseline tilt and an
optional wobbly underline.

```ts
const guide = textGuide(chartId, elementId, theme, x, y, width);
ctx.save();
ctx.translate(guide.x, guide.y);
ctx.rotate(guide.rotation);
ctx.font = '16px "Humor Sans", "Humor Fallback", sans-serif';
ctx.fillText(label, 0, 0);
ctx.restore();
```

The tilt is at most 0.022 radians and is derived from the same identifiers as
the strokes, so a label does not change angle between redraws.

## Glyph substitutions

Humor Sans has 105 glyphs. It has no `µ`, `≈` or arrows. Hand-lettered labels
must use:

| Wanted | Draw |
|---|---|
| `µs` | `us` |
| `≈` | `~` |
| `→` etc. | `sketchArrow` geometry |

Nothing in this module enforces the substitutions; the renderer owns the label
strings. The font package's README records the same table.

## Font readiness

Do not measure or draw canvas text until the face is loaded. An unloaded face
silently renders the fallback with different metrics, and the canvas will keep
that wrong measurement for the rest of its life. Await `fontsSettled()` or an
explicit `document.fonts.load()`, then redraw.

## Pitfalls

A tilt that is too large reads as a mistake rather than a hand. Keep it under
a couple of degrees for body labels; reserve larger angles for a chart title.
