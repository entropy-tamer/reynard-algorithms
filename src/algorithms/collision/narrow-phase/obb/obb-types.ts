/**
 * @module algorithms/geometry/shapes/obb/types
 * @description Defines the types and interfaces for Oriented Bounding Box (OBB) implementation.
 */

/**
 * Represents a 2D point with x and y coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents a 2D vector with x and y components.
 */
export interface Vector {
  x: number;
  y: number;
}

/**
 * Represents a 2D oriented bounding box data structure.
 */
export interface OBBData {
  /**
   * Center point of the OBB.
   */
  center: Point;
  /**
   * Half-widths along the local axes.
   */
  halfWidths: Vector;
  /**
   * Local axes (unit vectors) defining the orientation.
   */
  axes: [Vector, Vector];
  /**
   * Rotation angle in radians.
   */
  rotation: number;
}

/**
 * Configuration options for OBB operations.
 */
export interface OBBConfig {
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
  /**
   * Whether to normalize axes vectors.
   * @default true
   */
  normalizeAxes?: boolean;
  /**
   * Whether to use fast approximations for some calculations.
   * @default false
   */
  useFastApproximations?: boolean;
  /**
   * Whether to cache computed values for performance.
   * @default true
   */
  enableCaching?: boolean;
}

/**
 * Statistics about OBB operations.
 */
export interface OBBStats {
  /**
   * Number of collision tests performed.
   */
  collisionTests: number;
  /**
   * Number of SAT tests performed.
   */
  satTests: number;
  /**
   * Number of axis projections computed.
   */
  projections: number;
  /**
   * Time taken for operations in milliseconds.
   */
  executionTime: number;
  /**
   * Whether the operation was successful.
   */
  success: boolean;
  /**
   * Error message if operation failed.
   */
  error?: string;
}

/**
 * Result of a collision test between two OBBs.
 */
export interface OBBCollisionResult {
  /**
   * Whether the OBBs are colliding.
   */
  isColliding: boolean;
  /**
   * Minimum translation vector to separate the OBBs.
   */
  mtv?: Vector;
  /**
   * Penetration depth.
   */
  penetrationDepth?: number;
  /**
   * Axis of minimum penetration.
   */
  penetrationAxis?: Vector;
  /**
   * Statistics about the collision test.
   */
  stats: OBBStats;
}

/**
 * Result of a point-in-OBB test.
 */
export interface OBBPointTestResult {
  /**
   * Whether the point is inside the OBB.
   */
  isInside: boolean;
  /**
   * Distance from point to OBB surface (negative if inside).
   */
  distance: number;
  /**
   * Closest point on OBB surface to the test point.
   */
  closestPoint: Point;
  /**
   * Statistics about the test.
   */
  stats: OBBStats;
}

/**
 * Result of an OBB construction operation.
 */
export interface OBBConstructionResult {
  /**
   * The constructed OBB.
   */
  obb: OBBData;
  /**
   * Quality metrics of the construction.
   */
  quality: {
    /**
     * Area of the OBB.
     */
    area: number;
    /**
     * Aspect ratio (width/height).
     */
    aspectRatio: number;
    /**
     * How well the OBB fits the input points (0-1, higher is better).
     */
    fitQuality: number;
  };
  /**
   * Statistics about the construction.
   */
  stats: OBBStats;
}

/**
 * Options for OBB construction from points.
 */
export interface OBBConstructionOptions {
  /**
   * Method to use for construction.
   * @default "pca"
   */
  method?: "pca" | "convex-hull" | "brute-force";
  /**
   * Whether to optimize the OBB for minimum area.
   * @default true
   */
  optimizeForArea?: boolean;
  /**
   * Whether to optimize the OBB for minimum perimeter.
   * @default false
   */
  optimizeForPerimeter?: boolean;
  /**
   * Maximum number of iterations for optimization.
   * @default 100
   */
  maxIterations?: number;
  /**
   * Tolerance for convergence in optimization.
   * @default 1e-6
   */
  convergenceTolerance?: number;
}

/**
 * Options for SAT collision detection.
 */
export interface SATOptions {
  /**
   * Whether to compute the minimum translation vector.
   * @default true
   */
  computeMTV?: boolean;
  /**
   * Whether to use early exit optimization.
   * @default true
   */
  useEarlyExit?: boolean;
  /**
   * Whether to cache axis projections.
   * @default true
   */
  cacheProjections?: boolean;
}

/**
 * Projection of an OBB onto an axis.
 */
export interface OBBProjection {
  /**
   * Minimum projection value.
   */
  min: number;
  /**
   * Maximum projection value.
   */
  max: number;
  /**
   * Center of the projection.
   */
  center: number;
  /**
   * Extent of the projection.
   */
  extent: number;
}

/**
 * Options for OBB transformation.
 */
export interface OBBTransformOptions {
  /**
   * Translation to apply.
   */
  translation?: Vector;
  /**
   * Rotation angle in radians.
   */
  rotation?: number;
  /**
   * Scale factors.
   */
  scale?: Vector;
  /**
   * Whether to maintain OBB properties after transformation.
   * @default true
   */
  maintainProperties?: boolean;
}

/**
 * Result of an OBB transformation.
 */
export interface OBBTransformResult {
  /**
   * The transformed OBB.
   */
  obb: OBBData;
  /**
   * Whether the transformation was successful.
   */
  success: boolean;
  /**
   * Statistics about the transformation.
   */
  stats: OBBStats;
}

/**
 * Options for OBB serialization.
 */
export interface OBBSerializationOptions {
  /**
   * Precision for floating point values.
   * @default 6
   */
  precision?: number;
  /**
   * Whether to include statistics.
   * @default false
   */
  includeStats?: boolean;
  /**
   * Whether to include quality metrics.
   * @default false
   */
  includeQuality?: boolean;
}

/**
 * Serialized OBB data.
 */
export interface OBBSerialization {
  /**
   * The OBB center point.
   */
  center: Point;
  /**
   * The OBB half-widths.
   */
  halfWidths: Vector;
  /**
   * The OBB axes.
   */
  axes: [Vector, Vector];
  /**
   * The OBB rotation angle.
   */
  rotation: number;
  /**
   * Statistics (if included).
   */
  stats?: OBBStats;
  /**
   * Quality metrics (if included).
   */
  quality?: {
    area: number;
    aspectRatio: number;
    fitQuality: number;
  };
}

/**
 * Options for OBB validation.
 */
export interface OBBValidationOptions {
  /**
   * Whether to check for valid dimensions.
   * @default true
   */
  checkDimensions?: boolean;
  /**
   * Whether to check for valid axes.
   * @default true
   */
  checkAxes?: boolean;
  /**
   * Whether to check for orthogonality of axes.
   * @default true
   */
  checkOrthogonality?: boolean;
  /**
   * Whether to check for unit length axes.
   * @default true
   */
  checkUnitAxes?: boolean;
  /**
   * Minimum allowed dimension.
   * @default 0
   */
  minDimension?: number;
}

/**
 * Result of OBB validation.
 */
export interface OBBValidationResult {
  /**
   * Whether the OBB is valid.
   */
  isValid: boolean;
  /**
   * Array of validation errors.
   */
  errors: string[];
  /**
   * Array of validation warnings.
   */
  warnings: string[];
  /**
   * Whether the OBB has valid dimensions.
   */
  hasValidDimensions: boolean;
  /**
   * Whether the OBB has valid axes.
   */
  hasValidAxes: boolean;
  /**
   * Whether the OBB axes are orthogonal.
   */
  hasOrthogonalAxes: boolean;
  /**
   * Whether the OBB axes are unit vectors.
   */
  hasUnitAxes: boolean;
}

/**
 * Options for OBB intersection with other shapes.
 */
export interface OBBIntersectionOptions {
  /**
   * Whether to compute intersection points.
   * @default false
   */
  computePoints?: boolean;
  /**
   * Whether to compute intersection area.
   * @default false
   */
  computeArea?: boolean;
  /**
   * Whether to use fast approximation for area calculation.
   * @default false
   */
  useFastArea?: boolean;
}

/**
 * Result of OBB intersection with another shape.
 */
export interface OBBIntersectionResult {
  /**
   * Whether the shapes intersect.
   */
  intersects: boolean;
  /**
   * Intersection points (if computed).
   */
  points?: Point[];
  /**
   * Intersection area (if computed).
   */
  area?: number;
  /**
   * Statistics about the intersection test.
   */
  stats: OBBStats;
}

/**
 * Options for OBB containment tests.
 */
export interface OBBContainmentOptions {
  /**
   * Whether to compute containment percentage.
   * @default false
   */
  computePercentage?: boolean;
  /**
   * Whether to use fast approximation.
   * @default false
   */
  useFastApproximation?: boolean;
}

/**
 * Result of an OBB containment test.
 */
export interface OBBContainmentResult {
  /**
   * Whether the test shape is contained in the OBB.
   */
  isContained: boolean;
  /**
   * Percentage of containment (0-1).
   */
  containmentPercentage?: number;
  /**
   * Statistics about the containment test.
   */
  stats: OBBStats;
}
