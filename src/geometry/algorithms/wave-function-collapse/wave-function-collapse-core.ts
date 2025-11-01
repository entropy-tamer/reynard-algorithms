/* eslint-disable max-lines, max-lines-per-function, @typescript-eslint/no-explicit-any, jsdoc/require-jsdoc, @typescript-eslint/no-unused-vars */
/**
 * @file Wave Function Collapse core implementation
 *
 * Wave Function Collapse Core Implementation
 *
 * Main Wave Function Collapse class that orchestrates procedural generation
 * using modular components for constraint handling, propagation, observation, and backtracking.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */

import {
  Position2D,
  Position3D,
  Tile,
  Constraint,
  Direction2D,
  Direction3D,
  WaveFunctionCollapseConfig,
  WaveFunctionCollapseStats,
  WaveFunctionCollapseResult,
  WaveFunctionCollapse2DOptions,
  WaveFunctionCollapse3DOptions,
  Cell,
  Pattern,
  WaveFunctionCollapseAnalysisOptions,
  WaveFunctionCollapseAnalysis,
  WaveFunctionCollapseTrainingOptions,
  WaveFunctionCollapseTrainingResult,
  ConstraintBasedWaveFunctionCollapseOptions,
  ConstraintBasedWaveFunctionCollapseResult,
  MultiScaleWaveFunctionCollapseOptions,
  MultiScaleWaveFunctionCollapseResult,
} from "./wave-function-collapse-types";
import { generateConstraintsFromPatterns, validateConstraints, generateConstraintsFromSockets } from "./wfc-constraint";
import { propagateConstraints, findMinimumEntropyCell, collapseCell, selectRandomTile, isGridFullyCollapsed } from "./wfc-propagation";
import { extractPatterns2D, extractPatterns3D, analyzeResult } from "./wfc-observation";
import { BacktrackManager, hasContradictions, createInitialGrid } from "./wfc-backtrack";

/**
 * The WaveFunctionCollapse class provides implementations of the Wave Function Collapse algorithm
 * for constraint-based procedural generation. It supports both 2D and 3D generation with
 * overlapping and tiled models, making it ideal for creating coherent, tile-based content.
 */
export class WaveFunctionCollapse {
  private config: WaveFunctionCollapseConfig;
  private random: () => number;

  constructor(config: Partial<WaveFunctionCollapseConfig> = {}) {
    this.config = {
      width: 10,
      height: 10,
      depth: 1,
      patternSize: 2,
      maxIterations: 10000,
      seed: Math.random(),
      ...config,
    };

    this.random = this.createSeededRandom(this.config.seed!);
  }

  /**
   * Generate 2D content using Wave Function Collapse
   *
   * @param options Generation options
   * @param tiles Available tiles
   * @param constraints Tile constraints
   * @returns Generation result
   */
  generate2D(
    options: WaveFunctionCollapse2DOptions,
    tiles: Tile[],
    constraints: Constraint[]
  ): WaveFunctionCollapseResult {
    const startTime = performance.now();

    try {
      const mergedConfig = { ...this.config, ...options };
      const result = this.generateGrid2D(mergedConfig, tiles, constraints);
      const executionTime = performance.now() - startTime;

      return {
        success: true,
        grid: result.grid,
        stats: { ...result.stats, executionTime, success: true },
        message: "ok",
      } as any;
    } catch (error) {
      return {
        success: false,
        grid: [],
        stats: { ...this.getEmptyStats(), executionTime: performance.now() - startTime, success: false, error: error instanceof Error ? error.message : "Unknown error" },
        message: error instanceof Error ? error.message : "Unknown error",
      } as any;
    }
  }

  /**
   * Generate 3D content using Wave Function Collapse
   *
   * @param options Generation options
   * @param tiles Available tiles
   * @param constraints Tile constraints
   * @returns Generation result
   */
  generate3D(
    options: WaveFunctionCollapse3DOptions,
    tiles: Tile[],
    constraints: Constraint[]
  ): WaveFunctionCollapseResult {
    const startTime = performance.now();

    try {
      const mergedConfig = { ...this.config, ...options };
      const result = this.generateGrid3D(mergedConfig, tiles, constraints);
      const executionTime = performance.now() - startTime;

      return {
        success: true,
        grid: result.grid,
        stats: { ...result.stats, executionTime, success: true },
        message: "ok",
      } as any;
    } catch (error) {
      return {
        success: false,
        grid: [],
        stats: { ...this.getEmptyStats(), executionTime: performance.now() - startTime, success: false, error: error instanceof Error ? error.message : "Unknown error" },
        message: error instanceof Error ? error.message : "Unknown error",
      } as any;
    }
  }

  /**
   * Train from input data
   *
   * @param options Training options
   * @returns Training result
   */
  trainFromInput(options: WaveFunctionCollapseTrainingOptions): WaveFunctionCollapseTrainingResult {
    const startTime = performance.now();

    try {
      const { inputData, patternSize = 2 } = options;

      if (!inputData || inputData.length === 0 || inputData[0].length === 0) {
        throw new Error("Input data is empty or invalid");
      }

      // Extract unique tiles
      const tileSet = new Set<string>();
      for (const row of inputData) {
        for (const tile of row) {
          tileSet.add(tile);
        }
      }

      const tiles: Tile[] = Array.from(tileSet).map(id => ({ id, weight: 1.0 }));

      // Extract patterns
      const patterns = extractPatterns2D(inputData, patternSize);

      // Generate constraints
      const constraints = generateConstraintsFromPatterns(patterns);

      const executionTime = performance.now() - startTime;

      return {
        success: true,
        tiles,
        constraints,
        patterns,
        stats: {
          inputSize: { width: inputData[0].length, height: inputData.length },
          extractedTiles: tiles.length,
          extractedPatterns: patterns.length,
          learnedConstraints: constraints.length,
          executionTime,
        },
        message: "ok",
      };
    } catch (error) {
      return {
        success: false,
        tiles: [],
        constraints: [],
        patterns: [],
        stats: {
          inputSize: { width: 0, height: 0 },
          extractedTiles: 0,
          extractedPatterns: 0,
          learnedConstraints: 0,
          executionTime: performance.now() - startTime,
        },
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate 2D grid
   *
   * @param config Configuration
   * @param tiles Available tiles
   * @param constraints Tile constraints
   * @param options Additional options
   * @returns Generation result
   */
  private generateGrid2D(
    config: WaveFunctionCollapseConfig,
    tiles: Tile[],
    constraints: Constraint[],
    options: any = {}
  ): any {
    const width = config.width ?? 1;
    const height = config.height ?? 1;
    const depth = 1;
    const maxIterations = config.maxIterations ?? 10000;

    // Prefer explicit constraints; otherwise derive from sockets or patterns
    let activeConstraints: Constraint[] = constraints;
    if (!activeConstraints || activeConstraints.length === 0) {
      if (tiles.some(t => t.sockets2D)) {
        activeConstraints = generateConstraintsFromSockets(tiles);
      } else if (options.patterns2D) {
        activeConstraints = generateConstraintsFromPatterns(options.patterns2D);
      }
    }

    // Validate inputs
    if (!validateConstraints(activeConstraints, tiles)) {
      throw new Error("Invalid constraints for provided tiles");
    }

    // Create initial grid
    const grid = createInitialGrid(width, height, depth, tiles.map(t => t.id));
    const backtrackManager = new BacktrackManager();
    const collapsedPositions: Position3D[] = [];

    let iterations = 0;
    let success = false;

    while (iterations < maxIterations && !success) {
      // Check for contradictions
      if (hasContradictions(grid, width, height, depth)) {
        // Try to backtrack
        const previousState = backtrackManager.restoreState();
        if (previousState) {
          // Restore previous state
          Object.assign(grid, previousState.grid);
          collapsedPositions.length = 0;
          collapsedPositions.push(...previousState.collapsedPositions);
          iterations = previousState.step;
          continue;
        } else {
          // No more backtracking possible
          break;
        }
      }

      // Check if fully collapsed
      if (isGridFullyCollapsed(grid, width, height, depth)) {
        success = true;
            break;
          }

      // Find cell with minimum entropy
      const minEntropyPos = findMinimumEntropyCell(grid, width, height, depth);
      if (!minEntropyPos) {
          break;
      }

      // Save state before collapsing
      backtrackManager.saveState(grid, [...collapsedPositions], iterations);

      // Collapse cell
      const cell = grid[minEntropyPos.z][minEntropyPos.y][minEntropyPos.x];
      const selectedTile = selectRandomTile(cell, this.random);
      collapseCell(cell, selectedTile, this.random);
      collapsedPositions.push(minEntropyPos);

      // Propagate constraints
      const propagationSuccess = propagateConstraints(
        grid,
        activeConstraints,
        minEntropyPos,
        selectedTile as any,
        width,
        height,
        depth
      );

      if (!propagationSuccess) {
        // Contradiction found, will backtrack on next iteration
          continue;
      }

      iterations++;
    }

    // Convert grid to result format
    const resultGrid: string[][] = [];
    for (let y = 0; y < height; y++) {
      const row: string[] = [];
      for (let x = 0; x < width; x++) {
        const cell = grid[0][y][x];
        row.push(cell.isCollapsed ? cell.possibleTiles[0] : '');
      }
      resultGrid.push(row);
    }

    return {
      grid: resultGrid,
      iterations,
      stats: this.getEmptyStats(),
    } as any;
  }

  /**
   * Generate 3D grid
   *
   * @param config Configuration
   * @param tiles Available tiles
   * @param constraints Tile constraints
   * @param options Additional options
   * @returns Generation result
   */
  private generateGrid3D(
    config: WaveFunctionCollapseConfig,
    tiles: Tile[],
    constraints: Constraint[],
    options: any = {}
  ): any {
    const { width = 1, height = 1, depth = 1, maxIterations } = config;

    // Prefer explicit constraints; otherwise derive from sockets or patterns
    let activeConstraints: Constraint[] = constraints;
    if (!activeConstraints || activeConstraints.length === 0) {
      if (tiles.some(t => t.sockets3D)) {
        activeConstraints = generateConstraintsFromSockets(tiles);
      } else {
        // Best-effort: use 2D patterns on each layer if provided via options.inputData3D
        if (options.patterns3D) {
          activeConstraints = generateConstraintsFromPatterns(options.patterns3D);
        } else {
          activeConstraints = [];
        }
      }
    }

    if (!validateConstraints(activeConstraints, tiles)) {
      throw new Error("Invalid constraints for provided tiles (3D)");
    }

    const grid = createInitialGrid(width, height, depth, tiles.map(t => t.id));
    const backtrackManager = new BacktrackManager();
    const collapsedPositions: Position3D[] = [];

    let iterations = 0;
    let success = false;

    while (iterations < (maxIterations ?? 10000) && !success) {
      if (hasContradictions(grid, width, height, depth)) {
        const previousState = backtrackManager.restoreState();
        if (previousState) {
          Object.assign(grid, previousState.grid);
          collapsedPositions.length = 0;
          collapsedPositions.push(...previousState.collapsedPositions);
          iterations = previousState.step;
          continue;
        } else {
          break;
        }
      }

      if (isGridFullyCollapsed(grid, width, height, depth)) {
        success = true;
        break;
      }

      const minEntropyPos = findMinimumEntropyCell(grid, width, height, depth);
      if (!minEntropyPos) break;

      backtrackManager.saveState(grid, [...collapsedPositions], iterations);

      const cell = grid[minEntropyPos.z][minEntropyPos.y][minEntropyPos.x];
      const selectedTile = selectRandomTile(cell, this.random);
      collapseCell(cell, selectedTile, this.random);
      collapsedPositions.push(minEntropyPos);

      const propagationSuccess = propagateConstraints(
        grid,
        activeConstraints,
        minEntropyPos,
        (selectedTile as any),
        width,
        height,
        depth
      );

      if (!propagationSuccess) {
        continue;
      }

      iterations++;
    }

    // Convert grid to result format (top layer projection for simplified grid)
    const resultGrid: string[][] = [];
    for (let y = 0; y < height; y++) {
      const row: string[] = [];
      for (let x = 0; x < width; x++) {
        const cell = grid[0][y][x];
        row.push(cell.isCollapsed ? (cell.possibleTiles[0] as any) : "");
      }
      resultGrid.push(row);
    }

    return {
      grid: resultGrid,
      iterations,
      stats: this.getEmptyStats(),
      analysis: analyzeResult(grid as any, options.analysisOptions || {}),
    };
  }

  /**
   * Create seeded random number generator
   *
   * @param seed Seed value
   * @returns Random number generator function
   */
  private createSeededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  /**
   * Get empty statistics
   *
   * @returns Empty statistics object
   */
  private getEmptyStats(): WaveFunctionCollapseStats {
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
   *
   * @returns Empty analysis object
   */
  private getEmptyAnalysis(): WaveFunctionCollapseAnalysis {
    return {
      tileDistribution: { totalTiles: 0, uniqueTiles: 0, tileCounts: {}, tilePercentages: {} },
      entropyAnalysis: { averageEntropy: 0, minEntropy: 0, maxEntropy: 0, entropyVariance: 0 },
      constraintAnalysis: { totalConstraints: 0, satisfiedConstraints: 0, violatedConstraints: 0, satisfactionRate: 0 },
      executionTime: 0,
    } as any;
  }
}