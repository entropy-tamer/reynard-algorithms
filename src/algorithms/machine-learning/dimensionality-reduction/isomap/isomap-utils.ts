/**
 * Isomap Utility Functions
 *
 * Utility functions for Isomap algorithm including graph construction
 * and geodesic distance computation.
 *
 * @module algorithms/machine-learning/dimensionality-reduction/isomap
 */

import {
  buildKNearestNeighborGraph,
  computeAllPairsShortestPaths,
  isGraphConnected,
  type Graph,
} from "../shared/graph-utils";
import type { DistanceMetric } from "../shared/distance-metrics";
import { euclideanDistance } from "../shared/distance-metrics";

/**
 * Build k-NN graph and compute geodesic distances for Isomap
 *
 * @param points Input data points
 * @param k Number of nearest neighbors
 * @param distanceFn Distance function
 * @returns Graph and geodesic distance matrix
 */
export function computeGeodesicDistances(
  points: number[][],
  k: number,
  distanceFn: DistanceMetric = euclideanDistance
): {
  graph: Graph;
  geodesicDistances: number[][];
  connected: boolean;
} {
  // Build k-NN graph
  const graph = buildKNearestNeighborGraph(points, k, distanceFn);

  // Check connectivity
  const connected = isGraphConnected(graph);

  // Compute all-pairs shortest paths (geodesic distances)
  const geodesicDistances = computeAllPairsShortestPaths(graph);

  return {
    graph,
    geodesicDistances,
    connected,
  };
}
