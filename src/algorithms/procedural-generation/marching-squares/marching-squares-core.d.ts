/**
 * @module algorithms/procedural-generation/marching-squares/marching-squares-core
 * @description Implements the Marching Squares algorithm for contour generation from scalar fields.
 * This is the refined LUT implementation with improved ambiguity resolution and performance.
 */
import { Contour, ContourAnalysis, ContourAnalysisOptions, ContourSimplificationOptions, ContourSimplificationResult, MarchingSquaresConfig, MarchingSquaresResult, MultiLevelContourOptions, MultiLevelContourResult } from "./marching-squares-types";
/**
 * The MarchingSquares class provides an implementation of the Marching Squares algorithm
 * for generating contour lines from scalar field data. It uses a refined lookup table
 * with improved ambiguity resolution for cases 5 and 10, providing 10-27% better performance
 * compared to the legacy implementation.
 *
 * @example
 * ```typescript
 * const marchingSquares = new MarchingSquares();
 * const grid = [
 *   [0, 0, 0],
 *   [0, 1, 0],
 *   [0, 0, 0],
 * ];
 * const result = marchingSquares.compute(grid, 0.5);
 * console.log(result.contours.length); // Should be 1 contour
 * ```
 */
export declare class MarchingSquares {
    private config;
    private readonly refinedLUT;
    private readonly ambiguityResolution;
    /**
     * Creates an instance of MarchingSquares.
     * @param config - Optional configuration for the algorithm.
     * @example
     */
    constructor(config?: Partial<MarchingSquaresConfig>);
    /**
     * Computes contours from a 2D scalar field using the refined marching squares algorithm.
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
     * @param caseIndex
     * @param grid
     * @param x
     * @param y
     * @param threshold
     * @example
     */
    private resolveAmbiguity;
    /**
     *
     * @param grid
     * @param x
     * @param y
     * @example
     */
    private getCenterValue;
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
//# sourceMappingURL=marching-squares-core.d.ts.map