# Sketch: deterministic signatures

Source: `src/algorithms/rendering/sketch/serialize.ts`

A sketch result is a list of point streams, one per pass. Serializing them
gives a compact value that can be compared across redraws and across browsers
without a screenshot.

```ts
serializePoints(points, precision = 2) // "x,y x,y ..."
serializeSketch(result, precision = 2) // passes joined with "|"
hashSketch(result, precision = 2)      // FNV-1a, 8 hex chars
```

Coordinates are rounded to `precision` decimals before joining, so
floating-point noise below a hundredth of a pixel does not change the
signature.

## Use

Unit tests assert that the same seed produces the same signature. The browser
e2e gate reads a signature exposed by the renderer and asserts it is unchanged
after a resize and across two page loads. That is what proves the chart is not
re-rolling its wobble.

## Pitfalls

A signature is not a visual assertion: it will happily stay constant while a
color or font is wrong. Pair it with pixel/color checks in the e2e gate.

Do not raise precision without checking that sub-pixel jitter still rounds
stably across engines. Two decimals is the tested setting.
