/**
 * Distance Metrics for Dimensionality Reduction
 *
 * Common distance calculation functions used across dimensionality reduction algorithms.
 *
 * @module algorithms/machine-learning/dimensionality-reduction/shared
 */
/**
 * Calculate Euclidean distance between two points
 *
 * @param a First point
 * @param b Second point
 * @returns Euclidean distance
 * @example
 */
export declare function euclideanDistance(a: number[], b: number[]): number;
/**
 * Calculate squared Euclidean distance (faster, avoids sqrt)
 *
 * @param a First point
 * @param b Second point
 * @returns Squared Euclidean distance
 * @example
 */
export declare function euclideanDistanceSquared(a: number[], b: number[]): number;
/**
 * Calculate Manhattan distance between two points
 *
 * @param a First point
 * @param b Second point
 * @returns Manhattan distance
 * @example
 */
export declare function manhattanDistance(a: number[], b: number[]): number;
/**
 * Calculate Chebyshev distance between two points
 *
 * @param a First point
 * @param b Second point
 * @returns Chebyshev distance
 * @example
 */
export declare function chebyshevDistance(a: number[], b: number[]): number;
/**
 * Calculate distance matrix for a set of points
 *
 * @param points Array of points
 * @param distanceFn Distance function to use
 * @returns Distance matrix (n x n)
 * @example
 */
export declare function computeDistanceMatrix(points: number[][], distanceFn?: (a: number[], b: number[]) => number): number[][];
/**
 * Distance metric function type
 */
export type DistanceMetric = (a: number[], b: number[]) => number;
//# sourceMappingURL=distance-metrics.d.ts.map