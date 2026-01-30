/**
 * LRU Cache Event Management
 *
 * Handles event emission for cache operations (get, set, delete, evict, etc.).
 *
 * @module algorithms/dataStructures/lruCacheEvents
 */

import { LRUCacheEvent, LRUCacheEventType, LRUCacheEventHandler } from "./lru-cache-types";

/**
 * Event manager for LRU cache
 */
export class LRUCacheEventManager<K, V> {
  private eventHandler: LRUCacheEventHandler<K, V> | undefined;
  private onEvict: ((key: K, value: V) => void) | undefined;
  private onAccess: ((key: K, value: V) => void) | undefined;
  private onSet: ((key: K, value: V) => void) | undefined;
  private onDelete: ((key: K, value: V) => void) | undefined;

  /**
   *
   * @param eventHandler
   * @param onEvict
   * @param onAccess
   * @param onSet
   * @param onDelete
   * @example
   */
  constructor(
    eventHandler?: LRUCacheEventHandler<K, V>,
    onEvict?: (key: K, value: V) => void,
    onAccess?: (key: K, value: V) => void,
    onSet?: (key: K, value: V) => void,
    onDelete?: (key: K, value: V) => void
  ) {
    this.eventHandler = eventHandler;
    this.onEvict = onEvict;
    this.onAccess = onAccess;
    this.onSet = onSet;
    this.onDelete = onDelete;
  }

  /**
   * Emits an event if event handler is configured
   *
   * @param type - Event type
   * @param key - Event key
   * @param value - Event value
   * @param metadata - Additional metadata
   * @example
   */
  emitEvent(type: LRUCacheEventType, key?: K, value?: V, metadata?: Record<string, any>): void {
    const event: LRUCacheEvent<K, V> = {
      type,
      timestamp: Date.now(),
      ...(key !== undefined && { key }),
      ...(value !== undefined && { value }),
      ...(metadata !== undefined && { metadata }),
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
}
