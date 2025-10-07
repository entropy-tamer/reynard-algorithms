/**
 * LRU Cache Module
 *
 * Clean exports for the LRU Cache implementation.
 * Provides a complete LRU cache with doubly-linked list and hash map backing.
 *
 * @module algorithms/dataStructures/lruCache
 */

// Export core implementation
export { LRUCache } from "./lru-cache-core";

// Export all types and interfaces
export type {
  LRUCacheNode,
  LRUCacheConfig,
  LRUCacheStats,
  LRUCacheEntry,
  LRUCacheOptions,
  LRUCacheEvent,
  LRUCacheEventType,
  LRUCacheEventHandler,
  LRUCacheIteratorResult,
  LRUCacheBatchResult,
  LRUCacheSnapshot,
  LRUCachePerformanceMetrics,
} from "./lru-cache-types";

