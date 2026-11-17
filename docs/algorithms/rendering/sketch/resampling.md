# Sketch: resampling

Source: `src/algorithms/rendering/sketch/resampling.ts`

Jitter is applied to a point stream, not to the endpoints of a segment. If a
100px segment is jittered only at its ends, the middle stays ruler-straight and
the result looks broken. Resampling first puts points every `spacing` px along
the path:

```ts
resampleSegment(a, b, spacing)  // inclusive of both ends
resamplePolyline(points, spacing) // drops duplicate joints
resampleClosed(points, spacing)   // adds the wrap segment
pathLength(points)               // arc length
```

## Spacing

The step is `max(0.5, spacing)`, and the segment is divided into
`round(length / step)` equal parts. Spacing is the quality knob: 12px gives a
visible hand at chart scale, 2px gives an expensive near-straight line, and
40px makes a bar edge look folded rather than drawn.

## Closed rings

`resampleClosed` runs the open resampler and then appends the segment from the
last point back to the first. Ellipses, rect outlines and hatch boundaries use
it so the seam does not get a single long, unjittered edge.

## Pitfalls

A zero-length segment returns one point. An empty polyline returns an empty
array; callers must handle both before indexing.

Do not feed an already-resampled stream back through the resampler. The joint
dropping is idempotent for identical points, but repeated subdivision with a
different spacing creates duplicate points that the jitter pass will displace
independently, producing spikes.
