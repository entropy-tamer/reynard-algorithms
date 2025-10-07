/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from "vitest";
import {
  analyzeWorkload,
  getAlgorithmRecommendation,
  calculateSpatialDensity,
  analyzeQueryPattern,
} from "../../../optimization/adapters/workload-analyzer";
import type { AABB } from "../../../computational-geometry/collision/aabb-types";

describe("WorkloadAnalyzer", () => {
  describe("calculateSpatialDensity", () => {
    it("should calculate low density for scattered objects", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 100, y: 100, width: 10, height: 10 },
        { x: 200, y: 200, width: 10, height: 10 },
      ];

      const density = calculateSpatialDensity(aabbs);
      expect(density).toBeLessThan(0.3);
    });

    it("should calculate high density for clustered objects", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
        { x: 10, y: 10, width: 10, height: 10 },
        { x: 15, y: 15, width: 10, height: 10 },
      ];

      const density = calculateSpatialDensity(aabbs);
      expect(density).toBeGreaterThan(0.5);
    });

    it("should handle empty array", () => {
      const density = calculateSpatialDensity([]);
      expect(density).toBe(0);
    });

    it("should handle single object", () => {
      const aabbs: AABB[] = [{ x: 0, y: 0, width: 10, height: 10 }];
      const density = calculateSpatialDensity(aabbs);
      expect(density).toBeGreaterThanOrEqual(0);
    });
  });

  describe("analyzeQueryPattern", () => {
    it("should detect clustered pattern", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 2, y: 2, width: 10, height: 10 },
        { x: 4, y: 4, width: 10, height: 10 },
        { x: 6, y: 6, width: 10, height: 10 },
      ];

      const pattern = analyzeQueryPattern(aabbs);
      expect(pattern).toBe("clustered");
    });

    it("should detect random pattern", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 100, y: 100, width: 10, height: 10 },
        { x: 200, y: 200, width: 10, height: 10 },
      ];

      const pattern = analyzeQueryPattern(aabbs);
      expect(pattern).toBe("random");
    });

    it("should detect sequential pattern", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 20, y: 0, width: 10, height: 10 },
        { x: 40, y: 0, width: 10, height: 10 },
        { x: 60, y: 0, width: 10, height: 10 },
      ];

      const pattern = analyzeQueryPattern(aabbs);
      expect(pattern).toBe("sequential");
    });
  });

  describe("getAlgorithmRecommendation", () => {
    it("should recommend naive for small object counts", () => {
      const characteristics = {
        objectCount: 20,
        spatialDensity: 0.5,
        overlapRatio: 0.1,
        updateFrequency: 0,
        queryPattern: "random" as const,
      };

      const recommendation = getAlgorithmRecommendation(characteristics);
      expect(recommendation.preferredAlgorithm).toBe("naive");
      expect(recommendation.confidence).toBe(0.9);
    });

    it("should recommend spatial for high spatial density", () => {
      const characteristics = {
        objectCount: 100,
        spatialDensity: 0.8,
        overlapRatio: 0.1,
        updateFrequency: 0,
        queryPattern: "random" as const,
      };

      const recommendation = getAlgorithmRecommendation(characteristics);
      expect(recommendation.preferredAlgorithm).toBe("spatial");
      expect(recommendation.confidence).toBe(0.85);
    });

    it("should recommend spatial for clustered patterns", () => {
      const characteristics = {
        objectCount: 100,
        spatialDensity: 0.5,
        overlapRatio: 0.1,
        updateFrequency: 0,
        queryPattern: "clustered" as const,
      };

      const recommendation = getAlgorithmRecommendation(characteristics);
      expect(recommendation.preferredAlgorithm).toBe("spatial");
      expect(recommendation.confidence).toBe(0.8);
    });

    it("should recommend optimized for high overlap ratio", () => {
      const characteristics = {
        objectCount: 100,
        spatialDensity: 0.5,
        overlapRatio: 0.5,
        updateFrequency: 0,
        queryPattern: "random" as const,
      };

      const recommendation = getAlgorithmRecommendation(characteristics);
      expect(recommendation.preferredAlgorithm).toBe("optimized");
      expect(recommendation.confidence).toBe(0.75);
    });

    it("should recommend spatial for large object counts", () => {
      const characteristics = {
        objectCount: 300,
        spatialDensity: 0.5,
        overlapRatio: 0.1,
        updateFrequency: 0,
        queryPattern: "random" as const,
      };

      const recommendation = getAlgorithmRecommendation(characteristics);
      expect(recommendation.preferredAlgorithm).toBe("spatial");
      expect(recommendation.confidence).toBe(0.7);
    });

    it("should fallback to naive for medium datasets", () => {
      const characteristics = {
        objectCount: 100,
        spatialDensity: 0.4,
        overlapRatio: 0.1,
        updateFrequency: 0,
        queryPattern: "random" as const,
      };

      const recommendation = getAlgorithmRecommendation(characteristics);
      expect(recommendation.preferredAlgorithm).toBe("naive");
      expect(recommendation.confidence).toBe(0.6);
    });
  });

  describe("analyzeWorkload", () => {
    it("should analyze workload characteristics", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
        { x: 10, y: 10, width: 10, height: 10 },
      ];

      const characteristics = analyzeWorkload(aabbs);

      expect(characteristics.objectCount).toBe(3);
      expect(characteristics.spatialDensity).toBeGreaterThan(0);
      expect(characteristics.overlapRatio).toBeGreaterThan(0);
      expect(characteristics.updateFrequency).toBe(0);
      expect(characteristics.queryPattern).toBe("clustered");
    });

    it("should handle empty workload", () => {
      const characteristics = analyzeWorkload([]);

      expect(characteristics.objectCount).toBe(0);
      expect(characteristics.spatialDensity).toBe(0);
      expect(characteristics.overlapRatio).toBe(0);
      expect(characteristics.updateFrequency).toBe(0);
      expect(characteristics.queryPattern).toBe("random");
    });

    it("should handle single object workload", () => {
      const aabbs: AABB[] = [{ x: 0, y: 0, width: 10, height: 10 }];
      const characteristics = analyzeWorkload(aabbs);

      expect(characteristics.objectCount).toBe(1);
      expect(characteristics.spatialDensity).toBeGreaterThanOrEqual(0);
      expect(characteristics.overlapRatio).toBe(0);
    });
  });
});
