/**
 * @file LRU Cache performance tests
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LRUCache } from "../../../data-structures/basic/lru-cache";

describe("LRUCache Performance Benchmarks", () => {
  let cache: LRUCache<string, number>;

  beforeEach(() => {
    cache = new LRUCache<string, number>({ maxSize: 3 });
  });

  afterEach(() => {
    cache.destroy();
  });

  describe("Performance Benchmarks", () => {
    it("should handle large number of operations efficiently", () => {
      const startTime = performance.now();

      for (let i = 0; i < 10000; i++) {
        cache.set(`key${i}`, i);
        if (i % 2 === 0) {
          cache.get(`key${i}`);
        }
      }

      const operationTime = performance.now() - startTime;
      expect(operationTime).toBeLessThan(100);
    });

    it("should maintain performance with mixed operations", () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, i);
        if (i % 3 === 0) {
          cache.get(`key${i}`);
        }
        if (i % 5 === 0) {
          cache.delete(`key${i}`);
        }
      }

      const mixedTime = performance.now() - startTime;
      expect(mixedTime).toBeLessThan(50);
    });
  });
});
