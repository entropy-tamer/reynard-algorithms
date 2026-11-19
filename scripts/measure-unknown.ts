/**
 * Empirical growth measurements for the registry entries that carry no source
 * or guide bound. Each task calls one real library operation; input construction
 * stays in `make(n)`, outside the timed closure. Sizes are interleaved with a
 * rotating order and the median of every repeat is recorded, so a loaded box
 * cannot invert a comparison the way a single burst can.
 *
 *   MEASURE_SCALES=1,2,4,8 MEASURE_REPEATS=5 MEASURE_DATE_PREFIX=2026-11-19e \
 *     pnpm exec tsx scripts/measure-unknown.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { resolve } from "node:path";

import { buildDpNnsIndex } from "../src/algorithms/computational-geometry/dp-nns/dp-nns-core.ts";
import { calculateRadialPositions } from "../src/algorithms/computational-geometry/circular/circular-core.ts";
import { marchingCubesMesh } from "../src/algorithms/computational-geometry/marching-cubes/marching-cubes-core.ts";
import { ConstraintSolver } from "../src/algorithms/game-mechanics/constraint-solvers/constraint-solvers-core.ts";
import { requiredAlpha, type Channels } from "../src/algorithms/imaging/luminance.ts";
import { QLearning } from "../src/algorithms/machine-learning/reinforcement-learning/reinforcement-learning-core.ts";
import { ReLUPolytopePartitioner } from "../src/algorithms/machine-learning/relu-polytopes/relu-polytopes-core.ts";
import {
  generateCloudNoise,
} from "../src/algorithms/procedural-generation/cloud-noise/cloud-noise-core.ts";
import { DEFAULT_CLOUD_NOISE_CONFIG } from "../src/algorithms/procedural-generation/cloud-noise/cloud-noise-types.ts";
import { PoissonDisk } from "../src/algorithms/procedural-generation/poisson-disk/poisson-disk-core.ts";
import { createNoise2D } from "../src/algorithms/procedural-generation/simplex-noise/simplex-noise-2d-factory.ts";
import { SimplexNoise } from "../src/algorithms/procedural-generation/simplex-noise/simplex-noise-core.ts";
import { calculateFog } from "../src/algorithms/rendering/fog/fog-core.ts";
import { DEFAULT_FOG_CONFIG } from "../src/algorithms/rendering/fog/fog-types.ts";
import { FireBuffer } from "../src/algorithms/rendering/fox-fire/fire-dog.ts";
import { jitterPath } from "../src/algorithms/rendering/sketch/jitter.ts";

const OUT = resolve(
  process.env.MEASUREMENTS_OUT ??
    `${process.env.HOME ?? "/home/kade"}/src/foxtools/registry/algorithms/observations/measurements`,
);
const SCALES = (process.env.MEASURE_SCALES ?? "1,2,4,8")
  .split(",")
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isFinite(value) && value > 0);
if (SCALES.length < 2) throw new Error("MEASURE_SCALES needs at least two positive multipliers");
const REPEATS = Number(process.env.MEASURE_REPEATS ?? 5);
if (!Number.isInteger(REPEATS) || REPEATS < 5) {
  throw new Error("MEASURE_REPEATS must be an integer >= 5");
}
const PREFIX = process.env.MEASURE_DATE_PREFIX ?? "2026-11-19e";
// Tunes every task's starting size without editing the task table; useful when
// checking that a slope is a property of the algorithm and not of one size band.
const BASE_SCALE = Number(process.env.MEASURE_BASE_SCALE ?? 1);
if (!Number.isFinite(BASE_SCALE) || BASE_SCALE <= 0) {
  throw new Error("MEASURE_BASE_SCALE must be a positive number");
}

type Case = { n: number; call: () => void };
type Task = {
  id: string;
  workload: string;
  variable: string;
  base: number;
  make: (n: number) => Case;
};

function seeded(n: number, seed = 1): number[] {
  let state = seed >>> 0;
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

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]!
    : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

/** Interleave every size; keep the median of each size across all rounds. */
function measureSet(cases: Case[]): number[] {
  for (const { call } of cases) call();
  const samples: number[][] = cases.map(() => []);
  for (let round = 0; round < REPEATS; round++) {
    for (let offset = 0; offset < cases.length; offset++) {
      const i = (offset + round) % cases.length;
      samples[i]!.push(once(cases[i]!.call));
    }
  }
  return samples.map(median);
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

const tasks: Task[] = [
  {
    id: "catalog-algorithms-computational-geometry-circular",
    workload: "calculateRadialPositions for n evenly spaced points",
    variable: "number of radial positions requested",
    base: 1000,
    make: (n) => {
      const options = { count: n, radius: 50 };
      return { n, call: () => void calculateRadialPositions(options) };
    },
  },
  {
    id: "catalog-algorithms-computational-geometry-dp-nns",
    workload: "buildDpNnsIndex over n uniform points, grid disabled",
    variable: "indexed points",
    base: 1000,
    make: (n) => {
      const values = seeded(n * 2, 11);
      const points = Array.from({ length: n }, (_, i) => ({ x: values[i]!, y: values[n + i]! }));
      return {
        n,
        call: () => void buildDpNnsIndex(points, { gridResolution: 0, seed: 1 }),
      };
    },
  },
  {
    id: "catalog-algorithms-computational-geometry-marching-cubes",
    workload: "marchingCubesMesh on a fixed sphere field over n grid cells",
    variable: "sampled grid cells",
    base: 32768,
    make: (target) => {
      // A fixed y/z slice count makes the cell count exactly proportional to
      // the requested n, so 4x input really is 4x cells.
      const ny = 16;
      const nz = 16;
      const nx = Math.max(2, Math.round(target / (ny * nz)));
      const n = nx * ny * nz;
      const field = (x: number, y: number, z: number): number =>
        x * x + y * y + z * z - 0.7;
      return {
        n,
        call: () => void marchingCubesMesh(field, { resolution: { x: nx, y: ny, z: nz } }),
      };
    },
  },
  {
    id: "catalog-algorithms-game-mechanics-constraint-solvers",
    workload: "solveDistanceConstraints on a chain of n distance constraints",
    variable: "constraints in the chain",
    base: 1000,
    make: (n) => {
      const bodies = Array.from({ length: n + 1 }, (_, i) => ({
        position: { x: i, y: (i % 5) * 0.1, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        mass: 1,
      }));
      const constraints = Array.from({ length: n }, (_, i) => ({
        bodyA: bodies[i]!,
        bodyB: bodies[i + 1]!,
        restLength: 1,
      }));
      const solver = new ConstraintSolver();
      return {
        n,
        call: () => void solver.solveDistanceConstraints(constraints, { iterations: 8 }),
      };
    },
  },
  {
    id: "catalog-algorithms-imaging",
    workload: "requiredAlpha over n sampled pixels",
    variable: "pixels tested",
    base: 2000,
    make: (n) => {
      const values = seeded(n * 3, 5);
      const pixels: Channels[] = Array.from({ length: n }, (_, i) => [
        Math.floor(values[i]! * 256),
        Math.floor(values[n + i]! * 256),
        Math.floor(values[2 * n + i]! * 256),
      ]);
      const ink: Channels = [20, 20, 20];
      const veil: Channels = [250, 250, 250];
      return { n, call: () => void requiredAlpha(pixels, ink, veil) };
    },
  },
  {
    id: "catalog-algorithms-machine-learning-reinforcement-learning",
    workload: "QLearning.update over n actions with an n-element state",
    variable: "state dimension and action count",
    base: 500,
    make: (n) => {
      const learner = new QLearning({ epsilon: 0 });
      const state = new Array<number>(n).fill(0.5);
      const nextState = new Array<number>(n).fill(0.6);
      const actions = Array.from({ length: n }, (_, i) => i);
      return {
        n,
        call: () => learner.update(state, 0, 1, nextState, actions),
      };
    },
  },
  {
    id: "catalog-algorithms-machine-learning-relu-polytopes",
    workload: "ReLUPolytopePartitioner.partition on a fixed-neuron grid",
    variable: "sampled grid cells",
    base: 32768,
    make: (target) => {
      const gridResolution = Math.max(2, Math.round(Math.sqrt(target)));
      const n = gridResolution * gridResolution;
      const partitioner = new ReLUPolytopePartitioner({ numNeurons: 16, seed: 7 });
      return { n, call: () => void partitioner.partition(gridResolution) };
    },
  },
  {
    id: "catalog-algorithms-procedural-generation-cloud-noise",
    workload: "generateCloudNoise at n voxel positions, five octaves",
    variable: "sampled voxels",
    base: 8000,
    make: (n) => {
      const simplex = new SimplexNoise({ seed: 7 });
      const noiseFunction = (x: number, y: number, z: number): number =>
        simplex.noise3D(x, y, z);
      const config = { ...DEFAULT_CLOUD_NOISE_CONFIG, octaves: 5 };
      const rnd = seeded(n * 3, 9);
      const xs = rnd.slice(0, n);
      const ys = rnd.slice(n, n * 2);
      const zs = rnd.slice(n * 2, n * 3);
      return {
        n,
        call: () => {
          for (let i = 0; i < n; i++) {
            void generateCloudNoise(xs[i]!, ys[i]!, zs[i]!, 0, noiseFunction, config);
          }
        },
      };
    },
  },
  {
    id: "catalog-algorithms-procedural-generation-poisson-disk",
    workload: "PoissonDisk.sample2D targeting n points at fixed spacing",
    variable: "generated points",
    base: 1000,
    make: (n) => {
      const side = Math.sqrt(n * 2.5);
      const disk = new PoissonDisk({ seed: 7 });
      return {
        n,
        call: () => void disk.sample2D({
          width: side,
          height: side,
          minDistance: 1,
          maxPoints: n * 3,
        }),
      };
    },
  },
  {
    id: "catalog-algorithms-procedural-generation-simplex-noise",
    workload: "createNoise2D sampled at n grid positions",
    variable: "sampled positions",
    base: 16000,
    make: (n) => {
      const noise2D = createNoise2D({ seed: 7 });
      const rnd = seeded(n * 2, 3);
      const xs = rnd.slice(0, n);
      const ys = rnd.slice(n);
      return {
        n,
        call: () => {
          for (let i = 0; i < n; i++) void noise2D(xs[i]!, ys[i]!);
        },
      };
    },
  },
  {
    id: "catalog-algorithms-rendering-fog",
    workload: "calculateFog at n world positions",
    variable: "positions shaded",
    base: 8000,
    make: (n) => {
      const rnd = seeded(n * 3, 13);
      const positions: Array<[number, number, number]> = Array.from({ length: n }, (_, i) => [
        rnd[i]! * 100,
        rnd[n + i]! * 60,
        rnd[2 * n + i]! * 100,
      ]);
      return {
        n,
        call: () => {
          for (let i = 0; i < n; i++) void calculateFog(positions[i]!, DEFAULT_FOG_CONFIG, 0.5);
        },
      };
    },
  },
  {
    id: "catalog-algorithms-rendering-fox-fire",
    workload: "FireBuffer.step on a frame of n cells (four sub-rows each)",
    variable: "frame cells",
    base: 4096,
    make: (target) => {
      // A fixed row count makes the cell count exactly proportional to the
      // requested n. step() works on typed arrays, so it measures the fire
      // simulation without the per-cell object churn of frame composition.
      const rows = 16;
      const cols = Math.max(3, Math.round(target / rows));
      const fire = new FireBuffer({ cols, rows, seed: 7 });
      return { n: cols * rows, call: () => fire.step() };
    },
  },
  {
    id: "catalog-algorithms-rendering-sketch",
    workload: "jitterPath over n points along a fixed-length arc",
    variable: "input path points",
    base: 4000,
    make: (n) => {
      const points = Array.from({ length: n }, (_, i) => {
        const angle = (i / Math.max(1, n - 1)) * Math.PI * 2;
        return { x: 100 * Math.cos(angle), y: 100 * Math.sin(angle) };
      });
      return { n, call: () => void jitterPath(points, 7) };
    },
  },
];

// DQN.train is a documented no-op placeholder, so timing it would measure
// nothing; the reinforcement-learning task above uses QLearning.update instead.

mkdirSync(OUT, { recursive: true });
const filter = process.env.MEASURE_FILTER ?? "";
let written = 0;
for (const task of tasks) {
  if (filter && !task.id.includes(filter)) continue;
  try {
    const cases = SCALES.map((scale) => task.make(Math.round(task.base * BASE_SCALE * scale)));
    const times = measureSet(cases);
    const samples = cases.map(({ n }, i) => ({ n, time_ms: times[i]! }));
    const derived = slopes(samples);
    writeFileSync(
      resolve(OUT, `${PREFIX}-${task.id}-scaling.json`),
      `${JSON.stringify({
        entry: task.id,
        workload: task.workload,
        variable: task.variable,
        repeats: REPEATS,
        samples,
        slopes: derived,
      }, null, 2)}\n`,
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
