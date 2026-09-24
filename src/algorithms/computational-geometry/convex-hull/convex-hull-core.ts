/**
 * @module algorithms/geometry/algorithms/convex-hull/convex-hull-core
 * @description Implements multiple Convex Hull algorithms including Graham Scan, Jarvis March, and QuickHull.
 */

import {
  ConvexHullAlgorithm,
  ConvexHullConfig,
  ConvexHullResult,
  HullAnalysis,
  HullAnalysisOptions,
  HullComparison,
  HullComparisonOptions,
  HullEdge,
  HullSimplificationOptions,
  HullSimplificationResult,
  Point,
} from "./convex-hull-types";

/**
 * The ConvexHull class provides multiple algorithms for computing the convex hull
 * of a set of 2D points. It includes Graham Scan, Jarvis March, QuickHull, Monotone Chain,
 * and Gift Wrapping algorithms, each with different performance characteristics.
 *
 * @example
 * ```typescript
 * const convexHull = new ConvexHull();
 * const points = [
 *   { x: 0, y: 0 },
 *   { x: 1, y: 0 },
 *   { x: 0.5, y: 1 },
 *   { x: 0.5, y: 0.5 },
 * ];
 * const result = convexHull.compute(points);
 * console.log(result.hull.length); // Should be 3 (excluding interior point)
 * ```
 */
export class ConvexHull {
  private config: ConvexHullConfig;

  /**
   * Creates an instance of ConvexHull.
   * @param config - Optional configuration for the convex hull computation.
   * @example
   */
  constructor(config: Partial<ConvexHullConfig> = {}) {
    this.config = {
      algorithm: "graham-scan",
      includeCollinear: false,
      sortInput: true,
      tolerance: 1e-10,
      validateInput: true,
      ...config,
    };
  }

  /**
   * Computes the convex hull of a set of points.
   * @param points - Array of points to compute the convex hull for.
   * @param algorithm - Optional algorithm override.
   * @returns A ConvexHullResult object with the hull points, edges, and statistics.
   * @example
   */
  compute(points: Point[], algorithm?: ConvexHullAlgorithm): ConvexHullResult {
    const startTime = performance.now();
    const selectedAlgorithm = algorithm || this.config.algorithm!;

    try {
      // Validate input
      if (this.config.validateInput) {
        this.validatePoints(points);
      }

      // Handle edge cases
      if (points.length < 3) {
        return this.createEmptyResult(
          points.length,
          startTime,
          selectedAlgorithm,
          "At least 3 points are required for convex hull"
        );
      }

      // Remove duplicate points
      const uniquePoints = this.removeDuplicatePoints(points);

      if (uniquePoints.length < 3) {
        return this.createEmptyResult(
          points.length,
          startTime,
          selectedAlgorithm,
          "At least 3 unique points are required"
        );
      }

      // Sort points if requested
      const sortedPoints = this.config.sortInput ? this.sortPoints(uniquePoints) : uniquePoints;

      // Compute convex hull using selected algorithm
      let hull: Point[];
      switch (selectedAlgorithm) {
        case "graham-scan":
          hull = this.grahamScan(sortedPoints);
          break;
        case "jarvis-march":
          hull = this.jarvisMarch(sortedPoints);
          break;
        case "quickhull":
          hull = this.quickHull(sortedPoints);
          break;
        case "monotone-chain":
          hull = this.monotoneChain(sortedPoints);
          break;
        case "gift-wrapping":
          hull = this.giftWrapping(sortedPoints);
          break;
        default:
          throw new Error(`Unknown algorithm: ${selectedAlgorithm}`);
      }

      // Generate edges
      const edges = this.generateEdges(hull);

      const executionTime = performance.now() - startTime;

      return {
        hull,
        edges,
        stats: {
          inputPointCount: points.length,
          hullPointCount: hull.length,
          hullEdgeCount: edges.length,
          executionTime,
          success: true,
          algorithm: selectedAlgorithm,
        },
      };
    } catch (error) {
      return this.createEmptyResult(
        points.length,
        startTime,
        selectedAlgorithm,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /**
   * Analyzes the convex hull and computes various properties.
   * @param hull - Array of hull points.
   * @param options - Analysis options.
   * @returns A HullAnalysis object with computed properties.
   * @example
   */
  analyzeHull(hull: Point[], options: Partial<HullAnalysisOptions> = {}): HullAnalysis {
    const analysisOptions: HullAnalysisOptions = {
      computeArea: true,
      computePerimeter: true,
      computeCentroid: true,
      computeBoundingBox: true,
      ...options,
    };

    const analysis: HullAnalysis = {
      area: 0,
      perimeter: 0,
      centroid: { x: 0, y: 0 },
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    };

    if (hull.length < 3) {
      return analysis;
    }

    if (analysisOptions.computeArea) {
      analysis.area = this.computeArea(hull);
    }

    if (analysisOptions.computePerimeter) {
      analysis.perimeter = this.computePerimeter(hull);
    }

    if (analysisOptions.computeCentroid) {
      analysis.centroid = this.computeCentroid(hull);
    }

    if (analysisOptions.computeBoundingBox) {
      analysis.boundingBox = this.computeBoundingBox(hull);
    }

    return analysis;
  }

  /**
   * Compares two convex hulls.
   * @param hull1 - First convex hull.
   * @param hull2 - Second convex hull.
   * @param options - Comparison options.
   * @returns A HullComparison object with comparison results.
   * @example
   */
  compareHulls(hull1: Point[], hull2: Point[], options: Partial<HullComparisonOptions> = {}): HullComparison {
    const comparisonOptions: HullComparisonOptions = {
      compareAreas: true,
      comparePerimeters: true,
      compareShapes: false,
      ...options,
    };

    const analysis1 = this.analyzeHull(hull1);
    const analysis2 = this.analyzeHull(hull2);

    const comparison: HullComparison = {
      areaDifference: 0,
      perimeterDifference: 0,
      identical: false,
    };

    if (comparisonOptions.compareAreas) {
      comparison.areaDifference = analysis2.area - analysis1.area;
    }

    if (comparisonOptions.comparePerimeters) {
      comparison.perimeterDifference = analysis2.perimeter - analysis1.perimeter;
    }

    if (comparisonOptions.compareShapes) {
      comparison.hausdorffDistance = this.computeHausdorffDistance(hull1, hull2);
    }

    // Check if hulls are identical
    comparison.identical = this.areHullsIdentical(hull1, hull2);

    return comparison;
  }

  /**
   * Simplifies a convex hull by removing unnecessary points.
   * @param hull - Array of hull points.
   * @param options - Simplification options.
   * @returns A HullSimplificationResult object.
   * @example
   */
  simplifyHull(hull: Point[], options: Partial<HullSimplificationOptions> = {}): HullSimplificationResult {
    const simplificationOptions: HullSimplificationOptions = {
      maxDistance: 0.1,
      minAngle: 0.01,
      preserveEndpoints: true,
      ...options,
    };

    if (hull.length < 3) {
      return {
        simplifiedHull: [...hull],
        pointsRemoved: 0,
        compressionRatio: 1,
      };
    }

    // Use Douglas-Peucker algorithm for simplification
    const simplifiedHull = this.douglasPeucker(
      hull,
      simplificationOptions.maxDistance!,
      simplificationOptions.preserveEndpoints!
    );

    return {
      simplifiedHull,
      pointsRemoved: hull.length - simplifiedHull.length,
      compressionRatio: hull.length / simplifiedHull.length,
    };
  }

  // Algorithm implementations

  /**
   * Graham Scan algorithm - O(n log n) average case.
   * @param points
   * @example
   */
  private grahamScan(points: Point[]): Point[] {
    if (points.length < 3) return points;

    // Find the bottom-most point (and leftmost in case of tie)
    let bottomIndex = 0;
    for (let i = 1; i < points.length; i++) {
      const pointI = points[i]!;
      const pointBottom = points[bottomIndex]!;
      if (pointI.y < pointBottom.y || (pointI.y === pointBottom.y && pointI.x < pointBottom.x)) {
        bottomIndex = i;
      }
    }

    // Swap bottom point to front
    const bottomPoint = points[bottomIndex]!;
    [points[0], points[bottomIndex]] = [bottomPoint, points[0]!];

    // Sort points by polar angle with respect to bottom point
    const bottomPointRef = points[0]!;
    const sortedPoints = points.slice(1).sort((a, b) => {
      const angleA = this.polarAngle(bottomPointRef, a);
      const angleB = this.polarAngle(bottomPointRef, b);

      if (Math.abs(angleA - angleB) < this.config.tolerance!) {
        // If angles are equal, sort by distance
        const distA = this.distanceSquared(bottomPointRef, a);
        const distB = this.distanceSquared(bottomPointRef, b);
        return distA - distB;
      }

      return angleA - angleB;
    });

    // Build convex hull
    const hull: Point[] = [bottomPointRef];

    for (const point of sortedPoints) {
      // Remove points that create clockwise turns
      while (hull.length > 1) {
        const prev = hull[hull.length - 2]!;
        const curr = hull[hull.length - 1]!;
        if (this.crossProduct(prev, curr, point) <= 0) {
          hull.pop();
        } else {
          break;
        }
      }
      hull.push(point);
    }

    return hull;
  }

  /**
   * Jarvis March (Gift Wrapping) algorithm - O(nh) where h is the number of hull points.
   * @param points
   * @example
   */
  private jarvisMarch(points: Point[]): Point[] {
    if (points.length < 3) return points;

    const hull: Point[] = [];

    // Find the leftmost point
    let leftmostIndex = 0;
    for (let i = 1; i < points.length; i++) {
      const pointI = points[i]!;
      const pointLeftmost = points[leftmostIndex]!;
      if (pointI.x < pointLeftmost.x) {
        leftmostIndex = i;
      }
    }

    let currentIndex = leftmostIndex;

    do {
      const currentPoint = points[currentIndex]!;
      hull.push(currentPoint);

      let nextIndex = (currentIndex + 1) % points.length;

      // Find the point that makes the smallest right turn
      for (let i = 0; i < points.length; i++) {
        const pointI = points[i]!;
        const pointNext = points[nextIndex]!;
        if (this.crossProduct(currentPoint, pointI, pointNext) > 0) {
          nextIndex = i;
        }
      }

      currentIndex = nextIndex;
    } while (currentIndex !== leftmostIndex);

    return hull;
  }

  /**
   * QuickHull algorithm - O(n log n) average case, O(n²) worst case.
   * @param points
   * @example
   */
  private quickHull(points: Point[]): Point[] {
    if (points.length < 3) return points;

    // Find leftmost and rightmost points
    let leftmostIndex = 0;
    let rightmostIndex = 0;

    for (let i = 1; i < points.length; i++) {
      const pointI = points[i]!;
      const pointLeftmost = points[leftmostIndex]!;
      const pointRightmost = points[rightmostIndex]!;
      if (pointI.x < pointLeftmost.x) {
        leftmostIndex = i;
      }
      if (pointI.x > pointRightmost.x) {
        rightmostIndex = i;
      }
    }

    const leftmost = points[leftmostIndex]!;
    const rightmost = points[rightmostIndex]!;

    // Divide points into two sets
    const leftSet: Point[] = [];
    const rightSet: Point[] = [];

    for (const point of points) {
      if (point === leftmost || point === rightmost) continue;

      const cross = this.crossProduct(leftmost, rightmost, point);
      if (cross > 0) {
        leftSet.push(point);
      } else if (cross < 0) {
        rightSet.push(point);
      }
      // Points with cross = 0 are collinear and handled based on includeCollinear
    }

    // Recursively find hull points
    const hull: Point[] = [leftmost];
    this.quickHullRecursive(leftmost, rightmost, leftSet, hull);
    hull.push(rightmost);
    this.quickHullRecursive(rightmost, leftmost, rightSet, hull);

    return hull;
  }

  /**
   * Monotone Chain algorithm - O(n log n).
   * @param points
   * @example
   */
  private monotoneChain(points: Point[]): Point[] {
    if (points.length < 3) return points;

    // Sort points by x-coordinate, then by y-coordinate
    const sortedPoints = [...points].sort((a, b) => {
      if (Math.abs(a.x - b.x) < this.config.tolerance!) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });

    // Build lower hull
    const lower: Point[] = [];
    for (const point of sortedPoints) {
      while (lower.length >= 2) {
        const prev = lower[lower.length - 2]!;
        const curr = lower[lower.length - 1]!;
        if (this.crossProduct(prev, curr, point) <= 0) {
          lower.pop();
        } else {
          break;
        }
      }
      lower.push(point);
    }

    // Build upper hull
    const upper: Point[] = [];
    for (let i = sortedPoints.length - 1; i >= 0; i--) {
      const point = sortedPoints[i]!;
      while (upper.length >= 2) {
        const prev = upper[upper.length - 2]!;
        const curr = upper[upper.length - 1]!;
        if (this.crossProduct(prev, curr, point) <= 0) {
          upper.pop();
        } else {
          break;
        }
      }
      upper.push(point);
    }

    // Remove duplicate points
    lower.pop();
    upper.pop();

    return [...lower, ...upper];
  }

  /**
   * Gift Wrapping algorithm - O(nh) where h is the number of hull points.
   * @param points
   * @example
   */
  private giftWrapping(points: Point[]): Point[] {
    return this.jarvisMarch(points); // Same as Jarvis March
  }

  // Helper methods

  /**
   * Reject invalid inputs: fewer than 3 unique points or non-finite coordinates.
   * @param points
   * @example
   */
  private validatePoints(points: Point[]): void {
    if (!Array.isArray(points)) {
      throw new Error("Points must be an array");
    }

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (!point || typeof point.x !== "number" || typeof point.y !== "number") {
        throw new Error(`Invalid point at index ${i}: must have x and y properties`);
      }

      if (!isFinite(point.x) || !isFinite(point.y)) {
        throw new Error(`Point at index ${i} has non-finite coordinates`);
      }
    }
  }

  /**
   * Deduplicate exact coordinate matches, preserving first occurrence order.
   * @param points
   * @example
   */
  private removeDuplicatePoints(points: Point[]): Point[] {
    const unique: Point[] = [];
    const seen = new Set<string>();

    for (const point of points) {
      const key = `${point.x},${point.y}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(point);
      }
    }

    return unique;
  }

  /**
   * Lexicographic sort by x then y; anchor ordering for hull scans.
   * @param points
   * @example
   */
  private sortPoints(points: Point[]): Point[] {
    return [...points].sort((a, b) => {
      if (Math.abs(a.x - b.x) < this.config.tolerance!) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });
  }

  /**
   * Pair consecutive hull vertices (wrapping) into HullEdge objects.
   * @param hull
   * @example
   */
  private generateEdges(hull: Point[]): HullEdge[] {
    const edges: HullEdge[] = [];

    for (let i = 0; i < hull.length; i++) {
      const start = hull[i]!;
      const end = hull[(i + 1) % hull.length]!;
      edges.push({ start, end });
    }

    return edges;
  }

  /**
   * Polar angle of a point relative to an origin, used by Graham scan.
   * @param origin
   * @param point
   * @example
   */
  private polarAngle(origin: Point, point: Point): number {
    return Math.atan2(point.y - origin.y, point.x - origin.x);
  }

  /**
   * Cross product (o->a) x (o->b); sign encodes turn direction.
   * @param o
   * @param a
   * @param b
   * @example
   */
  private crossProduct(o: Point, a: Point, b: Point): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }

  /**
   * Squared Euclidean distance between two points.
   * @param p1
   * @param p2
   * @example
   */
  private distanceSquared(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return dx * dx + dy * dy;
  }

  /**
   * QuickHull divide step: find the farthest point outside line p1-p2,
   * recurse on the two sub-problems it creates.
   * @param p1
   * @param p2
   * @param points
   * @param hull
   * @example
   */
  private quickHullRecursive(p1: Point, p2: Point, points: Point[], hull: Point[]): void {
    if (points.length === 0) return;

    // Find the point with maximum distance from the line p1-p2
    let maxDistance = 0;
    let maxIndex = 0;

    for (let i = 0; i < points.length; i++) {
      const point = points[i]!;
      const distance = this.pointToLineDistance(point, p1, p2);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    const maxPoint = points[maxIndex];
    if (!maxPoint) return;

    // Divide points into two sets
    const leftSet: Point[] = [];
    const rightSet: Point[] = [];

    for (const point of points) {
      if (point === maxPoint) continue;

      const cross1 = this.crossProduct(p1, maxPoint, point);
      const cross2 = this.crossProduct(maxPoint, p2, point);

      if (cross1 > 0) {
        leftSet.push(point);
      } else if (cross2 > 0) {
        rightSet.push(point);
      }
    }

    // Recursively process the sets
    this.quickHullRecursive(p1, maxPoint, leftSet, hull);
    hull.push(maxPoint);
    this.quickHullRecursive(maxPoint, p2, rightSet, hull);
  }

  /**
   * Perpendicular distance from a point to the infinite line through
   * two points (farthest-point selection in QuickHull).
   * @param point
   * @param lineStart
   * @param lineEnd
   * @example
   */
  private pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) {
      return Math.sqrt(A * A + B * B);
    }

    const param = dot / lenSq;
    const xx = lineStart.x + param * C;
    const yy = lineStart.y + param * D;

    const dx = point.x - xx;
    const dy = point.y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Shoelace-formula area of the hull polygon.
   * @param hull
   * @example
   */
  private computeArea(hull: Point[]): number {
    if (hull.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < hull.length; i++) {
      const j = (i + 1) % hull.length;
      const pointI = hull[i];
      const pointJ = hull[j];
      if (!pointI || !pointJ) continue;
      area += pointI.x * pointJ.y;
      area -= pointJ.x * pointI.y;
    }
    return Math.abs(area) / 2;
  }

  /**
   * Sum of consecutive vertex distances around the hull.
   * @param hull
   * @example
   */
  private computePerimeter(hull: Point[]): number {
    if (hull.length < 2) return 0;

    let perimeter = 0;
    for (let i = 0; i < hull.length; i++) {
      const j = (i + 1) % hull.length;
      const pointI = hull[i];
      const pointJ = hull[j];
      if (!pointI || !pointJ) continue;
      const dx = pointJ.x - pointI.x;
      const dy = pointJ.y - pointI.y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
  }

  /**
   * Arithmetic mean of hull vertices (vertex centroid).
   * @param hull
   * @example
   */
  private computeCentroid(hull: Point[]): Point {
    if (hull.length === 0) return { x: 0, y: 0 };

    let cx = 0;
    let cy = 0;
    for (const point of hull) {
      cx += point.x;
      cy += point.y;
    }
    return { x: cx / hull.length, y: cy / hull.length };
  }

  /**
   * Axis-aligned bounding box of the hull vertices.
   * @param hull
   * @example
   */
  private computeBoundingBox(hull: Point[]): { minX: number; minY: number; maxX: number; maxY: number } {
    if (hull.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const firstPoint = hull[0];
    if (!firstPoint) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    let minX = firstPoint.x;
    let minY = firstPoint.y;
    let maxX = firstPoint.x;
    let maxY = firstPoint.y;

    for (const point of hull) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   * Symmetric Hausdorff-style distance: max over both hulls of the
   * greatest gap from a vertex to the other hull.
   * @param hull1
   * @param hull2
   * @example
   */
  private computeHausdorffDistance(hull1: Point[], hull2: Point[]): number {
    let maxDistance = 0;

    for (const point1 of hull1) {
      let minDistance = Infinity;
      for (const point2 of hull2) {
        const distance = Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
        minDistance = Math.min(minDistance, distance);
      }
      maxDistance = Math.max(maxDistance, minDistance);
    }

    for (const point2 of hull2) {
      let minDistance = Infinity;
      for (const point1 of hull1) {
        const distance = Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
        minDistance = Math.min(minDistance, distance);
      }
      maxDistance = Math.max(maxDistance, minDistance);
    }

    return maxDistance;
  }

  /**
   * Order-independent comparison of two hulls as identical point sets.
   * @param hull1
   * @param hull2
   * @example
   */
  private areHullsIdentical(hull1: Point[], hull2: Point[]): boolean {
    if (hull1.length !== hull2.length) return false;

    // Check if all points in hull1 are in hull2 (within tolerance)
    for (const point1 of hull1) {
      let found = false;
      for (const point2 of hull2) {
        if (
          Math.abs(point1.x - point2.x) < this.config.tolerance! &&
          Math.abs(point1.y - point2.y) < this.config.tolerance!
        ) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }

    return true;
  }

  /**
   * Douglas-Peucker simplification applied to hull polylines when
   * simplification options are requested.
   * @param points
   * @param maxDistance
   * @param preserveEndpoints
   * @example
   */
  private douglasPeucker(points: Point[], maxDistance: number, preserveEndpoints: boolean): Point[] {
    if (points.length <= 2) return points;

    // Find the point with maximum distance from the line between first and last points
    let maxDist = 0;
    let maxIndex = 0;

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    if (!firstPoint || !lastPoint) return points;

    for (let i = 1; i < points.length - 1; i++) {
      const point = points[i];
      if (!point) continue;
      const dist = this.pointToLineDistance(point, firstPoint, lastPoint);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }

    // If max distance is greater than threshold, recursively simplify
    if (maxDist > maxDistance) {
      const left = this.douglasPeucker(points.slice(0, maxIndex + 1), maxDistance, preserveEndpoints);
      const right = this.douglasPeucker(points.slice(maxIndex), maxDistance, preserveEndpoints);

      // Combine results, removing duplicate middle point
      return [...left.slice(0, -1), ...right];
    } else {
      // If max distance is within threshold, return only endpoints
      if (preserveEndpoints) {
        return [firstPoint, lastPoint];
      } else {
        return [firstPoint];
      }
    }
  }

  /**
   * Uniform failure/empty result carrying elapsed time and error text.
   * @param pointCount
   * @param startTime
   * @param algorithm
   * @param error
   * @example
   */
  private createEmptyResult(
    pointCount: number,
    startTime: number,
    algorithm: ConvexHullAlgorithm,
    error: string
  ): ConvexHullResult {
    return {
      hull: [],
      edges: [],
      stats: {
        inputPointCount: pointCount,
        hullPointCount: 0,
        hullEdgeCount: 0,
        executionTime: performance.now() - startTime,
        success: false,
        algorithm,
        error,
      },
    };
  }
}
