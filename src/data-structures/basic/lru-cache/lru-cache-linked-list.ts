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
export class LRUCacheLinkedList<K, V> {
  private head: LRUCacheNode<K, V> | null = null;
  private tail: LRUCacheNode<K, V> | null = null;

  /**
   * Gets the head node (most recently used)
   */
  getHead(): LRUCacheNode<K, V> | null {
    return this.head;
  }

  /**
   * Gets the tail node (least recently used)
   */
  getTail(): LRUCacheNode<K, V> | null {
    return this.tail;
  }

  /**
   * Moves a node to the head of the doubly-linked list
   *
   * @param node - The node to move
   */
  moveToHead(node: LRUCacheNode<K, V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  /**
   * Adds a node to the head of the doubly-linked list
   *
   * @param node - The node to add
   */
  addToHead(node: LRUCacheNode<K, V>): void {
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
  removeNode(node: LRUCacheNode<K, V>): void {
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
   *
   * @returns The evicted node, or null if list is empty
   */
  evictTail(): LRUCacheNode<K, V> | null {
    if (!this.tail) {
      return null;
    }

    const evicted = this.tail;
    this.removeNode(evicted);
    return evicted;
  }

  /**
   * Clears the entire linked list
   */
  clear(): void {
    this.head = null;
    this.tail = null;
  }
}












