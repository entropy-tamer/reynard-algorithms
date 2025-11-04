/**
 * @module algorithms/geometry/algorithms/polygon-clipping/polygon-clipping-core
 * @description Main polygon clipping implementation combining Sutherland-Hodgman and Weiler-Atherton algorithms.
 */

import {
  Point,
  Polygon,
  ClipOperation,
  PolygonClippingConfig,
  ClipResult,
  ClippingStats,
  PolygonValidationOptions,
  PolygonValidationResult,
  PolygonSimplificationOptions,
  PolygonSerializationOptions,
  PolygonSerialization,
} from "./polygon-clipping-types";
import { SutherlandHodgmanClipper } from "./sutherland-hodgman";
import { WeilerAthertonClipper } from "./weiler-atherton";

/**
 * The PolygonClipping class provides a unified interface for polygon clipping operations.
 * It automatically selects the appropriate algorithm based on the input polygons and
 * desired operation.
 *
 * @example
 * ```typescript
 * const clipper = new PolygonClipping();
 * const subject = { vertices: [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 2 }] };
 * const clipping = { vertices: [{ x: 1, y: 0 }, { x: 3, y: 0 }, { x: 2, y: 2 }] };
 * const result = clipper.intersection(subject, clipping);
 * console.log(result.polygons.length); // Number of result polygons
 * ```
 */
export class PolygonClipping {
  private config: PolygonClippingConfig;
  private sutherlandHodgman: SutherlandHodgmanClipper;
  private weilerAtherton: WeilerAthertonClipper;

  /**
   * Creates an instance of PolygonClipping.
   * @param config - Optional configuration for the clipping operations.
   * @example
   */
  constructor(config: Partial<PolygonClippingConfig> = {}) {
    this.config = {
      tolerance: 1e-10,
      validateInput: true,
      handleSelfIntersections: false,
      preserveOrientation: true,
      removeDuplicates: true,
      simplifyResult: false,
      ...config,
    };

    this.sutherlandHodgman = new SutherlandHodgmanClipper(this.config);
    this.weilerAtherton = new WeilerAthertonClipper(this.config);
  }

  /**
   * Performs intersection clipping between two polygons.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns The result of the intersection operation.
   * @example
   */
  intersection(subject: Polygon, clipping: Polygon): ClipResult {
    return this.clip(subject, clipping, ClipOperation.INTERSECTION);
  }

  /**
   * Performs union clipping between two polygons.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns The result of the union operation.
   * @example
   */
  union(subject: Polygon, clipping: Polygon): ClipResult {
    return this.clip(subject, clipping, ClipOperation.UNION);
  }

  /**
   * Performs difference clipping (subject - clipping).
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns The result of the difference operation.
   * @example
   */
  difference(subject: Polygon, clipping: Polygon): ClipResult {
    return this.clip(subject, clipping, ClipOperation.DIFFERENCE);
  }

  /**
   * Performs XOR clipping between two polygons.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns The result of the XOR operation.
   * @example
   */
  xor(subject: Polygon, clipping: Polygon): ClipResult {
    return this.clip(subject, clipping, ClipOperation.XOR);
  }

  /**
   * Clips a polygon against a convex clipping polygon using Sutherland-Hodgman algorithm.
   * @param subject - The subject polygon.
   * @param clipping - The convex clipping polygon.
   * @returns The result of the clipping operation.
   * @example
   */
  clipConvex(subject: Polygon, clipping: Polygon): ClipResult {
    return this.sutherlandHodgman.clip(subject, clipping);
  }

  /**
   * Clips a polygon using the Weiler-Atherton algorithm.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @param operation - The clipping operation to perform.
   * @returns The result of the clipping operation.
   * @example
   */
  clipGeneral(subject: Polygon, clipping: Polygon, operation: ClipOperation = ClipOperation.INTERSECTION): ClipResult {
    return this.weilerAtherton.clip(subject, clipping, operation);
  }

  /**
   * Main clipping method that automatically selects the appropriate algorithm.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @param operation - The clipping operation to perform.
   * @returns The result of the clipping operation.
   * @example
   */
  clip(subject: Polygon, clipping: Polygon, operation: ClipOperation = ClipOperation.INTERSECTION): ClipResult {
    const startTime = performance.now();

    try {
      // Validate input
      if (this.config.validateInput) {
        const subjectValidation = this.validatePolygon(subject, "subject");
        const clippingValidation = this.validatePolygon(clipping, "clipping");

        if (!subjectValidation.isValid) {
          return this.createEmptyResult(
            startTime,
            `Subject polygon validation failed: ${subjectValidation.errors.join(", ")}`
          );
        }

        if (!clippingValidation.isValid) {
          return this.createEmptyResult(
            startTime,
            `Clipping polygon validation failed: ${clippingValidation.errors.join(", ")}`
          );
        }
      }

      // Select algorithm based on operation and polygon properties
      const algorithm = this.selectAlgorithm(subject, clipping, operation);

      let result: ClipResult;

      switch (algorithm) {
        case "sutherland-hodgman":
          result = this.sutherlandHodgman.clip(subject, clipping);
          break;
        case "weiler-atherton":
          result = this.weilerAtherton.clip(subject, clipping, operation);
          break;
        default:
          throw new Error(`Unknown algorithm: ${algorithm}`);
      }

      // Post-process result if needed
      if (this.config.simplifyResult) {
        result = this.simplifyResult(result);
      }

      return result;
    } catch (error) {
      return this.createEmptyResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }

  /**
   * Validates a polygon.
   * @param polygon - The polygon to validate.
   * @param name - The name of the polygon for error messages.
   * @param options - Validation options.
   * @returns The validation result.
   * @example
   */
  validatePolygon(
    polygon: Polygon,
    name: string,
    options: Partial<PolygonValidationOptions> = {}
  ): PolygonValidationResult {
    const validationOptions: PolygonValidationOptions = {
      checkSelfIntersections: true,
      checkDuplicates: true,
      checkMinimumVertices: true,
      minimumVertices: 3,
      checkCollinear: true,
      ...options,
    };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check basic structure
    if (!polygon || !Array.isArray(polygon.vertices)) {
      errors.push(`${name} polygon must have a vertices array`);
      return this.createValidationResult(false, errors, warnings);
    }

    if (validationOptions.checkMinimumVertices && polygon.vertices.length < validationOptions.minimumVertices!) {
      errors.push(`${name} polygon must have at least ${validationOptions.minimumVertices} vertices`);
    }

    // Check vertices
    for (let i = 0; i < polygon.vertices.length; i++) {
      const vertex = polygon.vertices[i];
      if (!vertex || typeof vertex.x !== "number" || typeof vertex.y !== "number") {
        errors.push(`${name} polygon vertex ${i} must have x and y properties`);
      } else if (!isFinite(vertex.x) || !isFinite(vertex.y)) {
        errors.push(`${name} polygon vertex ${i} must have finite coordinates`);
      }
    }

    // Check for duplicates
    if (validationOptions.checkDuplicates) {
      const hasDuplicates = this.hasDuplicateVertices(polygon.vertices);
      if (hasDuplicates) {
        warnings.push(`${name} polygon has duplicate vertices`);
      }
    }

    // Check for collinear vertices
    if (validationOptions.checkCollinear) {
      const hasCollinear = this.hasCollinearVertices(polygon.vertices);
      if (hasCollinear) {
        warnings.push(`${name} polygon has collinear vertices`);
      }
    }

    // Check for self-intersections (simplified check)
    if (validationOptions.checkSelfIntersections) {
      const hasSelfIntersections = this.hasSelfIntersections(polygon.vertices);
      if (hasSelfIntersections) {
        warnings.push(`${name} polygon has self-intersections`);
      }
    }

    return this.createValidationResult(errors.length === 0, errors, warnings);
  }

  /**
   * Simplifies a polygon by removing collinear vertices and duplicates.
   * @param polygon - The polygon to simplify.
   * @param options - Simplification options.
   * @returns The simplified polygon.
   * @example
   */
  simplifyPolygon(polygon: Polygon, options: Partial<PolygonSimplificationOptions> = {}): Polygon {
    const simplificationOptions: PolygonSimplificationOptions = {
      collinearTolerance: 1e-6,
      duplicateTolerance: 1e-10,
      removeCollinear: true,
      removeDuplicates: true,
      ensureOrientation: true,
      ...options,
    };

    let vertices = [...polygon.vertices];

    // Remove duplicates
    if (simplificationOptions.removeDuplicates) {
      vertices = this.removeDuplicateVertices(vertices, simplificationOptions.duplicateTolerance!);
    }

    // Remove collinear vertices
    if (simplificationOptions.removeCollinear) {
      vertices = this.removeCollinearVertices(vertices, simplificationOptions.collinearTolerance!);
    }

    // Ensure proper orientation
    if (simplificationOptions.ensureOrientation) {
      this.ensureCounterClockwise(vertices);
    }

    return {
      ...polygon,
      vertices,
    };
  }

  /**
   * Serializes a polygon to a JSON-serializable format.
   * @param polygon - The polygon to serialize.
   * @param options - Serialization options.
   * @returns Serialized polygon data.
   * @example
   */
  serialize(polygon: Polygon, options: Partial<PolygonSerializationOptions> = {}): PolygonSerialization {
    const serializationOptions: PolygonSerializationOptions = {
      precision: 6,
      includeValidation: false,
      includeStats: false,
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

    const result: PolygonSerialization = {
      vertices: polygon.vertices.map(roundPoint),
    };

    if (polygon.holes) {
      result.holes = polygon.holes.map(hole => hole.vertices.map(roundPoint));
    }

    if (serializationOptions.includeValidation) {
      result.validation = this.validatePolygon(polygon, "polygon");
    }

    return result;
  }

  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   * @example
   */
  updateConfig(newConfig: Partial<PolygonClippingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.sutherlandHodgman = new SutherlandHodgmanClipper(this.config);
    this.weilerAtherton = new WeilerAthertonClipper(this.config);
  }

  /**
   * Gets the current configuration.
   * @returns The current configuration.
   * @example
   */
  getConfig(): PolygonClippingConfig {
    return { ...this.config };
  }

  /**
   * Selects the appropriate algorithm based on the input polygons and operation.
   * @param subject - The subject polygon.
   * @param _subject
   * @param clipping - The clipping polygon.
   * @param operation - The clipping operation.
   * @returns The selected algorithm name.
   * @example
   */
  private selectAlgorithm(
    _subject: Polygon,
    clipping: Polygon,
    operation: ClipOperation
  ): "sutherland-hodgman" | "weiler-atherton" {
    // Sutherland-Hodgman is only suitable for intersection with convex clipping polygon
    if (operation === ClipOperation.INTERSECTION && this.isConvexPolygon(clipping)) {
      return "sutherland-hodgman";
    }

    // For all other cases, use Weiler-Atherton
    return "weiler-atherton";
  }

  /**
   * Checks if a polygon is convex.
   * @param polygon - The polygon to check.
   * @returns True if the polygon is convex.
   * @example
   */
  private isConvexPolygon(polygon: Polygon): boolean {
    const vertices = polygon.vertices;
    if (vertices.length < 3) return false;

    let sign = 0;
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % n];
      const p3 = vertices[(i + 2) % n];

      const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);

      if (Math.abs(crossProduct) > this.config.tolerance!) {
        const currentSign = crossProduct > 0 ? 1 : -1;

        if (sign === 0) {
          sign = currentSign;
        } else if (sign !== currentSign) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Checks if a polygon has duplicate vertices.
   * @param vertices - The vertices to check.
   * @returns True if there are duplicate vertices.
   * @example
   */
  private hasDuplicateVertices(vertices: Point[]): boolean {
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        if (this.pointsEqual(vertices[i], vertices[j])) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Checks if a polygon has collinear vertices.
   * @param vertices - The vertices to check.
   * @returns True if there are collinear vertices.
   * @example
   */
  private hasCollinearVertices(vertices: Point[]): boolean {
    if (vertices.length < 3) return false;

    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      const p3 = vertices[(i + 2) % vertices.length];

      if (this.areCollinear(p1, p2, p3)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if a polygon has self-intersections (simplified check).
   * @param vertices - The vertices to check.
   * @returns True if there are self-intersections.
   * @example
   */
  private hasSelfIntersections(vertices: Point[]): boolean {
    if (vertices.length < 4) return false;

    // Check each edge against every other non-adjacent edge
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];

      for (let j = i + 2; j < vertices.length; j++) {
        if (j === vertices.length - 1 && i === 0) continue; // Skip adjacent edges

        const p3 = vertices[j];
        const p4 = vertices[(j + 1) % vertices.length];

        if (this.lineSegmentsIntersect(p1, p2, p3, p4)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Checks if two line segments intersect.
   * @param p1 - Start of first segment.
   * @param p2 - End of first segment.
   * @param p3 - Start of second segment.
   * @param p4 - End of second segment.
   * @returns True if the segments intersect.
   * @example
   */
  private lineSegmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);

    if (Math.abs(denom) < this.config.tolerance!) {
      return false; // Lines are parallel
    }

    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  /**
   * Removes duplicate vertices from a polygon.
   * @param vertices - The vertices to process.
   * @param tolerance - Tolerance for duplicate detection.
   * @returns Vertices with duplicates removed.
   * @example
   */
  private removeDuplicateVertices(vertices: Point[], tolerance: number): Point[] {
    if (vertices.length <= 1) return vertices;

    const result: Point[] = [vertices[0]];

    for (let i = 1; i < vertices.length; i++) {
      const current = vertices[i];
      const previous = result[result.length - 1];

      if (!this.pointsEqualWithTolerance(current, previous, tolerance)) {
        result.push(current);
      }
    }

    // Check if first and last vertices are the same
    if (result.length > 1 && this.pointsEqualWithTolerance(result[0], result[result.length - 1], tolerance)) {
      result.pop();
    }

    return result;
  }

  /**
   * Removes collinear vertices from a polygon.
   * @param vertices - The vertices to process.
   * @param tolerance - Tolerance for collinearity detection.
   * @returns Vertices with collinear vertices removed.
   * @example
   */
  private removeCollinearVertices(vertices: Point[], tolerance: number): Point[] {
    if (vertices.length < 3) return vertices;

    const result: Point[] = [];
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      const prev = vertices[(i - 1 + n) % n];
      const current = vertices[i];
      const next = vertices[(i + 1) % n];

      // Check if the three points are collinear
      if (!this.areCollinearWithTolerance(prev, current, next, tolerance)) {
        result.push(current);
      }
    }

    return result.length >= 3 ? result : vertices;
  }

  /**
   * Ensures a polygon has counter-clockwise orientation.
   * @param vertices - The vertices to reorient.
   * @example
   */
  private ensureCounterClockwise(vertices: Point[]): void {
    if (vertices.length < 3) return;

    // Calculate signed area
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
      const current = vertices[i];
      const next = vertices[(i + 1) % vertices.length];
      area += (next.x - current.x) * (next.y + current.y);
    }

    // If area is positive, polygon is clockwise, so reverse it
    if (area > 0) {
      vertices.reverse();
    }
  }

  /**
   * Simplifies the result of a clipping operation.
   * @param result - The clipping result to simplify.
   * @returns The simplified result.
   * @example
   */
  private simplifyResult(result: ClipResult): ClipResult {
    const simplifiedPolygons = result.polygons.map(polygon => this.simplifyPolygon(polygon));

    return {
      ...result,
      polygons: simplifiedPolygons,
    };
  }

  /**
   * Checks if three points are collinear within tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @param p3 - Third point.
   * @param tolerance - Tolerance for collinearity.
   * @returns True if the points are collinear.
   * @example
   */
  private areCollinearWithTolerance(p1: Point, p2: Point, p3: Point, tolerance: number): boolean {
    const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    return Math.abs(crossProduct) < tolerance;
  }

  /**
   * Checks if two points are equal within tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @param tolerance - Tolerance for equality.
   * @returns True if the points are equal.
   * @example
   */
  private pointsEqualWithTolerance(p1: Point, p2: Point, tolerance: number): boolean {
    return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
  }

  /**
   * Checks if two points are equal within default tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @returns True if the points are equal.
   * @example
   */
  private pointsEqual(p1: Point, p2: Point): boolean {
    return this.pointsEqualWithTolerance(p1, p2, this.config.tolerance!);
  }

  /**
   * Checks if three points are collinear within default tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @param p3 - Third point.
   * @returns True if the points are collinear.
   * @example
   */
  private areCollinear(p1: Point, p2: Point, p3: Point): boolean {
    return this.areCollinearWithTolerance(p1, p2, p3, this.config.tolerance!);
  }

  /**
   * Creates a validation result object.
   * @param isValid - Whether the polygon is valid.
   * @param errors - Array of error messages.
   * @param warnings - Array of warning messages.
   * @returns The validation result.
   * @example
   */
  private createValidationResult(isValid: boolean, errors: string[], warnings: string[]): PolygonValidationResult {
    return {
      isValid,
      errors,
      warnings,
      hasSelfIntersections: warnings.some(w => w.includes("self-intersections")),
      hasDuplicates: warnings.some(w => w.includes("duplicate")),
      hasCollinear: warnings.some(w => w.includes("collinear")),
    };
  }

  /**
   * Creates an empty result for error cases.
   * @param startTime - Start time for execution time calculation.
   * @param error - Error message.
   * @returns Empty clip result.
   * @example
   */
  private createEmptyResult(startTime: number, error: string): ClipResult {
    const executionTime = performance.now() - startTime;
    const stats: ClippingStats = {
      subjectVertices: 0,
      clippingVertices: 0,
      resultVertices: 0,
      intersectionPoints: 0,
      executionTime,
      success: false,
      error,
      algorithm: "sutherland-hodgman", // Default
    };

    return {
      polygons: [],
      stats,
      isEmpty: true,
      isMultiple: false,
    };
  }
}

// Re-export the individual clipper classes
export { SutherlandHodgmanClipper } from "./sutherland-hodgman";
export { WeilerAthertonClipper } from "./weiler-atherton";
