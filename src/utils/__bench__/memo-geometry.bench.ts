/** Microbench: Geometry operations memoization (CI-safe) */
import { VectorOps } from "../../geometry/vectors/vector-algorithms";

function run() {
  const vectors = Array.from({ length: 200 }, (_, i) => ({
    x: (i % 20) * 0.5,
    y: Math.floor(i / 20) * 0.5,
  }));

  // warm
  for (let r = 0; r < 5; r++) {
    for (const v of vectors) {
      VectorOps.normalize(v);
      VectorOps.magnitude(v);
    }
  }

  const t0 = performance.now();
  for (let r = 0; r < 20; r++) {
    for (const v of vectors) {
      VectorOps.normalize(v);
      VectorOps.magnitude(v);
    }
  }
  const t1 = performance.now();
  // eslint-disable-next-line no-console
  console.log(`[memo-geometry] totalMs=${(t1 - t0).toFixed(3)}`);
}

// Only run when explicitly executed (e.g., tsx) to avoid test noise
if (typeof process !== "undefined" && process.env.RUN_MEMO_BENCH === "1") {
  run();
}
