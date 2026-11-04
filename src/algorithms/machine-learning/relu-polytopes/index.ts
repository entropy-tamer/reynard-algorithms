/**
 * ReLU Polytopes
 *
 * Partitions the plane by the activation pattern of a first layer: the boundary
 * lines of every neuron, and a sampled grid of pattern ids.
 */

export { ReLUPolytopePartitioner } from "./relu-polytopes-core";
export type {
  ReLUPolytopeBoundaryLine,
  ReLUPolytopeConfig,
  ReLUPolytopeResult,
} from "./relu-polytopes-types";
export { DEFAULT_RELU_POLYTOPE_CONFIG } from "./relu-polytopes-types";
