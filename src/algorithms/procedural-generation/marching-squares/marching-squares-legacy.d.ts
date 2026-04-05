/**
 * @module algorithms/procedural-generation/marching-squares/marching-squares-legacy
 * @description Legacy implementation of the Marching Squares algorithm for contour generation from scalar fields.
 * This is the original implementation preserved for backward compatibility.
 */
import { Contour, ContourAnalysis, ContourAnalysisOptions, ContourSimplificationOptions, ContourSimplificationResult, MarchingSquaresConfig, MarchingSquaresResult, MultiLevelContourOptions, MultiLevelContourResult } from "./marching-squares-types";
/**
 * The MarchingSquaresLegacy class provides the original implementation of the Marching Squares algorithm
 * for generating contour lines from scalar field data. This is preserved for backward compatibility.
 * For better performance, use the default MarchingSquares class which uses the refined LUT implementation.
 *
 * @example
 * ```typescript
 * const marchingSquares = new MarchingSquaresLegacy();
 * const grid = [
 *   [0, 0, 0],
 *   [0, 1, 0],
 *   [0, 0, 0],
 * ];
 * const result = marchingSquares.compute(grid, 0.5);
 * console.log(result.contours.length); // Should be 1 contour
 * ```
 */
export declare class MarchingSquaresLegacy {
    private config;
    /**
     * Creates an instance of MarchingSquares.
     * @param config - Optional configuration for the algorithm.
     * @example
     */
    constructor(config?: Partial<MarchingSquaresConfig>);
    /**
     * Computes contours from a 2D scalar field using the marching squares algorithm.
     * @param grid - 2D array representing the scalar field values.
     * @param threshold - Optional threshold override.
     * @returns A MarchingSquaresResult object with generated contours and statistics.
     * @example
     */
    compute(grid: number[][], threshold?: number): MarchingSquaresResult;
    /**
     * Computes multi-level contours for different threshold values.
     * @param grid - 2D array representing the scalar field values.
     * @param options - Multi-level contour options.
     * @returns A MultiLevelContourResult object with contours organized by level.
     * @example
     */
    computeMultiLevel(grid: number[][], options: Partial<MultiLevelContourOptions>): MultiLevelContourResult;
    /**
     * Analyzes a contour and computes various properties.
     * @param contour - The contour to analyze.
     * @param options - Analysis options.
     * @returns A ContourAnalysis object with computed properties.
     * @example
     */
    analyzeContour(contour: Contour, options?: Partial<ContourAnalysisOptions>): ContourAnalysis;
    /**
     * Simplifies a contour by removing unnecessary segments.
     * @param contour - The contour to simplify.
     * @param options - Simplification options.
     * @returns A ContourSimplificationResult object.
     * @example
     */
    simplifyContour(contour: Contour, options?: Partial<ContourSimplificationOptions>): ContourSimplificationResult;
    /**
     *
     * @param grid
     * @example
     */
    private validateGrid;
    /**
     *
     * @param grid
     * @param threshold
     * @example
     */
    private generateContours;
    /**
     *
     * @param grid
     * @param x
     * @param y
     * @param threshold
     * @example
     */
    private processCell;
    /**
     *
     * @param caseIndex
     * @param x
     * @param y
     * @param grid
     * @param threshold
     * @example
     */
    private generateSegmentsForCase;
    /**
     *
     * @param edgeIndex
     * @param x
     * @param y
     * @param grid
     * @param threshold
     * @example
     */
    private getEdgePoint;
    /**
     *
     * @param threshold
     * @param value1
     * @param value2
     * @example
     */
    private interpolate;
    /**
     *
     * @param contours
     * @example
     */
    private mergeContours;
    /**
     *
     * @param contour1
     * @param contour2
     * @example
     */
    private tryMergeContours;
    /**
     *
     * @param p1
     * @param p2
     * @example
     */
    private pointsEqual;
    /**
     *
     * @param contour
     * @example
     */
    private computeContourLength;
    /**
     *
     * @param contour
     * @example
     */
    private computeContourArea;
    /**
     *
     * @param contour
     * @example
     */
    private computeContourCentroid;
    /**
     *
     * @param contour
     * @example
     */
    private computeContourBoundingBox;
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
     * @param point
     * @param lineStart
     * @param lineEnd
     * @example
     */
    private pointToLineDistance;
    /**
     *
     * @param width
     * @param height
     * @param startTime
     * @param error
     * @example
     */
    private createEmptyResult;
}
//# sourceMappingURL=marching-squares-legacy.d.ts.map