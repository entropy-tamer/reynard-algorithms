/**
 * @module algorithms/geometry/algorithms/poisson-disk/poisson-disk-core
 * @description Implements the Poisson Disk Sampling algorithm for high-quality point distribution.
 */
import { AdaptivePoissonDiskOptions, AdaptivePoissonDiskResult, ConstrainedPoissonDiskOptions, ConstrainedPoissonDiskResult, Point2D, Point3D, PoissonDisk2DOptions, PoissonDisk3DOptions, PoissonDiskAnalysis, PoissonDiskAnalysisOptions, PoissonDiskConfig, PoissonDiskResult } from "./poisson-disk-types";
/**
 * The PoissonDisk class provides implementations of Poisson Disk Sampling algorithms
 * for generating high-quality point distributions. It supports both 2D and 3D sampling
 * with multiple algorithms including Bridson's algorithm and dart-throwing.
 *
 * Poisson Disk Sampling ensures that no two points are closer than a specified minimum
 * distance, creating visually pleasing and well-distributed point sets useful for
 * procedural generation, texture synthesis, and computer graphics applications.
 *
 * @example
 * ```typescript
 * const poissonDisk = new PoissonDisk();
 *
 * // Generate 2D points
 * const result2D = poissonDisk.sample2D({ width: 100, height: 100, minDistance: 5 });
 * console.log("Generated points:", result2D.points);
 *
 * // Generate 3D points
 * const result3D = poissonDisk.sample3D({ width: 50, height: 50, depth: 50, minDistance: 3 });
 * console.log("Generated 3D points:", result3D.points);
 *
 * // Analyze the distribution
 * const analysis = poissonDisk.analyzeDistribution(result2D.points, { width: 100, height: 100 });
 * console.log("Coverage:", analysis.coverage.coveragePercentage);
 * ```
 */
export declare class PoissonDisk {
    private config;
    private random;
    /**
     * Creates an instance of PoissonDisk.
     * @param config - Optional configuration for the sampling process.
     * @example
     */
    constructor(config?: Partial<PoissonDiskConfig>);
    /**
     * Generates a 2D Poisson Disk Sampling.
     * @param options - Options for 2D sampling.
     * @returns A PoissonDiskResult object with the generated points and statistics.
     * @example
     */
    sample2D(options: PoissonDisk2DOptions): PoissonDiskResult;
    /**
     * Generates a 3D Poisson Disk Sampling.
     * @param options - Options for 3D sampling.
     * @returns A PoissonDiskResult object with the generated points and statistics.
     * @example
     */
    sample3D(options: PoissonDisk3DOptions): PoissonDiskResult;
    /**
     * Performs adaptive Poisson Disk Sampling that adjusts the minimum distance
     * to achieve better coverage.
     * @param options - Options for adaptive sampling.
     * @returns An AdaptivePoissonDiskResult object.
     * @example
     */
    adaptiveSample2D(options: AdaptivePoissonDiskOptions): AdaptivePoissonDiskResult;
    /**
     * Performs constrained Poisson Disk Sampling with custom validation.
     * @param options - Options for constrained sampling.
     * @returns A ConstrainedPoissonDiskResult object.
     * @example
     */
    constrainedSample2D(options: ConstrainedPoissonDiskOptions): ConstrainedPoissonDiskResult;
    /**
     * Analyzes the quality of a Poisson Disk Sampling distribution.
     * @param points - The points to analyze.
     * @param bounds - The bounds of the sampling area.
     * @param bounds.width
     * @param options - Analysis options.
     * @param bounds.height
     * @param bounds.depth
     * @returns A PoissonDiskAnalysis object.
     * @example
     */
    analyzeDistribution(points: Point2D[] | Point3D[], bounds: {
        width: number;
        height: number;
        depth?: number;
    }, options?: Partial<PoissonDiskAnalysisOptions>): PoissonDiskAnalysis;
    /**
     *
     * @param seed
     * @example
     */
    private createSeededRandom;
    /**
     *
     * @param config
     * @example
     */
    private bridson2D;
    /**
     *
     * @param config
     * @example
     */
    private bridson3D;
    /**
     *
     * @param config
     * @example
     */
    private dartThrowing2D;
    /**
     *
     * @param config
     * @example
     */
    private dartThrowing3D;
    /**
     *
     * @param config
     * @example
     */
    private generateRandomPoint2D;
    /**
     *
     * @param config
     * @example
     */
    private generateRandomPoint3D;
    /**
     *
     * @param point
     * @param minDistance
     * @example
     */
    private generateCandidate2D;
    /**
     *
     * @param point
     * @param minDistance
     * @example
     */
    private generateCandidate3D;
    /**
     *
     * @param candidate
     * @param points
     * @param config
     * @example
     */
    private isValidPoint2D;
    /**
     *
     * @param candidate
     * @param points
     * @param config
     * @example
     */
    private isValidPoint3D;
    /**
     *
     * @param candidate
     * @param grid
     * @param cellSize
     * @param config
     * @example
     */
    private isValidCandidate2D;
    /**
     *
     * @param candidate
     * @param grid
     * @param cellSize
     * @param config
     * @example
     */
    private isValidCandidate3D;
    /**
     *
     * @param point
     * @param grid
     * @param cellSize
     * @example
     */
    private addToGrid;
    /**
     *
     * @param point
     * @param grid
     * @param cellSize
     * @example
     */
    private addToGrid3D;
    /**
     *
     * @param p1
     * @param p2
     * @example
     */
    private distance2D;
    /**
     *
     * @param p1
     * @param p2
     * @example
     */
    private distance3D;
    /**
     *
     * @param points
     * @param config
     * @example
     */
    private calculateCoverage2D;
    /**
     *
     * @param points
     * @param config
     * @example
     */
    private calculateCoverage3D;
    /**
     *
     * @param points
     * @example
     */
    private calculateAverageDistance2D;
    /**
     *
     * @param points
     * @example
     */
    private calculateAverageDistance3D;
    /**
     *
     * @param points
     * @example
     */
    private calculateActualMinDistance2D;
    /**
     *
     * @param points
     * @example
     */
    private calculateActualMinDistance3D;
    /**
     *
     * @param points
     * @example
     */
    private computeDistanceStats;
    /**
     *
     * @param points
     * @param bounds
     * @param bounds.width
     * @param bounds.height
     * @param bounds.depth
     * @example
     */
    private computeCoverage;
    /**
     *
     * @param points
     * @example
     */
    private computeUniformity;
    /**
     *
     * @param points
     * @param bounds
     * @param bounds.width
     * @param bounds.height
     * @param bounds.depth
     * @example
     */
    private computeSpatialDistribution;
    /**
     *
     * @param point
     * @example
     */
    private isPoint2D;
}
//# sourceMappingURL=poisson-disk-core.d.ts.map