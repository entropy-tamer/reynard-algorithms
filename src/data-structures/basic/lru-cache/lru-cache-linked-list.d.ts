/**
 * LRU Cache Linked List Operations
 *
 * Doubly-linked list management for LRU cache node positioning.
 * Handles all operations related to maintaining the access order.
 *
 * @module algorithms/dataStructures/lruCacheLinkedList
 */
import { LRUCacheNode } from "./lru-cache-types";
/**
 * Linked list operations for LRU cache
 */
export declare class LRUCacheLinkedList<K, V> {
    private head;
    private tail;
    /**
     * Gets the head node (most recently used)
     * @example
     */
    getHead(): LRUCacheNode<K, V> | null;
    /**
     * Gets the tail node (least recently used)
     * @example
     */
    getTail(): LRUCacheNode<K, V> | null;
    /**
     * Moves a node to the head of the doubly-linked list
     *
     * @param node - The node to move
     * @example
     */
    moveToHead(node: LRUCacheNode<K, V>): void;
    /**
     * Adds a node to the head of the doubly-linked list
     *
     * @param node - The node to add
     * @example
     */
    addToHead(node: LRUCacheNode<K, V>): void;
    /**
     * Removes a node from the doubly-linked list
     *
     * @param node - The node to remove
     * @example
     */
    removeNode(node: LRUCacheNode<K, V>): void;
    /**
     * Evicts the least recently used item (tail of the list)
     *
     * @returns The evicted node, or null if list is empty
     * @example
     */
    evictTail(): LRUCacheNode<K, V> | null;
    /**
     * Clears the entire linked list
     * @example
     */
    clear(): void;
}
//# sourceMappingURL=lru-cache-linked-list.d.ts.map