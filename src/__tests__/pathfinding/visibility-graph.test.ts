/**
 * Visibility Graph Tests
 *
 * Covers construction (build), pathfinding (findPath), geometric edge cases,
 * and documents known limitations of the current line-of-sight implementation.
 *
 * Implementation note: segmentsIntersect uses STRICT interior intersection
 * (t,u ∈ (tolerance, 1-tolerance)). hasLineOfSight supplements this with a
 * midpoint point-in-polygon probe (boundary points count as outside), so:
 *   - Segments touching polygon boundaries only at vertices are NOT blocked.
 *   - Diagonals passing through a convex polygon's interior (entering/exiting
 *     at vertices) ARE blocked (midpoint strictly inside).
 *   - Segments fully inside a polygon ARE blocked.
 * The "occlusion" describe block pins these corrected behaviors.
 */

import { describe, it, expect } from "vitest";
import { VisibilityGraph } from "../../algorithms/pathfinding/visibility-graph/visibility-graph-core";
import type { Obstacle, Point } from "../../algorithms/pathfinding/visibility-graph/visibility-graph-types";

// ── Fixtures ────────────────────────────────────────────────────────────────

/** Unit square at origin. */
const unitSquare: Obstacle = {
  vertices: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }],
};

/** Second square, 4 units to the right. */
const rightSquare: Obstacle = {
  vertices: [{ x: 5, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 1 }, { x: 5, y: 1 }],
};

/** Vertical wall filling the gap between the squares (x ∈ [2,3]). */
const gapWall: Obstacle = {
  vertices: [{ x: 2, y: -1 }, { x: 3, y: -1 }, { x: 3, y: 2 }, { x: 2, y: 2 }],
};

/** Box straddling the horizontal line y=3 (edges crossed in their interiors). */
const corridorBox: Obstacle = {
  vertices: [{ x: 2, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 4 }, { x: 2, y: 4 }],
};

function dist(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Self-consistency: every consecutive pair of the returned path must have LOS. */
function expectPathHasLineOfSight(path: Point[], obstacles: Obstacle[], tol = 1e-6): void {
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const blocked = obstacles.some(o =>
      o.vertices.some((v, j, arr) => {
        // replicate strict-interior intersection test
        const v2 = arr[(j + 1) % arr.length]!;
        const d = (b.x - a.x) * (v2.y - v.y) - (b.y - a.y) * (v2.x - v.x);
        if (Math.abs(d) < tol) return false;
        const t = ((v.x - a.x) * (v2.y - v.y) - (v.y - a.y) * (v2.x - v.x)) / d;
        const u = ((v.x - a.x) * (b.y - a.y) - (v.y - a.y) * (b.x - a.x)) / d;
        return t >= tol && t <= 1 - tol && u >= tol && u <= 1 - tol;
      }),
    );
    expect(blocked, `path segment ${i - 1}→${i} (${JSON.stringify(a)}→${JSON.stringify(b)}) crosses an obstacle edge`).toBe(false);
  }
}

// ── Constructor & config ────────────────────────────────────────────────────

describe("VisibilityGraph constructor", () => {
  it("accepts empty config", () => {
    expect(() => new VisibilityGraph()).not.toThrow();
  });

  it("accepts custom tolerance", () => {
    expect(() => new VisibilityGraph({ tolerance: 1e-3 })).not.toThrow();
  });
});

// ── build() ─────────────────────────────────────────────────────────────────

describe("VisibilityGraph.build", () => {
  it("returns empty graph for no obstacles", () => {
    const vg = new VisibilityGraph();
    const result = vg.build([]);

    expect(result.vertices).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
    expect(result.vertexCount).toBe(0);
    expect(result.edgeCount).toBe(0);
  });

  it("collects all obstacle vertices", () => {
    const vg = new VisibilityGraph();
    const result = vg.build([unitSquare]);

    expect(result.vertexCount).toBe(4);
    expect(result.vertices).toEqual(unitSquare.vertices);
  });

    it("connects perimeter corners of a single convex obstacle (C4)", () => {
    // The 4 perimeter pairs are mutually visible (boundary-touching segments
    // don't count as intersections under the strict-interior rule). The two
    // DIAGONALS pass through the obstacle interior and are correctly blocked
    // by the midpoint point-in-polygon probe.
    const vg = new VisibilityGraph();
    const result = vg.build([unitSquare]);

    // Bidirectional storage: each visible pair contributes 2 directed edges.
    expect(result.edgeCount).toBe(8);

    // Every perimeter pair appears in both directions with matching weights.
    const key = (e: { from: number; to: number }) => `${e.from}->${e.to}`;
    const edgeMap = new Map(result.edges.map(e => [key(e), e.weight]));
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      const w = dist(unitSquare.vertices[i]!, unitSquare.vertices[j]!);
      expect(edgeMap.get(`${i}->${j}`)).toBeCloseTo(w, 9);
      expect(edgeMap.get(`${j}->${i}`)).toBeCloseTo(w, 9);
    }
    // Diagonals must be absent.
    expect(edgeMap.has("0->2")).toBe(false);
    expect(edgeMap.has("1->3")).toBe(false);
  });

  it("weights equal euclidean distance", () => {
    const vg = new VisibilityGraph();
    const result = vg.build([unitSquare]);

    for (const e of result.edges) {
      const expected = dist(result.vertices[e.from]!, result.vertices[e.to]!);
      expect(e.weight).toBeCloseTo(expected, 9);
    }
  });

    it("blocks visibility through an intervening wall", () => {
    // Without the wall: 18 undirected visible pairs (36 directed).
    // Excludes each square's own interior diagonals (midpoint-in-polygon
    // blocked) plus chords piercing a square's interior.
    const open = new VisibilityGraph().build([unitSquare, rightSquare]);
    expect(open.edgeCount).toBe(36);

    // With the wall (x in [2,3], y in [-1,2]), every cross-square segment
    // crosses the wall's vertical edges in their interiors: sq1<->sq2 pairs
    // drop to 0. Remaining: per-square perimeter pairs plus sq1/wall and
    // sq2/wall pairs that stay clear of all three interiors
    //   -> 24 undirected -> 48 directed edges.
    const blocked = new VisibilityGraph().build([unitSquare, rightSquare, gapWall]);
    expect(blocked.vertexCount).toBe(12); // 4 corners x 3 polygons
    expect(blocked.edgeCount).toBe(48);

    // The load-bearing claim: NO direct edge between any sq1 corner (0-3)
    // and any sq2 corner (4-7).
    const crossesGap = blocked.edges.some(
      e => (e.from < 4 && e.to >= 4 && e.to < 8) || (e.to < 4 && e.from >= 4 && e.from < 8),
    );
    expect(crossesGap).toBe(false);
  });

  it("resets previous state on rebuild", () => {
    const vg = new VisibilityGraph();
    vg.build([unitSquare]);
    const second = vg.build([]);
    expect(second.vertexCount).toBe(0);
    expect(second.edgeCount).toBe(0);
  });
});

// ── findPath ────────────────────────────────────────────────────────────────

describe("VisibilityGraph.findPath", () => {
    it("returns direct path when line of sight is clear", () => {
    const vg = new VisibilityGraph();
    vg.build([unitSquare]);

    // Corridor below the square — genuinely unobstructed straight line.
    const start = { x: -2, y: -1 };
    const goal = { x: 8, y: -1 };
    const result = vg.findPath({ start, goal }, [unitSquare]);

    expect(result.found).toBe(true);
    expect(result.path).toHaveLength(2);
    expect(result.path[0]).toEqual(start);
    expect(result.path[1]).toEqual(goal);
    expect(result.cost).toBeCloseTo(dist(start, goal), 9);
  });

  it("routes around an obstacle when direct LOS is blocked", () => {
    const vg = new VisibilityGraph();
    vg.build([unitSquare]);

    // y=0.5 cuts through the square's left/right edge interiors.
    const result = vg.findPath(
      { start: { x: -2, y: 0.5 }, goal: { x: 8, y: 0.5 } },
      [unitSquare],
    );

    expect(result.found).toBe(true);
    expect(result.path.length).toBeGreaterThanOrEqual(3);
    expectPathHasLineOfSight(result.path, [unitSquare]);
  });

  it("direct check works even without a prior build()", () => {
    const vg = new VisibilityGraph();
    const result = vg.findPath(
      { start: { x: 0, y: 0 }, goal: { x: 3, y: 4 } },
      [],
    );

    expect(result.found).toBe(true);
    expect(result.cost).toBeCloseTo(5, 9);
  });

  it("routes around a box blocking the corridor", () => {
    const vg = new VisibilityGraph();
    vg.build([corridorBox]);

    const start: Point = { x: 0, y: 3 };
    const goal: Point = { x: 6, y: 3 };
    const result = vg.findPath({ start, goal }, [corridorBox]);

    expect(result.found).toBe(true);
    // Direct segment y=3 crosses the box's left/right edges in their interiors,
    // so the path must detour through obstacle vertices.
    expect(result.path.length).toBeGreaterThanOrEqual(4);

    // Optimal detour: (0,3) → (2,2) or (2,4) → (4,2) or (4,4) → (6,3),
    // costing 2·√5 + 2 ≈ 6.472.
    expect(result.cost).toBeCloseTo(2 * Math.sqrt(5) + 2, 6);

    // Self-consistency: consecutive waypoints must have line of sight.
    expectPathHasLineOfSight(result.path, [corridorBox]);
  });

  it("fails gracefully when no graph exists and direct LOS is blocked", () => {
    // Without build(), the graph contains no obstacle vertices to route
    // through — a blocked direct line means genuinely no path.
    const vg = new VisibilityGraph();
    const result = vg.findPath(
      { start: { x: 0, y: 3 }, goal: { x: 6, y: 3 } },
      [corridorBox],
    );

    expect(result.found).toBe(false);
    expect(result.path).toHaveLength(0);
    expect(result.cost).toBe(0);
  });

  it("prefers shorter routes among multiple valid detours", () => {
    const vg = new VisibilityGraph();
    vg.build([corridorBox]);

    const result = vg.findPath(
      { start: { x: 0, y: 3 }, goal: { x: 6, y: 3 } },
      [corridorBox],
    );

    // Naive alternatives (e.g. via mixed corners) cost ≥ 10.5; the A* result
    // must match the optimal 2√5+2, not just any valid path.
    expect(result.cost).toBeLessThan(10);
    expect(result.cost).toBeCloseTo(2 * Math.sqrt(5) + 2, 6);
  });
});

// ── Occlusion behavior (correct after midpoint-in-polygon fix) ──────────────

describe("VisibilityGraph occlusion", () => {
  /**
   * hasLineOfSight combines strict-interior edge crossings with a midpoint
   * point-in-polygon probe. These tests guard the fix for the former
   * "diagonals through obstacle interiors are visible" limitation.
   */
  it("blocks diagonals through a convex obstacle's interior", () => {
    // Box diagonal (0,0)→(6,6) passes through the box interior, entering and
    // exiting at vertices (2,2) and (4,4). Midpoint (3,3) is inside → blocked.
    const vg = new VisibilityGraph();
    vg.build([corridorBox]);
    const result = vg.findPath({ start: { x: 0, y: 0 }, goal: { x: 6, y: 6 } }, [corridorBox]);

    expect(result.found).toBe(true);
    // Must now route AROUND the box via its corners, not straight through.
    expect(result.path.length).toBeGreaterThan(2);
        expect(result.cost).toBeGreaterThan(dist({ x: 0, y: 0 }, { x: 6, y: 6 }));
    expectPathHasLineOfSight(result.path, [corridorBox]);
  });

    it("blocks segments fully inside a polygon", () => {
    const vg = new VisibilityGraph();
    const result = vg.build([unitSquare]);

    // Interior point to a corner crosses no edges, but the segment's midpoint
    // is strictly inside the square → blocked. In fact EVERY segment from a
    // strictly-interior point has an interior midpoint, so nothing is visible:
    // pathfinding from inside an obstacle correctly reports unreachable.
    const inside = { x: 0.5, y: 0.5 };
    const corner = unitSquare.vertices[2]!; // (1,1)
    const r = vg.findPath({ start: inside, goal: corner }, [unitSquare]);
    void result;
    void vg;
    expect(r.found).toBe(false);
  });

  it("keeps edges along polygon boundaries and between vertices visible", () => {
    const vg = new VisibilityGraph();
    vg.build([unitSquare]);

    // Adjacent vertices of the square: midpoint lies ON the boundary — must
    // stay visible or the visibility graph loses its perimeter.
    const r = vg.findPath(
      { start: unitSquare.vertices[0]!, goal: unitSquare.vertices[1]! },
      [unitSquare],
    );
    expect(r.found).toBe(true);
    expect(r.path).toHaveLength(2);
    expect(r.cost).toBeCloseTo(1, 6);
  });

  it("validateInput config option is accepted but not enforced", () => {
    // The config exposes validateInput but the core never validates inputs;
    // degenerate polygons do not throw. Pin current tolerance of garbage-in:
    const vg = new VisibilityGraph({ validateInput: true });
    const degenerate: Obstacle = { vertices: [{ x: 0, y: 0 }] };
    expect(() => vg.build([degenerate])).not.toThrow();
  });
});
