/**
 * @file Tests for PerformanceBenchmark class
 */
import { describe, it, expect, beforeEach } from "vitest";
import { PerformanceBenchmark } from "../../utils/performance/benchmark";

describe("PerformanceBenchmark", () => {
  let benchmark: PerformanceBenchmark;

  beforeEach(() => {
    // Note: Using real timers for PerformanceBenchmark tests
    benchmark = new PerformanceBenchmark();
  });

  describe("run", () => {
    it("should benchmark a synchronous function", async () => {
      const testFn = () => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      };

      const metrics = await benchmark.run(testFn, 5);

      expect(metrics.iterations).toBe(5);
      expect(metrics.duration).toBeGreaterThanOrEqual(0); // With real timers, duration will be actual time
      expect(metrics.averageTime).toBeGreaterThanOrEqual(0);
      expect(metrics.minTime).toBeGreaterThanOrEqual(0);
      expect(metrics.maxTime).toBeGreaterThanOrEqual(0);
    });

    it("should benchmark an asynchronous function", async () => {
      const testFn = async () => {
        // Use a simple async operation that doesn't rely on setTimeout
        return Promise.resolve("async result");
      };

      const metrics = await benchmark.run(testFn, 3);

      expect(metrics.iterations).toBe(3);
      expect(metrics.duration).toBeGreaterThanOrEqual(0); // With real timers, duration will be actual time
      expect(metrics.averageTime).toBeGreaterThanOrEqual(0);
    });

    it("should handle function errors gracefully", async () => {
      const testFn = () => {
        throw new Error("Test error");
      };

      // The benchmark will throw the error, so we expect it to throw
      await expect(benchmark.run(testFn, 3)).rejects.toThrow("Test error");
    });
  });

  // Note: warmup functionality is not implemented in the current benchmark class
});

// Note: measureSync and measureAsync functions are not implemented in the current benchmark module
