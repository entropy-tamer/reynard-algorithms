/**
 * LRU Cache Core Implementation
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
  LRUCacheStats,
  LRUCacheEntry,
  LRUCacheOptions,
  LRUCacheEvent,
  LRUCacheEventType,
  LRUCacheEventHandler,
  LRUCacheBatchResult,
  LRUCacheSnapshot,
  LRUCachePerformanceMetrics,
} from "./lru-cache-types";

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
  private head: LRUCacheNode<K, V> | null = null;
  private tail: LRUCacheNode<K, V> | null = null;
  private config: Required<LRUCacheConfig>;
  private stats: LRUCacheStats;
  private eventHandler?: LRUCacheEventHandler<K, V>;
  private onEvict?: (key: K, value: V) => void;
  private onAccess?: (key: K, value: V) => void;
  private onSet?: (key: K, value: V) => void;
  private onDelete?: (key: K, value: V) => void;
  private cleanupTimer?: NodeJS.Timeout;
  private performanceMetrics: LRUCachePerformanceMetrics;


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
      cleanupInterval: options.cleanupInterval ?? 60000, // 1 minute
      enableStats: options.enableStats ?? true,
    };

    this.eventHandler = options.onEvent;
    this.onEvict = options.onEvict;
    this.onAccess = options.onAccess;
    this.onSet = options.onSet;
    this.onDelete = options.onDelete;

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      maxSize: this.config.maxSize,
      hitRate: 0,
      averageAccessTime: 0,
    };

    this.performanceMetrics = {
      averageGetTime: 0,
      averageSetTime: 0,
      averageDeleteTime: 0,
      estimatedMemoryUsage: 0,
      cleanupCount: 0,
      totalCleanupTime: 0,
    };

    // Start cleanup timer if enabled
    if (this.config.enableCleanup && this.config.ttl > 0) {
      this.startCleanupTimer();
    }
  }

  /**
   * Gets a value from the cache
   *
   * Mathematical Process:
   * 1. Look up node in hash map: O(1)
   * 2. Check if expired (if TTL enabled)
   * 3. Move node to head of doubly-linked list: O(1)
   * 4. Update access statistics
   *
   * @param key - The key to look up
   * @returns The cached value, or undefined if not found or expired
   */
  get(key: K): V | undefined {
    const startTime = performance.now();

    const node = this.cache.get(key);
    if (!node) {
      this.stats.misses++;
      this.updateHitRate();
      this.emitEvent("get", key, undefined, { hit: false });
      return undefined;
    }

    // Check if expired
    if (this.isExpired(node)) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      this.emitEvent("get", key, undefined, { hit: false, expired: true });
      return undefined;
    }

    // Move to head (most recently used)
    this.moveToHead(node);

    // Update access statistics
    node.lastAccessed = Date.now();
    node.accessCount++;

    this.stats.hits++;
    this.updateHitRate();
    this.updateAverageGetTime(performance.now() - startTime);

    this.emitEvent("get", key, node.value, { hit: true });

    if (this.config.enableStats) {
      this.updateMostAccessedKey(key, node.accessCount);
    }

    return node.value;
  }

  /**
   * Sets a value in the cache
   *
   * Mathematical Process:
   * 1. Check if key exists in hash map: O(1)
   * 2. If exists, update value and move to head: O(1)
   * 3. If not exists, create new node and add to head: O(1)
   * 4. If cache is full, evict tail node: O(1)
   * 5. Update statistics
   *
   * @param key - The key to store
   * @param value - The value to store
   * @returns True if the operation was successful
   */
  set(key: K, value: V): boolean {
    const startTime = performance.now();

    try {
      const existingNode = this.cache.get(key);

      if (existingNode) {
        // Update existing node
        existingNode.value = value;
        existingNode.lastAccessed = Date.now();
        existingNode.accessCount++;
        this.moveToHead(existingNode);
        this.emitEvent("set", key, value, { updated: true });
      } else {
        // Create new node
        const newNode: LRUCacheNode<K, V> = {
          key,
          value,
          prev: null,
          next: null,
          lastAccessed: Date.now(),
          accessCount: 1,
        };

        // Add to cache
        this.cache.set(key, newNode);
        this.stats.size++;
        this.stats.sets++;

        // Add to head of list
        this.addToHead(newNode);

        // Evict if necessary
        if (this.cache.size > this.config.maxSize) {
          this.evict();
        }

        this.emitEvent("set", key, value, { updated: false });
      }

      this.updateAverageSetTime(performance.now() - startTime);
      this.updateMemoryUsage();
      return true;
    } catch (error) {
      this.emitEvent("set", key, value, { error: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }

  /**
   * Deletes a value from the cache
   *
   * Mathematical Process:
   * 1. Look up node in hash map: O(1)
   * 2. Remove from doubly-linked list: O(1)
   * 3. Remove from hash map: O(1)
   * 4. Update statistics
   *
   * @param key - The key to delete
   * @returns True if the key existed and was deleted
   */
  delete(key: K): boolean {
    const startTime = performance.now();

    const node = this.cache.get(key);
    if (!node) {
      return false;
    }

    // Remove from doubly-linked list
    this.removeNode(node);

    // Remove from cache
    this.cache.delete(key);
    this.stats.size--;
    this.stats.deletes++;

    this.updateAverageDeleteTime(performance.now() - startTime);
    this.updateMemoryUsage();
    this.emitEvent("delete", key, node.value);

    return true;
  }

  /**
   * Checks if a key exists in the cache
   *
   * @param key - The key to check
   * @returns True if the key exists and is not expired
   */
  has(key: K): boolean {
    const node = this.cache.get(key);
    if (!node) {
      return false;
    }

    if (this.isExpired(node)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clears all entries from the cache
   */
  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.stats.size = 0;
    this.emitEvent("clear");
  }

  /**
   * Gets the current size of the cache
   *
   * @returns Number of items in the cache
   */
  size(): number {
    return this.stats.size;
  }

  /**
   * Gets the maximum size of the cache
   *
   * @returns Maximum number of items the cache can hold
   */
  maxSize(): number {
    return this.config.maxSize;
  }

  /**
   * Gets cache statistics
   *
   * @returns Current cache statistics
   */
  getStats(): LRUCacheStats {
    return { ...this.stats };
  }

  /**
   * Gets performance metrics
   *
   * @returns Current performance metrics
   */
  getPerformanceMetrics(): LRUCachePerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Creates a snapshot of the cache state
   *
   * @returns Cache snapshot for debugging and analysis
   */
  snapshot(): LRUCacheSnapshot<K, V> {
    const entries: LRUCacheEntry<K, V>[] = [];

    let current = this.head;
    while (current) {
      entries.push({
        key: current.key,
        value: current.value,
        createdAt: current.lastAccessed,
        lastAccessed: current.lastAccessed,
        accessCount: current.accessCount,
        ttl: this.config.ttl,
        isExpired: this.isExpired(current),
      });
      current = current.next;
    }

    return {
      entries,
      stats: this.getStats(),
      config: { ...this.config },
      timestamp: Date.now(),
    };
  }

  /**
   * Batch sets multiple key-value pairs
   *
   * @param entries - Array of key-value pairs to set
   * @returns Batch operation result
   */
  batchSet(entries: Array<{ key: K; value: V }>): LRUCacheBatchResult<K, V> {
    const processed: Array<{ key: K; value: V }> = [];
    const failed: Array<{ key: K; value: V; error: string }> = [];

    for (const { key, value } of entries) {
      try {
        if (this.set(key, value)) {
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
   * Creates an iterator for the cache entries
   *
   * @returns Iterator that yields entries in LRU order (most recent first)
   */
  *[Symbol.iterator](): Iterator<{ key: K; value: V }> {
    let current = this.head;
    while (current) {
      if (!this.isExpired(current)) {
        yield { key: current.key, value: current.value };
      }
      current = current.next;
    }
  }

  /**
   * Moves a node to the head of the doubly-linked list
   *
   * @param node - The node to move
   */
  private moveToHead(node: LRUCacheNode<K, V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  /**
   * Adds a node to the head of the doubly-linked list
   *
   * @param node - The node to add
   */
  private addToHead(node: LRUCacheNode<K, V>): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  /**
   * Removes a node from the doubly-linked list
   *
   * @param node - The node to remove
   */
  private removeNode(node: LRUCacheNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  /**
   * Evicts the least recently used item (tail of the list)
   */
  private evict(): void {
    if (!this.tail) {
      return;
    }

    const evictedKey = this.tail.key;
    const evictedValue = this.tail.value;

    this.removeNode(this.tail);
    this.cache.delete(evictedKey);
    this.stats.size--;
    this.stats.evictions++;

    this.emitEvent("evict", evictedKey, evictedValue);
  }

  /**
   * Checks if a node has expired based on TTL
   *
   * @param node - The node to check
   * @returns True if the node has expired
   */
  private isExpired(node: LRUCacheNode<K, V>): boolean {
    if (this.config.ttl <= 0) {
      return false;
    }
    return Date.now() - node.lastAccessed > this.config.ttl;
  }

  /**
   * Starts the cleanup timer for expired entries
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Cleans up expired entries
   */
  private cleanup(): void {
    const startTime = performance.now();
    const expiredKeys: K[] = [];

    for (const [key, node] of this.cache) {
      if (this.isExpired(node)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.delete(key);
      this.emitEvent("expire", key);
    }

    this.performanceMetrics.cleanupCount++;
    this.performanceMetrics.totalCleanupTime += performance.now() - startTime;
    this.emitEvent("cleanup", undefined, undefined, { expiredCount: expiredKeys.length });
  }

  /**
   * Updates the hit rate statistic
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Updates the most accessed key statistic
   *
   * @param key - The key that was accessed
   * @param accessCount - The access count for the key
   */
  private updateMostAccessedKey(key: K, accessCount: number): void {
    if (!this.stats.mostAccessedKey) {
      this.stats.mostAccessedKey = key;
      return;
    }

    const mostAccessedNode = this.cache.get(this.stats.mostAccessedKey);
    if (!mostAccessedNode || accessCount > mostAccessedNode.accessCount) {
      this.stats.mostAccessedKey = key;
    }
  }

  /**
   * Updates the average get time
   *
   * @param time - Time taken for the get operation
   */
  private updateAverageGetTime(time: number): void {
    const totalGets = this.stats.hits + this.stats.misses;
    this.performanceMetrics.averageGetTime =
      (this.performanceMetrics.averageGetTime * (totalGets - 1) + time) / totalGets;
  }

  /**
   * Updates the average set time
   *
   * @param time - Time taken for the set operation
   */
  private updateAverageSetTime(time: number): void {
    this.performanceMetrics.averageSetTime =
      (this.performanceMetrics.averageSetTime * (this.stats.sets - 1) + time) / this.stats.sets;
  }

  /**
   * Updates the average delete time
   *
   * @param time - Time taken for the delete operation
   */
  private updateAverageDeleteTime(time: number): void {
    this.performanceMetrics.averageDeleteTime =
      (this.performanceMetrics.averageDeleteTime * (this.stats.deletes - 1) + time) / this.stats.deletes;
  }

  /**
   * Updates the estimated memory usage
   */
  private updateMemoryUsage(): void {
    // Rough estimate: key size + value size + node overhead
    let estimatedSize = 0;
    for (const [key, node] of this.cache) {
      estimatedSize += JSON.stringify(key).length * 2; // UTF-16
      estimatedSize += JSON.stringify(node.value).length * 2;
      estimatedSize += 64; // Node overhead (pointers, metadata)
    }
    this.performanceMetrics.estimatedMemoryUsage = estimatedSize;
  }

  /**
   * Emits an event if event handler is configured
   *
   * @param type - Event type
   * @param key - Event key
   * @param value - Event value
   * @param metadata - Additional metadata
   */
  private emitEvent(type: LRUCacheEventType, key?: K, value?: V, metadata?: Record<string, any>): void {
    const event: LRUCacheEvent<K, V> = {
      type,
      timestamp: Date.now(),
      key,
      value,
      metadata,
    };

    // Emit to general event handler
    if (this.eventHandler) {
      this.eventHandler(event);
    }

    // Emit to specific event handlers
    if (key !== undefined && value !== undefined) {
      switch (type) {
        case "set":
          if (this.onSet) {
            this.onSet(key, value);
          }
          break;
        case "get":
          if (this.onAccess) {
            this.onAccess(key, value);
          }
          break;
        case "delete":
          if (this.onDelete) {
            this.onDelete(key, value);
          }
          break;
        case "evict":
          if (this.onEvict) {
            this.onEvict(key, value);
          }
          break;
      }
    }
  }

  /**
   * Destroys the cache and cleans up resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}
