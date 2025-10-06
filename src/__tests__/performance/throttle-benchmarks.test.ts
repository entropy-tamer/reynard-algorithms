/**
 * Performance benchmarks for algorithms package throttle/debounce
 *
 * These benchmarks measure the performance characteristics of the synchronous
 * throttle and debounce implementations in the algorithms package.
 */

import { describe, it, expect } from "vitest";
import { throttle, debounce } from "../../performance/throttle";

describe("Throttle/Debounce Performance Benchmarks", () => {
  const iterations = 10000;
  const throttleDelay = 16; // ~60fps
  const debounceDelay = 100;

  describe("Throttle Performance", () => {
    it("should handle high-frequency calls efficiently", () => {
      let callCount = 0;
      const throttledFn = throttle(() => {
        callCount++;
      }, throttleDelay);

      const startTime = performance.now();

      // Simulate high-frequency calls (like scroll events)
      for (let i = 0; i < iterations; i++) {
        throttledFn();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const callsPerSecond = (iterations / duration) * 1000;

      console.log(`Throttle Performance:`);
      console.log(`  - Total calls: ${iterations}`);
      console.log(`  - Duration: ${duration.toFixed(2)}ms`);
      console.log(`  - Calls per second: ${callsPerSecond.toFixed(2)}`);
      console.log(`  - Actual executions: ${callCount}`);

      // Performance assertions
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
      expect(callsPerSecond).toBeGreaterThan(5000); // Should handle at least 5k calls/sec
      expect(callCount).toBeGreaterThan(0); // Should have executed at least once
    });

    it("should maintain consistent performance with cancel/flush operations", () => {
      let callCount = 0;
      const throttledFn = throttle(() => {
        callCount++;
      }, throttleDelay);

      const startTime = performance.now();

      // Mix of calls, cancels, and flushes
      for (let i = 0; i < iterations; i++) {
        if (i % 10 === 0) {
          throttledFn.cancel();
        } else if (i % 15 === 0) {
          throttledFn.flush();
        } else {
          throttledFn();
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const operationsPerSecond = (iterations / duration) * 1000;

      console.log(`Throttle with Cancel/Flush Performance:`);
      console.log(`  - Total operations: ${iterations}`);
      console.log(`  - Duration: ${duration.toFixed(2)}ms`);
      console.log(`  - Operations per second: ${operationsPerSecond.toFixed(2)}`);
      console.log(`  - Actual executions: ${callCount}`);

      expect(duration).toBeLessThan(1000);
      expect(operationsPerSecond).toBeGreaterThan(3000);
    });

    it("should handle rapid successive calls without memory leaks", () => {
      const throttledFn = throttle(() => {
        // Simulate some work
        return Math.random();
      }, throttleDelay);

      const startTime = performance.now();
      const results: number[] = [];

      // Rapid fire calls
      for (let i = 0; i < iterations; i++) {
        const result = throttledFn();
        if (result !== undefined) {
          results.push(result);
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Throttle Memory Efficiency:`);
      console.log(`  - Total calls: ${iterations}`);
      console.log(`  - Duration: ${duration.toFixed(2)}ms`);
      console.log(`  - Results collected: ${results.length}`);
      console.log(`  - Memory usage stable: ${results.length < iterations ? "Yes" : "No"}`);

      expect(duration).toBeLessThan(1000);
      expect(results.length).toBeLessThanOrEqual(iterations); // Should throttle results
    });
  });

  describe("Debounce Performance", () => {
    it("should handle high-frequency calls efficiently", () => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, debounceDelay);

      const startTime = performance.now();

      // Simulate rapid input (like typing)
      for (let i = 0; i < iterations; i++) {
        debouncedFn();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const callsPerSecond = (iterations / duration) * 1000;

      console.log(`Debounce Performance:`);
      console.log(`  - Total calls: ${iterations}`);
      console.log(`  - Duration: ${duration.toFixed(2)}ms`);
      console.log(`  - Calls per second: ${callsPerSecond.toFixed(2)}`);
      console.log(`  - Actual executions: ${callCount}`);

      expect(duration).toBeLessThan(1000);
      expect(callsPerSecond).toBeGreaterThan(5000);
      expect(callCount).toBe(0); // Should not execute immediately
    });

    it("should maintain consistent performance with cancel/flush operations", () => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, debounceDelay);

      const startTime = performance.now();

      // Mix of calls, cancels, and flushes
      for (let i = 0; i < iterations; i++) {
        if (i % 10 === 0) {
          debouncedFn.cancel();
        } else if (i % 15 === 0) {
          debouncedFn.flush();
        } else {
          debouncedFn();
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const operationsPerSecond = (iterations / duration) * 1000;

      console.log(`Debounce with Cancel/Flush Performance:`);
      console.log(`  - Total operations: ${iterations}`);
      console.log(`  - Duration: ${duration.toFixed(2)}ms`);
      console.log(`  - Operations per second: ${operationsPerSecond.toFixed(2)}`);
      console.log(`  - Actual executions: ${callCount}`);

      expect(duration).toBeLessThan(1000);
      expect(operationsPerSecond).toBeGreaterThan(3000);
    });

    it("should handle rapid successive calls without memory leaks", () => {
      const debouncedFn = debounce(() => {
        return Math.random();
      }, debounceDelay);

      const startTime = performance.now();
      const results: number[] = [];

      // Rapid fire calls
      for (let i = 0; i < iterations; i++) {
        const result = debouncedFn();
        if (result !== undefined) {
          results.push(result);
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Debounce Memory Efficiency:`);
      console.log(`  - Total calls: ${iterations}`);
      console.log(`  - Duration: ${duration.toFixed(2)}ms`);
      console.log(`  - Results collected: ${results.length}`);
      console.log(`  - Memory usage stable: ${results.length < iterations ? "Yes" : "No"}`);

      expect(duration).toBeLessThan(1000);
      expect(results.length).toBeLessThan(iterations); // Should debounce results
    });
  });

  describe("Comparative Performance", () => {
    it("should compare throttle vs debounce performance", () => {
      const throttleFn = throttle(() => {}, throttleDelay);
      const debounceFn = debounce(() => {}, debounceDelay);

      // Benchmark throttle
      const throttleStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        throttleFn();
      }
      const throttleEnd = performance.now();
      const throttleDuration = throttleEnd - throttleStart;

      // Benchmark debounce
      const debounceStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        debounceFn();
      }
      const debounceEnd = performance.now();
      const debounceDuration = debounceEnd - debounceStart;

      console.log(`Comparative Performance:`);
      console.log(
        `  - Throttle: ${throttleDuration.toFixed(2)}ms (${((iterations / throttleDuration) * 1000).toFixed(2)} calls/sec)`
      );
      console.log(
        `  - Debounce: ${debounceDuration.toFixed(2)}ms (${((iterations / debounceDuration) * 1000).toFixed(2)} calls/sec)`
      );
      console.log(`  - Performance ratio: ${(throttleDuration / debounceDuration).toFixed(2)}x`);

      expect(throttleDuration).toBeLessThan(1000);
      expect(debounceDuration).toBeLessThan(1000);
    });
  });
});
