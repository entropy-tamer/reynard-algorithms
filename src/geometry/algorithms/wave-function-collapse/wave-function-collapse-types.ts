/* eslint-disable max-lines, @typescript-eslint/no-explicit-any */
/**
 * @file Wave Function Collapse type definitions
 */
/**
 * @module algorithms/geometry/algorithms/wave-function-collapse/types
 * @description Defines the types and interfaces for the Wave Function Collapse algorithm.
 */

/**
 * Represents a 2D position with x and y coordinates.
 */
export interface Position2D {
  x: number;
  y: number;
}

/**
 * Represents a 3D position with x, y, and z coordinates.
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Represents a tile or pattern in the Wave Function Collapse system.
 */
export interface Tile {
  /**
   * Unique identifier for the tile.
   */
  id: string;
  /**
   * Weight/probability of this tile being selected.
   * @default 1.0
   */
  weight?: number;
  /**
   * Custom data associated with this tile.
   */
  data?: any;
  /**
   * Symmetry information for the tile.
   */
  symmetry?: TileSymmetry;
  /**
   * Optional 2D sprite atlas metadata for rendering and socket-based constraints.
   */
  atlasKey?: string;
  uvRect?: { x: number; y: number; w: number; h: number };
  sockets2D?: { north?: string; south?: string; east?: string; west?: string };
  /**
   * Optional 3D tile data for socket-based constraints and 3D rendering.
   */
  sockets3D?: {
    px?: Socket3D; nx?: Socket3D; py?: Socket3D; ny?: Socket3D; pz?: Socket3D; nz?: Socket3D;
  };
  rotations3D?: Array<{ yaw: number; pitch: number; roll: number }>;
  gltfUrl?: string;
  meshKey?: string;
  transform?: number[]; // 4x4 matrix as 16-length array (row-major)
}

/**
 * Represents the symmetry properties of a tile.
 */
export interface TileSymmetry {
  /**
   * The symmetry type of the tile.
   */
  type: "X" | "T" | "I" | "L" | "\\" | "F" | "N";
  /**
   * The number of rotations this tile supports.
   * @default 1
   */
  rotations?: number;
}

/** Socket definition for 3D faces */
export interface Socket3D {
  id: string | number;
  symmetry: "flip" | "noflip" | "symmetric" | "rotInv";
  rotationIndex?: 0 | 1 | 2 | 3;
}

/** Rendering/generation modes (hints for frontends) */
export type GenerationMode = "2d-color" | "2d-sprite" | "3d-voxel" | "3d-mesh" | "3d-gltf";

/**
 * Represents a constraint between two tiles.
 */
export interface Constraint {
  /**
   * The first tile in the constraint.
   */
  tile1: string;
  /**
   * The second tile in the constraint.
   */
  tile2: string;
  /**
   * The direction of the constraint (relative to tile1).
   */
  direction: Direction2D | Direction3D;
  /**
   * Whether this constraint is bidirectional.
   * @default true
   */
  bidirectional?: boolean;
}

/**
 * 2D direction enumeration.
 */
export type Direction2D = "north" | "south" | "east" | "west";

/**
 * 3D direction enumeration.
 */
export type Direction3D = "north" | "south" | "east" | "west" | "up" | "down";

/**
 * Configuration options for Wave Function Collapse.
 */
export interface WaveFunctionCollapseConfig {
  /**
   * The width of the output grid.
   * @default 10
   */
  width?: number;
  /**
   * The height of the output grid.
   * @default 10
   */
  height?: number;
  /**
   * The depth of the output grid (for 3D).
   * @default 1
   */
  depth?: number;
  /**
   * The size of the pattern to use for overlapping model.
   * @default 2
   */
  patternSize?: number;
  /**
   * Whether to use the overlapping model (true) or tiled model (false).
   * @default true
   */
  useOverlappingModel?: boolean;
  /**
   * Whether to use periodic boundary conditions.
   * @default false
   */
  periodic?: boolean;
  /**
   * The maximum number of iterations before giving up.
   * @default 10000
   */
  maxIterations?: number;
  /**
   * The seed for random number generation.
   * @default 0
   */
  seed?: number;
  /**
   * Whether to use backtracking when contradictions occur.
   * @default true
   */
  useBacktracking?: boolean;
  /**
   * The maximum number of backtracking attempts.
   * @default 1000
   */
  maxBacktrackingAttempts?: number;
  /**
   * Whether to use the minimum entropy heuristic for cell selection.
   * @default true
   */
  useMinimumEntropy?: boolean;
  /**
   * Whether to use the minimum remaining values heuristic.
   * @default true
   */
  useMinimumRemainingValues?: boolean;
  /**
   * The maximum number of tiles that can be placed in a single cell.
   * @default 1000
   */
  maxTilesPerCell?: number;
}

/**
 * Statistics about the Wave Function Collapse process.
 */
export interface WaveFunctionCollapseStats {
  /**
   * The number of cells that have been collapsed.
   */
  collapsedCells: number;
  /**
   * The total number of cells in the grid.
   */
  totalCells: number;
  /**
   * The number of iterations performed.
   */
  iterations: number;
  /**
   * The number of backtracking attempts made.
   */
  backtrackingAttempts: number;
  /**
   * The number of contradictions encountered.
   */
  contradictions: number;
  /**
   * The time taken for the generation process in milliseconds.
   */
  executionTime: number;
  /**
   * The final entropy of the system.
   */
  finalEntropy: number;
  /**
   * Whether the generation completed successfully.
   */
  success: boolean;
  /**
   * Error message if generation failed.
   */
  error?: string;
}

/**
 * The result of a Wave Function Collapse operation.
 */
export interface WaveFunctionCollapseResult {
  /**
   * The generated grid with tile IDs.
   */
  grid: (string | null)[][];
  /**
   * Statistics about the generation process.
   */
  stats: WaveFunctionCollapseStats;
  /**
   * Whether the generation completed successfully.
   */
  success: boolean;
  /**
   * A message providing more details about the result.
   */
  message: string;
}

/**
 * Options for 2D Wave Function Collapse.
 */
export interface WaveFunctionCollapse2DOptions extends Omit<WaveFunctionCollapseConfig, "depth"> {
  /**
   * The width of the 2D grid.
   */
  width: number;
  /**
   * The height of the 2D grid.
   */
  height: number;
}

/**
 * Options for 3D Wave Function Collapse.
 */
export interface WaveFunctionCollapse3DOptions extends WaveFunctionCollapseConfig {
  /**
   * The width of the 3D grid.
   */
  width: number;
  /**
   * The height of the 3D grid.
   */
  height: number;
  /**
   * The depth of the 3D grid.
   */
  depth: number;
}

/**
 * Represents a cell in the Wave Function Collapse grid.
 */
export interface Cell {
  /**
   * The position of the cell.
   */
  position: Position2D | Position3D;
  /**
   * The possible tiles that can be placed in this cell.
   */
  possibleTiles: string[];
  /**
   * Whether this cell has been collapsed (has only one possible tile).
   */
  isCollapsed: boolean;
  /**
   * The entropy of this cell.
   */
  entropy: number;
  /**
   * The weight sum of all possible tiles in this cell.
   */
  weightSum: number;
}

/**
 * Represents a pattern in the overlapping model.
 */
export interface Pattern {
  /**
   * The pattern data (2D array of tile IDs).
   */
  data: string[][];
  /**
   * The width of the pattern.
   */
  width: number;
  /**
   * The height of the pattern.
   */
  height: number;
  /**
   * The depth of the pattern (for 3D).
   */
  depth?: number;
  /**
   * The weight of this pattern.
   * @default 1.0
   */
  weight?: number;
  /**
   * The frequency of this pattern in the input.
   */
  frequency?: number;
}

/**
 * Options for analyzing the generated result.
 */
export interface WaveFunctionCollapseAnalysisOptions {
  /**
   * Whether to compute tile distribution statistics.
   * @default true
   */
  computeTileDistribution?: boolean;
  /**
   * Whether to compute entropy analysis.
   * @default true
   */
  computeEntropyAnalysis?: boolean;
  /**
   * Whether to compute constraint satisfaction analysis.
   * @default true
   */
  computeConstraintAnalysis?: boolean;
  /**
   * Whether to compute pattern analysis.
   * @default false
   */
  computePatternAnalysis?: boolean;
  /**
   * Additional analysis options.
   */
  analyzePatterns?: boolean;
  patternSize?: number;
}

/**
 * Analysis results for Wave Function Collapse.
 */
export interface WaveFunctionCollapseAnalysis {
  /**
   * Tile distribution statistics.
   */
  tileDistribution: {
    totalTiles: number;
    uniqueTiles: number;
    tileCounts: Record<string, number>;
    tilePercentages: Record<string, number>;
  };
  /**
   * Entropy analysis.
   */
  entropyAnalysis: {
    averageEntropy: number;
    minEntropy: number;
    maxEntropy: number;
    entropyVariance: number;
  };
  /**
   * Constraint satisfaction analysis.
   */
  constraintAnalysis: {
    totalConstraints: number;
    satisfiedConstraints: number;
    violatedConstraints: number;
    satisfactionRate: number;
  };
  /**
   * Pattern analysis (if computed).
   */
  patternAnalysis?: {
    uniquePatterns: number;
    patternFrequencies: Record<string, number>;
    patternDiversity: number;
  };
  /**
   * The time taken for the analysis in milliseconds.
   */
  executionTime: number;
  /**
   * Additional analysis properties.
   */
  uniqueTiles?: string[];
  tileFrequencies?: Record<string, number>;
  entropy?: number;
  patternCount?: number;
  width?: number;
}

/**
 * Options for training the Wave Function Collapse model from input data.
 */
export interface WaveFunctionCollapseTrainingOptions {
  /**
   * The input data to learn from (2D array of tile IDs).
   */
  inputData: string[][];
  /**
   * The size of patterns to extract.
   * @default 2
   */
  patternSize?: number;
  /**
   * Whether to use periodic boundary conditions for training.
   * @default false
   */
  periodic?: boolean;
  /**
   * Whether to include rotated patterns.
   * @default true
   */
  includeRotations?: boolean;
  /**
   * Whether to include reflected patterns.
   * @default true
   */
  includeReflections?: boolean;
  /**
   * The minimum frequency threshold for patterns.
   * @default 1
   */
  minFrequency?: number;
}

/**
 * Result of training the Wave Function Collapse model.
 */
export interface WaveFunctionCollapseTrainingResult {
  /**
   * The extracted tiles.
   */
  tiles: Tile[];
  /**
   * The extracted patterns (for overlapping model).
   */
  patterns: Pattern[];
  /**
   * The learned constraints.
   */
  constraints: Constraint[];
  /**
   * Statistics about the training process.
   */
  stats: {
    inputSize: { width: number; height: number };
    extractedTiles: number;
    extractedPatterns: number;
    learnedConstraints: number;
    executionTime: number;
  };
  /**
   * Whether the training completed successfully.
   */
  success: boolean;
  /**
   * A message providing more details about the result.
   */
  message: string;
}

/**
 * Options for constraint-based Wave Function Collapse.
 */
export interface ConstraintBasedWaveFunctionCollapseOptions extends WaveFunctionCollapseConfig {
  /**
   * Custom constraint function that determines if a tile can be placed at a position.
   */
  customConstraint?: (position: Position2D | Position3D, tile: string, grid: (string | null)[][]) => boolean;
  /**
   * Custom entropy calculation function.
   */
  customEntropyFunction?: (cell: Cell) => number;
  /**
   * Custom cell selection heuristic.
   */
  customCellSelection?: (cells: Cell[]) => Cell | null;
}

/**
 * Result of constraint-based Wave Function Collapse.
 */
export interface ConstraintBasedWaveFunctionCollapseResult {
  /**
   * The generated grid with tile IDs.
   */
  grid: (string | null)[][];
  /**
   * Statistics about the generation process.
   */
  stats: WaveFunctionCollapseStats;
  /**
   * Whether the generation completed successfully.
   */
  success: boolean;
  /**
   * A message providing more details about the result.
   */
  message: string;
}

/**
 * Options for multi-scale Wave Function Collapse.
 */
export interface MultiScaleWaveFunctionCollapseOptions {
  /**
   * The scales to use for generation.
   */
  scales: Array<{
    scale: number;
    width: number;
    height: number;
    tiles: Tile[];
    constraints: Constraint[];
  }>;
  /**
   * The base configuration for each scale.
   */
  baseConfig: WaveFunctionCollapseConfig;
  /**
   * Whether to use hierarchical generation.
   * @default true
   */
  hierarchical?: boolean;
  /**
   * The interpolation method between scales.
   * @default "nearest"
   */
  interpolation?: "nearest" | "linear" | "cubic";
}

/**
 * Result of multi-scale Wave Function Collapse.
 */
export interface MultiScaleWaveFunctionCollapseResult {
  /**
   * The generated grids for each scale.
   */
  grids: Array<{
    scale: number;
    grid: (string | null)[][];
  }>;
  /**
   * The final interpolated grid.
   */
  finalGrid: (string | null)[][];
  /**
   * Statistics about the generation process.
   */
  stats: {
    totalIterations: number;
    totalBacktrackingAttempts: number;
    totalContradictions: number;
    executionTime: number;
    scaleStats: Array<{
      scale: number;
      iterations: number;
      backtrackingAttempts: number;
      contradictions: number;
    }>;
  };
  /**
   * Whether the generation completed successfully.
   */
  success: boolean;
  /**
   * A message providing more details about the result.
   */
  message: string;
}
