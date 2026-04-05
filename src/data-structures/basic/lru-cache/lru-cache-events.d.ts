/**
 * LRU Cache Event Management
 *
 * Handles event emission for cache operations (get, set, delete, evict, etc.).
 *
 * @module algorithms/dataStructures/lruCacheEvents
 */
import { LRUCacheEventType, LRUCacheEventHandler } from "./lru-cache-types";
/**
 * Event manager for LRU cache
 */
export declare class LRUCacheEventManager<K, V> {
    private eventHandler;
    private onEvict;
    private onAccess;
    private onSet;
    private onDelete;
    /**
     *
     * @param eventHandler
     * @param onEvict
     * @param onAccess
     * @param onSet
     * @param onDelete
     * @example
     */
    constructor(eventHandler?: LRUCacheEventHandler<K, V>, onEvict?: (key: K, value: V) => void, onAccess?: (key: K, value: V) => void, onSet?: (key: K, value: V) => void, onDelete?: (key: K, value: V) => void);
    /**
     * Emits an event if event handler is configured
     *
     * @param type - Event type
     * @param key - Event key
     * @param value - Event value
     * @param metadata - Additional metadata
     * @example
     */
    emitEvent(type: LRUCacheEventType, key?: K, value?: V, metadata?: Record<string, any>): void;
}
//# sourceMappingURL=lru-cache-events.d.ts.map