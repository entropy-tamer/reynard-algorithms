/**
 * @module algorithms/geometry/algorithms/minimum-bounding-box/minimum-bounding-box-utils
 * @description Utility functions for Minimum Bounding Box with rotating calipers algorithm.
 */

import type {
  Point,
  Vector,
  Rectangle,
  MinimumBoundingBoxConfig,
  RotatingCalipersOptions,
} from "./minimum-bounding-box-types";

/**
 * Utility functions for minimum bounding box computations.
 */
export class MinimumBoundingBoxUtils {
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
   * Calculates the cross product of two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Cross product (scalar in 2D).
   * @example
   */
  static crossProduct(a: Vector, b: Vector): number {
    return a.x * b.y - a.y * b.x;
  }

  /**
   * Calculates the magnitude of a vector.
   * @param v - Vector.
   * @returns Magnitude.
   * @example
   */
  static magnitude(v: Vector): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  /**
   * Normalizes a vector to unit length.
   * @param v - Vector to normalize.
   * @returns Normalized vector.
   * @example
   */
  static normalize(v: Vector): Vector {
    const mag = this.magnitude(v);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: v.x / mag, y: v.y / mag };
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
   * Creates a vector from two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Vector from first point to second point.
   * @example
   */
  static vectorFromPoints(from: Point, to: Point): Vector {
    return { x: to.x - from.x, y: to.y - from.y };
  }

  /**
   * Adds a vector to a point.
   * @param point - Point.
   * @param vector - Vector to add.
   * @returns New point.
   * @example
   */
  static addVectorToPoint(point: Point, vector: Vector): Point {
    return { x: point.x + vector.x, y: point.y + vector.y };
  }

  /**
   * Multiplies a vector by a scalar.
   * @param vector - Vector.
   * @param scalar - Scalar multiplier.
   * @returns Scaled vector.
   * @example
   */
  static multiplyVector(vector: Vector, scalar: number): Vector {
    return { x: vector.x * scalar, y: vector.y * scalar };
  }

  /**
   * Rotates a vector by an angle.
   * @param vector - Vector to rotate.
   * @param angle - Angle in radians.
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
   * Converts an angle to a unit vector.
   * @param angle - Angle in radians.
   * @returns Unit vector.
   * @example
   */
  static angleToVector(angle: number): Vector {
    return { x: Math.cos(angle), y: Math.sin(angle) };
  }

  /**
   * Converts a vector to an angle.
   * @param vector - Vector.
   * @returns Angle in radians.
   * @example
   */
  static vectorToAngle(vector: Vector): number {
    return Math.atan2(vector.y, vector.x);
  }

  /**
   * Calculates the area of a rectangle.
   * @param rectangle - Rectangle.
   * @returns Area.
   * @example
   */
  static calculateArea(rectangle: Rectangle): number {
    return rectangle.width * rectangle.height;
  }

  /**
   * Calculates the perimeter of a rectangle.
   * @param rectangle - Rectangle.
   * @returns Perimeter.
   * @example
   */
  static calculatePerimeter(rectangle: Rectangle): number {
    return 2 * (rectangle.width + rectangle.height);
  }

  /**
   * Calculates the aspect ratio of a rectangle.
   * @param rectangle - Rectangle.
   * @returns Aspect ratio (width/height).
   * @example
   */
  static calculateAspectRatio(rectangle: Rectangle): number {
    return rectangle.height === 0 ? Infinity : rectangle.width / rectangle.height;
  }

  /**
   * Calculates the bounding box of a set of points.
   * @param points - Array of points.
   * @returns Bounding box rectangle.
   * @example
   */
  static calculateBoundingBox(points: Point[]): Rectangle {
    if (points.length === 0) {
      return { center: { x: 0, y: 0 }, width: 0, height: 0, rotation: 0 };
    }

    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

    return { center, width, height, rotation: 0 };
  }

  /**
   * Calculates the convex hull of a set of points using Graham scan.
   * @param points - Array of points.
   * @returns Array of points forming the convex hull.
   * @example
   */
  static calculateConvexHull(points: Point[]): Point[] {
    if (points.length < 3) return points;

    // Find the bottom-most point (and leftmost in case of tie)
    let bottomMost = 0;
    for (let i = 1; i < points.length; i++) {
      if (
        points[i].y < points[bottomMost].y ||
        (points[i].y === points[bottomMost].y && points[i].x < points[bottomMost].x)
      ) {
        bottomMost = i;
      }
    }

    // Swap bottom-most point to beginning
    [points[0], points[bottomMost]] = [points[bottomMost], points[0]];

    // Sort points by polar angle with respect to bottom-most point
    const pivot = points[0];
    points.slice(1).sort((a, b) => {
      const angleA = this.vectorToAngle(this.vectorFromPoints(pivot, a));
      const angleB = this.vectorToAngle(this.vectorFromPoints(pivot, b));
      if (Math.abs(angleA - angleB) < 1e-10) {
        // If angles are equal, sort by distance
        return this.distanceSquared(pivot, a) - this.distanceSquared(pivot, b);
      }
      return angleA - angleB;
    });

    // Build convex hull
    const hull: Point[] = [points[0], points[1]];

    for (let i = 2; i < points.length; i++) {
      while (
        hull.length > 1 &&
        this.crossProduct(
          this.vectorFromPoints(hull[hull.length - 2], hull[hull.length - 1]),
          this.vectorFromPoints(hull[hull.length - 1], points[i])
        ) <= 0
      ) {
        hull.pop();
      }
      hull.push(points[i]);
    }

    return hull;
  }

  /**
   * Calculates the minimum bounding box using rotating calipers.
   * @param points - Array of points (should be convex hull).
   * @param options - Rotating calipers options.
   * @returns Minimum bounding box rectangle.
   * @example
   */
  static calculateMinimumBoundingBoxRotatingCalipers(
    points: Point[],
    options: RotatingCalipersOptions = {
      startAngle: 0,
      angleStep: Math.PI / 180,
      maxAngle: Math.PI / 2,
      useBinarySearch: true,
      useGoldenSection: false,
      anglePrecision: 1e-6,
    }
  ): Rectangle {
    if (points.length < 3) {
      return this.calculateBoundingBox(points);
    }

    const {
      startAngle = 0,
      angleStep = Math.PI / 180, // 1 degree steps
      maxAngle = Math.PI / 2,
      useBinarySearch = true,
      useGoldenSection = false,
      anglePrecision = 1e-6,
    } = options;

    let bestRectangle: Rectangle | null = null;
    let bestArea = Infinity;

    if (useBinarySearch) {
      // Binary search for optimal angle
      let left = startAngle;
      let right = startAngle + maxAngle;

      while (right - left > anglePrecision) {
        const mid1 = left + (right - left) / 3;
        const mid2 = right - (right - left) / 3;

        const area1 = this.calculateBoundingBoxArea(points, mid1);
        const area2 = this.calculateBoundingBoxArea(points, mid2);

        if (area1 < area2) {
          right = mid2;
        } else {
          left = mid1;
        }
      }

      const optimalAngle = (left + right) / 2;
      bestRectangle = this.calculateBoundingBoxAtAngle(points, optimalAngle);
    } else if (useGoldenSection) {
      // Golden section search
      const phi = (1 + Math.sqrt(5)) / 2;
      const resphi = 2 - phi;

      let a = startAngle;
      let b = startAngle + maxAngle;
      let x1 = a + resphi * (b - a);
      let x2 = a + (1 - resphi) * (b - a);

      while (Math.abs(b - a) > anglePrecision) {
        const f1 = this.calculateBoundingBoxArea(points, x1);
        const f2 = this.calculateBoundingBoxArea(points, x2);

        if (f1 < f2) {
          b = x2;
          x2 = x1;
          x1 = a + resphi * (b - a);
        } else {
          a = x1;
          x1 = x2;
          x2 = a + (1 - resphi) * (b - a);
        }
      }

      const optimalAngle = (a + b) / 2;
      bestRectangle = this.calculateBoundingBoxAtAngle(points, optimalAngle);
    } else {
      // Linear search
      for (let angle = startAngle; angle <= startAngle + maxAngle; angle += angleStep) {
        const rectangle = this.calculateBoundingBoxAtAngle(points, angle);
        const area = this.calculateArea(rectangle);

        if (area < bestArea) {
          bestArea = area;
          bestRectangle = rectangle;
        }
      }
    }

    return bestRectangle || this.calculateBoundingBox(points);
  }

  /**
   * Calculates the bounding box area at a specific angle.
   * @param points - Array of points.
   * @param angle - Angle in radians.
   * @returns Area of the bounding box.
   * @example
   */
  static calculateBoundingBoxArea(points: Point[], angle: number): number {
    const rectangle = this.calculateBoundingBoxAtAngle(points, angle);
    return this.calculateArea(rectangle);
  }

  /**
   * Calculates the bounding box at a specific angle.
   * @param points - Array of points.
   * @param angle - Angle in radians.
   * @returns Bounding box rectangle.
   * @example
   */
  static calculateBoundingBoxAtAngle(points: Point[], angle: number): Rectangle {
    if (points.length === 0) {
      return { center: { x: 0, y: 0 }, width: 0, height: 0, rotation: angle };
    }

    // Rotate points by negative angle to align with axes
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const point of points) {
      const rotatedX = point.x * cos - point.y * sin;
      const rotatedY = point.x * sin + point.y * cos;

      minX = Math.min(minX, rotatedX);
      maxX = Math.max(maxX, rotatedX);
      minY = Math.min(minY, rotatedY);
      maxY = Math.max(maxY, rotatedY);
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Rotate center back to original coordinate system
    const center = {
      x: centerX * Math.cos(angle) - centerY * Math.sin(angle),
      y: centerX * Math.sin(angle) + centerY * Math.cos(angle),
    };

    return { center, width, height, rotation: angle };
  }

  /**
   * Calculates the fit quality of a rectangle for a set of points.
   * @param points - Array of points.
   * @param rectangle - Rectangle to test.
   * @param tolerance - Numerical tolerance.
   * @returns Fit quality (0-1, higher is better).
   * @example
   */
  static calculateFitQuality(points: Point[], rectangle: Rectangle, tolerance: number = 1e-10): number {
    if (points.length === 0) return 0;

    let insideCount = 0;
    for (const point of points) {
      if (this.isPointInsideRectangle(point, rectangle, tolerance)) {
        insideCount++;
      }
    }

    return insideCount / points.length;
  }

  /**
   * Tests if a point is inside a rectangle.
   * @param point - Point to test.
   * @param rectangle - Rectangle.
   * @param tolerance - Numerical tolerance.
   * @returns True if point is inside rectangle.
   * @example
   */
  static isPointInsideRectangle(point: Point, rectangle: Rectangle, tolerance: number = 1e-10): boolean {
    // Transform point to rectangle's local coordinate system
    const cos = Math.cos(-rectangle.rotation);
    const sin = Math.sin(-rectangle.rotation);

    const localX = (point.x - rectangle.center.x) * cos - (point.y - rectangle.center.y) * sin;
    const localY = (point.x - rectangle.center.x) * sin + (point.y - rectangle.center.y) * cos;

    const halfWidth = rectangle.width / 2;
    const halfHeight = rectangle.height / 2;

    return Math.abs(localX) <= halfWidth + tolerance && Math.abs(localY) <= halfHeight + tolerance;
  }

  /**
   * Calculates the efficiency compared to AABB.
   * @param rectangle - Rectangle.
   * @param aabb - Axis-aligned bounding box.
   * @returns Efficiency (0-1, higher is better).
   * @example
   */
  static calculateEfficiency(rectangle: Rectangle, aabb: Rectangle): number {
    const rectangleArea = this.calculateArea(rectangle);
    const aabbArea = this.calculateArea(aabb);

    if (aabbArea === 0) return 1;
    return Math.max(0, 1 - (rectangleArea - aabbArea) / aabbArea);
  }

  /**
   * Calculates the compactness of a rectangle.
   * @param rectangle - Rectangle.
   * @returns Compactness measure.
   * @example
   */
  static calculateCompactness(rectangle: Rectangle): number {
    const area = this.calculateArea(rectangle);
    const perimeter = this.calculatePerimeter(rectangle);

    if (perimeter === 0) return 0;
    return (4 * Math.PI * area) / (perimeter * perimeter);
  }

  /**
   * Validates a set of points.
   * @param points - Array of points to validate.
   * @param config - Configuration options.
   * @param _config
   * @returns True if points are valid.
   * @example
   */
  static validatePoints(points: Point[], _config: MinimumBoundingBoxConfig): boolean {
    if (!Array.isArray(points)) return false;
    if (points.length < 3) return false;

    for (const point of points) {
      if (typeof point.x !== "number" || typeof point.y !== "number") return false;
      if (!isFinite(point.x) || !isFinite(point.y)) return false;
    }

    return true;
  }

  /**
   * Validates a rectangle.
   * @param rectangle - Rectangle to validate.
   * @param config - Configuration options.
   * @param _config
   * @returns True if rectangle is valid.
   * @example
   */
  static validateRectangle(rectangle: Rectangle, _config: MinimumBoundingBoxConfig): boolean {
    if (typeof rectangle.width !== "number" || typeof rectangle.height !== "number") return false;
    if (rectangle.width < 0 || rectangle.height < 0) return false;
    if (!isFinite(rectangle.width) || !isFinite(rectangle.height)) return false;
    if (typeof rectangle.rotation !== "number" || !isFinite(rectangle.rotation)) return false;

    return true;
  }

  /**
   * Removes duplicate points from an array.
   * @param points - Array of points.
   * @param tolerance - Tolerance for considering points as duplicates.
   * @returns Array of unique points.
   * @example
   */
  static removeDuplicatePoints(points: Point[], tolerance: number = 1e-10): Point[] {
    const unique: Point[] = [];

    for (const point of points) {
      let isDuplicate = false;
      for (const existing of unique) {
        if (this.distanceSquared(point, existing) < tolerance * tolerance) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        unique.push(point);
      }
    }

    return unique;
  }

  /**
   * Sorts points by angle with respect to a reference point.
   * @param points - Array of points.
   * @param reference - Reference point.
   * @returns Sorted array of points.
   * @example
   */
  static sortPointsByAngle(points: Point[], reference: Point): Point[] {
    return points.slice().sort((a, b) => {
      const angleA = this.vectorToAngle(this.vectorFromPoints(reference, a));
      const angleB = this.vectorToAngle(this.vectorFromPoints(reference, b));
      return angleA - angleB;
    });
  }

  /**
   * Calculates the centroid of a set of points.
   * @param points - Array of points.
   * @returns Centroid point.
   * @example
   */
  static calculateCentroid(points: Point[]): Point {
    if (points.length === 0) return { x: 0, y: 0 };

    let sumX = 0;
    let sumY = 0;

    for (const point of points) {
      sumX += point.x;
      sumY += point.y;
    }

    return { x: sumX / points.length, y: sumY / points.length };
  }
}
