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
import { PriorityQueueBatchResult, PriorityQueueNode, PriorityQueueOptions, PriorityQueuePeekResult, PriorityQueueStats } from "./priority-queue-types";
/**
 * Priority Queue / Binary Heap Implementation
 *
 * A complete priority queue implementation with comprehensive features including
 * performance monitoring, event handling, and batch operations.
 *
 * @template T - The type of data stored in the queue
 */
export declare class PriorityQueue<T> {
    private heap;
    private config;
    private stats;
    private comparator?;
    private eventHandler?;
    /**
     * Creates a new Priority Queue instance
     *
     * @param options - Configuration options for the priority queue
     * @example
     */
    constructor(options?: PriorityQueueOptions<T>);
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
    insert(data: T, priority: number): boolean;
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
    extract(): T | undefined;
    /**
     * Returns the highest priority element without removing it
     *
     * Time complexity: O(1)
     *
     * @returns Peek result with element, priority, and empty status
     * @example
     */
    peek(): PriorityQueuePeekResult<T>;
    /**
     * Returns the current size of the priority queue
     *
     * @returns Number of elements in the queue
     * @example
     */
    size(): number;
    /**
     * Checks if the priority queue is empty
     *
     * @returns True if the queue is empty
     * @example
     */
    isEmpty(): boolean;
    /**
     * Clears all elements from the priority queue
     * @example
     */
    clear(): void;
    /**
     * Inserts multiple elements in batch
     *
     * @param elements - Array of {data, priority} objects
     * @returns Batch operation result
     * @example
     */
    batchInsert(elements: Array<{
        data: T;
        priority: number;
    }>): PriorityQueueBatchResult<T>;
    /**
     * Returns performance statistics
     *
     * @returns Current statistics
     * @example
     */
    getStats(): PriorityQueueStats;
    /**
     * Returns the heap as an array (for debugging)
     *
     * @returns Copy of the internal heap array
     * @example
     */
    toArray(): PriorityQueueNode<T>[];
    /**
     * Creates an iterator for the priority queue
     *
     * @returns Iterator that yields elements in priority order
     * @example
     */
    [Symbol.iterator](): Iterator<T>;
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
    private bubbleUp;
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
    private bubbleDown;
    /**
     * Checks if element at index1 has higher priority than element at index2
     *
     * @param index1 - First element index
     * @param index2 - Second element index
     * @returns True if index1 has higher priority
     * @example
     */
    private hasHigherPriority;
    /**
     * Swaps two elements in the heap
     *
     * @param index1 - First element index
     * @param index2 - Second element index
     * @example
     */
    private swap;
    /**
     * Resizes the heap array when capacity is exceeded
     * @example
     */
    private resize;
    /**
     * Updates the average insertion time
     *
     * @param time - Time taken for insertion
     * @example
     */
    private updateAverageInsertTime;
    /**
     * Updates the average extraction time
     *
     * @param time - Time taken for extraction
     * @example
     */
    private updateAverageExtractTime;
    /**
     * Emits an event if event handler is configured
     *
     * @param type - Event type
     * @param data - Event data
     * @param priority - Event priority
     * @param metadata - Additional metadata
     * @example
     */
    private emitEvent;
}
//# sourceMappingURL=priority-queue-core.d.ts.map