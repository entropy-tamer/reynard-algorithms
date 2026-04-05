/**
 * @module algorithms/geometry/algorithms/convex-hull/convex-hull-core
 * @description Implements multiple Convex Hull algorithms including Graham Scan, Jarvis March, and QuickHull.
 */
import { ConvexHullAlgorithm, ConvexHullConfig, ConvexHullResult, HullAnalysis, HullAnalysisOptions, HullComparison, HullComparisonOptions, HullSimplificationOptions, HullSimplificationResult, Point } from "./convex-hull-types";
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
export declare class ConvexHull {
    private config;
    /**
     * Creates an instance of ConvexHull.
     * @param config - Optional configuration for the convex hull computation.
     * @example
     */
    constructor(config?: Partial<ConvexHullConfig>);
    /**
     * Computes the convex hull of a set of points.
     * @param points - Array of points to compute the convex hull for.
     * @param algorithm - Optional algorithm override.
     * @returns A ConvexHullResult object with the hull points, edges, and statistics.
     * @example
     */
    compute(points: Point[], algorithm?: ConvexHullAlgorithm): ConvexHullResult;
    /**
     * Analyzes the convex hull and computes various properties.
     * @param hull - Array of hull points.
     * @param options - Analysis options.
     * @returns A HullAnalysis object with computed properties.
     * @example
     */
    analyzeHull(hull: Point[], options?: Partial<HullAnalysisOptions>): HullAnalysis;
    /**
     * Compares two convex hulls.
     * @param hull1 - First convex hull.
     * @param hull2 - Second convex hull.
     * @param options - Comparison options.
     * @returns A HullComparison object with comparison results.
     * @example
     */
    compareHulls(hull1: Point[], hull2: Point[], options?: Partial<HullComparisonOptions>): HullComparison;
    /**
     * Simplifies a convex hull by removing unnecessary points.
     * @param hull - Array of hull points.
     * @param options - Simplification options.
     * @returns A HullSimplificationResult object.
     * @example
     */
    simplifyHull(hull: Point[], options?: Partial<HullSimplificationOptions>): HullSimplificationResult;
    /**
     * Graham Scan algorithm - O(n log n) average case.
     * @param points
     * @example
     */
    private grahamScan;
    /**
     * Jarvis March (Gift Wrapping) algorithm - O(nh) where h is the number of hull points.
     * @param points
     * @example
     */
    private jarvisMarch;
    /**
     * QuickHull algorithm - O(n log n) average case, O(n²) worst case.
     * @param points
     * @example
     */
    private quickHull;
    /**
     * Monotone Chain algorithm - O(n log n).
     * @param points
     * @example
     */
    private monotoneChain;
    /**
     * Gift Wrapping algorithm - O(nh) where h is the number of hull points.
     * @param points
     * @example
     */
    private giftWrapping;
    /**
     *
     * @param points
     * @example
     */
    private validatePoints;
    /**
     *
     * @param points
     * @example
     */
    private removeDuplicatePoints;
    /**
     *
     * @param points
     * @example
     */
    private sortPoints;
    /**
     *
     * @param hull
     * @example
     */
    private generateEdges;
    /**
     *
     * @param origin
     * @param point
     * @example
     */
    private polarAngle;
    /**
     *
     * @param o
     * @param a
     * @param b
     * @example
     */
    private crossProduct;
    /**
     *
     * @param p1
     * @param p2
     * @example
     */
    private distanceSquared;
    /**
     *
     * @param p1
     * @param p2
     * @param points
     * @param hull
     * @example
     */
    private quickHullRecursive;
    /**
     *
     * @param point
     * @param lineStart
     * @param lineEnd
     * @example
     */
    private pointToLineDistance;
    /**
     *
     * @param hull
     * @example
     */
    private computeArea;
    /**
     *
     * @param hull
     * @example
     */
    private computePerimeter;
    /**
     *
     * @param hull
     * @example
     */
    private computeCentroid;
    /**
     *
     * @param hull
     * @example
     */
    private computeBoundingBox;
    /**
     *
     * @param hull1
     * @param hull2
     * @example
     */
    private computeHausdorffDistance;
    /**
     *
     * @param hull1
     * @param hull2
     * @example
     */
    private areHullsIdentical;
    /**
     *
     * @param points
     * @param maxDistance
     * @param preserveEndpoints
     * @example
     */
    private douglasPeucker;
    /**
     *
     * @param pointCount
     * @param startTime
     * @param algorithm
     * @param error
     * @example
     */
    private createEmptyResult;
}
//# sourceMappingURL=convex-hull-core.d.ts.map