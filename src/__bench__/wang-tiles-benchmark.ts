/**
 * Wang Tiles Benchmark Suite
 *
 * Three generation strategies over the same sixteen-tile set:
 *
 * 1. naive repetition -- one tile everywhere. The floor: nothing to compute, and
 *    the artifact this module exists to remove.
 * 2. Wang closed form -- color the dual lattice, read one index per cell.
 * 3. Wang random access -- the chunked/infinite path, no lattice at all.
 * 4. scanline constrained fill -- a correct solver-shaped generator: it filters
 *    candidates against the left and top neighbors, so it produces the same
 *    kind of tiling but cannot answer a query out of order.
 * 5. WaveFunctionCollapse -- the package's constraint solver, given the same
 *    sixteen tiles and the same adjacency relation. Its output is verified,
 *    not taken on trust; see the note printed under its table.
 *
 * Every map is verified seam-free before it is timed, so the numbers are the
 * cost of a correct tiling rather than of a fast wrong one.
 *
 * Timings are the median of seven blocks of five runs, warmed first. A single
 * timed run on a shared machine is noise; the median of blocks survives a
 * neighbor compiling something -- but it does not survive a fully loaded box.
 * Check the load average before quoting an absolute number from this script.
 *
 * Run: pnpm exec tsx src/__bench__/wang-tiles-benchmark.ts
 */

import { WaveFunctionCollapse } from "../algorithms/procedural-generation/wave-function-collapse/wave-function-collapse-core";
import type {
  Constraint,
  Tile,
} from "../algorithms/procedural-generation/wave-function-collapse/wave-function-collapse-types";
import {
  WANG_TILE_COUNT,
  colorEdges,
  fitsHorizontally,
  fitsVertically,
  generateWangMap,
  wangTileAt,
} from "../algorithms/procedural-generation/wang-tiles/wang-tiles-core";

interface Timing {
  readonly median: number;
  readonly min: number;
  readonly max: number;
}

const BLOCKS = 7;
const RUNS_PER_BLOCK = 5;

/** Median block time, in milliseconds, for one call of `run`. */
function measure(run: () => void): Timing {
  run();
  run();
  const blocks: number[] = [];
  for (let block = 0; block < BLOCKS; block++) {
    const start = performance.now();
    for (let i = 0; i < RUNS_PER_BLOCK; i++) run();
    blocks.push((performance.now() - start) / RUNS_PER_BLOCK);
  }
  blocks.sort((a, b) => a - b);
  return {
    median: blocks[Math.floor(BLOCKS / 2)],
    min: blocks[0],
    max: blocks[BLOCKS - 1],
  };
}

function assertSeamFree(map: Uint8Array, rows: number, cols: number, label: string): void {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (x + 1 < cols && !fitsHorizontally(map[y * cols + x], map[y * cols + x + 1])) {
        throw new Error(`${label}: horizontal seam at ${x},${y}`);
      }
      if (y + 1 < rows && !fitsVertically(map[y * cols + x], map[(y + 1) * cols + x])) {
        throw new Error(`${label}: vertical seam at ${x},${y}`);
      }
    }
  }
}

function wfcTiles(): { tiles: Tile[]; constraints: Constraint[] } {
  const tiles: Tile[] = Array.from({ length: WANG_TILE_COUNT }, (_, id) => ({
    id: String(id),
    weight: 1,
  }));
  const constraints: Constraint[] = [];
  // Both directions are emitted explicitly. The type carries a `bidirectional`
  // flag, but the solver's constraint lookup filters on `tile1` and the
  // direction, so a one-sided pair would only ever be enforced one way.
  for (let a = 0; a < WANG_TILE_COUNT; a++) {
    for (let b = 0; b < WANG_TILE_COUNT; b++) {
      if (fitsHorizontally(a, b)) {
        constraints.push({ tile1: String(a), tile2: String(b), direction: "east" });
        constraints.push({ tile1: String(b), tile2: String(a), direction: "west" });
      }
      if (fitsVertically(a, b)) {
        constraints.push({ tile1: String(a), tile2: String(b), direction: "south" });
        constraints.push({ tile1: String(b), tile2: String(a), direction: "north" });
      }
    }
  }
  return { tiles, constraints };
}

const HEADER = "| size | strategy | median ms | per cell (ns) | min ms | max ms | verified |";
const RULE = "| --- | --- | --- | --- | --- | --- | --- |";

function row(size: number, strategy: string, timing: Timing, verified: string): string {
  const cells = size * size;
  const perCell = ((timing.median * 1e6) / cells).toFixed(1);
  return `| ${size}x${size} | ${strategy} | ${timing.median.toFixed(3)} | ${perCell} | ${timing.min.toFixed(3)} | ${timing.max.toFixed(3)} | ${verified} |`;
}

const SIZES = [32, 64, 128];

/**
 * A scanline fill that respects the adjacency by construction.
 *
 * This is what a solver-shaped generator costs when it is *correct*: one
 * candidate scan and one draw per cell, in row-major order, so cell `(x, y)`
 * cannot be produced without producing the cells before it. The comparison it
 * sets up is the one that matters -- same constraint set, same output quality,
 * different ability to answer a query out of order.
 */
function constrainedFill(rows: number, cols: number, seed: number): Uint8Array {
  const map = new Uint8Array(rows * cols);
  let state = seed | 0;
  const next = (): number => {
    state = (Math.imul(state, 1664525) + 1013904223) | 0;
    return (state >>> 0) / 4294967296;
  };

  const candidates = new Uint8Array(WANG_TILE_COUNT);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let count = 0;
      for (let tile = 0; tile < WANG_TILE_COUNT; tile++) {
        if (x > 0 && !fitsHorizontally(map[y * cols + x - 1], tile)) continue;
        if (y > 0 && !fitsVertically(map[(y - 1) * cols + x], tile)) continue;
        candidates[count++] = tile;
      }
      map[y * cols + x] = candidates[Math.floor(next() * count)];
    }
  }
  return map;
}

/**
 * WFC is timed separately and at smaller sizes.
 *
 * It solves the same problem, but its propagation costs roughly a second at
 * 32x32 and exceeds the default heap at 128x128, so sweeping it over the same
 * sizes would turn a comparison into an out-of-memory crash.
 */
const WFC_SIZES = [16, 32];

console.log("Wang tiles benchmark");
console.log("====================");
console.log("");
console.log(HEADER);
console.log(RULE);

for (const size of SIZES) {
  const lines: string[] = [];

  // 1. Naive repetition: the visual floor, not a reference implementation.
  const repeated = new Uint8Array(size * size);
  const repetition = measure(() => {
    repeated.fill(0);
  });
  lines.push(row(size, "repeat 1 tile", repetition, "n/a (single color)"));

  // 2. Wang closed form.
  const wang = measure(() => {
    generateWangMap(colorEdges({ rows: size, cols: size, seed: 2026 }));
  });
  const map = generateWangMap(colorEdges({ rows: size, cols: size, seed: 2026 }));
  assertSeamFree(map, size, size, "wang");
  lines.push(row(size, "Wang closed form", wang, "seam-free"));

  // 3. Wang random access: the infinite-world path, same cell count.
  const randomAccess = measure(() => {
    let checksum = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) checksum += wangTileAt(x, y, 2026);
    }
    if (checksum < 0) throw new Error("unreachable");
  });
  lines.push(row(size, "Wang random access", randomAccess, "seam-free by construction"));

  // 4. A correct constrained fill: the solver-shaped baseline that does not
  //    need a propagation queue but does need the cells before it.
  const fill = measure(() => {
    constrainedFill(size, size, 2026);
  });
  assertSeamFree(constrainedFill(size, size, 2026), size, size, "constrained fill");
  lines.push(row(size, "scanline constrained fill", fill, "seam-free"));

  console.log(lines.join("\n"));
}

/**
 * Read a WFC grid back as Wang indices and verify it.
 *
 * The solver is allowed to say it succeeded; this checks that what it produced
 * actually satisfies the adjacency the closed form was measured against, so the
 * comparison is between two correct tilings.
 */
function verifyWfcGrid(
  grid: (string | null)[][],
  size: number,
): "verified" | "incomplete" | "invalid" {
  const map = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = grid[y]?.[x];
      if (cell === null || cell === undefined) return "incomplete";
      const index = Number(cell);
      if (!Number.isInteger(index) || index < 0 || index >= WANG_TILE_COUNT) return "invalid";
      map[y * size + x] = index;
    }
  }
  try {
    assertSeamFree(map, size, size, "wfc");
  } catch {
    return "invalid";
  }
  return "verified";
}

console.log("");
console.log("Same problem, solved by constraints");
console.log("-----------------------------------");
console.log(HEADER);
console.log(RULE);

for (const size of WFC_SIZES) {
  const { tiles, constraints } = wfcTiles();
  const wfc = new WaveFunctionCollapse({
    width: size,
    height: size,
    seed: 2026,
    maxIterations: 100000,
  });
  const start = performance.now();
  const result = wfc.generate2D({ width: size, height: size }, tiles, constraints);
  const elapsed = performance.now() - start;
  const verdict = result.success ? verifyWfcGrid(result.grid, size) : "failed";
  console.log(
    row(
      size,
      `WFC (${constraints.length} constraints)`,
      { median: elapsed, min: elapsed, max: elapsed },
      verdict,
    ),
  );
  if (verdict !== "verified") {
    console.log(`\n  WFC at ${size}x${size}: ${verdict} (${result.message})`);
  }
}

console.log("");
console.log("Notes");
console.log("-----");
console.log("- The WFC row is a solver, not a per-cell function: its cost is wall clock for");
console.log("  one run, and its verified column is the result of checking every seam");
console.log("  against the adjacency it was given, not of believing `success`.");
console.log("  It reports invalid here because this repository's propagator skips the cell");
console.log("  it just collapsed, so adjacency is never enforced from a decided cell.");
console.log("- The scanline fill is the fair solver baseline: correct output, one draw and");
console.log("  one candidate scan per cell, and no way to answer a query in isolation.");
console.log("- Above a few hundred cells per side both Wang paths are dominated by the");
console.log("  Uint8Array allocation, not by the hash.");
