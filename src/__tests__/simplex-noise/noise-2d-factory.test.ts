/**
 * The slim 2D sampler must be the same algorithm, not a lookalike.
 *
 * `createNoise2D` exists to stop a 2D caller from linking 3D, 4D, multiscale and
 * analysis code. The risk it introduces is divergence: a wrapper that drifts from
 * `generateNoise2D` by one scaling step is invisible in a rendered field and
 * obvious only in a comparison. So the comparison is the test, across seeds,
 * offsets, amplitudes, frequencies, scale and the normalize flag -- every knob
 * the factory claims to honour.
 *
 * The fixture is the reference implementation itself, which is what makes this
 * worth more than a snapshot: if `generateNoise2D` changes, both sides move and
 * the test still holds; if the factory's copy of the transform rots, only one
 * side moves and it fails.
 */

import { describe, expect, it } from "vitest";
import { createNoise2D } from "../../algorithms/procedural-generation/simplex-noise/simplex-noise-2d-factory";
import { SimplexNoise } from "../../algorithms/procedural-generation/simplex-noise/simplex-noise-core";

const SAMPLES: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.5, 0.5],
  [10, 20],
  [-13.25, 7.75],
  [100.125, -100.125],
  [1e-3, 2e-3],
];

describe("createNoise2D", () => {
  it("agrees with SimplexNoise.noise2D for the default configuration", () => {
    const noise2D = createNoise2D();
    const reference = new SimplexNoise();

    for (const [x, y] of SAMPLES) {
      expect(noise2D(x, y)).toBe(reference.noise2D(x, y));
    }
  });

  it("agrees with SimplexNoise.noise2D across seeds", () => {
    for (const seed of [0, 1, 7, 42, 0xffff_ffff]) {
      const noise2D = createNoise2D({ seed });
      const reference = new SimplexNoise({ seed });

      for (const [x, y] of SAMPLES) {
        expect(noise2D(x, y), `seed ${seed} at (${x}, ${y})`).toBe(reference.noise2D(x, y));
      }
    }
  });

  it("agrees with SimplexNoise.noise2D across frequency, amplitude, scale and offset", () => {
    const configs = [
      { frequency: 0.02 },
      { frequency: 3.5, amplitude: 0.25 },
      { scale: 2, offset: { x: 4, y: -3, z: 0, w: 0 } },
      { frequency: 1.25, amplitude: 2, scale: 0.5, offset: { x: -1, y: 1, z: 0, w: 0 } },
    ];

    for (const config of configs) {
      const noise2D = createNoise2D(config);
      const reference = new SimplexNoise(config);

      for (const [x, y] of SAMPLES) {
        expect(noise2D(x, y), JSON.stringify(config)).toBe(reference.noise2D(x, y));
      }
    }
  });

  it("agrees with SimplexNoise when normalize is set", () => {
    const noise2D = createNoise2D({ seed: 3, normalize: true });
    const reference = new SimplexNoise({ seed: 3, normalize: true });

    const values = SAMPLES.map(([x, y]) => noise2D(x, y));
    expect(values).toEqual(SAMPLES.map(([x, y]) => reference.noise2D(x, y)));
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it("is deterministic: the same seed gives the same field, a different one does not", () => {
    const a = createNoise2D({ seed: 11 });
    const b = createNoise2D({ seed: 11 });
    const c = createNoise2D({ seed: 12 });

    const field = (noise: (x: number, y: number) => number) =>
      Array.from({ length: 16 }, (_, i) => noise(i * 0.37, i * 0.11));

    expect(field(a)).toEqual(field(b));
    expect(field(a)).not.toEqual(field(c));
  });

  it("stays within the documented range without normalize", () => {
    const noise2D = createNoise2D({ seed: 5, frequency: 0.03 });

    for (let i = 0; i < 256; i += 1) {
      const value = noise2D(i * 0.5, i * 0.25);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});
