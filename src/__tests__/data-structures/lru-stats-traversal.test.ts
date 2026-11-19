/**
 * Regression: set() called updateMemoryUsage() -> calculateMemoryUsage() on
 * every insert. That helper walks the whole cache and stringifies every key
 * and value, so n sets grew quadratically even with enableStats:false.
 */
import { describe, expect, it } from "vitest";
import { LRUCache } from "../../data-structures/basic/lru-cache/lru-cache-core";

describe("LRU cache set without memory statistics", () => {
  it("does not stringify cached entries when stats are disabled", () => {
    let stringified = 0;
    const value = {
      toJSON() {
        stringified++;
        return 1;
      },
    };
    const cache = new LRUCache<string, typeof value>({
      maxSize: 100,
      enableCleanup: false,
      enableStats: false,
    });

    for (let i = 0; i < 50; i++) cache.set(`k${i}`, value);

    expect(stringified).toBe(0);
    expect(cache.getPerformanceMetrics().estimatedMemoryUsage).toBe(0);
  });

  it("sets 10k entries under a 2s budget with stats disabled", () => {
    const cache = new LRUCache<string, number>({
      maxSize: 20_000,
      enableCleanup: false,
      enableStats: false,
    });

    const start = performance.now();
    for (let i = 0; i < 10_000; i++) cache.set(`k${i}`, i);
    const elapsed = performance.now() - start;

    expect(elapsed, `10k sets took ${elapsed.toFixed(1)}ms`).toBeLessThan(2000);
    expect(cache.size()).toBe(10_000);
  });

  it("still estimates memory usage when stats are enabled", () => {
    let stringified = 0;
    const value = {
      toJSON() {
        stringified++;
        return 1;
      },
    };
    const cache = new LRUCache<string, typeof value>({
      maxSize: 100,
      enableCleanup: false,
      enableStats: true,
    });

    cache.set("a", value);

    expect(stringified).toBeGreaterThan(0);
    expect(cache.getPerformanceMetrics().estimatedMemoryUsage).toBeGreaterThan(0);
  });
});
