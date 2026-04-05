/**
 * @module algorithms/geometry/algorithms/polygon-clipping/weiler-atherton
 * @description Implements the Weiler-Atherton polygon clipping algorithm.
 */
import { Polygon, ClipOperation, WeilerAthertonOptions, ClipResult } from "./polygon-clipping-types";
/**
 * The Weiler-Atherton algorithm for general polygon clipping operations.
 * This algorithm can handle non-convex polygons and supports union, intersection,
 * difference, and XOR operations.
 */
export declare class WeilerAthertonClipper {
    private config;
    /**
     *
     * @param config
     * @example
     */
    constructor(config?: Partial<WeilerAthertonOptions>);
    /**
     * Clips a subject polygon against a clipping polygon using the specified operation.
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @param operation - The clipping operation to perform.
     * @returns The result of the clipping operation.
     * @example
     */
    clip(subject: Polygon, clipping: Polygon, operation?: ClipOperation): ClipResult;
    /**
     * Converts a standard polygon to Weiler-Atherton format.
     * @param polygon - The polygon to convert.
     * @param isSubject - Whether this is the subject polygon.
     * @returns The Weiler-Atherton polygon.
     * @example
     */
    private polygonToWA;
    /**
     * Finds all intersection points between two polygons.
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @returns Array of intersection points with metadata.
     * @example
     */
    private findIntersections;
    /**
     * Finds the intersection point of two line segments.
     * @param p1 - Start of first line segment.
     * @param p2 - End of first line segment.
     * @param p3 - Start of second line segment.
     * @param p4 - End of second line segment.
     * @returns The intersection point, or null if no intersection.
     * @example
     */
    private lineIntersection;
    /**
     * Inserts intersection points into both polygons.
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @param _subject
     * @param _clipping
     * @param intersections - Array of intersection points.
     * @example
     */
    private insertIntersectionPoints;
    /**
     * Inserts a vertex into an edge of a polygon.
     * @param vertex - The vertex to insert.
     * @param edge - The edge to insert into.
     * @param edge.start
     * @param edge.end
     * @example
     */
    private insertVertexInEdge;
    /**
     * Marks vertices as inside or outside the other polygon.
     * @param polygon - The polygon whose vertices to mark.
     * @param otherPolygon - The other polygon to test against.
     * @example
     */
    private markVerticesInside;
    /**
     * Checks if a point is inside a polygon using ray casting.
     * @param point - The point to test.
     * @param polygon - The polygon to test against.
     * @returns True if the point is inside the polygon.
     * @example
     */
    private isPointInPolygon;
    /**
     * Performs the specified clipping operation.
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @param operation - The operation to perform.
     * @returns Array of result polygons.
     * @example
     */
    private performClippingOperation;
    /**
     * Performs intersection operation.
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @param _clipping
     * @returns Array of result polygons.
     * @example
     */
    private performIntersection;
    /**
     * Performs union operation.
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @returns Array of result polygons.
     * @example
     */
    private performUnion;
    /**
     * Performs difference operation.
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @param _clipping
     * @returns Array of result polygons.
     * @example
     */
    private performDifference;
    /**
     * Performs XOR operation.
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @returns Array of result polygons.
     * @example
     */
    private performXOR;
    /**
     * Traces a polygon starting from an entry point.
     * @param entryPoint - The starting point.
     * @param isEntry - Whether this is an entry point.
     * @returns The traced polygon.
     * @example
     */
    private tracePolygon;
    /**
     * Converts Weiler-Atherton polygons back to standard polygon format.
     * @param waPolygons - Array of Weiler-Atherton polygons.
     * @returns Array of standard polygons.
     * @example
     */
    private wasToPolygons;
    /**
     * Post-processes the result polygons.
     * @param polygons - The result polygons.
     * @returns Processed polygons.
     * @example
     */
    private postProcessResult;
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
     * Creates an empty result for error cases.
     * @param startTime - Start time for execution time calculation.
     * @param error - Error message.
     * @returns Empty clip result.
     * @example
     */
    private createEmptyResult;
}
//# sourceMappingURL=weiler-atherton.d.ts.map