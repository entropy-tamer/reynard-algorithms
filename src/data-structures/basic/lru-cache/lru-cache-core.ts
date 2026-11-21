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

import type {
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
import { getValue, setValue, deleteValue } from "./lru-cache-operations";
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
   * @example
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
    this.ttlManager = new LRUCacheTTLManager<K, V>(
      this.config.ttl,
      this.config.enableCleanup,
      this.config.cleanupInterval
    );
    this.eventManager = new LRUCacheEventManager<K, V>(
      options.onEvent,
      options.onEvict,
      options.onAccess,
      options.onSet,
      options.onDelete
    );
    this.nodePool = new LRUCacheNodePool<K, V>(this.config.enableOptimizations, this.config.maxPoolSize);
    if (this.config.enableCleanup && this.config.ttl > 0) {
      this.ttlManager.startCleanupTimer(() => this.performCleanup());
    }
  }

  /**
   * Returns the value for `key` and promotes it to most-recently-used.
   *
   * Respects TTL expiry: an expired entry is lazily deleted and reported as a
   * miss. Updates hit/miss statistics when stats are enabled.
   *
   * @param key The key to look up.
   * @returns The cached value, or `undefined` on miss or expiry.
   * Complexity: see `ds-basic-lru-cache` in ~/src/foxtools/registry/algorithms/ (verified: best/average O(1), worst O(n); O(1) depends on hash-map behavior)
   */
  get(key: K): V | undefined {
    return getValue(
      key,
      this.cache,
      this.linkedList,
      this.statsManager,
      this.ttlManager,
      this.eventManager,
      this.config.enableStats,
      k => this.delete(k)
    );
  }

  /**
   * Inserts or updates `key`, promoting it to most-recently-used.
   *
   * When the cache is at capacity, the least-recently-used entry is evicted
   * first (pooled nodes are recycled to reduce GC pressure).
   *
   * @param key The key to insert or update.
   * @param value The value to associate with the key.
   * @returns `true` if the operation succeeded.
   * Complexity: see `ds-basic-lru-cache` in ~/src/foxtools/registry/algorithms/ (verified: best/average O(1), worst O(n); O(1) depends on hash-map behavior)
   */
  set(key: K, value: V): boolean {
    return setValue(
      key,
      value,
      this.cache,
      this.linkedList,
      this.statsManager,
      this.eventManager,
      this.config.maxSize,
      () => this.evict(),
      () => this.updateMemoryUsage(),
      (k, v) => this.nodePool.createNode(k, v)
    );
  }

  /**
   * Removes `key` from the cache and recycles its node to the pool.
   *
   * @param key The key to remove.
   * @returns `true` if the key existed and was removed, `false` otherwise.
   */
  delete(key: K): boolean {
    return deleteValue(
      key,
      this.cache,
      this.linkedList,
      this.statsManager,
      this.eventManager,
      () => this.updateMemoryUsage(),
      node => this.nodePool.returnNodeToPool(node)
    );
  }

  /**
   * Checks whether `key` is cached WITHOUT promoting it in the LRU order.
   *
   * Expired entries are lazily deleted here too — `has` returning false for a
   * previously-present key may have removed it as a side effect.
   *
   * @param key The key to test for membership.
   */
  has(key: K): boolean {
    const node = this.cache.get(key);
    if (!node) return false;
    if (this.ttlManager.isExpired(node)) {
      this.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Removes ALL entries, recycling every node to the pool, and emits a
   * `clear` event. Statistics size resets to zero; cumulative hit/miss counts
   * (managed by the stats manager) are preserved.
   */
  clear(): void {
    for (const node of this.cache.values()) {
      this.nodePool.returnNodeToPool(node);
    }
    this.cache.clear();
    this.linkedList.clear();
    this.statsManager.setSize(0);
    this.eventManager.emitEvent("clear");
  }

  /**
   * Current number of live (non-expired-removed) entries in the cache.
   */
  size(): number {
    return this.statsManager.getSize();
  }
  /**
   * Configured maximum number of entries before LRU eviction kicks in.
   */
  maxSize(): number {
    return this.config.maxSize;
  }
  /**
   * Aggregate statistics: hits, misses, evictions, hit rate, and current size.
   * Only meaningful when `enableStats` was on at construction.
   */
  getStats() {
    return this.statsManager.getStats();
  }
  /**
   * Fine-grained performance metrics (memory usage estimates, operation
   * timings) collected by the stats manager.
   */
  getPerformanceMetrics() {
    return this.statsManager.getPerformanceMetrics();
  }
  /**
   * Point-in-time copy of the cache contents in LRU order (MRU first),
   * excluding already-expired-but-uncollected entries per TTL rules.
   * Useful for debugging and serialization; O(n).
   */
  snapshot(): LRUCacheSnapshot<K, V> {
    return createCacheSnapshot(this.linkedList, this.ttlManager, this.config, () => this.getStats());
  }
  /**
   * Inserts or updates several entries in one call, delegating each pair to `set`.
   *
   * Individual failures are collected rather than thrown, and the result reports the success rate.
   *
   * @param entries Key/value pairs to insert or update.
   * @returns Processed and failed entries, the total count, and the success rate.
   * Complexity: see `ds-basic-lru-cache` in ~/src/foxtools/registry/algorithms/ (verified: O(1) average per set, so O(n) over n entries; O(n) worst case per set).
   */
  batchSet(entries: Array<{ key: K; value: V }>): LRUCacheBatchResult<K, V> {
    return performBatchSet(entries, (key, value) => this.set(key, value));
  }
  /**
   * Iterates over live entries from most- to least-recently-used, skipping expired entries.
   *
   * @returns An iterator of `{ key, value }` pairs in LRU order.
   */
  [Symbol.iterator](): Iterator<{ key: K; value: V }> {
    return createCacheIterator(this.linkedList, this.ttlManager);
  }

  /**
   * Removes the least-recently-used entry, recycles its node, and emits an `evict` event.
   *
   * No-op when the list is empty.
   *
   * Complexity: see `ds-basic-lru-cache` in ~/src/foxtools/registry/algorithms/ (verified: O(1) average-case tail removal).
   */
  private evict(): void {
    const evictedNode = this.linkedList.evictTail();
    if (!evictedNode) return;
    this.cache.delete(evictedNode.key);
    this.statsManager.recordEviction();
    this.nodePool.returnNodeToPool(evictedNode);
    this.eventManager.emitEvent("evict", evictedNode.key, evictedNode.value);
  }

  /**
   * Removes every expired entry via the TTL manager and records cleanup timing and counts.
   *
   * Emits `expire` and `cleanup` events for the affected keys; scans the whole cache.
   *
   * Complexity: see `ds-basic-lru-cache` in ~/src/foxtools/registry/algorithms/ (verified: O(n) over cached items for a full cleanup pass).
   */
  private performCleanup(): void {
    performTTLCleanup(
      this.ttlManager,
      this.cache,
      key => this.delete(key),
      key => this.eventManager.emitEvent("expire", key),
      time => this.statsManager.recordCleanup(time),
      expiredCount => this.eventManager.emitEvent("cleanup", undefined, undefined, { expiredCount })
    );
  }
  /**
   * Recomputes the estimated memory usage from cache contents when statistics are enabled.
   *
   * Returns immediately when stats are off, avoiding a full walk of the cache on every write.
   *
   * Complexity: see `ds-basic-lru-cache` in ~/src/foxtools/registry/algorithms/ (verified: O(n) when enabled, as the estimate walks every entry).
   */
  private updateMemoryUsage(): void {
    // calculateMemoryUsage() walks the whole cache and stringifies every key
    // and value. set() and delete() call this on every operation, which makes
    // a batch of sets quadratic even when statistics were never requested.
    if (!this.config.enableStats) return;
    this.statsManager.updateMemoryUsage(() => calculateMemoryUsage(this.cache));
  }

  /**
   * Tears down the cache: stops the TTL cleanup timer, removes all entries,
   * and drains the node pool. Call this when done with the instance to avoid
   * leaking the cleanup timer; the cache should not be used afterwards.
   */
  destroy(): void {
    this.ttlManager.stopCleanupTimer();
    this.clear();
    this.nodePool.clear();
  }
}
