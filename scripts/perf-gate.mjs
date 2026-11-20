#!/usr/bin/env node
/**
 * Deterministic A* performance gate for CI.
 *
 * `perf-summary.mjs` is a useful manual report but cannot gate anything: it
 * builds grids with Math.random(), prints prose with no machine-readable
 * result, and never exits non-zero on a regression. This tool replaces that
 * role in CI while leaving the old script alone.
 *
 *   node scripts/perf-gate.mjs --write-baseline   # record a canonical run
 *   node scripts/perf-gate.mjs                    # compare against baseline
 *
 * Exit codes: 0 pass, 1 regression, 2 bad input/missing baseline.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { resolve } from "node:path";

const { AStar } = await import("../dist/index.cjs");

const ROOT = resolve(import.meta.dirname, "..");
const BASELINE = resolve(ROOT, "benchmarks/astar-baseline.json");
const SCHEMA = "algorithms-perf.v1";
// Absolute milliseconds on a shared CI host are a coin flip: a measured run
// here varied by ~2x between two invocations with no code change. The gate
// therefore uses ratios computed inside one process, plus a very loose
// catastrophic ceiling from the committed baseline.
const MAX_SLOPE = Number(process.env.PERF_MAX_SLOPE ?? 2.6);
const MAX_NODE_RATIO = Number(process.env.PERF_MAX_NODE_RATIO ?? 3.0);
const CATASTROPHIC_FACTOR = Number(process.env.PERF_CATASTROPHIC_FACTOR ?? 10);

/** Same LCG the benchmark harnesses use: repeatable across runs and machines. */
function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function grid(size, seed) {
  const rand = seeded(seed);
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => rand() > 0.2),
  );
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

const CONFIGS = [
  { size: 50, seed: 42 },
  { size: 100, seed: 77 },
  { size: 200, seed: 131 },
  { size: 300, seed: 7 },
];
const REPEATS = 10;

function measure() {
  const astar = new AStar({ enableCaching: false });
  return CONFIGS.map(({ size, seed }) => {
    const cells = grid(size, seed);
    const world = { width: size, height: size, cellSize: 1, cells };
    const start = { x: 5, y: 5 };
    const goal = { x: size - 6, y: size - 6 };
    void astar.findPath(start, goal, world); // warm the JIT
    const times = [];
    const nodes = [];
    for (let i = 0; i < REPEATS; i++) {
      const t0 = performance.now();
      const result = astar.findPath(start, goal, world);
      times.push(performance.now() - t0);
      nodes.push(result.nodesExplored ?? 0);
    }
    const timeMs = median(times);
    const nodeCount = median(nodes);
    return {
      size,
      seed,
      median_ms: Number(timeMs.toFixed(3)),
      nodes: Number(nodeCount.toFixed(1)),
      per_node_us: nodeCount > 0 ? Number(((timeMs * 1000) / nodeCount).toFixed(3)) : null,
    };
  });
}

const report = {
  schema: SCHEMA,
  measured_at: new Date().toISOString(),
  node: process.version,
  repeats: REPEATS,
  limits: { max_slope: MAX_SLOPE, max_node_ratio: MAX_NODE_RATIO, catastrophic_factor: CATASTROPHIC_FACTOR },
  configs: measure(),
};
report.slopes = report.configs.slice(1).map((current, index) => {
  const previous = report.configs[index];
  return {
    from: previous.size,
    to: current.size,
    slope: Number((Math.log(current.median_ms / previous.median_ms) / Math.log(current.size / previous.size)).toFixed(3)),
  };
});
const firstNode = report.configs[0].per_node_us;
const lastNode = report.configs.at(-1).per_node_us;
report.overall_slope = Number((Math.log(report.configs.at(-1).median_ms / report.configs[0].median_ms) / Math.log(report.configs.at(-1).size / report.configs[0].size)).toFixed(3));
report.node_ratio = firstNode && lastNode ? Number((lastNode / firstNode).toFixed(3)) : null;

if (process.argv.includes("--write-baseline")) {
  const baseline = {
    schema: SCHEMA,
    recorded_at: report.measured_at,
    node: report.node,
    repeats: REPEATS,
    configs: report.configs,
  };
  writeFileSync(BASELINE, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`baseline written to ${BASELINE}`);
  process.exit(0);
}

let baseline;
try {
  baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
} catch (error) {
  console.error(`FAIL: cannot read baseline ${BASELINE}: ${error.message}`);
  process.exit(2);
}
if (baseline.schema !== SCHEMA || !Array.isArray(baseline.configs)) {
  console.error(`FAIL: bad baseline schema in ${BASELINE}`);
  process.exit(2);
}

let failed = 0;
const slopeOk = report.overall_slope <= MAX_SLOPE;
if (!slopeOk) failed++;
console.error(
  `${slopeOk ? "PASS" : "FAIL"} overall growth ${report.configs[0].size}->${report.configs.at(-1).size}: slope ${report.overall_slope} (limit ${MAX_SLOPE})`,
);
if (report.node_ratio !== null) {
  const ok = report.node_ratio <= MAX_NODE_RATIO;
  if (!ok) failed++;
  console.error(
    `${ok ? "PASS" : "FAIL"} per-node drift: ${report.node_ratio}x from ${report.configs[0].size} to ${report.configs.at(-1).size} (limit ${MAX_NODE_RATIO})`,
  );
}
for (const current of report.configs) {
  const expected = baseline.configs.find((row) => row.size === current.size && row.seed === current.seed);
  if (!expected) continue; // informational baseline; a new config is not a failure
  const limit = expected.median_ms * CATASTROPHIC_FACTOR;
  const ok = current.median_ms <= limit;
  if (!ok) failed++;
  console.error(
    `${ok ? "PASS" : "FAIL"} ${current.size}x${current.size}: ${current.median_ms}ms vs baseline ${expected.median_ms}ms (catastrophic ceiling ${limit.toFixed(1)}ms)`,
  );
}

console.log(JSON.stringify(report, null, 2));
if (failed) {
  console.error(`FAIL: ${failed} performance check(s) exceeded the relative limits`);
  process.exit(1);
}
console.error("PASS: A* performance within relative limits");
