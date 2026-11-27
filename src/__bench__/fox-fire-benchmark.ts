/**
 * Fox Fire Benchmark Suite
 *
 * Measures the startup and resize paths the gate depends on:
 * render cost per tier, fire warm-up, all-tier prewarm, and cache-hit lookup.
 *
 * Run with: pnpm exec tsx src/__bench__/fox-fire-benchmark.ts
 */

import { performance } from "node:perf_hooks";
import {
  FIRE_WARMUP,
  FireBuffer,
  FOX_ART_TIERS,
  FOX_FIRE_PALETTE,
  renderFoxFireFrame,
} from "../algorithms/rendering/fox-fire/index";

const ITERATIONS = 20;
const FRAME_ITERATIONS = 50;
const FRAME_CAP = 20;

const heapMb = () => Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2));
const ms = (start: number) => Number((performance.now() - start).toFixed(2));

function newFire(tier: (typeof FOX_ART_TIERS)[number]): FireBuffer {
  return new FireBuffer({ cols: tier.cols, rows: tier.rows, seed: 0x5eed });
}

function render(tier: (typeof FOX_ART_TIERS)[number], fire: FireBuffer, phase: number): number {
  const frame = renderFoxFireFrame({
    tier,
    fire,
    cols: tier.cols,
    rows: tier.rows,
    phase,
    palette: FOX_FIRE_PALETTE,
  });
  return frame.flat().length;
}

function warm(tier: (typeof FOX_ART_TIERS)[number]): FireBuffer {
  const fire = newFire(tier);
  for (let i = 0; i < FIRE_WARMUP; i++) fire.step();
  return fire;
}

const renderPerTier: Record<string, number> = {};
const cellsPerTier: Record<string, number> = {};
for (const tier of FOX_ART_TIERS) {
  const fire = warm(tier);
  let cells = 0;
  const start = performance.now();
  for (let i = 0; i < FRAME_ITERATIONS; i++) cells = render(tier, fire, i / FRAME_ITERATIONS);
  renderPerTier[tier.name] = ms(start);
  cellsPerTier[tier.name] = cells;
}

const warmPerTier: Record<string, number> = {};
for (const tier of FOX_ART_TIERS) {
  const start = performance.now();
  warm(tier);
  warmPerTier[tier.name] = ms(start);
}

const prewarmAllStart = performance.now();
const prewarmed = FOX_ART_TIERS.map(warm);
const prewarmAllMs = ms(prewarmAllStart);

const cachedStart = performance.now();
let cells = 0;
for (let i = 0; i < ITERATIONS; i++) {
  const index = i % FOX_ART_TIERS.length;
  cells += render(FOX_ART_TIERS[index], prewarmed[index], i / ITERATIONS);
}
const cachedResizeMs = ms(cachedStart);

const coldStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const tier = FOX_ART_TIERS[i % FOX_ART_TIERS.length];
  cells += render(tier, warm(tier), i / ITERATIONS);
}
const coldResizeMs = ms(coldStart);

console.log(
  JSON.stringify(
    {
      tiers: FOX_ART_TIERS.map((tier) => `${tier.name}:${tier.cols}x${tier.rows}`),
      iterations: { render: FRAME_ITERATIONS, resize: ITERATIONS },
      renderMs: renderPerTier,
      cellsPerTier,
      warmMs: warmPerTier,
      prewarmAllMs,
      cachedResizeMs,
      coldResizeMs,
      resizeSpeedup: Number((coldResizeMs / cachedResizeMs).toFixed(2)),
      frameCapBytesEstimate: FRAME_CAP * Math.max(...Object.values(cellsPerTier)) * 4,
      heapMb: heapMb(),
      cells,
    },
    null,
    2,
  ),
);
