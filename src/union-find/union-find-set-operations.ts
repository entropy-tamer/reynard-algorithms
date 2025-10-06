/**
 * Set operations for Union-Find data structure
 *
 * Provides methods for querying set information and statistics
 * from Union-Find instances.
 *
 * @module algorithms/unionFindSetOperations
 */

import { UnionFindNode, UnionFindStats } from "./union-find-types";

export class UnionFindSetOperations {
  constructor(
    private nodes: UnionFindNode[],
    private stats: { compressionCount: number; unionCount: number }
  ) {}

  /**
   * Find the root of a node with path compression
   */
  find(x: number): number {
    if (this.nodes[x].parent !== x) {
      this.nodes[x].parent = this.find(this.nodes[x].parent);
      this.stats.compressionCount++;
    }
    return this.nodes[x].parent;
  }

  /**
   * Get the size of the set containing x
   */
  getSetSize(x: number): number {
    const root = this.find(x);
    return this.nodes.filter(node => this.find(this.nodes.indexOf(node)) === root).length;
  }

  /**
   * Get all nodes in the same set as x
   */
  getSetMembers(x: number): number[] {
    const root = this.find(x);
    return this.nodes.map((_, index) => index).filter(index => this.find(index) === root);
  }

  /**
   * Get statistics about the Union-Find structure
   */
  getStats(): UnionFindStats {
    const roots = new Set<number>();
    let maxRank = 0;
    let totalRank = 0;

    for (let i = 0; i < this.nodes.length; i++) {
      const root = this.find(i);
      roots.add(root);
      maxRank = Math.max(maxRank, this.nodes[root].rank);
      totalRank += this.nodes[root].rank;
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
