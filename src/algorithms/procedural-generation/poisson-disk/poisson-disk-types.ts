/**
 * @module algorithms/geometry/algorithms/poisson-disk/types
 * @description Defines the types and interfaces for the Poisson Disk Sampling algorithm.
 */

/**
 * Represents a 2D point with x and y coordinates.
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Represents a 3D point with x, y, and z coordinates.
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Configuration options for Poisson Disk Sampling.
 */
export interface PoissonDiskConfig {
  /**
   * The minimum distance between any two points.
   * @default 1.0
   */
  minDistance?: number;
  /**
   * The maximum number of attempts to place a new point before giving up.
   * @default 30
   */
  maxAttempts?: number;
  /**
   * The width of the sampling area.
   * @default 100
   */
  width?: number;
  /**
   * The height of the sampling area.
   * @default 100
   */
  height?: number;
  /**
   * The depth of the sampling area (for 3D).
   * @default 100
   */
  depth?: number;
  /**
   * The seed for random number generation.
   * @default 0
   */
  seed?: number;
  /**
   * Whether to use a grid-based acceleration structure.
   * @default true
   */
  useGrid?: boolean;
  /**
   * The grid cell size (automatically calculated if not provided).
   * @default minDistance / Math.sqrt(2)
   */
  gridCellSize?: number;
  /**
   * Whether to allow points on the boundary.
   * @default true
   */
  allowBoundary?: boolean;
  /**
   * The maximum number of points to generate.
   * @default 10000
   */
  maxPoints?: number;
  /**
   * Whether to use the Bridson algorithm (faster) or the dart-throwing algorithm.
   * @default "bridson"
   */
  algorithm?: "bridson" | "dartThrowing";
}

/**
 * Statistics about the Poisson Disk Sampling process.
 */
export interface PoissonDiskStats {
  /**
   * The number of points successfully placed.
   */
  pointsPlaced: number;
  /**
   * The number of attempts made to place points.
   */
  attemptsMade: number;
  /**
   * The number of failed attempts (collisions).
   */
  failedAttempts: number;
  /**
   * The time taken for the sampling process in milliseconds.
   */
  executionTime: number;
  /**
   * The coverage percentage of the sampling area.
   */
  coveragePercentage: number;
  /**
   * The average distance between points.
   */
  averageDistance: number;
  /**
   * The minimum distance found between any two points.
   */
  actualMinDistance: number;
  /**
   * Whether the sampling completed successfully.
   */
  success: boolean;
  /**
   * Error message if sampling failed.
   */
  error?: string;
}

/**
 * The result of a Poisson Disk Sampling operation.
 */
export interface PoissonDiskResult {
  /**
   * An array of generated points.
   */
  points: Point2D[] | Point3D[];
  /**
   * Statistics about the sampling process.
   */
  stats: PoissonDiskStats;
  /**
   * Whether the sampling completed successfully.
   */
  success: boolean;
  /**
   * A message providing more details about the result.
   */
  message: string;
}

/**
 * Options for 2D Poisson Disk Sampling.
 */
export interface PoissonDisk2DOptions extends Omit<PoissonDiskConfig, "depth"> {
  /**
   * The width of the 2D sampling area.
   */
  width: number;
  /**
   * The height of the 2D sampling area.
   */
  height: number;
}

/**
 * Options for 3D Poisson Disk Sampling.
 */
export interface PoissonDisk3DOptions extends PoissonDiskConfig {
  /**
   * The width of the 3D sampling area.
   */
  width: number;
  /**
   * The height of the 3D sampling area.
   */
  height: number;
  /**
   * The depth of the 3D sampling area.
   */
  depth: number;
}

/**
 * Options for analyzing the quality of Poisson Disk Sampling.
 */
export interface PoissonDiskAnalysisOptions {
  /**
   * Whether to compute distance statistics.
   * @default true
   */
  computeDistanceStats?: boolean;
  /**
   * Whether to compute coverage analysis.
   * @default true
   */
  computeCoverage?: boolean;
  /**
   * Whether to compute uniformity metrics.
   * @default true
   */
  computeUniformity?: boolean;
  /**
   * Whether to compute spatial distribution.
   * @default false
   */
  computeSpatialDistribution?: boolean;
}

/**
 * Analysis results for Poisson Disk Sampling.
 */
export interface PoissonDiskAnalysis {
  /**
   * Distance statistics.
   */
  distanceStats: {
    minDistance: number;
    maxDistance: number;
    averageDistance: number;
    medianDistance: number;
    standardDeviation: number;
  };
  /**
   * Coverage analysis.
   */
  coverage: {
    totalArea: number;
    coveredArea: number;
    coveragePercentage: number;
    uncoveredRegions: number;
  };
  /**
   * Uniformity metrics.
   */
  uniformity: {
    coefficientOfVariation: number;
    uniformityIndex: number;
    clusteringIndex: number;
  };
  /**
   * Spatial distribution (if computed).
   */
  spatialDistribution?: {
    densityMap: number[][];
    densityVariance: number;
    densitySkewness: number;
  };
  /**
   * The time taken for the analysis in milliseconds.
   */
  executionTime: number;
}

/**
 * Options for adaptive Poisson Disk Sampling.
 */
export interface AdaptivePoissonDiskOptions {
  /**
   * The base minimum distance.
   */
  baseMinDistance: number;
  /**
   * The maximum allowed minimum distance.
   */
  maxMinDistance: number;
  /**
   * The minimum allowed minimum distance.
   */
  minMinDistance: number;
  /**
   * The adaptation factor for distance adjustment.
   * @default 0.1
   */
  adaptationFactor?: number;
  /**
   * The target coverage percentage.
   * @default 0.8
   */
  targetCoverage?: number;
  /**
   * The maximum number of adaptation iterations.
   * @default 10
   */
  maxIterations?: number;
}

/**
 * Result of adaptive Poisson Disk Sampling.
 */
export interface AdaptivePoissonDiskResult {
  /**
   * The generated points.
   */
  points: Point2D[] | Point3D[];
  /**
   * The final minimum distance used.
   */
  finalMinDistance: number;
  /**
   * The number of adaptation iterations performed.
   */
  iterations: number;
  /**
   * The final coverage percentage achieved.
   */
  finalCoverage: number;
  /**
   * Statistics about the sampling process.
   */
  stats: PoissonDiskStats;
  /**
   * Whether the adaptive sampling completed successfully.
   */
  success: boolean;
  /**
   * A message providing more details about the result.
   */
  message: string;
}

/**
 * Options for constrained Poisson Disk Sampling.
 */
export interface ConstrainedPoissonDiskOptions extends PoissonDiskConfig {
  /**
   * A function that determines if a point is valid (within constraints).
   */
  isValidPoint: (point: Point2D | Point3D) => boolean;
  /**
   * A function that provides a custom distance metric.
   */
  customDistance?: (p1: Point2D | Point3D, p2: Point2D | Point3D) => number;
  /**
   * A function that provides custom sampling bounds.
   */
  customBounds?: () => { min: Point2D | Point3D; max: Point2D | Point3D };
}

/**
 * Result of constrained Poisson Disk Sampling.
 */
export interface ConstrainedPoissonDiskResult {
  /**
   * The generated points that satisfy the constraints.
   */
  points: Point2D[] | Point3D[];
  /**
   * The number of points that were rejected due to constraints.
   */
  rejectedPoints: number;
  /**
   * Statistics about the sampling process.
   */
  stats: PoissonDiskStats;
  /**
   * Whether the constrained sampling completed successfully.
   */
  success: boolean;
  /**
   * A message providing more details about the result.
   */
  message: string;
}
