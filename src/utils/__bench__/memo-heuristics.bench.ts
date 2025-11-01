/** Microbench: Heuristics memoization (CI-safe) */
import { euclideanDistance } from "../../pathfinding/astar/heuristics";

function run() {
  const pts = Array.from({ length: 200 }, (_, i) => ({ x: i % 20, y: Math.floor(i / 20) }));
  const pairs: Array<[number, number]> = Array.from({ length: 100 }, (_, i) => [i % pts.length, (i * 7) % pts.length]);

  // warm
  for (let r = 0; r < 10; r++) for (const [a, b] of pairs) euclideanDistance(pts[a], pts[b]);

  const t0 = performance.now();
  for (let r = 0; r < 50; r++) for (const [a, b] of pairs) euclideanDistance(pts[a], pts[b]);
  const t1 = performance.now();
  // eslint-disable-next-line no-console
  console.log(`[memo-heuristics] totalMs=${(t1 - t0).toFixed(3)}`);
}

// Only run when explicitly executed (e.g., tsx) to avoid test noise
if (typeof process !== "undefined" && process.env.RUN_MEMO_BENCH === "1") {
  run();
}


