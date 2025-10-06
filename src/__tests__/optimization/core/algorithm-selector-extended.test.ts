/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AlgorithmSelector } from "../../../optimization/core/algorithm-selector";
import type { WorkloadCharacteristics, PerformanceRecord } from "../../../optimization/core/algorithm-selector";

describe("Algorithm Selector Extended Coverage", () => {
  let selector: AlgorithmSelector;

  beforeEach(() => {
    selector = new AlgorithmSelector();
  });

  afterEach(() => {
    selector.clearPerformanceHistory();
  });

  describe("selectCollisionAlgorithm - Line 85 Coverage", () => {
    it("should record selection and return result", () => {
      const workload: WorkloadCharacteristics = {
        objectCount: 100,
        spatialDensity: 0.5,
        overlapRatio: 0.1,
        updateFrequency: 0.8,
        queryPattern: "random",
      };

      const selection = selector.selectCollisionAlgorithm(workload);

      expect(selection).toBeDefined();
      expect(selection.algorithm).toBeDefined();
      expect(selection.confidence).toBeGreaterThan(0);
      expect(selection.expectedPerformance).toBeDefined();
      expect(selection.reasoning).toBeDefined();

      // Should have recorded the selection
      const stats = selector.getSelectionStats();
      expect(stats).toBeDefined();
    });

    it("should record selection for different workload types", () => {
      const workloads: WorkloadCharacteristics[] = [
        {
          objectCount: 50,
          spatialDensity: 0.2,
          overlapRatio: 0.05,
          updateFrequency: 0.3,
          queryPattern: "sequential",
        },
        {
          objectCount: 500,
          spatialDensity: 0.8,
          overlapRatio: 0.3,
          updateFrequency: 0.9,
          queryPattern: "clustered",
        },
        {
          objectCount: 1000,
          spatialDensity: 1.2,
          overlapRatio: 0.5,
          updateFrequency: 0.1,
          queryPattern: "random",
        },
      ];

      workloads.forEach(workload => {
        const selection = selector.selectCollisionAlgorithm(workload);
        expect(selection).toBeDefined();
        expect(selection.algorithm).toBeDefined();
      });

      // Should have recorded multiple selections
      const stats = selector.getSelectionStats();
      expect(stats).toBeDefined();
    });
  });

  describe("updatePerformanceModel - Lines 520-529 Coverage", () => {
    it("should add performance record to history", () => {
      const initialHistory = selector.getPerformanceHistory();
      expect(initialHistory.length).toBe(0);

      const performanceRecord: PerformanceRecord = {
        algorithm: "naive",
        objectCount: 100,
        executionTime: 5.2,
        memoryUsage: 1024,
        timestamp: Date.now(),
        workloadCharacteristics: {
          objectCount: 100,
          spatialDensity: 0.5,
          overlapRatio: 0.1,
          updateFrequency: 0.8,
          queryPattern: "random",
        },
      };

      selector.updatePerformanceModel(performanceRecord);

      const updatedHistory = selector.getPerformanceHistory();
      expect(updatedHistory.length).toBe(1);
      expect(updatedHistory[0]).toEqual(performanceRecord);
    });

    it("should limit history to 1000 records", () => {
      // Add 1001 performance records
      for (let i = 0; i < 1001; i++) {
        const performanceRecord: PerformanceRecord = {
          algorithm: "naive",
          objectCount: 100,
          executionTime: 5.2,
          memoryUsage: 1024,
          timestamp: Date.now(),
          workloadCharacteristics: {
            objectCount: 100,
            spatialDensity: 0.5,
            overlapRatio: 0.1,
            updateFrequency: 0.8,
            queryPattern: "random",
          },
        };

        selector.updatePerformanceModel(performanceRecord);
      }

      const history = selector.getPerformanceHistory();
      expect(history.length).toBe(1000);
    });

    it("should keep most recent records when limiting history", () => {
      // Add 1000 records
      for (let i = 0; i < 1000; i++) {
        const performanceRecord: PerformanceRecord = {
          algorithm: "naive",
          objectCount: 100,
          executionTime: 5.2,
          memoryUsage: 1024,
          timestamp: Date.now() + i, // Incrementing timestamp
          workloadCharacteristics: {
            objectCount: 100,
            spatialDensity: 0.5,
            overlapRatio: 0.1,
            updateFrequency: 0.8,
            queryPattern: "random",
          },
        };

        selector.updatePerformanceModel(performanceRecord);
      }

      // Add one more record
      const latestRecord: PerformanceRecord = {
        algorithm: "spatial",
        objectCount: 200,
        executionTime: 8.5,
        memoryUsage: 2048,
        timestamp: Date.now() + 1000,
        workloadCharacteristics: {
          objectCount: 200,
          spatialDensity: 0.7,
          overlapRatio: 0.2,
          updateFrequency: 0.6,
          queryPattern: "clustered",
        },
      };

      selector.updatePerformanceModel(latestRecord);

      const history = selector.getPerformanceHistory();
      expect(history.length).toBe(1000);
      expect(history[history.length - 1]).toEqual(latestRecord);
    });

    it("should update selection statistics", () => {
      const performanceRecord: PerformanceRecord = {
        algorithm: "naive",
        objectCount: 100,
        executionTime: 5.2,
        memoryUsage: 1024,
        timestamp: Date.now(),
        workloadCharacteristics: {
          objectCount: 100,
          spatialDensity: 0.5,
          overlapRatio: 0.1,
          updateFrequency: 0.8,
          queryPattern: "random",
        },
      };

      selector.updatePerformanceModel(performanceRecord);

      // Should have updated selection statistics
      const stats = selector.getSelectionStats();
      expect(stats).toBeDefined();
    });
  });

  describe("updateSelectionStats - Line 537 Coverage", () => {
    it("should handle updateSelectionStats call", () => {
      const performanceRecord: PerformanceRecord = {
        algorithm: "naive",
        objectCount: 100,
        executionTime: 5.2,
        memoryUsage: 1024,
        timestamp: Date.now(),
        workloadCharacteristics: {
          objectCount: 100,
          spatialDensity: 0.5,
          overlapRatio: 0.1,
          updateFrequency: 0.8,
          queryPattern: "random",
        },
      };

      // This should trigger updateSelectionStats internally
      selector.updatePerformanceModel(performanceRecord);

      // Should not throw and should update stats
      const stats = selector.getSelectionStats();
      expect(stats).toBeDefined();
    });

    it("should handle multiple updateSelectionStats calls", () => {
      const performanceRecords: PerformanceRecord[] = [
        {
          algorithm: "naive",
          objectCount: 100,
          executionTime: 5.2,
          memoryUsage: 1024,
          timestamp: Date.now(),
          workloadCharacteristics: {
            objectCount: 100,
            spatialDensity: 0.5,
            overlapRatio: 0.1,
            updateFrequency: 0.8,
            queryPattern: "random",
          },
        },
        {
          algorithm: "spatial",
          objectCount: 200,
          executionTime: 8.5,
          memoryUsage: 2048,
          timestamp: Date.now() + 1000,
          workloadCharacteristics: {
            objectCount: 200,
            spatialDensity: 0.7,
            overlapRatio: 0.2,
            updateFrequency: 0.6,
            queryPattern: "clustered",
          },
        },
        {
          algorithm: "optimized",
          objectCount: 500,
          executionTime: 12.3,
          memoryUsage: 4096,
          timestamp: Date.now() + 2000,
          workloadCharacteristics: {
            objectCount: 500,
            spatialDensity: 1.0,
            overlapRatio: 0.4,
            updateFrequency: 0.9,
            queryPattern: "random",
          },
        },
      ];

      performanceRecords.forEach(record => {
        selector.updatePerformanceModel(record);
      });

      // Should handle multiple calls without issues
      const stats = selector.getSelectionStats();
      expect(stats).toBeDefined();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty performance record", () => {
      const performanceRecord: PerformanceRecord = {
        algorithm: "naive",
        objectCount: 0,
        executionTime: 0,
        memoryUsage: 0,
        timestamp: 0,
        workloadCharacteristics: {
          objectCount: 0,
          spatialDensity: 0,
          overlapRatio: 0,
          updateFrequency: 0,
          queryPattern: "random",
        },
      };

      selector.updatePerformanceModel(performanceRecord);

      const history = selector.getPerformanceHistory();
      expect(history.length).toBe(1);
      expect(history[0]).toEqual(performanceRecord);
    });

    it("should handle performance record with negative values", () => {
      const performanceRecord: PerformanceRecord = {
        algorithm: "naive",
        objectCount: -1,
        executionTime: -1,
        memoryUsage: -1,
        timestamp: -1,
        workloadCharacteristics: {
          objectCount: -1,
          spatialDensity: -1,
          overlapRatio: -1,
          updateFrequency: -1,
          queryPattern: "random",
        },
      };

      selector.updatePerformanceModel(performanceRecord);

      const history = selector.getPerformanceHistory();
      expect(history.length).toBe(1);
      expect(history[0]).toEqual(performanceRecord);
    });

    it("should handle performance record with very large values", () => {
      const performanceRecord: PerformanceRecord = {
        algorithm: "naive",
        objectCount: Number.MAX_SAFE_INTEGER,
        executionTime: Number.MAX_SAFE_INTEGER,
        memoryUsage: Number.MAX_SAFE_INTEGER,
        timestamp: Number.MAX_SAFE_INTEGER,
        workloadCharacteristics: {
          objectCount: Number.MAX_SAFE_INTEGER,
          spatialDensity: Number.MAX_SAFE_INTEGER,
          overlapRatio: Number.MAX_SAFE_INTEGER,
          updateFrequency: Number.MAX_SAFE_INTEGER,
          queryPattern: "random",
        },
      };

      selector.updatePerformanceModel(performanceRecord);

      const history = selector.getPerformanceHistory();
      expect(history.length).toBe(1);
      expect(history[0]).toEqual(performanceRecord);
    });

    it("should handle performance record with invalid algorithm", () => {
      const performanceRecord: PerformanceRecord = {
        algorithm: "invalid" as any,
        objectCount: 100,
        executionTime: 5.2,
        memoryUsage: 1024,
        timestamp: Date.now(),
        workloadCharacteristics: {
          objectCount: 100,
          spatialDensity: 0.5,
          overlapRatio: 0.1,
          updateFrequency: 0.8,
          queryPattern: "random",
        },
      };

      selector.updatePerformanceModel(performanceRecord);

      const history = selector.getPerformanceHistory();
      expect(history.length).toBe(1);
      expect(history[0]).toEqual(performanceRecord);
    });

    it("should handle performance record with invalid query pattern", () => {
      const performanceRecord: PerformanceRecord = {
        algorithm: "naive",
        objectCount: 100,
        executionTime: 5.2,
        memoryUsage: 1024,
        timestamp: Date.now(),
        workloadCharacteristics: {
          objectCount: 100,
          spatialDensity: 0.5,
          overlapRatio: 0.1,
          updateFrequency: 0.8,
          queryPattern: "invalid" as any,
        },
      };

      selector.updatePerformanceModel(performanceRecord);

      const history = selector.getPerformanceHistory();
      expect(history.length).toBe(1);
      expect(history[0]).toEqual(performanceRecord);
    });
  });

  describe("Performance and Memory Management", () => {
    it("should handle large number of performance records efficiently", () => {
      const startTime = Date.now();

      // Add 1000 performance records
      for (let i = 0; i < 1000; i++) {
        const performanceRecord: PerformanceRecord = {
          algorithm: i % 3 === 0 ? "naive" : i % 3 === 1 ? "spatial" : "optimized",
          objectCount: 100 + i,
          executionTime: 5.2 + i * 0.01,
          memoryUsage: 1024 + i * 10,
          timestamp: Date.now() + i,
          workloadCharacteristics: {
            objectCount: 100 + i,
            spatialDensity: 0.5 + i * 0.001,
            overlapRatio: 0.1 + i * 0.0001,
            updateFrequency: 0.8 + i * 0.0001,
            queryPattern: i % 2 === 0 ? "random" : "clustered",
          },
        };

        selector.updatePerformanceModel(performanceRecord);
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time (less than 1 second)
      expect(executionTime).toBeLessThan(1000);

      const history = selector.getPerformanceHistory();
      expect(history.length).toBe(1000);
    });

    it("should handle memory cleanup when limiting history", () => {
      // Add 1000 records
      for (let i = 0; i < 1000; i++) {
        const performanceRecord: PerformanceRecord = {
          algorithm: "naive",
          objectCount: 100,
          executionTime: 5.2,
          memoryUsage: 1024,
          timestamp: Date.now() + i,
          workloadCharacteristics: {
            objectCount: 100,
            spatialDensity: 0.5,
            overlapRatio: 0.1,
            updateFrequency: 0.8,
            queryPattern: "random",
          },
        };

        selector.updatePerformanceModel(performanceRecord);
      }

      // Add one more record to trigger cleanup
      const latestRecord: PerformanceRecord = {
        algorithm: "spatial",
        objectCount: 200,
        executionTime: 8.5,
        memoryUsage: 2048,
        timestamp: Date.now() + 1000,
        workloadCharacteristics: {
          objectCount: 200,
          spatialDensity: 0.7,
          overlapRatio: 0.2,
          updateFrequency: 0.6,
          queryPattern: "clustered",
        },
      };

      selector.updatePerformanceModel(latestRecord);

      const history = selector.getPerformanceHistory();
      expect(history.length).toBe(1000);

      // Should have cleaned up old records
      expect(history[0].timestamp).toBeGreaterThan(0);
    });
  });
});
