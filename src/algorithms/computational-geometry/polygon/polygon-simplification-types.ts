/**
 * Polygon Simplification Types
 *
 * Type definitions for polygon simplification algorithms.
 */

import type { Point } from "../../../core/types/index.js";

/**
 * Polygon simplification configuration
 */
export interface PolygonSimplificationConfig {
  /** Tolerance for simplification (distance threshold) */
  tolerance?: number;
  /** Algorithm to use */
  algorithm?: SimplificationAlgorithm;
  /** Whether to preserve topology */
  preserveTopology?: boolean;
  /** Whether to preserve shape characteristics */
  preserveShape?: boolean;
}

/**
 * Simplification algorithm type
 */
export enum SimplificationAlgorithm {
  /** Douglas-Peucker algorithm */
  DOUGLAS_PEUCKER = "douglas-peucker",
  /** Visvalingam-Whyatt algorithm */
  VISVALINGAM_WHYATT = "visvalingam-whyatt",
  /** Reumann-Witkam algorithm */
  REUMANN_WITKAM = "reumann-witkam",
}

/**
 * Polygon simplification result
 */
export interface PolygonSimplificationResult {
  /** Simplified polygon vertices */
  vertices: Point[];
  /** Number of vertices removed */
  verticesRemoved: number;
  /** Compression ratio (original / simplified) */
  compressionRatio: number;
  /** Maximum error introduced */
  maxError: number;
  /** Average error introduced */
  averageError: number;
}

/**
 * Polygon simplification options
 */
export interface PolygonSimplificationOptions {
  /** Tolerance for simplification */
  tolerance: number;
  /** Algorithm to use */
  algorithm?: SimplificationAlgorithm;
  /** Whether to preserve topology */
  preserveTopology?: boolean;
  /** Whether to preserve shape */
  preserveShape?: boolean;
  /** Whether to remove collinear points */
  removeCollinear?: boolean;
}
