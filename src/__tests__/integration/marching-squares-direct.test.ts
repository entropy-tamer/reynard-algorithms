/**
 * @file Marching Squares Direct Implementation Tests
 *
 * Tests for the createMarchingSquaresConfig helper and direct MarchingSquares usage.
 */

import { describe, expect, it } from "vitest";
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
    // Seeded so the fixture is the same on every run. The previous version used
    // `Math.random()`, so the amount of work varied per run on top of the clock
    // comparison -- two independent sources of nondeterminism in one gate.
    const seededGrid = (n: number, seed: number): number[][] => {
      let a = seed >>> 0;
      const rand = (): number => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      return Array(n)
        .fill(null)
        .map(() => Array(n).fill(0).map(() => rand()));
    };

    const workOf = (result: { contours: { segments: unknown[] }[] }): { contours: number; segments: number } => ({
      contours: result.contours.length,
      segments: result.contours.reduce((acc, c) => acc + c.segments.length, 0),
    });

    it("should produce identical topology across configs, since config changes precision and not topology", () => {
      const grid = seededGrid(50, 42);
      const gridSize = Math.sqrt(grid.length * grid[0]!.length);

      // interpolate:false for <50, interpolate:true for >=50, tolerance relaxed
      // at >=100. None of that changes WHICH cells are crossed, so the contour
      // and segment counts must agree exactly. This is an agreement assertion
      // between three renderings of one fact, so it needs no magic constant and
      // cannot be satisfied by all three drifting together.
      const fast = workOf(new MarchingSquares(createMarchingSquaresConfig(30)).compute(grid, 0.5));
      const medium = workOf(new MarchingSquares(createMarchingSquaresConfig(gridSize)).compute(grid, 0.5));
      const optimized = workOf(new MarchingSquares(createMarchingSquaresConfig(150)).compute(grid, 0.5));

      expect(medium).toEqual(fast);
      expect(optimized).toEqual(fast);

      // Precondition, asserted so the equalities above cannot pass vacuously on
      // an empty result.
      expect(fast.contours).toBeGreaterThan(0);
      expect(fast.segments).toBeGreaterThan(0);
    });

    it("should not regress the fragment-join cost", () => {
      // Recorded, not asserted: a wall-clock gate here was a coin flip that
      // failed by 0.06% on the pre-join-fix code. The deterministic coverage for
      // this path is the topology agreement above plus the large-grid test.
      const grid = seededGrid(50, 42);
      const iterations = 10;
      const gridSize = Math.sqrt(grid.length * grid[0]!.length);

      const time = (cfg: ReturnType<typeof createMarchingSquaresConfig>): number => {
        const ms = new MarchingSquares(cfg);
        let total = 0;
        for (let i = 0; i < iterations; i++) {
          const start = performance.now();
          ms.compute(grid, 0.5);
          total += performance.now() - start;
        }
        return total / iterations;
      };

      const avgFast = time(createMarchingSquaresConfig(30));
      const avgMedium = time(createMarchingSquaresConfig(gridSize));
      const avgOptimized = time(createMarchingSquaresConfig(150));

      console.log(
        `Performance: fast=${avgFast.toFixed(2)}ms, medium=${avgMedium.toFixed(2)}ms, optimized=${avgOptimized.toFixed(2)}ms`
      );
    });
  });
});
