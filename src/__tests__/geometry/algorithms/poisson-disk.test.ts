import { describe, it, expect, beforeEach, vi } from "vitest";
import { PoissonDisk } from "../../../geometry/algorithms/poisson-disk/poisson-disk-core";

describe("Poisson Disk Sampling Algorithm", () => {
  let poissonDisk: PoissonDisk;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    poissonDisk = new PoissonDisk();
  });

  describe("Basic 2D Sampling", () => {
    it("should generate 2D points with Bridson algorithm", () => {
      const result = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 5,
        algorithm: "bridson",
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBeGreaterThan(0);
      expect(result.stats.pointsPlaced).toBe(result.points.length);
      expect(result.stats.success).toBe(true);
    });

    it("should generate 2D points with dart-throwing algorithm", () => {
      const result = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 5,
        algorithm: "dartThrowing",
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBeGreaterThan(0);
      expect(result.stats.pointsPlaced).toBe(result.points.length);
    });

    it("should respect minimum distance constraint", () => {
      const result = poissonDisk.sample2D({
        width: 50,
        height: 50,
        minDistance: 10,
        maxPoints: 20,
      });

      expect(result.success).toBe(true);

      // Check that no two points are closer than minDistance
      for (let i = 0; i < result.points.length; i++) {
        for (let j = i + 1; j < result.points.length; j++) {
          const p1 = result.points[i] as any;
          const p2 = result.points[j] as any;
          const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          expect(distance).toBeGreaterThanOrEqual(10);
        }
      }
    });

    it("should respect boundary constraints", () => {
      const result = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 5,
        allowBoundary: false,
      });

      expect(result.success).toBe(true);

      // Check that all points are within bounds (with margin)
      const margin = 2.5; // minDistance / 2
      for (const point of result.points as any[]) {
        expect(point.x).toBeGreaterThanOrEqual(margin);
        expect(point.x).toBeLessThanOrEqual(100 - margin);
        expect(point.y).toBeGreaterThanOrEqual(margin);
        expect(point.y).toBeLessThanOrEqual(100 - margin);
      }
    });

    it("should respect maximum points limit", () => {
      const result = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 2,
        maxPoints: 10,
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Basic 3D Sampling", () => {
    it("should generate 3D points with Bridson algorithm", () => {
      const result = poissonDisk.sample3D({
        width: 50,
        height: 50,
        depth: 50,
        minDistance: 5,
        algorithm: "bridson",
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBeGreaterThan(0);
      expect(result.stats.pointsPlaced).toBe(result.points.length);
    });

    it("should generate 3D points with dart-throwing algorithm", () => {
      const result = poissonDisk.sample3D({
        width: 50,
        height: 50,
        depth: 50,
        minDistance: 5,
        algorithm: "dartThrowing",
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBeGreaterThan(0);
    });

    it("should respect 3D minimum distance constraint", () => {
      const result = poissonDisk.sample3D({
        width: 30,
        height: 30,
        depth: 30,
        minDistance: 8,
        maxPoints: 10,
      });

      expect(result.success).toBe(true);

      // Check that no two points are closer than minDistance
      for (let i = 0; i < result.points.length; i++) {
        for (let j = i + 1; j < result.points.length; j++) {
          const p1 = result.points[i] as any;
          const p2 = result.points[j] as any;
          const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2);
          expect(distance).toBeGreaterThanOrEqual(8);
        }
      }
    });
  });

  describe("Configuration Options", () => {
    it("should use custom seed for reproducible results", () => {
      const poisson1 = new PoissonDisk({ seed: 12345 });
      const poisson2 = new PoissonDisk({ seed: 12345 });

      const result1 = poisson1.sample2D({ width: 50, height: 50, minDistance: 5, maxPoints: 5 });
      const result2 = poisson2.sample2D({ width: 50, height: 50, minDistance: 5, maxPoints: 5 });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.points.length).toBe(result2.points.length);

      // Points should be identical with same seed
      for (let i = 0; i < result1.points.length; i++) {
        const p1 = result1.points[i] as any;
        const p2 = result2.points[i] as any;
        expect(p1.x).toBeCloseTo(p2.x, 10);
        expect(p1.y).toBeCloseTo(p2.y, 10);
      }
    });

    it("should use different seeds for different results", () => {
      const poisson1 = new PoissonDisk({ seed: 12345 });
      const poisson2 = new PoissonDisk({ seed: 54321 });

      const result1 = poisson1.sample2D({ width: 50, height: 50, minDistance: 5, maxPoints: 5 });
      const result2 = poisson2.sample2D({ width: 50, height: 50, minDistance: 5, maxPoints: 5 });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Results should be different with different seeds
      let different = false;
      for (let i = 0; i < Math.min(result1.points.length, result2.points.length); i++) {
        const p1 = result1.points[i] as any;
        const p2 = result2.points[i] as any;
        if (Math.abs(p1.x - p2.x) > 0.1 || Math.abs(p1.y - p2.y) > 0.1) {
          different = true;
          break;
        }
      }
      expect(different).toBe(true);
    });

    it("should use custom max attempts", () => {
      const result = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 5,
        maxAttempts: 5,
      });

      expect(result.success).toBe(true);
      expect(result.stats.attemptsMade).toBeLessThanOrEqual(5 * result.points.length);
    });

    it("should use custom grid cell size", () => {
      const result = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 5,
        gridCellSize: 2,
        useGrid: true,
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBeGreaterThan(0);
    });
  });

  describe("Adaptive Sampling", () => {
    it("should perform adaptive 2D sampling", () => {
      const result = poissonDisk.adaptiveSample2D({
        baseMinDistance: 5,
        maxMinDistance: 10,
        minMinDistance: 2,
        adaptationFactor: 0.1,
        targetCoverage: 0.7,
        maxIterations: 5,
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBeGreaterThan(0);
      expect(result.iterations).toBeGreaterThan(0);
      expect(result.finalCoverage).toBeGreaterThan(0);
      expect(result.finalMinDistance).toBeGreaterThan(0);
    });

    it("should adjust minimum distance based on coverage", () => {
      const result = poissonDisk.adaptiveSample2D({
        baseMinDistance: 20,
        maxMinDistance: 30,
        minMinDistance: 5,
        adaptationFactor: 0.2,
        targetCoverage: 0.8,
        maxIterations: 3,
      });

      expect(result.success).toBe(true);
      expect(result.finalMinDistance).toBeGreaterThanOrEqual(5);
      expect(result.finalMinDistance).toBeLessThanOrEqual(30);
    });
  });

  describe("Constrained Sampling", () => {
    it("should perform constrained 2D sampling", () => {
      const result = poissonDisk.constrainedSample2D({
        width: 100,
        height: 100,
        minDistance: 5,
        maxPoints: 10,
        isValidPoint: point => {
          const p = point as any;
          // Only allow points in a circular region
          const centerX = 50;
          const centerY = 50;
          const radius = 30;
          const distance = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
          return distance <= radius;
        },
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBeGreaterThan(0);
      expect(result.rejectedPoints).toBeGreaterThanOrEqual(0);

      // Check that all points satisfy the constraint
      for (const point of result.points as any[]) {
        const centerX = 50;
        const centerY = 50;
        const radius = 30;
        const distance = Math.sqrt((point.x - centerX) ** 2 + (point.y - centerY) ** 2);
        expect(distance).toBeLessThanOrEqual(radius);
      }
    });

    it("should handle custom distance function", () => {
      const result = poissonDisk.constrainedSample2D({
        width: 100,
        height: 100,
        minDistance: 5,
        maxPoints: 5,
        isValidPoint: () => true,
        customDistance: (p1, p2) => {
          const point1 = p1 as any;
          const point2 = p2 as any;
          // Manhattan distance
          return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
        },
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBeGreaterThan(0);
    });
  });

  describe("Distribution Analysis", () => {
    let samplePoints: any[];

    beforeEach(() => {
      const result = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 5,
        maxPoints: 20,
      });
      samplePoints = result.points;
    });

    it("should analyze distance statistics", () => {
      const analysis = poissonDisk.analyzeDistribution(
        samplePoints,
        {
          width: 100,
          height: 100,
        },
        {
          computeDistanceStats: true,
        }
      );

      expect(analysis.distanceStats.minDistance).toBeGreaterThan(0);
      expect(analysis.distanceStats.maxDistance).toBeGreaterThan(0);
      expect(analysis.distanceStats.averageDistance).toBeGreaterThan(0);
      expect(analysis.distanceStats.medianDistance).toBeGreaterThan(0);
      expect(analysis.distanceStats.standardDeviation).toBeGreaterThanOrEqual(0);
    });

    it("should analyze coverage", () => {
      const analysis = poissonDisk.analyzeDistribution(
        samplePoints,
        {
          width: 100,
          height: 100,
        },
        {
          computeCoverage: true,
        }
      );

      expect(analysis.coverage.totalArea).toBe(10000);
      expect(analysis.coverage.coveredArea).toBeGreaterThan(0);
      expect(analysis.coverage.coveragePercentage).toBeGreaterThan(0);
      expect(analysis.coverage.coveragePercentage).toBeLessThanOrEqual(100);
    });

    it("should analyze uniformity", () => {
      const analysis = poissonDisk.analyzeDistribution(
        samplePoints,
        {
          width: 100,
          height: 100,
        },
        {
          computeUniformity: true,
        }
      );

      expect(analysis.uniformity.coefficientOfVariation).toBeGreaterThanOrEqual(0);
      expect(analysis.uniformity.uniformityIndex).toBeGreaterThanOrEqual(0);
      expect(analysis.uniformity.uniformityIndex).toBeLessThanOrEqual(1);
      expect(analysis.uniformity.clusteringIndex).toBeGreaterThanOrEqual(0);
    });

    it("should analyze spatial distribution when requested", () => {
      const analysis = poissonDisk.analyzeDistribution(
        samplePoints,
        {
          width: 100,
          height: 100,
        },
        {
          computeSpatialDistribution: true,
        }
      );

      expect(analysis.spatialDistribution).toBeDefined();
      expect(analysis.spatialDistribution!.densityMap).toBeDefined();
      expect(analysis.spatialDistribution!.densityVariance).toBeGreaterThanOrEqual(0);
      expect(analysis.spatialDistribution!.densitySkewness).toBeDefined();
    });

    it("should handle empty point set", () => {
      const analysis = poissonDisk.analyzeDistribution([], {
        width: 100,
        height: 100,
      });

      expect(analysis.distanceStats.minDistance).toBe(0);
      expect(analysis.distanceStats.maxDistance).toBe(0);
      expect(analysis.distanceStats.averageDistance).toBe(0);
      expect(analysis.coverage.coveragePercentage).toBe(0);
      expect(analysis.uniformity.uniformityIndex).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very small sampling area", () => {
      const result = poissonDisk.sample2D({
        width: 10,
        height: 10,
        minDistance: 5,
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBeLessThanOrEqual(4); // At most 4 points in 10x10 area
    });

    it("should handle very large minimum distance", () => {
      const result = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 50,
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBeLessThanOrEqual(4); // At most 4 points
    });

    it("should handle zero max points", () => {
      const result = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 5,
        maxPoints: 0,
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBe(0);
    });

    it("should handle very small minimum distance", () => {
      const result = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 0.1,
        maxPoints: 100,
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBeGreaterThan(0);
    });

    it("should handle rectangular sampling areas", () => {
      const result = poissonDisk.sample2D({
        width: 200,
        height: 50,
        minDistance: 5,
      });

      expect(result.success).toBe(true);
      expect(result.points.length).toBeGreaterThan(0);

      // Check that all points are within bounds
      for (const point of result.points as any[]) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(200);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(50);
      }
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (description: string, width: number, height: number, minDistance: number) => {
      it(`should perform ${description} efficiently`, () => {
        const result = poissonDisk.sample2D({
          width,
          height,
          minDistance,
          maxPoints: 1000,
        });

        expect(result.stats.success).toBe(true);
        expect(result.points.length).toBeGreaterThan(0);
        expect(result.stats.executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} - ${result.points.length} points in ${(endTime - startTime).toFixed(3)} ms`);
      });
    };

    runBenchmark("small area sampling", 50, 50, 5);
    runBenchmark("medium area sampling", 100, 100, 5);
    runBenchmark("large area sampling", 200, 200, 5);
    runBenchmark("high density sampling", 100, 100, 2);
    runBenchmark("low density sampling", 100, 100, 10);
  });

  describe("Algorithm Comparison", () => {
    it("should produce different results for different algorithms", () => {
      const bridsonResult = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 5,
        algorithm: "bridson",
        maxPoints: 10,
      });

      const dartThrowingResult = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 5,
        algorithm: "dartThrowing",
        maxPoints: 10,
      });

      expect(bridsonResult.success).toBe(true);
      expect(dartThrowingResult.success).toBe(true);

      // Results should be different (though both valid)
      expect(bridsonResult.points.length).not.toBe(dartThrowingResult.points.length);
    });

    it("should respect minimum distance for both algorithms", () => {
      const algorithms = ["bridson", "dartThrowing"] as const;

      for (const algorithm of algorithms) {
        const result = poissonDisk.sample2D({
          width: 100,
          height: 100,
          minDistance: 8,
          algorithm,
          maxPoints: 20,
        });

        expect(result.success).toBe(true);

        // Check minimum distance constraint
        for (let i = 0; i < result.points.length; i++) {
          for (let j = i + 1; j < result.points.length; j++) {
            const p1 = result.points[i] as any;
            const p2 = result.points[j] as any;
            const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
            expect(distance).toBeGreaterThanOrEqual(8);
          }
        }
      }
    });
  });

  describe("Quality Metrics", () => {
    it("should produce well-distributed points", () => {
      const result = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 5,
        maxPoints: 50,
      });

      expect(result.success).toBe(true);

      const analysis = poissonDisk.analyzeDistribution(result.points, {
        width: 100,
        height: 100,
      });

      // Good distribution should have reasonable uniformity
      expect(analysis.uniformity.uniformityIndex).toBeGreaterThan(0.5);
      expect(analysis.uniformity.coefficientOfVariation).toBeLessThan(1.0);
    });

    it("should achieve reasonable coverage", () => {
      const result = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 3,
        maxPoints: 100,
      });

      expect(result.success).toBe(true);

      const analysis = poissonDisk.analyzeDistribution(result.points, {
        width: 100,
        height: 100,
      });

      // Should achieve reasonable coverage
      expect(analysis.coverage.coveragePercentage).toBeGreaterThan(10);
    });

    it("should maintain consistent minimum distance", () => {
      const result = poissonDisk.sample2D({
        width: 100,
        height: 100,
        minDistance: 5,
        maxPoints: 30,
      });

      expect(result.success).toBe(true);

      // The actual minimum distance should be close to the requested minimum distance
      expect(result.stats.actualMinDistance).toBeGreaterThanOrEqual(5);
      expect(result.stats.actualMinDistance).toBeLessThan(5.1); // Allow small tolerance
    });
  });
});
