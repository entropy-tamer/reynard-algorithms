/**
 * @file Priority Queue tests
 */
/* eslint-disable max-lines, max-lines-per-function */
import { describe, it, expect, beforeEach } from "vitest";
import { PriorityQueue, PriorityQueueComparator, PriorityQueueEvent } from "../../data-structures/basic/priority-queue";

describe("PriorityQueue", () => {
  let pq: PriorityQueue<number>;

  beforeEach(() => {
    pq = new PriorityQueue<number>();
  });

  describe("Mathematical Theory", () => {
    it("should maintain heap property after insertions", () => {
      // Test heap property: parent priority >= children priority (for max-heap)
      const maxHeap = new PriorityQueue<number>({ maxHeap: true });

      maxHeap.insert(10, 10);
      maxHeap.insert(20, 20);
      maxHeap.insert(5, 5);
      maxHeap.insert(15, 15);

      // Root should be highest priority (20)
      const peek = maxHeap.peek();
      expect(peek.priority).toBe(20);
      expect(peek.element).toBe(20);
    });

    it("should maintain heap property after extractions", () => {
      const maxHeap = new PriorityQueue<number>({ maxHeap: true });

      maxHeap.insert(10, 10);
      maxHeap.insert(20, 20);
      maxHeap.insert(5, 5);
      maxHeap.insert(15, 15);

      // Extract highest priority
      const extracted = maxHeap.extract();
      expect(extracted).toBe(20);

      // Next highest should be 15
      const nextPeek = maxHeap.peek();
      expect(nextPeek.priority).toBe(15);
    });

    it("should maintain binary tree structure", () => {
      // Insert elements and verify tree structure
      for (let i = 1; i <= 7; i++) {
        pq.insert(i, i);
      }

      const heap = pq.toArray();

      // Verify parent-child relationships
      // For min-heap: parent priority <= children priority
      for (let i = 0; i < heap.length; i++) {
        const parent = heap[i];
        if (!parent) continue;
        
        const leftChildIndex = 2 * i + 1;
        const rightChildIndex = 2 * i + 2;

        if (leftChildIndex < heap.length && heap[leftChildIndex]) {
          expect(parent.priority).toBeLessThanOrEqual(heap[leftChildIndex].priority);
        }
        if (rightChildIndex < heap.length && heap[rightChildIndex]) {
          expect(parent.priority).toBeLessThanOrEqual(heap[rightChildIndex].priority);
        }
      }
    });
  });

  describe("Core Operations", () => {
    describe("insert", () => {
      it("should insert elements with correct priorities", () => {
        pq.insert(10, 10);
        pq.insert(5, 5);
        pq.insert(15, 15);

        expect(pq.size()).toBe(3);
        expect(pq.isEmpty()).toBe(false);
      });

      it("should maintain min-heap property by default", () => {
        pq.insert(10, 10);
        pq.insert(5, 5);
        pq.insert(15, 15);

        const peek = pq.peek();
        expect(peek.priority).toBe(5);
        expect(peek.element).toBe(5);
      });

      it("should handle duplicate priorities", () => {
        pq.insert(10, 5);
        pq.insert(20, 5);
        pq.insert(30, 5);

        expect(pq.size()).toBe(3);
        // All have same priority, any can be at root
        const peek = pq.peek();
        expect(peek.priority).toBe(5);
      });

      it("should return true for successful insertions", () => {
        const result = pq.insert(10, 10);
        expect(result).toBe(true);
      });

      it("should return false when capacity is exceeded", () => {
        const limitedPQ = new PriorityQueue<number>({ maxCapacity: 2 });

        expect(limitedPQ.insert(1, 1)).toBe(true);
        expect(limitedPQ.insert(2, 2)).toBe(true);
        expect(limitedPQ.insert(3, 3)).toBe(false);
      });
    });

    describe("extract", () => {
      it("should extract elements in priority order", () => {
        pq.insert(10, 10);
        pq.insert(5, 5);
        pq.insert(15, 15);
        pq.insert(3, 3);

        expect(pq.extract()).toBe(3);
        expect(pq.extract()).toBe(5);
        expect(pq.extract()).toBe(10);
        expect(pq.extract()).toBe(15);
      });

      it("should return undefined for empty queue", () => {
        expect(pq.extract()).toBeUndefined();
      });

      it("should maintain heap property after extraction", () => {
        pq.insert(10, 10);
        pq.insert(5, 5);
        pq.insert(15, 15);
        pq.insert(3, 3);

        pq.extract(); // Remove 3

        const peek = pq.peek();
        expect(peek.priority).toBe(5);
      });

      it("should handle single element extraction", () => {
        pq.insert(42, 42);

        expect(pq.extract()).toBe(42);
        expect(pq.isEmpty()).toBe(true);
      });
    });

    describe("peek", () => {
      it("should return highest priority element without removing it", () => {
        pq.insert(10, 10);
        pq.insert(5, 5);
        pq.insert(15, 15);

        const peek1 = pq.peek();
        expect(peek1.priority).toBe(5);
        expect(peek1.element).toBe(5);
        expect(peek1.isEmpty).toBe(false);

        // Size should remain the same
        expect(pq.size()).toBe(3);

        const peek2 = pq.peek();
        expect(peek2.priority).toBe(5);
        expect(peek2.element).toBe(5);
      });

      it("should return empty result for empty queue", () => {
        const peek = pq.peek();
        expect(peek.isEmpty).toBe(true);
        expect(peek.element).toBeUndefined();
        expect(peek.priority).toBe(0);
      });
    });

    describe("size and isEmpty", () => {
      it("should return correct size", () => {
        expect(pq.size()).toBe(0);
        expect(pq.isEmpty()).toBe(true);

        pq.insert(1, 1);
        expect(pq.size()).toBe(1);
        expect(pq.isEmpty()).toBe(false);

        pq.insert(2, 2);
        expect(pq.size()).toBe(2);

        pq.extract();
        expect(pq.size()).toBe(1);

        pq.extract();
        expect(pq.size()).toBe(0);
        expect(pq.isEmpty()).toBe(true);
      });
    });

    describe("clear", () => {
      it("should remove all elements", () => {
        pq.insert(1, 1);
        pq.insert(2, 2);
        pq.insert(3, 3);

        expect(pq.size()).toBe(3);

        pq.clear();

        expect(pq.size()).toBe(0);
        expect(pq.isEmpty()).toBe(true);
        expect(pq.peek().isEmpty).toBe(true);
      });
    });
  });

  describe("Max-Heap Configuration", () => {
    let maxHeap: PriorityQueue<number>;

    beforeEach(() => {
      maxHeap = new PriorityQueue<number>({ maxHeap: true });
    });

    it("should maintain max-heap property", () => {
      maxHeap.insert(10, 10);
      maxHeap.insert(5, 5);
      maxHeap.insert(15, 15);

      const peek = maxHeap.peek();
      expect(peek.priority).toBe(15);
      expect(peek.element).toBe(15);
    });

    it("should extract highest priority first", () => {
      maxHeap.insert(10, 10);
      maxHeap.insert(5, 5);
      maxHeap.insert(15, 15);
      maxHeap.insert(20, 20);

      expect(maxHeap.extract()).toBe(20);
      expect(maxHeap.extract()).toBe(15);
      expect(maxHeap.extract()).toBe(10);
      expect(maxHeap.extract()).toBe(5);
    });
  });

  describe("Custom Comparator", () => {
    interface Task {
      name: string;
      priority: number;
      deadline: number;
    }

    const taskComparator: PriorityQueueComparator<Task> = (a, b) => {
      // Higher priority number = higher priority
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // Earlier deadline = higher priority
      return a.deadline - b.deadline;
    };

    let taskQueue: PriorityQueue<Task>;

    beforeEach(() => {
      taskQueue = new PriorityQueue<Task>({ comparator: taskComparator });
    });

    it("should use custom comparator for ordering", () => {
      taskQueue.insert({ name: "Task A", priority: 1, deadline: 100 }, 0);
      taskQueue.insert({ name: "Task B", priority: 3, deadline: 50 }, 0);
      taskQueue.insert({ name: "Task C", priority: 2, deadline: 75 }, 0);

      // Task B should be first (highest priority)
      const first = taskQueue.extract();
      expect(first?.name).toBe("Task B");

      // Task C should be second (same priority as A, but earlier deadline)
      const second = taskQueue.extract();
      expect(second?.name).toBe("Task C");

      // Task A should be last
      const third = taskQueue.extract();
      expect(third?.name).toBe("Task A");
    });
  });

  describe("Batch Operations", () => {
    it("should handle batch insertions", () => {
      const elements = [
        { data: 1, priority: 1 },
        { data: 2, priority: 2 },
        { data: 3, priority: 3 },
        { data: 4, priority: 4 },
      ];

      const result = pq.batchInsert(elements);

      expect(result.inserted).toHaveLength(4);
      expect(result.failed).toHaveLength(0);
      expect(result.total).toBe(4);
      expect(result.successRate).toBe(1);
      expect(pq.size()).toBe(4);
    });

    it("should handle partial batch failures", () => {
      const limitedPQ = new PriorityQueue<number>({ maxCapacity: 2 });

      const elements = [
        { data: 1, priority: 1 },
        { data: 2, priority: 2 },
        { data: 3, priority: 3 },
      ];

      const result = limitedPQ.batchInsert(elements);

      expect(result.inserted).toHaveLength(2);
      expect(result.failed).toHaveLength(1);
      expect(result.total).toBe(3);
      expect(result.successRate).toBe(2 / 3);
    });
  });

  describe("Statistics", () => {
    it("should track insertion statistics", () => {
      pq.insert(1, 1);
      pq.insert(2, 2);
      pq.insert(3, 3);

      const stats = pq.getStats();
      expect(stats.insertCount).toBe(3);
      expect(stats.size).toBe(3);
      expect(stats.maxSize).toBe(3);
      expect(stats.averageInsertTime).toBeGreaterThan(0);
    });

    it("should track extraction statistics", () => {
      pq.insert(1, 1);
      pq.insert(2, 2);
      pq.extract();
      pq.extract();

      const stats = pq.getStats();
      expect(stats.extractCount).toBe(2);
      expect(stats.size).toBe(0);
      expect(stats.averageExtractTime).toBeGreaterThan(0);
    });

    it("should track maximum size reached", () => {
      pq.insert(1, 1);
      pq.insert(2, 2);
      pq.insert(3, 3);
      pq.extract();
      pq.extract();

      const stats = pq.getStats();
      expect(stats.maxSize).toBe(3);
      expect(stats.size).toBe(1);
    });
  });

  describe("Event Handling", () => {
    it("should emit events when configured", () => {
      const events: PriorityQueueEvent<number>[] = [];
      const eventHandler = (event: PriorityQueueEvent<number>) => {
        events.push(event);
      };

      const eventPQ = new PriorityQueue<number>({ onEvent: eventHandler });

      eventPQ.insert(1, 1);
      eventPQ.extract();
      eventPQ.clear();

      expect(events).toHaveLength(3);
      expect(events[0].type).toBe("insert");
      expect(events[1].type).toBe("extract");
      expect(events[2].type).toBe("clear");
    });

    it("should include event metadata", () => {
      const events: PriorityQueueEvent<number>[] = [];
      const eventHandler = (event: PriorityQueueEvent<number>) => {
        events.push(event);
      };

      const eventPQ = new PriorityQueue<number>({ onEvent: eventHandler });

      eventPQ.insert(42, 10);

      expect(events[0].data).toBe(42);
      expect(events[0].priority).toBe(10);
      expect(events[0].timestamp).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle negative priorities", () => {
      pq.insert(1, -1);
      pq.insert(2, -2);
      pq.insert(3, -3);

      // -3 should be highest priority (lowest number)
      expect(pq.extract()).toBe(3);
      expect(pq.extract()).toBe(2);
      expect(pq.extract()).toBe(1);
    });

    it("should handle zero priority", () => {
      pq.insert(1, 0);
      pq.insert(2, 1);
      pq.insert(3, -1);

      // -1 should be highest priority
      expect(pq.extract()).toBe(3);
      expect(pq.extract()).toBe(1);
      expect(pq.extract()).toBe(2);
    });

    it("should handle very large numbers", () => {
      pq.insert(1, Number.MAX_SAFE_INTEGER);
      pq.insert(2, Number.MIN_SAFE_INTEGER);

      // MIN_SAFE_INTEGER should be higher priority
      expect(pq.extract()).toBe(2);
      expect(pq.extract()).toBe(1);
    });

    it("should handle empty queue operations", () => {
      expect(pq.extract()).toBeUndefined();
      expect(pq.peek().isEmpty).toBe(true);
      expect(pq.size()).toBe(0);
      expect(pq.isEmpty()).toBe(true);
    });
  });

  describe("Performance Benchmarks", () => {
    it("should handle large number of insertions efficiently", () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        pq.insert(i, Math.random() * 1000);
      }

      const insertTime = performance.now() - startTime;
      expect(insertTime).toBeLessThan(100); // Should complete in under 100ms
      expect(pq.size()).toBe(1000);
    });

    it("should handle large number of extractions efficiently", () => {
      // Insert elements first
      for (let i = 0; i < 1000; i++) {
        pq.insert(i, i);
      }

      const startTime = performance.now();

      while (!pq.isEmpty()) {
        pq.extract();
      }

      const extractTime = performance.now() - startTime;
      expect(extractTime).toBeLessThan(100); // Should complete in under 100ms
      expect(pq.isEmpty()).toBe(true);
    });

    it("should maintain performance with mixed operations", () => {
      const startTime = performance.now();

      // Mix of insertions and extractions
      for (let i = 0; i < 500; i++) {
        pq.insert(i, Math.random() * 1000);
        if (i % 2 === 0 && !pq.isEmpty()) {
          pq.extract();
        }
      }

      const mixedTime = performance.now() - startTime;
      expect(mixedTime).toBeLessThan(100); // Should complete in under 100ms
    });
  });

  describe("Integration", () => {
    it("should work with iterator", () => {
      pq.insert(3, 3);
      pq.insert(1, 1);
      pq.insert(2, 2);

      const elements: number[] = [];
      for (const element of pq) {
        elements.push(element);
      }

      expect(elements).toEqual([1, 2, 3]);
    });

    it("should work with toArray for debugging", () => {
      pq.insert(3, 3);
      pq.insert(1, 1);
      pq.insert(2, 2);

      const array = pq.toArray();
      expect(array).toHaveLength(3);

      // Should contain all elements (order may vary due to heap structure)
      const priorities = array.map(node => node.priority).sort();
      expect(priorities).toEqual([1, 2, 3]);
    });

    it("should maintain consistency across operations", () => {
      // Insert elements
      const elements = [5, 1, 9, 3, 7, 2, 8, 4, 6];
      for (const element of elements) {
        pq.insert(element, element);
      }

      // Extract all and verify order
      const extracted: number[] = [];
      while (!pq.isEmpty()) {
        extracted.push(pq.extract()!);
      }

      expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });
});
