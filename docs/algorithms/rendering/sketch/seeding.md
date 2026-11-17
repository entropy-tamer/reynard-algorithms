# Sketch: seeding

Source: `src/algorithms/rendering/sketch/seeding.ts`

A hand-drawn line is a deterministic function of its geometry and a seed. The
seed is derived from stable identifiers rather than held in module state:

```ts
deriveSeed(chartId, elementId, theme) // -> unsigned 32-bit int
passSeed(seed, pass)                  // -> independent seed per overlapping pass
createSketchRandom(seed)              // -> mulberry32 stream
```

`deriveSeed` is FNV-1a over a length-prefixed, separator-terminated encoding of
each part. The length prefix is the point: `["ab", "c"]` and `["a", "bc"]` join
to the same string but must not produce the same seed.

## Why determinism matters

A "hand-drawn" chart that re-rolls its wobble on every redraw looks like it is
shivering. Resize, theme toggles and dev re-mounts all call the renderer again;
deriving the seed from `(chart id, element id, theme)` makes the wobble stable
across all of them. The browser e2e gate compares a serialized signature
between two loads, which only works because of this.

`passSeed` derives each pass from the base seed with a golden-ratio constant, so
the two passes of a stroke overlap without being identical. Because it is
arithmetic on the seed rather than a call to the random stream, pass order is
stable even if a future change adds a third pass.

## Pitfalls

Do not seed from `Math.random()`, a timestamp, or an incrementing counter. All
three make the output irreproducible and break the signature gate.

Do not use the random stream itself to derive per-element seeds: consuming one
more draw call in an unrelated element shifts every later seed. Derive from
identifiers instead.
