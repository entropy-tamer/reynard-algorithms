/**
 * @module algorithms/geometry/algorithms/minimum-bounding-box/minimum-bounding-box-core
 * @description Main implementation of Minimum Bounding Box with rotating calipers algorithm.
 */

import {
  Point,
  Rectangle,
  MinimumBoundingBoxConfig,
  MinimumBoundingBoxStats,
  MinimumBoundingBoxResult,
  MinimumBoundingBoxOptions,
  RotatingCalipersOptions,
  MinimumBoundingBoxValidationOptions,
  MinimumBoundingBoxValidationResult,
  MinimumBoundingBoxSerializationOptions,
  MinimumBoundingBoxSerialization,
  BoundingBoxComparisonOptions,
  BoundingBoxComparisonResult,
  MinimumBoundingBoxOptimizationOptions,
  MinimumBoundingBoxOptimizationResult,
} from "./minimum-bounding-box-types";
import { MinimumBoundingBoxUtils } from "./minimum-bounding-box-utils";

/**
 * The MinimumBoundingBox class provides functionality for computing the minimum
 * bounding box of a set of points using the rotating calipers algorithm.
 * This algorithm finds the rectangle with minimum area or perimeter that
 * contains all the given points.
 *
 * @example
 * ```typescript
 * const mbb = new MinimumBoundingBox();
 * const points = [
 *   { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }
 * ];
 * const result = mbb.compute(points);
 * console.log(result.rectangle); // Minimum bounding box
 * ```
 */
export class MinimumBoundingBox {
  private config: MinimumBoundingBoxConfig;
  private stats: MinimumBoundingBoxStats;

  /**
   * Creates an instance of MinimumBoundingBox.
   * @param config - Optional configuration for the algorithm.
   * @example
   */
  constructor(config: Partial<MinimumBoundingBoxConfig> = {}) {
    this.config = {
      tolerance: 1e-10,
      validateInput: true,
      normalizeResult: true,
      useFastApproximations: false,
      enableCaching: true,
      maxIterations: 1000,
      convergenceTolerance: 1e-6,
      ...config,
    };

    this.stats = {
      pointsProcessed: 0,
      iterations: 0,
      angleTests: 0,
      executionTime: 0,
      success: true,
    };
  }

  /**
   * Computes the minimum bounding box for a set of points.
   * @param points - Array of points to compute bounding box for.
   * @param options - Computation options.
   * @returns Result containing the minimum bounding box and quality metrics.
   * @example
   */
  compute(points: Point[], options: Partial<MinimumBoundingBoxOptions> = {}): MinimumBoundingBoxResult {
    const startTime = performance.now();
    const computeOptions: MinimumBoundingBoxOptions = {
      method: "rotating-calipers",
      optimizeForArea: true,
      optimizeForPerimeter: false,
      useConvexHull: true,
      maxIterations: this.config.maxIterations,
      convergenceTolerance: this.config.convergenceTolerance,
      includeQuality: true,
      ...options,
    };

    try {
      // Validate input
      if (this.config.validateInput) {
        if (!MinimumBoundingBoxUtils.validatePoints(points, this.config)) {
          throw new Error("Invalid points provided for minimum bounding box computation");
        }
      }

      this.stats.pointsProcessed = points.length;

      // Remove duplicate points
      const uniquePoints = MinimumBoundingBoxUtils.removeDuplicatePoints(points, this.config.tolerance);

      if (uniquePoints.length < 3) {
        // For less than 3 points, return axis-aligned bounding box
        const rectangle = MinimumBoundingBoxUtils.calculateBoundingBox(uniquePoints);
        return this.createResult(rectangle, uniquePoints, startTime, computeOptions);
      }

      let workingPoints = uniquePoints;

      // Use convex hull if requested
      if (computeOptions.useConvexHull) {
        workingPoints = MinimumBoundingBoxUtils.calculateConvexHull(uniquePoints);
      }

      let rectangle: Rectangle;

      // Compute minimum bounding box using selected method
      switch (computeOptions.method) {
        case "rotating-calipers":
          rectangle = this.computeRotatingCalipers(workingPoints, computeOptions);
          break;
        case "brute-force":
          rectangle = this.computeBruteForce(workingPoints, computeOptions);
          break;
        case "convex-hull":
          rectangle = this.computeConvexHullMethod(workingPoints, computeOptions);
          break;
        default:
          throw new Error(`Unknown computation method: ${computeOptions.method}`);
      }

      // Normalize result if requested
      if (this.config.normalizeResult) {
        rectangle = this.normalizeRectangle(rectangle);
      }

      return this.createResult(rectangle, uniquePoints, startTime, computeOptions);
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        rectangle: { center: { x: 0, y: 0 }, width: 0, height: 0, rotation: 0 },
        area: 0,
        perimeter: 0,
        aspectRatio: 1,
        quality: {
          fitQuality: 0,
          efficiency: 0,
          compactness: 0,
        },
        stats: {
          pointsProcessed: points.length,
          iterations: this.stats.iterations,
          angleTests: this.stats.angleTests,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Computes the minimum bounding box using rotating calipers algorithm.
   * @param points - Array of points (should be convex hull).
   * @param options - Computation options.
   * @param _options
   * @returns Minimum bounding box rectangle.
   * @example
   */
  private computeRotatingCalipers(points: Point[], _options: MinimumBoundingBoxOptions): Rectangle {
    const rotatingCalipersOptions: RotatingCalipersOptions = {
      startAngle: 0,
      angleStep: Math.PI / 180, // 1 degree steps
      maxAngle: Math.PI / 2,
      useBinarySearch: true,
      useGoldenSection: false,
      anglePrecision: this.config.convergenceTolerance,
    };

    this.stats.iterations = 0;
    this.stats.angleTests = 0;

    return MinimumBoundingBoxUtils.calculateMinimumBoundingBoxRotatingCalipers(points, rotatingCalipersOptions);
  }

  /**
   * Computes the minimum bounding box using brute force method.
   * @param points - Array of points.
   * @param options - Computation options.
   * @returns Minimum bounding box rectangle.
   * @example
   */
  private computeBruteForce(points: Point[], options: MinimumBoundingBoxOptions): Rectangle {
    let bestRectangle: Rectangle | null = null;
    let bestValue = Infinity;

    const angleStep = Math.PI / 180; // 1 degree steps
    const maxAngle = Math.PI / 2;

    for (let angle = 0; angle <= maxAngle; angle += angleStep) {
      this.stats.angleTests++;
      const rectangle = MinimumBoundingBoxUtils.calculateBoundingBoxAtAngle(points, angle);

      const value = options.optimizeForArea
        ? MinimumBoundingBoxUtils.calculateArea(rectangle)
        : MinimumBoundingBoxUtils.calculatePerimeter(rectangle);

      if (value < bestValue) {
        bestValue = value;
        bestRectangle = rectangle;
      }
    }

    this.stats.iterations = Math.floor(maxAngle / angleStep);
    return bestRectangle || MinimumBoundingBoxUtils.calculateBoundingBox(points);
  }

  /**
   * Computes the minimum bounding box using convex hull method.
   * @param points - Array of points.
   * @param options - Computation options.
   * @returns Minimum bounding box rectangle.
   * @example
   */
  private computeConvexHullMethod(points: Point[], options: MinimumBoundingBoxOptions): Rectangle {
    // This is essentially the same as rotating calipers but with explicit convex hull
    const convexHull = MinimumBoundingBoxUtils.calculateConvexHull(points);
    return this.computeRotatingCalipers(convexHull, options);
  }

  /**
   * Creates the result object with quality metrics.
   * @param rectangle - The computed rectangle.
   * @param points - Original points.
   * @param startTime - Start time of computation.
   * @param options - Computation options.
   * @returns Complete result object.
   * @example
   */
  private createResult(
    rectangle: Rectangle,
    points: Point[],
    startTime: number,
    options: MinimumBoundingBoxOptions
  ): MinimumBoundingBoxResult {
    const executionTime = performance.now() - startTime;
    const area = MinimumBoundingBoxUtils.calculateArea(rectangle);
    const perimeter = MinimumBoundingBoxUtils.calculatePerimeter(rectangle);
    const aspectRatio = MinimumBoundingBoxUtils.calculateAspectRatio(rectangle);

    let quality = {
      fitQuality: 0,
      efficiency: 0,
      compactness: 0,
    };

    if (options.includeQuality) {
      const aabb = MinimumBoundingBoxUtils.calculateBoundingBox(points);
      quality = {
        fitQuality: MinimumBoundingBoxUtils.calculateFitQuality(points, rectangle, this.config.tolerance),
        efficiency: MinimumBoundingBoxUtils.calculateEfficiency(rectangle, aabb),
        compactness: MinimumBoundingBoxUtils.calculateCompactness(rectangle),
      };
    }

    const stats: MinimumBoundingBoxStats = {
      pointsProcessed: points.length,
      iterations: this.stats.iterations,
      angleTests: this.stats.angleTests,
      executionTime,
      success: true,
    };

    return {
      rectangle,
      area,
      perimeter,
      aspectRatio,
      quality,
      stats,
    };
  }

  /**
   * Normalizes a rectangle to standard form.
   * @param rectangle - Rectangle to normalize.
   * @returns Normalized rectangle.
   * @example
   */
  private normalizeRectangle(rectangle: Rectangle): Rectangle {
    // Ensure width >= height
    if (rectangle.width < rectangle.height) {
      return {
        center: rectangle.center,
        width: rectangle.height,
        height: rectangle.width,
        rotation: rectangle.rotation + Math.PI / 2,
      };
    }

    // Normalize rotation to [0, π/2)
    let normalizedRotation = rectangle.rotation % (Math.PI / 2);
    if (normalizedRotation < 0) {
      normalizedRotation += Math.PI / 2;
    }

    return {
      ...rectangle,
      rotation: normalizedRotation,
    };
  }

  /**
   * Validates a minimum bounding box result.
   * @param result - Result to validate.
   * @param options - Validation options.
   * @returns Validation result.
   * @example
   */
  validate(
    result: MinimumBoundingBoxResult,
    options: Partial<MinimumBoundingBoxValidationOptions> = {}
  ): MinimumBoundingBoxValidationResult {
    const validationOptions: MinimumBoundingBoxValidationOptions = {
      checkPoints: true,
      checkRectangle: true,
      checkArea: true,
      checkPerimeter: true,
      minArea: 0,
      maxArea: Infinity,
      ...options,
    };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check rectangle validity
    if (validationOptions.checkRectangle) {
      if (!MinimumBoundingBoxUtils.validateRectangle(result.rectangle, this.config)) {
        errors.push("Invalid rectangle in result");
      }
    }

    // Check area validity
    if (validationOptions.checkArea) {
      if (result.area < validationOptions.minArea!) {
        errors.push(`Area ${result.area} is below minimum ${validationOptions.minArea}`);
      }
      if (result.area > validationOptions.maxArea!) {
        errors.push(`Area ${result.area} is above maximum ${validationOptions.maxArea}`);
      }
    }

    // Check perimeter validity
    if (validationOptions.checkPerimeter) {
      if (result.perimeter < 0) {
        errors.push("Negative perimeter");
      }
    }

    // Check quality metrics
    if (result.quality.fitQuality < 0 || result.quality.fitQuality > 1) {
      warnings.push("Fit quality should be between 0 and 1");
    }

    if (result.quality.efficiency < 0 || result.quality.efficiency > 1) {
      warnings.push("Efficiency should be between 0 and 1");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasValidPoints: true, // Points are validated during computation
      hasValidRectangle: errors.length === 0 || !errors.some(e => e.includes("rectangle")),
      hasValidArea: errors.length === 0 || !errors.some(e => e.includes("Area")),
      hasValidPerimeter: errors.length === 0 || !errors.some(e => e.includes("perimeter")),
    };
  }

  /**
   * Compares two bounding boxes.
   * @param box1 - First bounding box.
   * @param box2 - Second bounding box.
   * @param options - Comparison options.
   * @returns Comparison result.
   * @example
   */
  compare(
    box1: MinimumBoundingBoxResult,
    box2: MinimumBoundingBoxResult,
    options: Partial<BoundingBoxComparisonOptions> = {}
  ): BoundingBoxComparisonResult {
    const comparisonOptions: BoundingBoxComparisonOptions = {
      compareAreas: true,
      comparePerimeters: true,
      compareAspectRatios: true,
      compareRotations: true,
      tolerance: this.config.tolerance,
      ...options,
    };

    const areaDifference = Math.abs(box1.area - box2.area);
    const perimeterDifference = Math.abs(box1.perimeter - box2.perimeter);
    const aspectRatioDifference = Math.abs(box1.aspectRatio - box2.aspectRatio);
    const rotationDifference = Math.abs(box1.rectangle.rotation - box2.rectangle.rotation);

    const areEqual =
      areaDifference < comparisonOptions.tolerance &&
      perimeterDifference < comparisonOptions.tolerance &&
      aspectRatioDifference < comparisonOptions.tolerance &&
      rotationDifference < comparisonOptions.tolerance;

    // Calculate similarity score (0-1, higher is more similar)
    const maxArea = Math.max(box1.area, box2.area);
    const maxPerimeter = Math.max(box1.perimeter, box2.perimeter);
    const maxAspectRatio = Math.max(box1.aspectRatio, box2.aspectRatio);

    const areaSimilarity = maxArea === 0 ? 1 : 1 - areaDifference / maxArea;
    const perimeterSimilarity = maxPerimeter === 0 ? 1 : 1 - perimeterDifference / maxPerimeter;
    const aspectRatioSimilarity = maxAspectRatio === 0 ? 1 : 1 - aspectRatioDifference / maxAspectRatio;
    const rotationSimilarity = 1 - rotationDifference / (Math.PI / 2);

    const similarity = (areaSimilarity + perimeterSimilarity + aspectRatioSimilarity + rotationSimilarity) / 4;

    return {
      areEqual,
      areaDifference,
      perimeterDifference,
      aspectRatioDifference,
      rotationDifference,
      similarity: Math.max(0, Math.min(1, similarity)),
    };
  }

  /**
   * Optimizes a bounding box using various optimization techniques.
   * @param points - Array of points.
   * @param _points
   * @param initialBox - Initial bounding box.
   * @param options - Optimization options.
   * @param _options
   * @returns Optimization result.
   * @example
   */
  optimize(
    _points: Point[],
    initialBox: Rectangle,
    _options: Partial<MinimumBoundingBoxOptimizationOptions> = {}
  ): MinimumBoundingBoxOptimizationResult {
    // For now, implement a simple local search optimization
    let bestBox = initialBox;
    let bestArea = MinimumBoundingBoxUtils.calculateArea(initialBox);
    let iterations = 0;

    const angleStep = Math.PI / 180; // 1 degree
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      iterations++;
      let improved = false;

      // Try small angle adjustments
      for (const deltaAngle of [-angleStep, angleStep]) {
        const testBox = {
          ...bestBox,
          rotation: bestBox.rotation + deltaAngle,
        };

        const testArea = MinimumBoundingBoxUtils.calculateArea(testBox);
        if (testArea < bestArea) {
          bestBox = testBox;
          bestArea = testArea;
          improved = true;
        }
      }

      if (!improved) break;
    }

    const initialArea = MinimumBoundingBoxUtils.calculateArea(initialBox);
    const initialPerimeter = MinimumBoundingBoxUtils.calculatePerimeter(initialBox);
    const finalPerimeter = MinimumBoundingBoxUtils.calculatePerimeter(bestBox);

    return {
      rectangle: bestBox,
      areaImprovement: initialArea - bestArea,
      perimeterImprovement: initialPerimeter - finalPerimeter,
      iterations,
      converged: iterations < maxIterations,
      objectiveValue: bestArea,
    };
  }

  /**
   * Serializes a minimum bounding box result to JSON.
   * @param result - Result to serialize.
   * @param options - Serialization options.
   * @returns Serialized result.
   * @example
   */
  serialize(
    result: MinimumBoundingBoxResult,
    options: Partial<MinimumBoundingBoxSerializationOptions> = {}
  ): MinimumBoundingBoxSerialization {
    const serializationOptions: MinimumBoundingBoxSerializationOptions = {
      precision: 6,
      includeStats: false,
      includeQuality: false,
      includeValidation: false,
      ...options,
    };

    const round = (value: number) => {
      return (
        Math.round(value * Math.pow(10, serializationOptions.precision!)) /
        Math.pow(10, serializationOptions.precision!)
      );
    };

    const roundPoint = (point: Point) => ({
      x: round(point.x),
      y: round(point.y),
    });

    const serialized: MinimumBoundingBoxSerialization = {
      rectangle: {
        center: roundPoint(result.rectangle.center),
        width: round(result.rectangle.width),
        height: round(result.rectangle.height),
        rotation: round(result.rectangle.rotation),
      },
      area: round(result.area),
      perimeter: round(result.perimeter),
      aspectRatio: round(result.aspectRatio),
    };

    if (serializationOptions.includeStats) {
      serialized.stats = result.stats;
    }

    if (serializationOptions.includeQuality) {
      serialized.quality = {
        fitQuality: round(result.quality.fitQuality),
        efficiency: round(result.quality.efficiency),
        compactness: round(result.quality.compactness),
      };
    }

    if (serializationOptions.includeValidation) {
      serialized.validation = this.validate(result);
    }

    return serialized;
  }

  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   * @example
   */
  updateConfig(newConfig: Partial<MinimumBoundingBoxConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets the current configuration.
   * @returns The current configuration.
   * @example
   */
  getConfig(): MinimumBoundingBoxConfig {
    return { ...this.config };
  }

  /**
   * Gets the current statistics.
   * @returns The current statistics.
   * @example
   */
  getStats(): MinimumBoundingBoxStats {
    return { ...this.stats };
  }

  /**
   * Resets the statistics.
   * @example
   */
  resetStats(): void {
    this.stats = {
      pointsProcessed: 0,
      iterations: 0,
      angleTests: 0,
      executionTime: 0,
      success: true,
    };
  }
}
