/**
 * @module algorithms/geometry/algorithms/marching-squares/types
 * @description Defines the types and interfaces for the Marching Squares algorithm.
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
 * Represents a line segment between two points.
 */
export interface LineSegment {
  start: Point;
  end: Point;
}

/**
 * Represents a contour line with multiple segments.
 */
export interface Contour {
  segments: LineSegment[];
  isClosed: boolean;
  level: number;
}

/**
 * Configuration options for the Marching Squares algorithm.
 */
export interface MarchingSquaresConfig {
  /**
   * The threshold value for determining inside/outside regions.
   * @default 0.5
   */
  threshold?: number;
  /**
   * Whether to generate closed contours.
   * @default true
   */
  generateClosedContours?: boolean;
  /**
   * Whether to generate open contours.
   * @default true
   */
  generateOpenContours?: boolean;
  /**
   * Whether to interpolate edge positions for smoother contours.
   * @default true
   */
  interpolate?: boolean;
  /**
   * Tolerance for floating point comparisons.
   * @default 1e-10
   */
  tolerance?: number;
  /**
   * Whether to validate input data.
   * @default true
   */
  validateInput?: boolean;
}

/**
 * Statistics about the marching squares computation.
 */
export interface MarchingSquaresStats {
  /**
   * Width of the input grid.
   */
  gridWidth: number;
  /**
   * Height of the input grid.
   */
  gridHeight: number;
  /**
   * Number of contours generated.
   */
  contourCount: number;
  /**
   * Total number of line segments generated.
   */
  segmentCount: number;
  /**
   * Time taken for computation in milliseconds.
   */
  executionTime: number;
  /**
   * Whether the computation was successful.
   */
  success: boolean;
  /**
   * Error message if computation failed.
   */
  error?: string;
}

/**
 * The result of a marching squares computation.
 */
export interface MarchingSquaresResult {
  /**
   * Array of contours generated.
   */
  contours: Contour[];
  /**
   * Statistics about the computation.
   */
  stats: MarchingSquaresStats;
}

/**
 * Options for contour analysis.
 */
export interface ContourAnalysisOptions {
  /**
   * Whether to compute contour lengths.
   * @default true
   */
  computeLengths?: boolean;
  /**
   * Whether to compute contour areas (for closed contours).
   * @default true
   */
  computeAreas?: boolean;
  /**
   * Whether to compute contour centroids.
   * @default true
   */
  computeCentroids?: boolean;
  /**
   * Whether to compute contour bounding boxes.
   * @default true
   */
  computeBoundingBoxes?: boolean;
}

/**
 * Analysis results for a contour.
 */
export interface ContourAnalysis {
  /**
   * Length of the contour.
   */
  length: number;
  /**
   * Area of the contour (for closed contours only).
   */
  area?: number;
  /**
   * Centroid of the contour.
   */
  centroid: Point;
  /**
   * Bounding box of the contour.
   */
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

/**
 * Options for contour simplification.
 */
export interface ContourSimplificationOptions {
  /**
   * Maximum distance for point removal (Douglas-Peucker algorithm).
   * @default 0.1
   */
  maxDistance?: number;
  /**
   * Whether to preserve the first and last points.
   * @default true
   */
  preserveEndpoints?: boolean;
  /**
   * Whether to preserve sharp corners.
   * @default false
   */
  preserveCorners?: boolean;
}

/**
 * Result of contour simplification.
 */
export interface ContourSimplificationResult {
  /**
   * Simplified contour.
   */
  simplifiedContour: Contour;
  /**
   * Number of segments removed.
   */
  segmentsRemoved: number;
  /**
   * Compression ratio (original segments / simplified segments).
   */
  compressionRatio: number;
}

/**
 * Options for multi-level contour generation.
 */
export interface MultiLevelContourOptions {
  /**
   * Array of threshold values for different contour levels.
   */
  thresholds: number[];
  /**
   * Whether to generate contours for each threshold.
   * @default true
   */
  generateAllLevels?: boolean;
  /**
   * Whether to merge overlapping contours.
   * @default false
   */
  mergeOverlapping?: boolean;
}

/**
 * Result of multi-level contour generation.
 */
export interface MultiLevelContourResult {
  /**
   * Contours organized by threshold level.
   */
  contoursByLevel: Map<number, Contour[]>;
  /**
   * All contours combined.
   */
  allContours: Contour[];
  /**
   * Statistics about the computation.
   */
  stats: MarchingSquaresStats;
}
