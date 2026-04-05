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
export declare class LRUCacheTTLManager<K, V> {
    private ttl;
    private cleanupInterval;
    private enableCleanup;
    private cleanupTimer;
    /**
     *
     * @param ttl
     * @param enableCleanup
     * @param cleanupInterval
     * @example
     */
    constructor(ttl: number, enableCleanup: boolean, cleanupInterval: number);
    /**
     * Checks if a node has expired based on TTL
     *
     * @param node - The node to check
     * @returns True if the node has expired
     * @example
     */
    isExpired(node: LRUCacheNode<K, V>): boolean;
    /**
     * Starts the cleanup timer for expired entries
     *
     * @param cleanupCallback - Function to call for cleanup
     * @example
     */
    startCleanupTimer(cleanupCallback: () => void): void;
    /**
     * Stops the cleanup timer
     * @example
     */
    stopCleanupTimer(): void;
    /**
     * Cleans up expired entries from cache
     *
     * @param cache - Map of cache entries
     * @param deleteCallback - Function to delete expired entries
     * @param expireCallback - Function to call when entry expires
     * @returns Number of expired entries removed
     * @example
     */
    cleanup(cache: Map<K, LRUCacheNode<K, V>>, deleteCallback: (key: K) => void, expireCallback?: (key: K) => void): number;
    /**
     * Gets TTL configuration
     * @example
     */
    getTTL(): number;
}
//# sourceMappingURL=lru-cache-ttl.d.ts.map