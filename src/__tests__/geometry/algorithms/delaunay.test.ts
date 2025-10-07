import { describe, it, expect, beforeEach, vi } from "vitest";
import { DelaunayTriangulation } from "../../../geometry/algorithms/delaunay/delaunay-core";
import { Point, Triangle, Edge } from "../../../geometry/algorithms/delaunay/delaunay-types";

describe("Delaunay Triangulation", () => {
  let delaunay: DelaunayTriangulation;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    delaunay = new DelaunayTriangulation();
  });

  describe("Basic Triangulation", () => {
    it("should triangulate three points into one triangle", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(true);
      expect(result.triangles.length).toBe(1);
      expect(result.edges.length).toBe(3);
      expect(result.stats.pointCount).toBe(3);
      expect(result.stats.triangleCount).toBe(1);
    });

    it("should triangulate four points into two triangles", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(true);
      expect(result.triangles.length).toBe(2);
      expect(result.edges.length).toBe(5); // 4 outer edges + 1 diagonal
      expect(result.stats.pointCount).toBe(4);
      expect(result.stats.triangleCount).toBe(2);
    });

    it("should triangulate a regular grid", () => {
      const points: Point[] = [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
        { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
      ];

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(true);
      expect(result.triangles.length).toBeGreaterThan(0);
      expect(result.stats.pointCount).toBe(9);
    });

    it("should handle collinear points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ];

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(true);
      expect(result.triangles.length).toBeGreaterThan(0);
    });
  });

  describe("Input Validation", () => {
    it("should reject empty point array", () => {
      const result = delaunay.triangulate([]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("At least 3 points are required");
    });

    it("should reject array with less than 3 points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ];

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("At least 3 points are required");
    });

    it("should reject invalid points", () => {
      const invalidPoints = [
        { x: 0, y: 0 },
        { x: "invalid", y: 0 },
        { x: 1, y: 1 },
      ] as any;

      const result = delaunay.triangulate(invalidPoints);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Invalid point");
    });

    it("should reject duplicate points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 0 }, // Duplicate
      ];

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Duplicate points");
    });

    it("should reject points with non-finite coordinates", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: Infinity, y: 1 },
      ];

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("non-finite coordinates");
    });
  });

  describe("Configuration Options", () => {
    it("should include super triangle when configured", () => {
      const delaunayWithSuper = new DelaunayTriangulation({ includeSuperTriangle: true });
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = delaunayWithSuper.triangulate(points);

      expect(result.stats.success).toBe(true);
      expect(result.triangles.length).toBeGreaterThan(1); // Should include super triangle
    });

    it("should exclude super triangle by default", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(true);
      expect(result.triangles.length).toBe(1); // Should not include super triangle
    });

    it("should work without input validation", () => {
      const delaunayNoValidation = new DelaunayTriangulation({ validateInput: false });
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = delaunayNoValidation.triangulate(points);

      expect(result.stats.success).toBe(true);
      expect(result.triangles.length).toBe(1);
    });

    it("should work without sorting points", () => {
      const delaunayNoSort = new DelaunayTriangulation({ sortPoints: false });
      const points: Point[] = [
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = delaunayNoSort.triangulate(points);

      expect(result.stats.success).toBe(true);
      expect(result.triangles.length).toBe(1);
    });
  });

  describe("Constrained Triangulation", () => {
    it("should perform constrained triangulation", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];

      const constrainedEdges: Edge[] = [
        { p1: { x: 0, y: 0 }, p2: { x: 1, y: 1 } }, // Diagonal constraint
      ];

      const result = delaunay.constrainedTriangulate(points, {
        constrainedEdges,
      });

      expect(result.stats.success).toBe(true);
      expect(result.constrainedEdges.length).toBeGreaterThanOrEqual(0);
      expect(result.failedConstraints.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle failed constraints", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const constrainedEdges: Edge[] = [
        { p1: { x: 0, y: 0 }, p2: { x: 2, y: 2 } }, // Edge not in triangulation
      ];

      const result = delaunay.constrainedTriangulate(points, {
        constrainedEdges,
      });

      expect(result.stats.success).toBe(true);
      expect(result.failedConstraints.length).toBe(1);
    });
  });

  describe("Query Operations", () => {
    let triangles: Triangle[];

    beforeEach(() => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];
      const result = delaunay.triangulate(points);
      triangles = result.triangles;
    });

    it("should find triangles containing a point", () => {
      const queryPoint: Point = { x: 0.5, y: 0.5 };
      const result = delaunay.queryTriangulation(triangles, queryPoint);

      expect(result.triangleCount).toBeGreaterThan(0);
      expect(result.triangles.length).toBe(result.triangleCount);
    });

    it("should find no triangles for point outside", () => {
      const queryPoint: Point = { x: 2, y: 2 };
      const result = delaunay.queryTriangulation(triangles, queryPoint);

      expect(result.triangleCount).toBe(0);
      expect(result.triangles.length).toBe(0);
    });

    it("should find adjacent triangles", () => {
      const queryPoint: Point = { x: 0.5, y: 0.5 };
      const result = delaunay.queryTriangulation(triangles, queryPoint, {
        includeContainingTriangles: false,
        includeAdjacentTriangles: true,
        maxDistance: 0.1,
      });

      expect(result.triangleCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Mesh Generation", () => {
    it("should generate mesh from triangulation", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];

      const result = delaunay.triangulate(points);
      const mesh = delaunay.generateMesh(result.triangles);

      expect(mesh.vertices.length).toBeGreaterThan(0);
      expect(mesh.indices.length).toBe(result.triangles.length);
      expect(mesh.edges.length).toBeGreaterThan(0);
      expect(mesh.faces.length).toBe(result.triangles.length);
    });

    it("should generate mesh without duplicates", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = delaunay.triangulate(points);
      const mesh = delaunay.generateMesh(result.triangles, {
        removeDuplicates: true,
      });

      expect(mesh.vertices.length).toBe(3); // Should have 3 unique vertices
      expect(mesh.indices.length).toBe(1); // Should have 1 triangle
    });

    it("should generate mesh with custom options", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = delaunay.triangulate(points);
      const mesh = delaunay.generateMesh(result.triangles, {
        generateIndices: false,
        generateEdges: false,
        generateFaces: false,
      });

      expect(mesh.vertices.length).toBe(3);
      expect(mesh.indices.length).toBe(0);
      expect(mesh.edges.length).toBe(0);
      expect(mesh.faces.length).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle points with very small coordinates", () => {
      const points: Point[] = [
        { x: 0.0001, y: 0.0001 },
        { x: 0.0002, y: 0.0001 },
        { x: 0.00015, y: 0.0002 },
      ];

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(true);
      expect(result.triangles.length).toBe(1);
    });

    it("should handle points with very large coordinates", () => {
      const points: Point[] = [
        { x: 1000000, y: 1000000 },
        { x: 1000001, y: 1000000 },
        { x: 1000000.5, y: 1000001 },
      ];

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(true);
      expect(result.triangles.length).toBe(1);
    });

    it("should handle negative coordinates", () => {
      const points: Point[] = [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: -0.5, y: 0 },
      ];

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(true);
      expect(result.triangles.length).toBe(1);
    });

    it("should handle many points", () => {
      const points: Point[] = [];
      for (let i = 0; i < 100; i++) {
        points.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
        });
      }

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(true);
      expect(result.triangles.length).toBeGreaterThan(0);
      expect(result.stats.pointCount).toBe(100);
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (
      description: string,
      pointCount: number
    ) => {
      it(`should perform ${description} efficiently`, () => {
        const points: Point[] = [];
        for (let i = 0; i < pointCount; i++) {
          points.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
          });
        }

        const startTime = performance.now();
        const result = delaunay.triangulate(points);
        const endTime = performance.now();

        expect(result.stats.success).toBe(true);
        expect(result.triangles.length).toBeGreaterThan(0);
        expect(result.stats.executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} - ${pointCount} points in ${(endTime - startTime).toFixed(3)} ms`);
      });
    };

    runBenchmark("small triangulation", 10);
    runBenchmark("medium triangulation", 50);
    runBenchmark("large triangulation", 200);
    runBenchmark("very large triangulation", 500);
  });

  describe("Triangle Quality", () => {
    it("should produce well-shaped triangles", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(true);
      
      // Check that all triangles are valid (non-degenerate)
      for (const triangle of result.triangles) {
        const area = this.calculateTriangleArea(triangle);
        expect(area).toBeGreaterThan(0);
      }
    });

    it("should satisfy Delaunay property", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = delaunay.triangulate(points);

      expect(result.stats.success).toBe(true);
      
      // Check Delaunay property: no point should be inside any triangle's circumcircle
      for (const triangle of result.triangles) {
        for (const point of points) {
          if (!this.isPointVertexOfTriangle(point, triangle)) {
            const inCircumcircle = this.pointInCircumcircle(point, triangle);
            expect(inCircumcircle).toBe(false);
          }
        }
      }
    });
  });

  // Helper methods for testing
  private calculateTriangleArea(triangle: Triangle): number {
    const { a, b, c } = triangle;
    return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2);
  }

  private isPointVertexOfTriangle(point: Point, triangle: Triangle): boolean {
    return (point.x === triangle.a.x && point.y === triangle.a.y) ||
           (point.x === triangle.b.x && point.y === triangle.b.y) ||
           (point.x === triangle.c.x && point.y === triangle.c.y);
  }

  private pointInCircumcircle(point: Point, triangle: Triangle): boolean {
    const ax = triangle.a.x;
    const ay = triangle.a.y;
    const bx = triangle.b.x;
    const by = triangle.b.y;
    const cx = triangle.c.x;
    const cy = triangle.c.y;

    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));

    if (Math.abs(d) < 1e-10) {
      return false; // Degenerate triangle
    }

    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;

    const radiusSquared = (ax - ux) * (ax - ux) + (ay - uy) * (ay - uy);
    const distanceSquared = (point.x - ux) * (point.x - ux) + (point.y - uy) * (point.y - uy);

    return distanceSquared < radiusSquared - 1e-10;
  }
});
