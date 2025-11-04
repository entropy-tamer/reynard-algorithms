/**
 * LRU Cache Utility Functions
 *
 * Helper functions for snapshot creation and batch operations.
 *
 * @module algorithms/dataStructures/lruCacheUtils
 */

import {
  LRUCacheNode,
  LRUCacheEntry,
  LRUCacheSnapshot,
  LRUCacheBatchResult,
  LRUCacheConfig,
  LRUCacheStats,
} from "./lru-cache-types";
import { LRUCacheLinkedList } from "./lru-cache-linked-list";
import { LRUCacheTTLManager } from "./lru-cache-ttl";

/**
 * Creates a snapshot of the cache state
 *
 * @param linkedList - The linked list instance
 * @param ttlManager - The TTL manager instance
 * @param config - Cache configuration
 * @param getStats - Function to get current stats
 * @returns Cache snapshot for debugging and analysis
 */
export function createCacheSnapshot<K, V>(
  linkedList: LRUCacheLinkedList<K, V>,
  ttlManager: LRUCacheTTLManager<K, V>,
  config: Required<LRUCacheConfig>,
  getStats: () => LRUCacheStats
): LRUCacheSnapshot<K, V> {
  const entries: LRUCacheEntry<K, V>[] = [];

  let current = linkedList.getHead();
  while (current) {
    entries.push({
      key: current.key,
      value: current.value,
      createdAt: current.lastAccessed,
      lastAccessed: current.lastAccessed,
      accessCount: current.accessCount,
      ttl: config.ttl,
      isExpired: ttlManager.isExpired(current),
    });
    current = current.next;
  }

  return {
    entries,
    stats: getStats(),
    config: { ...config },
    timestamp: Date.now(),
  };
}

/**
 * Performs batch set operation on cache
 *
 * @param entries - Array of key-value pairs to set
 * @param setFunction - Function to set a single key-value pair
 * @returns Batch operation result
 */
export function performBatchSet<K, V>(
  entries: Array<{ key: K; value: V }>,
  setFunction: (key: K, value: V) => boolean
): LRUCacheBatchResult<K, V> {
  const processed: Array<{ key: K; value: V }> = [];
  const failed: Array<{ key: K; value: V; error: string }> = [];

  for (const { key, value } of entries) {
    try {
      if (setFunction(key, value)) {
        processed.push({ key, value });
      } else {
        failed.push({ key, value, error: "Set operation failed" });
      }
    } catch (error) {
      failed.push({
        key,
        value,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    processed,
    failed,
    total: entries.length,
    successRate: processed.length / entries.length,
  };
}

/**
 * Calculates estimated memory usage for cache
 *
 * @param cache - Map of cache entries
 * @returns Estimated memory usage in bytes
 */
export function calculateMemoryUsage<K, V>(
  cache: Map<K, LRUCacheNode<K, V>>
): number {
  let estimatedSize = 0;
  for (const [key, node] of cache) {
    estimatedSize += JSON.stringify(key).length * 2; // UTF-16
    estimatedSize += JSON.stringify(node.value).length * 2;
    estimatedSize += 64; // Node overhead (pointers, metadata)
  }
  return estimatedSize;
}

/**
 * Creates iterator for cache entries
 */
export function* createCacheIterator<K, V>(
  linkedList: LRUCacheLinkedList<K, V>,
  ttlManager: LRUCacheTTLManager<K, V>
): Iterator<{ key: K; value: V }> {
  let current = linkedList.getHead();
  while (current) {
    if (!ttlManager.isExpired(current)) {
      yield { key: current.key, value: current.value };
    }
    current = current.next;
  }
}

/**
 * Performs eviction of least recently used item
 */
export function performEviction<K, V>(
  linkedList: LRUCacheLinkedList<K, V>,
  cache: Map<K, LRUCacheNode<K, V>>,
  recordEviction: () => void,
  emitEvent: (key: K, value: V) => void
): void {
  const evictedNode = linkedList.evictTail();
  if (!evictedNode) {
    return;
  }

  cache.delete(evictedNode.key);
  recordEviction();
  emitEvent(evictedNode.key, evictedNode.value);
}

/**
 * Performs cleanup of expired entries
 */
export function performTTLCleanup<K, V>(
  ttlManager: LRUCacheTTLManager<K, V>,
  cache: Map<K, LRUCacheNode<K, V>>,
  deleteFunction: (key: K) => void,
  expireCallback: (key: K) => void,
  recordCleanup: (time: number) => void,
  emitCleanupEvent: (expiredCount: number) => void
): void {
  const startTime = performance.now();

  const expiredCount = ttlManager.cleanup(
    cache,
    deleteFunction,
    expireCallback
  );

  recordCleanup(performance.now() - startTime);
  emitCleanupEvent(expiredCount);
}


