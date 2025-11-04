/**
 * LRU Cache TTL and Cleanup Management
 *
 * Handles time-to-live (TTL) expiration and automatic cleanup of expired entries.
 *
 * @module algorithms/dataStructures/lruCacheTTL
 */

import { LRUCacheNode } from "./lru-cache-types";

/**
 * TTL and cleanup manager for LRU cache
 */
export class LRUCacheTTLManager<K, V> {
  private ttl: number;
  private cleanupInterval: number;
  private enableCleanup: boolean;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(ttl: number, enableCleanup: boolean, cleanupInterval: number) {
    this.ttl = ttl;
    this.enableCleanup = enableCleanup;
    this.cleanupInterval = cleanupInterval;
  }

  /**
   * Checks if a node has expired based on TTL
   *
   * @param node - The node to check
   * @returns True if the node has expired
   */
  isExpired(node: LRUCacheNode<K, V>): boolean {
    if (this.ttl <= 0) {
      return false;
    }
    return Date.now() - node.lastAccessed > this.ttl;
  }

  /**
   * Starts the cleanup timer for expired entries
   *
   * @param cleanupCallback - Function to call for cleanup
   */
  startCleanupTimer(cleanupCallback: () => void): void {
    if (this.cleanupTimer) {
      this.stopCleanupTimer();
    }

    if (this.enableCleanup && this.ttl > 0) {
      this.cleanupTimer = setInterval(cleanupCallback, this.cleanupInterval);
    }
  }

  /**
   * Stops the cleanup timer
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Cleans up expired entries from cache
   *
   * @param cache - Map of cache entries
   * @param deleteCallback - Function to delete expired entries
   * @param expireCallback - Function to call when entry expires
   * @returns Number of expired entries removed
   */
  cleanup(
    cache: Map<K, LRUCacheNode<K, V>>,
    deleteCallback: (key: K) => void,
    expireCallback?: (key: K) => void
  ): number {
    const expiredKeys: K[] = [];

    for (const [key, node] of cache) {
      if (this.isExpired(node)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      deleteCallback(key);
      if (expireCallback) {
        expireCallback(key);
      }
    }

    return expiredKeys.length;
  }

  /**
   * Gets TTL configuration
   */
  getTTL(): number {
    return this.ttl;
  }
}



