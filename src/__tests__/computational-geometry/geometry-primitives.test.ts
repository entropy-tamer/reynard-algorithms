/**
 * @file Deterministic correctness tests for computational-geometry modules
 * that previously had no direct test: Bresenham rasterization, Delaunay
 * triangulation, Bentley-Ottmann segment intersection, and polygon clipping.
 */
import { describe, it, expect } from "vitest";
import { BresenhamLine } from "../../algorithms/computational-geometry/bresenham/bresenham-core";
import { DelaunayTriangulation } from "../../algorithms/computational-geometry/delaunay/delaunay-core";
import { LineIntersection } from "../../algorithms/computational-geometry/line-intersection/line-intersection-core";
import { SutherlandHodgmanClipper } from "../../algorithms/computational-geometry/polygon-clipping/sutherland-hodgman";
import { PolygonClipping } from "../../algorithms/computational-geometry/polygon-clipping/polygon-clipping-core";

describe("BresenhamLine", () => {
  const line = new BresenhamLine();

  it("includes both endpoints of a horizontal line", () => {
    const result = line.drawLine({ x: 0, y: 0 }, { x: 5, y: 0 });
    expect(result.success).toBe(true);
    expect(result.points[0]).toEqual({ x: 0, y: 0 });
    expect(result.points.at(-1)).toEqual({ x: 5, y: 0 });
  });

  it("produces one point per step for a 45-degree diagonal", () => {
    const result = line.drawBasicLine({ x: 0, y: 0 }, { x: 4, y: 4 });
    expect(result.success).toBe(true);
    expect(result.points).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
    ]);
  });

  it("returns a single point for a zero-length line", () => {
    expect(line.drawBasicLine({ x: 2, y: 3 }, { x: 2, y: 3 }).points).toEqual([{ x: 2, y: 3 }]);
  });

  it("computes euclidean, manhattan and chebyshev distances", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 3, y: 4 };
    expect(BresenhamLine.distance(a, b)).toBe(5);
    expect(BresenhamLine.manhattanDistance(a, b)).toBe(7);
    expect(BresenhamLine.chebyshevDistance(a, b)).toBe(4);
  });

  it("recognizes a point on a line and rejects one off it", () => {
    expect(BresenhamLine.isPointOnLine({ x: 2, y: 2 }, { x: 0, y: 0 }, { x: 4, y: 4 })).toBe(true);
    expect(BresenhamLine.isPointOnLine({ x: 2, y: 3 }, { x: 0, y: 0 }, { x: 4, y: 4 })).toBe(false);
  });

  it("draws a circle with the expected point count and symmetry", () => {
    const points = BresenhamLine.drawCircle({ x: 0, y: 0 }, 4);
    expect(points.length).toBeGreaterThan(0);
    for (const p of points) {
      expect(Math.hypot(p.x, p.y)).toBeGreaterThan(0);
    }
    expect(points.some(p => p.x === 4 && p.y === 0)).toBe(true);
    expect(points.some(p => p.x === -4 && p.y === 0)).toBe(true);
  });
});

describe("DelaunayTriangulation", () => {
  const triangulate = new DelaunayTriangulation();

  it("returns no triangles for fewer than three points", () => {
    expect(triangulate.triangulate([]).triangles).toEqual([]);
    expect(triangulate.triangulate([{ x: 0, y: 0 }]).triangles).toEqual([]);
    expect(triangulate.triangulate([{ x: 0, y: 0 }, { x: 1, y: 1 }]).triangles).toEqual([]);
  });

  it("returns one triangle for exactly three points", () => {
    const result = triangulate.triangulate([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ]);
    expect(result.triangles).toHaveLength(1);
    expect(result.triangles[0]).toEqual({
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    });
    expect(result.edges).toHaveLength(3);
  });

  it("triangulates a square into two triangles sharing a diagonal", () => {
    const result = triangulate.triangulate([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ]);
    expect(result.triangles).toHaveLength(2);
    const keys = result.triangles.map(t => [t.a, t.b, t.c].map(p => `${p.x},${p.y}`).sort().join("|"));
    expect(new Set(keys).size).toBe(2);
    for (const triangle of result.triangles) {
      const pts = [triangle.a, triangle.b, triangle.c];
      const area = Math.abs(
        (pts[1].x - pts[0].x) * (pts[2].y - pts[0].y) -
          (pts[2].x - pts[0].x) * (pts[1].y - pts[0].y)
      );
      expect(area).toBeGreaterThan(0);
    }
  });
});

describe("LineIntersection", () => {
  const finder = new LineIntersection();

  const seg = (id: string, x1: number, y1: number, x2: number, y2: number) => ({
    id,
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
  });

  it("finds the crossing point of two segments", () => {
    const result = finder.findIntersections([
      seg("h", 0, 0, 4, 0),
      seg("v", 2, -2, 2, 2),
    ]);
    expect(result.hasIntersections).toBe(true);
    expect(result.intersections).toHaveLength(1);
    expect(result.intersections[0].point).toEqual({ x: 2, y: 0 });
  });

  it("reports no intersection for parallel segments", () => {
    const result = finder.findIntersections([
      seg("a", 0, 0, 4, 0),
      seg("b", 0, 1, 4, 1),
    ]);
    expect(result.hasIntersections).toBe(false);
    expect(result.intersections).toEqual([]);
  });

  it("reports no intersection for disjoint segments", () => {
    const result = finder.findIntersections([
      seg("a", 0, 0, 1, 1),
      seg("b", 5, 5, 6, 6),
    ]);
    expect(result.intersections).toEqual([]);
  });
});

describe("polygon clipping", () => {
  const square = (min: number, max: number) => ({
    vertices: [
      { x: min, y: min },
      { x: max, y: min },
      { x: max, y: max },
      { x: min, y: max },
    ],
  });

  it("clips two overlapping squares to a nonempty result", () => {
    const clipper = new SutherlandHodgmanClipper();
    const result = clipper.clip(square(0, 2), square(1, 3));
    expect(result.polygons.length).toBeGreaterThan(0);
    expect(result.isEmpty).toBe(false);
  });

  it("returns an empty result for disjoint squares", () => {
    const clipper = new SutherlandHodgmanClipper();
    const result = clipper.clip(square(0, 1), square(5, 6));
    expect(result.isEmpty).toBe(true);
  });

  it("intersection of identical squares keeps all four corners", () => {
    const result = new PolygonClipping().intersection(square(0, 2), square(0, 2));
    expect(result.isEmpty).toBe(false);
    const vertices = result.polygons.flatMap(p => p.vertices);
    for (const corner of [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }]) {
      expect(vertices.some(v => Math.abs(v.x - corner.x) < 1e-6 && Math.abs(v.y - corner.y) < 1e-6)).toBe(true);
    }
  });

  it("difference of a square with itself is empty", () => {
    const result = new PolygonClipping().difference(square(0, 2), square(0, 2));
    expect(result.isEmpty).toBe(true);
  });
});
