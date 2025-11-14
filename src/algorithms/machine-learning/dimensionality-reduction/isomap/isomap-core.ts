/**
 * Isomap Core Implementation
 *
 * Implementation of Isomap (Isometric Mapping) for non-linear dimensionality reduction.
 * Isomap preserves geodesic distances on the data manifold by:
 * 1. Constructing a k-nearest neighbor graph
 * 2. Computing geodesic distances using shortest paths
 * 3. Applying MDS to the geodesic distance matrix
 *
 * Mathematical Theory:
 * Isomap extends MDS to non-linear manifolds by replacing Euclidean distances
 * with geodesic distances approximated via shortest paths on a k-NN graph.
 * This allows it to capture the intrinsic geometry of non-linear manifolds.
 *
 * @module algorithms/machine-learning/dimensionality-reduction/isomap
 */

import type {
  IsomapConfig,
  IsomapResult,
  IsomapOptions,
} from "./isomap-types";
import { DEFAULT_ISOMAP_CONFIG } from "./isomap-types";
import { computeGeodesicDistances } from "./isomap-utils";
import { MDS } from "../mds";
import { euclideanDistance } from "../shared/distance-metrics";
import type { DistanceMetric } from "../shared/distance-metrics";

/**
 * Isomap Algorithm
 *
 * Non-linear dimensionality reduction that preserves geodesic distances
 * on the data manifold using graph-based shortest paths.
 */
export class Isomap {
  private config: IsomapConfig;
  private graph?: {
    nodes: number;
    edges: Array<{ from: number; to: number; weight: number }>;
  };

  /**
   * Create a new Isomap instance
   *
   * @param options Configuration options
   */
  constructor(options: IsomapOptions = {}) {
    this.config = {
      ...DEFAULT_ISOMAP_CONFIG,
      distanceMetric: euclideanDistance,
      ...options.config,
    };
  }

  /**
   * Fit Isomap to data and transform it
   *
   * @param data Input data (n x m), where n is samples and m is features
   * @returns Isomap result with embedding
   */
  fitTransform(data: number[][]): IsomapResult {
    const startTime = performance.now();
    const n = data.length;

    if (n === 0) {
      return {
        embedding: [],
        geodesicDistances: [],
        executionTime: performance.now() - startTime,
      };
    }

    if (n < this.config.k + 1) {
      return {
        embedding: [],
        geodesicDistances: [],
        executionTime: performance.now() - startTime,
        error: `Not enough points: need at least ${this.config.k + 1}, got ${n}`,
      };
    }

    try {
      // Step 1: Compute geodesic distances
      const { graph, geodesicDistances, connected } = computeGeodesicDistances(
        data,
        this.config.k,
        this.config.distanceMetric
      );

      // Store graph for inspection
      this.graph = {
        nodes: graph.nodes,
        edges: graph.edges.flatMap((edges, from) =>
          edges.map((edge) => ({
            from,
            to: edge.to,
            weight: edge.weight,
          }))
        ),
      };

      // Check connectivity if required
      if (this.config.checkConnectivity && !connected) {
        return {
          embedding: [],
          geodesicDistances,
          graph: this.graph,
          executionTime: performance.now() - startTime,
          error: "Graph is not connected. Try increasing k or check your data.",
        };
      }

      // Check for infinite distances (disconnected components)
      let hasInfiniteDistances = false;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (!Number.isFinite(geodesicDistances[i][j])) {
            hasInfiniteDistances = true;
            break;
          }
        }
        if (hasInfiniteDistances) {
          break;
        }
      }

      if (hasInfiniteDistances) {
        return {
          embedding: [],
          geodesicDistances,
          graph: this.graph,
          executionTime: performance.now() - startTime,
          error: "Graph contains disconnected components. Try increasing k.",
        };
      }

      // Step 2: Apply MDS to geodesic distance matrix
      const mds = new MDS({
        config: {
          dimensions: this.config.dimensions,
          classical: true,
        },
      });

      const mdsResult = mds.fitTransform(geodesicDistances);

      return {
        embedding: mdsResult.embedding,
        geodesicDistances,
        graph: this.graph,
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      return {
        embedding: [],
        geodesicDistances: [],
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Update configuration
   *
   * @param config Partial configuration to update
   */
  setConfig(config: Partial<IsomapConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   *
   * @returns Current configuration
   */
  getConfig(): IsomapConfig {
    return { ...this.config };
  }

  /**
   * Get the k-NN graph used in the last transformation
   *
   * @returns Graph structure
   */
  getGraph():
    | {
        nodes: number;
        edges: Array<{ from: number; to: number; weight: number }>;
      }
    | undefined {
    return this.graph;
  }
}

