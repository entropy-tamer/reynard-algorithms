/**
 * A* Pathfinding Module
 *
 * Clean exports for the A* pathfinding algorithm implementation.
 * Provides comprehensive pathfinding capabilities with multiple heuristics,
 * caching, statistics, and optimization features.
 *
 * @module algorithms/pathfinding/astar
 */

// Export core implementation
export { AStar } from "./astar-core";

// Export all types and interfaces
export type {
  Point,
  AStarNode,
  AStarEdge,
  AStarConfig,
  AStarResult,
  AStarGrid,
  AStarGraph,
  AStarStats,
  AStarEvent,
  AStarEventType,
  AStarEventHandler,
  AStarOptions,
  AStarCacheEntry,
  AStarPerformanceMetrics,
  AStarHeuristic,
  PathSmoothingOptions,
  DynamicWeightingOptions,
} from "./astar-types";

// Export heuristics
export {
  manhattanDistance,
  euclideanDistance,
  chebyshevDistance,
  octileDistance,
  squaredEuclideanDistance,
  diagonalDistance,
  zeroHeuristic,
  weightedHeuristic,
  adaptiveHeuristic,
  multiObjectiveHeuristic,
  precomputedHeuristic,
  createHeuristic,
  defaultHeuristic,
  heuristics,
} from "./heuristics";

// Export default configurations
export { DEFAULT_ASTAR_CONFIG, DEFAULT_ASTAR_OPTIONS } from "./astar-types";
