import type {
  Bounds2D,
  DpNnsBatchQueryStats,
  DpNnsBuildOptions,
  DpNnsIndex,
  DpNnsQueryOptions,
  DpNnsQueryResult,
  DpNnsQueryTraceStep,
  InsertionOrderMode,
  Point2D,
} from "./dp-nns-types";

interface Tri {
  a: number;
  b: number;
  c: number;
  circumcenter: Point2D;
  circumradiusSq: number;
}

function dist2(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function dist(a: Point2D, b: Point2D): number {
  return Math.sqrt(dist2(a, b));
}

function orient(a: Point2D, b: Point2D, c: Point2D): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function circumcircle(a: Point2D, b: Point2D, c: Point2D): { center: Point2D; r2: number } | null {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(d) < 1e-12) return null;
  const a2 = a.x * a.x + a.y * a.y;
  const b2 = b.x * b.x + b.y * b.y;
  const c2 = c.x * c.x + c.y * c.y;
  const ux = (a2 * (b.y - c.y) + b2 * (c.y - a.y) + c2 * (a.y - b.y)) / d;
  const uy = (a2 * (c.x - b.x) + b2 * (a.x - c.x) + c2 * (b.x - a.x)) / d;
  const center = { x: ux, y: uy };
  return { center, r2: dist2(center, a) };
}

function makeTri(a: number, b: number, c: number, pts: Point2D[]): Tri | null {
  const pa = pts[a]!;
  const pb = pts[b]!;
  const pc = pts[c]!;
  if (Math.abs(orient(pa, pb, pc)) < 1e-12) return null;
  let aa = a, bb = b, cc = c;
  if (orient(pa, pb, pc) < 0) {
    bb = c;
    cc = b;
  }
  const ccirc = circumcircle(pts[aa]!, pts[bb]!, pts[cc]!);
  if (!ccirc) return null;
  return { a: aa, b: bb, c: cc, circumcenter: ccirc.center, circumradiusSq: ccirc.r2 };
}

function edgeKey(i: number, j: number): string {
  return i < j ? `${i},${j}` : `${j},${i}`;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function computeBounds(points: Point2D[]): Bounds2D {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
  if (maxX === minX) maxX = minX + 1;
  if (maxY === minY) maxY = minY + 1;
  return { minX, minY, maxX, maxY };
}

function maybeJitter(points: Point2D[], jitter: number, seed: number): Point2D[] {
  if (!(jitter > 0)) return points.map(p => ({ ...p }));
  const b = computeBounds(points);
  const scale = Math.max(b.maxX - b.minX, b.maxY - b.minY) * jitter;
  const rnd = mulberry32(seed ^ 0x9e3779b9);
  return points.map(p => ({ x: p.x + (rnd() - 0.5) * scale, y: p.y + (rnd() - 0.5) * scale }));
}

function hilbertIndex(x: number, y: number, bits: number): number {
  // Map normalized [0,1] to integer grid then Hilbert; simple iterative version.
  let ix = Math.max(0, Math.min((1 << bits) - 1, Math.floor(x * (1 << bits))));
  let iy = Math.max(0, Math.min((1 << bits) - 1, Math.floor(y * (1 << bits))));
  let d = 0;
  for (let s = bits - 1; s >= 0; s--) {
    const rx = (ix >> s) & 1;
    const ry = (iy >> s) & 1;
    d += ((3 * rx) ^ ry) << (2 * s);
    // rotate
    if (ry === 0) {
      if (rx === 1) {
        ix = (1 << (s + 1)) - 1 - ix;
        iy = (1 << (s + 1)) - 1 - iy;
      }
      const t = ix; ix = iy; iy = t;
    }
  }
  return d;
}

function sortByHilbert(indices: number[], points: Point2D[]): number[] {
  const b = computeBounds(indices.map(i => points[i]!));
  const dx = b.maxX - b.minX || 1;
  const dy = b.maxY - b.minY || 1;
  return indices.slice().sort((ia, ib) => {
    const pa = points[ia]!, pb = points[ib]!;
    const ha = hilbertIndex((pa.x - b.minX) / dx, (pa.y - b.minY) / dy, 16);
    const hb = hilbertIndex((pb.x - b.minX) / dx, (pb.y - b.minY) / dy, 16);
    return ha - hb;
  });
}

function computeInsertionOrder(
  n: number,
  points: Point2D[],
  mode: InsertionOrderMode,
  seed: number,
  brioRatio: number,
): { order: number[]; levelSizes: number[] } {
  const base = Array.from({ length: n }, (_, i) => i);
  if (n <= 1) return { order: base, levelSizes: n === 1 ? [1] : [] };
  const rnd = mulberry32(seed);
  if (mode === "input") return { order: base, levelSizes: [n] };
  if (mode === "random") return { order: shuffle(base, rnd), levelSizes: [n] };

  // BRIO-style: random shuffle -> geometric levels by count -> Hilbert sort within level.
  const shuffled = shuffle(base, rnd);
  const ratio = Math.max(2, brioRatio);
  const levelsIdx: number[][] = [];
  // Build sizes from smallest to largest, then reverse to R0..RL with geometric growth.
  let remaining = n;
  const sizesRev: number[] = [];
  while (remaining > 0) {
    const size = remaining <= 2 ? remaining : Math.max(1, Math.floor(remaining / ratio));
    sizesRev.push(size);
    remaining -= size;
    if (sizesRev.length > n) break; // safety
  }
  sizesRev.reverse();
  let offset = 0;
  for (const sz of sizesRev) {
    levelsIdx.push(shuffled.slice(offset, offset + sz));
    offset += sz;
  }
  if (offset < n) levelsIdx[levelsIdx.length - 1]!.push(...shuffled.slice(offset));
  const levelSizes = levelsIdx.map(l => l.length);

  if (mode === "brio-levels") {
    const order = levelsIdx.flatMap(level => sortByHilbert(level, points));
    return { order, levelSizes };
  }
  // level-interleaved-bad: intentionally break level consistency by round-robin interleaving across levels
  const queues = levelsIdx.map(l => sortByHilbert(l, points));
  const order: number[] = [];
  let done = false;
  while (!done) {
    done = true;
    for (const q of queues) {
      const v = q.shift();
      if (v !== undefined) {
        order.push(v);
        done = false;
      }
    }
  }
  return { order, levelSizes };
}

function addNeighbor(nei: number[][], a: number, b: number) {
  if (!nei[a]!.includes(b)) nei[a]!.push(b);
  if (!nei[b]!.includes(a)) nei[b]!.push(a);
}

function buildIncrementalDelaunay2D(
  points: Point2D[],
  insertionOrder: number[],
): { neighborsAtInsertion: number[][]; finalNeighbors: number[][]; finalEdgeCount: number } {
  const n = points.length;
  const neighborsAtInsertion: number[][] = Array.from({ length: n }, () => []);
  const finalNeighbors: number[][] = Array.from({ length: n }, () => []);
  if (n === 0) return { neighborsAtInsertion, finalNeighbors, finalEdgeCount: 0 };

  const b = computeBounds(points);
  const dx = b.maxX - b.minX;
  const dy = b.maxY - b.minY;
  const delta = Math.max(dx, dy) * 10 + 1;
  const midX = (b.minX + b.maxX) / 2;
  const midY = (b.minY + b.maxY) / 2;
  // Super-triangle vertices use indices n, n+1, n+2 in an extended point array.
  const extPts: Point2D[] = points.concat([
    { x: midX - 20 * delta, y: midY - delta },
    { x: midX, y: midY + 20 * delta },
    { x: midX + 20 * delta, y: midY - delta },
  ]);
  const s1 = n, s2 = n + 1, s3 = n + 2;
  let tris: Tri[] = [makeTri(s1, s2, s3, extPts)!];

  for (const pi of insertionOrder) {
    const p = extPts[pi]!;
    const bad: Tri[] = [];
    const good: Tri[] = [];
    for (const t of tris) {
      const d2 = dist2(p, t.circumcenter);
      if (d2 <= t.circumradiusSq + 1e-10) bad.push(t);
      else good.push(t);
    }
    if (bad.length === 0) continue;
    // boundary polygon: edges not shared by two bad triangles
    const edgeCount = new Map<string, { a: number; b: number; count: number }>();
    for (const t of bad) {
      const edges: [number, number][] = [[t.a, t.b], [t.b, t.c], [t.c, t.a]];
      for (const [a, b2] of edges) {
        const k = edgeKey(a, b2);
        const e = edgeCount.get(k);
        if (e) e.count++;
        else edgeCount.set(k, { a, b: b2, count: 1 });
      }
    }
    const boundary: [number, number][] = [];
    for (const e of edgeCount.values()) if (e.count === 1) boundary.push([e.a, e.b]);

    // Neighbors in DT(P_{<=p}) are boundary vertices connected to p by new triangles.
    const neighborSet = new Set<number>();
    const newTris: Tri[] = [];
    for (const [a, b2] of boundary) {
      if (a < n) neighborSet.add(a);
      if (b2 < n) neighborSet.add(b2);
      const nt = makeTri(pi, a, b2, extPts);
      if (nt) newTris.push(nt);
    }
    neighborsAtInsertion[pi] = Array.from(neighborSet);
    tris = good.concat(newTris);
  }

  // Final DT without super-triangle vertices
  const edgeSeen = new Set<string>();
  for (const t of tris) {
    if (t.a >= n || t.b >= n || t.c >= n) continue;
    const edges: [number, number][] = [[t.a, t.b], [t.b, t.c], [t.c, t.a]];
    for (const [a, b2] of edges) {
      const k = edgeKey(a, b2);
      if (edgeSeen.has(k)) continue;
      edgeSeen.add(k);
      addNeighbor(finalNeighbors, a, b2);
    }
  }
  return { neighborsAtInsertion, finalNeighbors, finalEdgeCount: edgeSeen.size };
}

export function buildDpNnsIndex(inputPoints: Point2D[], options: DpNnsBuildOptions = {}): DpNnsIndex {
  const t0 = performance.now();
  const seed = options.seed ?? 1;
  const jitter = options.jitter ?? 1e-9;
  const points = maybeJitter(inputPoints, jitter, seed);
  const n = points.length;
  const orderMode: InsertionOrderMode = options.order ?? "brio-levels";
  const brioRatio = options.brioRatio ?? 4;
  const { order, levelSizes } = computeInsertionOrder(n, points, orderMode, seed, brioRatio);

  const insertionRanks = new Array<number>(n).fill(0);
  const pointsByRank = new Array<number>(n + 1).fill(-1);
  for (let r = 0; r < order.length; r++) {
    const idx = order[r]!;
    insertionRanks[idx] = r + 1;
    pointsByRank[r + 1] = idx;
  }

  const { neighborsAtInsertion, finalNeighbors, finalEdgeCount } = buildIncrementalDelaunay2D(points, order);
  const successors: number[][] = Array.from({ length: n }, () => []);
  let successorEdgeCount = 0;
  for (let r = 1; r <= n; r++) {
    const p = pointsByRank[r]!;
    const neighbors = neighborsAtInsertion[p] ?? [];
    for (const x of neighbors) {
      if (x === p) continue;
      // x is an existing point at insertion of p => r(x) < r(p) in a consistent incremental build
      successors[x]!.push(p);
      successorEdgeCount++;
    }
  }
  for (const s of successors) {
    s.sort((a, b) => (insertionRanks[a]! - insertionRanks[b]!));
  }

  const bounds = computeBounds(points);
  const queryBounds = options.queryBounds ?? bounds;
  const gridResolution = Math.max(0, Math.floor(options.gridResolution ?? 16));

  const indexBase: DpNnsIndex = {
    points,
    insertionRanks,
    pointsByRank,
    successors,
    delaunayNeighbors: finalNeighbors,
    bounds,
    queryBounds,
    gridResolution,
    gridStarts: null,
    stats: {
      pointCount: n,
      edgeCountInFinalDelaunay: finalEdgeCount,
      successorEdgeCount,
      levels: levelSizes.length,
      levelSizes,
      gridResolution,
      gridCells: gridResolution * gridResolution,
      gridPrecomputeMs: 0,
      buildMs: 0,
      order: orderMode,
    },
  };

  let gridPrecomputeMs = 0;
  if (gridResolution > 0 && n > 0) {
    const g0 = performance.now();
    indexBase.gridStarts = computeGridStarts(indexBase, gridResolution, queryBounds);
    gridPrecomputeMs = performance.now() - g0;
  }
  const buildMs = performance.now() - t0;
  indexBase.stats.gridPrecomputeMs = gridPrecomputeMs;
  indexBase.stats.buildMs = buildMs;
  return indexBase;
}

export function bruteForceNearest(points: Point2D[], q: Point2D): { index: number; distance: number } {
  let best = -1;
  let bestD = Infinity;
  for (let i = 0; i < points.length; i++) {
    const d = dist(points[i]!, q);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return { index: best, distance: bestD };
}

export function queryDpNns(index: DpNnsIndex, q: Point2D, options: DpNnsQueryOptions = {}): DpNnsQueryResult {
  const n = index.points.length;
  if (n === 0) {
    return { nearestIndex: -1, nearestDistance: Infinity, path: [], trace: [], distanceEvaluations: 0, hops: 0, startIndex: -1, usedGridInit: false };
  }
  let startIndex = options.startPointIndex ?? index.pointsByRank[1]!;
  let usedGridInit = false;
  let gridCell: { gx: number; gy: number } | undefined;
  const useGrid = options.useGridInit ?? true;
  if (options.startPointIndex == null && useGrid && index.gridStarts && index.gridResolution > 0) {
    const g = gridCellOf(q, index.queryBounds, index.gridResolution);
    gridCell = g;
    const gi = g.gy * index.gridResolution + g.gx;
    const s = index.gridStarts[gi];
    if (s != null && s >= 0) {
      startIndex = s;
      usedGridInit = true;
    }
  }

  let current = startIndex;
  let currentDist = dist(index.points[current]!, q);
  let distanceEvaluations = 1; // distance to start
  let hops = 0;
  const path: number[] = [current];
  const trace: DpNnsQueryTraceStep[] = [{ pointIndex: current, rank: index.insertionRanks[current]!, distance: currentDist, evaluationsAtNode: 1 }];

  for (;;) {
    const succ = index.successors[current] ?? [];
    let moved = false;
    let evalsAtNode = 0;
    for (const s of succ) {
      evalsAtNode++;
      distanceEvaluations++;
      const d = dist(index.points[s]!, q);
      if (d < currentDist) {
        current = s;
        currentDist = d;
        hops++;
        path.push(current);
        trace.push({ pointIndex: current, rank: index.insertionRanks[current]!, distance: currentDist, evaluationsAtNode: evalsAtNode });
        moved = true;
        break; // move to first closer in rank order (Eq. 5)
      }
    }
    if (!moved) {
      // record terminal node evals in last trace? keep as-is; evaluationsAtNode was for move-causing scan
      if (trace.length > 0) trace[trace.length - 1]!.evaluationsAtNode = evalsAtNode || trace[trace.length - 1]!.evaluationsAtNode;
      break;
    }
  }

  return { nearestIndex: current, nearestDistance: currentDist, path, trace, distanceEvaluations, hops, startIndex, usedGridInit, gridCell };
}

function gridCellOf(q: Point2D, bounds: Bounds2D, g: number): { gx: number; gy: number } {
  const dx = bounds.maxX - bounds.minX || 1;
  const dy = bounds.maxY - bounds.minY || 1;
  const gx = Math.min(g - 1, Math.max(0, Math.floor(((q.x - bounds.minX) / dx) * g)));
  const gy = Math.min(g - 1, Math.max(0, Math.floor(((q.y - bounds.minY) / dy) * g)));
  return { gx, gy };
}

function computeQueryPath(index: DpNnsIndex, q: Point2D): number[] {
  // Full path from p1 in insertion-rank space for grid precomputation.
  return queryDpNns(index, q, { useGridInit: false }).path;
}

function intersectPathsHighestRank(paths: number[][], insertionRanks: number[]): number {
  if (paths.length === 0) return -1;
  // Start from first path as set, intersect with others
  let set = new Set<number>(paths[0]!);
  for (let i = 1; i < paths.length; i++) {
    const next = new Set<number>(paths[i]!);
    const inter = new Set<number>();
    for (const v of set) if (next.has(v)) inter.add(v);
    set = inter;
    if (set.size === 0) break;
  }
  let best = -1;
  let bestRank = -1;
  for (const v of set) {
    const r = insertionRanks[v] ?? -1;
    if (r > bestRank) {
      bestRank = r;
      best = v;
    }
  }
  return best;
}

export function computeGridStarts(index: DpNnsIndex, g: number, bounds: Bounds2D): Int32Array {
  const cells = g * g;
  const starts = new Int32Array(cells);
  const dx = (bounds.maxX - bounds.minX) || 1;
  const dy = (bounds.maxY - bounds.minY) || 1;
  // Query path at each grid vertex (g+1)^2
  const vpaths: number[][][] = Array.from({ length: g + 1 }, () => Array.from({ length: g + 1 }, () => [] as number[]));
  for (let iy = 0; iy <= g; iy++) {
    for (let ix = 0; ix <= g; ix++) {
      const q = { x: bounds.minX + (dx * ix) / g, y: bounds.minY + (dy * iy) / g };
      vpaths[iy]![ix] = computeQueryPath(index, q);
    }
  }
  for (let iy = 0; iy < g; iy++) {
    for (let ix = 0; ix < g; ix++) {
      const p00 = vpaths[iy]![ix]!;
      const p10 = vpaths[iy]![ix + 1]!;
      const p01 = vpaths[iy + 1]![ix]!;
      const p11 = vpaths[iy + 1]![ix + 1]!;
      let s = intersectPathsHighestRank([p00, p10, p01, p11], index.insertionRanks);
      if (s < 0) s = index.pointsByRank[1]!;
      starts[iy * g + ix] = s;
    }
  }
  return starts;
}

export function queryBatchDpNns(index: DpNnsIndex, queries: Point2D[], options: DpNnsQueryOptions = {}): DpNnsBatchQueryStats & { results: DpNnsQueryResult[] } {
  const t0 = performance.now();
  const results = queries.map(q => queryDpNns(index, q, options));
  const timeMs = performance.now() - t0;
  const m = results.length || 1;
  let sumE = 0, maxE = 0, sumH = 0, maxH = 0, sumD = 0;
  for (const r of results) {
    sumE += r.distanceEvaluations;
    if (r.distanceEvaluations > maxE) maxE = r.distanceEvaluations;
    sumH += r.hops;
    if (r.hops > maxH) maxH = r.hops;
    sumD += r.nearestDistance;
  }
  return {
    queries: results.length,
    avgDistanceEvaluations: sumE / m,
    maxDistanceEvaluations: maxE,
    avgHops: sumH / m,
    maxHops: maxH,
    avgDistance: sumD / m,
    timeMs,
    results,
  };
}
