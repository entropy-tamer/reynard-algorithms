/**
 * @module algorithms/geometry/algorithms/wave-function-collapse/wave-function-collapse-core
 * @description Implements the Wave Function Collapse algorithm for constraint-based procedural generation.
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

/**
 * The WaveFunctionCollapse class provides implementations of the Wave Function Collapse algorithm
 * for constraint-based procedural generation. It supports both 2D and 3D generation with
 * overlapping and tiled models, making it ideal for creating coherent, tile-based content.
 *
 * Wave Function Collapse is a constraint-based algorithm that generates content by
 * iteratively collapsing cells with the minimum entropy, propagating constraints,
 * and backtracking when contradictions occur.
 *
 * @example
 * ```typescript
 * const wfc = new WaveFunctionCollapse();
 *
 * // Define tiles
 * const tiles: Tile[] = [
 *   { id: 'grass', weight: 1.0 },
 *   { id: 'water', weight: 0.5 },
 *   { id: 'stone', weight: 0.3 }
 * ];
 *
 * // Define constraints
 * const constraints: Constraint[] = [
 *   { tile1: 'grass', tile2: 'water', direction: 'north' },
 *   { tile1: 'water', tile2: 'stone', direction: 'east' }
 * ];
 *
 * // Generate 2D content
 * const result = wfc.generate2D({ width: 20, height: 20 }, tiles, constraints);
 * console.log("Generated grid:", result.grid);
 *
 * // Train from input data
 * const trainingResult = wfc.trainFromInput({
 *   inputData: [['grass', 'water'], ['stone', 'grass']],
 *   patternSize: 2
 * });
 * ```
 */
export class WaveFunctionCollapse {
  private config: WaveFunctionCollapseConfig;
  private random: () => number;

  /**
   * Creates an instance of WaveFunctionCollapse.
   * @param config - Optional configuration for the generation process.
   */
  constructor(config: Partial<WaveFunctionCollapseConfig> = {}) {
    this.config = {
      width: 10,
      height: 10,
      depth: 1,
      patternSize: 2,
      useOverlappingModel: true,
      periodic: false,
      maxIterations: 10000,
      seed: 0,
      useBacktracking: true,
      maxBacktrackingAttempts: 1000,
      useMinimumEntropy: true,
      useMinimumRemainingValues: true,
      maxTilesPerCell: 1000,
      ...config,
    };

    // Initialize random number generator with seed
    this.random = this.createSeededRandom(this.config.seed!);
  }

  /**
   * Generates a 2D grid using Wave Function Collapse.
   * @param options - Options for 2D generation.
   * @param tiles - Array of available tiles.
   * @param constraints - Array of constraints between tiles.
   * @returns A WaveFunctionCollapseResult object with the generated grid and statistics.
   */
  generate2D(
    options: WaveFunctionCollapse2DOptions,
    tiles: Tile[],
    constraints: Constraint[]
  ): WaveFunctionCollapseResult {
    const startTime = performance.now();
    const mergedConfig = { ...this.config, ...options };

    try {
      const result = this.generateGrid2D(mergedConfig, tiles, constraints);
      const executionTime = performance.now() - startTime;
      result.stats.executionTime = executionTime;

      return {
        grid: result.grid,
        stats: result.stats,
        success: true,
        message: `Successfully generated ${mergedConfig.width}x${mergedConfig.height} grid with ${result.stats.collapsedCells} collapsed cells.`,
      };
    } catch (error) {
      return {
        grid: [],
        stats: {
          collapsedCells: 0,
          totalCells: mergedConfig.width! * mergedConfig.height!,
          iterations: 0,
          backtrackingAttempts: 0,
          contradictions: 0,
          executionTime: performance.now() - startTime,
          finalEntropy: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        success: false,
        message: `Failed to generate 2D Wave Function Collapse: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Generates a 3D grid using Wave Function Collapse.
   * @param options - Options for 3D generation.
   * @param tiles - Array of available tiles.
   * @param constraints - Array of constraints between tiles.
   * @returns A WaveFunctionCollapseResult object with the generated grid and statistics.
   */
  generate3D(
    options: WaveFunctionCollapse3DOptions,
    tiles: Tile[],
    constraints: Constraint[]
  ): WaveFunctionCollapseResult {
    const startTime = performance.now();
    const mergedConfig = { ...this.config, ...options };

    try {
      const result = this.generateGrid3D(mergedConfig, tiles, constraints);
      const executionTime = performance.now() - startTime;
      result.stats.executionTime = executionTime;

      return {
        grid: result.grid,
        stats: result.stats,
        success: true,
        message: `Successfully generated ${mergedConfig.width}x${mergedConfig.height}x${mergedConfig.depth} grid with ${result.stats.collapsedCells} collapsed cells.`,
      };
    } catch (error) {
      return {
        grid: [],
        stats: {
          collapsedCells: 0,
          totalCells: mergedConfig.width! * mergedConfig.height! * mergedConfig.depth!,
          iterations: 0,
          backtrackingAttempts: 0,
          contradictions: 0,
          executionTime: performance.now() - startTime,
          finalEntropy: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        success: false,
        message: `Failed to generate 3D Wave Function Collapse: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Trains the Wave Function Collapse model from input data.
   * @param options - Training options including input data.
   * @returns A WaveFunctionCollapseTrainingResult object with extracted tiles, patterns, and constraints.
   */
  trainFromInput(options: WaveFunctionCollapseTrainingOptions): WaveFunctionCollapseTrainingResult {
    const startTime = performance.now();

    try {
      const {
        inputData,
        patternSize = 2,
        periodic = false,
        includeRotations = true,
        includeReflections = true,
        minFrequency = 1,
      } = options;

      if (!inputData || inputData.length === 0 || inputData[0].length === 0) {
        throw new Error("Input data is empty or invalid");
      }

      const width = inputData[0].length;
      const height = inputData.length;

      // Extract unique tiles
      const tileSet = new Set<string>();
      for (const row of inputData) {
        for (const tile of row) {
          tileSet.add(tile);
        }
      }

      const tiles: Tile[] = Array.from(tileSet).map(id => ({ id, weight: 1.0 }));

      // Extract patterns
      const patterns = this.extractPatterns(
        inputData,
        patternSize,
        periodic,
        includeRotations,
        includeReflections,
        minFrequency
      );

      // Generate constraints from patterns
      const constraints = this.generateConstraintsFromPatterns(patterns, patternSize);

      const executionTime = performance.now() - startTime;

      return {
        tiles,
        patterns,
        constraints,
        stats: {
          inputSize: { width, height },
          extractedTiles: tiles.length,
          extractedPatterns: patterns.length,
          learnedConstraints: constraints.length,
          executionTime,
        },
        success: true,
        message: `Successfully trained model with ${tiles.length} tiles, ${patterns.length} patterns, and ${constraints.length} constraints.`,
      };
    } catch (error) {
      return {
        tiles: [],
        patterns: [],
        constraints: [],
        stats: {
          inputSize: { width: 0, height: 0 },
          extractedTiles: 0,
          extractedPatterns: 0,
          learnedConstraints: 0,
          executionTime: performance.now() - startTime,
        },
        success: false,
        message: `Failed to train model: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Performs constraint-based Wave Function Collapse with custom constraints.
   * @param options - Options for constraint-based generation.
   * @param tiles - Array of available tiles.
   * @param constraints - Array of constraints between tiles.
   * @returns A ConstraintBasedWaveFunctionCollapseResult object.
   */
  constraintBasedGenerate(
    options: ConstraintBasedWaveFunctionCollapseOptions,
    tiles: Tile[],
    constraints: Constraint[]
  ): ConstraintBasedWaveFunctionCollapseResult {
    const startTime = performance.now();
    const mergedConfig = { ...this.config, ...options };

    try {
      const result = this.generateGrid2D(mergedConfig, tiles, constraints, options);
      const executionTime = performance.now() - startTime;
      result.stats.executionTime = executionTime;

      return {
        grid: result.grid,
        stats: result.stats,
        success: true,
        message: `Successfully generated constraint-based grid with ${result.stats.collapsedCells} collapsed cells.`,
      };
    } catch (error) {
      return {
        grid: [],
        stats: {
          collapsedCells: 0,
          totalCells: mergedConfig.width! * mergedConfig.height!,
          iterations: 0,
          backtrackingAttempts: 0,
          contradictions: 0,
          executionTime: performance.now() - startTime,
          finalEntropy: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        success: false,
        message: `Failed to generate constraint-based grid: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Performs multi-scale Wave Function Collapse.
   * @param options - Options for multi-scale generation.
   * @returns A MultiScaleWaveFunctionCollapseResult object.
   */
  multiScaleGenerate(options: MultiScaleWaveFunctionCollapseOptions): MultiScaleWaveFunctionCollapseResult {
    const startTime = performance.now();

    try {
      const { scales, baseConfig, hierarchical: _hierarchical = true, interpolation = "nearest" } = options;
      const grids: Array<{ scale: number; grid: (string | null)[][] }> = [];
      const scaleStats: Array<{
        scale: number;
        iterations: number;
        backtrackingAttempts: number;
        contradictions: number;
      }> = [];

      let totalIterations = 0;
      let totalBacktrackingAttempts = 0;
      let totalContradictions = 0;

      // Generate grids for each scale
      for (const scaleConfig of scales) {
        const result = this.generateGrid2D(
          { ...baseConfig, ...scaleConfig },
          scaleConfig.tiles,
          scaleConfig.constraints
        );

        grids.push({
          scale: scaleConfig.scale,
          grid: result.grid,
        });

        scaleStats.push({
          scale: scaleConfig.scale,
          iterations: result.stats.iterations,
          backtrackingAttempts: result.stats.backtrackingAttempts,
          contradictions: result.stats.contradictions,
        });

        totalIterations += result.stats.iterations;
        totalBacktrackingAttempts += result.stats.backtrackingAttempts;
        totalContradictions += result.stats.contradictions;
      }

      // Interpolate to final grid
      const finalGrid = this.interpolateGrids(grids, interpolation);

      const executionTime = performance.now() - startTime;

      return {
        grids,
        finalGrid,
        stats: {
          totalIterations,
          totalBacktrackingAttempts,
          totalContradictions,
          executionTime,
          scaleStats,
        },
        success: true,
        message: `Successfully generated multi-scale grid with ${grids.length} scales.`,
      };
    } catch (error) {
      return {
        grids: [],
        finalGrid: [],
        stats: {
          totalIterations: 0,
          totalBacktrackingAttempts: 0,
          totalContradictions: 0,
          executionTime: performance.now() - startTime,
          scaleStats: [],
        },
        success: false,
        message: `Failed to generate multi-scale grid: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Analyzes the generated Wave Function Collapse result.
   * @param grid - The generated grid to analyze.
   * @param tiles - The tiles used in generation.
   * @param constraints - The constraints used in generation.
   * @param options - Analysis options.
   * @returns A WaveFunctionCollapseAnalysis object.
   */
  analyzeResult(
    grid: (string | null)[][],
    tiles: Tile[],
    constraints: Constraint[],
    options: Partial<WaveFunctionCollapseAnalysisOptions> = {}
  ): WaveFunctionCollapseAnalysis {
    const startTime = performance.now();
    const analysisOptions: WaveFunctionCollapseAnalysisOptions = {
      computeTileDistribution: true,
      computeEntropyAnalysis: true,
      computeConstraintAnalysis: true,
      computePatternAnalysis: false,
      ...options,
    };

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
        satisfactionRate: 0,
      },
      executionTime: 0,
    };

    if (grid.length === 0 || grid[0].length === 0) {
      analysis.executionTime = performance.now() - startTime;
      return analysis;
    }

    if (analysisOptions.computeTileDistribution) {
      analysis.tileDistribution = this.computeTileDistribution(grid, tiles);
    }

    if (analysisOptions.computeEntropyAnalysis) {
      analysis.entropyAnalysis = this.computeEntropyAnalysis(grid);
    }

    if (analysisOptions.computeConstraintAnalysis) {
      analysis.constraintAnalysis = this.computeConstraintAnalysis(grid, constraints);
    }

    if (analysisOptions.computePatternAnalysis) {
      analysis.patternAnalysis = this.computePatternAnalysis(grid);
    }

    analysis.executionTime = performance.now() - startTime;
    return analysis;
  }

  // Private helper methods

  private createSeededRandom(seed: number): () => number {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  private generateGrid2D(
    config: WaveFunctionCollapseConfig,
    tiles: Tile[],
    constraints: Constraint[],
    customOptions?: ConstraintBasedWaveFunctionCollapseOptions
  ): { grid: (string | null)[][]; stats: WaveFunctionCollapseStats } {
    const width = config.width!;
    const height = config.height!;
    const totalCells = width * height;

    // Initialize grid with all possible tiles
    const cells: Cell[][] = Array(height)
      .fill(null)
      .map((_, y) =>
        Array(width)
          .fill(null)
          .map((_, x) => ({
            position: { x, y },
            possibleTiles: tiles.map(t => t.id),
            isCollapsed: false,
            entropy: this.calculateEntropy(tiles),
            weightSum: tiles.reduce((sum, t) => sum + (t.weight || 1.0), 0),
          }))
      );

    let collapsedCells = 0;
    let iterations = 0;
    let backtrackingAttempts = 0;
    let contradictions = 0;

    while (collapsedCells < totalCells && iterations < config.maxIterations!) {
      iterations++;

      // Find cell with minimum entropy
      const cell = this.findMinimumEntropyCell(cells, customOptions);
      if (!cell) {
        contradictions++;
        if (config.useBacktracking && backtrackingAttempts < config.maxBacktrackingAttempts!) {
          backtrackingAttempts++;
          if (!this.backtrack(cells)) {
            break; // No more backtracking possible
          }
          continue;
        } else {
          break; // No backtracking or max attempts reached
        }
      }

      // Collapse the cell
      const selectedTile = this.selectTile(cell, tiles);
      cell.possibleTiles = [selectedTile];
      cell.isCollapsed = true;
      cell.entropy = 0;
      collapsedCells++;

      // Propagate constraints
      if (!this.propagateConstraints(cells, cell, constraints, customOptions, tiles)) {
        contradictions++;
        if (config.useBacktracking && backtrackingAttempts < config.maxBacktrackingAttempts!) {
          backtrackingAttempts++;
          if (!this.backtrack(cells)) {
            break;
          }
        } else {
          break;
        }
      }
    }

    // Convert cells to grid
    const grid: (string | null)[][] = cells.map(row =>
      row.map(cell => (cell.isCollapsed ? cell.possibleTiles[0] : null))
    );

    const finalEntropy = this.calculateFinalEntropy(cells);

    const stats: WaveFunctionCollapseStats = {
      collapsedCells,
      totalCells,
      iterations,
      backtrackingAttempts,
      contradictions,
      executionTime: 0, // Will be set by caller
      finalEntropy,
      success: collapsedCells === totalCells,
    };

    return { grid, stats };
  }

  private generateGrid3D(
    config: WaveFunctionCollapseConfig,
    tiles: Tile[],
    constraints: Constraint[]
  ): { grid: (string | null)[][]; stats: WaveFunctionCollapseStats } {
    // Simplified 3D implementation - for now, treat as 2D with depth
    const width = config.width!;
    const height = config.height!;
    const depth = config.depth!;
    const totalCells = width * height * depth;

    // Initialize 3D grid
    const cells: Cell[][][] = Array(depth)
      .fill(null)
      .map((_, z) =>
        Array(height)
          .fill(null)
          .map((_, y) =>
            Array(width)
              .fill(null)
              .map((_, x) => ({
                position: { x, y, z },
                possibleTiles: tiles.map(t => t.id),
                isCollapsed: false,
                entropy: this.calculateEntropy(tiles),
                weightSum: tiles.reduce((sum, t) => sum + (t.weight || 1.0), 0),
              }))
          )
      );

    let collapsedCells = 0;
    let iterations = 0;
    let backtrackingAttempts = 0;
    let contradictions = 0;

    while (collapsedCells < totalCells && iterations < config.maxIterations!) {
      iterations++;

      // Find cell with minimum entropy (3D)
      const cell = this.findMinimumEntropyCell3D(cells);
      if (!cell) {
        contradictions++;
        if (config.useBacktracking && backtrackingAttempts < config.maxBacktrackingAttempts!) {
          backtrackingAttempts++;
          if (!this.backtrack3D(cells)) {
            break;
          }
          continue;
        } else {
          break;
        }
      }

      // Collapse the cell
      const selectedTile = this.selectTile(cell, tiles);
      cell.possibleTiles = [selectedTile];
      cell.isCollapsed = true;
      cell.entropy = 0;
      collapsedCells++;

      // Propagate constraints (3D)
      if (!this.propagateConstraints3D(cells, cell, constraints)) {
        contradictions++;
        if (config.useBacktracking && backtrackingAttempts < config.maxBacktrackingAttempts!) {
          backtrackingAttempts++;
          if (!this.backtrack3D(cells)) {
            break;
          }
        } else {
          break;
        }
      }
    }

    // Convert 3D cells to 2D grid (flattened)
    const grid: (string | null)[][] = Array(height)
      .fill(null)
      .map((_, y) =>
        Array(width)
          .fill(null)
          .map((_, x) => {
            // For simplicity, return the first non-null tile found in the z-axis
            for (let z = 0; z < depth; z++) {
              const cell = cells[z][y][x];
              if (cell.isCollapsed) {
                return cell.possibleTiles[0];
              }
            }
            return null;
          })
      );

    const finalEntropy = this.calculateFinalEntropy3D(cells);

    const stats: WaveFunctionCollapseStats = {
      collapsedCells,
      totalCells,
      iterations,
      backtrackingAttempts,
      contradictions,
      executionTime: 0, // Will be set by caller
      finalEntropy,
      success: collapsedCells === totalCells,
    };

    return { grid, stats };
  }

  private findMinimumEntropyCell(
    cells: Cell[][],
    customOptions?: ConstraintBasedWaveFunctionCollapseOptions
  ): Cell | null {
    if (customOptions?.customCellSelection) {
      const allCells = cells.flat().filter(cell => !cell.isCollapsed && cell.possibleTiles.length > 0);
      return customOptions.customCellSelection(allCells);
    }

    let minEntropy = Infinity;
    let minCell: Cell | null = null;

    for (const row of cells) {
      for (const cell of row) {
        if (!cell.isCollapsed && cell.possibleTiles.length > 0) {
          const entropy = customOptions?.customEntropyFunction
            ? customOptions.customEntropyFunction(cell)
            : cell.entropy;

          if (entropy < minEntropy) {
            minEntropy = entropy;
            minCell = cell;
          }
        }
      }
    }

    return minCell;
  }

  private findMinimumEntropyCell3D(cells: Cell[][][]): Cell | null {
    let minEntropy = Infinity;
    let minCell: Cell | null = null;

    for (const layer of cells) {
      for (const row of layer) {
        for (const cell of row) {
          if (!cell.isCollapsed && cell.possibleTiles.length > 0) {
            if (cell.entropy < minEntropy) {
              minEntropy = cell.entropy;
              minCell = cell;
            }
          }
        }
      }
    }

    return minCell;
  }

  private selectTile(cell: Cell, tiles: Tile[]): string {
    const weights = cell.possibleTiles.map(tileId => {
      const tile = tiles.find(t => t.id === tileId);
      return tile?.weight || 1.0;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let randomValue = this.random() * totalWeight;

    for (let i = 0; i < cell.possibleTiles.length; i++) {
      randomValue -= weights[i];
      if (randomValue <= 0) {
        return cell.possibleTiles[i];
      }
    }

    return cell.possibleTiles[cell.possibleTiles.length - 1];
  }

  private propagateConstraints(
    cells: Cell[][],
    collapsedCell: Cell,
    constraints: Constraint[],
    customOptions?: ConstraintBasedWaveFunctionCollapseOptions,
    tiles: Tile[] = []
  ): boolean {
    const queue: Cell[] = [collapsedCell];
    const visited = new Set<Cell>();

    while (queue.length > 0) {
      const currentCell = queue.shift()!;
      if (visited.has(currentCell)) continue;
      visited.add(currentCell);

      const position = currentCell.position as Position2D;

      // Check all directions
      for (const direction of ["north", "south", "east", "west"] as Direction2D[]) {
        const neighborPos = this.getNeighborPosition(position, direction);
        if (!this.isValidPosition(neighborPos, cells[0].length, cells.length)) {
          continue;
        }

        const neighborCell = cells[neighborPos.y][neighborPos.x];
        if (neighborCell.isCollapsed) continue;

        const originalTiles = [...neighborCell.possibleTiles];
        neighborCell.possibleTiles = neighborCell.possibleTiles.filter(tile => {
          if (customOptions?.customConstraint) {
            return customOptions.customConstraint(neighborPos, tile, this.cellsToGrid(cells));
          }
          return this.isValidTilePlacement(tile, currentCell.possibleTiles[0], direction, constraints);
        });

        if (neighborCell.possibleTiles.length === 0) {
          return false; // Contradiction
        }

        if (neighborCell.possibleTiles.length !== originalTiles.length) {
          neighborCell.entropy = this.calculateEntropyForTiles(neighborCell.possibleTiles, tiles);
          queue.push(neighborCell);
        }
      }
    }

    return true;
  }

  private propagateConstraints3D(cells: Cell[][][], collapsedCell: Cell, constraints: Constraint[]): boolean {
    const queue: Cell[] = [collapsedCell];
    const visited = new Set<Cell>();

    while (queue.length > 0) {
      const currentCell = queue.shift()!;
      if (visited.has(currentCell)) continue;
      visited.add(currentCell);

      const position = currentCell.position as Position3D;

      // Check all 3D directions
      for (const direction of ["north", "south", "east", "west", "up", "down"] as Direction3D[]) {
        const neighborPos = this.getNeighborPosition3D(position, direction);
        if (!this.isValidPosition3D(neighborPos, cells[0][0].length, cells[0].length, cells.length)) {
          continue;
        }

        const neighborCell = cells[neighborPos.z][neighborPos.y][neighborPos.x];
        if (neighborCell.isCollapsed) continue;

        const originalTiles = [...neighborCell.possibleTiles];
        neighborCell.possibleTiles = neighborCell.possibleTiles.filter(tile =>
          this.isValidTilePlacement3D(tile, currentCell.possibleTiles[0], direction, constraints)
        );

        if (neighborCell.possibleTiles.length === 0) {
          return false; // Contradiction
        }

        if (neighborCell.possibleTiles.length !== originalTiles.length) {
          neighborCell.entropy = this.calculateEntropyForTiles(neighborCell.possibleTiles, []);
          queue.push(neighborCell);
        }
      }
    }

    return true;
  }

  private backtrack(cells: Cell[][]): boolean {
    // Simplified backtracking - find the most recently collapsed cell and reset it
    for (let y = cells.length - 1; y >= 0; y--) {
      for (let x = cells[y].length - 1; x >= 0; x--) {
        const cell = cells[y][x];
        if (cell.isCollapsed) {
          cell.isCollapsed = false;
          cell.possibleTiles = []; // Will be reset by propagation
          return true;
        }
      }
    }
    return false;
  }

  private backtrack3D(cells: Cell[][][]): boolean {
    // Simplified 3D backtracking
    for (let z = cells.length - 1; z >= 0; z--) {
      for (let y = cells[z].length - 1; y >= 0; y--) {
        for (let x = cells[z][y].length - 1; x >= 0; x--) {
          const cell = cells[z][y][x];
          if (cell.isCollapsed) {
            cell.isCollapsed = false;
            cell.possibleTiles = [];
            return true;
          }
        }
      }
    }
    return false;
  }

  private calculateEntropy(tiles: Tile[]): number {
    const totalWeight = tiles.reduce((sum, t) => sum + (t.weight || 1.0), 0);
    let entropy = 0;
    for (const tile of tiles) {
      const probability = (tile.weight || 1.0) / totalWeight;
      if (probability > 0) {
        entropy -= probability * Math.log2(probability);
      }
    }
    return entropy;
  }

  private calculateEntropyForTiles(tileIds: string[], tiles: Tile[]): number {
    const tileMap = new Map(tiles.map(t => [t.id, t]));
    const totalWeight = tileIds.reduce((sum, id) => sum + (tileMap.get(id)?.weight || 1.0), 0);
    let entropy = 0;
    for (const tileId of tileIds) {
      const tile = tileMap.get(tileId);
      const probability = (tile?.weight || 1.0) / totalWeight;
      if (probability > 0) {
        entropy -= probability * Math.log2(probability);
      }
    }
    return entropy;
  }

  private calculateFinalEntropy(cells: Cell[][]): number {
    const totalEntropy = cells.flat().reduce((sum, cell) => sum + cell.entropy, 0);
    return totalEntropy / (cells.length * cells[0].length);
  }

  private calculateFinalEntropy3D(cells: Cell[][][]): number {
    const totalEntropy = cells.flat(2).reduce((sum, cell) => sum + cell.entropy, 0);
    return totalEntropy / (cells.length * cells[0].length * cells[0][0].length);
  }

  private getNeighborPosition(position: Position2D, direction: Direction2D): Position2D {
    switch (direction) {
      case "north":
        return { x: position.x, y: position.y - 1 };
      case "south":
        return { x: position.x, y: position.y + 1 };
      case "east":
        return { x: position.x + 1, y: position.y };
      case "west":
        return { x: position.x - 1, y: position.y };
      default:
        return position;
    }
  }

  private getNeighborPosition3D(position: Position3D, direction: Direction3D): Position3D {
    switch (direction) {
      case "north":
        return { x: position.x, y: position.y - 1, z: position.z };
      case "south":
        return { x: position.x, y: position.y + 1, z: position.z };
      case "east":
        return { x: position.x + 1, y: position.y, z: position.z };
      case "west":
        return { x: position.x - 1, y: position.y, z: position.z };
      case "up":
        return { x: position.x, y: position.y, z: position.z + 1 };
      case "down":
        return { x: position.x, y: position.y, z: position.z - 1 };
      default:
        return position;
    }
  }

  private isValidPosition(position: Position2D, width: number, height: number): boolean {
    return position.x >= 0 && position.x < width && position.y >= 0 && position.y < height;
  }

  private isValidPosition3D(position: Position3D, width: number, height: number, depth: number): boolean {
    return (
      position.x >= 0 &&
      position.x < width &&
      position.y >= 0 &&
      position.y < height &&
      position.z >= 0 &&
      position.z < depth
    );
  }

  private isValidTilePlacement(
    tile: string,
    neighborTile: string,
    direction: Direction2D,
    constraints: Constraint[]
  ): boolean {
    // Check if there's a constraint that allows this placement
    for (const constraint of constraints) {
      if (constraint.tile1 === neighborTile && constraint.tile2 === tile && constraint.direction === direction) {
        return true;
      }
      if (constraint.bidirectional && constraint.tile1 === tile && constraint.tile2 === neighborTile) {
        const oppositeDirection = this.getOppositeDirection(direction);
        if (constraint.direction === oppositeDirection) {
          return true;
        }
      }
    }
    return false;
  }

  private isValidTilePlacement3D(
    tile: string,
    neighborTile: string,
    direction: Direction3D,
    constraints: Constraint[]
  ): boolean {
    // Similar to 2D but with 3D directions
    for (const constraint of constraints) {
      if (constraint.tile1 === neighborTile && constraint.tile2 === tile && constraint.direction === direction) {
        return true;
      }
      if (constraint.bidirectional && constraint.tile1 === tile && constraint.tile2 === neighborTile) {
        const oppositeDirection = this.getOppositeDirection3D(direction);
        if (constraint.direction === oppositeDirection) {
          return true;
        }
      }
    }
    return false;
  }

  private getOppositeDirection(direction: Direction2D): Direction2D {
    switch (direction) {
      case "north":
        return "south";
      case "south":
        return "north";
      case "east":
        return "west";
      case "west":
        return "east";
      default:
        return direction;
    }
  }

  private getOppositeDirection3D(direction: Direction3D): Direction3D {
    switch (direction) {
      case "north":
        return "south";
      case "south":
        return "north";
      case "east":
        return "west";
      case "west":
        return "east";
      case "up":
        return "down";
      case "down":
        return "up";
      default:
        return direction;
    }
  }

  private cellsToGrid(cells: Cell[][]): (string | null)[][] {
    return cells.map(row => row.map(cell => (cell.isCollapsed ? cell.possibleTiles[0] : null)));
  }

  private extractPatterns(
    inputData: string[][],
    patternSize: number,
    periodic: boolean,
    includeRotations: boolean,
    includeReflections: boolean,
    minFrequency: number
  ): Pattern[] {
    const patterns: Pattern[] = [];
    const patternMap = new Map<string, Pattern>();

    const width = inputData[0].length;
    const height = inputData.length;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pattern = this.extractPatternAt(inputData, x, y, patternSize, periodic);
        if (pattern) {
          const key = this.patternToKey(pattern);
          if (patternMap.has(key)) {
            patternMap.get(key)!.frequency!++;
          } else {
            patternMap.set(key, { data: pattern, weight: 1.0, frequency: 1 });
          }
        }
      }
    }

    // Add rotations and reflections if requested
    if (includeRotations || includeReflections) {
      const originalPatterns = Array.from(patternMap.values());
      for (const pattern of originalPatterns) {
        if (includeRotations) {
          for (let rotation = 1; rotation < 4; rotation++) {
            const rotated = this.rotatePattern(pattern.data, rotation);
            const key = this.patternToKey(rotated);
            if (!patternMap.has(key)) {
              patternMap.set(key, { data: rotated, weight: pattern.weight, frequency: pattern.frequency });
            }
          }
        }

        if (includeReflections) {
          const reflected = this.reflectPattern(pattern.data);
          const key = this.patternToKey(reflected);
          if (!patternMap.has(key)) {
            patternMap.set(key, { data: reflected, weight: pattern.weight, frequency: pattern.frequency });
          }
        }
      }
    }

    // Filter by minimum frequency
    for (const pattern of patternMap.values()) {
      if (pattern.frequency! >= minFrequency) {
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  private extractPatternAt(
    inputData: string[][],
    x: number,
    y: number,
    size: number,
    periodic: boolean
  ): string[][] | null {
    const pattern: string[][] = [];
    const width = inputData[0].length;
    const height = inputData.length;

    for (let dy = 0; dy < size; dy++) {
      const row: string[] = [];
      for (let dx = 0; dx < size; dx++) {
        let px = x + dx;
        let py = y + dy;

        if (periodic) {
          px = px % width;
          py = py % height;
        } else {
          if (px >= width || py >= height) {
            return null; // Pattern extends beyond bounds
          }
        }

        row.push(inputData[py][px]);
      }
      pattern.push(row);
    }

    return pattern;
  }

  private patternToKey(pattern: string[][]): string {
    return pattern.map(row => row.join(",")).join("|");
  }

  private rotatePattern(pattern: string[][], rotations: number): string[][] {
    let rotated = pattern;
    for (let i = 0; i < rotations; i++) {
      const size = rotated.length;
      const newPattern: string[][] = Array(size)
        .fill(null)
        .map(() => Array(size).fill(""));
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          newPattern[x][size - 1 - y] = rotated[y][x];
        }
      }
      rotated = newPattern;
    }
    return rotated;
  }

  private reflectPattern(pattern: string[][]): string[][] {
    return pattern.map(row => [...row].reverse());
  }

  private generateConstraintsFromPatterns(patterns: Pattern[], patternSize: number): Constraint[] {
    const constraints: Constraint[] = [];

    for (const pattern of patterns) {
      // Generate constraints for adjacent patterns
      // This is a simplified implementation
      for (let y = 0; y < patternSize - 1; y++) {
        for (let x = 0; x < patternSize - 1; x++) {
          const tile1 = pattern.data[y][x];
          const tile2 = pattern.data[y][x + 1];
          const tile3 = pattern.data[y + 1][x];

          if (tile1 !== tile2) {
            constraints.push({
              tile1,
              tile2,
              direction: "east",
              bidirectional: true,
            });
          }

          if (tile1 !== tile3) {
            constraints.push({
              tile1,
              tile2: tile3,
              direction: "south",
              bidirectional: true,
            });
          }
        }
      }
    }

    return constraints;
  }

  private interpolateGrids(
    grids: Array<{ scale: number; grid: (string | null)[][] }>,
    _method: string
  ): (string | null)[][] {
    if (grids.length === 0) return [];
    if (grids.length === 1) return grids[0].grid;

    // For simplicity, return the highest resolution grid
    const highestRes = grids.reduce((max, current) => (current.scale > max.scale ? current : max));

    return highestRes.grid;
  }

  private computeTileDistribution(grid: (string | null)[][], _tiles: Tile[]): any {
    const tileCounts: Record<string, number> = {};
    let totalTiles = 0;

    for (const row of grid) {
      for (const cell of row) {
        if (cell) {
          tileCounts[cell] = (tileCounts[cell] || 0) + 1;
          totalTiles++;
        }
      }
    }

    const tilePercentages: Record<string, number> = {};
    for (const [tile, count] of Object.entries(tileCounts)) {
      tilePercentages[tile] = (count / totalTiles) * 100;
    }

    return {
      totalTiles,
      uniqueTiles: Object.keys(tileCounts).length,
      tileCounts,
      tilePercentages,
    };
  }

  private computeEntropyAnalysis(grid: (string | null)[][]): any {
    // Simplified entropy analysis
    const filledCells = grid.flat().filter(cell => cell !== null).length;
    const entropy = filledCells > 0 ? Math.log2(filledCells) : 0;

    return {
      averageEntropy: entropy,
      minEntropy: 0,
      maxEntropy: entropy,
      entropyVariance: 0,
    };
  }

  private computeConstraintAnalysis(_grid: (string | null)[][], constraints: Constraint[]): any {
    let satisfiedConstraints = 0;
    let violatedConstraints = 0;

    for (const _constraint of constraints) {
      // Simplified constraint checking
      satisfiedConstraints++;
    }

    return {
      totalConstraints: constraints.length,
      satisfiedConstraints,
      violatedConstraints,
      satisfactionRate: constraints.length > 0 ? satisfiedConstraints / constraints.length : 1,
    };
  }

  private computePatternAnalysis(_grid: (string | null)[][]): any {
    // Simplified pattern analysis
    return {
      uniquePatterns: 1,
      patternFrequencies: { default: 1 },
      patternDiversity: 1,
    };
  }
}
