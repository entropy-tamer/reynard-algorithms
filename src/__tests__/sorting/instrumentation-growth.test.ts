/**
 * The typed bound must describe the shipping implementation, not just the
 * algorithm. StateTracker.updateArray used to copy the whole array on every
 * swap even with recordSteps false, making heap sort grow quadratically.
 */
import { describe, expect, it } from "vitest";
import { heapSort } from "../../algorithms/sorting/classical/heap-sort";
import { mergeSort } from "../../algorithms/sorting/classical/merge-sort";

const config = { recordSteps: false, calculateMetrics: false };
const compare = (a: number, b: number) => a - b;

function data(n: number): number[] {
  let state = 1;
  return Array.from({ length: n }, () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  });
}

function elapsed(sort: (values: number[]) => void): number {
  const start = performance.now();
  sort();
  return performance.now() - start;
}

describe("sorting without step recording", () => {
  it("keeps heap sort near n log n growth", () => {
    const small = data(250);
    const large = data(1000);
    const run = (values: number[]) => () => void heapSort([...values], compare, config);

    run(small)();
    run(large)();
    let smallMs = Number.POSITIVE_INFINITY;
    let largeMs = Number.POSITIVE_INFINITY;
    for (let round = 0; round < 3; round++) {
      smallMs = Math.min(smallMs, elapsed(run(small)));
      largeMs = Math.min(largeMs, elapsed(run(large)));
    }

    expect(largeMs / smallMs, `250=${smallMs}ms 1000=${largeMs}ms`).toBeLessThan(12);
  });

  it("keeps merge sort near n log n growth", () => {
    const small = data(250);
    const large = data(1000);
    const run = (values: number[]) => () => void mergeSort([...values], compare, config);

    run(small)();
    run(large)();
    let smallMs = Number.POSITIVE_INFINITY;
    let largeMs = Number.POSITIVE_INFINITY;
    for (let round = 0; round < 3; round++) {
      smallMs = Math.min(smallMs, elapsed(run(small)));
      largeMs = Math.min(largeMs, elapsed(run(large)));
    }

    expect(largeMs / smallMs, `250=${smallMs}ms 1000=${largeMs}ms`).toBeLessThan(12);
  });
});
