/**
 * Priority Queue / Binary Heap Core Implementation
 *
 * A highly optimized priority queue implementation using a binary heap data structure.
 * Provides O(log n) insertion and extraction operations with O(1) peek operations.
 *
 * Mathematical Foundation:
 * - Binary heap property: parent priority >= children priority (max-heap) or parent priority <= children priority (min-heap)
 * - Heap height: h = floor(log₂(n)) where n is the number of elements
 * - Parent index: parent(i) = floor((i-1)/2)
 * - Left child index: left(i) = 2i + 1
 * - Right child index: right(i) = 2i + 2
 *
 * Time Complexity:
 * - Insert: O(log n)
 * - Extract: O(log n)
 * - Peek: O(1)
 * - Size: O(1)
 *
 * Space Complexity: O(n)
 *
 * @module algorithms/dataStructures/priorityQueueCore
 */

import {
  PriorityQueueNode,
  PriorityQueueConfig,
  PriorityQueueStats,
  PriorityQueueComparator,
  PriorityQueueOptions,
  PriorityQueuePeekResult,
  PriorityQueueBatchResult,
  PriorityQueueEvent,
  PriorityQueueEventType,
  PriorityQueueEventHandler,
} from "./priority-queue-types";

/**
 * Priority Queue / Binary Heap Implementation
 *
 * A complete priority queue implementation with comprehensive features including
 * performance monitoring, event handling, and batch operations.
 *
 * @template T - The type of data stored in the queue
 */
export class PriorityQueue<T> {
  private heap: PriorityQueueNode<T>[] = [];
  private config: Required<PriorityQueueConfig>;
  private stats: PriorityQueueStats;
  private comparator?: PriorityQueueComparator<T>;
  private eventHandler?: PriorityQueueEventHandler<T>;

  /**
   * Creates a new Priority Queue instance
   *
   * @param options - Configuration options for the priority queue
   * @example
   */
  constructor(options: PriorityQueueOptions<T> = {}) {
    this.config = {
      initialCapacity: options.initialCapacity ?? 16,
      maxHeap: options.maxHeap ?? false,
      growthFactor: options.growthFactor ?? 2,
      maxCapacity: options.maxCapacity ?? Number.MAX_SAFE_INTEGER,
    };

    this.comparator = options.comparator;
    this.eventHandler = options.onEvent;

    this.stats = {
      insertCount: 0,
      extractCount: 0,
      heapifyCount: 0,
      size: 0,
      maxSize: 0,
      averageInsertTime: 0,
      averageExtractTime: 0,
    };

    // Initialize heap with initial capacity
    this.heap = new Array(this.config.initialCapacity);
    this.heap.length = 0; // Set actual length to 0
  }

  /**
   * Inserts an element into the priority queue
   *
   * Mathematical Process:
   * 1. Add element to the end of the heap array
   * 2. Bubble up to maintain heap property: while parent has lower priority, swap with parent
   * 3. Time complexity: O(log n) where n is the number of elements
   *
   * @param data - The data to insert
   * @param priority - The priority of the data (lower = higher priority for min-heap)
   * @returns True if insertion was successful
   * @example
   */
  insert(data: T, priority: number): boolean {
    const startTime = performance.now();

    try {
      // Check capacity limits
      if (this.heap.length >= this.config.maxCapacity) {
        this.emitEvent("insert", data, priority, { error: "Capacity exceeded" });
        return false;
      }

      // Resize heap if necessary
      if (this.heap.length >= this.heap.length) {
        this.resize();
      }

      // Create new node
      const newNode: PriorityQueueNode<T> = { data, priority };

      // Add to end of heap
      this.heap.push(newNode);
      this.stats.size++;
      this.stats.maxSize = Math.max(this.stats.maxSize, this.stats.size);

      // Bubble up to maintain heap property
      this.bubbleUp(this.heap.length - 1);

      this.stats.insertCount++;
      this.updateAverageInsertTime(performance.now() - startTime);

      this.emitEvent("insert", data, priority);
      return true;
    } catch (error) {
      this.emitEvent("insert", data, priority, { error: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }

  /**
   * Extracts and returns the highest priority element
   *
   * Mathematical Process:
   * 1. Remove root element (highest priority)
   * 2. Move last element to root position
   * 3. Bubble down to maintain heap property: while children have higher priority, swap with highest priority child
   * 4. Time complexity: O(log n)
   *
   * @returns The highest priority element, or undefined if queue is empty
   * @example
   */
  extract(): T | undefined {
    const startTime = performance.now();

    if (this.isEmpty()) {
      return undefined;
    }

    // Get root element (highest priority)
    const root = this.heap[0];

    // Move last element to root
    const lastElement = this.heap.pop()!;
    this.stats.size--;

    if (!this.isEmpty()) {
      this.heap[0] = lastElement;
      // Bubble down to maintain heap property
      this.bubbleDown(0);
    }

    this.stats.extractCount++;
    this.updateAverageExtractTime(performance.now() - startTime);

    this.emitEvent("extract", root.data, root.priority);
    return root.data;
  }

  /**
   * Returns the highest priority element without removing it
   *
   * Time complexity: O(1)
   *
   * @returns Peek result with element, priority, and empty status
   * @example
   */
  peek(): PriorityQueuePeekResult<T> {
    if (this.isEmpty()) {
      return {
        element: undefined as any,
        priority: 0,
        isEmpty: true,
      };
    }

    const root = this.heap[0];
    return {
      element: root.data,
      priority: root.priority,
      isEmpty: false,
    };
  }

  /**
   * Returns the current size of the priority queue
   *
   * @returns Number of elements in the queue
   * @example
   */
  size(): number {
    return this.stats.size;
  }

  /**
   * Checks if the priority queue is empty
   *
   * @returns True if the queue is empty
   * @example
   */
  isEmpty(): boolean {
    return this.stats.size === 0;
  }

  /**
   * Clears all elements from the priority queue
   * @example
   */
  clear(): void {
    this.heap.length = 0;
    this.stats.size = 0;
    this.emitEvent("clear");
  }

  /**
   * Inserts multiple elements in batch
   *
   * @param elements - Array of {data, priority} objects
   * @returns Batch operation result
   * @example
   */
  batchInsert(elements: Array<{ data: T; priority: number }>): PriorityQueueBatchResult<T> {
    const inserted: T[] = [];
    const failed: T[] = [];

    for (const { data, priority } of elements) {
      if (this.insert(data, priority)) {
        inserted.push(data);
      } else {
        failed.push(data);
      }
    }

    return {
      inserted,
      failed,
      total: elements.length,
      successRate: inserted.length / elements.length,
    };
  }

  /**
   * Returns performance statistics
   *
   * @returns Current statistics
   * @example
   */
  getStats(): PriorityQueueStats {
    return { ...this.stats };
  }

  /**
   * Returns the heap as an array (for debugging)
   *
   * @returns Copy of the internal heap array
   * @example
   */
  toArray(): PriorityQueueNode<T>[] {
    return [...this.heap];
  }

  /**
   * Creates an iterator for the priority queue
   *
   * @returns Iterator that yields elements in priority order
   * @example
   */
  *[Symbol.iterator](): Iterator<T> {
    // Create a copy to avoid modifying the original queue
    const copy = new PriorityQueue<T>({ ...this.config, comparator: this.comparator });

    // Copy all elements
    for (const node of this.heap) {
      copy.insert(node.data, node.priority);
    }

    // Yield elements in priority order
    while (!copy.isEmpty()) {
      yield copy.extract()!;
    }
  }

  /**
   * Bubbles up an element to maintain heap property
   *
   * Mathematical Process:
   * - Compare element with parent
   * - If heap property is violated, swap with parent
   * - Continue until heap property is satisfied or element reaches root
   *
   * @param index - Index of element to bubble up
   * @example
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      if (this.hasHigherPriority(index, parentIndex)) {
        this.swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Bubbles down an element to maintain heap property
   *
   * Mathematical Process:
   * - Compare element with its children
   * - If heap property is violated, swap with highest priority child
   * - Continue until heap property is satisfied or element reaches leaf
   *
   * @param index - Index of element to bubble down
   * @example
   */
  private bubbleDown(index: number): void {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let highestPriorityIndex = index;

      // Check left child
      if (leftChild < this.heap.length && this.hasHigherPriority(leftChild, highestPriorityIndex)) {
        highestPriorityIndex = leftChild;
      }

      // Check right child
      if (rightChild < this.heap.length && this.hasHigherPriority(rightChild, highestPriorityIndex)) {
        highestPriorityIndex = rightChild;
      }

      if (highestPriorityIndex === index) {
        break;
      }

      this.swap(index, highestPriorityIndex);
      index = highestPriorityIndex;
    }
  }

  /**
   * Checks if element at index1 has higher priority than element at index2
   *
   * @param index1 - First element index
   * @param index2 - Second element index
   * @returns True if index1 has higher priority
   * @example
   */
  private hasHigherPriority(index1: number, index2: number): boolean {
    const node1 = this.heap[index1];
    const node2 = this.heap[index2];

    // Guard against undefined nodes
    if (!node1 || !node2) {
      return false;
    }

    if (this.comparator) {
      return this.comparator(node1.data, node2.data) < 0;
    }

    if (this.config.maxHeap) {
      return node1.priority > node2.priority;
    } else {
      return node1.priority < node2.priority;
    }
  }

  /**
   * Swaps two elements in the heap
   *
   * @param index1 - First element index
   * @param index2 - Second element index
   * @example
   */
  private swap(index1: number, index2: number): void {
    [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
  }

  /**
   * Resizes the heap array when capacity is exceeded
   * @example
   */
  private resize(): void {
    const newCapacity = Math.min(this.heap.length * this.config.growthFactor, this.config.maxCapacity);

    if (newCapacity > this.heap.length) {
      const newHeap = new Array(newCapacity);
      for (let i = 0; i < this.heap.length; i++) {
        newHeap[i] = this.heap[i];
      }
      this.heap = newHeap;
      this.emitEvent("resize", undefined, undefined, { newCapacity });
    }
  }

  /**
   * Updates the average insertion time
   *
   * @param time - Time taken for insertion
   * @example
   */
  private updateAverageInsertTime(time: number): void {
    this.stats.averageInsertTime =
      (this.stats.averageInsertTime * (this.stats.insertCount - 1) + time) / this.stats.insertCount;
  }

  /**
   * Updates the average extraction time
   *
   * @param time - Time taken for extraction
   * @example
   */
  private updateAverageExtractTime(time: number): void {
    this.stats.averageExtractTime =
      (this.stats.averageExtractTime * (this.stats.extractCount - 1) + time) / this.stats.extractCount;
  }

  /**
   * Emits an event if event handler is configured
   *
   * @param type - Event type
   * @param data - Event data
   * @param priority - Event priority
   * @param metadata - Additional metadata
   * @example
   */
  private emitEvent(type: PriorityQueueEventType, data?: T, priority?: number, metadata?: Record<string, any>): void {
    if (this.eventHandler) {
      const event: PriorityQueueEvent<T> = {
        type,
        timestamp: performance.now(),
        data,
        priority,
        metadata,
      };
      this.eventHandler(event);
    }
  }
}
