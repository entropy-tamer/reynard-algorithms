/**
 * @module algorithms/geometry/algorithms/convex-hull/types
 * @description Defines the types and interfaces for Convex Hull algorithms.
 */

/**
 * Represents a 2D point with x and y coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents a 2D vector.
 */
export interface Vector {
  x: number;
  y: number;
}

/**
 * Represents an edge of the convex hull.
 */
export interface HullEdge {
  start: Point;
  end: Point;
}

/**
 * Available convex hull algorithms.
 */
export type ConvexHullAlgorithm = "graham-scan" | "jarvis-march" | "quickhull" | "monotone-chain" | "gift-wrapping";

/**
 * Configuration options for convex hull algorithms.
 */
export interface ConvexHullConfig {
  /**
   * The algorithm to use for computing the convex hull.
   * @default 'graham-scan'
   */
  algorithm?: ConvexHullAlgorithm;
  /**
   * Whether to include collinear points on the hull.
   * @default false
   */
  includeCollinear?: boolean;
  /**
   * Whether to sort the input points before processing.
   * @default true
   */
  sortInput?: boolean;
  /**
   * Tolerance for floating point comparisons.
   * @default 1e-10
   */
  tolerance?: number;
  /**
   * Whether to validate input points.
   * @default true
   */
  validateInput?: boolean;
}

/**
 * Statistics about the convex hull computation.
 */
export interface ConvexHullStats {
  /**
   * Number of input points.
   */
  inputPointCount: number;
  /**
   * Number of points on the convex hull.
   */
  hullPointCount: number;
  /**
   * Number of edges in the convex hull.
   */
  hullEdgeCount: number;
  /**
   * Time taken for computation in milliseconds.
   */
  executionTime: number;
  /**
   * Whether the computation was successful.
   */
  success: boolean;
  /**
   * Algorithm used for computation.
   */
  algorithm: ConvexHullAlgorithm;
  /**
   * Error message if computation failed.
   */
  error?: string;
}

/**
 * The result of a convex hull computation.
 */
export interface ConvexHullResult {
  /**
   * Array of points forming the convex hull (in counter-clockwise order).
   */
  hull: Point[];
  /**
   * Array of edges forming the convex hull.
   */
  edges: HullEdge[];
  /**
   * Statistics about the computation.
   */
  stats: ConvexHullStats;
}

/**
 * Options for hull analysis.
 */
export interface HullAnalysisOptions {
  /**
   * Whether to compute the area of the convex hull.
   * @default true
   */
  computeArea?: boolean;
  /**
   * Whether to compute the perimeter of the convex hull.
   * @default true
   */
  computePerimeter?: boolean;
  /**
   * Whether to compute the centroid of the convex hull.
   * @default true
   */
  computeCentroid?: boolean;
  /**
   * Whether to compute the bounding box of the convex hull.
   * @default true
   */
  computeBoundingBox?: boolean;
}

/**
 * Analysis results for the convex hull.
 */
export interface HullAnalysis {
  /**
   * Area of the convex hull.
   */
  area: number;
  /**
   * Perimeter of the convex hull.
   */
  perimeter: number;
  /**
   * Centroid of the convex hull.
   */
  centroid: Point;
  /**
   * Bounding box of the convex hull.
   */
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

/**
 * Options for hull comparison.
 */
export interface HullComparisonOptions {
  /**
   * Whether to compare areas.
   * @default true
   */
  compareAreas?: boolean;
  /**
   * Whether to compare perimeters.
   * @default true
   */
  comparePerimeters?: boolean;
  /**
   * Whether to compare shapes using Hausdorff distance.
   * @default false
   */
  compareShapes?: boolean;
}

/**
 * Result of comparing two convex hulls.
 */
export interface HullComparison {
  /**
   * Area difference (hull2.area - hull1.area).
   */
  areaDifference: number;
  /**
   * Perimeter difference (hull2.perimeter - hull1.perimeter).
   */
  perimeterDifference: number;
  /**
   * Hausdorff distance between the hulls (if computed).
   */
  hausdorffDistance?: number;
  /**
   * Whether the hulls are identical.
   */
  identical: boolean;
}

/**
 * Options for hull simplification.
 */
export interface HullSimplificationOptions {
  /**
   * Maximum distance for point removal (Douglas-Peucker algorithm).
   * @default 0.1
   */
  maxDistance?: number;
  /**
   * Minimum angle between consecutive edges (in radians).
   * @default 0.01
   */
  minAngle?: number;
  /**
   * Whether to preserve the first and last points.
   * @default true
   */
  preserveEndpoints?: boolean;
}

/**
 * Result of hull simplification.
 */
export interface HullSimplificationResult {
  /**
   * Simplified hull points.
   */
  simplifiedHull: Point[];
  /**
   * Number of points removed.
   */
  pointsRemoved: number;
  /**
   * Compression ratio (original points / simplified points).
   */
  compressionRatio: number;
}
