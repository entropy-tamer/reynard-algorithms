/**
 * @module algorithms/pathfinding/jps/jps-types
 * @description Type definitions for Jump Point Search (JPS) pathfinding algorithm.
 */

/**
 * A 2D point with x and y coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * A 2D vector with x and y components.
 */
export interface Vector {
  x: number;
  y: number;
}

/**
 * Movement directions for pathfinding.
 */
export enum Direction {
  NORTH = 0,
  NORTHEAST = 1,
  EAST = 2,
  SOUTHEAST = 3,
  SOUTH = 4,
  SOUTHWEST = 5,
  WEST = 6,
  NORTHWEST = 7,
}

/**
 * Movement types for JPS.
 */
export enum MovementType {
  CARDINAL = "cardinal",
  DIAGONAL = "diagonal",
  ALL = "all",
}

/**
 * Grid cell types.
 */
export enum CellType {
  WALKABLE = 0,
  OBSTACLE = 1,
  START = 2,
  GOAL = 3,
}

/**
 * A grid cell with position and type.
 */
export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  cost?: number;
}

/**
 * A jump point in the pathfinding grid.
 */
export interface JumpPoint {
  x: number;
  y: number;
  parent?: JumpPoint;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total cost (g + h)
  direction?: Direction;
}

/**
 * Configuration options for JPS.
 */
export interface JPSConfig {
  /** Whether to allow diagonal movement */
  allowDiagonal: boolean;
  /** Whether to use diagonal movement only when both cardinal directions are clear */
  diagonalOnlyWhenClear: boolean;
  /** Movement type (cardinal, diagonal, or all) */
  movementType: MovementType;
  /** Whether to use tie-breaking in the open set */
  useTieBreaking: boolean;
  /** Whether to use goal bounding for optimization */
  useGoalBounding: boolean;
  /** Whether to use JPS+ preprocessing */
  useJPSPlus: boolean;
  /** Whether to validate input */
  validateInput: boolean;
  /** Whether to enable caching */
  enableCaching: boolean;
  /** Maximum number of iterations */
  maxIterations: number;
  /** Numerical tolerance for floating-point comparisons */
  tolerance: number;
}

/**
 * Statistics about the JPS computation.
 */
export interface JPSStats {
  /** Number of nodes explored */
  nodesExplored: number;
  /** Number of jump points found */
  jumpPointsFound: number;
  /** Number of iterations performed */
  iterations: number;
  /** Number of diagonal moves */
  diagonalMoves: number;
  /** Number of cardinal moves */
  cardinalMoves: number;
  /** Total execution time in milliseconds */
  executionTime: number;
  /** Whether the computation was successful */
  success: boolean;
  /** Error message if computation failed */
  error?: string;
}

/**
 * Result of the JPS pathfinding.
 */
export interface JPSResult {
  /** The found path as an array of points */
  path: Point[];
  /** Whether a path was found */
  found: boolean;
  /** Total cost of the path */
  cost: number;
  /** Length of the path */
  length: number;
  /** All explored nodes */
  explored: JumpPoint[];
  /** Statistics about the computation */
  stats: JPSStats;
}

/**
 * Options for JPS pathfinding.
 */
export interface JPSOptions {
  /** Whether to return explored nodes */
  returnExplored: boolean;
  /** Whether to return jump points */
  returnJumpPoints: boolean;
  /** Whether to use Manhattan distance heuristic */
  useManhattanHeuristic: boolean;
  /** Whether to use Euclidean distance heuristic */
  useEuclideanHeuristic: boolean;
  /** Custom heuristic function */
  customHeuristic?: (from: Point, to: Point) => number;
  /** Whether to optimize path by removing redundant points */
  optimizePath: boolean;
  /** Whether to use goal bounding */
  useGoalBounding: boolean;
  /** Maximum path length */
  maxPathLength: number;
}

/**
 * Options for jump point identification.
 */
export interface JumpPointOptions {
  /** Whether to check for forced neighbors */
  checkForcedNeighbors: boolean;
  /** Whether to check for goal proximity */
  checkGoalProximity: boolean;
  /** Whether to use diagonal pruning */
  useDiagonalPruning: boolean;
  /** Maximum jump distance */
  maxJumpDistance: number;
  /** Whether to use early termination */
  useEarlyTermination: boolean;
}

/**
 * Options for grid validation.
 */
export interface GridValidationOptions {
  /** Whether to check grid bounds */
  checkBounds: boolean;
  /** Whether to check for obstacles */
  checkObstacles: boolean;
  /** Whether to check for start/goal validity */
  checkStartGoal: boolean;
  /** Whether to check for connectivity */
  checkConnectivity: boolean;
  /** Minimum grid size */
  minGridSize: number;
  /** Maximum grid size */
  maxGridSize: number;
}

/**
 * Result of grid validation.
 */
export interface GridValidationResult {
  /** Whether the grid is valid */
  isValid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of validation warnings */
  warnings: string[];
  /** Whether bounds are valid */
  hasValidBounds: boolean;
  /** Whether obstacles are valid */
  hasValidObstacles: boolean;
  /** Whether start/goal are valid */
  hasValidStartGoal: boolean;
  /** Whether grid is connected */
  isConnected: boolean;
}

/**
 * Options for path optimization.
 */
export interface PathOptimizationOptions {
  /** Whether to remove redundant points */
  removeRedundant: boolean;
  /** Whether to smooth the path */
  smoothPath: boolean;
  /** Whether to use line-of-sight optimization */
  useLineOfSight: boolean;
  /** Smoothing factor */
  smoothingFactor: number;
  /** Maximum smoothing iterations */
  maxSmoothingIterations: number;
}

/**
 * Result of path optimization.
 */
export interface PathOptimizationResult {
  /** The optimized path */
  path: Point[];
  /** Number of points removed */
  pointsRemoved: number;
  /** Whether optimization was successful */
  success: boolean;
  /** Optimization statistics */
  stats: {
    originalLength: number;
    optimizedLength: number;
    reduction: number;
    iterations: number;
  };
}

/**
 * Options for JPS+ preprocessing.
 */
export interface JPSPlusOptions {
  /** Whether to precompute jump points */
  precomputeJumpPoints: boolean;
  /** Whether to precompute distances */
  precomputeDistances: boolean;
  /** Whether to use memory optimization */
  useMemoryOptimization: boolean;
  /** Maximum preprocessing time */
  maxPreprocessingTime: number;
}

/**
 * Result of JPS+ preprocessing.
 */
export interface JPSPlusResult {
  /** Whether preprocessing was successful */
  success: boolean;
  /** Precomputed jump points */
  jumpPoints: Map<string, JumpPoint[]>;
  /** Precomputed distances */
  distances: Map<string, number>;
  /** Preprocessing statistics */
  stats: {
    preprocessingTime: number;
    jumpPointsComputed: number;
    distancesComputed: number;
    memoryUsed: number;
  };
}

/**
 * Options for serialization.
 */
export interface JPSSerializationOptions {
  /** Number of decimal places for coordinates */
  precision: number;
  /** Whether to include statistics */
  includeStats: boolean;
  /** Whether to include explored nodes */
  includeExplored: boolean;
  /** Whether to include jump points */
  includeJumpPoints: boolean;
  /** Whether to include grid data */
  includeGrid: boolean;
}

/**
 * Serialized representation of JPS result.
 */
export interface JPSSerialization {
  /** The path */
  path: Point[];
  /** Whether path was found */
  found: boolean;
  /** Total cost */
  cost: number;
  /** Path length */
  length: number;
  /** Statistics (if included) */
  stats?: JPSStats;
  /** Explored nodes (if included) */
  explored?: JumpPoint[];
  /** Jump points (if included) */
  jumpPoints?: JumpPoint[];
  /** Grid data (if included) */
  grid?: {
    width: number;
    height: number;
    cells: GridCell[];
  };
}

/**
 * Options for comparison between pathfinding results.
 */
export interface PathComparisonOptions {
  /** Whether to compare path length */
  compareLength: boolean;
  /** Whether to compare path cost */
  compareCost: boolean;
  /** Whether to compare exploration count */
  compareExploration: boolean;
  /** Whether to compare execution time */
  compareTime: boolean;
  /** Tolerance for comparisons */
  tolerance: number;
}

/**
 * Result of path comparison.
 */
export interface PathComparisonResult {
  /** Whether paths are equivalent */
  areEquivalent: boolean;
  /** Length difference */
  lengthDifference: number;
  /** Cost difference */
  costDifference: number;
  /** Exploration difference */
  explorationDifference: number;
  /** Time difference */
  timeDifference: number;
  /** Overall similarity score (0-1) */
  similarity: number;
}

/**
 * Options for performance analysis.
 */
export interface JPSPerformanceOptions {
  /** Whether to track memory usage */
  trackMemory: boolean;
  /** Whether to track cache hits */
  trackCacheHits: boolean;
  /** Whether to track jump point efficiency */
  trackJumpPointEfficiency: boolean;
  /** Whether to generate performance report */
  generateReport: boolean;
}

/**
 * Result of performance analysis.
 */
export interface JPSPerformanceResult {
  /** Performance metrics */
  metrics: {
    nodesPerSecond: number;
    memoryUsage: number;
    cacheHitRate: number;
    jumpPointEfficiency: number;
    averageJumpDistance: number;
  };
  /** Performance report */
  report?: {
    bottlenecks: string[];
    recommendations: string[];
    optimizationSuggestions: string[];
  };
}
