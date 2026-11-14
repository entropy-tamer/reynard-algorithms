import { describe, expect, it } from "vitest";
import {
  bruteForceNearest,
  bruteForceNearest3D,
  buildDpNnsIndex,
  buildDpNnsIndex3D,
  generateSphereSurface3D,
  generateVolumeQueries3D,
  queryBatchDpNns,
  queryDpNns,
  queryDpNns3D,
  type Point2D,
} from "../../algorithms/computational-geometry/dp-nns";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function randomPoints(n: number, seed: number): Point2D[] {
  const r = rng(seed);
  return Array.from({ length: n }, () => ({ x: r() * 100 - 50, y: r() * 100 - 50 }));
}

function randomQueries(m: number, seed: number): Point2D[] {
  const r = rng(seed + 1337);
  return Array.from({ length: m }, () => ({ x: r() * 140 - 70, y: r() * 140 - 70 }));
}

describe("dp-nns", () => {
  it("builds an index and reports stats", () => {
    const points = randomPoints(40, 1);
    const index = buildDpNnsIndex(points, { seed: 1, order: "brio-levels", gridResolution: 8 });
    expect(index.stats.pointCount).toBe(40);
    expect(index.successors.length).toBe(40);
    expect(index.gridStarts).not.toBeNull();
    expect(index.stats.successorEdgeCount).toBeGreaterThan(0);
  });

  it("returns exact nearest neighbor matching brute force (grid off)", () => {
    const points = randomPoints(60, 2);
    const index = buildDpNnsIndex(points, { seed: 2, order: "random", gridResolution: 0 });
    const queries = randomQueries(80, 2);
    for (const q of queries) {
      const r = queryDpNns(index, q, { useGridInit: false });
      const b = bruteForceNearest(index.points, q);
      expect(r.nearestIndex).toBe(b.index);
      expect(r.nearestDistance).toBeCloseTo(b.distance, 10);
    }
  });

  it("grid-initialized queries match default-start queries", () => {
    const points = randomPoints(70, 3);
    const index = buildDpNnsIndex(points, { seed: 3, order: "brio-levels", gridResolution: 12 });
    const queries = randomQueries(60, 3);
    for (const q of queries) {
      const a = queryDpNns(index, q, { useGridInit: false });
      const g = queryDpNns(index, q, { useGridInit: true });
      expect(g.nearestIndex).toBe(a.nearestIndex);
      expect(g.nearestDistance).toBeCloseTo(a.nearestDistance, 10);
    }
  });

  it("grid init reduces or equals distance evaluations on average in typical cases", () => {
    const points = randomPoints(120, 4);
    const index = buildDpNnsIndex(points, { seed: 4, order: "brio-levels", gridResolution: 16 });
    const queries = randomQueries(100, 4);
    const noGrid = queryBatchDpNns(index, queries, { useGridInit: false });
    const grid = queryBatchDpNns(index, queries, { useGridInit: true });
    expect(grid.avgDistanceEvaluations).toBeLessThanOrEqual(noGrid.avgDistanceEvaluations + 1e-9);
  });

  it("supports different insertion orders", () => {
    const points = randomPoints(50, 5);
    const queries = randomQueries(40, 5);
    for (const order of ["input", "random", "brio-levels", "level-interleaved-bad"] as const) {
      const index = buildDpNnsIndex(points, { seed: 5, order, gridResolution: 8 });
      const batch = queryBatchDpNns(index, queries, { useGridInit: true });
      for (const r of batch.results) {
        const b = bruteForceNearest(index.points, r.nearestIndex >= 0 ? index.points[r.nearestIndex]! : queries[0]!);
        // result must be a true nearest neighbor for that query
        expect(r.nearestIndex).toBeGreaterThanOrEqual(0);
      }
      for (let i = 0; i < queries.length; i++) {
        const b = bruteForceNearest(index.points, queries[i]!);
        expect(batch.results[i]!.nearestIndex).toBe(b.index);
      }
    }
  });
});
