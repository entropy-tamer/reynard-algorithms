/**
 * Polygon Boolean Operations Types
 *
 * Type definitions for polygon boolean operations.
 */

import type { Point } from "../../../core/types/index.js";

/**
 * Polygon boolean operation configuration
 */
export interface PolygonBooleanConfig {
  /** Tolerance for floating point comparisons */
  tolerance?: number;
  /** Whether to validate input polygons */
  validateInput?: boolean;
  /** Whether to handle self-intersections */
  handleSelfIntersections?: boolean;
  /** Whether to remove duplicate vertices */
  removeDuplicates?: boolean;
  /** Whether to simplify the result */
  simplifyResult?: boolean;
}

/**
 * Boolean operation type
 */
export enum BooleanOperation {
  /** Union - combine both polygons */
  UNION = "union",
  /** Intersection - area common to both */
  INTERSECTION = "intersection",
  /** Difference - first minus second */
  DIFFERENCE = "difference",
  /** XOR - area in either but not both */
  XOR = "xor",
}

/**
 * Polygon definition
 */
export interface Polygon {
  /** Vertices of the polygon */
  vertices: Point[];
  /** Optional holes in the polygon */
  holes?: Polygon[];
}

/**
 * Polygon boolean operation result
 */
export interface PolygonBooleanResult {
  /** Resulting polygon(s) */
  polygons: Polygon[];
  /** Number of result polygons */
  polygonCount: number;
  /** Total area of result */
  totalArea: number;
  /** Whether operation was successful */
  success: boolean;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Polygon boolean operation options
 */
export interface PolygonBooleanOptions {
  /** Operation to perform */
  operation: BooleanOperation;
  /** Tolerance for comparisons */
  tolerance?: number;
  /** Whether to validate input */
  validateInput?: boolean;
  /** Whether to handle self-intersections */
  handleSelfIntersections?: boolean;
  /** Whether to simplify result */
  simplifyResult?: boolean;
  /** Whether to remove duplicate vertices */
  removeDuplicates?: boolean;
}
