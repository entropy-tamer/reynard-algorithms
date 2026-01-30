/**
 * @file visibility-graph-types.ts
 * @module algorithms/pathfinding/visibility-graph-types
 * @description Type definitions for Visibility Graph pathfinding.
 */

import type { Point } from "../../../core/types";

/**
 * Obstacle polygon.
 */
export interface Obstacle {
  /**
   * Vertices of the obstacle polygon.
   */
  vertices: Point[];
}

/**
 * Visibility graph configuration.
 */
export interface VisibilityGraphConfig {
  /**
   * Tolerance for floating point comparisons.
   * @default 1e-6
   */
  tolerance?: number;
  /**
   * Whether to validate input.
   * @default true
   */
  validateInput?: boolean;
}

/**
 * Visibility graph edge.
 */
export interface VisibilityEdge {
  /**
   * Start vertex index.
   */
  from: number;
  /**
   * End vertex index.
   */
  to: number;
  /**
   * Edge weight (distance).
   */
  weight: number;
}

/**
 * Visibility graph result.
 */
export interface VisibilityGraphResult {
  /**
   * All vertices (start, goal, obstacle vertices).
   */
  vertices: Point[];
  /**
   * Visibility edges.
   */
  edges: VisibilityEdge[];
  /**
   * Number of vertices.
   */
  vertexCount: number;
  /**
   * Number of edges.
   */
  edgeCount: number;
}

/**
 * Pathfinding options.
 */
export interface VisibilityGraphPathfindingOptions {
  /**
   * Start position.
   */
  start: Point;
  /**
   * Goal position.
   */
  goal: Point;
}

/**
 * Pathfinding result.
 */
export interface VisibilityGraphPathfindingResult {
  /**
   * Path from start to goal.
   */
  path: Point[];
  /**
   * Whether a path was found.
   */
  found: boolean;
  /**
   * Path cost.
   */
  cost: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_VISIBILITY_GRAPH_CONFIG: Required<VisibilityGraphConfig> = {
  tolerance: 1e-6,
  validateInput: true,
};





