/**
 * LRU Cache Operations
 *
 * Core cache operations (get, set, delete, has) implementation.
 *
 * @module algorithms/dataStructures/lruCacheOperations
 */
import { LRUCacheNode } from "./lru-cache-types";
import { LRUCacheLinkedList } from "./lru-cache-linked-list";
import { LRUCacheStatsManager } from "./lru-cache-stats";
import { LRUCacheTTLManager } from "./lru-cache-ttl";
import { LRUCacheEventManager } from "./lru-cache-events";
/**
 * Gets a value from the cache
 * @param key
 * @param cache
 * @param linkedList
 * @param statsManager
 * @param ttlManager
 * @param eventManager
 * @param enableStats
 * @param deleteFunction
 * @example
 */
export declare function getValue<K, V>(key: K, cache: Map<K, LRUCacheNode<K, V>>, linkedList: LRUCacheLinkedList<K, V>, statsManager: LRUCacheStatsManager<K>, ttlManager: LRUCacheTTLManager<K, V>, eventManager: LRUCacheEventManager<K, V>, enableStats: boolean, deleteFunction: (key: K) => boolean): V | undefined;
/**
 * Sets a value in the cache
 * @param key
 * @param value
 * @param cache
 * @param linkedList
 * @param statsManager
 * @param eventManager
 * @param maxSize
 * @param evictFunction
 * @param updateMemoryUsage
 * @param createNode
 * @example
 */
export declare function setValue<K, V>(key: K, value: V, cache: Map<K, LRUCacheNode<K, V>>, linkedList: LRUCacheLinkedList<K, V>, statsManager: LRUCacheStatsManager<K>, eventManager: LRUCacheEventManager<K, V>, maxSize: number, evictFunction: () => void, updateMemoryUsage: () => void, createNode: (key: K, value: V) => LRUCacheNode<K, V>): boolean;
/**
 * Deletes a value from the cache
 * @param key
 * @param cache
 * @param linkedList
 * @param statsManager
 * @param eventManager
 * @param updateMemoryUsage
 * @param returnToPool
 * @example
 */
export declare function deleteValue<K, V>(key: K, cache: Map<K, LRUCacheNode<K, V>>, linkedList: LRUCacheLinkedList<K, V>, statsManager: LRUCacheStatsManager<K>, eventManager: LRUCacheEventManager<K, V>, updateMemoryUsage: () => void, returnToPool: (node: LRUCacheNode<K, V>) => void): boolean;
//# sourceMappingURL=lru-cache-operations.d.ts.map