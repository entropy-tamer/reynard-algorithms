/**
 * Utility functions for Union-Find operations
 *
 * Provides high-level functions for common graph operations using Union-Find
 * data structure, including cycle detection and connected component analysis.
 *
 * @module algorithms/unionFindUtils
 */

import { UnionFind } from "./union-find-core";

/**
 * Utility function to detect cycles in a graph using Union-Find
 */
export function detectCycle(edges: Array<[number, number]>): boolean {
  const maxNode = Math.max(...edges.flat());
  const uf = new UnionFind(maxNode + 1);

  for (const [u, v] of edges) {
    if (!uf.union(u, v)) {
      return true; // Cycle detected
    }
  }

  return false;
}

/**
 * Utility function to find connected components
 */
export function findConnectedComponents(edges: Array<[number, number]>): number[][] {
  const maxNode = Math.max(...edges.flat());
  const uf = new UnionFind(maxNode + 1);

  for (const [u, v] of edges) {
    uf.union(u, v);
  }

  const components = new Map<number, number[]>();
  for (let i = 0; i <= maxNode; i++) {
    const root = uf.find(i);
    if (!components.has(root)) {
      components.set(root, []);
    }
    components.get(root)!.push(i);
  }

  return Array.from(components.values());
}
