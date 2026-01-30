/**
 * @file LRU Cache tests
 */
/* eslint-disable max-lines, max-lines-per-function */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LRUCache, LRUCacheEvent } from "../../../data-structures/basic/lru-cache";

describe("LRUCache", () => {
  let cache: LRUCache<string, number>;

  beforeEach(() => {
    cache = new LRUCache<string, number>({ maxSize: 3 });
  });

  afterEach(() => {
    cache.destroy();
  });

  describe("Mathematical Theory", () => {
    it("should maintain doubly-linked list order", () => {
      // Test that the doubly-linked list maintains proper order
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);

      // Access "a" to move it to head
      cache.get("a");

      // "a" should now be most recent (head)
      const snapshot = cache.snapshot();
      expect(snapshot.entries[0].key).toBe("a");
      expect(snapshot.entries[0].value).toBe(1);
    });

    it("should evict least recently used item", () => {
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);

      // Add one more item, should evict "a" (least recently used)
      cache.set("d", 4);

      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(true);
      expect(cache.has("c")).toBe(true);
      expect(cache.has("d")).toBe(true);
    });

    it("should maintain O(1) access time complexity", () => {
      // Fill cache
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, i);
      }

      const startTime = performance.now();

      // Access random keys
      for (let i = 0; i < 100; i++) {
        const randomKey = `key${Math.floor(Math.random() * 1000)}`;
        cache.get(randomKey);
      }

      const accessTime = performance.now() - startTime;
      expect(accessTime).toBeLessThan(10); // Should be very fast
    });
  });

  describe("Core Operations", () => {
    describe("set", () => {
      it("should store key-value pairs", () => {
        cache.set("key1", 42);
        expect(cache.get("key1")).toBe(42);
      });

      it("should update existing keys", () => {
        cache.set("key1", 42);
        cache.set("key1", 100);
        expect(cache.get("key1")).toBe(100);
      });

      it("should maintain size limits", () => {
        cache.set("a", 1);
        cache.set("b", 2);
        cache.set("c", 3);
        cache.set("d", 4); // Should evict "a"

        expect(cache.size()).toBe(3);
        expect(cache.has("a")).toBe(false);
        expect(cache.has("d")).toBe(true);
      });

      it("should return true for successful operations", () => {
        const result = cache.set("key1", 42);
        expect(result).toBe(true);
      });
    });

    describe("get", () => {
      it("should retrieve stored values", () => {
        cache.set("key1", 42);
        expect(cache.get("key1")).toBe(42);
      });

      it("should return undefined for non-existent keys", () => {
        expect(cache.get("nonexistent")).toBeUndefined();
      });

      it("should promote accessed items to most recent", () => {
        cache.set("a", 1);
        cache.set("b", 2);
        cache.set("c", 3);

        // Access "a" to make it most recent
        cache.get("a");

        // Add new item, should evict "b" (now least recent)
        cache.set("d", 4);

        expect(cache.has("a")).toBe(true);
        expect(cache.has("b")).toBe(false);
        expect(cache.has("c")).toBe(true);
        expect(cache.has("d")).toBe(true);
      });

      it("should update access statistics", () => {
        cache.set("key1", 42);
        cache.get("key1");
        cache.get("key1");

        const stats = cache.getStats();
        expect(stats.hits).toBe(2);
        expect(stats.misses).toBe(0);
      });
    });

    describe("delete", () => {
      it("should remove existing keys", () => {
        cache.set("key1", 42);
        expect(cache.delete("key1")).toBe(true);
        expect(cache.get("key1")).toBeUndefined();
      });

      it("should return false for non-existent keys", () => {
        expect(cache.delete("nonexistent")).toBe(false);
      });

      it("should update size after deletion", () => {
        cache.set("a", 1);
        cache.set("b", 2);
        expect(cache.size()).toBe(2);

        cache.delete("a");
        expect(cache.size()).toBe(1);
      });
    });

    describe("has", () => {
      it("should return true for existing keys", () => {
        cache.set("key1", 42);
        expect(cache.has("key1")).toBe(true);
      });

      it("should return false for non-existent keys", () => {
        expect(cache.has("nonexistent")).toBe(false);
      });

      it("should return false for expired keys", () => {
        const ttlCache = new LRUCache<string, number>({
          maxSize: 3,
          ttl: 100, // 100ms TTL
        });

        ttlCache.set("key1", 42);
        expect(ttlCache.has("key1")).toBe(true);

        // Wait for expiration
        setTimeout(() => {
          expect(ttlCache.has("key1")).toBe(false);
          ttlCache.destroy();
        }, 150);
      });
    });

    describe("clear", () => {
      it("should remove all entries", () => {
        cache.set("a", 1);
        cache.set("b", 2);
        cache.set("c", 3);

        expect(cache.size()).toBe(3);
        cache.clear();
        expect(cache.size()).toBe(0);
        expect(cache.has("a")).toBe(false);
      });
    });

    describe("size and maxSize", () => {
      it("should return correct size", () => {
        expect(cache.size()).toBe(0);
        cache.set("a", 1);
        expect(cache.size()).toBe(1);
        cache.set("b", 2);
        expect(cache.size()).toBe(2);
      });

      it("should return correct max size", () => {
        expect(cache.maxSize()).toBe(3);
      });
    });
  });

  describe("TTL (Time To Live)", () => {
    let ttlCache: LRUCache<string, number>;

    beforeEach(() => {
      ttlCache = new LRUCache<string, number>({
        maxSize: 3,
        ttl: 100, // 100ms TTL
      });
    });

    afterEach(() => {
      ttlCache.destroy();
    });

    it("should expire entries after TTL", async () => {
      ttlCache.set("key1", 42);
      expect(ttlCache.get("key1")).toBe(42);

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(ttlCache.get("key1")).toBeUndefined();
    });

    it("should refresh TTL on access", async () => {
      ttlCache.set("key1", 42);

      // Access before expiration
      await new Promise(resolve => setTimeout(resolve, 50));
      ttlCache.get("key1"); // Refresh TTL

      // Should still be available after original TTL
      await new Promise(resolve => setTimeout(resolve, 60));
      expect(ttlCache.get("key1")).toBe(42);
    });

    it("should handle cleanup of expired entries", async () => {
      ttlCache.set("key1", 42);
      ttlCache.set("key2", 24);

      await new Promise(resolve => setTimeout(resolve, 150));
      // Force cleanup
      ttlCache.get("key1"); // This should trigger cleanup

      expect(ttlCache.size()).toBe(0);
    });
  });

  describe("Statistics", () => {
    it("should track hit and miss statistics", () => {
      cache.set("key1", 42);

      cache.get("key1"); // Hit
      cache.get("key1"); // Hit
      cache.get("nonexistent"); // Miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(2 / 3);
    });

    it("should track set and delete statistics", () => {
      cache.set("key1", 42);
      cache.set("key2", 24);
      cache.delete("key1");

      const stats = cache.getStats();
      expect(stats.sets).toBe(2);
      expect(stats.deletes).toBe(1);
    });

    it("should track eviction statistics", () => {
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      cache.set("d", 4); // Should evict "a"

      const stats = cache.getStats();
      expect(stats.evictions).toBe(1);
    });

    it("should track maximum size reached", () => {
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      cache.delete("a");

      const stats = cache.getStats();
      expect(stats.maxSize).toBe(3);
      expect(stats.size).toBe(2);
    });
  });

  describe("Performance Metrics", () => {
    it("should track average operation times", () => {
      // Perform multiple operations
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, i);
        cache.get(`key${i}`);
      }

      const metrics = cache.getPerformanceMetrics();
      expect(metrics.averageGetTime).toBeGreaterThan(0);
      expect(metrics.averageSetTime).toBeGreaterThan(0);
    });

    it("should estimate memory usage", () => {
      cache.set("key1", 42);
      cache.set("key2", 999);

      const metrics = cache.getPerformanceMetrics();
      expect(metrics.estimatedMemoryUsage).toBeGreaterThan(0);
    });

    it("should track cleanup operations", async () => {
      const ttlCache = new LRUCache<string, number>({
        maxSize: 3,
        ttl: 50,
        cleanupInterval: 100,
      });

      ttlCache.set("key1", 42);

      await new Promise(resolve => setTimeout(resolve, 200));
      const metrics = ttlCache.getPerformanceMetrics();
      expect(metrics.cleanupCount).toBeGreaterThan(0);
      ttlCache.destroy();
    });
  });

  describe("Event Handling", () => {
    it("should emit events when configured", () => {
      const events: LRUCacheEvent<string, number>[] = [];
      const eventHandler = (event: LRUCacheEvent<string, number>) => {
        events.push(event);
      };

      const eventCache = new LRUCache<string, number>({
        maxSize: 2,
        onEvent: eventHandler,
      });

      eventCache.set("key1", 42);
      eventCache.get("key1");
      eventCache.set("key2", 24);
      eventCache.set("key3", 36); // Should evict key1
      eventCache.delete("key2");

      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.type === "set")).toBe(true);
      expect(events.some(e => e.type === "get")).toBe(true);
      expect(events.some(e => e.type === "evict")).toBe(true);
      expect(events.some(e => e.type === "delete")).toBe(true);

      eventCache.destroy();
    });

    it("should include event metadata", () => {
      const events: LRUCacheEvent<string, number>[] = [];
      const eventHandler = (event: LRUCacheEvent<string, number>) => {
        events.push(event);
      };

      const eventCache = new LRUCache<string, number>({
        maxSize: 2,
        onEvent: eventHandler,
      });

      eventCache.set("key1", 42);

      expect(events[0].key).toBe("key1");
      expect(events[0].value).toBe(42);
      expect(events[0].timestamp).toBeGreaterThan(0);

      eventCache.destroy();
    });
  });

  describe("Snapshot and Debugging", () => {
    it("should create accurate snapshots", () => {
      cache.set("a", 1);
      cache.set("b", 2);
      cache.get("a"); // Move to head

      const snapshot = cache.snapshot();

      expect(snapshot.entries).toHaveLength(2);
      expect(snapshot.entries[0].key).toBe("a"); // Most recent
      expect(snapshot.entries[1].key).toBe("b");
      expect(snapshot.stats.size).toBe(2);
      expect(snapshot.timestamp).toBeGreaterThan(0);
    });

    it("should include entry metadata in snapshots", () => {
      cache.set("key1", 42);
      cache.get("key1");

      const snapshot = cache.snapshot();
      const entry = snapshot.entries[0];

      expect(entry.key).toBe("key1");
      expect(entry.value).toBe(42);
      expect(entry.accessCount).toBe(2);
      expect(entry.lastAccessed).toBeGreaterThan(0);
      expect(entry.isExpired).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero max size", () => {
      const zeroCache = new LRUCache<string, number>({ maxSize: 0 });

      expect(zeroCache.set("key1", 42)).toBe(false);
      expect(zeroCache.size()).toBe(0);

      zeroCache.destroy();
    });

    it("should handle very large values", () => {
      const largeValue = "x".repeat(10000);
      cache.set("large", largeValue as any);

      expect(cache.get("large")).toBe(largeValue);
    });

    it("should handle special key types", () => {
      const objectCache = new LRUCache<object, string>({ maxSize: 3 });

      const key1 = { id: 1 };
      const key2 = { id: 2 };

      objectCache.set(key1, "value1");
      objectCache.set(key2, "value2");

      expect(objectCache.get(key1)).toBe("value1");
      expect(objectCache.get(key2)).toBe("value2");

      objectCache.destroy();
    });

    it("should handle rapid operations", () => {
      // Rapid set/get operations
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, i);
        cache.get(`key${i}`);
      }

      expect(cache.size()).toBe(3); // Should maintain max size
    });
  });

  describe("Integration", () => {
    it("should work with iterator", () => {
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);

      const entries: Array<{ key: string; value: number }> = [];
      for (const entry of cache) {
        entries.push(entry);
      }

      expect(entries).toHaveLength(3);
      expect(entries.some(e => e.key === "a" && e.value === 1)).toBe(true);
      expect(entries.some(e => e.key === "b" && e.value === 2)).toBe(true);
      expect(entries.some(e => e.key === "c" && e.value === 3)).toBe(true);
    });

    it("should maintain consistency across operations", () => {
      // Complex sequence of operations
      cache.set("a", 1);
      cache.set("b", 2);
      cache.get("a"); // Move to head
      cache.set("c", 3);
      cache.set("d", 4); // Should evict "b"
      cache.delete("a");
      cache.set("e", 5);

      // Final state should be consistent
      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(false);
      expect(cache.has("c")).toBe(true);
      expect(cache.has("d")).toBe(true);
      expect(cache.has("e")).toBe(true);
      expect(cache.size()).toBe(3);
    });
  });
});
