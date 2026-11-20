/**
 * Regression for the StateTracker fix: with step recording off, updateArray
 * must keep a reference to the working array instead of copying the whole
 * array on every swap. The old copy made comparison sorts quadratic in
 * practice even though their typed getComplexity() returns n log n.
 *
 * The deterministic identity assertion is the guard. Timing is reported as a
 * loose sanity check only: a shared CI host scales both sizes together and a
 * single 4x ratio is not a verdict.
 */
import { describe, expect, it } from "vitest";
import { StateTracker } from "../../algorithms/sorting/utils/state-tracker";
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

function slopeFor(sort: (values: number[]) => void): { small: number; large: number; slope: number } {
  const small = data(1000);
  const large = data(4000);
  const run = (values: number[]) => () => void sort([...values]);
  run(small)();
  run(large)();
  const median = (values: number[]) => values.sort((a, b) => a - b)[1]!;
  const smallSamples: number[] = [];
  const largeSamples: number[] = [];
  for (let i = 0; i < 3; i++) {
    for (const [samples, call] of [[smallSamples, run(small)], [largeSamples, run(large)]] as const) {
      const t0 = performance.now();
      call();
      samples.push(performance.now() - t0);
    }
  }
  const smallMs = median(smallSamples);
  const largeMs = median(largeSamples);
  return {
    small: smallMs,
    large: largeMs,
    slope: Math.log(largeMs / smallMs) / Math.log(4),
  };
}

describe("sorting instrumentation without step recording", () => {
  it("keeps a reference instead of copying the working array", () => {
    const tracker = new StateTracker<number>([], compare, config);
    const working = [1, 2, 3];
    tracker.updateArray(working);
    expect(tracker.getCurrentState().array).toBe(working);
  });

  it("copies when step recording is on, so earlier snapshots stay stable", () => {
    const tracker = new StateTracker<number>([], compare, { recordSteps: true, calculateMetrics: false });
    const working = [1, 2, 3];
    tracker.updateArray(working);
    expect(tracker.getCurrentState().array).not.toBe(working);
    expect(tracker.getCurrentState().array).toEqual(working);
  });

  it("keeps heap and merge sort growth sane", () => {
    for (const [name, sort] of [["heap", heapSort], ["merge", mergeSort]] as const) {
      const { small, large, slope } = slopeFor((values) => sort(values, compare, config));
      expect(slope, `${name}: 1000=${small}ms 4000=${large}ms slope=${slope}`).toBeLessThan(2.5);
    }
  });
});
