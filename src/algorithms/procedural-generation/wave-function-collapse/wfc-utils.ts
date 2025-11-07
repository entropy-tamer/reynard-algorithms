/**
 * @file Wave Function Collapse Utility Functions
 * @description Utility functions for WFC algorithm
 */

import type { WaveFunctionCollapseStats, WaveFunctionCollapseAnalysis } from "./wave-function-collapse-types";

/**
 * Create seeded random number generator
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/**
 * Get empty statistics
 */
export function getEmptyStats(): WaveFunctionCollapseStats {
  return {
    collapsedCells: 0,
    totalCells: 0,
    iterations: 0,
    backtrackingAttempts: 0,
    contradictions: 0,
    executionTime: 0,
    finalEntropy: 0,
    success: false,
  } as WaveFunctionCollapseStats;
}

/**
 * Get empty analysis
 */
export function getEmptyAnalysis(): WaveFunctionCollapseAnalysis {
  return {
    tileDistribution: { totalTiles: 0, uniqueTiles: 0, tileCounts: {}, tilePercentages: {} },
    entropyAnalysis: { averageEntropy: 0, minEntropy: 0, maxEntropy: 0, entropyVariance: 0 },
    constraintAnalysis: { totalConstraints: 0, satisfiedConstraints: 0, violatedConstraints: 0, satisfactionRate: 0 },
    executionTime: 0,
  };
}












