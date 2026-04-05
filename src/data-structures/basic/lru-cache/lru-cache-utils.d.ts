/**
 * LRU Cache Utility Functions
 *
 * Helper functions for snapshot creation and batch operations.
 *
 * @module algorithms/dataStructures/lruCacheUtils
 */
import { LRUCacheNode, LRUCacheSnapshot, LRUCacheBatchResult, LRUCacheConfig, LRUCacheStats } from "./lru-cache-types";
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
 * @example
 */
export declare function createCacheSnapshot<K, V>(linkedList: LRUCacheLinkedList<K, V>, ttlManager: LRUCacheTTLManager<K, V>, config: Required<LRUCacheConfig>, getStats: () => LRUCacheStats): LRUCacheSnapshot<K, V>;
/**
 * Performs batch set operation on cache
 *
 * @param entries - Array of key-value pairs to set
 * @param setFunction - Function to set a single key-value pair
 * @returns Batch operation result
 * @example
 */
export declare function performBatchSet<K, V>(entries: Array<{
    key: K;
    value: V;
}>, setFunction: (key: K, value: V) => boolean): LRUCacheBatchResult<K, V>;
/**
 * Calculates estimated memory usage for cache
 *
 * @param cache - Map of cache entries
 * @returns Estimated memory usage in bytes
 * @example
 */
export declare function calculateMemoryUsage<K, V>(cache: Map<K, LRUCacheNode<K, V>>): number;
/**
 * Creates iterator for cache entries
 * @param linkedList
 * @param ttlManager
 * @example
 */
export declare function createCacheIterator<K, V>(linkedList: LRUCacheLinkedList<K, V>, ttlManager: LRUCacheTTLManager<K, V>): Iterator<{
    key: K;
    value: V;
}>;
/**
 * Performs eviction of least recently used item
 * @param linkedList
 * @param cache
 * @param recordEviction
 * @param emitEvent
 * @example
 */
export declare function performEviction<K, V>(linkedList: LRUCacheLinkedList<K, V>, cache: Map<K, LRUCacheNode<K, V>>, recordEviction: () => void, emitEvent: (key: K, value: V) => void): void;
/**
 * Performs cleanup of expired entries
 * @param ttlManager
 * @param cache
 * @param deleteFunction
 * @param expireCallback
 * @param recordCleanup
 * @param emitCleanupEvent
 * @example
 */
export declare function performTTLCleanup<K, V>(ttlManager: LRUCacheTTLManager<K, V>, cache: Map<K, LRUCacheNode<K, V>>, deleteFunction: (key: K) => void, expireCallback: (key: K) => void, recordCleanup: (time: number) => void, emitCleanupEvent: (expiredCount: number) => void): void;
//# sourceMappingURL=lru-cache-utils.d.ts.map