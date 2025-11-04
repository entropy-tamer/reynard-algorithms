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
 */
export function getValue<K, V>(
  key: K,
  cache: Map<K, LRUCacheNode<K, V>>,
  linkedList: LRUCacheLinkedList<K, V>,
  statsManager: LRUCacheStatsManager<K>,
  ttlManager: LRUCacheTTLManager<K, V>,
  eventManager: LRUCacheEventManager<K, V>,
  enableStats: boolean,
  deleteFunction: (key: K) => boolean
): V | undefined {
  const startTime = performance.now();

  const node = cache.get(key);
  if (!node) {
    statsManager.recordMiss();
    eventManager.emitEvent("get", key, undefined, { hit: false });
    return undefined;
  }

  // Check if expired
  if (ttlManager.isExpired(node)) {
    deleteFunction(key);
    statsManager.recordMiss();
    eventManager.emitEvent("get", key, undefined, { hit: false, expired: true });
    return undefined;
  }

  // Move to head (most recently used)
  linkedList.moveToHead(node);

  // Update access statistics
  node.lastAccessed = Date.now();
  node.accessCount++;

  statsManager.recordHit();
  statsManager.updateAverageGetTime(performance.now() - startTime);

  eventManager.emitEvent("get", key, node.value, { hit: true });

  if (enableStats) {
    statsManager.updateMostAccessedKey(key, node.accessCount, (k) =>
      cache.get(k)?.accessCount
    );
  }

  return node.value;
}

/**
 * Sets a value in the cache
 */
export function setValue<K, V>(
  key: K,
  value: V,
  cache: Map<K, LRUCacheNode<K, V>>,
  linkedList: LRUCacheLinkedList<K, V>,
  statsManager: LRUCacheStatsManager<K>,
  eventManager: LRUCacheEventManager<K, V>,
  maxSize: number,
  evictFunction: () => void,
  updateMemoryUsage: () => void,
  createNode: (key: K, value: V) => LRUCacheNode<K, V>
): boolean {
  const startTime = performance.now();
  try {
    const existingNode = cache.get(key);
    if (existingNode) {
      existingNode.value = value;
      existingNode.lastAccessed = Date.now();
      existingNode.accessCount++;
      linkedList.moveToHead(existingNode);
      eventManager.emitEvent("set", key, value, { updated: true });
    } else {
      const newNode = createNode(key, value);
      cache.set(key, newNode);
      statsManager.recordSet();
      linkedList.addToHead(newNode);
      if (cache.size > maxSize) {
        evictFunction();
      }
      eventManager.emitEvent("set", key, value, { updated: false });
    }
    statsManager.updateAverageSetTime(performance.now() - startTime);
    updateMemoryUsage();
    return true;
  } catch (error) {
    eventManager.emitEvent("set", key, value, {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}

/**
 * Deletes a value from the cache
 */
export function deleteValue<K, V>(
  key: K,
  cache: Map<K, LRUCacheNode<K, V>>,
  linkedList: LRUCacheLinkedList<K, V>,
  statsManager: LRUCacheStatsManager<K>,
  eventManager: LRUCacheEventManager<K, V>,
  updateMemoryUsage: () => void,
  returnToPool: (node: LRUCacheNode<K, V>) => void
): boolean {
  const startTime = performance.now();
  const node = cache.get(key);
  if (!node) return false;
  linkedList.removeNode(node);
  cache.delete(key);
  statsManager.recordDelete();
  returnToPool(node);
  statsManager.updateAverageDeleteTime(performance.now() - startTime);
  updateMemoryUsage();
  eventManager.emitEvent("delete", key, node.value);
  return true;
}



