/**
 * @file Tests for LRUCache batch operations
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { LRUCache } from "../../../data-structures/basic/lru-cache";

describe("LRUCache Batch Operations", () => {
  let cache: LRUCache<string, number>;

  beforeEach(() => {
    cache = new LRUCache<string, number>({ maxSize: 3 });
  });

  afterEach(() => {
    cache.destroy();
  });

  describe("Batch Operations", () => {
    it("should handle batch set operations", () => {
      const entries = [
        { key: "a", value: 1 },
        { key: "b", value: 2 },
        { key: "c", value: 3 },
        { key: "d", value: 4 },
      ];

      const result = cache.batchSet(entries);

      expect(result.processed).toHaveLength(4);
      expect(result.failed).toHaveLength(0);
      expect(result.total).toBe(4);
      expect(result.successRate).toBe(1);
    });

    it("should handle batch operations with errors", () => {
      const entries = [
        { key: "a", value: 1 },
        { key: "b", value: 2 },
      ];

      const originalSet = cache.set;
      cache.set = vi.fn().mockImplementation((key, value) => {
        if (key === "b") {
          throw new Error("Test error");
        }
        return originalSet.call(cache, key, value);
      });

      const result = cache.batchSet(entries);

      expect(result.processed).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].error).toBe("Test error");

      cache.set = originalSet;
    });
  });
});
