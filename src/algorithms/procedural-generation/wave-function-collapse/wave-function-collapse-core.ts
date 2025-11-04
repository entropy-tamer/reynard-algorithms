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
  Tile,
  Constraint,
  WaveFunctionCollapseConfig,
  WaveFunctionCollapseResult,
  WaveFunctionCollapse2DOptions,
  WaveFunctionCollapse3DOptions,
  WaveFunctionCollapseTrainingOptions,
  WaveFunctionCollapseTrainingResult,
} from "./wave-function-collapse-types";
import { extractPatterns2D } from "./wfc-observation";
import { generateConstraintsFromPatterns } from "./wfc-constraint";
import { generateGrid2D, generateGrid3D } from "./wfc-generation";
import { createSeededRandom, getEmptyStats } from "./wfc-utils";

/**
 * The WaveFunctionCollapse class provides implementations of the Wave Function Collapse algorithm
 * for constraint-based procedural generation. It supports both 2D and 3D generation with
 * overlapping and tiled models, making it ideal for creating coherent, tile-based content.
 */
export class WaveFunctionCollapse {
  private config: WaveFunctionCollapseConfig;
  private random: () => number;

  /**
   * Creates a new WaveFunctionCollapse instance
   *
   * @param config Configuration options
   * @example const wfc = new WaveFunctionCollapse({width: 10, height: 10})
   */
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

    this.random = createSeededRandom(this.config.seed!);
  }

  /**
   * Generate 2D content using Wave Function Collapse
   *
   * @param options Generation options
   * @param tiles Available tiles
   * @param constraints Tile constraints
   * @returns Generation result
   * @example const wfc = new WaveFunctionCollapse(); const result = wfc.generate2D({width: 10, height: 10}, tiles, constraints);
   */
  generate2D(
    options: WaveFunctionCollapse2DOptions,
    tiles: Tile[],
    constraints: Constraint[]
  ): WaveFunctionCollapseResult {
    const startTime = performance.now();

    try {
      const mergedConfig = { ...this.config, ...options };
      const result = generateGrid2D(mergedConfig, tiles, constraints, {}, this.random, getEmptyStats);
      const executionTime = performance.now() - startTime;

      return {
        success: true,
        grid: result.grid,
        stats: { ...result.stats, executionTime, success: true },
        message: "ok",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        grid: [],
        stats: {
          ...getEmptyStats(),
          executionTime: performance.now() - startTime,
          success: false,
          error: errorMessage,
        },
        message: errorMessage,
      };
    }
  }

  /**
   * Generate 3D content using Wave Function Collapse
   *
   * @param options Generation options
   * @param tiles Available tiles
   * @param constraints Tile constraints
   * @returns Generation result
   * @example const wfc = new WaveFunctionCollapse(); const result = wfc.generate3D({width: 10, height: 10, depth: 5}, tiles, constraints);
   */
  generate3D(
    options: WaveFunctionCollapse3DOptions,
    tiles: Tile[],
    constraints: Constraint[]
  ): WaveFunctionCollapseResult {
    const startTime = performance.now();

    try {
      const mergedConfig = { ...this.config, ...options };
      const result = generateGrid3D(mergedConfig, tiles, constraints, {}, this.random, getEmptyStats);
      const executionTime = performance.now() - startTime;

      return {
        success: true,
        grid: result.grid,
        stats: { ...result.stats, executionTime, success: true },
        message: "ok",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        grid: [],
        stats: {
          ...getEmptyStats(),
          executionTime: performance.now() - startTime,
          success: false,
          error: errorMessage,
        },
        message: errorMessage,
      };
    }
  }

  /**
   * Train from input data
   *
   * @param options Training options
   * @returns Training result
   * @example const wfc = new WaveFunctionCollapse(); const result = wfc.trainFromInput({inputData: [['tile1', 'tile2'], ['tile2', 'tile3']]});
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
      const patterns = extractPatterns2D(inputData, patternSize);
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
}
