/**
 * Insert must stay O(log n). The old implementation compared heap.length with
 * itself on every call and doubled the sparse array length in resize(), so the
 * capacity grew exponentially and a few dozen inserts took minutes.
 */
import { describe, expect, it } from "vitest";
import { PriorityQueue } from "../../data-structures/basic/priority-queue";

describe("PriorityQueue insertion scale", () => {
  it("inserts twenty thousand items without exponential reallocation", () => {
    const queue = new PriorityQueue<number>();
    const start = performance.now();
    let failed = 0;
    for (let i = 0; i < 20_000; i++) {
      if (!queue.insert(i, i % 97)) failed++;
    }
    expect(failed).toBe(0);
    const elapsed = performance.now() - start;
    expect(elapsed, `20000 inserts took ${elapsed.toFixed(1)}ms`).toBeLessThan(5_000);
    expect(queue.size()).toBe(20_000);
  });

  it("emits resize events a geometric number of times", () => {
    let resizes = 0;
    const queue = new PriorityQueue<number>({
      onEvent: (event) => {
        if (event.type === "resize") resizes++;
      },
    });
    for (let i = 0; i < 10_000; i++) queue.insert(i, i);
    expect(resizes).toBeLessThan(20);
  });
});
