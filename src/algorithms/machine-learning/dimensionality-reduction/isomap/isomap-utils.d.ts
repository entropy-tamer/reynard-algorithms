/**
 * Isomap Utility Functions
 *
 * Utility functions for Isomap algorithm including graph construction
 * and geodesic distance computation.
 *
 * @module algorithms/machine-learning/dimensionality-reduction/isomap
 */
import { type Graph } from "../shared/graph-utils";
import type { DistanceMetric } from "../shared/distance-metrics";
/**
 * Build k-NN graph and compute geodesic distances for Isomap
 *
 * @param points Input data points
 * @param k Number of nearest neighbors
 * @param distanceFn Distance function
 * @returns Graph and geodesic distance matrix
 * @example
 */
export declare function computeGeodesicDistances(points: number[][], k: number, distanceFn?: DistanceMetric): {
    graph: Graph;
    geodesicDistances: number[][];
    connected: boolean;
};
//# sourceMappingURL=isomap-utils.d.ts.map