/**
 * @file Wave Function Collapse Generation Logic
 * @description Generation loop and grid generation implementations
 */

import type {
  Tile,
  Constraint,
  WaveFunctionCollapseConfig,
  WaveFunctionCollapseAnalysis,
} from "./wave-function-collapse-types";
import { createInitialGrid } from "./wfc-backtrack";
import { analyzeResult } from "./wfc-observation";
import { runGenerationLoop } from "./wfc-generation-loop";
import { resolveConstraints, validateConstraints, convertGrid2DToResult, type GridGenerationOptions } from "./wfc-grid-helpers";

export type InternalGridResult = {
  grid: string[][];
  iterations: number;
  stats: {
    collapsedCells: number;
    totalCells: number;
    iterations: number;
    backtrackingAttempts: number;
    contradictions: number;
    executionTime: number;
    finalEntropy: number;
    success: boolean;
  };
};

type StatsFunction = () => {
  collapsedCells: number;
  totalCells: number;
  iterations: number;
  backtrackingAttempts: number;
  contradictions: number;
  executionTime: number;
  finalEntropy: number;
  success: boolean;
};

/**
 * Generate 2D grid
 * @param config Configuration options
 * @param tiles Available tiles
 * @param constraints Tile constraints
 * @param options Generation options
 * @param random Random number generator
 * @param getEmptyStats Function to get empty statistics
 * @returns Generation result
 * @example
 * ```typescript
 * const result = generateGrid2D(config, tiles, constraints, {}, random, getEmptyStats);
 * ```
 */
export function generateGrid2D(
  config: WaveFunctionCollapseConfig,
  tiles: Tile[],
  constraints: Constraint[],
  options: GridGenerationOptions,
  random: () => number,
  getEmptyStats: StatsFunction
): InternalGridResult {
  const width = config.width ?? 1;
  const height = config.height ?? 1;
  const depth = 1;
  const maxIterations = config.maxIterations ?? 10000;

  const activeConstraints = resolveConstraints(tiles, constraints, options);
  validateConstraints(activeConstraints, tiles);

  const grid = createInitialGrid(width, height, depth, tiles.map(t => t.id));
  const result = runGenerationLoop(grid, activeConstraints, width, height, depth, maxIterations, random);

  return {
    grid: convertGrid2DToResult(grid, width, height),
    iterations: result.iterations,
    stats: getEmptyStats(),
  };
}

/**
 * Generate 3D grid
 * @param config Configuration options
 * @param tiles Available tiles
 * @param constraints Tile constraints
 * @param options Generation options
 * @param random Random number generator
 * @param getEmptyStats Function to get empty statistics
 * @returns Generation result with optional analysis
 * @example
 * ```typescript
 * const result = generateGrid3D(config, tiles, constraints, {}, random, getEmptyStats);
 * ```
 */
export function generateGrid3D(
  config: WaveFunctionCollapseConfig,
  tiles: Tile[],
  constraints: Constraint[],
  options: GridGenerationOptions,
  random: () => number,
  getEmptyStats: StatsFunction
): InternalGridResult & { analysis?: WaveFunctionCollapseAnalysis } {
  const width = config.width ?? 1;
  const height = config.height ?? 1;
  const depth = config.depth ?? 1;
  const maxIterations = config.maxIterations ?? 10000;

  const activeConstraints = resolveConstraints(tiles, constraints, options);
  if (!activeConstraints || activeConstraints.length === 0) {
    throw new Error("No constraints available for 3D generation");
  }
  validateConstraints(activeConstraints, tiles);

  const grid = createInitialGrid(width, height, depth, tiles.map(t => t.id));
  const result = runGenerationLoop(grid, activeConstraints, width, height, depth, maxIterations, random);

  const resultGrid = convertGrid2DToResult(grid, width, height);
  const baseResult: InternalGridResult = {
    grid: resultGrid,
    iterations: result.iterations,
    stats: getEmptyStats(),
  };

  if (options.analysisOptions) {
    return {
      ...baseResult,
      analysis: analyzeResult(grid, options.analysisOptions),
    };
  }

  return baseResult;
}
