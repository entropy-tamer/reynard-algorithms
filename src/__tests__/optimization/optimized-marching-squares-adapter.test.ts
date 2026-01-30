/**
 * @file Optimized Marching Squares Adapter Tests
 *
 * Tests for the PAW-optimized marching squares adapter.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { OptimizedMarchingSquaresAdapter } from "../../optimization/adapters/optimized-marching-squares-adapter";
import { MarchingSquares } from "../../algorithms/procedural-generation/marching-squares/marching-squares-core";

describe("OptimizedMarchingSquaresAdapter", () => {
  let adapter: OptimizedMarchingSquaresAdapter;

  beforeEach(() => {
    adapter = new OptimizedMarchingSquaresAdapter({
      enableAlgorithmSelection: true,
      enableMemoryPooling: true,
      enablePerformanceMonitoring: true,
      algorithmSelectionStrategy: "adaptive",
    });
  });

  describe("compute", () => {
    it("should compute contours from a grid", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = adapter.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThanOrEqual(0);
      expect(result.stats.gridWidth).toBe(3);
      expect(result.stats.gridHeight).toBe(3);
    });

    it("should use adaptive algorithm selection for small grids", () => {
      const grid = Array(25)
        .fill(null)
        .map(() =>
          Array(25)
            .fill(0)
            .map(() => Math.random())
        );

      const result = adapter.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
    });

    it("should use adaptive algorithm selection for medium grids", () => {
      const grid = Array(75)
        .fill(null)
        .map(() =>
          Array(75)
            .fill(0)
            .map(() => Math.random())
        );

      const result = adapter.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
    });

    it("should use adaptive algorithm selection for large grids", { timeout: 30000 }, () => {
      const grid = Array(100)
        .fill(null)
        .map(() =>
          Array(100)
            .fill(0)
            .map(() => Math.random())
        );

      const result = adapter.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
    });

    it("should use refined-lut strategy when specified", () => {
      const refinedAdapter = new OptimizedMarchingSquaresAdapter({
        algorithmSelectionStrategy: "refined-lut",
      });

      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = refinedAdapter.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
    });

    it("should use standard strategy when specified", () => {
      const standardAdapter = new OptimizedMarchingSquaresAdapter({
        algorithmSelectionStrategy: "standard",
      });

      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = standardAdapter.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
    });
  });

  describe("Performance Monitoring", () => {
    it("should track performance statistics", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      adapter.compute(grid, 0.5);

      const stats = adapter.getPerformanceStats();

      expect(stats).toBeDefined();
      expect(stats.totalQueries).toBeGreaterThan(0);
    });

    it("should detect performance degradation", () => {
      const grid = Array(100)
        .fill(null)
        .map(() =>
          Array(100)
            .fill(0)
            .map(() => Math.random())
        );

      // Run multiple times to build up statistics
      for (let i = 0; i < 5; i++) {
        adapter.compute(grid, 0.5);
      }

      const isDegraded = adapter.isPerformanceDegraded();
      expect(typeof isDegraded).toBe("boolean");
    });

    it("should provide performance report", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      adapter.compute(grid, 0.5);

      const report = adapter.getPerformanceReport();

      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
    });
  });

  describe("Memory Pooling", () => {
    it("should provide memory pool statistics", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      adapter.compute(grid, 0.5);

      const stats = adapter.getMemoryPoolStats();

      expect(stats).toBeDefined();
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeLessThanOrEqual(1);
    });

    it("should provide optimization recommendations", () => {
      const grid = Array(50)
        .fill(null)
        .map(() =>
          Array(50)
            .fill(0)
            .map(() => Math.random())
        );

      // Run multiple times
      for (let i = 0; i < 10; i++) {
        adapter.compute(grid, 0.5);
      }

      const recommendations = adapter.getOptimizationRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe("Configuration", () => {
    it("should respect enableMemoryPooling option", () => {
      const noPoolAdapter = new OptimizedMarchingSquaresAdapter({
        enableMemoryPooling: false,
      });

      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = noPoolAdapter.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
    });

    it("should respect enablePerformanceMonitoring option", () => {
      const noMonitorAdapter = new OptimizedMarchingSquaresAdapter({
        enablePerformanceMonitoring: false,
      });

      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = noMonitorAdapter.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
    });

    it("should respect marchingSquaresConfig option", () => {
      const configAdapter = new OptimizedMarchingSquaresAdapter({
        marchingSquaresConfig: {
          ambiguityResolution: "saddle",
          interpolate: true,
        },
      });

      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = configAdapter.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
    });
  });

  describe("Statistics Management", () => {
    it("should reset statistics", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      adapter.compute(grid, 0.5);
      adapter.resetStatistics();

      const stats = adapter.getPerformanceStats();

      expect(stats.totalQueries).toBe(0);
    });

    it("should destroy resources", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      adapter.compute(grid, 0.5);
      adapter.destroy();

      // Should not throw after destroy
      expect(() => {
        adapter.compute(grid, 0.5);
      }).not.toThrow();
    });
  });
});
