/**
 * @module algorithms/geometry/shapes/obb/utils
 * @description Utility functions for Oriented Bounding Box (OBB) operations.
 */

import { Point, Vector, OBBData, OBBProjection } from "./obb-types";

/**
 * Utility functions for OBB operations.
 */
export class OBBUtils {
  /**
   * Creates a unit vector from an angle.
   * @param angle - Angle in radians.
   * @returns Unit vector.
   * @example
   */
  static angleToVector(angle: number): Vector {
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }

  /**
   * Calculates the angle of a vector.
   * @param vector - The vector.
   * @returns Angle in radians.
   * @example
   */
  static vectorToAngle(vector: Vector): number {
    return Math.atan2(vector.y, vector.x);
  }

  /**
   * Normalizes a vector to unit length.
   * @param vector - The vector to normalize.
   * @returns Normalized vector.
   * @example
   */
  static normalizeVector(vector: Vector): Vector {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length < 1e-10) {
      return { x: 0, y: 0 };
    }
    return {
      x: vector.x / length,
      y: vector.y / length,
    };
  }

  /**
   * Calculates the dot product of two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Dot product.
   * @example
   */
  static dotProduct(a: Vector, b: Vector): number {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * Calculates the cross product of two vectors (2D).
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Cross product (scalar in 2D).
   * @example
   */
  static crossProduct(a: Vector, b: Vector): number {
    return a.x * b.y - a.y * b.x;
  }

  /**
   * Calculates the length of a vector.
   * @param vector - The vector.
   * @returns Vector length.
   * @example
   */
  static vectorLength(vector: Vector): number {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }

  /**
   * Calculates the squared length of a vector.
   * @param vector - The vector.
   * @returns Squared vector length.
   * @example
   */
  static vectorLengthSquared(vector: Vector): number {
    return vector.x * vector.x + vector.y * vector.y;
  }

  /**
   * Calculates the distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Distance.
   * @example
   */
  static distance(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates the squared distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Squared distance.
   * @example
   */
  static distanceSquared(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  }

  /**
   * Adds two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Sum vector.
   * @example
   */
  static addVectors(a: Vector, b: Vector): Vector {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
    };
  }

  /**
   * Subtracts two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Difference vector.
   * @example
   */
  static subtractVectors(a: Vector, b: Vector): Vector {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
    };
  }

  /**
   * Multiplies a vector by a scalar.
   * @param vector - The vector.
   * @param scalar - The scalar.
   * @returns Scaled vector.
   * @example
   */
  static multiplyVector(vector: Vector, scalar: number): Vector {
    return {
      x: vector.x * scalar,
      y: vector.y * scalar,
    };
  }

  /**
   * Rotates a vector by an angle.
   * @param vector - The vector to rotate.
   * @param angle - Rotation angle in radians.
   * @returns Rotated vector.
   * @example
   */
  static rotateVector(vector: Vector, angle: number): Vector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos,
    };
  }

  /**
   * Calculates the perpendicular vector (90-degree rotation).
   * @param vector - The vector.
   * @returns Perpendicular vector.
   * @example
   */
  static perpendicularVector(vector: Vector): Vector {
    return {
      x: -vector.y,
      y: vector.x,
    };
  }

  /**
   * Projects a point onto an axis.
   * @param point - The point to project.
   * @param axis - The axis to project onto.
   * @returns Projection value.
   * @example
   */
  static projectPoint(point: Point, axis: Vector): number {
    return point.x * axis.x + point.y * axis.y;
  }

  /**
   * Projects an OBB onto an axis.
   * @param obb - The OBB to project.
   * @param axis - The axis to project onto.
   * @returns Projection result.
   * @example
   */
  static projectOBB(obb: OBBData, axis: Vector): OBBProjection {
    const centerProjection = this.projectPoint(obb.center, axis);

    // Project the half-widths along the axis
    const halfWidthProjection =
      Math.abs(this.dotProduct(obb.axes[0], axis)) * obb.halfWidths.x +
      Math.abs(this.dotProduct(obb.axes[1], axis)) * obb.halfWidths.y;

    return {
      min: centerProjection - halfWidthProjection,
      max: centerProjection + halfWidthProjection,
      center: centerProjection,
      extent: halfWidthProjection,
    };
  }

  /**
   * Checks if two projections overlap.
   * @param proj1 - First projection.
   * @param proj2 - Second projection.
   * @param tolerance - Tolerance for overlap detection.
   * @returns True if projections overlap.
   * @example
   */
  static projectionsOverlap(proj1: OBBProjection, proj2: OBBProjection, tolerance: number = 1e-10): boolean {
    return proj1.max >= proj2.min - tolerance && proj2.max >= proj1.min - tolerance;
  }

  /**
   * Calculates the overlap between two projections.
   * @param proj1 - First projection.
   * @param proj2 - Second projection.
   * @returns Overlap amount (negative if no overlap).
   * @example
   */
  static projectionOverlap(proj1: OBBProjection, proj2: OBBProjection): number {
    const overlap = Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
    return Math.max(0, overlap);
  }

  /**
   * Gets the vertices of an OBB.
   * @param obb - The OBB.
   * @returns Array of four vertices.
   * @example
   */
  static getOBBVertices(obb: OBBData): Point[] {
    const vertices: Point[] = [];

    // Calculate the four corners
    const corners = [
      { x: -obb.halfWidths.x, y: -obb.halfWidths.y },
      { x: obb.halfWidths.x, y: -obb.halfWidths.y },
      { x: obb.halfWidths.x, y: obb.halfWidths.y },
      { x: -obb.halfWidths.x, y: obb.halfWidths.y },
    ];

    for (const corner of corners) {
      // Transform corner to world space
      const worldCorner = {
        x: obb.center.x + corner.x * obb.axes[0].x + corner.y * obb.axes[1].x,
        y: obb.center.y + corner.x * obb.axes[0].y + corner.y * obb.axes[1].y,
      };
      vertices.push(worldCorner);
    }

    return vertices;
  }

  /**
   * Calculates the area of an OBB.
   * @param obb - The OBB.
   * @returns Area.
   * @example
   */
  static calculateOBBArea(obb: OBBData): number {
    return 4 * obb.halfWidths.x * obb.halfWidths.y;
  }

  /**
   * Calculates the perimeter of an OBB.
   * @param obb - The OBB.
   * @returns Perimeter.
   * @example
   */
  static calculateOBBPerimeter(obb: OBBData): number {
    return 4 * (obb.halfWidths.x + obb.halfWidths.y);
  }

  /**
   * Calculates the aspect ratio of an OBB.
   * @param obb - The OBB.
   * @returns Aspect ratio (width/height).
   * @example
   */
  static calculateOBBAspectRatio(obb: OBBData): number {
    const width = 2 * obb.halfWidths.x;
    const height = 2 * obb.halfWidths.y;
    return Math.max(width, height) / Math.min(width, height);
  }

  /**
   * Checks if a point is inside an OBB.
   * @param point - The point to test.
   * @param obb - The OBB.
   * @param tolerance - Tolerance for boundary detection.
   * @returns True if point is inside.
   * @example
   */
  static isPointInsideOBB(point: Point, obb: OBBData, tolerance: number = 1e-10): boolean {
    // Transform point to OBB local space
    const localPoint = {
      x: point.x - obb.center.x,
      y: point.y - obb.center.y,
    };

    // Project onto OBB axes
    const projectionX = Math.abs(this.dotProduct(localPoint, obb.axes[0]));
    const projectionY = Math.abs(this.dotProduct(localPoint, obb.axes[1]));

    return projectionX <= obb.halfWidths.x + tolerance && projectionY <= obb.halfWidths.y + tolerance;
  }

  /**
   * Finds the closest point on an OBB to a given point.
   * @param point - The reference point.
   * @param obb - The OBB.
   * @returns Closest point on OBB surface.
   * @example
   */
  static closestPointOnOBB(point: Point, obb: OBBData): Point {
    // Transform point to OBB local space
    const localPoint = {
      x: point.x - obb.center.x,
      y: point.y - obb.center.y,
    };

    // Project onto OBB axes
    const projectionX = this.dotProduct(localPoint, obb.axes[0]);
    const projectionY = this.dotProduct(localPoint, obb.axes[1]);

    // Clamp to OBB bounds
    const clampedX = Math.max(-obb.halfWidths.x, Math.min(obb.halfWidths.x, projectionX));
    const clampedY = Math.max(-obb.halfWidths.y, Math.min(obb.halfWidths.y, projectionY));

    // Transform back to world space
    return {
      x: obb.center.x + clampedX * obb.axes[0].x + clampedY * obb.axes[1].x,
      y: obb.center.y + clampedX * obb.axes[0].y + clampedY * obb.axes[1].y,
    };
  }

  /**
   * Calculates the distance from a point to an OBB.
   * @param point - The reference point.
   * @param obb - The OBB.
   * @returns Distance (negative if inside).
   * @example
   */
  static distanceToOBB(point: Point, obb: OBBData): number {
    const closestPoint = this.closestPointOnOBB(point, obb);
    const distance = this.distance(point, closestPoint);

    // If point is inside OBB, return negative distance
    if (this.isPointInsideOBB(point, obb)) {
      return -distance;
    }

    return distance;
  }

  /**
   * Calculates the covariance matrix of a set of points.
   * @param points - Array of points.
   * @returns Covariance matrix as 2x2 array.
   * @example
   */
  static calculateCovarianceMatrix(points: Point[]): number[][] {
    if (points.length === 0) {
      return [
        [0, 0],
        [0, 0],
      ];
    }

    // Calculate centroid
    const centroid = {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
    };

    // Calculate covariance matrix
    let covXX = 0,
      covXY = 0,
      covYY = 0;

    for (const point of points) {
      const dx = point.x - centroid.x;
      const dy = point.y - centroid.y;
      covXX += dx * dx;
      covXY += dx * dy;
      covYY += dy * dy;
    }

    const n = points.length;
    return [
      [covXX / n, covXY / n],
      [covXY / n, covYY / n],
    ];
  }

  /**
   * Calculates the principal components of a covariance matrix.
   * @param covariance - Covariance matrix.
   * @returns Principal components (eigenvectors).
   * @example
   */
  static calculatePrincipalComponents(covariance: number[][]): Vector[] {
    const [[a, b], [c, d]] = covariance;

    // Calculate eigenvalues
    const trace = a + d;
    const det = a * d - b * c;
    const discriminant = trace * trace - 4 * det;

    if (discriminant < 0) {
      // No real eigenvalues, return identity
      return [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ];
    }

    const sqrtDisc = Math.sqrt(discriminant);
    const lambda1 = (trace + sqrtDisc) / 2;

    // Calculate eigenvectors
    const eigenvectors: Vector[] = [];

    // First eigenvector
    if (Math.abs(b) > 1e-10) {
      eigenvectors.push(this.normalizeVector({ x: lambda1 - d, y: b }));
    } else if (Math.abs(a - lambda1) > 1e-10) {
      eigenvectors.push(this.normalizeVector({ x: b, y: lambda1 - a }));
    } else {
      eigenvectors.push({ x: 1, y: 0 });
    }

    // Second eigenvector (orthogonal to first)
    eigenvectors.push(this.perpendicularVector(eigenvectors[0]));

    return eigenvectors;
  }

  /**
   * Checks if two vectors are approximately equal.
   * @param a - First vector.
   * @param b - Second vector.
   * @param tolerance - Tolerance for comparison.
   * @returns True if vectors are equal.
   * @example
   */
  static vectorsEqual(a: Vector, b: Vector, tolerance: number = 1e-10): boolean {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }

  /**
   * Checks if two points are approximately equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Tolerance for comparison.
   * @returns True if points are equal.
   * @example
   */
  static pointsEqual(a: Point, b: Point, tolerance: number = 1e-10): boolean {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }

  /**
   * Calculates the angle between two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Angle in radians.
   * @example
   */
  static angleBetweenVectors(a: Vector, b: Vector): number {
    const dot = this.dotProduct(a, b);
    const cross = this.crossProduct(a, b);
    return Math.atan2(cross, dot);
  }

  /**
   * Checks if two vectors are orthogonal.
   * @param a - First vector.
   * @param b - Second vector.
   * @param tolerance - Tolerance for orthogonality check.
   * @returns True if vectors are orthogonal.
   * @example
   */
  static vectorsOrthogonal(a: Vector, b: Vector, tolerance: number = 1e-10): boolean {
    return Math.abs(this.dotProduct(a, b)) < tolerance;
  }

  /**
   * Checks if a vector is a unit vector.
   * @param vector - The vector to check.
   * @param tolerance - Tolerance for unit length check.
   * @returns True if vector is unit length.
   * @example
   */
  static isUnitVector(vector: Vector, tolerance: number = 1e-10): boolean {
    const length = this.vectorLength(vector);
    return Math.abs(length - 1) < tolerance;
  }

  /**
   * Creates a vector from two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Vector from first point to second point.
   * @example
   */
  static vectorFromPoints(from: Point, to: Point): Vector {
    return {
      x: to.x - from.x,
      y: to.y - from.y,
    };
  }

  /**
   * Adds a vector to a point.
   * @param point - The point.
   * @param vector - The vector to add.
   * @returns New point.
   * @example
   */
  static addVectorToPoint(point: Point, vector: Vector): Point {
    return {
      x: point.x + vector.x,
      y: point.y + vector.y,
    };
  }

  /**
   * Subtracts a vector from a point.
   * @param point - The point.
   * @param vector - The vector to subtract.
   * @returns New point.
   * @example
   */
  static subtractVectorFromPoint(point: Point, vector: Vector): Point {
    return {
      x: point.x - vector.x,
      y: point.y - vector.y,
    };
  }
}
