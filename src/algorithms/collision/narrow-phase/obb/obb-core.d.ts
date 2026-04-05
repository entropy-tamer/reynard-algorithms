/**
 * @module algorithms/geometry/shapes/obb/obb-core
 * @description Main implementation of Oriented Bounding Box (OBB) with SAT collision detection.
 */
import { Point, OBBData, OBBConfig, OBBStats, OBBCollisionResult, OBBPointTestResult, OBBConstructionResult, OBBConstructionOptions, SATOptions, OBBTransformOptions, OBBTransformResult, OBBSerializationOptions, OBBSerialization, OBBValidationOptions, OBBValidationResult } from "./obb-types";
/**
 * The OBB class provides functionality for creating, manipulating, and testing
 * oriented bounding boxes. It includes Separating Axis Theorem (SAT) collision
 * detection for accurate collision testing between OBBs.
 *
 * @example
 * ```typescript
 * const obb = new OBB();
 * const points = [
 *   { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }
 * ];
 * const result = obb.constructFromPoints(points);
 * console.log(result.obb.center); // Center of the OBB
 * ```
 */
export declare class OBB {
    private config;
    private stats;
    /**
     * Creates an instance of OBB.
     * @param config - Optional configuration for OBB operations.
     * @example
     */
    constructor(config?: Partial<OBBConfig>);
    /**
     * Constructs an OBB from a set of points using PCA.
     * @param points - Array of points to fit.
     * @param options - Construction options.
     * @returns Construction result with OBB and quality metrics.
     * @example
     */
    constructFromPoints(points: Point[], options?: Partial<OBBConstructionOptions>): OBBConstructionResult;
    /**
     * Tests collision between two OBBs using SAT.
     * @param obb1 - First OBB.
     * @param obb2 - Second OBB.
     * @param options - SAT options.
     * @returns Collision test result.
     * @example
     */
    testCollision(obb1: OBBData, obb2: OBBData, options?: Partial<SATOptions>): OBBCollisionResult;
    /**
     * Tests if a point is inside an OBB.
     * @param point - The point to test.
     * @param obb - The OBB to test against.
     * @returns Point test result.
     * @example
     */
    testPoint(point: Point, obb: OBBData): OBBPointTestResult;
    /**
     * Transforms an OBB by applying translation, rotation, and scale.
     * @param obb - The OBB to transform.
     * @param options - Transform options.
     * @returns Transform result.
     * @example
     */
    transformOBB(obb: OBBData, options?: Partial<OBBTransformOptions>): OBBTransformResult;
    /**
     * Validates an OBB.
     * @param obb - The OBB to validate.
     * @param options - Validation options.
     * @returns Validation result.
     * @example
     */
    validateOBB(obb: OBBData, options?: Partial<OBBValidationOptions>): OBBValidationResult;
    /**
     * Serializes an OBB to a JSON-serializable format.
     * @param obb - The OBB to serialize.
     * @param options - Serialization options.
     * @returns Serialized OBB data.
     * @example
     */
    serialize(obb: OBBData, options?: Partial<OBBSerializationOptions>): OBBSerialization;
    /**
     * Updates the configuration.
     * @param newConfig - New configuration options.
     * @example
     */
    updateConfig(newConfig: Partial<OBBConfig>): void;
    /**
     * Gets the current configuration.
     * @returns The current configuration.
     * @example
     */
    getConfig(): OBBConfig;
    /**
     * Gets the current statistics.
     * @returns The current statistics.
     * @example
     */
    getStats(): OBBStats;
    /**
     * Resets the statistics.
     * @example
     */
    resetStats(): void;
    /**
     * Constructs an OBB from points using PCA method.
     * @param points - Array of points.
     * @param options - Construction options.
     * @param _options
     * @returns Constructed OBB.
     * @example
     */
    private constructFromPointsPCA;
    /**
     * Constructs an OBB from points using convex hull method.
     * @param points - Array of points.
     * @param options - Construction options.
     * @returns Constructed OBB.
     * @example
     */
    private constructFromPointsConvexHull;
    /**
     * Constructs an OBB from points using brute force method.
     * @param points - Array of points.
     * @param options - Construction options.
     * @returns Constructed OBB.
     * @example
     */
    private constructFromPointsBruteForce;
    /**
     * Gets all axes to test for SAT collision detection.
     * @param obb1 - First OBB.
     * @param obb2 - Second OBB.
     * @returns Array of axes to test.
     * @example
     */
    private getSATAxes;
    /**
     * Calculates the fit quality of an OBB for a set of points.
     * @param points - Array of points.
     * @param obb - The OBB.
     * @returns Fit quality (0-1, higher is better).
     * @example
     */
    private calculateFitQuality;
    /**
     * Creates a default OBB.
     * @returns Default OBB.
     * @example
     */
    private createDefaultOBB;
}
//# sourceMappingURL=obb-core.d.ts.map