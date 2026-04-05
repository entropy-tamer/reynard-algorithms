/**
 * @module algorithms/geometry/algorithms/polygon-clipping/sutherland-hodgman
 * @description Implements the Sutherland-Hodgman polygon clipping algorithm.
 */
import { ClipResult, Polygon, SutherlandHodgmanOptions } from "./polygon-clipping-types";
/**
 * The Sutherland-Hodgman algorithm for clipping a polygon against a convex clipping polygon.
 * This algorithm works by iteratively clipping the subject polygon against each edge
 * of the clipping polygon.
 */
export declare class SutherlandHodgmanClipper {
    private config;
    /**
     *
     * @param config
     * @example
     */
    constructor(config?: Partial<SutherlandHodgmanOptions>);
    /**
     * Clips a subject polygon against a convex clipping polygon.
     * @param subject - The polygon to be clipped.
     * @param clippingPolygon - The convex polygon to clip against.
     * @returns The result of the clipping operation.
     * @example
     */
    clip(subject: Polygon, clippingPolygon: Polygon): ClipResult;
    /**
     * Clips a polygon against a single clipping plane.
     * @param vertices - The vertices of the polygon to clip.
     * @param plane - The clipping plane.
     * @returns The vertices of the clipped polygon.
     * @example
     */
    private clipAgainstPlane;
    /**
     * Converts a convex polygon to an array of clipping planes.
     * @param polygon - The convex polygon.
     * @returns Array of clipping planes.
     * @example
     */
    private polygonToClippingPlanes;
    /**
     * Checks if a point is inside a clipping plane.
     * @param point - The point to check.
     * @param plane - The clipping plane.
     * @returns True if the point is inside the plane.
     * @example
     */
    private isPointInsidePlane;
    /**
     * Finds the intersection point of a line segment with a clipping plane.
     * @param start - Start point of the line segment.
     * @param end - End point of the line segment.
     * @param plane - The clipping plane.
     * @returns The intersection point, or null if no intersection.
     * @example
     */
    private linePlaneIntersection;
    /**
     * Removes duplicate vertices from a polygon.
     * @param vertices - The vertices to process.
     * @returns Vertices with duplicates removed.
     * @example
     */
    private removeDuplicateVertices;
    /**
     * Simplifies a polygon by removing collinear vertices.
     * @param vertices - The vertices to simplify.
     * @returns Simplified vertices.
     * @example
     */
    private simplifyPolygon;
    /**
     * Checks if three points are collinear.
     * @param p1 - First point.
     * @param p2 - Second point.
     * @param p3 - Third point.
     * @returns True if the points are collinear.
     * @example
     */
    private areCollinear;
    /**
     * Checks if two points are equal within tolerance.
     * @param p1 - First point.
     * @param p2 - Second point.
     * @returns True if the points are equal.
     * @example
     */
    private pointsEqual;
    /**
     * Validates a polygon.
     * @param polygon - The polygon to validate.
     * @param name - The name of the polygon for error messages.
     * @throws Error if validation fails.
     * @example
     */
    private validatePolygon;
    /**
     * Validates that a polygon is convex.
     * @param polygon - The polygon to validate.
     * @throws Error if the polygon is not convex.
     * @example
     */
    private validateConvexPolygon;
    /**
     * Creates an empty result for error cases.
     * @param startTime - Start time for execution time calculation.
     * @param error - Error message.
     * @returns Empty clip result.
     * @example
     */
    private createEmptyResult;
}
//# sourceMappingURL=sutherland-hodgman.d.ts.map