/**
 * @module algorithms/geometry/algorithms/line-intersection/line-intersection-core
 * @description Implements the Bentley-Ottmann line segment intersection algorithm.
 */
import { IntersectionQueryOptions, IntersectionQueryResult, IntersectionSerialization, IntersectionSerializationOptions, LineIntersectionConfig, LineIntersectionResult, LineSegment, SegmentValidationOptions, SegmentValidationResult } from "./line-intersection-types";
/**
 * The LineIntersection class implements the Bentley-Ottmann algorithm for finding
 * all intersections between a set of line segments. This algorithm uses a sweep
 * line approach with an event queue and status structure to efficiently find
 * intersections in O((n + k) log n) time, where n is the number of segments
 * and k is the number of intersections.
 *
 * @example
 * ```typescript
 * const intersection = new LineIntersection();
 * const segments = [
 *   { id: 1, start: { x: 0, y: 0 }, end: { x: 2, y: 2 } },
 *   { id: 2, start: { x: 0, y: 2 }, end: { x: 2, y: 0 } },
 * ];
 * const result = intersection.findIntersections(segments);
 * console.log(result.intersections.length); // Should be 1
 * ```
 */
export declare class LineIntersection {
    private config;
    private eventQueue;
    private statusStructure;
    /**
     * Creates an instance of LineIntersection.
     * @param config - Optional configuration for the algorithm.
     * @example
     */
    constructor(config?: Partial<LineIntersectionConfig>);
    /**
     * Finds all intersections between the given line segments.
     * @param segments - Array of line segments to analyze.
     * @returns The result containing all intersections found.
     * @example
     */
    findIntersections(segments: LineSegment[]): LineIntersectionResult;
    /**
     * Queries for intersections matching specific criteria.
     * @param segments - Array of line segments to analyze.
     * @param options - Query options.
     * @returns The query result.
     * @example
     */
    queryIntersections(segments: LineSegment[], options?: IntersectionQueryOptions): IntersectionQueryResult;
    /**
     * Validates a set of line segments.
     * @param segments - The segments to validate.
     * @param options - Validation options.
     * @returns The validation result.
     * @example
     */
    validateSegments(segments: LineSegment[], options?: Partial<SegmentValidationOptions>): SegmentValidationResult;
    /**
     * Serializes intersection results to a JSON-serializable format.
     * @param result - The intersection result to serialize.
     * @param options - Serialization options.
     * @returns Serialized intersection data.
     * @example
     */
    serialize(result: LineIntersectionResult, options?: Partial<IntersectionSerializationOptions>): IntersectionSerialization;
    /**
     * Updates the configuration.
     * @param newConfig - New configuration options.
     * @example
     */
    updateConfig(newConfig: Partial<LineIntersectionConfig>): void;
    /**
     * Gets the current configuration.
     * @returns The current configuration.
     * @example
     */
    getConfig(): LineIntersectionConfig;
    /**
     * Initializes the event queue with segment endpoints.
     * @param segments - The segments to process.
     * @example
     */
    private initializeEventQueue;
    /**
     * Runs the main sweep line algorithm.
     * @returns Array of intersection points found.
     * @example
     */
    private runSweepLineAlgorithm;
    /**
     * Handles a start event (segment begins).
     * @param event - The start event.
     * @param intersections - Array to collect intersections.
     * @example
     */
    private handleStartEvent;
    /**
     * Handles an end event (segment ends).
     * @param event - The end event.
     * @param intersections - Array to collect intersections.
     * @example
     */
    private handleEndEvent;
    /**
     * Handles an intersection event.
     * @param event - The intersection event.
     * @param intersections - Array to collect intersections.
     * @example
     */
    private handleIntersectionEvent;
    /**
     * Checks if two segments intersect and adds the intersection to the queue if found.
     * @param seg1 - First segment.
     * @param seg2 - Second segment.
     * @param sweepY - Current sweep line y-coordinate.
     * @param intersections - Array to collect intersections.
     * @param _intersections
     * @example
     */
    private checkAndAddIntersection;
    /**
     * Creates an intersection point from an intersection event.
     * @param point - The intersection point.
     * @param _point
     * @param seg1 - First segment.
     * @param seg2 - Second segment.
     * @returns The intersection point, or null if invalid.
     * @example
     */
    private createIntersectionPoint;
    /**
     * Post-processes intersection results.
     * @param intersections - Raw intersection points.
     * @returns Processed intersection points.
     * @example
     */
    private postProcessIntersections;
    /**
     * Removes duplicate intersection points.
     * @param intersections - Array of intersection points.
     * @returns Array with duplicates removed.
     * @example
     */
    private removeDuplicateIntersections;
    /**
     * Checks if an intersection is degenerate (at segment endpoints).
     * @param intersection - The intersection to check.
     * @returns True if the intersection is degenerate.
     * @example
     */
    private isDegenerateIntersection;
    /**
     * Sorts segments for better performance.
     * @param segments - Array of segments to sort.
     * @returns Sorted array of segments.
     * @example
     */
    private sortSegments;
    /**
     * Checks if a point is within a bounding box.
     * @param point - The point to check.
     * @param boundingBox - The bounding box.
     * @param boundingBox.min
     * @param boundingBox.max
     * @returns True if the point is within the bounding box.
     * @example
     */
    private isPointInBoundingBox;
    /**
     * Checks if a point is within a certain distance from the origin.
     * @param point - The point to check.
     * @param maxDistance - The maximum distance.
     * @returns True if the point is within the distance.
     * @example
     */
    private isPointWithinDistance;
    /**
     * Validates a point.
     * @param point - The point to validate.
     * @returns True if the point is valid.
     * @example
     */
    private isValidPoint;
    /**
     * Checks if two segments are equal.
     * @param seg1 - First segment.
     * @param seg2 - Second segment.
     * @returns True if the segments are equal.
     * @example
     */
    private areSegmentsEqual;
    /**
     * Calculates the maximum depth of the status tree.
     * @returns The maximum depth.
     * @example
     */
    private calculateMaxTreeDepth;
    /**
     * Calculates the average depth of the status tree.
     * @returns The average depth.
     * @example
     */
    private calculateAverageTreeDepth;
    /**
     * Creates a validation result object.
     * @param isValid - Whether validation passed.
     * @param errors - Array of errors.
     * @param warnings - Array of warnings.
     * @param invalidCount - Number of invalid segments.
     * @param duplicateCount - Number of duplicate segments.
     * @returns The validation result.
     * @example
     */
    private createValidationResult;
    /**
     * Creates an empty result for error cases.
     * @param startTime - Start time for execution time calculation.
     * @param error - Error message.
     * @returns Empty intersection result.
     * @example
     */
    private createEmptyResult;
}
//# sourceMappingURL=line-intersection-core.d.ts.map