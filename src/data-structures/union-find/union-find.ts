/**
 * Union-Find Algorithm Implementation
 *
 * A highly optimized Union-Find data structure for efficient set operations
 * and cycle detection. Used for managing connected components and detecting
 * cycles in graphs.
 *
 * Features:
 * - Path compression for optimal performance
 * - Union by rank for balanced trees
 * - Cycle detection capabilities
 * - Memory-efficient implementation
 * - Type-safe operations
 *
 * @module algorithms/unionFind
 */

// Re-export all types and interfaces
export type { UnionFindNode, UnionFindStats } from "./union-find-types";

// Re-export the main UnionFind class
export { UnionFind } from "./union-find-core";

// Re-export utility functions
export { detectCycle, findConnectedComponents } from "./union-find-utils";
