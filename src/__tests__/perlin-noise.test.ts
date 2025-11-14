/**
 * @file Tests for Perlin noise algorithms
 */
import { describe, expect, it } from "vitest";
import {
  PerlinNoise,
  perlinNoise2D,
  fractalPerlinNoise2D,
} from "../algorithms/procedural-generation/perlin-noise/perlin-noise-core";

describe("Perlin Noise", () => {
  it("should generate 2D noise", () => {
    const value = perlinNoise2D(10, 20, 0);
    expect(typeof value).toBe("number");
    expect(value).toBeGreaterThanOrEqual(-1);
    expect(value).toBeLessThanOrEqual(1);
  });

  it("should create and use PerlinNoise class", () => {
    const noise = new PerlinNoise({ seed: 12345 });
    const value = noise.noise2D(10, 20);

    expect(typeof value).toBe("number");
    expect(value).toBeGreaterThanOrEqual(-1);
    expect(value).toBeLessThanOrEqual(1);
  });

  it("should generate fractal noise", () => {
    const value = fractalPerlinNoise2D(
      10,
      20,
      {
        octaves: 4,
        persistence: 0.5,
        lacunarity: 2.0,
      },
      0
    );

    expect(typeof value).toBe("number");
  });

  it("should generate noise with result", () => {
    const noise = new PerlinNoise({ seed: 12345 });
    const result = noise.noise2DWithResult(10, 20);

    expect(result).toHaveProperty("value");
    expect(result).toHaveProperty("gradient");
    expect(result.gradient).toHaveProperty("x");
    expect(result.gradient).toHaveProperty("y");
  });
});
