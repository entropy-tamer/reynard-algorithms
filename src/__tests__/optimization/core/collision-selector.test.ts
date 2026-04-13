/**
 * @file Tests for collision selector
 */
/* eslint-disable max-lines, max-lines-per-function */
import { describe, expect, it, beforeEach } from "vitest";
import { CollisionSelector } from "../../../optimization/core/collision-selector";
import type { WorkloadAnalysis } from "../../../optimization/core/algorithm-selector-types";

describe("CollisionSelector", () => {
  let selector: CollisionSelector;

  beforeEach(() => {
    selector = new CollisionSelector();
  });

  describe("selectOptimalCollisionAlgorithm", () => {
    it("should select naive algorithm for small datasets", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 50,
          spatialDensity: 0.1,
          overlapRatio: 0.05,
          updateFrequency: 0.2,
          queryPattern: "random",
        },
        complexity: {
          naive: 2500,
          spatial: 500,
          optimized: 100,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.algorithm).toBe("naive");
      expect(selection.confidence).toBe(0.9);
      expect(selection.reasoning).toContain("Small object count favors naive approach");
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
    });

    it("should select spatial algorithm for medium datasets", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 200,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.5,
          queryPattern: "random",
        },
        complexity: {
          naive: 40000,
          spatial: 2000,
          optimized: 500,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.algorithm).toBe("spatial");
      expect(selection.confidence).toBe(0.8);
      expect(selection.reasoning).toContain("Medium object count benefits from spatial optimization");
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
    });

    it("should select optimized algorithm for large datasets", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 1000,
          spatialDensity: 0.5,
          overlapRatio: 0.2,
          updateFrequency: 0.8,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 1000000,
          spatial: 10000,
          optimized: 1000,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.algorithm).toBe("optimized");
      expect(selection.confidence).toBe(0.95);
      expect(selection.reasoning).toContain("Large object count requires optimization");
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
    });

    it("should handle threshold boundaries correctly", () => {
      const analysisAtThreshold: WorkloadAnalysis = {
        workload: {
          objectCount: 100,
          spatialDensity: 0.2,
          overlapRatio: 0.08,
          updateFrequency: 0.3,
          queryPattern: "random",
        },
        complexity: {
          naive: 10000,
          spatial: 1000,
          optimized: 200,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysisAtThreshold);

      expect(selection.algorithm).toBeOneOf(["naive", "spatial", "optimized"]);
      expect(selection.confidence).toBeGreaterThan(0);
    });

    it("should use translation function when provided", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 50,
          spatialDensity: 0.1,
          overlapRatio: 0.05,
          updateFrequency: 0.2,
          queryPattern: "random",
        },
        complexity: {
          naive: 2500,
          spatial: 500,
          optimized: 100,
        },
      };

      const t = (key: string) => `translated: ${key}`;
      const selection = selector.selectOptimalCollisionAlgorithm(analysis, t);

      expect(selection.reasoning[0]).toContain("translated:");
    });
  });

  describe("fallback complexity calculation", () => {
    it("should use memoized square for naive complexity fallback", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 50,
          spatialDensity: 0.1,
          overlapRatio: 0.05,
          updateFrequency: 0.2,
          queryPattern: "random",
        },
        complexity: undefined,
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.algorithm).toBe("naive");
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
    });

    it("should use memoized log for spatial complexity fallback", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 200,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.5,
          queryPattern: "random",
        },
        complexity: undefined,
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.algorithm).toBe("spatial");
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
    });

    it("should use memoized log for optimized complexity fallback", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 1000,
          spatialDensity: 0.5,
          overlapRatio: 0.2,
          updateFrequency: 0.8,
          queryPattern: "clustered",
        },
        complexity: undefined,
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.algorithm).toBe("optimized");
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
    });
  });

  describe("performance estimates", () => {
    it("should provide reasonable execution time estimates for naive", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 100,
          spatialDensity: 0.2,
          overlapRatio: 0.1,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: {
          naive: 10000,
          spatial: 1000,
          optimized: 200,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.executionTime).toBeLessThan(100);
    });

    it("should provide reasonable memory usage estimates for naive", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 100,
          spatialDensity: 0.2,
          overlapRatio: 0.1,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: {
          naive: 10000,
          spatial: 1000,
          optimized: 200,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeLessThan(10000);
    });

    it("should provide reasonable execution time estimates for spatial", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 200,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.5,
          queryPattern: "random",
        },
        complexity: {
          naive: 40000,
          spatial: 2000,
          optimized: 500,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.executionTime).toBeLessThan(100);
    });

    it("should provide reasonable memory usage estimates for spatial", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 200,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.5,
          queryPattern: "random",
        },
        complexity: {
          naive: 40000,
          spatial: 2000,
          optimized: 500,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeLessThan(10000);
    });

    it("should provide reasonable execution time estimates for optimized", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 1000,
          spatialDensity: 0.5,
          overlapRatio: 0.2,
          updateFrequency: 0.8,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 1000000,
          spatial: 10000,
          optimized: 1000,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.executionTime).toBeLessThan(100);
    });

    it("should include memory pooling overhead for optimized", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 1000,
          spatialDensity: 0.5,
          overlapRatio: 0.2,
          updateFrequency: 0.8,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 1000000,
          spatial: 10000,
          optimized: 1000,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(1000);
    });
  });

  describe("reasoning strings", () => {
    it("should provide valid reasoning for naive selection", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 50,
          spatialDensity: 0.1,
          overlapRatio: 0.05,
          updateFrequency: 0.2,
          queryPattern: "random",
        },
        complexity: {
          naive: 2500,
          spatial: 500,
          optimized: 100,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.reasoning).toBeInstanceOf(Array);
      expect(selection.reasoning.length).toBeGreaterThan(0);
      expect(selection.reasoning.every(reason => typeof reason === "string")).toBe(true);
    });

    it("should provide valid reasoning for spatial selection", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 200,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.5,
          queryPattern: "random",
        },
        complexity: {
          naive: 40000,
          spatial: 2000,
          optimized: 500,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.reasoning).toBeInstanceOf(Array);
      expect(selection.reasoning.length).toBeGreaterThan(0);
      expect(selection.reasoning.every(reason => typeof reason === "string")).toBe(true);
    });

    it("should provide valid reasoning for optimized selection", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 1000,
          spatialDensity: 0.5,
          overlapRatio: 0.2,
          updateFrequency: 0.8,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 1000000,
          spatial: 10000,
          optimized: 1000,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.reasoning).toBeInstanceOf(Array);
      expect(selection.reasoning.length).toBeGreaterThan(0);
      expect(selection.reasoning.every(reason => typeof reason === "string")).toBe(true);
    });

    it("should include PAW findings for optimized selection", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 1000,
          spatialDensity: 0.5,
          overlapRatio: 0.2,
          updateFrequency: 0.8,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 1000000,
          spatial: 10000,
          optimized: 1000,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.reasoning).toContain("PAW findings show 99.91% allocation reduction");
    });
  });

  describe("edge cases", () => {
    it("should handle zero object count", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 0,
          spatialDensity: 0,
          overlapRatio: 0,
          updateFrequency: 0,
          queryPattern: "random",
        },
        complexity: {
          naive: 0,
          spatial: 0,
          optimized: 0,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection).toBeDefined();
      expect(selection.algorithm).toBe("naive");
    });

    it("should handle very large object count", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 100000,
          spatialDensity: 1.0,
          overlapRatio: 1.0,
          updateFrequency: 1.0,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 10000000000,
          spatial: 100000000,
          optimized: 10000000,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection).toBeDefined();
      expect(selection.algorithm).toBe("optimized");
    });

    it("should handle undefined complexity", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 100,
          spatialDensity: 0.2,
          overlapRatio: 0.1,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: undefined,
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection).toBeDefined();
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
    });
  });

  describe("confidence levels", () => {
    it("should return correct confidence for naive", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 50,
          spatialDensity: 0.1,
          overlapRatio: 0.05,
          updateFrequency: 0.2,
          queryPattern: "random",
        },
        complexity: {
          naive: 2500,
          spatial: 500,
          optimized: 100,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.confidence).toBe(0.9);
    });

    it("should return correct confidence for spatial", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 200,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.5,
          queryPattern: "random",
        },
        complexity: {
          naive: 40000,
          spatial: 2000,
          optimized: 500,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.confidence).toBe(0.8);
    });

    it("should return correct confidence for optimized", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 1000,
          spatialDensity: 0.5,
          overlapRatio: 0.2,
          updateFrequency: 0.8,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 1000000,
          spatial: 10000,
          optimized: 1000,
        },
      };

      const selection = selector.selectOptimalCollisionAlgorithm(analysis);

      expect(selection.confidence).toBe(0.95);
    });
  });
});
