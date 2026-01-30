/**
 * Memoization Tests
 *
 * Tests for memoization utilities to ensure they work correctly
 * and provide performance improvements.
 *
 * @module algorithms/utils/memoization.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { memoize, memoizeMath, memoizeGeometry, MathMemo, clearMathMemo, getMathMemoStats } from "../memoization";

describe("Memoization Utilities", () => {
  beforeEach(() => {
    clearMathMemo();
  });

  describe("memoize", () => {
    it("should cache function results", () => {
      let callCount = 0;
      const expensiveFunction = (x: number) => {
        callCount++;
        return x * x;
      };

      const memoizedFn = memoize(expensiveFunction);

      // First call should execute the function
      expect(memoizedFn(5)).toBe(25);
      expect(callCount).toBe(1);

      // Second call should use cache
      expect(memoizedFn(5)).toBe(25);
      expect(callCount).toBe(1);

      // Different input should execute again
      expect(memoizedFn(3)).toBe(9);
      expect(callCount).toBe(2);
    });

    it("should provide statistics", () => {
      const expensiveFunction = (x: number) => x * x;
      const memoizedFn = memoize(expensiveFunction);

      memoizedFn(5);
      memoizedFn(5);
      memoizedFn(3);

      const stats = memoizedFn.stats;
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(1 / 3);
      expect(stats.totalCalls).toBe(2); // totalCalls tracks function executions (cache misses)
    });

    it("should support clear method", () => {
      const expensiveFunction = (x: number) => x * x;
      const memoizedFn = memoize(expensiveFunction);

      memoizedFn(5);
      expect(memoizedFn.stats.cacheSize).toBe(1);

      memoizedFn.clear();
      expect(memoizedFn.stats.cacheSize).toBe(0);
    });
  });

  describe("memoizeMath", () => {
    it("should memoize mathematical functions", () => {
      let callCount = 0;
      const square = (x: number) => {
        callCount++;
        return x * x;
      };

      const memoizedSquare = memoizeMath(square);

      expect(memoizedSquare(5)).toBe(25);
      expect(memoizedSquare(5)).toBe(25);
      expect(callCount).toBe(1);
    });

    it("should use numeric key generation", () => {
      const add = (x: number, y: number) => x + y;
      const memoizedAdd = memoizeMath(add);

      expect(memoizedAdd(2, 3)).toBe(5);
      expect(memoizedAdd(2, 3)).toBe(5);
      expect(memoizedAdd.stats.hits).toBe(1);
    });
  });

  describe("memoizeGeometry", () => {
    it("should memoize geometric calculations", () => {
      const distance = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

      const memoizedDistance = memoizeGeometry(distance);

      expect(memoizedDistance(0, 0, 3, 4)).toBe(5);
      expect(memoizedDistance(0, 0, 3, 4)).toBe(5);
      expect(memoizedDistance.stats.hits).toBe(1);
    });

    it("should handle floating point precision in keys", () => {
      const distance = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

      const memoizedDistance = memoizeGeometry(distance);

      expect(memoizedDistance(0.1, 0.2, 0.3, 0.4)).toBeCloseTo(0.2828, 3);
      expect(memoizedDistance(0.1, 0.2, 0.3, 0.4)).toBeCloseTo(0.2828, 3);
      expect(memoizedDistance.stats.hits).toBe(1);
    });
  });

  describe("MathMemo", () => {
    it("should provide predefined memoized mathematical functions", () => {
      expect(MathMemo.square(5)).toBe(25);
      expect(MathMemo.square(5)).toBe(25);
      expect(MathMemo.square.stats.hits).toBe(1);

      expect(MathMemo.sqrt(16)).toBe(4);
      expect(MathMemo.sqrt(16)).toBe(4);
      expect(MathMemo.sqrt.stats.hits).toBe(1);

      expect(MathMemo.distance(0, 0, 3, 4)).toBe(5);
      expect(MathMemo.distance(0, 0, 3, 4)).toBe(5);
      expect(MathMemo.distance.stats.hits).toBe(1);
    });

    it("should support trigonometric functions", () => {
      expect(MathMemo.sin(Math.PI / 2)).toBeCloseTo(1, 5);
      expect(MathMemo.cos(0)).toBe(1);
      expect(MathMemo.tan(0)).toBe(0);
    });

    it("should support vector operations", () => {
      expect(MathMemo.magnitude2D(3, 4)).toBe(5);
      expect(MathMemo.magnitude3D(2, 3, 6)).toBe(7);
      expect(MathMemo.dot2D(1, 0, 0, 1)).toBe(0);
    });
  });

  describe("clearMathMemo", () => {
    it("should clear all predefined mathematical caches", () => {
      MathMemo.square(5);
      MathMemo.sqrt(16);
      expect(MathMemo.square.stats.cacheSize).toBe(1);
      expect(MathMemo.sqrt.stats.cacheSize).toBe(1);

      clearMathMemo();
      expect(MathMemo.square.stats.cacheSize).toBe(0);
      expect(MathMemo.sqrt.stats.cacheSize).toBe(0);
    });
  });

  describe("getMathMemoStats", () => {
    it("should return statistics for all predefined functions", () => {
      MathMemo.square(5);
      MathMemo.sqrt(16);
      MathMemo.distance(0, 0, 3, 4);

      const stats = getMathMemoStats();
      expect(stats).toHaveProperty("square");
      expect(stats).toHaveProperty("sqrt");
      expect(stats).toHaveProperty("distance");
      expect(stats.square.cacheSize).toBe(1);
      expect(stats.sqrt.cacheSize).toBe(1);
      expect(stats.distance.cacheSize).toBe(1);
    });
  });

  describe("Performance", () => {
    it("should provide performance benefits for repeated calculations", () => {
      const expensiveCalculation = (x: number) => {
        // Simulate expensive calculation
        let result = 0;
        for (let i = 0; i < 1000; i++) {
          result += Math.sqrt(x + i);
        }
        return result;
      };

      const memoizedCalculation = memoize(expensiveCalculation);

      // First call
      const start1 = performance.now();
      const result1 = memoizedCalculation(100);
      const time1 = performance.now() - start1;

      // Second call (should be much faster)
      const start2 = performance.now();
      const result2 = memoizedCalculation(100);
      const time2 = performance.now() - start2;

      expect(result1).toBe(result2);
      expect(time2).toBeLessThan(time1);
      expect(memoizedCalculation.stats.hits).toBe(1);
    });
  });
});
