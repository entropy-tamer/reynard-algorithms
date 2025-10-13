import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LRUCache } from "../../data-structures/lru-cache";

describe("LRUCache Edge Cases", () => {
  let cache: LRUCache<string, number>;

  beforeEach(() => {
    cache = new LRUCache<string, number>({ maxSize: 3 });
  });

  afterEach(() => {
    cache.destroy();
  });

  describe("Edge Cases", () => {
    it("should handle zero max size", () => {
      const zeroCache = new LRUCache<string, number>({ maxSize: 0 });

      expect(zeroCache.set("key1", 42)).toBe(true);
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
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, i);
        cache.get(`key${i}`);
      }

      expect(cache.size()).toBe(3);
    });
  });
});
