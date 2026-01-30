/**
 * Set operations for Union-Find data structure
 *
 * Provides methods for querying set information and statistics
 * from Union-Find instances.
 *
 * @module algorithms/unionFindSetOperations
 */

import { UnionFindNode, UnionFindStats } from "./union-find-types";

/**
 *
 */
export class UnionFindSetOperations {
  /**
   *
   * @param nodes
   * @param stats
   * @param stats.compressionCount
   * @param stats.unionCount
   * @example
   */
  constructor(
    private nodes: UnionFindNode[],
    private stats: { compressionCount: number; unionCount: number }
  ) {}

  /**
   * Find the root of a node with path compression
   * @param x
   * @example
   */
  find(x: number): number {
    const node = this.nodes[x];
    if (!node) {
      throw new Error(`Node at index ${x} does not exist`);
    }

    if (node.parent !== x) {
      node.parent = this.find(node.parent);
      this.stats.compressionCount++;
    }
    return node.parent;
  }

  /**
   * Get the size of the set containing x
   * @param x
   * @example
   */
  getSetSize(x: number): number {
    const root = this.find(x);
    return this.nodes.filter(node => this.find(this.nodes.indexOf(node)) === root).length;
  }

  /**
   * Get all nodes in the same set as x
   * @param x
   * @example
   */
  getSetMembers(x: number): number[] {
    const root = this.find(x);
    return this.nodes.map((_, index) => index).filter(index => this.find(index) === root);
  }

  /**
   * Get statistics about the Union-Find structure
   * @example
   */
  getStats(): UnionFindStats {
    const roots = new Set<number>();
    let maxRank = 0;
    let totalRank = 0;

    for (let i = 0; i < this.nodes.length; i++) {
      const root = this.find(i);
      roots.add(root);
      const rootNode = this.nodes[root];
      if (rootNode) {
        maxRank = Math.max(maxRank, rootNode.rank);
        totalRank += rootNode.rank;
      }
    }

    return {
      totalNodes: this.nodes.length,
      totalSets: roots.size,
      maxRank,
      averageRank: roots.size > 0 ? totalRank / roots.size : 0,
      compressionCount: this.stats.compressionCount,
      unionCount: this.stats.unionCount,
    };
  }
}
