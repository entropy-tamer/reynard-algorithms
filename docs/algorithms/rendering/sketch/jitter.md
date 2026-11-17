# Sketch: jitter

Source: `src/algorithms/rendering/sketch/jitter.ts`

`jitterPath` displaces each resampled point along the path normal. The
displacement is the sum of two components:

- a low-frequency component from `SimplexNoise` sampled at `arc / wavelength`,
  which makes a long stroke bend the way a wrist does;
- a small uncorrelated component from `mulberry32`, which gives the line its
  tooth.

```ts
jitterPath(points, seed, { amplitude: 2.4, wavelength: 46, fineAmplitude: 0.5 })
jitterBound({ scale: 1 }) // amplitude + fineAmplitude
```

All distances are CSS px. `scale` multiplies both amplitudes; `scale === 0`
returns the input geometry unchanged, which is the sketch renderer's clean
fallback and its stable animation end frame.

## Normals

The tangent at point *i* is the vector from *i-1* to *i+1*; the normal is that
tangent rotated 90 degrees. Endpoints use the adjacent segment. Displacement
is along the normal only, so a vertical bar stays vertical and a horizontal
axis stays horizontal while their edges wobble.

## Bounds

The first and last points are anchored to their original coordinates: an axis
must still meet its tick marks, and a bar must still land on its value. Every
interior point is displaced by at most `amplitude + fineAmplitude` in the
normal direction.

## Pitfalls

A wavelength close to the resampling spacing makes the noise alias into a
sawtooth. Keep wavelength at least three times the spacing.

The smooth component is sampled against arc length, not point index. Changing
the resampling spacing therefore changes the wobble; keep spacing fixed for a
given chart, or accept that a resize redraws a different (but still
deterministic) hand.
