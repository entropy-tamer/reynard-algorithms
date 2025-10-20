/**
 * @module algorithms/geometry/shapes/obb/obb-core
 * @description Main implementation of Oriented Bounding Box (OBB) with SAT collision detection.
 */

import {
  Point,
  Vector,
  OBBData,
  OBBConfig,
  OBBStats,
  OBBCollisionResult,
  OBBPointTestResult,
  OBBConstructionResult,
  OBBConstructionOptions,
  SATOptions,
  OBBTransformOptions,
  OBBTransformResult,
  OBBSerializationOptions,
  OBBSerialization,
  OBBValidationOptions,
  OBBValidationResult,
} from "./obb-types";
import { OBBUtils } from "./obb-utils";

/**
 * The OBB class provides functionality for creating, manipulating, and testing
 * oriented bounding boxes. It includes Separating Axis Theorem (SAT) collision
 * detection for accurate collision testing between OBBs.
 *
 * @example
 * ```typescript
 * const obb = new OBB();
 * const points = [
 *   { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }
 * ];
 * const result = obb.constructFromPoints(points);
 * console.log(result.obb.center); // Center of the OBB
 * ```
 */
export class OBB {
  private config: OBBConfig;
  private stats: OBBStats;

  /**
   * Creates an instance of OBB.
   * @param config - Optional configuration for OBB operations.
   * @example
   */
  constructor(config: Partial<OBBConfig> = {}) {
    this.config = {
      tolerance: 1e-10,
      validateInput: true,
      normalizeAxes: true,
      useFastApproximations: false,
      enableCaching: true,
      ...config,
    };

    this.stats = {
      collisionTests: 0,
      satTests: 0,
      projections: 0,
      executionTime: 0,
      success: true,
    };
  }

  /**
   * Constructs an OBB from a set of points using PCA.
   * @param points - Array of points to fit.
   * @param options - Construction options.
   * @returns Construction result with OBB and quality metrics.
   * @example
   */
  constructFromPoints(points: Point[], options: Partial<OBBConstructionOptions> = {}): OBBConstructionResult {
    const startTime = performance.now();
    const constructionOptions: OBBConstructionOptions = {
      method: "pca",
      optimizeForArea: true,
      optimizeForPerimeter: false,
      maxIterations: 100,
      convergenceTolerance: 1e-6,
      ...options,
    };

    try {
      // Validate input
      if (this.config.validateInput) {
        if (!Array.isArray(points) || points.length < 3) {
          throw new Error("At least 3 points are required for OBB construction");
        }
      }

      let obb: OBBData;

      switch (constructionOptions.method) {
        case "pca":
          obb = this.constructFromPointsPCA(points, constructionOptions);
          break;
        case "convex-hull":
          obb = this.constructFromPointsConvexHull(points, constructionOptions);
          break;
        case "brute-force":
          obb = this.constructFromPointsBruteForce(points, constructionOptions);
          break;
        default:
          throw new Error(`Unknown construction method: ${constructionOptions.method}`);
      }

      // Calculate quality metrics
      const area = OBBUtils.calculateOBBArea(obb);
      const aspectRatio = OBBUtils.calculateOBBAspectRatio(obb);
      const fitQuality = this.calculateFitQuality(points, obb);

      const executionTime = performance.now() - startTime;

      const stats: OBBStats = {
        collisionTests: 0,
        satTests: 0,
        projections: 0,
        executionTime,
        success: true,
      };

      return {
        obb,
        quality: {
          area,
          aspectRatio,
          fitQuality,
        },
        stats,
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        obb: this.createDefaultOBB(),
        quality: {
          area: 0,
          aspectRatio: 1,
          fitQuality: 0,
        },
        stats: {
          collisionTests: 0,
          satTests: 0,
          projections: 0,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Tests collision between two OBBs using SAT.
   * @param obb1 - First OBB.
   * @param obb2 - Second OBB.
   * @param options - SAT options.
   * @returns Collision test result.
   * @example
   */
  testCollision(obb1: OBBData, obb2: OBBData, options: Partial<SATOptions> = {}): OBBCollisionResult {
    const startTime = performance.now();
    const satOptions: SATOptions = {
      computeMTV: true,
      useEarlyExit: true,
      cacheProjections: true,
      ...options,
    };

    try {
      // Validate input
      if (this.config.validateInput) {
        const validation1 = this.validateOBB(obb1);
        const validation2 = this.validateOBB(obb2);

        if (!validation1.isValid || !validation2.isValid) {
          throw new Error("Invalid OBB provided for collision test");
        }
      }

      this.stats.collisionTests++;
      this.stats.satTests++;

      // Get all axes to test
      const axes = this.getSATAxes(obb1, obb2);
      let minOverlap = Infinity;
      let mtv: Vector | undefined;
      let penetrationAxis: Vector | undefined;

      // Test each axis
      for (const axis of axes) {
        const proj1 = OBBUtils.projectOBB(obb1, axis);
        const proj2 = OBBUtils.projectOBB(obb2, axis);
        this.stats.projections += 2;

        if (!OBBUtils.projectionsOverlap(proj1, proj2, this.config.tolerance)) {
          // Found separating axis - no collision
          const executionTime = performance.now() - startTime;
          return {
            isColliding: false,
            stats: {
              collisionTests: this.stats.collisionTests,
              satTests: this.stats.satTests,
              projections: this.stats.projections,
              executionTime,
              success: true,
            },
          };
        }

        // Calculate overlap
        const overlap = OBBUtils.projectionOverlap(proj1, proj2);
        if (overlap < minOverlap) {
          minOverlap = overlap;
          penetrationAxis = axis;

          if (satOptions.computeMTV) {
            // Calculate MTV direction
            const center1 = proj1.center;
            const center2 = proj2.center;
            const direction = center2 > center1 ? 1 : -1;
            mtv = OBBUtils.multiplyVector(axis, overlap * direction);
          }
        }

        if (satOptions.useEarlyExit && !satOptions.computeMTV) {
          // If we don't need MTV, we can exit early after finding any overlap
          break;
        }
      }

      const executionTime = performance.now() - startTime;

      return {
        isColliding: true,
        mtv,
        penetrationDepth: minOverlap,
        penetrationAxis,
        stats: {
          collisionTests: this.stats.collisionTests,
          satTests: this.stats.satTests,
          projections: this.stats.projections,
          executionTime,
          success: true,
        },
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        isColliding: false,
        stats: {
          collisionTests: this.stats.collisionTests,
          satTests: this.stats.satTests,
          projections: this.stats.projections,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Tests if a point is inside an OBB.
   * @param point - The point to test.
   * @param obb - The OBB to test against.
   * @returns Point test result.
   * @example
   */
  testPoint(point: Point, obb: OBBData): OBBPointTestResult {
    const startTime = performance.now();

    try {
      // Validate input
      if (this.config.validateInput) {
        const validation = this.validateOBB(obb);
        if (!validation.isValid) {
          throw new Error("Invalid OBB provided for point test");
        }
      }

      const isInside = OBBUtils.isPointInsideOBB(point, obb, this.config.tolerance);
      const closestPoint = OBBUtils.closestPointOnOBB(point, obb);
      const distance = OBBUtils.distanceToOBB(point, obb);

      const executionTime = performance.now() - startTime;

      return {
        isInside,
        distance,
        closestPoint,
        stats: {
          collisionTests: 0,
          satTests: 0,
          projections: 0,
          executionTime,
          success: true,
        },
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        isInside: false,
        distance: Infinity,
        closestPoint: point,
        stats: {
          collisionTests: 0,
          satTests: 0,
          projections: 0,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Transforms an OBB by applying translation, rotation, and scale.
   * @param obb - The OBB to transform.
   * @param options - Transform options.
   * @returns Transform result.
   * @example
   */
  transformOBB(obb: OBBData, options: Partial<OBBTransformOptions> = {}): OBBTransformResult {
    const startTime = performance.now();
    const transformOptions: OBBTransformOptions = {
      translation: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      maintainProperties: true,
      ...options,
    };

    try {
      // Validate input
      if (this.config.validateInput) {
        const validation = this.validateOBB(obb);
        if (!validation.isValid) {
          throw new Error("Invalid OBB provided for transformation");
        }
      }

      const transformedOBB: OBBData = { ...obb };

      // Apply translation
      if (transformOptions.translation) {
        transformedOBB.center = OBBUtils.addVectorToPoint(transformedOBB.center, transformOptions.translation);
      }

      // Apply rotation
      if (transformOptions.rotation !== undefined && transformOptions.rotation !== 0) {
        transformedOBB.axes[0] = OBBUtils.rotateVector(transformedOBB.axes[0], transformOptions.rotation);
        transformedOBB.axes[1] = OBBUtils.rotateVector(transformedOBB.axes[1], transformOptions.rotation);
        transformedOBB.rotation += transformOptions.rotation;
      }

      // Apply scale
      if (transformOptions.scale) {
        transformedOBB.halfWidths = {
          x: transformedOBB.halfWidths.x * transformOptions.scale.x,
          y: transformedOBB.halfWidths.y * transformOptions.scale.y,
        };
      }

      // Normalize axes if requested
      if (this.config.normalizeAxes && transformOptions.maintainProperties) {
        transformedOBB.axes[0] = OBBUtils.normalizeVector(transformedOBB.axes[0]);
        transformedOBB.axes[1] = OBBUtils.normalizeVector(transformedOBB.axes[1]);
      }

      const executionTime = performance.now() - startTime;

      return {
        obb: transformedOBB,
        success: true,
        stats: {
          collisionTests: 0,
          satTests: 0,
          projections: 0,
          executionTime,
          success: true,
        },
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        obb,
        success: false,
        stats: {
          collisionTests: 0,
          satTests: 0,
          projections: 0,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Validates an OBB.
   * @param obb - The OBB to validate.
   * @param options - Validation options.
   * @returns Validation result.
   * @example
   */
  validateOBB(obb: OBBData, options: Partial<OBBValidationOptions> = {}): OBBValidationResult {
    const validationOptions: OBBValidationOptions = {
      checkDimensions: true,
      checkAxes: true,
      checkOrthogonality: true,
      checkUnitAxes: true,
      minDimension: 0,
      ...options,
    };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check dimensions
    if (validationOptions.checkDimensions) {
      if (obb.halfWidths.x < validationOptions.minDimension! || obb.halfWidths.y < validationOptions.minDimension!) {
        errors.push("OBB has invalid dimensions");
      }
    }

    // Check axes
    if (validationOptions.checkAxes) {
      if (!obb.axes || obb.axes.length !== 2) {
        errors.push("OBB must have exactly 2 axes");
      } else {
        // Check unit length
        if (validationOptions.checkUnitAxes) {
          if (!OBBUtils.isUnitVector(obb.axes[0], this.config.tolerance)) {
            warnings.push("First axis is not a unit vector");
          }
          if (!OBBUtils.isUnitVector(obb.axes[1], this.config.tolerance)) {
            warnings.push("Second axis is not a unit vector");
          }
        }

        // Check orthogonality
        if (validationOptions.checkOrthogonality) {
          if (!OBBUtils.vectorsOrthogonal(obb.axes[0], obb.axes[1], this.config.tolerance)) {
            warnings.push("OBB axes are not orthogonal");
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasValidDimensions: errors.length === 0 || !errors.some(e => e.includes("dimensions")),
      hasValidAxes: errors.length === 0 || !errors.some(e => e.includes("axes")),
      hasOrthogonalAxes: !warnings.some(w => w.includes("orthogonal")),
      hasUnitAxes: !warnings.some(w => w.includes("unit vector")),
    };
  }

  /**
   * Serializes an OBB to a JSON-serializable format.
   * @param obb - The OBB to serialize.
   * @param options - Serialization options.
   * @returns Serialized OBB data.
   * @example
   */
  serialize(obb: OBBData, options: Partial<OBBSerializationOptions> = {}): OBBSerialization {
    const serializationOptions: OBBSerializationOptions = {
      precision: 6,
      includeStats: false,
      includeQuality: false,
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

    const roundVector = (vector: Vector) => ({
      x: round(vector.x),
      y: round(vector.y),
    });

    const serialized: OBBSerialization = {
      center: roundPoint(obb.center),
      halfWidths: roundVector(obb.halfWidths),
      axes: [roundVector(obb.axes[0]), roundVector(obb.axes[1])],
      rotation: round(obb.rotation),
    };

    if (serializationOptions.includeStats) {
      serialized.stats = this.stats;
    }

    if (serializationOptions.includeQuality) {
      serialized.quality = {
        area: round(OBBUtils.calculateOBBArea(obb)),
        aspectRatio: round(OBBUtils.calculateOBBAspectRatio(obb)),
        fitQuality: 0, // Would need points to calculate
      };
    }

    return serialized;
  }

  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   * @example
   */
  updateConfig(newConfig: Partial<OBBConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets the current configuration.
   * @returns The current configuration.
   * @example
   */
  getConfig(): OBBConfig {
    return { ...this.config };
  }

  /**
   * Gets the current statistics.
   * @returns The current statistics.
   * @example
   */
  getStats(): OBBStats {
    return { ...this.stats };
  }

  /**
   * Resets the statistics.
   * @example
   */
  resetStats(): void {
    this.stats = {
      collisionTests: 0,
      satTests: 0,
      projections: 0,
      executionTime: 0,
      success: true,
    };
  }

  /**
   * Constructs an OBB from points using PCA method.
   * @param points - Array of points.
   * @param options - Construction options.
   * @param _options
   * @returns Constructed OBB.
   * @example
   */
  private constructFromPointsPCA(points: Point[], _options: OBBConstructionOptions): OBBData {
    // Calculate covariance matrix
    const covariance = OBBUtils.calculateCovarianceMatrix(points);

    // Calculate principal components
    const principalComponents = OBBUtils.calculatePrincipalComponents(covariance);

    // Calculate centroid
    const centroid = {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
    };

    // Project points onto principal axes to find extents
    const projectionsX: number[] = [];
    const projectionsY: number[] = [];

    for (const point of points) {
      const localPoint = {
        x: point.x - centroid.x,
        y: point.y - centroid.y,
      };

      projectionsX.push(OBBUtils.dotProduct(localPoint, principalComponents[0]));
      projectionsY.push(OBBUtils.dotProduct(localPoint, principalComponents[1]));
    }

    const halfWidthX = (Math.max(...projectionsX) - Math.min(...projectionsX)) / 2;
    const halfWidthY = (Math.max(...projectionsY) - Math.min(...projectionsY)) / 2;

    return {
      center: centroid,
      halfWidths: { x: halfWidthX, y: halfWidthY },
      axes: [principalComponents[0], principalComponents[1]] as [Vector, Vector],
      rotation: OBBUtils.vectorToAngle(principalComponents[0]),
    };
  }

  /**
   * Constructs an OBB from points using convex hull method.
   * @param points - Array of points.
   * @param options - Construction options.
   * @returns Constructed OBB.
   * @example
   */
  private constructFromPointsConvexHull(points: Point[], options: OBBConstructionOptions): OBBData {
    // For now, fall back to PCA method
    // In a full implementation, this would compute the convex hull first
    return this.constructFromPointsPCA(points, options);
  }

  /**
   * Constructs an OBB from points using brute force method.
   * @param points - Array of points.
   * @param options - Construction options.
   * @returns Constructed OBB.
   * @example
   */
  private constructFromPointsBruteForce(points: Point[], options: OBBConstructionOptions): OBBData {
    // For now, fall back to PCA method
    // In a full implementation, this would try all possible orientations
    return this.constructFromPointsPCA(points, options);
  }

  /**
   * Gets all axes to test for SAT collision detection.
   * @param obb1 - First OBB.
   * @param obb2 - Second OBB.
   * @returns Array of axes to test.
   * @example
   */
  private getSATAxes(obb1: OBBData, obb2: OBBData): Vector[] {
    const axes: Vector[] = [];

    // Add axes from both OBBs
    axes.push(obb1.axes[0]);
    axes.push(obb1.axes[1]);
    axes.push(obb2.axes[0]);
    axes.push(obb2.axes[1]);

    return axes;
  }

  /**
   * Calculates the fit quality of an OBB for a set of points.
   * @param points - Array of points.
   * @param obb - The OBB.
   * @returns Fit quality (0-1, higher is better).
   * @example
   */
  private calculateFitQuality(points: Point[], obb: OBBData): number {
    if (points.length === 0) return 0;

    let insideCount = 0;
    for (const point of points) {
      if (OBBUtils.isPointInsideOBB(point, obb, this.config.tolerance)) {
        insideCount++;
      }
    }

    return insideCount / points.length;
  }

  /**
   * Creates a default OBB.
   * @returns Default OBB.
   * @example
   */
  private createDefaultOBB(): OBBData {
    return {
      center: { x: 0, y: 0 },
      halfWidths: { x: 1, y: 1 },
      axes: [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      rotation: 0,
    };
  }
}
