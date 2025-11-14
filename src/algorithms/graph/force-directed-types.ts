/**
 * Force-Directed Graph Layout Types
 *
 * Type definitions for force-directed graph layout algorithms.
 */

import type { Point } from "../../core/types/index.js";

/**
 * Graph node definition
 */
export interface GraphNode {
  /** Unique identifier */
  id: string | number;
  /** Position of the node */
  position: Point;
  /** Fixed position (if true, node won't move) */
  fixed?: boolean;
  /** Mass of the node (affects movement) */
  mass?: number;
  /** Additional data */
  data?: unknown;
}

/**
 * Graph edge definition
 */
export interface GraphEdge {
  /** Source node ID */
  source: string | number;
  /** Target node ID */
  target: string | number;
  /** Desired length of the edge */
  length?: number;
  /** Strength of the edge (spring constant) */
  strength?: number;
  /** Additional data */
  data?: unknown;
}

/**
 * Graph definition
 */
export interface Graph {
  /** Nodes in the graph */
  nodes: GraphNode[];
  /** Edges in the graph */
  edges: GraphEdge[];
}

/**
 * Force-directed layout configuration
 */
export interface ForceDirectedConfig {
  /** Width of the layout area */
  width?: number;
  /** Height of the layout area */
  height?: number;
  /** Attraction force strength */
  attractionStrength?: number;
  /** Repulsion force strength */
  repulsionStrength?: number;
  /** Ideal edge length */
  idealEdgeLength?: number;
  /** Damping factor (0-1) */
  damping?: number;
  /** Maximum velocity */
  maxVelocity?: number;
  /** Minimum distance between nodes */
  minDistance?: number;
  /** Algorithm to use */
  algorithm?: ForceDirectedAlgorithm;
}

/**
 * Force-directed algorithm type
 */
export enum ForceDirectedAlgorithm {
  /** Fruchterman-Reingold algorithm */
  FRUCHTERMAN_REINGOLD = "fruchterman-reingold",
  /** Force-directed with Barnes-Hut optimization */
  BARNES_HUT = "barnes-hut",
  /** Spring-embedder algorithm */
  SPRING_EMBEDDER = "spring-embedder",
}

/**
 * Force-directed layout result
 */
export interface ForceDirectedResult {
  /** Nodes with updated positions */
  nodes: GraphNode[];
  /** Edges (unchanged) */
  edges: GraphEdge[];
  /** Total energy in the system */
  energy: number;
  /** Number of iterations performed */
  iterations: number;
  /** Whether layout converged */
  converged: boolean;
}

/**
 * Force-directed layout options
 */
export interface ForceDirectedOptions {
  /** Maximum number of iterations */
  maxIterations?: number;
  /** Convergence threshold */
  convergenceThreshold?: number;
  /** Initial temperature (for simulated annealing) */
  temperature?: number;
  /** Cooling rate */
  coolingRate?: number;
  /** Whether to use adaptive step size */
  adaptiveStepSize?: boolean;
}
