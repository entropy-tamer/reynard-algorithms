/**
 * @file Tests for union-find selector
 */
/* eslint-disable max-lines, max-lines-per-function */
import { describe, expect, it, beforeEach } from "vitest";
import { UnionFindSelector } from "../../../optimization/core/union-find-selector";
import type { WorkloadAnalysis } from "../../../optimization/core/algorithm-selector-types";

describe("UnionFindSelector", () => {
  let selector: UnionFindSelector;

  beforeEach(() => {
    selector = new UnionFindSelector();
  });

  describe("selectOptimalUnionFindAlgorithm", () => {
    it("should select standard union-find for small datasets", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 50,
          spatialDensity: 0.2,
          overlapRatio: 0.1,
          updateFrequency: 0.3,
          queryPattern: "random",
        },
        complexity: {
          naive: 2500,
          spatial: 500,
          optimized: 100,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      expect(selection.algorithm).toBe("data-structures/union-find");
      expect(selection.confidence).toBe(0.9);
      expect(selection.reasoning).toContain("Small dataset size optimal for standard Union-Find");
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
    });

    it("should select batch union-find for large datasets", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 500,
          spatialDensity: 0.4,
          overlapRatio: 0.2,
          updateFrequency: 0.6,
          queryPattern: "sequential",
        },
        complexity: {
          naive: 250000,
          spatial: 50000,
          optimized: 10000,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      expect(selection.algorithm).toBe("batch-data-structures/union-find");
      expect(selection.confidence).toBe(0.9);
      expect(selection.reasoning).toContain("Large dataset benefits from batch operations");
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
    });

    it("should handle threshold at 100 objects", () => {
      const analysisAtThreshold: WorkloadAnalysis = {
        workload: {
          objectCount: 100,
          spatialDensity: 0.3,
          overlapRatio: 0.15,
          updateFrequency: 0.4,
          queryPattern: "random",
        },
        complexity: {
          naive: 10000,
          spatial: 2000,
          optimized: 400,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysisAtThreshold);

      expect(selection.algorithm).toBeOneOf(["data-structures/union-find", "batch-data-structures/union-find"]);
      expect(selection.confidence).toBe(0.9);
    });
  });

  describe("performance estimates for standard union-find", () => {
    it("should provide reasonable execution time estimates", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 50,
          spatialDensity: 0.2,
          overlapRatio: 0.1,
          updateFrequency: 0.3,
          queryPattern: "random",
        },
        complexity: {
          naive: 2500,
          spatial: 500,
          optimized: 100,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.executionTime).toBeLessThan(100);
    });

    it("should not include batch overhead", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 50,
          spatialDensity: 0.2,
          overlapRatio: 0.1,
          updateFrequency: 0.3,
          queryPattern: "random",
        },
        complexity: {
          naive: 2500,
          spatial: 500,
          optimized: 100,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      const expectedMemory = 50 * 8;
      expect(selection.expectedPerformance.memoryUsage).toBe(expectedMemory);
    });

    it("should scale execution time with object count", () => {
      const smallAnalysis: WorkloadAnalysis = {
        workload: {
          objectCount: 10,
          spatialDensity: 0.2,
          overlapRatio: 0.1,
          updateFrequency: 0.3,
          queryPattern: "random",
        },
        complexity: {
          naive: 100,
          spatial: 20,
          optimized: 4,
        },
      };

      const largeAnalysis: WorkloadAnalysis = {
        workload: {
          objectCount: 90,
          spatialDensity: 0.2,
          overlapRatio: 0.1,
          updateFrequency: 0.3,
          queryPattern: "random",
        },
        complexity: {
          naive: 8100,
          spatial: 1620,
          optimized: 324,
        },
      };

      const smallSelection = selector.selectOptimalUnionFindAlgorithm(smallAnalysis);
      const largeSelection = selector.selectOptimalUnionFindAlgorithm(largeAnalysis);

      expect(largeSelection.expectedPerformance.executionTime).toBeGreaterThan(
        smallSelection.expectedPerformance.executionTime
      );
    });
  });

  describe("performance estimates for batch union-find", () => {
    it("should provide reasonable execution time estimates", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 500,
          spatialDensity: 0.4,
          overlapRatio: 0.2,
          updateFrequency: 0.6,
          queryPattern: "sequential",
        },
        complexity: {
          naive: 250000,
          spatial: 50000,
          optimized: 10000,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.executionTime).toBeLessThan(100);
    });

    it("should include batch overhead", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 500,
          spatialDensity: 0.4,
          overlapRatio: 0.2,
          updateFrequency: 0.6,
          queryPattern: "sequential",
        },
        complexity: {
          naive: 250000,
          spatial: 50000,
          optimized: 10000,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      const expectedMemory = 500 * 8 + 512;
      expect(selection.expectedPerformance.memoryUsage).toBe(expectedMemory);
    });

    it("should scale execution time with object count", () => {
      const smallAnalysis: WorkloadAnalysis = {
        workload: {
          objectCount: 100,
          spatialDensity: 0.4,
          overlapRatio: 0.2,
          updateFrequency: 0.6,
          queryPattern: "sequential",
        },
        complexity: {
          naive: 10000,
          spatial: 2000,
          optimized: 400,
        },
      };

      const largeAnalysis: WorkloadAnalysis = {
        workload: {
          objectCount: 1000,
          spatialDensity: 0.4,
          overlapRatio: 0.2,
          updateFrequency: 0.6,
          queryPattern: "sequential",
        },
        complexity: {
          naive: 1000000,
          spatial: 200000,
          optimized: 40000,
        },
      };

      const smallSelection = selector.selectOptimalUnionFindAlgorithm(smallAnalysis);
      const largeSelection = selector.selectOptimalUnionFindAlgorithm(largeAnalysis);

      expect(largeSelection.expectedPerformance.executionTime).toBeGreaterThan(
        smallSelection.expectedPerformance.executionTime
      );
    });

    it("should have faster execution time than standard for same size", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 200,
          spatialDensity: 0.4,
          overlapRatio: 0.2,
          updateFrequency: 0.6,
          queryPattern: "sequential",
        },
        complexity: {
          naive: 40000,
          spatial: 8000,
          optimized: 1600,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      // Batch should be faster (0.0005 multiplier vs 0.001 for standard)
      const standardTime = 200 * Math.log(200) * 0.001;
      expect(selection.expectedPerformance.executionTime).toBeLessThan(standardTime);
    });
  });

  describe("reasoning strings", () => {
    it("should provide valid reasoning for standard union-find selection", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 50,
          spatialDensity: 0.2,
          overlapRatio: 0.1,
          updateFrequency: 0.3,
          queryPattern: "random",
        },
        complexity: {
          naive: 2500,
          spatial: 500,
          optimized: 100,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      expect(selection.reasoning).toBeInstanceOf(Array);
      expect(selection.reasoning.length).toBeGreaterThan(0);
      expect(selection.reasoning.every(reason => typeof reason === "string")).toBe(true);
      expect(selection.reasoning).toContain("Small dataset size optimal for standard Union-Find");
    });

    it("should provide valid reasoning for batch union-find selection", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 500,
          spatialDensity: 0.4,
          overlapRatio: 0.2,
          updateFrequency: 0.6,
          queryPattern: "sequential",
        },
        complexity: {
          naive: 250000,
          spatial: 50000,
          optimized: 10000,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      expect(selection.reasoning).toBeInstanceOf(Array);
      expect(selection.reasoning.length).toBeGreaterThan(0);
      expect(selection.reasoning.every(reason => typeof reason === "string")).toBe(true);
      expect(selection.reasoning).toContain("Large dataset benefits from batch operations");
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

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      expect(selection).toBeDefined();
      expect(selection.algorithm).toBe("data-structures/union-find");
    });

    it("should handle very large object count", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 100000,
          spatialDensity: 0.4,
          overlapRatio: 0.2,
          updateFrequency: 0.6,
          queryPattern: "sequential",
        },
        complexity: {
          naive: 10000000000,
          spatial: 2000000000,
          optimized: 400000000,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      expect(selection).toBeDefined();
      expect(selection.algorithm).toBe("batch-data-structures/union-find");
    });

    it("should handle undefined complexity", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 50,
          spatialDensity: 0.2,
          overlapRatio: 0.1,
          updateFrequency: 0.3,
          queryPattern: "random",
        },
        complexity: undefined,
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      expect(selection).toBeDefined();
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
    });
  });

  describe("confidence levels", () => {
    it("should return correct confidence for standard union-find", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 50,
          spatialDensity: 0.2,
          overlapRatio: 0.1,
          updateFrequency: 0.3,
          queryPattern: "random",
        },
        complexity: {
          naive: 2500,
          spatial: 500,
          optimized: 100,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      expect(selection.confidence).toBe(0.9);
    });

    it("should return correct confidence for batch union-find", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 500,
          spatialDensity: 0.4,
          overlapRatio: 0.2,
          updateFrequency: 0.6,
          queryPattern: "sequential",
        },
        complexity: {
          naive: 250000,
          spatial: 50000,
          optimized: 10000,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      expect(selection.confidence).toBe(0.9);
    });
  });

  describe("memory usage calculations", () => {
    it("should calculate memory correctly for standard union-find", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 75,
          spatialDensity: 0.2,
          overlapRatio: 0.1,
          updateFrequency: 0.3,
          queryPattern: "random",
        },
        complexity: {
          naive: 5625,
          spatial: 1125,
          optimized: 225,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      expect(selection.expectedPerformance.memoryUsage).toBe(75 * 8);
    });

    it("should calculate memory correctly for batch union-find", () => {
      const analysis: WorkloadAnalysis = {
        workload: {
          objectCount: 250,
          spatialDensity: 0.4,
          overlapRatio: 0.2,
          updateFrequency: 0.6,
          queryPattern: "sequential",
        },
        complexity: {
          naive: 62500,
          spatial: 12500,
          optimized: 2500,
        },
      };

      const selection = selector.selectOptimalUnionFindAlgorithm(analysis);

      expect(selection.expectedPerformance.memoryUsage).toBe(250 * 8 + 512);
    });
  });
});
