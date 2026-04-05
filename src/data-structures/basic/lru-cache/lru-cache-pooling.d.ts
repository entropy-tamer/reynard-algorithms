/**
 * LRU Cache Object Pooling
 *
 * Object pooling utilities for LRU cache nodes to reduce GC pressure.
 *
 * @module algorithms/dataStructures/lruCachePooling
 */
import { LRUCacheNode } from "./lru-cache-types";
/**
 * Object pool manager for LRU cache nodes
 */
export declare class LRUCacheNodePool<K, V> {
    private nodePool;
    private poolSize;
    private readonly maxPoolSize;
    private readonly enabled;
    /**
     *
     * @param enabled
     * @param maxPoolSize
     * @example
     */
    constructor(enabled: boolean, maxPoolSize: number);
    /**
     * Creates a node using object pooling (if enabled) or direct allocation
     *
     * @param key - The cache key
     * @param value - The cache value
     * @returns A new or reused LRU cache node
     * @example
     * ```typescript
     * const pool = new LRUCacheNodePool(true, 1000);
     * const node = pool.createNode("key", "value");
     * ```
     */
    createNode(key: K, value: V): LRUCacheNode<K, V>;
    /**
     * Returns a node to the pool for reuse (if optimizations enabled)
     *
     * @param node - The node to return to the pool
     * @example
     * ```typescript
     * pool.returnNodeToPool(node);
     * ```
     */
    returnNodeToPool(node: LRUCacheNode<K, V>): void;
    /**
     * Clears the object pool
     * @example
     */
    clear(): void;
}
//# sourceMappingURL=lru-cache-pooling.d.ts.map