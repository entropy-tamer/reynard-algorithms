/**
 * @file navmesh-types.ts
 * @module algorithms/game-mechanics/navmesh-types
 * @description Type definitions for Navmesh generation and pathfinding.
 */

import type { Point3D } from "../../../core/types";

/**
 * Navmesh polygon (walkable area).
 */
export interface NavmeshPolygon {
  /**
   * Vertices of the polygon.
   */
  vertices: Point3D[];
  /**
   * Neighboring polygons (shared edges).
   */
  neighbors: number[];
  /**
   * Center point of the polygon.
   */
  center: Point3D;
}

/**
 * Navmesh configuration.
 */
export interface NavmeshConfig {
  /**
   * Whether to validate input geometry.
   * @default true
   */
  validateInput?: boolean;
  /**
   * Tolerance for floating point comparisons.
   * @default 1e-6
   */
  tolerance?: number;
}

/**
 * Navmesh generation result.
 */
export interface NavmeshResult {
  /**
   * Generated navmesh polygons.
   */
  polygons: NavmeshPolygon[];
  /**
   * Number of polygons generated.
   */
  polygonCount: number;
}

/**
 * Navmesh pathfinding options.
 */
export interface NavmeshPathfindingOptions {
  /**
   * Start position.
   */
  start: Point3D;
  /**
   * Goal position.
   */
  goal: Point3D;
  /**
   * Heuristic function for A*.
   */
  heuristic?: (a: Point3D, b: Point3D) => number;
}

/**
 * Navmesh pathfinding result.
 */
export interface NavmeshPathfindingResult {
  /**
   * Path from start to goal.
   */
  path: Point3D[];
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
export const DEFAULT_NAVMESH_CONFIG: Required<NavmeshConfig> = {
  validateInput: true,
  tolerance: 1e-6,
};





