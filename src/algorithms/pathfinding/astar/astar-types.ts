/**
 * A* Pathfinding Algorithm Types
 *
 * Comprehensive type definitions for the A* (A-star) pathfinding algorithm.
 * A* is an informed search algorithm that finds the shortest path between
 * two points using heuristics to guide the search.
 *
 * @module algorithms/pathfinding/astar
 */

/**
 * Represents a point in 2D space for pathfinding
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents a node in the A* search graph
 */
export interface AStarNode {
  /** Unique identifier for the node */
  id: string;
  /** Position of the node */
  position: Point;
  /** Cost from start to this node (g-score) */
  gScore: number;
  /** Estimated cost from this node to goal (h-score) */
  hScore: number;
  /** Total estimated cost (f-score = g + h) */
  fScore: number;
  /** Parent node in the path */
  parent: AStarNode | null;
  /** Whether this node is walkable */
  walkable: boolean;
  /** Additional data associated with the node */
  data?: any;
}

/**
 * Represents an edge between two nodes
 */
export interface AStarEdge {
  /** Source node ID */
  from: string;
  /** Target node ID */
  to: string;
  /** Cost to traverse this edge */
  cost: number;
  /** Whether this edge is traversable */
  traversable: boolean;
}

/**
 * Configuration options for A* algorithm
 */
export interface AStarConfig {
  /** Whether to allow diagonal movement */
  allowDiagonal: boolean;
  /** Cost multiplier for diagonal movement */
  diagonalCost: number;
  /** Cost multiplier for regular movement */
  regularCost: number;
  /** Maximum number of nodes to explore */
  maxIterations: number;
  /** Whether to use tie-breaking for equal f-scores */
  useTieBreaking: boolean;
  /** Tie-breaking factor (0-1) */
  tieBreakingFactor: number;
  /** Whether to use dynamic weighting */
  useDynamicWeighting: boolean;
  /** Dynamic weighting factor */
  dynamicWeightingFactor: number;
  /** Whether to enable path smoothing */
  enablePathSmoothing: boolean;
  /** Smoothing tolerance */
  smoothingTolerance: number;
}

/**
 * Heuristic function type for A* algorithm
 */
export type AStarHeuristic = (from: Point, to: Point) => number;

/**
 * Result of A* pathfinding operation
 */
export interface AStarResult {
  /** Whether a path was found */
  success: boolean;
  /** The found path (empty if no path found) */
  path: Point[];
  /** Total cost of the path */
  totalCost: number;
  /** Number of nodes explored */
  nodesExplored: number;
  /** Number of iterations performed */
  iterations: number;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Detailed path with node information */
  detailedPath: AStarNode[];
  /** All nodes that were explored during search */
  exploredNodes: AStarNode[];
  /** Error message if pathfinding failed */
  error?: string;
}

/**
 * Grid-based map for A* pathfinding
 */
export interface AStarGrid {
  /** Width of the grid */
  width: number;
  /** Height of the grid */
  height: number;
  /** Grid cells (true = walkable, false = obstacle) */
  cells: boolean[][];
  /** Cell size in world units */
  cellSize: number;
}

/**
 * Graph-based map for A* pathfinding
 */
export interface AStarGraph {
  /** All nodes in the graph */
  nodes: Map<string, AStarNode>;
  /** All edges in the graph */
  edges: Map<string, AStarEdge[]>;
  /** Spatial index for fast node lookup */
  spatialIndex: Map<string, AStarNode[]>;
}

/**
 * Statistics for A* algorithm performance
 */
export interface AStarStats {
  /** Total number of pathfinding operations */
  totalOperations: number;
  /** Total execution time */
  totalExecutionTime: number;
  /** Average execution time per operation */
  averageExecutionTime: number;
  /** Total nodes explored */
  totalNodesExplored: number;
  /** Average nodes explored per operation */
  averageNodesExplored: number;
  /** Success rate (0-1) */
  successRate: number;
  /** Cache hit rate (0-1) */
  cacheHitRate: number;
  /** Memory usage in bytes */
  memoryUsage: number;
}

/**
 * Event types for A* algorithm
 */
export enum AStarEventType {
  PATHFINDING_STARTED = "pathfinding_started",
  PATHFINDING_COMPLETED = "pathfinding_completed",
  NODE_EXPLORED = "node_explored",
  PATH_FOUND = "path_found",
  PATH_NOT_FOUND = "path_not_found",
  CACHE_HIT = "cache_hit",
  CACHE_MISS = "cache_miss",
}

/**
 * Event data for A* algorithm events
 */
export interface AStarEvent {
  /** Event type */
  type: AStarEventType;
  /** Timestamp of the event */
  timestamp: number;
  /** Additional event data */
  data?: any;
}

/**
 * Event handler function type
 */
export type AStarEventHandler = (event: AStarEvent) => void;

/**
 * Options for A* algorithm initialization
 */
export interface AStarOptions {
  /** Configuration settings */
  config: Partial<AStarConfig>;
  /** Custom heuristic function */
  heuristic?: AStarHeuristic;
  /** Event handlers */
  eventHandlers?: AStarEventHandler[];
  /** Whether to enable caching */
  enableCaching: boolean;
  /** Cache size limit */
  cacheSize: number;
  /** Whether to enable statistics collection */
  enableStats: boolean;
  /** Whether to enable debugging */
  enableDebug: boolean;
}

/**
 * Cache entry for pathfinding results
 */
export interface AStarCacheEntry {
  /** Start point */
  start: Point;
  /** Goal point */
  goal: Point;
  /** Cached path */
  path: Point[];
  /** Cached total cost */
  totalCost: number;
  /** Timestamp when cached */
  timestamp: number;
  /** Number of times accessed */
  accessCount: number;
}

/**
 * Performance metrics for A* algorithm
 */
export interface AStarPerformanceMetrics {
  /** Current memory usage */
  memoryUsage: number;
  /** Cache size */
  cacheSize: number;
  /** Cache hit rate */
  cacheHitRate: number;
  /** Average path length */
  averagePathLength: number;
  /** Average exploration ratio */
  averageExplorationRatio: number;
  /** Performance score (0-100) */
  performanceScore: number;
}

/**
 * Path smoothing options
 */
export interface PathSmoothingOptions {
  /** Whether to enable smoothing */
  enabled: boolean;
  /** Smoothing tolerance */
  tolerance: number;
  /** Maximum smoothing iterations */
  maxIterations: number;
  /** Whether to preserve waypoints */
  preserveWaypoints: boolean;
}

/**
 * Dynamic weighting options
 */
export interface DynamicWeightingOptions {
  /** Whether to enable dynamic weighting */
  enabled: boolean;
  /** Weight adjustment factor */
  adjustmentFactor: number;
  /** Minimum weight */
  minWeight: number;
  /** Maximum weight */
  maxWeight: number;
  /** Learning rate */
  learningRate: number;
}

/**
 * Default configuration for A* algorithm
 */
export const DEFAULT_ASTAR_CONFIG: AStarConfig = {
  allowDiagonal: true,
  diagonalCost: Math.sqrt(2),
  regularCost: 1,
  maxIterations: 10000,
  useTieBreaking: true,
  tieBreakingFactor: 0.001,
  useDynamicWeighting: false,
  dynamicWeightingFactor: 1.0,
  enablePathSmoothing: true,
  smoothingTolerance: 0.1,
};

/**
 * Default options for A* algorithm
 */
export const DEFAULT_ASTAR_OPTIONS: AStarOptions = {
  config: DEFAULT_ASTAR_CONFIG,
  enableCaching: true,
  cacheSize: 1000,
  enableStats: true,
  enableDebug: false,
};
