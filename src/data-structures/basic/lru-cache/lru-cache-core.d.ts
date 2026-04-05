/**
 * @file LRU Cache Core Implementation
 *
 * A highly optimized LRU (Least Recently Used) cache implementation using a doubly-linked list
 * and hash map for O(1) access, insertion, and deletion operations.
 *
 * Mathematical Foundation:
 * - Doubly-linked list maintains access order: head (most recent) <-> ... <-> tail (least recent)
 * - Hash map provides O(1) key-to-node lookup: Map<K, LRUCacheNode<K, V>>
 * - Cache eviction: when size exceeds maxSize, remove tail node (least recently used)
 * - Access promotion: move accessed node to head of list
 *
 * Time Complexity:
 * - Get: O(1) average case
 * - Set: O(1) average case
 * - Delete: O(1) average case
 * - Has: O(1) average case
 *
 * Space Complexity: O(n) where n is the number of cached items
 *
 * @module algorithms/dataStructures/lruCacheCore
 */
import { LRUCacheOptions, LRUCacheBatchResult, LRUCacheSnapshot } from "./lru-cache-types";
/**
 * LRU Cache Implementation
 *
 * A complete LRU cache implementation with comprehensive features including
 * TTL support, performance monitoring, event handling, and batch operations.
 *
 * @template K - The type of keys stored in the cache
 * @template V - The type of values stored in the cache
 */
export declare class LRUCache<K, V> {
    private cache;
    private linkedList;
    private config;
    private statsManager;
    private ttlManager;
    private eventManager;
    private nodePool;
    /**
     * Creates a new LRU Cache instance
     *
     * @param options - Configuration options for the LRU cache
     * @example
     */
    constructor(options: LRUCacheOptions<K, V>);
    /**
     *
     * @param key
     * @example
     */
    get(key: K): V | undefined;
    /**
     *
     * @param key
     * @param value
     * @example
     */
    set(key: K, value: V): boolean;
    /**
     *
     * @param key
     * @example
     */
    delete(key: K): boolean;
    /**
     *
     * @param key
     * @example
     */
    has(key: K): boolean;
    /**
     *
     * @example
     */
    clear(): void;
    /**
     *
     * @example
     */
    size(): number;
    /**
     *
     * @example
     */
    maxSize(): number;
    /**
     *
     * @example
     */
    getStats(): import("./lru-cache-types").LRUCacheStats;
    /**
     *
     * @example
     */
    getPerformanceMetrics(): import("./lru-cache-types").LRUCachePerformanceMetrics;
    /**
     *
     * @example
     */
    snapshot(): LRUCacheSnapshot<K, V>;
    /**
     *
     * @param entries
     * @example
     */
    batchSet(entries: Array<{
        key: K;
        value: V;
    }>): LRUCacheBatchResult<K, V>;
    /**
     *
     * @example
     */
    [Symbol.iterator](): Iterator<{
        key: K;
        value: V;
    }>;
    /**
     *
     * @example
     */
    private evict;
    /**
     *
     * @example
     */
    private performCleanup;
    /**
     *
     * @example
     */
    private updateMemoryUsage;
    /**
     *
     * @example
     */
    destroy(): void;
}
//# sourceMappingURL=lru-cache-core.d.ts.map