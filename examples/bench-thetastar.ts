/**
 * @file Benchmark comparison between ThetaStar and OptimizedThetaStar algorithms
 */
/* eslint-disable max-lines-per-function */

import { performance } from "node:perf_hooks";
import { ThetaStar } from "../src/algorithms/pathfinding/theta-star/theta-star-core";
import { OptimizedThetaStar } from "../src/algorithms/pathfinding/theta-star/theta-star-optimized";

type CellType = 0 | 1 | 2 | 3;

type Point = { x: number; y: number };

/**
 * Linear congruential generator for deterministic random numbers
 *
 * @param seed - Initial seed value
 * @returns Function that returns next random number [0, 1)
 * @example
 * const rng = lcg(12345);
 * const value = rng(); // Returns deterministic random value
 */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => (s = (1664525 * s + 1013904223) >>> 0) / 0xffffffff;
}

/**
 * Generate a random grid with obstacles for pathfinding tests
 *
 * @param width - Grid width in cells
 * @param height - Grid height in cells
 * @param obstacleProb - Probability of obstacle in each cell (0-1)
 * @param seed - Random seed for reproducible grids
 * @returns Array of cell types (0=free, 1=obstacle)
 * @example
 * const grid = generateGrid(100, 100, 0.2, 42);
 * // Creates a 100x100 grid with ~20% obstacles
 */
function generateGrid(width: number, height: number, obstacleProb: number, seed: number): CellType[] {
  const rand = lcg(seed);
  const grid = new Array<CellType>(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const r = rand();
      grid[y * width + x] = r < obstacleProb ? 1 : 0;
    }
  }
  // Ensure start and goal are free
  grid[0] = 0;
  grid[width * height - 1] = 0;
  return grid;
}

/**
 * Calculate median value from array of numbers
 *
 * @param values - Array of numeric values
 * @returns Median value
 * @example
 * const med = median([1, 3, 5, 7, 9]); // Returns 5
 */
function median(values: number[]): number {
  const arr = [...values].sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

/**
 * Run benchmark case comparing base and optimized ThetaStar
 *
 * @param width - Grid width
 * @param height - Grid height
 * @param obstacleProb - Obstacle probability
 * @param repeats - Number of test iterations
 * @returns Performance metrics for both implementations
 * @example
 * const results = await runCase(100, 100, 0.2, 5);
 */
async function runCase(width: number, height: number, obstacleProb: number, repeats: number) {
  const start: Point = { x: 0, y: 0 };
  const goal: Point = { x: width - 1, y: height - 1 };
  const base = new ThetaStar();
  const opt = new OptimizedThetaStar();

  const baseTimes: number[] = [];
  const optTimes: number[] = [];

  const innerIters = 20;
  for (let i = 0; i < repeats; i++) {
    const grid = generateGrid(width, height, obstacleProb, 42 + i);

    // warmup path to stabilize
    base.findPath(grid, width, height, start, goal);
    opt.findPath(grid, width, height, start, goal);

    const t1 = performance.now();
    let r1: { found: boolean } | null = null;
    for (let k = 0; k < innerIters; k++) {
      r1 = base.findPath(grid, width, height, start, goal);
    }
    const t2 = performance.now();
    baseTimes.push((t2 - t1) / innerIters);

    const t3 = performance.now();
    let r2: { found: boolean } | null = null;
    for (let k = 0; k < innerIters; k++) {
      r2 = opt.findPath(grid, width, height, start, goal);
    }
    const t4 = performance.now();
    optTimes.push((t4 - t3) / innerIters);

    // Basic correctness sanity
    if (!r1?.found && !r2?.found) {
      // both failed, acceptable in dense grids
    }
  }

  return {
    baseMedianMs: median(baseTimes),
    optMedianMs: median(optTimes),
    baseMeanMs: baseTimes.reduce((a, b) => a + b, 0) / baseTimes.length,
    optMeanMs: optTimes.reduce((a, b) => a + b, 0) / optTimes.length,
  };
}

/**
 * Main benchmark function that runs all test cases and prints results
 *
 * @example
 * await main();
 * // Outputs formatted table with benchmark results
 */
async function main() {
  const cases = [
    { w: 100, h: 100, p: 0.2, r: 7 },
    { w: 200, h: 200, p: 0.2, r: 5 },
    { w: 300, h: 300, p: 0.2, r: 3 },
    { w: 400, h: 400, p: 0.2, r: 2 },
    { w: 200, h: 200, p: 0.4, r: 4 },
    { w: 600, h: 600, p: 0.25, r: 1 },
  ];

  const rows: Array<{
    size: string;
    density: string;
    baseMedianMs: number;
    optMedianMs: number;
    baseMeanMs: number;
    optMeanMs: number;
    speedup: number;
  }> = [];

  for (const c of cases) {
    const res = await runCase(c.w, c.h, c.p, c.r);
    const speedup = res.baseMedianMs / res.optMedianMs;
    rows.push({
      size: `${c.w}x${c.h}`,
      density: `${Math.round(c.p * 100)}%`,
      baseMedianMs: Number(res.baseMedianMs.toFixed(2)),
      optMedianMs: Number(res.optMedianMs.toFixed(2)),
      baseMeanMs: Number(res.baseMeanMs.toFixed(2)),
      optMeanMs: Number(res.optMeanMs.toFixed(2)),
      speedup: Number(speedup.toFixed(2)),
    });
  }

  // Print table
  const pad = (s: string, n: number) => s.padEnd(n);
  console.log("\nTheta* Benchmark (ms)");
  console.log(
    pad("Size", 10),
    pad("Obstacle", 10),
    pad("BaseMed", 10),
    pad("OptMed", 10),
    pad("BaseMean", 10),
    pad("OptMean", 10),
    pad("Speedup", 8)
  );
  for (const r of rows) {
    console.log(
      pad(r.size, 10),
      pad(r.density, 10),
      pad(r.baseMedianMs.toString(), 10),
      pad(r.optMedianMs.toString(), 10),
      pad(r.baseMeanMs.toString(), 10),
      pad(r.optMeanMs.toString(), 10),
      pad(`${r.speedup}x`, 8)
    );
  }
}

main();
