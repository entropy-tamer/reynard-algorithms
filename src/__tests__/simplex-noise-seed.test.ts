/**
 * @file Tests for SimplexNoise's seed
 *
 * `seed` is documented on `SimplexNoiseConfig` and was ignored by the
 * permutation initialiser: every instance, whatever the seed, produced the
 * canonical Perlin noise. Nothing failed, because no test compared two seeds --
 * the field was "random-looking" either way. These tests are that comparison.
 */

import { describe, expect, it } from "vitest";
import { SimplexNoise } from "../algorithms/procedural-generation/simplex-noise/simplex-noise-core";

const SAMPLES = Array.from({ length: 24 }, (_, index) => [index * 0.37, index * 0.11] as const);

function field(noise: SimplexNoise): number[] {
  return SAMPLES.map(([x, y]) => noise.noise2D(x, y));
}

describe("SimplexNoise seed", () => {
  it("changes the field when the seed changes", () => {
    expect(field(new SimplexNoise({ seed: 1 }))).not.toEqual(field(new SimplexNoise({ seed: 2 })));
  });

  it("is reproducible for one seed", () => {
    expect(field(new SimplexNoise({ seed: 12345 }))).toEqual(
      field(new SimplexNoise({ seed: 12345 })),
    );
  });

  it("keeps the canonical table for seed 0", () => {
    // Every caller that never passed a seed gets this table; an unseeded
    // instance must stay byte-identical to a seed-0 one, or every existing
    // terrain and fixture moves under the fix.
    const unseeded = new SimplexNoise();
    const zero = new SimplexNoise({ seed: 0 });
    expect(field(zero)).toEqual(field(unseeded));
  });

  it("re-seeds when the config is updated", () => {
    const noise = new SimplexNoise({ seed: 7 });
    const before = field(noise);
    noise.updateConfig({ seed: 8 });
    expect(field(noise)).not.toEqual(before);
    noise.updateConfig({ seed: 7 });
    expect(field(noise)).toEqual(before);
  });

  it("stays inside the documented range", () => {
    for (const seed of [0, 1, 2, 3, 4, 5]) {
      for (const value of field(new SimplexNoise({ seed }))) {
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });
});
