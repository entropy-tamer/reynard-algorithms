/**
 * Priority Queue Types and Interfaces
 *
 * TypeScript interfaces and types for the Priority Queue / Binary Heap implementation.
 * Provides type safety for priority-based operations and heap management.
 *
 * @module algorithms/dataStructures/priorityQueueTypes
 */

/**
 * Priority Queue Node Interface
 *
 * Represents a single element in the priority queue with its associated priority.
 * The priority determines the order in which elements are processed.
 *
 * @template T - The type of data stored in the queue
 */
export interface PriorityQueueNode<T> {
  /** The data element */
  data: T;
  /** The priority value (lower values = higher priority) */
  priority: number;
}

/**
 * Priority Queue Configuration Options
 *
 * Configuration options for customizing the priority queue behavior.
 */
export interface PriorityQueueConfig {
  /** Initial capacity of the heap array */
  initialCapacity?: number;
  /** Whether to use a max-heap (true) or min-heap (false) */
  maxHeap?: boolean;
  /** Growth factor when resizing the heap */
  growthFactor?: number;
  /** Maximum capacity before throwing an error */
  maxCapacity?: number;
}

/**
 * Priority Queue Statistics
 *
 * Performance and usage statistics for the priority queue.
 */
export interface PriorityQueueStats {
  /** Total number of insertions */
  insertCount: number;
  /** Total number of extractions */
  extractCount: number;
  /** Total number of heap operations */
  heapifyCount: number;
  /** Current number of elements */
  size: number;
  /** Maximum size reached */
  maxSize: number;
  /** Average insertion time in milliseconds */
  averageInsertTime: number;
  /** Average extraction time in milliseconds */
  averageExtractTime: number;
}

/**
 * Priority Queue Iterator Result
 *
 * Result type for priority queue iteration operations.
 */
export interface PriorityQueueIteratorResult<T> {
  /** The data element */
  value: T;
  /** Whether this is the last element */
  done: boolean;
  /** The priority of the element */
  priority: number;
}

/**
 * Priority Queue Comparison Function
 *
 * Custom comparison function for priority queue elements.
 * Returns negative if a has higher priority than b, positive if b has higher priority than a, 0 if equal.
 *
 * @template T - The type of data being compared
 * @param a - First element
 * @param b - Second element
 * @returns Comparison result
 */
export type PriorityQueueComparator<T> = (a: T, b: T) => number;

/**
 * Priority Queue Event Types
 *
 * Events that can be emitted by the priority queue for monitoring and debugging.
 */
export type PriorityQueueEventType = "insert" | "extract" | "heapify" | "resize" | "clear";

/**
 * Priority Queue Event Data
 *
 * Data associated with priority queue events.
 */
export interface PriorityQueueEvent<T> {
  /** The type of event */
  type: PriorityQueueEventType;
  /** The timestamp of the event */
  timestamp: number;
  /** The data associated with the event (if applicable) */
  data?: T;
  /** The priority associated with the event (if applicable) */
  priority?: number;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Priority Queue Event Handler
 *
 * Function type for handling priority queue events.
 *
 * @template T - The type of data in the queue
 * @param event - The event data
 */
export type PriorityQueueEventHandler<T> = (event: PriorityQueueEvent<T>) => void;

/**
 * Priority Queue Options
 *
 * Extended options for priority queue creation with event handling.
 */
export interface PriorityQueueOptions<T> extends PriorityQueueConfig {
  /** Custom comparator function */
  comparator?: PriorityQueueComparator<T>;
  /** Event handler for queue events */
  onEvent?: PriorityQueueEventHandler<T>;
  /** Whether to enable performance monitoring */
  enableStats?: boolean;
}

/**
 * Priority Queue Peek Result
 *
 * Result type for peek operations that don't remove elements.
 */
export interface PriorityQueuePeekResult<T> {
  /** The highest priority element */
  element: T;
  /** The priority of the element */
  priority: number;
  /** Whether the queue is empty */
  isEmpty: boolean;
}

/**
 * Priority Queue Batch Operation Result
 *
 * Result type for batch operations on the priority queue.
 */
export interface PriorityQueueBatchResult<T> {
  /** Successfully inserted elements */
  inserted: T[];
  /** Elements that failed to insert */
  failed: T[];
  /** Total number of operations */
  total: number;
  /** Success rate (0-1) */
  successRate: number;
}
