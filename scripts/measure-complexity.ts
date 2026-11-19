/**
 * Real scaling measurements for the complexity registry.
 *
 * Input construction happens in `make(n)`, outside the timed region, so the
 * numbers describe the algorithm rather than array allocation. Each call is
 * warmed once and the smallest of three runs is recorded. Output is one JSON
 * file per registry entry, in the shape `observe-scaling` consumes.
 *
 *   pnpm exec tsx scripts/measure-complexity.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { resolve } from "node:path";

import { adaptiveMergeSort } from "../src/algorithms/sorting/adaptive/adaptive-merge-sort.ts";
import { adaptiveQuickSort } from "../src/algorithms/sorting/adaptive/adaptive-quick-sort.ts";
import { smoothSort } from "../src/algorithms/sorting/adaptive/smooth-sort.ts";
import { bubbleSort } from "../src/algorithms/sorting/classical/bubble-sort.ts";
import { heapSort } from "../src/algorithms/sorting/classical/heap-sort.ts";
import { insertionSort } from "../src/algorithms/sorting/classical/insertion-sort.ts";
import { mergeSort } from "../src/algorithms/sorting/classical/merge-sort.ts";
import { quickSort } from "../src/algorithms/sorting/classical/quick-sort.ts";
import { selectionSort } from "../src/algorithms/sorting/classical/selection-sort.ts";
import { bucketSort } from "../src/algorithms/sorting/extensive/bucket-sort.ts";
import { countingSort } from "../src/algorithms/sorting/extensive/counting-sort.ts";
import { introSort } from "../src/algorithms/sorting/extensive/intro-sort.ts";
import { radixSort } from "../src/algorithms/sorting/extensive/radix-sort.ts";
import { shellSort } from "../src/algorithms/sorting/extensive/shell-sort.ts";
import { timSort } from "../src/algorithms/sorting/extensive/tim-sort.ts";
import { MixedRadixFFT } from "../src/algorithms/signal-processing/fft/mixed-radix-fft.ts";
import { Radix2FFT } from "../src/algorithms/signal-processing/fft/radix2-fft.ts";
import { Radix4FFT } from "../src/algorithms/signal-processing/fft/radix4-fft.ts";
import { RealFFT } from "../src/algorithms/signal-processing/fft/real-fft.ts";
import { LRUCache } from "../src/data-structures/basic/lru-cache/lru-cache-core.ts";
import { PriorityQueue } from "../src/data-structures/basic/priority-queue/priority-queue-core.ts";
import { Trie } from "../src/data-structures/basic/trie/trie-core.ts";
import { UnionFind } from "../src/data-structures/basic/union-find/union-find-core.ts";
import { Quadtree } from "../src/data-structures/spatial/quadtree/quadtree-core.ts";
import { FenwickTree } from "../src/data-structures/trees/fenwick-tree/fenwick-tree-core.ts";
import { SegmentTree } from "../src/data-structures/trees/segment-tree/segment-tree-core.ts";

const OUT = resolve(
    process.env.MEASUREMENTS_OUT ??
        `${process.env.HOME ?? "/home/kade"}/src/foxtools/registry/algorithms/observations/measurements`,
);
const SMALL = Number(process.env.MEASURE_N ?? 250);
// Comma-separated multipliers of SMALL. The default "1,4" reproduces the
// original two-point measurement; "1,2,4,8" yields three adjacent slopes.
const SCALES = (process.env.MEASURE_SCALES ?? "1,4")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);
if (SCALES.length < 2) throw new Error("MEASURE_SCALES needs at least two positive multipliers");
const REPEATS = Number(process.env.MEASURE_REPEATS ?? 3);
const PREFIX = process.env.MEASURE_DATE_PREFIX ?? "2026-11-19";

type Task = { id: string; workload: string; make: (n: number) => () => void };

function seeded(n: number, seed = 1): number[] {
    let state = seed;
    return Array.from({ length: n }, () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0xffffffff;
    });
}

function once(call: () => void): number {
    const start = performance.now();
    call();
    return performance.now() - start;
}

/**
 * Interleave every size. A loaded box drifts enough to invert a comparison
 * when one size is measured in one burst and the others in the next; rotating
 * the order each round and keeping the minimum per size is the repo's A/B
 * discipline. With two sizes and three rounds this reproduces the original
 * small/large, large/small, small/large sequence.
 */
function measureSet(calls: Array<() => void>): number[] {
    for (const call of calls) call();
    const best = calls.map(() => Number.POSITIVE_INFINITY);
    for (let round = 0; round < REPEATS; round++) {
        for (let offset = 0; offset < calls.length; offset++) {
            const i = (offset + round) % calls.length;
            best[i] = Math.min(best[i]!, once(calls[i]!));
        }
    }
    return best;
}

/** log(t2/t1) / log(n2/n1): ~1 linear, ~1.1-1.3 n log n, ~2 quadratic. */
function slopes(samples: Array<{ n: number; time_ms: number }>): Array<{
    from_n: number;
    to_n: number;
    slope: number;
}> {
    return samples.slice(1).map((current, index) => {
        const previous = samples[index]!;
        const from = Math.max(previous.time_ms, 1e-9);
        const to = Math.max(current.time_ms, 1e-9);
        return {
            from_n: previous.n,
            to_n: current.n,
            slope: Math.log(to / from) / Math.log(current.n / previous.n),
        };
    });
}

const sortConfig = { recordSteps: false, calculateMetrics: false };
const compare = (a: number, b: number) => a - b;
type Sorter = (data: number[], cmp: (a: number, b: number) => number, cfg: typeof sortConfig) => unknown;

const sortSpecs: readonly [string, string, Sorter][] = [
    ["sorting-classical-bubble-sort", "bubble-sort", bubbleSort],
    ["sorting-classical-heap-sort", "heap-sort", heapSort],
    ["sorting-classical-insertion-sort", "insertion-sort", insertionSort],
    ["sorting-classical-merge-sort", "merge-sort", mergeSort],
    ["sorting-classical-quick-sort", "quick-sort", quickSort],
    ["sorting-classical-selection-sort", "selection-sort", selectionSort],
    ["sorting-adaptive-adaptive-merge-sort", "adaptive-merge-sort", adaptiveMergeSort],
    ["sorting-adaptive-adaptive-quick-sort", "adaptive-quick-sort", adaptiveQuickSort],
    ["sorting-adaptive-smooth-sort", "smooth-sort", smoothSort],
    ["sorting-extensive-bucket-sort", "bucket-sort", bucketSort],
    ["sorting-extensive-counting-sort", "counting-sort", countingSort],
    ["sorting-extensive-intro-sort", "intro-sort", introSort],
    ["sorting-extensive-radix-sort", "radix-sort", radixSort],
    ["sorting-extensive-shell-sort", "shell-sort", shellSort],
    ["sorting-extensive-tim-sort", "tim-sort", timSort],
];

const sortTasks: Task[] = sortSpecs.map(([id, name, fn]) => ({
    id,
    workload: `random float array, ${name}, ascending comparator`,
    make: (n) => {
        const base = name === "counting-sort"
            ? Array.from({ length: n }, (_, i) => (i * 7919) % 1000)
            : seeded(n);
        return () => void fn([...base], compare, sortConfig);
    },
}));

type FFTClass = new (config: { size: number }) => { forward(input: Float32Array): unknown };
const fftSpecs: readonly [string, FFTClass][] = [
    ["fft-radix2", Radix2FFT as FFTClass],
    ["fft-radix4", Radix4FFT as FFTClass],
    ["fft-mixed-radix", MixedRadixFFT as FFTClass],
    ["fft-real", RealFFT as FFTClass],
];

const fftTasks: Task[] = fftSpecs.map(([id, Ctor]) => ({
    id,
    workload: "forward transform of a real-valued signal",
    make: (n) => {
        const base = id === "fft-radix4" ? 4 : 2;
        const size = base ** Math.round(Math.log(n) / Math.log(base));
        const input = new Float32Array(size);
        return () => void new Ctor({ size }).forward(input);
    },
}));

const dataStructureTasks: Task[] = [
    {
        id: "ds-basic-priority-queue",
        workload: "n inserts into one queue",
        make: (n) => {
            const priorities = Array.from({ length: n }, (_, i) => i % 97);
            return () => {
                const queue = new PriorityQueue<number>();
                for (let i = 0; i < n; i++) queue.insert(i, priorities[i]!);
            };
        },
    },
    {
        id: "ds-basic-lru-cache",
        workload: "n sets then n gets on one cache",
        make: (n) => {
            const keys = Array.from({ length: n }, (_, i) => `k${i}`);
            return () => {
                const cache = new LRUCache<string, number>({
                    maxSize: n * 2,
                    enableCleanup: false,
                    enableStats: false,
                });
                for (const key of keys) cache.set(key, 1);
                for (const key of keys) void cache.get(key);
            };
        },
    },
    {
        id: "ds-basic-trie",
        workload: "n string inserts then n searches",
        make: (n) => {
            const words = Array.from({ length: n }, (_, i) => `word${i}`);
            return () => {
                const trie = new Trie();
                for (const word of words) trie.insert(word);
                for (const word of words) void trie.search(word);
            };
        },
    },
    {
        id: "ds-basic-union-find",
        workload: "n-1 unions on n elements",
        make: (n) => () => {
            const uf = new UnionFind(n);
            for (let i = 1; i < n; i++) uf.union(i, i - 1);
        },
    },
    {
        id: "ds-trees-fenwick-tree",
        workload: "n point sets then one prefix query",
        make: (n) => () => {
            const tree = new FenwickTree();
            for (let i = 0; i < n; i++) tree.set(i, 1);
            void tree.query(n - 1);
        },
    },
    {
        id: "ds-trees-segment-tree",
        workload: "n point sets then one range query",
        make: (n) => () => {
            const tree = new SegmentTree<number>();
            for (let i = 0; i < n; i++) tree.set(i, i);
            void tree.query(0, n - 1);
        },
    },
    {
        id: "ds-spatial-quadtree",
        workload: "n uniform random points in a fixed square",
        make: (n) => {
            const xs = seeded(n);
            return () => {
                const tree = new Quadtree<[number, number]>({
                    x: 0, y: 0, width: 100, height: 100,
                });
                for (let i = 0; i < n; i++) {
                    tree.insert(
                        [xs[i]!, xs[(i + 1) % n]!],
                        { x: xs[i]! * 100, y: xs[(i + 1) % n]! * 100 },
                    );
                }
            };
        },
    },
];

mkdirSync(OUT, { recursive: true });
const filter = process.env.MEASURE_FILTER ?? "";
// No skips: the instrumentation copy and the PriorityQueue capacity bug were
// both fixed on 2026-11-19, so every bounded entry now has a real measurement.
const SKIP = new Set<string>();
let written = 0;
for (const task of [...sortTasks, ...fftTasks, ...dataStructureTasks]) {
    if (filter && !task.id.includes(filter)) continue;
    if (SKIP.has(task.id)) {
        console.log(`SKIP ${task.id}: insert() reallocates exponentially (registry caveat)`);
        continue;
    }
    try {
        const calls = SCALES.map((scale) => task.make(SMALL * scale));
        const times = measureSet(calls);
        const samples = SCALES.map((scale, i) => ({ n: SMALL * scale, time_ms: times[i]! }));
        const derived = slopes(samples);
        writeFileSync(
            resolve(OUT, `${PREFIX}-${task.id}-scaling.json`),
            `${JSON.stringify({ entry: task.id, workload: task.workload, samples, slopes: derived }, null, 2)}\n`,
        );
        written++;
        const points = samples.map((s) => `${s.n}=${s.time_ms.toFixed(3)}ms`).join(" ");
        const gradient = derived.map((s) => `${s.from_n}->${s.to_n}:${s.slope.toFixed(2)}`).join(" ");
        console.log(`${task.id}: ${points} slopes[${gradient}]`);
    } catch (error) {
        console.error(`SKIP ${task.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
}
console.log(`wrote ${written} measurement files to ${OUT}`);
