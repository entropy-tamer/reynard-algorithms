import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConvexHull } from "../../../geometry/algorithms/convex-hull/convex-hull-core";
import { Point, ConvexHullAlgorithm } from "../../../geometry/algorithms/convex-hull/convex-hull-types";

describe("Convex Hull Algorithms", () => {
  let convexHull: ConvexHull;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    convexHull = new ConvexHull();
  });

  describe("Graham Scan Algorithm", () => {
    it("should compute convex hull for simple triangle", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHull.compute(points, "graham-scan");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.edges.length).toBe(3);
      expect(result.stats.algorithm).toBe("graham-scan");
    });

    it("should exclude interior points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 }, // Interior point
      ];

      const result = convexHull.compute(points, "graham-scan");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3); // Should exclude interior point
      expect(result.hull).not.toContainEqual({ x: 0.5, y: 0.5 });
    });

    it("should handle collinear points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
      ];

      const result = convexHull.compute(points, "graham-scan");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3); // Should exclude collinear point
    });
  });

  describe("Jarvis March Algorithm", () => {
    it("should compute convex hull using Jarvis March", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "jarvis-march");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("jarvis-march");
    });

    it("should handle points in a square", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 }, // Interior point
      ];

      const result = convexHull.compute(points, "jarvis-march");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(4);
    });
  });

  describe("QuickHull Algorithm", () => {
    it("should compute convex hull using QuickHull", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "quickhull");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("quickhull");
    });

    it("should handle many points efficiently", () => {
      const points: Point[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
        });
      }

      const result = convexHull.compute(points, "quickhull");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBeGreaterThan(0);
    });
  });

  describe("Monotone Chain Algorithm", () => {
    it("should compute convex hull using Monotone Chain", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "monotone-chain");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("monotone-chain");
    });
  });

  describe("Gift Wrapping Algorithm", () => {
    it("should compute convex hull using Gift Wrapping", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "gift-wrapping");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("gift-wrapping");
    });
  });

  describe("Input Validation", () => {
    it("should reject empty point array", () => {
      const result = convexHull.compute([]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("At least 3 points are required");
    });

    it("should reject array with less than 3 points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("At least 3 points are required");
    });

    it("should reject invalid points", () => {
      const invalidPoints = [
        { x: 0, y: 0 },
        { x: "invalid", y: 0 },
        { x: 1, y: 1 },
      ] as any;

      const result = convexHull.compute(invalidPoints);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Invalid point");
    });

    it("should reject points with non-finite coordinates", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: Infinity, y: 1 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("non-finite coordinates");
    });

    it("should handle duplicate points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0, y: 0 }, // Duplicate
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });
  });

  describe("Configuration Options", () => {
    it("should work without input validation", () => {
      const convexHullNoValidation = new ConvexHull({ validateInput: false });
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHullNoValidation.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should work without sorting input", () => {
      const convexHullNoSort = new ConvexHull({ sortInput: false });
      const points: Point[] = [
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHullNoSort.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should use custom tolerance", () => {
      const convexHullCustomTolerance = new ConvexHull({ tolerance: 1e-5 });
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHullCustomTolerance.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });
  });

  describe("Hull Analysis", () => {
    let hull: Point[];

    beforeEach(() => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];
      const result = convexHull.compute(points);
      hull = result.hull;
    });

    it("should compute hull area", () => {
      const analysis = convexHull.analyzeHull(hull, { computeArea: true });

      expect(analysis.area).toBeCloseTo(1); // Square with side length 1
    });

    it("should compute hull perimeter", () => {
      const analysis = convexHull.analyzeHull(hull, { computePerimeter: true });

      expect(analysis.perimeter).toBeCloseTo(4); // Square with side length 1
    });

    it("should compute hull centroid", () => {
      const analysis = convexHull.analyzeHull(hull, { computeCentroid: true });

      expect(analysis.centroid.x).toBeCloseTo(0.5);
      expect(analysis.centroid.y).toBeCloseTo(0.5);
    });

    it("should compute bounding box", () => {
      const analysis = convexHull.analyzeHull(hull, { computeBoundingBox: true });

      expect(analysis.boundingBox.minX).toBe(0);
      expect(analysis.boundingBox.minY).toBe(0);
      expect(analysis.boundingBox.maxX).toBe(1);
      expect(analysis.boundingBox.maxY).toBe(1);
    });

    it("should compute all analysis properties", () => {
      const analysis = convexHull.analyzeHull(hull);

      expect(analysis.area).toBeGreaterThan(0);
      expect(analysis.perimeter).toBeGreaterThan(0);
      expect(analysis.centroid.x).toBeDefined();
      expect(analysis.centroid.y).toBeDefined();
      expect(analysis.boundingBox.minX).toBeDefined();
      expect(analysis.boundingBox.minY).toBeDefined();
      expect(analysis.boundingBox.maxX).toBeDefined();
      expect(analysis.boundingBox.maxY).toBeDefined();
    });
  });

  describe("Hull Comparison", () => {
    it("should compare two identical hulls", () => {
      const hull1: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];
      const hull2: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const comparison = convexHull.compareHulls(hull1, hull2);

      expect(comparison.identical).toBe(true);
      expect(comparison.areaDifference).toBeCloseTo(0);
      expect(comparison.perimeterDifference).toBeCloseTo(0);
    });

    it("should compare two different hulls", () => {
      const hull1: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];
      const hull2: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
      ];

      const comparison = convexHull.compareHulls(hull1, hull2);

      expect(comparison.identical).toBe(false);
      expect(comparison.areaDifference).toBeGreaterThan(0);
    });

    it("should compute Hausdorff distance when requested", () => {
      const hull1: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];
      const hull2: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const comparison = convexHull.compareHulls(hull1, hull2, {
        compareShapes: true,
      });

      expect(comparison.hausdorffDistance).toBeDefined();
      expect(comparison.hausdorffDistance).toBeCloseTo(0);
    });
  });

  describe("Hull Simplification", () => {
    it("should simplify hull by removing unnecessary points", () => {
      const hull: Point[] = [
        { x: 0, y: 0 },
        { x: 0.1, y: 0.05 },
        { x: 0.2, y: 0.1 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHull.simplifyHull(hull, { maxDistance: 0.2 });

      expect(result.simplifiedHull.length).toBeLessThan(hull.length);
      expect(result.pointsRemoved).toBeGreaterThan(0);
      expect(result.compressionRatio).toBeGreaterThan(1);
    });

    it("should preserve endpoints when configured", () => {
      const hull: Point[] = [
        { x: 0, y: 0 },
        { x: 0.1, y: 0.05 },
        { x: 1, y: 0 },
      ];

      const result = convexHull.simplifyHull(hull, {
        maxDistance: 0.2,
        preserveEndpoints: true,
      });

      expect(result.simplifiedHull[0]).toEqual(hull[0]);
      expect(result.simplifiedHull[result.simplifiedHull.length - 1]).toEqual(hull[hull.length - 1]);
    });

    it("should not simplify if points are necessary", () => {
      const hull: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHull.simplifyHull(hull, { maxDistance: 0.1 });

      expect(result.simplifiedHull.length).toBe(hull.length);
      expect(result.pointsRemoved).toBe(0);
      expect(result.compressionRatio).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle collinear points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(2); // Should only include endpoints
    });

    it("should handle points with very small coordinates", () => {
      const points: Point[] = [
        { x: 0.0001, y: 0.0001 },
        { x: 0.0002, y: 0.0001 },
        { x: 0.00015, y: 0.0002 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should handle points with very large coordinates", () => {
      const points: Point[] = [
        { x: 1000000, y: 1000000 },
        { x: 1000001, y: 1000000 },
        { x: 1000000.5, y: 1000001 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should handle negative coordinates", () => {
      const points: Point[] = [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: -0.5, y: 0 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });
  });

  describe("Algorithm Comparison", () => {
    const testPoints: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0.5, y: 0.5 },
    ];

    const algorithms: ConvexHullAlgorithm[] = [
      "graham-scan",
      "jarvis-march",
      "quickhull",
      "monotone-chain",
      "gift-wrapping",
    ];

    algorithms.forEach(algorithm => {
      it(`should produce consistent results with ${algorithm}`, () => {
        const result = convexHull.compute(testPoints, algorithm);

        expect(result.stats.success).toBe(true);
        expect(result.hull.length).toBe(4); // Square hull
        expect(result.edges.length).toBe(4);
        expect(result.stats.algorithm).toBe(algorithm);
      });
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (description: string, pointCount: number, algorithm: ConvexHullAlgorithm) => {
      it(`should perform ${description} efficiently with ${algorithm}`, () => {
        const points: Point[] = [];
        for (let i = 0; i < pointCount; i++) {
          points.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
          });
        }

        const result = convexHull.compute(points, algorithm);

        expect(result.stats.success).toBe(true);
        expect(result.hull.length).toBeGreaterThan(0);
        expect(result.stats.executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} (${algorithm}) - ${pointCount} points in ${(endTime - startTime).toFixed(3)} ms`);
      });
    };

    // Test different algorithms with different point counts
    runBenchmark("small hull", 10, "graham-scan");
    runBenchmark("medium hull", 50, "graham-scan");
    runBenchmark("large hull", 200, "graham-scan");
    runBenchmark("small hull", 10, "jarvis-march");
    runBenchmark("medium hull", 50, "jarvis-march");
    runBenchmark("small hull", 10, "quickhull");
    runBenchmark("medium hull", 50, "quickhull");
    runBenchmark("large hull", 200, "quickhull");
  });

  describe("Hull Properties", () => {
    it("should produce counter-clockwise hull", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);

      // Check that hull is counter-clockwise
      let sum = 0;
      for (let i = 0; i < result.hull.length; i++) {
        const j = (i + 1) % result.hull.length;
        const k = (i + 2) % result.hull.length;
        sum +=
          (result.hull[j].x - result.hull[i].x) * (result.hull[k].y - result.hull[i].y) -
          (result.hull[j].y - result.hull[i].y) * (result.hull[k].x - result.hull[i].x);
      }
      expect(sum).toBeGreaterThan(0); // Positive sum indicates counter-clockwise
    });

    it("should include all extreme points", () => {
      const points: Point[] = [
        { x: 0, y: 0 }, // Bottom-left
        { x: 10, y: 0 }, // Bottom-right
        { x: 10, y: 10 }, // Top-right
        { x: 0, y: 10 }, // Top-left
        { x: 5, y: 5 }, // Center
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(4);

      // Check that all extreme points are included
      const hullPoints = result.hull.map(p => `${p.x},${p.y}`);
      expect(hullPoints).toContain("0,0");
      expect(hullPoints).toContain("10,0");
      expect(hullPoints).toContain("10,10");
      expect(hullPoints).toContain("0,10");
    });
  });
});

describe("Convex Hull Algorithms", () => {
  let convexHull: ConvexHull;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    convexHull = new ConvexHull();
  });

  describe("Graham Scan Algorithm", () => {
    it("should compute convex hull for simple triangle", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHull.compute(points, "graham-scan");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.edges.length).toBe(3);
      expect(result.stats.algorithm).toBe("graham-scan");
    });

    it("should exclude interior points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 }, // Interior point
      ];

      const result = convexHull.compute(points, "graham-scan");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3); // Should exclude interior point
      expect(result.hull).not.toContainEqual({ x: 0.5, y: 0.5 });
    });

    it("should handle collinear points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
      ];

      const result = convexHull.compute(points, "graham-scan");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3); // Should exclude collinear point
    });
  });

  describe("Jarvis March Algorithm", () => {
    it("should compute convex hull using Jarvis March", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "jarvis-march");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("jarvis-march");
    });

    it("should handle points in a square", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 }, // Interior point
      ];

      const result = convexHull.compute(points, "jarvis-march");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(4);
    });
  });

  describe("QuickHull Algorithm", () => {
    it("should compute convex hull using QuickHull", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "quickhull");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("quickhull");
    });

    it("should handle many points efficiently", () => {
      const points: Point[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
        });
      }

      const result = convexHull.compute(points, "quickhull");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBeGreaterThan(0);
    });
  });

  describe("Monotone Chain Algorithm", () => {
    it("should compute convex hull using Monotone Chain", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "monotone-chain");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("monotone-chain");
    });
  });

  describe("Gift Wrapping Algorithm", () => {
    it("should compute convex hull using Gift Wrapping", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "gift-wrapping");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("gift-wrapping");
    });
  });

  describe("Input Validation", () => {
    it("should reject empty point array", () => {
      const result = convexHull.compute([]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("At least 3 points are required");
    });

    it("should reject array with less than 3 points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("At least 3 points are required");
    });

    it("should reject invalid points", () => {
      const invalidPoints = [
        { x: 0, y: 0 },
        { x: "invalid", y: 0 },
        { x: 1, y: 1 },
      ] as any;

      const result = convexHull.compute(invalidPoints);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Invalid point");
    });

    it("should reject points with non-finite coordinates", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: Infinity, y: 1 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("non-finite coordinates");
    });

    it("should handle duplicate points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0, y: 0 }, // Duplicate
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });
  });

  describe("Configuration Options", () => {
    it("should work without input validation", () => {
      const convexHullNoValidation = new ConvexHull({ validateInput: false });
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHullNoValidation.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should work without sorting input", () => {
      const convexHullNoSort = new ConvexHull({ sortInput: false });
      const points: Point[] = [
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHullNoSort.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should use custom tolerance", () => {
      const convexHullCustomTolerance = new ConvexHull({ tolerance: 1e-5 });
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHullCustomTolerance.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });
  });

  describe("Hull Analysis", () => {
    let hull: Point[];

    beforeEach(() => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];
      const result = convexHull.compute(points);
      hull = result.hull;
    });

    it("should compute hull area", () => {
      const analysis = convexHull.analyzeHull(hull, { computeArea: true });

      expect(analysis.area).toBeCloseTo(1); // Square with side length 1
    });

    it("should compute hull perimeter", () => {
      const analysis = convexHull.analyzeHull(hull, { computePerimeter: true });

      expect(analysis.perimeter).toBeCloseTo(4); // Square with side length 1
    });

    it("should compute hull centroid", () => {
      const analysis = convexHull.analyzeHull(hull, { computeCentroid: true });

      expect(analysis.centroid.x).toBeCloseTo(0.5);
      expect(analysis.centroid.y).toBeCloseTo(0.5);
    });

    it("should compute bounding box", () => {
      const analysis = convexHull.analyzeHull(hull, { computeBoundingBox: true });

      expect(analysis.boundingBox.minX).toBe(0);
      expect(analysis.boundingBox.minY).toBe(0);
      expect(analysis.boundingBox.maxX).toBe(1);
      expect(analysis.boundingBox.maxY).toBe(1);
    });

    it("should compute all analysis properties", () => {
      const analysis = convexHull.analyzeHull(hull);

      expect(analysis.area).toBeGreaterThan(0);
      expect(analysis.perimeter).toBeGreaterThan(0);
      expect(analysis.centroid.x).toBeDefined();
      expect(analysis.centroid.y).toBeDefined();
      expect(analysis.boundingBox.minX).toBeDefined();
      expect(analysis.boundingBox.minY).toBeDefined();
      expect(analysis.boundingBox.maxX).toBeDefined();
      expect(analysis.boundingBox.maxY).toBeDefined();
    });
  });

  describe("Hull Comparison", () => {
    it("should compare two identical hulls", () => {
      const hull1: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];
      const hull2: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const comparison = convexHull.compareHulls(hull1, hull2);

      expect(comparison.identical).toBe(true);
      expect(comparison.areaDifference).toBeCloseTo(0);
      expect(comparison.perimeterDifference).toBeCloseTo(0);
    });

    it("should compare two different hulls", () => {
      const hull1: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];
      const hull2: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
      ];

      const comparison = convexHull.compareHulls(hull1, hull2);

      expect(comparison.identical).toBe(false);
      expect(comparison.areaDifference).toBeGreaterThan(0);
    });

    it("should compute Hausdorff distance when requested", () => {
      const hull1: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];
      const hull2: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const comparison = convexHull.compareHulls(hull1, hull2, {
        compareShapes: true,
      });

      expect(comparison.hausdorffDistance).toBeDefined();
      expect(comparison.hausdorffDistance).toBeCloseTo(0);
    });
  });

  describe("Hull Simplification", () => {
    it("should simplify hull by removing unnecessary points", () => {
      const hull: Point[] = [
        { x: 0, y: 0 },
        { x: 0.1, y: 0.05 },
        { x: 0.2, y: 0.1 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHull.simplifyHull(hull, { maxDistance: 0.2 });

      expect(result.simplifiedHull.length).toBeLessThan(hull.length);
      expect(result.pointsRemoved).toBeGreaterThan(0);
      expect(result.compressionRatio).toBeGreaterThan(1);
    });

    it("should preserve endpoints when configured", () => {
      const hull: Point[] = [
        { x: 0, y: 0 },
        { x: 0.1, y: 0.05 },
        { x: 1, y: 0 },
      ];

      const result = convexHull.simplifyHull(hull, {
        maxDistance: 0.2,
        preserveEndpoints: true,
      });

      expect(result.simplifiedHull[0]).toEqual(hull[0]);
      expect(result.simplifiedHull[result.simplifiedHull.length - 1]).toEqual(hull[hull.length - 1]);
    });

    it("should not simplify if points are necessary", () => {
      const hull: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHull.simplifyHull(hull, { maxDistance: 0.1 });

      expect(result.simplifiedHull.length).toBe(hull.length);
      expect(result.pointsRemoved).toBe(0);
      expect(result.compressionRatio).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle collinear points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(2); // Should only include endpoints
    });

    it("should handle points with very small coordinates", () => {
      const points: Point[] = [
        { x: 0.0001, y: 0.0001 },
        { x: 0.0002, y: 0.0001 },
        { x: 0.00015, y: 0.0002 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should handle points with very large coordinates", () => {
      const points: Point[] = [
        { x: 1000000, y: 1000000 },
        { x: 1000001, y: 1000000 },
        { x: 1000000.5, y: 1000001 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should handle negative coordinates", () => {
      const points: Point[] = [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: -0.5, y: 0 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });
  });

  describe("Algorithm Comparison", () => {
    const testPoints: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0.5, y: 0.5 },
    ];

    const algorithms: ConvexHullAlgorithm[] = [
      "graham-scan",
      "jarvis-march",
      "quickhull",
      "monotone-chain",
      "gift-wrapping",
    ];

    algorithms.forEach(algorithm => {
      it(`should produce consistent results with ${algorithm}`, () => {
        const result = convexHull.compute(testPoints, algorithm);

        expect(result.stats.success).toBe(true);
        expect(result.hull.length).toBe(4); // Square hull
        expect(result.edges.length).toBe(4);
        expect(result.stats.algorithm).toBe(algorithm);
      });
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (description: string, pointCount: number, algorithm: ConvexHullAlgorithm) => {
      it(`should perform ${description} efficiently with ${algorithm}`, () => {
        const points: Point[] = [];
        for (let i = 0; i < pointCount; i++) {
          points.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
          });
        }

        const result = convexHull.compute(points, algorithm);

        expect(result.stats.success).toBe(true);
        expect(result.hull.length).toBeGreaterThan(0);
        expect(result.stats.executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} (${algorithm}) - ${pointCount} points in ${(endTime - startTime).toFixed(3)} ms`);
      });
    };

    // Test different algorithms with different point counts
    runBenchmark("small hull", 10, "graham-scan");
    runBenchmark("medium hull", 50, "graham-scan");
    runBenchmark("large hull", 200, "graham-scan");
    runBenchmark("small hull", 10, "jarvis-march");
    runBenchmark("medium hull", 50, "jarvis-march");
    runBenchmark("small hull", 10, "quickhull");
    runBenchmark("medium hull", 50, "quickhull");
    runBenchmark("large hull", 200, "quickhull");
  });

  describe("Hull Properties", () => {
    it("should produce counter-clockwise hull", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);

      // Check that hull is counter-clockwise
      let sum = 0;
      for (let i = 0; i < result.hull.length; i++) {
        const j = (i + 1) % result.hull.length;
        const k = (i + 2) % result.hull.length;
        sum +=
          (result.hull[j].x - result.hull[i].x) * (result.hull[k].y - result.hull[i].y) -
          (result.hull[j].y - result.hull[i].y) * (result.hull[k].x - result.hull[i].x);
      }
      expect(sum).toBeGreaterThan(0); // Positive sum indicates counter-clockwise
    });

    it("should include all extreme points", () => {
      const points: Point[] = [
        { x: 0, y: 0 }, // Bottom-left
        { x: 10, y: 0 }, // Bottom-right
        { x: 10, y: 10 }, // Top-right
        { x: 0, y: 10 }, // Top-left
        { x: 5, y: 5 }, // Center
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(4);

      // Check that all extreme points are included
      const hullPoints = result.hull.map(p => `${p.x},${p.y}`);
      expect(hullPoints).toContain("0,0");
      expect(hullPoints).toContain("10,0");
      expect(hullPoints).toContain("10,10");
      expect(hullPoints).toContain("0,10");
    });
  });
});

describe("Convex Hull Algorithms", () => {
  let convexHull: ConvexHull;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    convexHull = new ConvexHull();
  });

  describe("Graham Scan Algorithm", () => {
    it("should compute convex hull for simple triangle", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHull.compute(points, "graham-scan");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.edges.length).toBe(3);
      expect(result.stats.algorithm).toBe("graham-scan");
    });

    it("should exclude interior points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 }, // Interior point
      ];

      const result = convexHull.compute(points, "graham-scan");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3); // Should exclude interior point
      expect(result.hull).not.toContainEqual({ x: 0.5, y: 0.5 });
    });

    it("should handle collinear points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
      ];

      const result = convexHull.compute(points, "graham-scan");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3); // Should exclude collinear point
    });
  });

  describe("Jarvis March Algorithm", () => {
    it("should compute convex hull using Jarvis March", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "jarvis-march");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("jarvis-march");
    });

    it("should handle points in a square", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 }, // Interior point
      ];

      const result = convexHull.compute(points, "jarvis-march");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(4);
    });
  });

  describe("QuickHull Algorithm", () => {
    it("should compute convex hull using QuickHull", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "quickhull");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("quickhull");
    });

    it("should handle many points efficiently", () => {
      const points: Point[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
        });
      }

      const result = convexHull.compute(points, "quickhull");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBeGreaterThan(0);
    });
  });

  describe("Monotone Chain Algorithm", () => {
    it("should compute convex hull using Monotone Chain", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "monotone-chain");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("monotone-chain");
    });
  });

  describe("Gift Wrapping Algorithm", () => {
    it("should compute convex hull using Gift Wrapping", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "gift-wrapping");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("gift-wrapping");
    });
  });

  describe("Input Validation", () => {
    it("should reject empty point array", () => {
      const result = convexHull.compute([]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("At least 3 points are required");
    });

    it("should reject array with less than 3 points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("At least 3 points are required");
    });

    it("should reject invalid points", () => {
      const invalidPoints = [
        { x: 0, y: 0 },
        { x: "invalid", y: 0 },
        { x: 1, y: 1 },
      ] as any;

      const result = convexHull.compute(invalidPoints);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Invalid point");
    });

    it("should reject points with non-finite coordinates", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: Infinity, y: 1 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("non-finite coordinates");
    });

    it("should handle duplicate points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0, y: 0 }, // Duplicate
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });
  });

  describe("Configuration Options", () => {
    it("should work without input validation", () => {
      const convexHullNoValidation = new ConvexHull({ validateInput: false });
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHullNoValidation.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should work without sorting input", () => {
      const convexHullNoSort = new ConvexHull({ sortInput: false });
      const points: Point[] = [
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHullNoSort.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should use custom tolerance", () => {
      const convexHullCustomTolerance = new ConvexHull({ tolerance: 1e-5 });
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHullCustomTolerance.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });
  });

  describe("Hull Analysis", () => {
    let hull: Point[];

    beforeEach(() => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];
      const result = convexHull.compute(points);
      hull = result.hull;
    });

    it("should compute hull area", () => {
      const analysis = convexHull.analyzeHull(hull, { computeArea: true });

      expect(analysis.area).toBeCloseTo(1); // Square with side length 1
    });

    it("should compute hull perimeter", () => {
      const analysis = convexHull.analyzeHull(hull, { computePerimeter: true });

      expect(analysis.perimeter).toBeCloseTo(4); // Square with side length 1
    });

    it("should compute hull centroid", () => {
      const analysis = convexHull.analyzeHull(hull, { computeCentroid: true });

      expect(analysis.centroid.x).toBeCloseTo(0.5);
      expect(analysis.centroid.y).toBeCloseTo(0.5);
    });

    it("should compute bounding box", () => {
      const analysis = convexHull.analyzeHull(hull, { computeBoundingBox: true });

      expect(analysis.boundingBox.minX).toBe(0);
      expect(analysis.boundingBox.minY).toBe(0);
      expect(analysis.boundingBox.maxX).toBe(1);
      expect(analysis.boundingBox.maxY).toBe(1);
    });

    it("should compute all analysis properties", () => {
      const analysis = convexHull.analyzeHull(hull);

      expect(analysis.area).toBeGreaterThan(0);
      expect(analysis.perimeter).toBeGreaterThan(0);
      expect(analysis.centroid.x).toBeDefined();
      expect(analysis.centroid.y).toBeDefined();
      expect(analysis.boundingBox.minX).toBeDefined();
      expect(analysis.boundingBox.minY).toBeDefined();
      expect(analysis.boundingBox.maxX).toBeDefined();
      expect(analysis.boundingBox.maxY).toBeDefined();
    });
  });

  describe("Hull Comparison", () => {
    it("should compare two identical hulls", () => {
      const hull1: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];
      const hull2: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const comparison = convexHull.compareHulls(hull1, hull2);

      expect(comparison.identical).toBe(true);
      expect(comparison.areaDifference).toBeCloseTo(0);
      expect(comparison.perimeterDifference).toBeCloseTo(0);
    });

    it("should compare two different hulls", () => {
      const hull1: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];
      const hull2: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
      ];

      const comparison = convexHull.compareHulls(hull1, hull2);

      expect(comparison.identical).toBe(false);
      expect(comparison.areaDifference).toBeGreaterThan(0);
    });

    it("should compute Hausdorff distance when requested", () => {
      const hull1: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];
      const hull2: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const comparison = convexHull.compareHulls(hull1, hull2, {
        compareShapes: true,
      });

      expect(comparison.hausdorffDistance).toBeDefined();
      expect(comparison.hausdorffDistance).toBeCloseTo(0);
    });
  });

  describe("Hull Simplification", () => {
    it("should simplify hull by removing unnecessary points", () => {
      const hull: Point[] = [
        { x: 0, y: 0 },
        { x: 0.1, y: 0.05 },
        { x: 0.2, y: 0.1 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHull.simplifyHull(hull, { maxDistance: 0.2 });

      expect(result.simplifiedHull.length).toBeLessThan(hull.length);
      expect(result.pointsRemoved).toBeGreaterThan(0);
      expect(result.compressionRatio).toBeGreaterThan(1);
    });

    it("should preserve endpoints when configured", () => {
      const hull: Point[] = [
        { x: 0, y: 0 },
        { x: 0.1, y: 0.05 },
        { x: 1, y: 0 },
      ];

      const result = convexHull.simplifyHull(hull, {
        maxDistance: 0.2,
        preserveEndpoints: true,
      });

      expect(result.simplifiedHull[0]).toEqual(hull[0]);
      expect(result.simplifiedHull[result.simplifiedHull.length - 1]).toEqual(hull[hull.length - 1]);
    });

    it("should not simplify if points are necessary", () => {
      const hull: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHull.simplifyHull(hull, { maxDistance: 0.1 });

      expect(result.simplifiedHull.length).toBe(hull.length);
      expect(result.pointsRemoved).toBe(0);
      expect(result.compressionRatio).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle collinear points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(2); // Should only include endpoints
    });

    it("should handle points with very small coordinates", () => {
      const points: Point[] = [
        { x: 0.0001, y: 0.0001 },
        { x: 0.0002, y: 0.0001 },
        { x: 0.00015, y: 0.0002 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should handle points with very large coordinates", () => {
      const points: Point[] = [
        { x: 1000000, y: 1000000 },
        { x: 1000001, y: 1000000 },
        { x: 1000000.5, y: 1000001 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should handle negative coordinates", () => {
      const points: Point[] = [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: -0.5, y: 0 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });
  });

  describe("Algorithm Comparison", () => {
    const testPoints: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0.5, y: 0.5 },
    ];

    const algorithms: ConvexHullAlgorithm[] = [
      "graham-scan",
      "jarvis-march",
      "quickhull",
      "monotone-chain",
      "gift-wrapping",
    ];

    algorithms.forEach(algorithm => {
      it(`should produce consistent results with ${algorithm}`, () => {
        const result = convexHull.compute(testPoints, algorithm);

        expect(result.stats.success).toBe(true);
        expect(result.hull.length).toBe(4); // Square hull
        expect(result.edges.length).toBe(4);
        expect(result.stats.algorithm).toBe(algorithm);
      });
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (description: string, pointCount: number, algorithm: ConvexHullAlgorithm) => {
      it(`should perform ${description} efficiently with ${algorithm}`, () => {
        const points: Point[] = [];
        for (let i = 0; i < pointCount; i++) {
          points.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
          });
        }

        const result = convexHull.compute(points, algorithm);

        expect(result.stats.success).toBe(true);
        expect(result.hull.length).toBeGreaterThan(0);
        expect(result.stats.executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} (${algorithm}) - ${pointCount} points in ${(endTime - startTime).toFixed(3)} ms`);
      });
    };

    // Test different algorithms with different point counts
    runBenchmark("small hull", 10, "graham-scan");
    runBenchmark("medium hull", 50, "graham-scan");
    runBenchmark("large hull", 200, "graham-scan");
    runBenchmark("small hull", 10, "jarvis-march");
    runBenchmark("medium hull", 50, "jarvis-march");
    runBenchmark("small hull", 10, "quickhull");
    runBenchmark("medium hull", 50, "quickhull");
    runBenchmark("large hull", 200, "quickhull");
  });

  describe("Hull Properties", () => {
    it("should produce counter-clockwise hull", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);

      // Check that hull is counter-clockwise
      let sum = 0;
      for (let i = 0; i < result.hull.length; i++) {
        const j = (i + 1) % result.hull.length;
        const k = (i + 2) % result.hull.length;
        sum +=
          (result.hull[j].x - result.hull[i].x) * (result.hull[k].y - result.hull[i].y) -
          (result.hull[j].y - result.hull[i].y) * (result.hull[k].x - result.hull[i].x);
      }
      expect(sum).toBeGreaterThan(0); // Positive sum indicates counter-clockwise
    });

    it("should include all extreme points", () => {
      const points: Point[] = [
        { x: 0, y: 0 }, // Bottom-left
        { x: 10, y: 0 }, // Bottom-right
        { x: 10, y: 10 }, // Top-right
        { x: 0, y: 10 }, // Top-left
        { x: 5, y: 5 }, // Center
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(4);

      // Check that all extreme points are included
      const hullPoints = result.hull.map(p => `${p.x},${p.y}`);
      expect(hullPoints).toContain("0,0");
      expect(hullPoints).toContain("10,0");
      expect(hullPoints).toContain("10,10");
      expect(hullPoints).toContain("0,10");
    });
  });
});

describe("Convex Hull Algorithms", () => {
  let convexHull: ConvexHull;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    convexHull = new ConvexHull();
  });

  describe("Graham Scan Algorithm", () => {
    it("should compute convex hull for simple triangle", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHull.compute(points, "graham-scan");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.edges.length).toBe(3);
      expect(result.stats.algorithm).toBe("graham-scan");
    });

    it("should exclude interior points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 }, // Interior point
      ];

      const result = convexHull.compute(points, "graham-scan");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3); // Should exclude interior point
      expect(result.hull).not.toContainEqual({ x: 0.5, y: 0.5 });
    });

    it("should handle collinear points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
      ];

      const result = convexHull.compute(points, "graham-scan");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3); // Should exclude collinear point
    });
  });

  describe("Jarvis March Algorithm", () => {
    it("should compute convex hull using Jarvis March", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "jarvis-march");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("jarvis-march");
    });

    it("should handle points in a square", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 }, // Interior point
      ];

      const result = convexHull.compute(points, "jarvis-march");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(4);
    });
  });

  describe("QuickHull Algorithm", () => {
    it("should compute convex hull using QuickHull", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "quickhull");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("quickhull");
    });

    it("should handle many points efficiently", () => {
      const points: Point[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
        });
      }

      const result = convexHull.compute(points, "quickhull");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBeGreaterThan(0);
    });
  });

  describe("Monotone Chain Algorithm", () => {
    it("should compute convex hull using Monotone Chain", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "monotone-chain");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("monotone-chain");
    });
  });

  describe("Gift Wrapping Algorithm", () => {
    it("should compute convex hull using Gift Wrapping", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points, "gift-wrapping");

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
      expect(result.stats.algorithm).toBe("gift-wrapping");
    });
  });

  describe("Input Validation", () => {
    it("should reject empty point array", () => {
      const result = convexHull.compute([]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("At least 3 points are required");
    });

    it("should reject array with less than 3 points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("At least 3 points are required");
    });

    it("should reject invalid points", () => {
      const invalidPoints = [
        { x: 0, y: 0 },
        { x: "invalid", y: 0 },
        { x: 1, y: 1 },
      ] as any;

      const result = convexHull.compute(invalidPoints);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Invalid point");
    });

    it("should reject points with non-finite coordinates", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: Infinity, y: 1 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("non-finite coordinates");
    });

    it("should handle duplicate points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0, y: 0 }, // Duplicate
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });
  });

  describe("Configuration Options", () => {
    it("should work without input validation", () => {
      const convexHullNoValidation = new ConvexHull({ validateInput: false });
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHullNoValidation.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should work without sorting input", () => {
      const convexHullNoSort = new ConvexHull({ sortInput: false });
      const points: Point[] = [
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHullNoSort.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should use custom tolerance", () => {
      const convexHullCustomTolerance = new ConvexHull({ tolerance: 1e-5 });
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHullCustomTolerance.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });
  });

  describe("Hull Analysis", () => {
    let hull: Point[];

    beforeEach(() => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];
      const result = convexHull.compute(points);
      hull = result.hull;
    });

    it("should compute hull area", () => {
      const analysis = convexHull.analyzeHull(hull, { computeArea: true });

      expect(analysis.area).toBeCloseTo(1); // Square with side length 1
    });

    it("should compute hull perimeter", () => {
      const analysis = convexHull.analyzeHull(hull, { computePerimeter: true });

      expect(analysis.perimeter).toBeCloseTo(4); // Square with side length 1
    });

    it("should compute hull centroid", () => {
      const analysis = convexHull.analyzeHull(hull, { computeCentroid: true });

      expect(analysis.centroid.x).toBeCloseTo(0.5);
      expect(analysis.centroid.y).toBeCloseTo(0.5);
    });

    it("should compute bounding box", () => {
      const analysis = convexHull.analyzeHull(hull, { computeBoundingBox: true });

      expect(analysis.boundingBox.minX).toBe(0);
      expect(analysis.boundingBox.minY).toBe(0);
      expect(analysis.boundingBox.maxX).toBe(1);
      expect(analysis.boundingBox.maxY).toBe(1);
    });

    it("should compute all analysis properties", () => {
      const analysis = convexHull.analyzeHull(hull);

      expect(analysis.area).toBeGreaterThan(0);
      expect(analysis.perimeter).toBeGreaterThan(0);
      expect(analysis.centroid.x).toBeDefined();
      expect(analysis.centroid.y).toBeDefined();
      expect(analysis.boundingBox.minX).toBeDefined();
      expect(analysis.boundingBox.minY).toBeDefined();
      expect(analysis.boundingBox.maxX).toBeDefined();
      expect(analysis.boundingBox.maxY).toBeDefined();
    });
  });

  describe("Hull Comparison", () => {
    it("should compare two identical hulls", () => {
      const hull1: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];
      const hull2: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const comparison = convexHull.compareHulls(hull1, hull2);

      expect(comparison.identical).toBe(true);
      expect(comparison.areaDifference).toBeCloseTo(0);
      expect(comparison.perimeterDifference).toBeCloseTo(0);
    });

    it("should compare two different hulls", () => {
      const hull1: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];
      const hull2: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
      ];

      const comparison = convexHull.compareHulls(hull1, hull2);

      expect(comparison.identical).toBe(false);
      expect(comparison.areaDifference).toBeGreaterThan(0);
    });

    it("should compute Hausdorff distance when requested", () => {
      const hull1: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];
      const hull2: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const comparison = convexHull.compareHulls(hull1, hull2, {
        compareShapes: true,
      });

      expect(comparison.hausdorffDistance).toBeDefined();
      expect(comparison.hausdorffDistance).toBeCloseTo(0);
    });
  });

  describe("Hull Simplification", () => {
    it("should simplify hull by removing unnecessary points", () => {
      const hull: Point[] = [
        { x: 0, y: 0 },
        { x: 0.1, y: 0.05 },
        { x: 0.2, y: 0.1 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHull.simplifyHull(hull, { maxDistance: 0.2 });

      expect(result.simplifiedHull.length).toBeLessThan(hull.length);
      expect(result.pointsRemoved).toBeGreaterThan(0);
      expect(result.compressionRatio).toBeGreaterThan(1);
    });

    it("should preserve endpoints when configured", () => {
      const hull: Point[] = [
        { x: 0, y: 0 },
        { x: 0.1, y: 0.05 },
        { x: 1, y: 0 },
      ];

      const result = convexHull.simplifyHull(hull, {
        maxDistance: 0.2,
        preserveEndpoints: true,
      });

      expect(result.simplifiedHull[0]).toEqual(hull[0]);
      expect(result.simplifiedHull[result.simplifiedHull.length - 1]).toEqual(hull[hull.length - 1]);
    });

    it("should not simplify if points are necessary", () => {
      const hull: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];

      const result = convexHull.simplifyHull(hull, { maxDistance: 0.1 });

      expect(result.simplifiedHull.length).toBe(hull.length);
      expect(result.pointsRemoved).toBe(0);
      expect(result.compressionRatio).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle collinear points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(2); // Should only include endpoints
    });

    it("should handle points with very small coordinates", () => {
      const points: Point[] = [
        { x: 0.0001, y: 0.0001 },
        { x: 0.0002, y: 0.0001 },
        { x: 0.00015, y: 0.0002 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should handle points with very large coordinates", () => {
      const points: Point[] = [
        { x: 1000000, y: 1000000 },
        { x: 1000001, y: 1000000 },
        { x: 1000000.5, y: 1000001 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });

    it("should handle negative coordinates", () => {
      const points: Point[] = [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: -0.5, y: 0 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(3);
    });
  });

  describe("Algorithm Comparison", () => {
    const testPoints: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0.5, y: 0.5 },
    ];

    const algorithms: ConvexHullAlgorithm[] = [
      "graham-scan",
      "jarvis-march",
      "quickhull",
      "monotone-chain",
      "gift-wrapping",
    ];

    algorithms.forEach(algorithm => {
      it(`should produce consistent results with ${algorithm}`, () => {
        const result = convexHull.compute(testPoints, algorithm);

        expect(result.stats.success).toBe(true);
        expect(result.hull.length).toBe(4); // Square hull
        expect(result.edges.length).toBe(4);
        expect(result.stats.algorithm).toBe(algorithm);
      });
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (description: string, pointCount: number, algorithm: ConvexHullAlgorithm) => {
      it(`should perform ${description} efficiently with ${algorithm}`, () => {
        const points: Point[] = [];
        for (let i = 0; i < pointCount; i++) {
          points.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
          });
        }

        const result = convexHull.compute(points, algorithm);

        expect(result.stats.success).toBe(true);
        expect(result.hull.length).toBeGreaterThan(0);
        expect(result.stats.executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} (${algorithm}) - ${pointCount} points in ${(endTime - startTime).toFixed(3)} ms`);
      });
    };

    // Test different algorithms with different point counts
    runBenchmark("small hull", 10, "graham-scan");
    runBenchmark("medium hull", 50, "graham-scan");
    runBenchmark("large hull", 200, "graham-scan");
    runBenchmark("small hull", 10, "jarvis-march");
    runBenchmark("medium hull", 50, "jarvis-march");
    runBenchmark("small hull", 10, "quickhull");
    runBenchmark("medium hull", 50, "quickhull");
    runBenchmark("large hull", 200, "quickhull");
  });

  describe("Hull Properties", () => {
    it("should produce counter-clockwise hull", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 },
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);

      // Check that hull is counter-clockwise
      let sum = 0;
      for (let i = 0; i < result.hull.length; i++) {
        const j = (i + 1) % result.hull.length;
        const k = (i + 2) % result.hull.length;
        sum +=
          (result.hull[j].x - result.hull[i].x) * (result.hull[k].y - result.hull[i].y) -
          (result.hull[j].y - result.hull[i].y) * (result.hull[k].x - result.hull[i].x);
      }
      expect(sum).toBeGreaterThan(0); // Positive sum indicates counter-clockwise
    });

    it("should include all extreme points", () => {
      const points: Point[] = [
        { x: 0, y: 0 }, // Bottom-left
        { x: 10, y: 0 }, // Bottom-right
        { x: 10, y: 10 }, // Top-right
        { x: 0, y: 10 }, // Top-left
        { x: 5, y: 5 }, // Center
      ];

      const result = convexHull.compute(points);

      expect(result.stats.success).toBe(true);
      expect(result.hull.length).toBe(4);

      // Check that all extreme points are included
      const hullPoints = result.hull.map(p => `${p.x},${p.y}`);
      expect(hullPoints).toContain("0,0");
      expect(hullPoints).toContain("10,0");
      expect(hullPoints).toContain("10,10");
      expect(hullPoints).toContain("0,10");
    });
  });
});
