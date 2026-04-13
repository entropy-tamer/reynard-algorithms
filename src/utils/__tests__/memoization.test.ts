/**
 * Memoization Tests
 *
 * Tests for memoization utilities to ensure they work correctly
 * and provide performance improvements.
 *
 * @module algorithms/utils/memoization.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { memoize, memoizeMath, memoizeGeometry, weakMemoize, batchMemoize, MathMemo, clearMathMemo, getMathMemoStats } from "../memoization";

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
      expect(stats["square"]!.cacheSize).toBe(1);
      expect(stats["sqrt"]!.cacheSize).toBe(1);
      expect(stats["distance"]!.cacheSize).toBe(1);
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

  describe("memoize with custom config", () => {
    it("should respect maxSize config", () => {
      let callCount = 0;
      const expensiveFunction = (x: number) => {
        callCount++;
        return x * x;
      };

      const memoizedFn = memoize(expensiveFunction, { maxSize: 2 });

      memoizedFn(1);
      memoizedFn(2);
      memoizedFn(3);

      // Cache should only have 2 entries
      expect(memoizedFn.stats.cacheSize).toBeLessThanOrEqual(2);
    });

    it("should respect custom keyGenerator", () => {
      const expensiveFunction = (x: number, y: number) => x + y;
      const memoizedFn = memoize(expensiveFunction, {
        keyGenerator: (x, y) => `${x}-${y}`,
      });

      expect(memoizedFn(1, 2)).toBe(3);
      expect(memoizedFn.stats.misses).toBe(1);

      // Same key should hit cache
      expect(memoizedFn(1, 2)).toBe(3);
      expect(memoizedFn.stats.hits).toBe(1);
    });

    it("should support enableStats config", () => {
      const expensiveFunction = (x: number) => x * x;
      const memoizedFn = memoize(expensiveFunction, { enableStats: false });

      memoizedFn(5);
      memoizedFn(5);

      // Stats should still be available but may not be tracked
      expect(memoizedFn.stats).toBeDefined();
    });
  });

  describe("weakMemoize", () => {
    it("should cache results for object arguments", () => {
      let callCount = 0;
      const expensiveFunction = (obj: { x: number }) => {
        callCount++;
        return obj.x * 2;
      };

      const memoizedFn = weakMemoize(expensiveFunction);
      const obj = { x: 5 };

      expect(memoizedFn(obj)).toBe(10);
      expect(callCount).toBe(1);

      expect(memoizedFn(obj)).toBe(10);
      expect(callCount).toBe(1);
    });

    it("should handle non-object arguments", () => {
      let callCount = 0;
      const expensiveFunction = (x: number, y: number) => {
        callCount++;
        return x + y;
      };

      const memoizedFn = weakMemoize(expensiveFunction);

      expect(memoizedFn(1, 2)).toBe(3);
      expect(callCount).toBe(1);

      expect(memoizedFn(1, 2)).toBe(3);
      expect(callCount).toBe(2); // Non-object args create synthetic key each time
    });

    it("should provide clear method", () => {
      const expensiveFunction = (obj: { x: number }) => obj.x * 2;
      const memoizedFn = weakMemoize(expensiveFunction);

      expect(typeof memoizedFn.clear).toBe("function");
      memoizedFn.clear();
    });
  });

  describe("batchMemoize", () => {
    it("should cache batch processing results", () => {
      let callCount = 0;
      const batchFunction = (inputs: number[]) => {
        callCount++;
        return inputs.map(x => x * 2);
      };

      const memoizedFn = batchMemoize(batchFunction);

      const inputs = [1, 2, 3];
      expect(memoizedFn(inputs)).toEqual([2, 4, 6]);
      expect(callCount).toBe(1);

      expect(memoizedFn(inputs)).toEqual([2, 4, 6]);
      expect(callCount).toBe(1);
    });

    it("should provide statistics", () => {
      const batchFunction = (inputs: number[]) => inputs.map(x => x * 2);
      const memoizedFn = batchMemoize(batchFunction);

      memoizedFn([1, 2, 3]);
      memoizedFn([1, 2, 3]);
      memoizedFn([4, 5, 6]);

      const stats = memoizedFn.stats;
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(1 / 3);
    });

    it("should support clear method", () => {
      const batchFunction = (inputs: number[]) => inputs.map(x => x * 2);
      const memoizedFn = batchMemoize(batchFunction);

      memoizedFn([1, 2, 3]);
      expect(memoizedFn.stats.cacheSize).toBe(1);

      memoizedFn.clear();
      expect(memoizedFn.stats.cacheSize).toBe(0);
    });

    it("should respect maxSize config", () => {
      const batchFunction = (inputs: number[]) => inputs.map(x => x * 2);
      const memoizedFn = batchMemoize(batchFunction, { maxSize: 2 });

      memoizedFn([1]);
      memoizedFn([2]);
      memoizedFn([3]);

      expect(memoizedFn.stats.cacheSize).toBeLessThanOrEqual(2);
    });
  });

  describe("memoizeGeometry with complex arguments", () => {
    it("should handle array arguments", () => {
      const distance = (points: number[][]) => {
        const [p1, p2] = points;
        return Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
      };

      const memoizedDistance = memoizeGeometry(distance);
      const points = [
        [0, 0],
        [3, 4],
      ];

      expect(memoizedDistance(points)).toBe(5);
      expect(memoizedDistance(points)).toBe(5);
      expect(memoizedDistance.stats.hits).toBe(1);
    });

    it("should handle object arguments", () => {
      const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
        return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      };

      const memoizedDistance = memoizeGeometry(distance);
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };

      expect(memoizedDistance(p1, p2)).toBe(5);
      expect(memoizedDistance(p1, p2)).toBe(5);
      expect(memoizedDistance.stats.hits).toBe(1);
    });
  });

  describe("MathMemo additional functions", () => {
    it("should support power function", () => {
      expect(MathMemo.pow(2, 3)).toBe(8);
      expect(MathMemo.pow(2, 3)).toBe(8);
      expect(MathMemo.pow.stats.hits).toBe(1);
    });

    it("should support logarithm functions", () => {
      expect(MathMemo.log(Math.E)).toBeCloseTo(1, 5);
      expect(MathMemo.ln(Math.E)).toBeCloseTo(1, 5);
    });

    it("should support exponential function", () => {
      expect(MathMemo.exp(0)).toBe(1);
      expect(MathMemo.exp(1)).toBeCloseTo(Math.E, 5);
    });

    it("should support cross product", () => {
      const result = MathMemo.cross3D(1, 0, 0, 0, 1, 0);
      expect(result).toEqual([0, 0, 1]);
    });

    it("should support add and multiply", () => {
      expect(MathMemo.add(2, 3)).toBe(5);
      expect(MathMemo.multiply(2, 3)).toBe(6);
    });
  });
});
