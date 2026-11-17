# Sketch: double-pass stroke

Source: `src/algorithms/rendering/sketch/stroke.ts`

`sketchStroke` draws the same resampled path twice, each pass jittered with an
independent `passSeed`. The second pass is thinner, fainter and offset by a
fraction of a pixel. The overlap reads as a pen pressed twice -- the recipe
matplotlib uses in `plt.xkcd()`.

```ts
const result = sketchStroke(sink, points, seed, {
  passes: 2,        // default
  passOffset: 0.9,  // px between passes
  width: 1.6,       // base px
  alpha: 0.85,      // base alpha
  color: "#000",
  roughness: 0.55,
});
```

The result carries the emitted point streams for every pass. Tests assert
those streams are identical across repeated calls; the browser e2e gate hashes
them into a signature that detects a re-rolled wobble.

## The sink

The sink is a structural subset of `CanvasRenderingContext2D` (`beginPath`,
`moveTo`, `lineTo`, `stroke`, style properties, and dash control). A real canvas
context satisfies it directly; unit tests use a recording object. No DOM type
appears in this module.

## Pass count

One pass is the clean single line. Two is the default hand. Three or four
looks inked and is only useful for a hero graphic -- it costs another full
jitter and stroke per geometry element.

## Pitfalls

Do not use opacity alone to fake the second pass: two identical semi-transparent
strokes do not read as a hand, they read as a blurry line. The seed must differ
between passes.

`sketchStroke` resets the dash pattern before drawing. Annotations that need a
dashed leader draw the dash on a separate path (`sketchArrow` does this).
