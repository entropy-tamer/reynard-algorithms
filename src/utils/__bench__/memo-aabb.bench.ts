/** Microbench: AABB operations memoization (CI-safe) */
import { unionAABB, intersectionAABB } from "../../../algorithms/collision/aabb/aabb-operations";

/**
 *
 * @example
 */
function run() {
  const aabbs = Array.from({ length: 100 }, (_, i) => ({
    x: i % 10,
    y: Math.floor(i / 10),
    width: 5,
    height: 5,
  }));
  const pairs: Array<[number, number]> = Array.from({ length: 50 }, (_, i) => [
    i % aabbs.length,
    (i * 3) % aabbs.length,
  ]);

  // warm
  for (let r = 0; r < 5; r++) {
    for (const [a, b] of pairs) {
      unionAABB(aabbs[a], aabbs[b]);
      intersectionAABB(aabbs[a], aabbs[b]);
    }
  }

  const t0 = performance.now();
  for (let r = 0; r < 20; r++) {
    for (const [a, b] of pairs) {
      unionAABB(aabbs[a], aabbs[b]);
      intersectionAABB(aabbs[a], aabbs[b]);
    }
  }
  const t1 = performance.now();
   
  console.log(`[memo-aabb] totalMs=${(t1 - t0).toFixed(3)}`);
}

// Only run when explicitly executed (e.g., tsx) to avoid test noise
if (typeof process !== "undefined" && process.env.RUN_MEMO_BENCH === "1") {
  run();
}
