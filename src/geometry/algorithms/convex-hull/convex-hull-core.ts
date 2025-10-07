/**
 * @module algorithms/geometry/algorithms/convex-hull/convex-hull-core
 * @description Implements multiple Convex Hull algorithms including Graham Scan, Jarvis March, and QuickHull.
 */

import {
  Point,
  HullEdge,
  ConvexHullAlgorithm,
  ConvexHullConfig,
  ConvexHullResult,
  HullAnalysisOptions,
  HullAnalysis,
  HullComparisonOptions,
  HullComparison,
  HullSimplificationOptions,
  HullSimplificationResult,
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
   */
  constructor(config: Partial<ConvexHullConfig> = {}) {
    this.config = {
      algorithm: 'graham-scan',
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
        return this.createEmptyResult(points.length, startTime, selectedAlgorithm, "At least 3 points are required for convex hull");
      }

      // Remove duplicate points
      const uniquePoints = this.removeDuplicatePoints(points);

      if (uniquePoints.length < 3) {
        return this.createEmptyResult(points.length, startTime, selectedAlgorithm, "At least 3 unique points are required");
      }

      // Sort points if requested
      const sortedPoints = this.config.sortInput ? this.sortPoints(uniquePoints) : uniquePoints;

      // Compute convex hull using selected algorithm
      let hull: Point[];
      switch (selectedAlgorithm) {
        case 'graham-scan':
          hull = this.grahamScan(sortedPoints);
          break;
        case 'jarvis-march':
          hull = this.jarvisMarch(sortedPoints);
          break;
        case 'quickhull':
          hull = this.quickHull(sortedPoints);
          break;
        case 'monotone-chain':
          hull = this.monotoneChain(sortedPoints);
          break;
        case 'gift-wrapping':
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
      return this.createEmptyResult(points.length, startTime, selectedAlgorithm, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Analyzes the convex hull and computes various properties.
   * @param hull - Array of hull points.
   * @param options - Analysis options.
   * @returns A HullAnalysis object with computed properties.
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
   */
  compareHulls(
    hull1: Point[],
    hull2: Point[],
    options: Partial<HullComparisonOptions> = {}
  ): HullComparison {
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
    const simplifiedHull = this.douglasPeucker(hull, simplificationOptions.maxDistance!, simplificationOptions.preserveEndpoints!);

    return {
      simplifiedHull,
      pointsRemoved: hull.length - simplifiedHull.length,
      compressionRatio: hull.length / simplifiedHull.length,
    };
  }

  // Algorithm implementations

  /**
   * Graham Scan algorithm - O(n log n) average case.
   */
  private grahamScan(points: Point[]): Point[] {
    if (points.length < 3) return points;

    // Find the bottom-most point (and leftmost in case of tie)
    let bottomIndex = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].y < points[bottomIndex].y || 
          (points[i].y === points[bottomIndex].y && points[i].x < points[bottomIndex].x)) {
        bottomIndex = i;
      }
    }

    // Swap bottom point to front
    [points[0], points[bottomIndex]] = [points[bottomIndex], points[0]];

    // Sort points by polar angle with respect to bottom point
    const bottomPoint = points[0];
    const sortedPoints = points.slice(1).sort((a, b) => {
      const angleA = this.polarAngle(bottomPoint, a);
      const angleB = this.polarAngle(bottomPoint, b);
      
      if (Math.abs(angleA - angleB) < this.config.tolerance!) {
        // If angles are equal, sort by distance
        const distA = this.distanceSquared(bottomPoint, a);
        const distB = this.distanceSquared(bottomPoint, b);
        return distA - distB;
      }
      
      return angleA - angleB;
    });

    // Build convex hull
    const hull: Point[] = [bottomPoint];
    
    for (const point of sortedPoints) {
      // Remove points that create clockwise turns
      while (hull.length > 1 && this.crossProduct(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) {
        hull.pop();
      }
      hull.push(point);
    }

    return hull;
  }

  /**
   * Jarvis March (Gift Wrapping) algorithm - O(nh) where h is the number of hull points.
   */
  private jarvisMarch(points: Point[]): Point[] {
    if (points.length < 3) return points;

    const hull: Point[] = [];
    
    // Find the leftmost point
    let leftmostIndex = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].x < points[leftmostIndex].x) {
        leftmostIndex = i;
      }
    }

    let currentIndex = leftmostIndex;
    
    do {
      hull.push(points[currentIndex]);
      
      let nextIndex = (currentIndex + 1) % points.length;
      
      // Find the point that makes the smallest right turn
      for (let i = 0; i < points.length; i++) {
        if (this.crossProduct(points[currentIndex], points[i], points[nextIndex]) > 0) {
          nextIndex = i;
        }
      }
      
      currentIndex = nextIndex;
    } while (currentIndex !== leftmostIndex);

    return hull;
  }

  /**
   * QuickHull algorithm - O(n log n) average case, O(n²) worst case.
   */
  private quickHull(points: Point[]): Point[] {
    if (points.length < 3) return points;

    // Find leftmost and rightmost points
    let leftmostIndex = 0;
    let rightmostIndex = 0;
    
    for (let i = 1; i < points.length; i++) {
      if (points[i].x < points[leftmostIndex].x) {
        leftmostIndex = i;
      }
      if (points[i].x > points[rightmostIndex].x) {
        rightmostIndex = i;
      }
    }

    const leftmost = points[leftmostIndex];
    const rightmost = points[rightmostIndex];

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
      while (lower.length >= 2 && 
             this.crossProduct(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
        lower.pop();
      }
      lower.push(point);
    }

    // Build upper hull
    const upper: Point[] = [];
    for (let i = sortedPoints.length - 1; i >= 0; i--) {
      const point = sortedPoints[i];
      while (upper.length >= 2 && 
             this.crossProduct(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
        upper.pop();
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
   */
  private giftWrapping(points: Point[]): Point[] {
    return this.jarvisMarch(points); // Same as Jarvis March
  }

  // Helper methods

  private validatePoints(points: Point[]): void {
    if (!Array.isArray(points)) {
      throw new Error("Points must be an array");
    }

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
        throw new Error(`Invalid point at index ${i}: must have x and y properties`);
      }

      if (!isFinite(point.x) || !isFinite(point.y)) {
        throw new Error(`Point at index ${i} has non-finite coordinates`);
      }
    }
  }

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

  private sortPoints(points: Point[]): Point[] {
    return [...points].sort((a, b) => {
      if (Math.abs(a.x - b.x) < this.config.tolerance!) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });
  }

  private generateEdges(hull: Point[]): HullEdge[] {
    const edges: HullEdge[] = [];
    
    for (let i = 0; i < hull.length; i++) {
      const start = hull[i];
      const end = hull[(i + 1) % hull.length];
      edges.push({ start, end });
    }

    return edges;
  }

  private polarAngle(origin: Point, point: Point): number {
    return Math.atan2(point.y - origin.y, point.x - origin.x);
  }

  private crossProduct(o: Point, a: Point, b: Point): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }

  private distanceSquared(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return dx * dx + dy * dy;
  }

  private quickHullRecursive(p1: Point, p2: Point, points: Point[], hull: Point[]): void {
    if (points.length === 0) return;

    // Find the point with maximum distance from the line p1-p2
    let maxDistance = 0;
    let maxIndex = 0;

    for (let i = 0; i < points.length; i++) {
      const distance = this.pointToLineDistance(points[i], p1, p2);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    const maxPoint = points[maxIndex];
    
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

  private computeArea(hull: Point[]): number {
    if (hull.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < hull.length; i++) {
      const j = (i + 1) % hull.length;
      area += hull[i].x * hull[j].y;
      area -= hull[j].x * hull[i].y;
    }
    return Math.abs(area) / 2;
  }

  private computePerimeter(hull: Point[]): number {
    if (hull.length < 2) return 0;

    let perimeter = 0;
    for (let i = 0; i < hull.length; i++) {
      const j = (i + 1) % hull.length;
      const dx = hull[j].x - hull[i].x;
      const dy = hull[j].y - hull[i].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
  }

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

  private computeBoundingBox(hull: Point[]): { minX: number; minY: number; maxX: number; maxY: number } {
    if (hull.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    let minX = hull[0].x;
    let minY = hull[0].y;
    let maxX = hull[0].x;
    let maxY = hull[0].y;

    for (const point of hull) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return { minX, minY, maxX, maxY };
  }

  private computeHausdorffDistance(hull1: Point[], hull2: Point[]): number {
    let maxDistance = 0;

    for (const point1 of hull1) {
      let minDistance = Infinity;
      for (const point2 of hull2) {
        const distance = Math.sqrt(
          (point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2
        );
        minDistance = Math.min(minDistance, distance);
      }
      maxDistance = Math.max(maxDistance, minDistance);
    }

    for (const point2 of hull2) {
      let minDistance = Infinity;
      for (const point1 of hull1) {
        const distance = Math.sqrt(
          (point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2
        );
        minDistance = Math.min(minDistance, distance);
      }
      maxDistance = Math.max(maxDistance, minDistance);
    }

    return maxDistance;
  }

  private areHullsIdentical(hull1: Point[], hull2: Point[]): boolean {
    if (hull1.length !== hull2.length) return false;

    // Check if all points in hull1 are in hull2 (within tolerance)
    for (const point1 of hull1) {
      let found = false;
      for (const point2 of hull2) {
        if (Math.abs(point1.x - point2.x) < this.config.tolerance! &&
            Math.abs(point1.y - point2.y) < this.config.tolerance!) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }

    return true;
  }

  private douglasPeucker(points: Point[], maxDistance: number, preserveEndpoints: boolean): Point[] {
    if (points.length <= 2) return points;

    // Find the point with maximum distance from the line between first and last points
    let maxDist = 0;
    let maxIndex = 0;

    for (let i = 1; i < points.length - 1; i++) {
      const dist = this.pointToLineDistance(points[i], points[0], points[points.length - 1]);
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
        return [points[0], points[points.length - 1]];
      } else {
        return [points[0]];
      }
    }
  }

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
