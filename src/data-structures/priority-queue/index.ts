/**
 * Priority Queue / Binary Heap Module
 *
 * Clean exports for the Priority Queue implementation.
 * Provides a complete priority queue with binary heap backing.
 *
 * @module algorithms/dataStructures/priorityQueue
 */

// Export core implementation
export { PriorityQueue } from "./priority-queue-core";

// Export all types and interfaces
export type {
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
  PriorityQueueIteratorResult,
} from "./priority-queue-types";
