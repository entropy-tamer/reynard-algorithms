/**
 * @module algorithms/geometry/algorithms/minimum-bounding-box/minimum-bounding-box-types
 * @description Type definitions for Minimum Bounding Box with rotating calipers algorithm.
 */

/**
 * A 2D point with x and y coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * A 2D vector with x and y components.
 */
export interface Vector {
  x: number;
  y: number;
}

/**
 * A rectangle defined by its center, dimensions, and rotation.
 */
export interface Rectangle {
  center: Point;
  width: number;
  height: number;
  rotation: number;
}

/**
 * Configuration options for the Minimum Bounding Box algorithm.
 */
export interface MinimumBoundingBoxConfig {
  /** Numerical tolerance for floating-point comparisons */
  tolerance: number;
  /** Whether to validate input points */
  validateInput: boolean;
  /** Whether to normalize the result rectangle */
  normalizeResult: boolean;
  /** Whether to use fast approximations */
  useFastApproximations: boolean;
  /** Whether to enable caching for repeated operations */
  enableCaching: boolean;
  /** Maximum number of iterations for optimization */
  maxIterations: number;
  /** Convergence tolerance for iterative methods */
  convergenceTolerance: number;
}

/**
 * Statistics about the Minimum Bounding Box computation.
 */
export interface MinimumBoundingBoxStats {
  /** Number of points processed */
  pointsProcessed: number;
  /** Number of iterations performed */
  iterations: number;
  /** Number of angle tests performed */
  angleTests: number;
  /** Total execution time in milliseconds */
  executionTime: number;
  /** Whether the computation was successful */
  success: boolean;
  /** Error message if computation failed */
  error?: string;
}

/**
 * Result of the Minimum Bounding Box computation.
 */
export interface MinimumBoundingBoxResult {
  /** The minimum bounding box rectangle */
  rectangle: Rectangle;
  /** Area of the bounding box */
  area: number;
  /** Perimeter of the bounding box */
  perimeter: number;
  /** Aspect ratio (width/height) */
  aspectRatio: number;
  /** Quality metrics */
  quality: {
    /** How well the box fits the points (0-1, higher is better) */
    fitQuality: number;
    /** Efficiency compared to AABB (0-1, higher is better) */
    efficiency: number;
    /** Compactness measure */
    compactness: number;
  };
  /** Computation statistics */
  stats: MinimumBoundingBoxStats;
}

/**
 * Options for computing the minimum bounding box.
 */
export interface MinimumBoundingBoxOptions {
  /** Method to use for computation */
  method: "rotating-calipers" | "brute-force" | "convex-hull";
  /** Whether to optimize for minimum area */
  optimizeForArea: boolean;
  /** Whether to optimize for minimum perimeter */
  optimizeForPerimeter: boolean;
  /** Whether to use convex hull preprocessing */
  useConvexHull: boolean;
  /** Maximum number of iterations */
  maxIterations: number;
  /** Convergence tolerance */
  convergenceTolerance: number;
  /** Whether to include quality metrics */
  includeQuality: boolean;
}

/**
 * Options for rotating calipers algorithm.
 */
export interface RotatingCalipersOptions {
  /** Starting angle for the calipers */
  startAngle: number;
  /** Angle step size for rotation */
  angleStep: number;
  /** Maximum rotation angle */
  maxAngle: number;
  /** Whether to use binary search for optimal angle */
  useBinarySearch: boolean;
  /** Whether to use golden section search */
  useGoldenSection: boolean;
  /** Precision for angle optimization */
  anglePrecision: number;
}

/**
 * Options for convex hull preprocessing.
 */
export interface ConvexHullOptions {
  /** Algorithm to use for convex hull */
  algorithm: "graham-scan" | "jarvis-march" | "quickhull";
  /** Whether to remove collinear points */
  removeCollinear: boolean;
  /** Whether to sort points by angle */
  sortByAngle: boolean;
  /** Whether to use optimized data structures */
  useOptimizedStructures: boolean;
}

/**
 * Options for validation.
 */
export interface MinimumBoundingBoxValidationOptions {
  /** Whether to check point validity */
  checkPoints: boolean;
  /** Whether to check rectangle validity */
  checkRectangle: boolean;
  /** Whether to check area calculation */
  checkArea: boolean;
  /** Whether to check perimeter calculation */
  checkPerimeter: boolean;
  /** Minimum area threshold */
  minArea: number;
  /** Maximum area threshold */
  maxArea: number;
}

/**
 * Result of validation.
 */
export interface MinimumBoundingBoxValidationResult {
  /** Whether the result is valid */
  isValid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of validation warnings */
  warnings: string[];
  /** Whether points are valid */
  hasValidPoints: boolean;
  /** Whether rectangle is valid */
  hasValidRectangle: boolean;
  /** Whether area is valid */
  hasValidArea: boolean;
  /** Whether perimeter is valid */
  hasValidPerimeter: boolean;
}

/**
 * Options for serialization.
 */
export interface MinimumBoundingBoxSerializationOptions {
  /** Number of decimal places for coordinates */
  precision: number;
  /** Whether to include statistics */
  includeStats: boolean;
  /** Whether to include quality metrics */
  includeQuality: boolean;
  /** Whether to include validation results */
  includeValidation: boolean;
}

/**
 * Serialized representation of the minimum bounding box result.
 */
export interface MinimumBoundingBoxSerialization {
  /** The rectangle */
  rectangle: {
    center: Point;
    width: number;
    height: number;
    rotation: number;
  };
  /** Area of the rectangle */
  area: number;
  /** Perimeter of the rectangle */
  perimeter: number;
  /** Aspect ratio */
  aspectRatio: number;
  /** Quality metrics (if included) */
  quality?: {
    fitQuality: number;
    efficiency: number;
    compactness: number;
  };
  /** Statistics (if included) */
  stats?: MinimumBoundingBoxStats;
  /** Validation results (if included) */
  validation?: MinimumBoundingBoxValidationResult;
}

/**
 * Options for comparison between bounding boxes.
 */
export interface BoundingBoxComparisonOptions {
  /** Whether to compare areas */
  compareAreas: boolean;
  /** Whether to compare perimeters */
  comparePerimeters: boolean;
  /** Whether to compare aspect ratios */
  compareAspectRatios: boolean;
  /** Whether to compare rotations */
  compareRotations: boolean;
  /** Tolerance for comparisons */
  tolerance: number;
}

/**
 * Result of bounding box comparison.
 */
export interface BoundingBoxComparisonResult {
  /** Whether the boxes are equal within tolerance */
  areEqual: boolean;
  /** Area difference */
  areaDifference: number;
  /** Perimeter difference */
  perimeterDifference: number;
  /** Aspect ratio difference */
  aspectRatioDifference: number;
  /** Rotation difference */
  rotationDifference: number;
  /** Overall similarity score (0-1) */
  similarity: number;
}

/**
 * Options for optimization.
 */
export interface MinimumBoundingBoxOptimizationOptions {
  /** Whether to use gradient descent */
  useGradientDescent: boolean;
  /** Whether to use simulated annealing */
  useSimulatedAnnealing: boolean;
  /** Whether to use genetic algorithm */
  useGeneticAlgorithm: boolean;
  /** Learning rate for gradient descent */
  learningRate: number;
  /** Temperature for simulated annealing */
  temperature: number;
  /** Population size for genetic algorithm */
  populationSize: number;
  /** Number of generations for genetic algorithm */
  generations: number;
}

/**
 * Result of optimization.
 */
export interface MinimumBoundingBoxOptimizationResult {
  /** The optimized rectangle */
  rectangle: Rectangle;
  /** Improvement in area */
  areaImprovement: number;
  /** Improvement in perimeter */
  perimeterImprovement: number;
  /** Number of optimization iterations */
  iterations: number;
  /** Whether optimization converged */
  converged: boolean;
  /** Final objective value */
  objectiveValue: number;
}



