/**
 * @module algorithms/pathfinding/theta-star/theta-star-types
 * @description Type definitions for Theta* any-angle pathfinding algorithm.
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
 * Movement types for Theta*.
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
 * A Theta* node in the pathfinding grid.
 */
export interface ThetaStarNode {
  x: number;
  y: number;
  parent?: ThetaStarNode;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total cost (g + h)
  direction?: Direction;
  isLineOfSight?: boolean;
}

/**
 * Configuration options for Theta*.
 */
export interface ThetaStarConfig {
  /** Whether to allow diagonal movement */
  allowDiagonal: boolean;
  /** Whether to use diagonal movement only when both cardinal directions are clear */
  diagonalOnlyWhenClear: boolean;
  /** Movement type (cardinal, diagonal, or all) */
  movementType: MovementType;
  /** Whether to use tie-breaking in the open set */
  useTieBreaking: boolean;
  /** Whether to use lazy evaluation for line-of-sight checks */
  useLazyEvaluation: boolean;
  /** Whether to use goal bounding for optimization */
  useGoalBounding: boolean;
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
 * Statistics about the Theta* computation.
 */
export interface ThetaStarStats {
  /** Number of nodes explored */
  nodesExplored: number;
  /** Number of line-of-sight checks performed */
  lineOfSightChecks: number;
  /** Number of parent updates performed */
  parentUpdates: number;
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
 * Result of the Theta* pathfinding.
 */
export interface ThetaStarResult {
  /** The found path as an array of points */
  path: Point[];
  /** Whether a path was found */
  found: boolean;
  /** Total cost of the path */
  cost: number;
  /** Length of the path */
  length: number;
  /** All explored nodes */
  explored: ThetaStarNode[];
  /** Statistics about the computation */
  stats: ThetaStarStats;
}

/**
 * Options for Theta* pathfinding.
 */
export interface ThetaStarOptions {
  /** Whether to return explored nodes */
  returnExplored: boolean;
  /** Whether to return line-of-sight information */
  returnLineOfSight: boolean;
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
 * Options for line-of-sight checking.
 */
export interface LineOfSightOptions {
  /** Whether to use Bresenham's line algorithm */
  useBresenham: boolean;
  /** Whether to use DDA (Digital Differential Analyzer) */
  useDDA: boolean;
  /** Whether to use ray casting */
  useRayCasting: boolean;
  /** Whether to check for obstacles at endpoints */
  checkEndpoints: boolean;
  /** Whether to use early termination */
  useEarlyTermination: boolean;
  /** Maximum line-of-sight distance */
  maxDistance: number;
}

/**
 * Result of line-of-sight checking.
 */
export interface LineOfSightResult {
  /** Whether line of sight exists */
  hasLineOfSight: boolean;
  /** Distance to first obstacle (if any) */
  distanceToObstacle: number;
  /** Point where line of sight is blocked (if any) */
  blockedAt?: Point;
  /** Whether the check was successful */
  success: boolean;
  /** Error message if check failed */
  error?: string;
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
 * Options for serialization.
 */
export interface ThetaStarSerializationOptions {
  /** Number of decimal places for coordinates */
  precision: number;
  /** Whether to include statistics */
  includeStats: boolean;
  /** Whether to include explored nodes */
  includeExplored: boolean;
  /** Whether to include line-of-sight information */
  includeLineOfSight: boolean;
  /** Whether to include grid data */
  includeGrid: boolean;
}

/**
 * Serialized representation of Theta* result.
 */
export interface ThetaStarSerialization {
  /** The path */
  path: Point[];
  /** Whether path was found */
  found: boolean;
  /** Total cost */
  cost: number;
  /** Path length */
  length: number;
  /** Statistics (if included) */
  stats?: ThetaStarStats;
  /** Explored nodes (if included) */
  explored?: ThetaStarNode[];
  /** Line-of-sight information (if included) */
  lineOfSight?: LineOfSightResult[];
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
  /** Whether to compare line-of-sight efficiency */
  compareLineOfSight: boolean;
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
  /** Line-of-sight efficiency difference */
  lineOfSightDifference: number;
  /** Overall similarity score (0-1) */
  similarity: number;
}

/**
 * Options for performance analysis.
 */
export interface ThetaStarPerformanceOptions {
  /** Whether to track memory usage */
  trackMemory: boolean;
  /** Whether to track cache hits */
  trackCacheHits: boolean;
  /** Whether to track line-of-sight efficiency */
  trackLineOfSightEfficiency: boolean;
  /** Whether to generate performance report */
  generateReport: boolean;
}

/**
 * Result of performance analysis.
 */
export interface ThetaStarPerformanceResult {
  /** Performance metrics */
  metrics: {
    nodesPerSecond: number;
    memoryUsage: number;
    cacheHitRate: number;
    lineOfSightEfficiency: number;
    averageLineOfSightDistance: number;
  };
  /** Performance report */
  report?: {
    bottlenecks: string[];
    recommendations: string[];
    optimizationSuggestions: string[];
  };
}

/**
 * Options for lazy evaluation.
 */
export interface LazyEvaluationOptions {
  /** Whether to use lazy evaluation */
  useLazyEvaluation: boolean;
  /** Whether to cache line-of-sight results */
  cacheLineOfSight: boolean;
  /** Whether to use early termination */
  useEarlyTermination: boolean;
  /** Maximum number of lazy evaluations */
  maxLazyEvaluations: number;
}

/**
 * Result of lazy evaluation.
 */
export interface LazyEvaluationResult {
  /** Whether lazy evaluation was successful */
  success: boolean;
  /** Number of lazy evaluations performed */
  evaluationsPerformed: number;
  /** Number of cache hits */
  cacheHits: number;
  /** Total time spent on lazy evaluation */
  evaluationTime: number;
}

