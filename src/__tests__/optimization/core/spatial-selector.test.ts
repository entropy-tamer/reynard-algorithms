/**
 * @file Tests for spatial selector
 */
/* eslint-disable max-lines, max-lines-per-function */
import { describe, expect, it, beforeEach } from "vitest";
import { SpatialSelector } from "../../../optimization/core/spatial-selector";
import type { WorkloadAnalysis } from "../../../optimization/core/algorithm-selector-types";

describe("SpatialSelector", () => {
  let selector: SpatialSelector;

  beforeEach(() => {
    selector = new SpatialSelector();
  });

  describe("selectOptimalSpatialAlgorithm", () => {
    it("should select optimized-spatial for high density workloads", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 300,
          spatialDensity: 0.8,
          overlapRatio: 0.3,
          updateFrequency: 0.7,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 90000,
          spatial: 9000,
          optimized: 900,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection.algorithm).toBe("optimized-spatial");
      expect(selection.confidence).toBe(0.9);
      expect(selection.reasoning).toContain("High spatial density benefits from optimization");
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
    });

    it("should select spatial for low density workloads", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 200,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: {
          naive: 40000,
          spatial: 4000,
          optimized: 400,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection.algorithm).toBe("spatial");
      expect(selection.confidence).toBe(0.8);
      expect(selection.reasoning).toContain("Low spatial density allows standard spatial hashing");
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
    });

    it("should handle threshold at 0.7 density", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 250,
          spatialDensity: 0.7,
          overlapRatio: 0.2,
          updateFrequency: 0.5,
          queryPattern: "random",
        },
        complexity: {
          naive: 62500,
          spatial: 6250,
          optimized: 625,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection.algorithm).toBeOneOf(["spatial", "optimized-spatial"]);
      expect(selection.confidence).toBeGreaterThan(0);
    });

    it("should use translation function when provided", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 300,
          spatialDensity: 0.8,
          overlapRatio: 0.3,
          updateFrequency: 0.7,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 90000,
          spatial: 9000,
          optimized: 900,
        },
      };

      const t = (key: string) => `translated: ${key}`;
      const selection = selector.selectOptimalSpatialAlgorithm(analysis, t);

      expect(selection.reasoning[0]).toContain("translated:");
    });
  });

  describe("performance estimates for optimized-spatial", () => {
    it("should provide reasonable execution time estimates", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 300,
          spatialDensity: 0.8,
          overlapRatio: 0.3,
          updateFrequency: 0.7,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 90000,
          spatial: 9000,
          optimized: 900,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.executionTime).toBeLessThan(100);
    });

    it("should include memory pooling overhead", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 300,
          spatialDensity: 0.8,
          overlapRatio: 0.3,
          updateFrequency: 0.7,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 90000,
          spatial: 9000,
          optimized: 900,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(1024);
    });

    it("should scale memory usage with object count", () => {
      const smallAnalysis: WorkloadAnalysis = {
        workload: {
          objectCount: 100,
          spatialDensity: 0.8,
          overlapRatio: 0.3,
          updateFrequency: 0.7,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 10000,
          spatial: 1000,
          optimized: 100,
        },
      };

      const largeAnalysis: WorkloadAnalysis = {
        workload: {
          objectCount: 500,
          spatialDensity: 0.8,
          overlapRatio: 0.3,
          updateFrequency: 0.7,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 250000,
          spatial: 25000,
          optimized: 2500,
        },
      };

      const smallSelection = selector.selectOptimalSpatialAlgorithm(smallAnalysis);
      const largeSelection = selector.selectOptimalSpatialAlgorithm(largeAnalysis);

      expect(largeSelection.expectedPerformance.memoryUsage).toBeGreaterThan(
        smallSelection.expectedPerformance.memoryUsage
      );
    });
  });

  describe("performance estimates for spatial", () => {
    it("should provide reasonable execution time estimates", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 200,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: {
          naive: 40000,
          spatial: 4000,
          optimized: 400,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.executionTime).toBeLessThan(100);
    });

    it("should not include memory pooling overhead", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 200,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: {
          naive: 40000,
          spatial: 4000,
          optimized: 400,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      const expectedMemory = 200 * 32;
      expect(selection.expectedPerformance.memoryUsage).toBe(expectedMemory);
    });

    it("should scale memory usage with object count", () => {
      const smallAnalysis: WorkloadAnalysis = {
        workload: {
          objectCount: 100,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: {
          naive: 10000,
          spatial: 1000,
          optimized: 100,
        },
      };

      const largeAnalysis: WorkloadAnalysis = {
        workload: {
          objectCount: 500,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: {
          naive: 250000,
          spatial: 25000,
          optimized: 2500,
        },
      };

      const smallSelection = selector.selectOptimalSpatialAlgorithm(smallAnalysis);
      const largeSelection = selector.selectOptimalSpatialAlgorithm(largeAnalysis);

      expect(largeSelection.expectedPerformance.memoryUsage).toBeGreaterThan(
        smallSelection.expectedPerformance.memoryUsage
      );
    });
  });

  describe("reasoning strings", () => {
    it("should provide valid reasoning for optimized-spatial selection", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 300,
          spatialDensity: 0.8,
          overlapRatio: 0.3,
          updateFrequency: 0.7,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 90000,
          spatial: 9000,
          optimized: 900,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection.reasoning).toBeInstanceOf(Array);
      expect(selection.reasoning.length).toBeGreaterThan(0);
      expect(selection.reasoning.every(reason => typeof reason === "string")).toBe(true);
      expect(selection.reasoning).toContain("High spatial density benefits from optimization");
    });

    it("should provide valid reasoning for spatial selection", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 200,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: {
          naive: 40000,
          spatial: 4000,
          optimized: 400,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection.reasoning).toBeInstanceOf(Array);
      expect(selection.reasoning.length).toBeGreaterThan(0);
      expect(selection.reasoning.every(reason => typeof reason === "string")).toBe(true);
      expect(selection.reasoning).toContain("Low spatial density allows standard spatial hashing");
    });
  });

  describe("edge cases", () => {
    it("should handle zero spatial density", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 200,
          spatialDensity: 0,
          overlapRatio: 0,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: {
          naive: 40000,
          spatial: 4000,
          optimized: 400,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection).toBeDefined();
      expect(selection.algorithm).toBe("spatial");
    });

    it("should handle maximum spatial density", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 300,
          spatialDensity: 1.0,
          overlapRatio: 1.0,
          updateFrequency: 1.0,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 90000,
          spatial: 9000,
          optimized: 900,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection).toBeDefined();
      expect(selection.algorithm).toBe("optimized-spatial");
    });

    it("should handle zero object count", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 0,
          spatialDensity: 0.5,
          overlapRatio: 0.1,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: {
          naive: 0,
          spatial: 0,
          optimized: 0,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection).toBeDefined();
    });

    it("should handle very large object count", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 100000,
          spatialDensity: 0.5,
          overlapRatio: 0.1,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: {
          naive: 10000000000,
          spatial: 100000000,
          optimized: 10000000,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection).toBeDefined();
    });
  });

  describe("confidence levels", () => {
    it("should return correct confidence for optimized-spatial", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 300,
          spatialDensity: 0.8,
          overlapRatio: 0.3,
          updateFrequency: 0.7,
          queryPattern: "clustered",
        },
        complexity: {
          naive: 90000,
          spatial: 9000,
          optimized: 900,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection.confidence).toBe(0.9);
    });

    it("should return correct confidence for spatial", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 200,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: {
          naive: 40000,
          spatial: 4000,
          optimized: 400,
        },
      };

      const selection = selector.selectOptimalSpatialAlgorithm(analysis);

      expect(selection.confidence).toBe(0.8);
    });
  });
});
