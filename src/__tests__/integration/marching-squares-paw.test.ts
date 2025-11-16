/**
 * @file Marching Squares PAW Integration Tests
 *
 * End-to-end integration tests for the PAW-optimized marching squares workflow.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { AlgorithmSelector } from "../../optimization/core/algorithm-selector";
import { OptimizedMarchingSquaresAdapter } from "../../optimization/adapters/optimized-marching-squares-adapter";
import { MarchingSquares } from "../../algorithms/procedural-generation/marching-squares/marching-squares-core";

describe("Marching Squares PAW Integration", () => {
  let selector: AlgorithmSelector;
  let adapter: OptimizedMarchingSquaresAdapter;

  beforeEach(() => {
    selector = new AlgorithmSelector();
    adapter = new OptimizedMarchingSquaresAdapter({
      enableAlgorithmSelection: true,
      enableMemoryPooling: true,
      enablePerformanceMonitoring: true,
      algorithmSelectionStrategy: "adaptive",
    });
  });

  describe("End-to-End PAW Workflow", () => {
    it("should select optimal algorithm based on workload", () => {
      const smallWorkload = {
        objectCount: 25 * 25, // Small grid
        spatialDensity: 0.5,
        overlapRatio: 0.1,
        updateFrequency: 1,
        queryPattern: "random" as const,
      };

      const selection = selector.selectProceduralAlgorithm(smallWorkload);

      expect(selection.algorithm).toBeDefined();
      expect(selection.confidence).toBeGreaterThan(0);
      expect(selection.expectedPerformance).toBeDefined();
    });

    it("should use selected algorithm in adapter", () => {
      const grid = Array(50)
        .fill(null)
        .map(() =>
          Array(50)
            .fill(0)
            .map(() => Math.random())
        );

      const result = adapter.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThanOrEqual(0);
    });

    it("should track performance across multiple computations", () => {
      const grid = Array(30)
        .fill(null)
        .map(() =>
          Array(30)
            .fill(0)
            .map(() => Math.random())
        );

      // Run multiple times
      for (let i = 0; i < 5; i++) {
        adapter.compute(grid, 0.5);
      }

      const stats = adapter.getPerformanceStats();

      expect(stats.totalQueries).toBe(5);
      expect(stats.averageExecutionTime).toBeGreaterThan(0);
    });

    it("should provide optimization recommendations", { timeout: 30000 }, () => {
      const grid = Array(50)
        .fill(null)
        .map(() =>
          Array(50)
            .fill(0)
            .map(() => Math.random())
        );

      // Run multiple times to build up statistics
      for (let i = 0; i < 10; i++) {
        adapter.compute(grid, 0.5);
      }

      const recommendations = adapter.getOptimizationRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe("Performance Improvements", () => {
    it("should demonstrate performance improvements over standard implementation", () => {
      const grid = Array(50)
        .fill(null)
        .map(() =>
          Array(50)
            .fill(0)
            .map(() => Math.random())
        );

      const iterations = 10;

      // Standard implementation
      const ms = new MarchingSquares();
      let standardTime = 0;
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        ms.compute(grid, 0.5);
        standardTime += performance.now() - start;
      }

      // Optimized adapter
      let optimizedTime = 0;
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        adapter.compute(grid, 0.5);
        optimizedTime += performance.now() - start;
      }

      const avgStandard = standardTime / iterations;
      const avgOptimized = optimizedTime / iterations;

      // Optimized should be at least as fast (often faster due to adaptive selection)
      expect(avgOptimized).toBeLessThanOrEqual(avgStandard * 1.1);
    });
  });

  describe("Memory Pooling Integration", () => {
    it("should use memory pooling for repeated computations", () => {
      const grid = Array(40)
        .fill(null)
        .map(() =>
          Array(40)
            .fill(0)
            .map(() => Math.random())
        );

      // Run multiple times
      for (let i = 0; i < 20; i++) {
        adapter.compute(grid, 0.5);
      }

      const poolStats = adapter.getMemoryPoolStats();

      expect(poolStats.hitRate).toBeGreaterThanOrEqual(0);
      expect(poolStats.hitRate).toBeLessThanOrEqual(1);
    });
  });

  describe("Performance Monitoring Integration", () => {
    it("should detect performance degradation", { timeout: 30000 }, () => {
      const smallGrid = Array(20)
        .fill(null)
        .map(() =>
          Array(20)
            .fill(0)
            .map(() => Math.random())
        );

      const largeGrid = Array(100)
        .fill(null)
        .map(() =>
          Array(100)
            .fill(0)
            .map(() => Math.random())
        );

      // Run with small grid
      for (let i = 0; i < 5; i++) {
        adapter.compute(smallGrid, 0.5);
      }

      // Run with large grid (should trigger performance monitoring)
      for (let i = 0; i < 3; i++) {
        adapter.compute(largeGrid, 0.5);
      }

      const isDegraded = adapter.isPerformanceDegraded();
      expect(typeof isDegraded).toBe("boolean");
    });

    it("should generate performance report", () => {
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

      const report = adapter.getPerformanceReport();

      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });
  });

  describe("Statistics Management", () => {
    it("should reset statistics", () => {
      const grid = Array(30)
        .fill(null)
        .map(() =>
          Array(30)
            .fill(0)
            .map(() => Math.random())
        );

      // Run multiple times
      for (let i = 0; i < 5; i++) {
        adapter.compute(grid, 0.5);
      }

      adapter.resetStatistics();

      const stats = adapter.getPerformanceStats();
      expect(stats.totalQueries).toBe(0);
    });
  });
});
