/**
 * Graph Utilities for Dimensionality Reduction
 *
 * Graph construction and shortest path algorithms used in Isomap and
 * other graph-based dimensionality reduction techniques.
 *
 * @module algorithms/machine-learning/dimensionality-reduction/shared
 */

import type { DistanceMetric } from "./distance-metrics";
import { euclideanDistance } from "./distance-metrics";

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
 */
export function buildKNearestNeighborGraph(
  points: number[][],
  k: number,
  distanceFn: DistanceMetric = euclideanDistance
): Graph {
  const n = points.length;
  const edges: GraphEdge[][] = Array(n)
    .fill(0)
    .map(() => []);

  for (let i = 0; i < n; i++) {
    // Calculate distances to all other points
    const distances: Array<{ index: number; distance: number }> = [];
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        distances.push({
          index: j,
          distance: distanceFn(points[i], points[j]),
        });
      }
    }

    // Sort by distance and take k nearest
    distances.sort((a, b) => a.distance - b.distance);
    const kNearest = distances.slice(0, Math.min(k, distances.length));

    // Add edges (bidirectional)
    for (const neighbor of kNearest) {
      edges[i].push({
        from: i,
        to: neighbor.index,
        weight: neighbor.distance,
      });
    }
  }

  return { nodes: n, edges };
}

/**
 * Compute shortest paths using Dijkstra's algorithm
 *
 * @param graph Graph structure
 * @param source Source node index
 * @returns Array of shortest distances from source to all nodes
 */
export function dijkstraShortestPaths(graph: Graph, source: number): number[] {
  const n = graph.nodes;
  const distances: number[] = Array(n).fill(Number.POSITIVE_INFINITY);
  const visited: boolean[] = Array(n).fill(false);

  distances[source] = 0;

  for (let i = 0; i < n; i++) {
    // Find unvisited node with minimum distance
    let minDist = Number.POSITIVE_INFINITY;
    let minIndex = -1;

    for (let j = 0; j < n; j++) {
      if (!visited[j] && distances[j] < minDist) {
        minDist = distances[j];
        minIndex = j;
      }
    }

    if (minIndex === -1) {
      break; // No more reachable nodes
    }

    visited[minIndex] = true;

    // Update distances to neighbors
    for (const edge of graph.edges[minIndex]) {
      const alt = distances[minIndex] + edge.weight;
      if (alt < distances[edge.to]) {
        distances[edge.to] = alt;
      }
    }
  }

  return distances;
}

/**
 * Compute all-pairs shortest paths using Dijkstra's algorithm
 *
 * @param graph Graph structure
 * @returns Distance matrix (n x n) with shortest path distances
 */
export function computeAllPairsShortestPaths(graph: Graph): number[][] {
  const n = graph.nodes;
  const distanceMatrix: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(Number.POSITIVE_INFINITY));

  for (let i = 0; i < n; i++) {
    const distances = dijkstraShortestPaths(graph, i);
    for (let j = 0; j < n; j++) {
      distanceMatrix[i][j] = distances[j];
    }
  }

  return distanceMatrix;
}

/**
 * Check if graph is connected
 *
 * @param graph Graph structure
 * @returns True if graph is connected
 */
export function isGraphConnected(graph: Graph): boolean {
  const n = graph.nodes;
  if (n === 0) {
    return true;
  }

  const visited: boolean[] = Array(n).fill(false);
  const stack: number[] = [0];
  visited[0] = true;

  while (stack.length > 0) {
    const node = stack.pop()!;
    for (const edge of graph.edges[node]) {
      if (!visited[edge.to]) {
        visited[edge.to] = true;
        stack.push(edge.to);
      }
    }
  }

  // Check if all nodes were visited
  return visited.every(v => v);
}
