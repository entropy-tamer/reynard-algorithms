/** Microbench: SAT projection memoization (CI-safe) */
import { SAT } from "../../geometry/collision/sat/sat-core";

function run() {
  const polygons = Array.from({ length: 20 }, (_, i) => ({
    vertices: [
      { x: i, y: i },
      { x: i + 10, y: i },
      { x: i + 10, y: i + 10 },
      { x: i, y: i + 10 },
    ],
    center: { x: i + 5, y: i + 5 },
    radius: 7,
    id: `poly-${i}`,
  }));

  const sat = new SAT({ enableCaching: true });
  const pairs: Array<[number, number]> = Array.from({ length: 30 }, (_, i) => [i % polygons.length, (i * 2) % polygons.length]);

  // warm
  for (let r = 0; r < 3; r++) {
    for (const [a, b] of pairs) {
      sat.testCollision(polygons[a], polygons[b]);
    }
  }

  const t0 = performance.now();
  for (let r = 0; r < 10; r++) {
    for (const [a, b] of pairs) {
      sat.testCollision(polygons[a], polygons[b]);
    }
  }
  const t1 = performance.now();
  // eslint-disable-next-line no-console
  console.log(`[memo-sat] totalMs=${(t1 - t0).toFixed(3)}`);
}

// Only run when explicitly executed (e.g., tsx) to avoid test noise
if (typeof process !== "undefined" && process.env.RUN_MEMO_BENCH === "1") {
  run();
}
