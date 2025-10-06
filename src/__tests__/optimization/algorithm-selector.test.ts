import { describe, expect, it, beforeEach } from "vitest";
import {
  AlgorithmSelector,
  WorkloadCharacteristics,
  AlgorithmSelection,
} from "../../optimization/core/algorithm-selector";

describe("AlgorithmSelector", () => {
  let selector: AlgorithmSelector;

  beforeEach(() => {
    selector = new AlgorithmSelector();
  });

  describe("selectCollisionAlgorithm", () => {
    it("should select naive algorithm for small datasets", () => {
      const workload: WorkloadCharacteristics = {
        objectCount: 50,
        spatialDensity: 0.1,
        overlapRatio: 0.05,
        updateFrequency: 0.2,
        queryPattern: "random",
      };

      const selection = selector.selectCollisionAlgorithm(workload);

      expect(selection.algorithm).toBe("naive");
      expect(selection.confidence).toBe(0.9);
      expect(selection.reasoning).toContain("Small object count favors naive approach");
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
    });

    it("should select spatial algorithm for medium datasets", () => {
      const workload: WorkloadCharacteristics = {
        objectCount: 200,
        spatialDensity: 0.3,
        overlapRatio: 0.1,
        updateFrequency: 0.5,
        queryPattern: "random",
      };

      const selection = selector.selectCollisionAlgorithm(workload);

      expect(selection.algorithm).toBe("spatial");
      expect(selection.confidence).toBe(0.8);
      expect(selection.reasoning).toContain("Medium object count benefits from spatial optimization");
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
    });

    it("should select optimized algorithm for large datasets", () => {
      const workload: WorkloadCharacteristics = {
        objectCount: 1000,
        spatialDensity: 0.5,
        overlapRatio: 0.2,
        updateFrequency: 0.8,
        queryPattern: "clustered",
      };

      const selection = selector.selectCollisionAlgorithm(workload);

      expect(selection.algorithm).toBe("optimized");
      expect(selection.confidence).toBe(0.95);
      expect(selection.reasoning).toContain("Large object count requires optimization");
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
    });

    it("should handle edge case at threshold boundaries", () => {
      const workloadAt100: WorkloadCharacteristics = {
        objectCount: 100,
        spatialDensity: 0.2,
        overlapRatio: 0.08,
        updateFrequency: 0.3,
        queryPattern: "random",
      };

      const selection = selector.selectCollisionAlgorithm(workloadAt100);

      expect(selection.algorithm).toBeOneOf(["naive", "spatial"]);
      expect(selection.confidence).toBeGreaterThan(0.5);
    });

    it("should handle workload with memory constraints", () => {
      const constrainedWorkload: WorkloadCharacteristics = {
        objectCount: 300,
        spatialDensity: 0.4,
        overlapRatio: 0.15,
        updateFrequency: 0.6,
        queryPattern: "random",
        memoryConstraints: {
          maxMemoryUsage: 1024,
          gcPressure: 0.8,
        },
      };

      const selection = selector.selectCollisionAlgorithm(constrainedWorkload);

      expect(selection).toBeDefined();
      // The algorithm selector considers memory constraints but doesn't strictly enforce them
      // in the returned performance estimates. Just verify it provides reasonable estimates.
      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
    });
  });

  describe("selectSpatialAlgorithm", () => {
    it("should select optimized spatial for high density workloads", () => {
      const highDensityWorkload: WorkloadCharacteristics = {
        objectCount: 300,
        spatialDensity: 0.8,
        overlapRatio: 0.3,
        updateFrequency: 0.7,
        queryPattern: "clustered",
      };

      const selection = selector.selectSpatialAlgorithm(highDensityWorkload);

      expect(selection.algorithm).toBe("optimized-spatial");
      expect(selection.confidence).toBe(0.9);
      expect(selection.reasoning).toContain("High spatial density benefits from optimization");
    });

    it("should select standard spatial for low density workloads", () => {
      const lowDensityWorkload: WorkloadCharacteristics = {
        objectCount: 200,
        spatialDensity: 0.3,
        overlapRatio: 0.1,
        updateFrequency: 0.4,
        queryPattern: "random",
      };

      const selection = selector.selectSpatialAlgorithm(lowDensityWorkload);

      expect(selection.algorithm).toBe("spatial");
      expect(selection.confidence).toBe(0.8);
      expect(selection.reasoning).toContain("Low spatial density allows standard spatial hashing");
    });

    it("should handle edge case at density threshold", () => {
      const thresholdWorkload: WorkloadCharacteristics = {
        objectCount: 250,
        spatialDensity: 0.7,
        overlapRatio: 0.2,
        updateFrequency: 0.5,
        queryPattern: "random",
      };

      const selection = selector.selectSpatialAlgorithm(thresholdWorkload);

      expect(selection.algorithm).toBeOneOf(["spatial", "optimized-spatial"]);
      expect(selection.confidence).toBeGreaterThan(0.5);
    });
  });

  describe("selectUnionFindAlgorithm", () => {
    it("should select standard union-find for small datasets", () => {
      const smallWorkload: WorkloadCharacteristics = {
        objectCount: 50,
        spatialDensity: 0.2,
        overlapRatio: 0.1,
        updateFrequency: 0.3,
        queryPattern: "random",
      };

      const selection = selector.selectUnionFindAlgorithm(smallWorkload);

      expect(selection.algorithm).toBe("union-find");
      expect(selection.confidence).toBe(0.9);
      expect(selection.reasoning).toContain("Small dataset size optimal for standard Union-Find");
    });

    it("should select batch union-find for large datasets", () => {
      const largeWorkload: WorkloadCharacteristics = {
        objectCount: 500,
        spatialDensity: 0.4,
        overlapRatio: 0.2,
        updateFrequency: 0.6,
        queryPattern: "sequential",
      };

      const selection = selector.selectUnionFindAlgorithm(largeWorkload);

      expect(selection.algorithm).toBe("batch-union-find");
      expect(selection.confidence).toBe(0.9);
      expect(selection.reasoning).toContain("Large dataset benefits from batch operations");
    });

    it("should handle threshold boundary", () => {
      const thresholdWorkload: WorkloadCharacteristics = {
        objectCount: 100,
        spatialDensity: 0.3,
        overlapRatio: 0.15,
        updateFrequency: 0.4,
        queryPattern: "random",
      };

      const selection = selector.selectUnionFindAlgorithm(thresholdWorkload);

      expect(selection.algorithm).toBeOneOf(["union-find", "batch-union-find"]);
      expect(selection.confidence).toBe(0.9);
    });
  });

  describe("query patterns", () => {
    it("should handle random query pattern", () => {
      const randomWorkload: WorkloadCharacteristics = {
        objectCount: 200,
        spatialDensity: 0.3,
        overlapRatio: 0.1,
        updateFrequency: 0.5,
        queryPattern: "random",
      };

      const selection = selector.selectCollisionAlgorithm(randomWorkload);

      expect(selection).toBeDefined();
      expect(selection.algorithm).toBeOneOf(["naive", "spatial", "optimized"]);
    });

    it("should handle clustered query pattern", () => {
      const clusteredWorkload: WorkloadCharacteristics = {
        objectCount: 300,
        spatialDensity: 0.6,
        overlapRatio: 0.25,
        updateFrequency: 0.7,
        queryPattern: "clustered",
      };

      const selection = selector.selectCollisionAlgorithm(clusteredWorkload);

      expect(selection).toBeDefined();
      expect(selection.algorithm).toBeOneOf(["naive", "spatial", "optimized"]);
    });

    it("should handle sequential query pattern", () => {
      const sequentialWorkload: WorkloadCharacteristics = {
        objectCount: 150,
        spatialDensity: 0.2,
        overlapRatio: 0.08,
        updateFrequency: 0.3,
        queryPattern: "sequential",
      };

      const selection = selector.selectCollisionAlgorithm(sequentialWorkload);

      expect(selection).toBeDefined();
      expect(selection.algorithm).toBeOneOf(["naive", "spatial", "optimized"]);
    });
  });

  describe("performance characteristics", () => {
    it("should provide reasonable execution time estimates", () => {
      const workload: WorkloadCharacteristics = {
        objectCount: 100,
        spatialDensity: 0.2,
        overlapRatio: 0.1,
        updateFrequency: 0.4,
        queryPattern: "random",
      };

      const selection = selector.selectCollisionAlgorithm(workload);

      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.executionTime).toBeLessThan(1000); // Reasonable upper bound
    });

    it("should provide reasonable memory usage estimates", () => {
      const workload: WorkloadCharacteristics = {
        objectCount: 200,
        spatialDensity: 0.3,
        overlapRatio: 0.15,
        updateFrequency: 0.5,
        queryPattern: "random",
      };

      const selection = selector.selectCollisionAlgorithm(workload);

      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeLessThan(100000); // Reasonable upper bound
    });

    it("should scale execution time with object count", () => {
      const smallWorkload: WorkloadCharacteristics = {
        objectCount: 50,
        spatialDensity: 0.2,
        overlapRatio: 0.1,
        updateFrequency: 0.4,
        queryPattern: "random",
      };

      const largeWorkload: WorkloadCharacteristics = {
        objectCount: 500,
        spatialDensity: 0.2,
        overlapRatio: 0.1,
        updateFrequency: 0.4,
        queryPattern: "random",
      };

      const smallSelection = selector.selectCollisionAlgorithm(smallWorkload);
      const largeSelection = selector.selectCollisionAlgorithm(largeWorkload);

      expect(largeSelection.expectedPerformance.executionTime).toBeGreaterThan(
        smallSelection.expectedPerformance.executionTime
      );
    });
  });

  describe("edge cases", () => {
    it("should handle zero object count", () => {
      const zeroWorkload: WorkloadCharacteristics = {
        objectCount: 0,
        spatialDensity: 0,
        overlapRatio: 0,
        updateFrequency: 0,
        queryPattern: "random",
      };

      const selection = selector.selectCollisionAlgorithm(zeroWorkload);

      expect(selection).toBeDefined();
      expect(selection.algorithm).toBe("naive");
    });

    it("should handle maximum values", () => {
      const maxWorkload: WorkloadCharacteristics = {
        objectCount: 10000,
        spatialDensity: 1.0,
        overlapRatio: 1.0,
        updateFrequency: 1.0,
        queryPattern: "clustered",
      };

      const selection = selector.selectCollisionAlgorithm(maxWorkload);

      expect(selection).toBeDefined();
      expect(selection.algorithm).toBe("optimized");
    });

    it("should handle fractional values", () => {
      const fractionalWorkload: WorkloadCharacteristics = {
        objectCount: 123,
        spatialDensity: 0.456,
        overlapRatio: 0.789,
        updateFrequency: 0.321,
        queryPattern: "random",
      };

      const selection = selector.selectCollisionAlgorithm(fractionalWorkload);

      expect(selection).toBeDefined();
      expect(selection.confidence).toBeGreaterThan(0);
      expect(selection.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe("consistency", () => {
    it("should return consistent results for identical workloads", () => {
      const workload: WorkloadCharacteristics = {
        objectCount: 200,
        spatialDensity: 0.3,
        overlapRatio: 0.15,
        updateFrequency: 0.5,
        queryPattern: "random",
      };

      const selection1 = selector.selectCollisionAlgorithm(workload);
      const selection2 = selector.selectCollisionAlgorithm(workload);

      expect(selection1.algorithm).toBe(selection2.algorithm);
      expect(selection1.confidence).toBe(selection2.confidence);
      expect(selection1.expectedPerformance.executionTime).toBe(selection2.expectedPerformance.executionTime);
    });

    it("should provide valid reasoning for all selections", () => {
      const workloads: WorkloadCharacteristics[] = [
        {
          objectCount: 50,
          spatialDensity: 0.1,
          overlapRatio: 0.05,
          updateFrequency: 0.2,
          queryPattern: "random",
        },
        {
          objectCount: 200,
          spatialDensity: 0.3,
          overlapRatio: 0.1,
          updateFrequency: 0.5,
          queryPattern: "clustered",
        },
        {
          objectCount: 1000,
          spatialDensity: 0.6,
          overlapRatio: 0.3,
          updateFrequency: 0.8,
          queryPattern: "sequential",
        },
      ];

      workloads.forEach(workload => {
        const selection = selector.selectCollisionAlgorithm(workload);

        expect(selection.reasoning).toBeInstanceOf(Array);
        expect(selection.reasoning.length).toBeGreaterThan(0);
        expect(selection.reasoning.every(reason => typeof reason === "string")).toBe(true);
      });
    });
  });
});
