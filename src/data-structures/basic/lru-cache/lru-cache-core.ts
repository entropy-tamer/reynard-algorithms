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

import {
  LRUCacheNode,
  LRUCacheConfig,
  LRUCacheOptions,
  LRUCacheBatchResult,
  LRUCacheSnapshot,
} from "./lru-cache-types";
import { LRUCacheLinkedList } from "./lru-cache-linked-list";
import { LRUCacheStatsManager } from "./lru-cache-stats";
import { LRUCacheTTLManager } from "./lru-cache-ttl";
import { LRUCacheEventManager } from "./lru-cache-events";
import {
  createCacheSnapshot,
  performBatchSet,
  calculateMemoryUsage,
  createCacheIterator,
  performTTLCleanup,
} from "./lru-cache-utils";
import {
  getValue,
  setValue,
  deleteValue,
} from "./lru-cache-operations";
import { LRUCacheNodePool } from "./lru-cache-pooling";

/**
 * LRU Cache Implementation
 *
 * A complete LRU cache implementation with comprehensive features including
 * TTL support, performance monitoring, event handling, and batch operations.
 *
 * @template K - The type of keys stored in the cache
 * @template V - The type of values stored in the cache
 */
export class LRUCache<K, V> {
  private cache = new Map<K, LRUCacheNode<K, V>>();
  private linkedList: LRUCacheLinkedList<K, V>;
  private config: LRUCacheConfig & {
    maxSize: number;
    ttl: number;
    enableCleanup: boolean;
    cleanupInterval: number;
    enableStats: boolean;
    enableOptimizations: boolean;
    maxPoolSize: number;
  };
  private statsManager: LRUCacheStatsManager<K>;
  private ttlManager: LRUCacheTTLManager<K, V>;
  private eventManager: LRUCacheEventManager<K, V>;
  private nodePool: LRUCacheNodePool<K, V>;

  /**
   * Creates a new LRU Cache instance
   *
   * @param options - Configuration options for the LRU cache
   */
  constructor(options: LRUCacheOptions<K, V>) {
    this.config = {
      maxSize: options.maxSize,
      ttl: options.ttl ?? 0,
      enableCleanup: options.enableCleanup ?? true,
      cleanupInterval: options.cleanupInterval ?? 60000,
      enableStats: options.enableStats ?? true,
      enableOptimizations: options.enableOptimizations ?? true,
      maxPoolSize: options.maxPoolSize ?? 1000,
    };
    this.linkedList = new LRUCacheLinkedList<K, V>();
    this.statsManager = new LRUCacheStatsManager<K>(this.config.maxSize);
    this.ttlManager = new LRUCacheTTLManager<K, V>(this.config.ttl, this.config.enableCleanup, this.config.cleanupInterval);
    this.eventManager = new LRUCacheEventManager<K, V>(options.onEvent, options.onEvict, options.onAccess, options.onSet, options.onDelete);
    this.nodePool = new LRUCacheNodePool<K, V>(this.config.enableOptimizations, this.config.maxPoolSize);
    if (this.config.enableCleanup && this.config.ttl > 0) {
      this.ttlManager.startCleanupTimer(() => this.performCleanup());
    }
  }

  get(key: K): V | undefined {
    return getValue(key, this.cache, this.linkedList, this.statsManager, this.ttlManager, this.eventManager, this.config.enableStats, (k) => this.delete(k));
  }

  set(key: K, value: V): boolean {
    return setValue(key, value, this.cache, this.linkedList, this.statsManager, this.eventManager, this.config.maxSize, () => this.evict(), () => this.updateMemoryUsage(), (k, v) => this.nodePool.createNode(k, v));
  }

  delete(key: K): boolean {
    return deleteValue(key, this.cache, this.linkedList, this.statsManager, this.eventManager, () => this.updateMemoryUsage(), (node) => this.nodePool.returnNodeToPool(node));
  }

  has(key: K): boolean {
    const node = this.cache.get(key);
    if (!node) return false;
    if (this.ttlManager.isExpired(node)) {
      this.delete(key);
      return false;
    }
    return true;
  }

  clear(): void {
    for (const node of this.cache.values()) {
      this.nodePool.returnNodeToPool(node);
    }
    this.cache.clear();
    this.linkedList.clear();
    this.statsManager.setSize(0);
    this.eventManager.emitEvent("clear");
  }

  size(): number { return this.statsManager.getSize(); }
  maxSize(): number { return this.config.maxSize; }
  getStats() { return this.statsManager.getStats(); }
  getPerformanceMetrics() { return this.statsManager.getPerformanceMetrics(); }
  snapshot(): LRUCacheSnapshot<K, V> { return createCacheSnapshot(this.linkedList, this.ttlManager, this.config, () => this.getStats()); }
  batchSet(entries: Array<{ key: K; value: V }>): LRUCacheBatchResult<K, V> { return performBatchSet(entries, (key, value) => this.set(key, value)); }
  [Symbol.iterator](): Iterator<{ key: K; value: V }> { return createCacheIterator(this.linkedList, this.ttlManager); }

  private evict(): void {
    const evictedNode = this.linkedList.evictTail();
    if (!evictedNode) return;
    this.cache.delete(evictedNode.key);
    this.statsManager.recordEviction();
    this.nodePool.returnNodeToPool(evictedNode);
    this.eventManager.emitEvent("evict", evictedNode.key, evictedNode.value);
  }

  private performCleanup(): void {
    performTTLCleanup(this.ttlManager, this.cache, (key) => this.delete(key), (key) => this.eventManager.emitEvent("expire", key), (time) => this.statsManager.recordCleanup(time), (expiredCount) => this.eventManager.emitEvent("cleanup", undefined, undefined, { expiredCount }));
  }
  private updateMemoryUsage(): void { this.statsManager.updateMemoryUsage(() => calculateMemoryUsage(this.cache)); }

  destroy(): void {
    this.ttlManager.stopCleanupTimer();
    this.clear();
    this.nodePool.clear();
  }
}
