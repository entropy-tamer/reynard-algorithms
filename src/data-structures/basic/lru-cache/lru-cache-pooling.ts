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
export class LRUCacheNodePool<K, V> {
  private nodePool: LRUCacheNode<K, V>[] = [];
  private poolSize = 0;
  private readonly maxPoolSize: number;
  private readonly enabled: boolean;

  constructor(enabled: boolean, maxPoolSize: number) {
    this.enabled = enabled;
    this.maxPoolSize = maxPoolSize;
  }

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
  createNode(key: K, value: V): LRUCacheNode<K, V> {
    if (this.enabled && this.poolSize > 0) {
      // Reuse node from pool
      const node = this.nodePool[--this.poolSize];
      node.key = key;
      node.value = value;
      node.lastAccessed = Date.now();
      node.accessCount = 1;
      node.prev = null;
      node.next = null;
      return node;
    } else {
      // Create new node
      return {
        key,
        value,
        prev: null,
        next: null,
        lastAccessed: Date.now(),
        accessCount: 1,
      };
    }
  }

  /**
   * Returns a node to the pool for reuse (if optimizations enabled)
   *
   * @param node - The node to return to the pool
   * @example
   * ```typescript
   * pool.returnNodeToPool(node);
   * ```
   */
  returnNodeToPool(node: LRUCacheNode<K, V>): void {
    if (!this.enabled || this.poolSize >= this.maxPoolSize) {
      return;
    }

    // Clear references to help GC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node.key = null as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node.value = null as any;
    node.prev = null;
    node.next = null;

    this.nodePool[this.poolSize++] = node;
  }

  /**
   * Clears the object pool
   */
  clear(): void {
    this.nodePool.length = 0;
    this.poolSize = 0;
  }
}

