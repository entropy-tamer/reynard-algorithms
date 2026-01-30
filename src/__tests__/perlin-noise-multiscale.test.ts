/**
 * @file Tests for Perlin noise multiscale algorithms
 */

import { describe, expect, it } from "vitest";
import { PerlinNoise } from "../algorithms/procedural-generation/perlin-noise/perlin-noise-core";
import {
  generateMultiscaleNoise2D,
  generateMultiscaleNoise3D,
} from "../algorithms/procedural-generation/perlin-noise/perlin-noise-multiscale";
import type { MultiscalePerlinNoiseOptions } from "../algorithms/procedural-generation/perlin-noise/perlin-noise-types";

describe("Perlin Noise Multiscale", () => {
  describe("generateMultiscaleNoise2D", () => {
    it("should generate multiscale noise with multiple scales", () => {
      const options: MultiscalePerlinNoiseOptions = {
        scales: [
          { frequency: 0.01, amplitude: 1.0, name: "terrain" },
          { frequency: 0.05, amplitude: 0.5, name: "features" },
          { frequency: 0.1, amplitude: 0.25, name: "details" },
        ],
        combinationMode: "additive",
      };

      const result = generateMultiscaleNoise2D(10, 20, options, 0);

      expect(result.scales.size).toBe(3);
      expect(result.scales.has("terrain")).toBe(true);
      expect(result.scales.has("features")).toBe(true);
      expect(result.scales.has("details")).toBe(true);
      expect(typeof result.combined).toBe("number");
      expect(Number.isFinite(result.combined)).toBe(true);
    });

    it("should use index as key when name is not provided", () => {
      const options: MultiscalePerlinNoiseOptions = {
        scales: [
          { frequency: 0.01, amplitude: 1.0 },
          { frequency: 0.05, amplitude: 0.5 },
        ],
      };

      const result = generateMultiscaleNoise2D(10, 20, options, 0);

      expect(result.scales.has(0)).toBe(true);
      expect(result.scales.has(1)).toBe(true);
    });

    it("should support additive combination mode", () => {
      const options: MultiscalePerlinNoiseOptions = {
        scales: [
          { frequency: 0.01, amplitude: 1.0 },
          { frequency: 0.05, amplitude: 0.5 },
        ],
        combinationMode: "additive",
      };

      const result = generateMultiscaleNoise2D(10, 20, options, 0);
      const scale0 = result.scales.get(0)!;
      const scale1 = result.scales.get(1)!;

      // Combined should be approximately scale0 * 1.0 + scale1 * 0.5
      const expected = scale0 * 1.0 + scale1 * 0.5;
      expect(Math.abs(result.combined - expected)).toBeLessThan(0.0001);
    });

    it("should support multiplicative combination mode", () => {
      const options: MultiscalePerlinNoiseOptions = {
        scales: [
          { frequency: 0.01, amplitude: 1.0 },
          { frequency: 0.05, amplitude: 0.5 },
        ],
        combinationMode: "multiplicative",
      };

      const result = generateMultiscaleNoise2D(10, 20, options, 0);
      expect(typeof result.combined).toBe("number");
      expect(Number.isFinite(result.combined)).toBe(true);
    });

    it("should support weighted combination mode", () => {
      const options: MultiscalePerlinNoiseOptions = {
        scales: [
          { frequency: 0.01, amplitude: 2.0 },
          { frequency: 0.05, amplitude: 1.0 },
        ],
        combinationMode: "weighted",
      };

      const result = generateMultiscaleNoise2D(10, 20, options, 0);
      expect(typeof result.combined).toBe("number");
      expect(Number.isFinite(result.combined)).toBe(true);
    });

    it("should support max combination mode", () => {
      const options: MultiscalePerlinNoiseOptions = {
        scales: [
          { frequency: 0.01, amplitude: 1.0 },
          { frequency: 0.05, amplitude: 0.5 },
        ],
        combinationMode: "max",
      };

      const result = generateMultiscaleNoise2D(10, 20, options, 0);
      const scale0 = result.scales.get(0)!;
      const scale1 = result.scales.get(1)!;

      const expected = Math.max(scale0 * 1.0, scale1 * 0.5);
      expect(result.combined).toBeCloseTo(expected, 5);
    });

    it("should support min combination mode", () => {
      const options: MultiscalePerlinNoiseOptions = {
        scales: [
          { frequency: 0.01, amplitude: 1.0 },
          { frequency: 0.05, amplitude: 0.5 },
        ],
        combinationMode: "min",
      };

      const result = generateMultiscaleNoise2D(10, 20, options, 0);
      const scale0 = result.scales.get(0)!;
      const scale1 = result.scales.get(1)!;

      const expected = Math.min(scale0 * 1.0, scale1 * 0.5);
      expect(result.combined).toBeCloseTo(expected, 5);
    });

    it("should normalize combined result when normalize is true", () => {
      const options: MultiscalePerlinNoiseOptions = {
        scales: [
          { frequency: 0.01, amplitude: 1.0 },
          { frequency: 0.05, amplitude: 0.5 },
        ],
        combinationMode: "additive",
        normalize: true,
      };

      const result = generateMultiscaleNoise2D(10, 20, options, 0);
      expect(typeof result.combined).toBe("number");
      expect(Number.isFinite(result.combined)).toBe(true);
    });

    it("should handle empty scales array", () => {
      const options: MultiscalePerlinNoiseOptions = {
        scales: [],
      };

      const result = generateMultiscaleNoise2D(10, 20, options, 0);
      expect(result.scales.size).toBe(0);
      expect(result.combined).toBe(0);
    });
  });

  describe("generateMultiscaleNoise3D", () => {
    it("should generate multiscale 3D noise", () => {
      const options: MultiscalePerlinNoiseOptions = {
        scales: [
          { frequency: 0.01, amplitude: 1.0 },
          { frequency: 0.05, amplitude: 0.5 },
        ],
      };

      const result = generateMultiscaleNoise3D(10, 20, 30, options, 0);

      expect(result.scales.size).toBe(2);
      expect(typeof result.combined).toBe("number");
      expect(Number.isFinite(result.combined)).toBe(true);
    });
  });

  describe("PerlinNoise class multiscale methods", () => {
    it("should generate multiscale noise via class method", () => {
      const noise = new PerlinNoise({ seed: 12345 });
      const options: MultiscalePerlinNoiseOptions = {
        scales: [
          { frequency: 0.01, amplitude: 1.0, name: "terrain" },
          { frequency: 0.05, amplitude: 0.5, name: "features" },
        ],
      };

      const result = noise.multiscaleNoise2D(10, 20, options);

      expect(result.scales.size).toBe(2);
      expect(result.scales.has("terrain")).toBe(true);
      expect(result.scales.has("features")).toBe(true);
      expect(typeof result.combined).toBe("number");
    });

    it("should generate multiscale 3D noise via class method", () => {
      const noise = new PerlinNoise({ seed: 12345 });
      const options: MultiscalePerlinNoiseOptions = {
        scales: [
          { frequency: 0.01, amplitude: 1.0 },
          { frequency: 0.05, amplitude: 0.5 },
        ],
      };

      const result = noise.multiscaleNoise3D(10, 20, 30, options);

      expect(result.scales.size).toBe(2);
      expect(typeof result.combined).toBe("number");
    });

    it("should respect config offset and scale", () => {
      const noise = new PerlinNoise({
        seed: 12345,
        offset: { x: 100, y: 200 },
        scale: 2.0,
      });
      const options: MultiscalePerlinNoiseOptions = {
        scales: [{ frequency: 0.01, amplitude: 1.0 }],
      };

      const result1 = noise.multiscaleNoise2D(10, 20, options);
      const result2 = noise.multiscaleNoise2D(110, 220, options);

      // Results should be different due to offset
      expect(result1.combined).not.toBe(result2.combined);
    });
  });

  describe("Terrain-like configuration", () => {
    it("should work with terrain generation pattern", () => {
      const options: MultiscalePerlinNoiseOptions = {
        scales: [
          { frequency: 0.02, amplitude: 1.0, name: "base" },
          { frequency: 0.1, amplitude: 2.0, name: "large_features" },
          { frequency: 2.0, amplitude: 0.3, name: "small_details" },
        ],
        combinationMode: "additive",
      };

      const result = generateMultiscaleNoise2D(50, 50, options, 0);

      expect(result.scales.size).toBe(3);
      expect(result.scales.has("base")).toBe(true);
      expect(result.scales.has("large_features")).toBe(true);
      expect(result.scales.has("small_details")).toBe(true);
      expect(Number.isFinite(result.combined)).toBe(true);
    });
  });
});
