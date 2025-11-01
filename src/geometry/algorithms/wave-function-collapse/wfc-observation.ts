/**
 * Wave Function Collapse Observation Operations
 *
 * Handles pattern extraction, analysis, and observation
 * for the Wave Function Collapse algorithm.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */

import type {
  Pattern,
  Position2D,
  Position3D,
  WaveFunctionCollapseAnalysis,
  WaveFunctionCollapseAnalysisOptions,
} from "./wave-function-collapse-types";

/**
 * Extract patterns from 2D input data
 *
 * @param inputData 2D input data
 * @param patternSize Size of patterns to extract
 * @returns Array of extracted patterns
 */
export function extractPatterns2D(
  inputData: string[][],
  patternSize: number
): Pattern[] {
  const patterns: Pattern[] = [];
  const height = inputData.length;
  const width = inputData[0]?.length || 0;

  for (let y = 0; y <= height - patternSize; y++) {
    for (let x = 0; x <= width - patternSize; x++) {
      const pattern = extractPatternAt2D(inputData, x, y, patternSize);
      patterns.push(pattern);
    }
  }

  return patterns;
}

/**
 * Extract patterns from 3D input data
 *
 * @param inputData 3D input data
 * @param patternSize Size of patterns to extract
 * @returns Array of extracted patterns
 */
export function extractPatterns3D(
  inputData: string[][][],
  patternSize: number
): Pattern[] {
  const patterns: Pattern[] = [];
  const depth = inputData.length;
  const height = inputData[0]?.length || 0;
  const width = inputData[0]?.[0]?.length || 0;

  for (let z = 0; z <= depth - patternSize; z++) {
    for (let y = 0; y <= height - patternSize; y++) {
      for (let x = 0; x <= width - patternSize; x++) {
        const pattern = extractPatternAt3D(inputData, x, y, z, patternSize);
        patterns.push(pattern);
      }
    }
  }

  return patterns;
}

/**
 * Extract pattern at specific 2D position
 *
 * @param inputData 2D input data
 * @param x X position
 * @param y Y position
 * @param patternSize Size of pattern
 * @returns Extracted pattern
 */
function extractPatternAt2D(
  inputData: string[][],
  x: number,
  y: number,
  patternSize: number
): Pattern {
  const data: string[][] = [];
  
  for (let dy = 0; dy < patternSize; dy++) {
    const row: string[] = [];
    for (let dx = 0; dx < patternSize; dx++) {
      row.push(inputData[y + dy][x + dx]);
    }
    data.push(row);
  }

  return {
    data: data as any,
    width: patternSize,
    height: patternSize,
    depth: 1,
    frequency: 1,
  };
}

/**
 * Extract pattern at specific 3D position
 *
 * @param inputData 3D input data
 * @param x X position
 * @param y Y position
 * @param z Z position
 * @param patternSize Size of pattern
 * @returns Extracted pattern
 */
function extractPatternAt3D(
  inputData: string[][][],
  x: number,
  y: number,
  z: number,
  patternSize: number
): Pattern {
  const data: string[][][] = [];
  
  for (let dz = 0; dz < patternSize; dz++) {
    const layer: string[][] = [];
    for (let dy = 0; dy < patternSize; dy++) {
      const row: string[] = [];
      for (let dx = 0; dx < patternSize; dx++) {
        row.push(inputData[z + dz][y + dy][x + dx]);
      }
      layer.push(row);
    }
    data.push(layer);
  }

  return {
    data: data as any,
    width: patternSize,
    height: patternSize,
    depth: patternSize,
    frequency: 1,
  };
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

/**
 * Calculate entropy from tile frequencies
 *
 * @param frequencies Map of tile frequencies
 * @returns Entropy value
 */
function calculateEntropy(frequencies: Map<string, number>): number {
  const total = Array.from(frequencies.values()).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;

  let entropy = 0;
  for (const count of frequencies.values()) {
    const probability = count / total;
    if (probability > 0) {
      entropy -= probability * Math.log2(probability);
    }
  }

  return entropy;
}

/**
 * Calculate entropy from tile counts object
 *
 * @param counts Record of tile counts
 * @returns Entropy value
 */
function calculateEntropyFromCounts(counts: Record<string, number>): number {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;

  let entropy = 0;
  for (const count of Object.values(counts)) {
    const probability = count / total;
    if (probability > 0) {
      entropy -= probability * Math.log2(probability);
    }
  }

  return entropy;
}

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
 * Extract pattern as string for comparison
 *
 * @param grid Grid data
 * @param x X position
 * @param y Y position
 * @param z Z position
 * @param patternSize Size of pattern
 * @returns Pattern as string
 */
function extractPatternString(
  grid: any[][][],
  x: number,
  y: number,
  z: number,
  patternSize: number
): string {
  const parts: string[] = [];
  
  for (let dz = 0; dz < patternSize; dz++) {
    for (let dy = 0; dy < patternSize; dy++) {
      for (let dx = 0; dx < patternSize; dx++) {
        parts.push(grid[z + dz][y + dy][x + dx] || '');
      }
    }
  }
  
  return parts.join(',');
}

/**
 * Get tile frequency distribution
 *
 * @param grid Generated grid
 * @returns Map of tile frequencies
 */
export function getTileFrequencyDistribution(grid: any[][][]): Map<string, number> {
  const frequencies = new Map<string, number>();
  const depth = grid.length;
  const height = grid[0]?.length || 0;
  const width = grid[0]?.[0]?.length || 0;

  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = grid[z][y][x];
        if (tile) {
          frequencies.set(tile, (frequencies.get(tile) || 0) + 1);
        }
      }
    }
  }

  return frequencies;
}

/**
 * Check if grid contains specific tile
 *
 * @param grid Generated grid
 * @param tileId Tile ID to search for
 * @returns True if tile is found
 */
export function gridContainsTile(grid: any[][][], tileId: string): boolean {
  const depth = grid.length;
  const height = grid[0]?.length || 0;
  const width = grid[0]?.[0]?.length || 0;

  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[z][y][x] === tileId) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Get positions of specific tile
 *
 * @param grid Generated grid
 * @param tileId Tile ID to search for
 * @returns Array of positions where tile is found
 */
export function getTilePositions(grid: any[][][], tileId: string): Position3D[] {
  const positions: Position3D[] = [];
  const depth = grid.length;
  const height = grid[0]?.length || 0;
  const width = grid[0]?.[0]?.length || 0;

  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[z][y][x] === tileId) {
          positions.push({ x, y, z });
        }
      }
    }
  }

  return positions;
}

