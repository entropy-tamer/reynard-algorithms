/**
 * @file Procedural Selector Tests
 *
 * Tests for the PAW procedural generation algorithm selector.
 */

import { describe, expect, it } from "vitest";
import { ProceduralSelector } from "../../optimization/core/procedural-selector";
import type { WorkloadAnalysis } from "../../optimization/core/algorithm-selector-types";

describe("ProceduralSelector", () => {
  const selector = new ProceduralSelector();

  describe("selectOptimalProceduralAlgorithm", () => {
    it("should select refined LUT for small grids", () => {
      const analysis: WorkloadAnalysis = {
        complexity: {
          naive: 100,
          spatial: 50,
          optimized: 80,
          crossoverPoint: 100,
          recommendation: "refined-lut",
        },
        memoryPressure: {
          estimatedUsage: {
            naive: 1000,
            spatial: 2000,
            optimized: 1500,
          },
          pressure: 0.1,
          recommendation: "low",
        },
        performanceProfile: {
          confidence: 0.9,
          expectedPerformance: {
            executionTime: 1,
            memoryUsage: 1000,
            allocationCount: 10,
            cacheHitRate: 0.9,
          },
          historicalData: [],
        },
        recommendations: [],
        workload: {
          objectCount: 25 * 25, // 25x25 grid
          spatialDensity: 0.5,
          overlapRatio: 0.1,
          updateFrequency: 1,
          queryPattern: "random",
        },
      };

      const selection = selector.selectOptimalProceduralAlgorithm(analysis);

      expect(selection.algorithm).toBe("refined-lut");
      expect(selection.confidence).toBeGreaterThan(0.9);
      expect(selection.reasoning.length).toBeGreaterThan(0);
    });

    it("should select refined LUT with interpolation for medium grids", () => {
      const analysis: WorkloadAnalysis = {
        complexity: {
          naive: 2500,
          spatial: 1250,
          optimized: 2000,
          crossoverPoint: 2500,
          recommendation: "refined-lut-interpolated",
        },
        memoryPressure: {
          estimatedUsage: {
            naive: 10000,
            spatial: 20000,
            optimized: 15000,
          },
          pressure: 0.3,
          recommendation: "medium",
        },
        performanceProfile: {
          confidence: 0.85,
          expectedPerformance: {
            executionTime: 5,
            memoryUsage: 10000,
            allocationCount: 50,
            cacheHitRate: 0.85,
          },
          historicalData: [],
        },
        recommendations: [],
        workload: {
          objectCount: 75 * 75, // 75x75 grid
          spatialDensity: 0.5,
          overlapRatio: 0.1,
          updateFrequency: 1,
          queryPattern: "random",
        },
      };

      const selection = selector.selectOptimalProceduralAlgorithm(analysis);

      expect(selection.algorithm).toBe("refined-lut-interpolated");
      expect(selection.confidence).toBeGreaterThan(0.8);
    });

    it("should select refined LUT optimized for large grids", () => {
      const analysis: WorkloadAnalysis = {
        complexity: {
          naive: 10000,
          spatial: 5000,
          optimized: 9000,
          crossoverPoint: 10000,
          recommendation: "refined-lut-optimized",
        },
        memoryPressure: {
          estimatedUsage: {
            naive: 100000,
            spatial: 200000,
            optimized: 150000,
          },
          pressure: 0.7,
          recommendation: "high",
        },
        performanceProfile: {
          confidence: 0.8,
          expectedPerformance: {
            executionTime: 20,
            memoryUsage: 100000,
            allocationCount: 200,
            cacheHitRate: 0.8,
          },
          historicalData: [],
        },
        recommendations: [],
        workload: {
          objectCount: 150 * 150, // 150x150 grid
          spatialDensity: 0.5,
          overlapRatio: 0.1,
          updateFrequency: 1,
          queryPattern: "random",
        },
      };

      const selection = selector.selectOptimalProceduralAlgorithm(analysis);

      expect(selection.algorithm).toBe("refined-lut-optimized");
      expect(selection.confidence).toBeGreaterThan(0.8);
    });

    it("should provide expected performance metrics", () => {
      const analysis: WorkloadAnalysis = {
        complexity: {
          naive: 100,
          spatial: 50,
          optimized: 80,
          crossoverPoint: 100,
          recommendation: "refined-lut",
        },
        memoryPressure: {
          estimatedUsage: {
            naive: 1000,
            spatial: 2000,
            optimized: 1500,
          },
          pressure: 0.1,
          recommendation: "low",
        },
        performanceProfile: {
          confidence: 0.9,
          expectedPerformance: {
            executionTime: 1,
            memoryUsage: 1000,
            allocationCount: 10,
            cacheHitRate: 0.9,
          },
          historicalData: [],
        },
        recommendations: [],
        workload: {
          objectCount: 25 * 25,
          spatialDensity: 0.5,
          overlapRatio: 0.1,
          updateFrequency: 1,
          queryPattern: "random",
        },
      };

      const selection = selector.selectOptimalProceduralAlgorithm(analysis);

      expect(selection.expectedPerformance).toBeDefined();
      expect(selection.expectedPerformance.executionTime).toBeGreaterThan(0);
      expect(selection.expectedPerformance.memoryUsage).toBeGreaterThan(0);
    });

    it("should provide reasoning for selection", () => {
      const analysis: WorkloadAnalysis = {
        complexity: {
          naive: 100,
          spatial: 50,
          optimized: 80,
          crossoverPoint: 100,
          recommendation: "refined-lut",
        },
        memoryPressure: {
          estimatedUsage: {
            naive: 1000,
            spatial: 2000,
            optimized: 1500,
          },
          pressure: 0.1,
          recommendation: "low",
        },
        performanceProfile: {
          confidence: 0.9,
          expectedPerformance: {
            executionTime: 1,
            memoryUsage: 1000,
            allocationCount: 10,
            cacheHitRate: 0.9,
          },
          historicalData: [],
        },
        recommendations: [],
        workload: {
          objectCount: 25 * 25,
          spatialDensity: 0.5,
          overlapRatio: 0.1,
          updateFrequency: 1,
          queryPattern: "random",
        },
      };

      const selection = selector.selectOptimalProceduralAlgorithm(analysis);

      expect(selection.reasoning).toBeDefined();
      expect(selection.reasoning.length).toBeGreaterThan(0);
      expect(selection.reasoning.every(r => typeof r === "string")).toBe(true);
    });
  });
});
