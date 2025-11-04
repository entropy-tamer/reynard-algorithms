/**
 * Workload Analysis Utilities
 *
 * Analyzes collision detection workloads to determine optimal algorithm selection.
 * Provides insights into spatial distribution, overlap patterns, and query characteristics.
 *
 * @module algorithms/optimization/workloadAnalyzer
 */

import type { AABB } from "../../algorithms/collision/narrow-phase/aabb/aabb-types";
import type { WorkloadCharacteristics } from "../core/algorithm-selector-types";
import { checkCollision } from "./collision-algorithms";

export interface WorkloadAnalysisResult {
  characteristics: WorkloadCharacteristics;
  recommendations: {
    preferredAlgorithm: string;
    confidence: number;
    reasoning: string;
  };
}

/**
 * Analyze workload characteristics for algorithm selection
 * @param aabbs
 * @example
 */
export function analyzeWorkload(aabbs: AABB[]): WorkloadCharacteristics {
  const objectCount = aabbs.length;
  const spatialDensity = calculateSpatialDensity(aabbs);
  const overlapRatio = calculateOverlapRatio(aabbs);
  const updateFrequency = 0; // Will be provided by caller
  const queryPattern = analyzeQueryPattern(aabbs);

  return {
    objectCount,
    spatialDensity,
    overlapRatio,
    updateFrequency,
    queryPattern,
  };
}

/**
 * Calculate spatial density of objects
 * @param aabbs
 * @example
 */
export function calculateSpatialDensity(aabbs: AABB[]): number {
  if (aabbs.length === 0) return 0;

  // Calculate bounding box of all objects
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  let totalArea = 0;

  for (const aabb of aabbs) {
    minX = Math.min(minX, aabb.x);
    minY = Math.min(minY, aabb.y);
    maxX = Math.max(maxX, aabb.x + aabb.width);
    maxY = Math.max(maxY, aabb.y + aabb.height);
    totalArea += aabb.width * aabb.height;
  }

  const boundingArea = (maxX - minX) * (maxY - minY);
  return boundingArea > 0 ? totalArea / boundingArea : 0;
}

/**
 * Calculate overlap ratio between objects
 * @param aabbs
 * @example
 */
export function calculateOverlapRatio(aabbs: AABB[]): number {
  if (aabbs.length < 2) return 0;

  let overlapCount = 0;
  let totalPairs = 0;

  // Sample a subset for performance
  const sampleSize = Math.min(100, aabbs.length);
  const step = Math.max(1, Math.floor(aabbs.length / sampleSize));

  for (let i = 0; i < aabbs.length; i += step) {
    for (let j = i + step; j < aabbs.length; j += step) {
      totalPairs++;
      if (checkCollision(aabbs[i], aabbs[j])) {
        overlapCount++;
      }
    }
  }

  return totalPairs > 0 ? overlapCount / totalPairs : 0;
}

/**
 * Analyze query pattern based on spatial distribution
 * @param aabbs
 * @example
 */
export function analyzeQueryPattern(aabbs: AABB[]): "random" | "clustered" | "sequential" {
  if (aabbs.length < 3) return "random";

  // Analyze spatial distribution
  const spatialDensity = calculateSpatialDensity(aabbs);

  if (spatialDensity > 0.7) return "clustered";
  if (spatialDensity < 0.3) return "random";
  return "sequential";
}

/**
 * Get algorithm recommendation based on workload analysis
 * @param characteristics
 * @example
 */
export function getAlgorithmRecommendation(
  characteristics: WorkloadCharacteristics
): WorkloadAnalysisResult["recommendations"] {
  const { objectCount, spatialDensity, overlapRatio, queryPattern } = characteristics;

  // Small object counts: naive is often fastest
  if (objectCount < 50) {
    return {
      preferredAlgorithm: "naive",
      confidence: 0.9,
      reasoning: "Small object count makes naive O(n²) algorithm optimal",
    };
  }

  // High spatial density: spatial hash excels
  if (spatialDensity > 0.6) {
    return {
      preferredAlgorithm: "spatial",
      confidence: 0.85,
      reasoning: "High spatial density benefits from spatial partitioning",
    };
  }

  // Clustered patterns: spatial hash is ideal
  if (queryPattern === "clustered") {
    return {
      preferredAlgorithm: "spatial",
      confidence: 0.8,
      reasoning: "Clustered objects benefit from spatial hash optimization",
    };
  }

  // High overlap ratio: optimized algorithms help
  if (overlapRatio > 0.3) {
    return {
      preferredAlgorithm: "optimized",
      confidence: 0.75,
      reasoning: "High overlap ratio benefits from optimized collision detection",
    };
  }

  // Default to spatial for medium-large datasets
  if (objectCount > 200) {
    return {
      preferredAlgorithm: "spatial",
      confidence: 0.7,
      reasoning: "Large object count benefits from spatial partitioning",
    };
  }

  // Fallback to naive for medium datasets
  return {
    preferredAlgorithm: "naive",
    confidence: 0.6,
    reasoning: "Medium dataset size with low complexity",
  };
}
