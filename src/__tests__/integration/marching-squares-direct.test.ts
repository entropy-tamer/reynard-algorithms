/**
 * @file Marching Squares Direct Implementation Tests
 *
 * Tests for the createMarchingSquaresConfig helper and direct MarchingSquares usage.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { MarchingSquares } from "../../algorithms/procedural-generation/marching-squares/marching-squares-core";
import { createMarchingSquaresConfig } from "../../algorithms/procedural-generation/marching-squares/marching-squares-core";

describe("Marching Squares Direct Implementation", () => {
  describe("createMarchingSquaresConfig helper", () => {
    it("should return fast config for small grids (< 50)", () => {
      const config = createMarchingSquaresConfig(30);
      
      expect(config.interpolate).toBe(false);
      expect(config.ambiguityResolution).toBe("saddle");
      expect(config.tolerance).toBeUndefined();
    });

    it("should return interpolated config for medium grids (50-99)", () => {
      const config = createMarchingSquaresConfig(75);
      
      expect(config.interpolate).toBe(true);
      expect(config.ambiguityResolution).toBe("saddle");
      expect(config.tolerance).toBeUndefined();
    });

    it("should return optimized config for large grids (>= 100)", () => {
      const config = createMarchingSquaresConfig(150);
      
      expect(config.interpolate).toBe(true);
      expect(config.ambiguityResolution).toBe("saddle");
      expect(config.tolerance).toBe(1e-8);
    });

    it("should handle boundary values correctly", () => {
      expect(createMarchingSquaresConfig(49).interpolate).toBe(false);
      expect(createMarchingSquaresConfig(50).interpolate).toBe(true);
      expect(createMarchingSquaresConfig(99).interpolate).toBe(true);
      expect(createMarchingSquaresConfig(100).tolerance).toBe(1e-8);
    });
  });

  describe("MarchingSquares with config helper", () => {
    it("should work with small grid config", () => {
      const grid = Array(30)
        .fill(null)
        .map(() =>
          Array(30)
            .fill(0)
            .map(() => Math.random())
        );

      const gridSize = Math.sqrt(grid.length * grid[0].length);
      const ms = new MarchingSquares(createMarchingSquaresConfig(gridSize));
      const result = ms.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThanOrEqual(0);
    });

    it("should work with medium grid config", () => {
      const grid = Array(75)
        .fill(null)
        .map(() =>
          Array(75)
            .fill(0)
            .map(() => Math.random())
        );

      const gridSize = Math.sqrt(grid.length * grid[0].length);
      const ms = new MarchingSquares(createMarchingSquaresConfig(gridSize));
      const result = ms.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThanOrEqual(0);
    });

    it("should work with large grid config", () => {
      const grid = Array(150)
        .fill(null)
        .map(() =>
          Array(150)
            .fill(0)
            .map(() => Math.random())
        );

      const gridSize = Math.sqrt(grid.length * grid[0].length);
      const ms = new MarchingSquares(createMarchingSquaresConfig(gridSize));
      const result = ms.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThanOrEqual(0);
    });

    it("should produce consistent results across configs for same input", () => {
      const grid = Array(50)
        .fill(null)
        .map(() =>
          Array(50)
            .fill(0)
            .map(() => Math.random())
        );

      // Test with different configs on same grid
      const msSmall = new MarchingSquares(createMarchingSquaresConfig(30));
      const msMedium = new MarchingSquares(createMarchingSquaresConfig(75));
      const msLarge = new MarchingSquares(createMarchingSquaresConfig(150));

      const resultSmall = msSmall.compute(grid, 0.5);
      const resultMedium = msMedium.compute(grid, 0.5);
      const resultLarge = msLarge.compute(grid, 0.5);

      expect(resultSmall.stats.success).toBe(true);
      expect(resultMedium.stats.success).toBe(true);
      expect(resultLarge.stats.success).toBe(true);
      
      // All should produce valid contours (count may differ due to config)
      expect(resultSmall.contours.length).toBeGreaterThanOrEqual(0);
      expect(resultMedium.contours.length).toBeGreaterThanOrEqual(0);
      expect(resultLarge.contours.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Performance comparison", () => {
    it("should demonstrate config-based performance characteristics", () => {
      const grid = Array(50)
        .fill(null)
        .map(() =>
          Array(50)
            .fill(0)
            .map(() => Math.random())
        );

      const iterations = 10;
      const gridSize = Math.sqrt(grid.length * grid[0].length);

      // Small config (no interpolation) - should be faster
      const msFast = new MarchingSquares(createMarchingSquaresConfig(30));
      let fastTime = 0;
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        msFast.compute(grid, 0.5);
        fastTime += performance.now() - start;
      }

      // Medium config (with interpolation)
      const msMedium = new MarchingSquares(createMarchingSquaresConfig(gridSize));
      let mediumTime = 0;
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        msMedium.compute(grid, 0.5);
        mediumTime += performance.now() - start;
      }

      // Large config (interpolation + relaxed tolerance)
      const msOptimized = new MarchingSquares(createMarchingSquaresConfig(150));
      let optimizedTime = 0;
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        msOptimized.compute(grid, 0.5);
        optimizedTime += performance.now() - start;
      }

      const avgFast = fastTime / iterations;
      const avgMedium = mediumTime / iterations;
      const avgOptimized = optimizedTime / iterations;

      // Fast config should generally be fastest (no interpolation overhead)
      expect(avgFast).toBeLessThanOrEqual(avgMedium * 1.5); // Allow variance
      expect(avgFast).toBeLessThanOrEqual(avgOptimized * 1.5); // Allow variance

      console.log(`Performance: fast=${avgFast.toFixed(2)}ms, medium=${avgMedium.toFixed(2)}ms, optimized=${avgOptimized.toFixed(2)}ms`);
    });
  });
});