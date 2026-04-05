/**
 * Graph Utilities for Dimensionality Reduction
 *
 * Graph construction and shortest path algorithms used in Isomap and
 * other graph-based dimensionality reduction techniques.
 *
 * @module algorithms/machine-learning/dimensionality-reduction/shared
 */
import type { DistanceMetric } from "./distance-metrics";
/**
 * Edge in a graph
 */
export interface GraphEdge {
    from: number;
    to: number;
    weight: number;
}
/**
 * Graph representation using adjacency list
 */
export interface Graph {
    nodes: number;
    edges: GraphEdge[][];
}
/**
 * Build k-nearest neighbor graph from points
 *
 * @param points Array of data points
 * @param k Number of nearest neighbors
 * @param distanceFn Distance function to use
 * @returns Graph with k-NN edges
 * @example
 */
export declare function buildKNearestNeighborGraph(points: number[][], k: number, distanceFn?: DistanceMetric): Graph;
/**
 * Compute shortest paths using Dijkstra's algorithm
 *
 * @param graph Graph structure
 * @param source Source node index
 * @returns Array of shortest distances from source to all nodes
 * @example
 */
export declare function dijkstraShortestPaths(graph: Graph, source: number): number[];
/**
 * Compute all-pairs shortest paths using Dijkstra's algorithm
 *
 * @param graph Graph structure
 * @returns Distance matrix (n x n) with shortest path distances
 * @example
 */
export declare function computeAllPairsShortestPaths(graph: Graph): number[][];
/**
 * Check if graph is connected
 *
 * @param graph Graph structure
 * @returns True if graph is connected
 * @example
 */
export declare function isGraphConnected(graph: Graph): boolean;
//# sourceMappingURL=graph-utils.d.ts.map