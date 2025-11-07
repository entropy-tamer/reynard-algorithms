/**
 * @file Wave Function Collapse Analysis
 *
 * Analyzes generated Wave Function Collapse grids, computing tile distributions,
 * entropy metrics, and pattern statistics.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */

import type {
  WaveFunctionCollapseAnalysis,
  WaveFunctionCollapseAnalysisOptions,
} from "./wave-function-collapse-types";
import { calculateEntropyFromCounts } from "./wfc-entropy";
import { extractPatternString } from "./wfc-pattern-extraction";

/**
 * Count unique patterns in grid
 *
 * @param grid Generated grid
 * @param patternSize Size of patterns to count
 * @returns Number of unique patterns
 */
function countPatterns(grid: any[][][], patternSize: number): number {
  const patterns = new Set<string>();
  const depth = grid.length;
  const height = grid[0]?.length || 0;
  const width = grid[0]?.[0]?.length || 0;

  for (let z = 0; z <= depth - patternSize; z++) {
    for (let y = 0; y <= height - patternSize; y++) {
      for (let x = 0; x <= width - patternSize; x++) {
        const pattern = extractPatternString(grid, x, y, z, patternSize);
        patterns.add(pattern);
      }
    }
  }

  return patterns.size;
}

/**
 * Analyze Wave Function Collapse result
 *
 * @param grid Generated grid
 * @param options Analysis options
 * @returns Analysis result
 */
export function analyzeResult(
  grid: any[][][],
  options: WaveFunctionCollapseAnalysisOptions = {}
): WaveFunctionCollapseAnalysis {
  const width = grid[0]?.[0]?.length || 0;
  const height = grid[0]?.length || 0;
  const depth = grid.length;

  const analysis: WaveFunctionCollapseAnalysis = {
    tileDistribution: {
      totalTiles: 0,
      uniqueTiles: 0,
      tileCounts: {},
      tilePercentages: {},
    },
    entropyAnalysis: {
      averageEntropy: 0,
      minEntropy: 0,
      maxEntropy: 0,
      entropyVariance: 0,
    },
    constraintAnalysis: {
      totalConstraints: 0,
      satisfiedConstraints: 0,
      violatedConstraints: 0,
      satisfactionRate: 1.0,
    },
    executionTime: 0,
    uniqueTiles: [],
    tileFrequencies: {},
    entropy: 0,
    patternCount: 0,
    width: width,
  };

  // Count tiles and calculate frequencies
  const tileCounts: Record<string, number> = {};
  const uniqueTilesSet = new Set<string>();

  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = grid[z][y][x];
        if (tile) {
          uniqueTilesSet.add(tile);
          tileCounts[tile] = (tileCounts[tile] || 0) + 1;
        }
      }
    }
  }

  const totalTiles = Object.values(tileCounts).reduce((sum, count) => sum + count, 0);
  const uniqueTiles = Array.from(uniqueTilesSet);

  // Update analysis
  analysis.tileDistribution = {
    totalTiles,
    uniqueTiles: uniqueTiles.length,
    tileCounts,
    tilePercentages: Object.fromEntries(
      Object.entries(tileCounts).map(([tile, count]) => [tile, count / totalTiles])
    ),
  };

  analysis.uniqueTiles = uniqueTiles;
  analysis.tileFrequencies = tileCounts;
  analysis.entropy = calculateEntropyFromCounts(tileCounts);
  analysis.entropyAnalysis.averageEntropy = analysis.entropy;

  // Count patterns if requested
  if (options.analyzePatterns && options.patternSize) {
    analysis.patternCount = countPatterns(grid, options.patternSize);
  }

  return analysis;
}












