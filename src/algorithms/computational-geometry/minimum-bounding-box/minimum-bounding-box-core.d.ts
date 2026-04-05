/**
 * @module algorithms/geometry/algorithms/minimum-bounding-box/minimum-bounding-box-core
 * @description Main implementation of Minimum Bounding Box with rotating calipers algorithm.
 */
import { UnifiedValidationResult } from "../../../core/types/validation-types";
import { BoundingBoxComparisonOptions, BoundingBoxComparisonResult, MinimumBoundingBoxConfig, MinimumBoundingBoxOptimizationOptions, MinimumBoundingBoxOptimizationResult, MinimumBoundingBoxOptions, MinimumBoundingBoxResult, MinimumBoundingBoxSerialization, MinimumBoundingBoxSerializationOptions, MinimumBoundingBoxStats, MinimumBoundingBoxValidationOptions, Point, Rectangle } from "./minimum-bounding-box-types";
/**
 * The MinimumBoundingBox class provides functionality for computing the minimum
 * bounding box of a set of points using the rotating calipers algorithm.
 * This algorithm finds the rectangle with minimum area or perimeter that
 * contains all the given points.
 *
 * @example
 * ```typescript
 * const mbb = new MinimumBoundingBox();
 * const points = [
 *   { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }
 * ];
 * const result = mbb.compute(points);
 * console.log(result.rectangle); // Minimum bounding box
 * ```
 */
export declare class MinimumBoundingBox {
    private config;
    private stats;
    /**
     * Creates an instance of MinimumBoundingBox.
     * @param config - Optional configuration for the algorithm.
     * @example
     */
    constructor(config?: Partial<MinimumBoundingBoxConfig>);
    /**
     * Computes the minimum bounding box for a set of points.
     * @param points - Array of points to compute bounding box for.
     * @param options - Computation options.
     * @returns Result containing the minimum bounding box and quality metrics.
     * @example
     */
    compute(points: Point[], options?: Partial<MinimumBoundingBoxOptions>): MinimumBoundingBoxResult;
    /**
     * Computes the minimum bounding box using rotating calipers algorithm.
     * @param points - Array of points (should be convex hull).
     * @param options - Computation options.
     * @param _options
     * @returns Minimum bounding box rectangle.
     * @example
     */
    private computeRotatingCalipers;
    /**
     * Computes the minimum bounding box using brute force method.
     * @param points - Array of points.
     * @param options - Computation options.
     * @returns Minimum bounding box rectangle.
     * @example
     */
    private computeBruteForce;
    /**
     * Computes the minimum bounding box using convex hull method.
     * @param points - Array of points.
     * @param options - Computation options.
     * @returns Minimum bounding box rectangle.
     * @example
     */
    private computeConvexHullMethod;
    /**
     * Creates the result object with quality metrics.
     * @param rectangle - The computed rectangle.
     * @param points - Original points.
     * @param startTime - Start time of computation.
     * @param options - Computation options.
     * @returns Complete result object.
     * @example
     */
    private createResult;
    /**
     * Normalizes a rectangle to standard form.
     * @param rectangle - Rectangle to normalize.
     * @returns Normalized rectangle.
     * @example
     */
    private normalizeRectangle;
    /**
     * Validates a minimum bounding box result.
     * @param result - Result to validate.
     * @param options - Validation options.
     * @returns Validation result.
     * @example
     */
    validate(result: MinimumBoundingBoxResult, options?: Partial<MinimumBoundingBoxValidationOptions>): UnifiedValidationResult;
    /**
     * Compares two bounding boxes.
     * @param box1 - First bounding box.
     * @param box2 - Second bounding box.
     * @param options - Comparison options.
     * @returns Comparison result.
     * @example
     */
    compare(box1: MinimumBoundingBoxResult, box2: MinimumBoundingBoxResult, options?: Partial<BoundingBoxComparisonOptions>): BoundingBoxComparisonResult;
    /**
     * Optimizes a bounding box using various optimization techniques.
     * @param points - Array of points.
     * @param _points
     * @param initialBox - Initial bounding box.
     * @param options - Optimization options.
     * @param _options
     * @returns Optimization result.
     * @example
     */
    optimize(_points: Point[], initialBox: Rectangle, _options?: Partial<MinimumBoundingBoxOptimizationOptions>): MinimumBoundingBoxOptimizationResult;
    /**
     * Serializes a minimum bounding box result to JSON.
     * @param result - Result to serialize.
     * @param options - Serialization options.
     * @returns Serialized result.
     * @example
     */
    serialize(result: MinimumBoundingBoxResult, options?: Partial<MinimumBoundingBoxSerializationOptions>): MinimumBoundingBoxSerialization;
    /**
     * Updates the configuration.
     * @param newConfig - New configuration options.
     * @example
     */
    updateConfig(newConfig: Partial<MinimumBoundingBoxConfig>): void;
    /**
     * Gets the current configuration.
     * @returns The current configuration.
     * @example
     */
    getConfig(): MinimumBoundingBoxConfig;
    /**
     * Gets the current statistics.
     * @returns The current statistics.
     * @example
     */
    getStats(): MinimumBoundingBoxStats;
    /**
     * Resets the statistics.
     * @example
     */
    resetStats(): void;
}
//# sourceMappingURL=minimum-bounding-box-core.d.ts.map