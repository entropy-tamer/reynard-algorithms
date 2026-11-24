/**
 * @file Deterministic correctness tests for the sorting algorithms that had
 * no direct test. Every sorter is checked against Array.prototype.sort on the
 * same input, plus edge cases and the comparators they share.
 */
import { describe, it, expect } from "vitest";
import {
  bubbleSort,
  insertionSort,
  binaryInsertionSort,
  quickSort,
  quickSort3Way,
  selectionSort,
  heapSort,
  mergeSort,
  adaptiveMergeSort,
  adaptiveQuickSort,
  smoothSort,
  bucketSort,
  countingSort,
  introSort,
  radixSort,
  shellSort,
  shellSortSedgewick,
  timSort,
  numericComparator,
  numericComparatorDesc,
  stringComparator,
  stringComparatorCaseInsensitive,
  reverseComparator,
  keyComparator,
  composeComparators,
} from "../../algorithms/sorting";
import type { Comparator, SortingResult } from "../../algorithms/sorting";

type Sorter = (values: number[], comparator: Comparator<number>, config: { recordSteps: boolean; calculateMetrics: boolean }) => SortingResult<number>;

const config = { recordSteps: false, calculateMetrics: false };
const byNumber: Comparator<number> = (a, b) => a - b;

const sorters: Array<[string, Sorter]> = [
  ["bubbleSort", bubbleSort],
  ["insertionSort", insertionSort],
  ["binaryInsertionSort", binaryInsertionSort],
  ["quickSort", quickSort],
  ["quickSort3Way", quickSort3Way],
  ["selectionSort", selectionSort],
  ["heapSort", heapSort],
  ["mergeSort", mergeSort],
  ["adaptiveMergeSort", adaptiveMergeSort],
  ["adaptiveQuickSort", adaptiveQuickSort],
  ["smoothSort", smoothSort],
  ["bucketSort", bucketSort],
  ["countingSort", countingSort],
  ["introSort", introSort],
  ["radixSort", radixSort],
  ["shellSort", shellSort],
  ["shellSortSedgewick", shellSortSedgewick],
  ["timSort", timSort],
];

function data(n: number, seed = 42): number[] {
  let s = seed >>> 0;
  return Array.from({ length: n }, () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return Math.floor((s / 0xffffffff) * 100);
  });
}

describe("sorting correctness", () => {
  describe.each(sorters)("%s", (_name, sort) => {
    it("matches Array.prototype.sort on integers with duplicates", () => {
      const input = data(64);
      const expected = [...input].sort(byNumber);
      const result = sort(input, byNumber, config);

      expect(result.sorted).toEqual(expected);
      expect(result.algorithm.length).toBeGreaterThan(0);
    });

    it("does not mutate the caller's array", () => {
      const input = data(32);
      const copy = [...input];
      sort(input, byNumber, config);
      expect(input).toEqual(copy);
    });
  });

  describe("edge cases", () => {
    const representatives: Array<[string, Sorter]> = [
      ["bubbleSort", bubbleSort],
      ["quickSort", quickSort],
      ["mergeSort", mergeSort],
      ["timSort", timSort],
    ];

    describe.each(representatives)("%s", (_name, sort) => {
      it("handles empty and singleton arrays", () => {
        expect(sort([], byNumber, config).sorted).toEqual([]);
        expect(sort([7], byNumber, config).sorted).toEqual([7]);
      });

      it("handles sorted, reverse-sorted and all-equal inputs", () => {
        expect(sort([1, 2, 3, 4, 5], byNumber, config).sorted).toEqual([1, 2, 3, 4, 5]);
        expect(sort([5, 4, 3, 2, 1], byNumber, config).sorted).toEqual([1, 2, 3, 4, 5]);
        expect(sort([3, 3, 3, 3], byNumber, config).sorted).toEqual([3, 3, 3, 3]);
      });
    });
  });

  describe("stability of the stable sorters", () => {
    interface Item {
      key: number;
      tag: number;
    }
    const compareKey = keyComparator<Item, "key">("key");
    const input: Item[] = [
      { key: 2, tag: 0 },
      { key: 1, tag: 1 },
      { key: 2, tag: 2 },
      { key: 1, tag: 3 },
    ];

    for (const [name, sort] of [
      ["bubbleSort", bubbleSort],
      ["insertionSort", insertionSort],
      ["mergeSort", mergeSort],
      ["timSort", timSort],
      ["adaptiveMergeSort", adaptiveMergeSort],
    ] as Array<[string, (values: Item[], comparator: Comparator<Item>, config: typeof config) => SortingResult<Item>]>) {
      it(`preserves insertion order of equal keys in ${name}`, () => {
        const sorted = sort([...input], compareKey, config).sorted;
        expect(sorted.map(item => item.tag)).toEqual([1, 3, 0, 2]);
      });
    }
  });
});

describe("sorting comparators", () => {
  it("numeric comparators order in both directions", () => {
    expect([3, 1, 2].sort(numericComparator)).toEqual([1, 2, 3]);
    expect([3, 1, 2].sort(numericComparatorDesc)).toEqual([3, 2, 1]);
  });

  it("string comparators handle case sensitivity", () => {
    expect(["b", "A", "a"].sort(stringComparator)).toEqual(["A", "a", "b"]);
    expect(["b", "A", "a"].sort(stringComparatorCaseInsensitive)).toEqual(["A", "a", "b"]);
  });

  it("reverseComparator inverts a base comparator", () => {
    expect([3, 1, 2].sort(reverseComparator(numericComparator))).toEqual([3, 2, 1]);
  });

  it("keyComparator compares an object field", () => {
    const items = [{ n: 2 }, { n: 1 }];
    expect(items.sort(keyComparator("n")).map(item => item.n)).toEqual([1, 2]);
  });

  it("composeComparators breaks ties with subsequent comparators", () => {
    const items = [
      { a: 1, b: 2 },
      { a: 1, b: 1 },
      { a: 0, b: 9 },
    ];
    const compare = composeComparators(keyComparator("a"), keyComparator("b"));
    expect(items.sort(compare)).toEqual([
      { a: 0, b: 9 },
      { a: 1, b: 1 },
      { a: 1, b: 2 },
    ]);
  });
});
