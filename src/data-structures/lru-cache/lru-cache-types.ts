/**
 * LRU Cache Types and Interfaces
 *
 * TypeScript interfaces and types for the LRU (Least Recently Used) Cache implementation.
 * Provides type safety for cache operations and node management.
 *
 * @module algorithms/dataStructures/lruCacheTypes
 */

/**
 * LRU Cache Node Interface
 *
 * Represents a single node in the doubly-linked list used by the LRU cache.
 * Each node contains the key, value, and pointers to adjacent nodes.
 *
 * @template K - The type of keys stored in the cache
 * @template V - The type of values stored in the cache
 */
export interface LRUCacheNode<K, V> {
  /** The cache key */
  key: K;
  /** The cached value */
  value: V;
  /** Pointer to the previous (older) node */
  prev: LRUCacheNode<K, V> | null;
  /** Pointer to the next (newer) node */
  next: LRUCacheNode<K, V> | null;
  /** Timestamp when the node was last accessed */
  lastAccessed: number;
  /** Number of times this node has been accessed */
  accessCount: number;
}

/**
 * LRU Cache Configuration Options
 *
 * Configuration options for customizing the LRU cache behavior.
 */
export interface LRUCacheConfig {
  /** Maximum number of items the cache can hold */
  maxSize: number;
  /** Time-to-live for cache entries in milliseconds (0 = no expiration) */
  ttl?: number;
  /** Whether to enable automatic cleanup of expired entries */
  enableCleanup?: boolean;
  /** Interval for automatic cleanup in milliseconds */
  cleanupInterval?: number;
  /** Whether to track access statistics */
  enableStats?: boolean;
}

/**
 * LRU Cache Statistics
 *
 * Performance and usage statistics for the LRU cache.
 */
export interface LRUCacheStats {
  /** Total number of cache hits */
  hits: number;
  /** Total number of cache misses */
  misses: number;
  /** Total number of cache sets */
  sets: number;
  /** Total number of cache deletes */
  deletes: number;
  /** Total number of evictions */
  evictions: number;
  /** Current number of items in cache */
  size: number;
  /** Maximum size reached */
  maxSize: number;
  /** Hit rate (hits / (hits + misses)) */
  hitRate: number;
  /** Average access time in milliseconds */
  averageAccessTime: number;
  /** Most frequently accessed key */
  mostAccessedKey?: any;
  /** Least recently used key */
  lruKey?: any;
}

/**
 * LRU Cache Entry
 *
 * Represents a cache entry with metadata.
 */
export interface LRUCacheEntry<K, V> {
  /** The cache key */
  key: K;
  /** The cached value */
  value: V;
  /** Timestamp when the entry was created */
  createdAt: number;
  /** Timestamp when the entry was last accessed */
  lastAccessed: number;
  /** Number of times this entry has been accessed */
  accessCount: number;
  /** Time-to-live in milliseconds */
  ttl: number;
  /** Whether the entry has expired */
  isExpired: boolean;
}

/**
 * LRU Cache Iterator Result
 *
 * Result type for cache iteration operations.
 */
export interface LRUCacheIteratorResult<K, V> {
  /** The cache key */
  key: K;
  /** The cached value */
  value: V;
  /** Whether this is the last entry */
  done: boolean;
  /** Entry metadata */
  metadata: {
    lastAccessed: number;
    accessCount: number;
    isExpired: boolean;
  };
}

/**
 * LRU Cache Options
 *
 * Extended options for LRU cache creation with event handling.
 */
export interface LRUCacheOptions<K, V> extends LRUCacheConfig {
  /** Function to call when an item is evicted */
  onEvict?: (key: K, value: V) => void;
  /** Function to call when an item is accessed */
  onAccess?: (key: K, value: V) => void;
  /** Function to call when an item is set */
  onSet?: (key: K, value: V) => void;
  /** Function to call when an item is deleted */
  onDelete?: (key: K, value: V) => void;
  /** General event handler for all cache events */
  onEvent?: LRUCacheEventHandler<K, V>;
}

/**
 * LRU Cache Event Types
 *
 * Events that can be emitted by the LRU cache for monitoring and debugging.
 */
export type LRUCacheEventType = "set" | "get" | "delete" | "evict" | "expire" | "clear" | "cleanup";

/**
 * LRU Cache Event Data
 *
 * Data associated with LRU cache events.
 */
export interface LRUCacheEvent<K, V> {
  /** The type of event */
  type: LRUCacheEventType;
  /** The timestamp of the event */
  timestamp: number;
  /** The key associated with the event */
  key?: K;
  /** The value associated with the event */
  value?: V;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * LRU Cache Event Handler
 *
 * Function type for handling LRU cache events.
 *
 * @template K - The type of keys in the cache
 * @template V - The type of values in the cache
 * @param event - The event data
 */
export type LRUCacheEventHandler<K, V> = (event: LRUCacheEvent<K, V>) => void;

/**
 * LRU Cache Batch Operation Result
 *
 * Result type for batch operations on the LRU cache.
 */
export interface LRUCacheBatchResult<K, V> {
  /** Successfully processed entries */
  processed: Array<{ key: K; value: V }>;
  /** Entries that failed to process */
  failed: Array<{ key: K; value: V; error: string }>;
  /** Total number of operations */
  total: number;
  /** Success rate (0-1) */
  successRate: number;
}

/**
 * LRU Cache Snapshot
 *
 * Snapshot of the cache state for debugging and analysis.
 */
export interface LRUCacheSnapshot<K, V> {
  /** Current cache entries */
  entries: LRUCacheEntry<K, V>[];
  /** Current statistics */
  stats: LRUCacheStats;
  /** Cache configuration */
  config: LRUCacheConfig;
  /** Timestamp when snapshot was taken */
  timestamp: number;
}

/**
 * LRU Cache Performance Metrics
 *
 * Detailed performance metrics for the LRU cache.
 */
export interface LRUCachePerformanceMetrics {
  /** Average time for get operations in milliseconds */
  averageGetTime: number;
  /** Average time for set operations in milliseconds */
  averageSetTime: number;
  /** Average time for delete operations in milliseconds */
  averageDeleteTime: number;
  /** Total memory usage estimate in bytes */
  estimatedMemoryUsage: number;
  /** Number of cleanup operations performed */
  cleanupCount: number;
  /** Time spent on cleanup operations in milliseconds */
  totalCleanupTime: number;
}
