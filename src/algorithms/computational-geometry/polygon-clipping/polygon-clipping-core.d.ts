/**
 * @module algorithms/geometry/algorithms/polygon-clipping/polygon-clipping-core
 * @description Main polygon clipping implementation combining Sutherland-Hodgman and Weiler-Atherton algorithms.
 */
import { ClipOperation, ClipResult, Polygon, PolygonClippingConfig, PolygonSerialization, PolygonSerializationOptions, PolygonSimplificationOptions, PolygonValidationOptions, PolygonValidationResult } from "./polygon-clipping-types";
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
export declare class PolygonClipping {
    private config;
    private sutherlandHodgman;
    private weilerAtherton;
    /**
     * Creates an instance of PolygonClipping.
     * @param config - Optional configuration for the clipping operations.
     * @example
     */
    constructor(config?: Partial<PolygonClippingConfig>);
    /**
     * Performs intersection clipping between two polygons.
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @returns The result of the intersection operation.
     * @example
     */
    intersection(subject: Polygon, clipping: Polygon): ClipResult;
    /**
     * Performs union clipping between two polygons.
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @returns The result of the union operation.
     * @example
     */
    union(subject: Polygon, clipping: Polygon): ClipResult;
    /**
     * Performs difference clipping (subject - clipping).
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @returns The result of the difference operation.
     * @example
     */
    difference(subject: Polygon, clipping: Polygon): ClipResult;
    /**
     * Performs XOR clipping between two polygons.
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @returns The result of the XOR operation.
     * @example
     */
    xor(subject: Polygon, clipping: Polygon): ClipResult;
    /**
     * Clips a polygon against a convex clipping polygon using Sutherland-Hodgman algorithm.
     * @param subject - The subject polygon.
     * @param clipping - The convex clipping polygon.
     * @returns The result of the clipping operation.
     * @example
     */
    clipConvex(subject: Polygon, clipping: Polygon): ClipResult;
    /**
     * Clips a polygon using the Weiler-Atherton algorithm.
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @param operation - The clipping operation to perform.
     * @returns The result of the clipping operation.
     * @example
     */
    clipGeneral(subject: Polygon, clipping: Polygon, operation?: ClipOperation): ClipResult;
    /**
     * Main clipping method that automatically selects the appropriate algorithm.
     * @param subject - The subject polygon.
     * @param clipping - The clipping polygon.
     * @param operation - The clipping operation to perform.
     * @returns The result of the clipping operation.
     * @example
     */
    clip(subject: Polygon, clipping: Polygon, operation?: ClipOperation): ClipResult;
    /**
     * Validates a polygon.
     * @param polygon - The polygon to validate.
     * @param name - The name of the polygon for error messages.
     * @param options - Validation options.
     * @returns The validation result.
     * @example
     */
    validatePolygon(polygon: Polygon, name: string, options?: Partial<PolygonValidationOptions>): PolygonValidationResult;
    /**
     * Simplifies a polygon by removing collinear vertices and duplicates.
     * @param polygon - The polygon to simplify.
     * @param options - Simplification options.
     * @returns The simplified polygon.
     * @example
     */
    simplifyPolygon(polygon: Polygon, options?: Partial<PolygonSimplificationOptions>): Polygon;
    /**
     * Serializes a polygon to a JSON-serializable format.
     * @param polygon - The polygon to serialize.
     * @param options - Serialization options.
     * @returns Serialized polygon data.
     * @example
     */
    serialize(polygon: Polygon, options?: Partial<PolygonSerializationOptions>): PolygonSerialization;
    /**
     * Updates the configuration.
     * @param newConfig - New configuration options.
     * @example
     */
    updateConfig(newConfig: Partial<PolygonClippingConfig>): void;
    /**
     * Gets the current configuration.
     * @returns The current configuration.
     * @example
     */
    getConfig(): PolygonClippingConfig;
    /**
     * Selects the appropriate algorithm based on the input polygons and operation.
     * @param subject - The subject polygon.
     * @param _subject
     * @param clipping - The clipping polygon.
     * @param operation - The clipping operation.
     * @returns The selected algorithm name.
     * @example
     */
    private selectAlgorithm;
    /**
     * Checks if a polygon is convex.
     * @param polygon - The polygon to check.
     * @returns True if the polygon is convex.
     * @example
     */
    private isConvexPolygon;
    /**
     * Checks if a polygon has duplicate vertices.
     * @param vertices - The vertices to check.
     * @returns True if there are duplicate vertices.
     * @example
     */
    private hasDuplicateVertices;
    /**
     * Checks if a polygon has collinear vertices.
     * @param vertices - The vertices to check.
     * @returns True if there are collinear vertices.
     * @example
     */
    private hasCollinearVertices;
    /**
     * Checks if a polygon has self-intersections (simplified check).
     * @param vertices - The vertices to check.
     * @returns True if there are self-intersections.
     * @example
     */
    private hasSelfIntersections;
    /**
     * Checks if two line segments intersect.
     * @param p1 - Start of first segment.
     * @param p2 - End of first segment.
     * @param p3 - Start of second segment.
     * @param p4 - End of second segment.
     * @returns True if the segments intersect.
     * @example
     */
    private lineSegmentsIntersect;
    /**
     * Removes duplicate vertices from a polygon.
     * @param vertices - The vertices to process.
     * @param tolerance - Tolerance for duplicate detection.
     * @returns Vertices with duplicates removed.
     * @example
     */
    private removeDuplicateVertices;
    /**
     * Removes collinear vertices from a polygon.
     * @param vertices - The vertices to process.
     * @param tolerance - Tolerance for collinearity detection.
     * @returns Vertices with collinear vertices removed.
     * @example
     */
    private removeCollinearVertices;
    /**
     * Ensures a polygon has counter-clockwise orientation.
     * @param vertices - The vertices to reorient.
     * @example
     */
    private ensureCounterClockwise;
    /**
     * Simplifies the result of a clipping operation.
     * @param result - The clipping result to simplify.
     * @returns The simplified result.
     * @example
     */
    private simplifyResult;
    /**
     * Checks if three points are collinear within tolerance.
     * @param p1 - First point.
     * @param p2 - Second point.
     * @param p3 - Third point.
     * @param tolerance - Tolerance for collinearity.
     * @returns True if the points are collinear.
     * @example
     */
    private areCollinearWithTolerance;
    /**
     * Checks if two points are equal within tolerance.
     * @param p1 - First point.
     * @param p2 - Second point.
     * @param tolerance - Tolerance for equality.
     * @returns True if the points are equal.
     * @example
     */
    private pointsEqualWithTolerance;
    /**
     * Checks if two points are equal within default tolerance.
     * @param p1 - First point.
     * @param p2 - Second point.
     * @returns True if the points are equal.
     * @example
     */
    private pointsEqual;
    /**
     * Checks if three points are collinear within default tolerance.
     * @param p1 - First point.
     * @param p2 - Second point.
     * @param p3 - Third point.
     * @returns True if the points are collinear.
     * @example
     */
    private areCollinear;
    /**
     * Creates a validation result object.
     * @param isValid - Whether the polygon is valid.
     * @param errors - Array of error messages.
     * @param warnings - Array of warning messages.
     * @returns The validation result.
     * @example
     */
    private createValidationResult;
    /**
     * Creates an empty result for error cases.
     * @param startTime - Start time for execution time calculation.
     * @param error - Error message.
     * @returns Empty clip result.
     * @example
     */
    private createEmptyResult;
}
export { SutherlandHodgmanClipper } from "./sutherland-hodgman";
export { WeilerAthertonClipper } from "./weiler-atherton";
//# sourceMappingURL=polygon-clipping-core.d.ts.map