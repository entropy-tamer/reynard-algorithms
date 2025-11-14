import { LRUCache } from "./src/data-structures/basic/lru-cache";

// Quick test to verify pooling doesn't hang
const cache = new LRUCache<string, number>({
  maxSize: 10,
  enableOptimizations: true,
  maxPoolSize: 100,
});

console.log("Testing basic operations...");
cache.set("a", 1);
cache.set("b", 2);
cache.set("c", 3);
console.log("✓ Set operations work");

const value = cache.get("a");
console.log(`✓ Get operation works: ${value}`);

cache.delete("b");
console.log("✓ Delete operation works");

cache.clear();
console.log("✓ Clear operation works");

cache.destroy();
console.log("✓ Destroy operation works");

console.log("\n✅ All operations completed successfully - no hanging!");
