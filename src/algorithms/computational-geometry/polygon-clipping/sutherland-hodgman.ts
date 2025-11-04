/**
 * @module algorithms/geometry/algorithms/polygon-clipping/sutherland-hodgman
 * @description Implements the Sutherland-Hodgman polygon clipping algorithm.
 */

import {
  Point,
  Vector,
  Polygon,
  ClippingPlane,
  SutherlandHodgmanOptions,
  ClipResult,
  ClippingStats,
} from "./polygon-clipping-types";

/**
 * The Sutherland-Hodgman algorithm for clipping a polygon against a convex clipping polygon.
 * This algorithm works by iteratively clipping the subject polygon against each edge
 * of the clipping polygon.
 */
export class SutherlandHodgmanClipper {
  private config: SutherlandHodgmanOptions;

  /**
   *
   * @param config
   * @example
   */
  constructor(config: Partial<SutherlandHodgmanOptions> = {}) {
    this.config = {
      tolerance: 1e-10,
      validateInput: true,
      handleSelfIntersections: false,
      preserveOrientation: true,
      removeDuplicates: true,
      simplifyResult: false,
      useConvexClipping: true,
      ...config,
    };
  }

  /**
   * Clips a subject polygon against a convex clipping polygon.
   * @param subject - The polygon to be clipped.
   * @param clippingPolygon - The convex polygon to clip against.
   * @returns The result of the clipping operation.
   * @example
   */
  clip(subject: Polygon, clippingPolygon: Polygon): ClipResult {
    const startTime = performance.now();

    try {
      // Validate input
      if (this.config.validateInput) {
        this.validatePolygon(subject, "subject");
        this.validatePolygon(clippingPolygon, "clipping");
        this.validateConvexPolygon(clippingPolygon);
      }

      // Handle edge cases
      if (subject.vertices.length < 3) {
        return this.createEmptyResult(startTime, "Subject polygon must have at least 3 vertices");
      }

      if (clippingPolygon.vertices.length < 3) {
        return this.createEmptyResult(startTime, "Clipping polygon must have at least 3 vertices");
      }

      // Convert clipping polygon to clipping planes
      const clippingPlanes = this.polygonToClippingPlanes(clippingPolygon);

      // Apply Sutherland-Hodgman algorithm
      let resultVertices = subject.vertices;

      for (const plane of clippingPlanes) {
        resultVertices = this.clipAgainstPlane(resultVertices, plane);

        // Early exit if no vertices remain
        if (resultVertices.length === 0) {
          break;
        }
      }

      // Post-process the result
      if (this.config.removeDuplicates) {
        resultVertices = this.removeDuplicateVertices(resultVertices);
      }

      if (this.config.simplifyResult) {
        resultVertices = this.simplifyPolygon(resultVertices);
      }

      const executionTime = performance.now() - startTime;

      const stats: ClippingStats = {
        subjectVertices: subject.vertices.length,
        clippingVertices: clippingPolygon.vertices.length,
        resultVertices: resultVertices.length,
        intersectionPoints: 0, // Will be calculated during clipping
        executionTime,
        success: true,
        algorithm: "sutherland-hodgman",
      };

      return {
        polygons: resultVertices.length >= 3 ? [{ vertices: resultVertices }] : [],
        stats,
        isEmpty: resultVertices.length < 3,
        isMultiple: false,
      };
    } catch (error) {
      return this.createEmptyResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }

  /**
   * Clips a polygon against a single clipping plane.
   * @param vertices - The vertices of the polygon to clip.
   * @param plane - The clipping plane.
   * @returns The vertices of the clipped polygon.
   * @example
   */
  private clipAgainstPlane(vertices: Point[], plane: ClippingPlane): Point[] {
    if (vertices.length < 3) return [];

    const clippedVertices: Point[] = [];
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      const current = vertices[i];
      const next = vertices[(i + 1) % n];

      const currentInside = this.isPointInsidePlane(current, plane);
      const nextInside = this.isPointInsidePlane(next, plane);

      if (currentInside && nextInside) {
        // Both vertices inside - add the next vertex
        clippedVertices.push(next);
      } else if (currentInside && !nextInside) {
        // Current inside, next outside - add intersection point
        const intersection = this.linePlaneIntersection(current, next, plane);
        if (intersection) {
          clippedVertices.push(intersection);
        }
      } else if (!currentInside && nextInside) {
        // Current outside, next inside - add intersection point and next vertex
        const intersection = this.linePlaneIntersection(current, next, plane);
        if (intersection) {
          clippedVertices.push(intersection);
        }
        clippedVertices.push(next);
      }
      // If both vertices are outside, add nothing
    }

    return clippedVertices;
  }

  /**
   * Converts a convex polygon to an array of clipping planes.
   * @param polygon - The convex polygon.
   * @returns Array of clipping planes.
   * @example
   */
  private polygonToClippingPlanes(polygon: Polygon): ClippingPlane[] {
    const planes: ClippingPlane[] = [];
    const vertices = polygon.vertices;

    for (let i = 0; i < vertices.length; i++) {
      const current = vertices[i];
      const next = vertices[(i + 1) % vertices.length];

      // Calculate edge vector
      const edgeVector: Vector = {
        x: next.x - current.x,
        y: next.y - current.y,
      };

      // Calculate normal vector (pointing inward)
      const normal: Vector = {
        x: -edgeVector.y,
        y: edgeVector.x,
      };

      // Normalize the normal vector
      const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
      if (length > this.config.tolerance!) {
        normal.x /= length;
        normal.y /= length;
      }

      planes.push({
        point: current,
        normal,
      });
    }

    return planes;
  }

  /**
   * Checks if a point is inside a clipping plane.
   * @param point - The point to check.
   * @param plane - The clipping plane.
   * @returns True if the point is inside the plane.
   * @example
   */
  private isPointInsidePlane(point: Point, plane: ClippingPlane): boolean {
    const dx = point.x - plane.point.x;
    const dy = point.y - plane.point.y;

    // Dot product with normal vector
    const dotProduct = dx * plane.normal.x + dy * plane.normal.y;

    return dotProduct >= -this.config.tolerance!;
  }

  /**
   * Finds the intersection point of a line segment with a clipping plane.
   * @param start - Start point of the line segment.
   * @param end - End point of the line segment.
   * @param plane - The clipping plane.
   * @returns The intersection point, or null if no intersection.
   * @example
   */
  private linePlaneIntersection(start: Point, end: Point, plane: ClippingPlane): Point | null {
    const lineVector: Vector = {
      x: end.x - start.x,
      y: end.y - start.y,
    };

    const planeVector: Vector = {
      x: plane.point.x - start.x,
      y: plane.point.y - start.y,
    };

    // Calculate denominator (dot product of line vector and plane normal)
    const denominator = lineVector.x * plane.normal.x + lineVector.y * plane.normal.y;

    // Check if line is parallel to plane
    if (Math.abs(denominator) < this.config.tolerance!) {
      return null;
    }

    // Calculate parameter t
    const numerator = planeVector.x * plane.normal.x + planeVector.y * plane.normal.y;
    const t = numerator / denominator;

    // Check if intersection is within the line segment
    if (t < -this.config.tolerance! || t > 1 + this.config.tolerance!) {
      return null;
    }

    // Calculate intersection point
    return {
      x: start.x + t * lineVector.x,
      y: start.y + t * lineVector.y,
    };
  }

  /**
   * Removes duplicate vertices from a polygon.
   * @param vertices - The vertices to process.
   * @returns Vertices with duplicates removed.
   * @example
   */
  private removeDuplicateVertices(vertices: Point[]): Point[] {
    if (vertices.length <= 1) return vertices;

    const result: Point[] = [vertices[0]];

    for (let i = 1; i < vertices.length; i++) {
      const current = vertices[i];
      const previous = result[result.length - 1];

      if (!this.pointsEqual(current, previous)) {
        result.push(current);
      }
    }

    // Check if first and last vertices are the same
    if (result.length > 1 && this.pointsEqual(result[0], result[result.length - 1])) {
      result.pop();
    }

    return result;
  }

  /**
   * Simplifies a polygon by removing collinear vertices.
   * @param vertices - The vertices to simplify.
   * @returns Simplified vertices.
   * @example
   */
  private simplifyPolygon(vertices: Point[]): Point[] {
    if (vertices.length < 3) return vertices;

    const result: Point[] = [];
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      const prev = vertices[(i - 1 + n) % n];
      const current = vertices[i];
      const next = vertices[(i + 1) % n];

      // Check if the three points are collinear
      if (!this.areCollinear(prev, current, next)) {
        result.push(current);
      }
    }

    return result.length >= 3 ? result : vertices;
  }

  /**
   * Checks if three points are collinear.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @param p3 - Third point.
   * @returns True if the points are collinear.
   * @example
   */
  private areCollinear(p1: Point, p2: Point, p3: Point): boolean {
    const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    return Math.abs(crossProduct) < this.config.tolerance!;
  }

  /**
   * Checks if two points are equal within tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @returns True if the points are equal.
   * @example
   */
  private pointsEqual(p1: Point, p2: Point): boolean {
    return Math.abs(p1.x - p2.x) < this.config.tolerance! && Math.abs(p1.y - p2.y) < this.config.tolerance!;
  }

  /**
   * Validates a polygon.
   * @param polygon - The polygon to validate.
   * @param name - The name of the polygon for error messages.
   * @throws Error if validation fails.
   * @example
   */
  private validatePolygon(polygon: Polygon, name: string): void {
    if (!polygon || !Array.isArray(polygon.vertices)) {
      throw new Error(`${name} polygon must have a vertices array`);
    }

    if (polygon.vertices.length < 3) {
      throw new Error(`${name} polygon must have at least 3 vertices`);
    }

    for (let i = 0; i < polygon.vertices.length; i++) {
      const vertex = polygon.vertices[i];
      if (!vertex || typeof vertex.x !== "number" || typeof vertex.y !== "number") {
        throw new Error(`${name} polygon vertex ${i} must have x and y properties`);
      }

      if (!isFinite(vertex.x) || !isFinite(vertex.y)) {
        throw new Error(`${name} polygon vertex ${i} must have finite coordinates`);
      }
    }
  }

  /**
   * Validates that a polygon is convex.
   * @param polygon - The polygon to validate.
   * @throws Error if the polygon is not convex.
   * @example
   */
  private validateConvexPolygon(polygon: Polygon): void {
    const vertices = polygon.vertices;
    if (vertices.length < 3) return;

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
          throw new Error("Clipping polygon must be convex");
        }
      }
    }
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
      algorithm: "sutherland-hodgman",
    };

    return {
      polygons: [],
      stats,
      isEmpty: true,
      isMultiple: false,
    };
  }
}
