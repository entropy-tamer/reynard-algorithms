/**
 * Core Union-Find Algorithm Implementation
 *
 * A highly optimized Union-Find data structure for efficient set operations
 * and cycle detection. Used for managing connected components and detecting
 * cycles in graphs.
 *
 * @module algorithms/unionFindCore
 */

import { UnionFindNode, UnionFindStats } from "./union-find-types";
import { UnionFindSetOperations } from "./union-find-set-operations";

export class UnionFind {
  private nodes: UnionFindNode[];
  private stats = {
    compressionCount: 0,
    unionCount: 0,
  };
  private setOps: UnionFindSetOperations;

  constructor(size: number) {
    this.nodes = Array.from({ length: size }, (_, i) => ({
      parent: i,
      rank: 0,
    }));
    this.setOps = new UnionFindSetOperations(this.nodes, this.stats);
  }

  find(x: number): number {
    return this.setOps.find(x);
  }

  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return false;

    this.stats.unionCount++;

    if (this.nodes[rootX].rank < this.nodes[rootY].rank) {
      this.nodes[rootX].parent = rootY;
    } else if (this.nodes[rootX].rank > this.nodes[rootY].rank) {
      this.nodes[rootY].parent = rootX;
    } else {
      this.nodes[rootY].parent = rootX;
      this.nodes[rootX].rank++;
    }

    return true;
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  getSetSize(x: number): number {
    return this.setOps.getSetSize(x);
  }

  getSetMembers(x: number): number[] {
    return this.setOps.getSetMembers(x);
  }

  getStats(): UnionFindStats {
    return this.setOps.getStats();
  }

  reset(): void {
    this.nodes = this.nodes.map((_, i) => ({
      parent: i,
      rank: 0,
    }));
    this.stats.compressionCount = 0;
    this.stats.unionCount = 0;
    this.setOps = new UnionFindSetOperations(this.nodes, this.stats);
  }

  clone(): UnionFind {
    const clone = new UnionFind(this.nodes.length);
    clone.nodes = this.nodes.map(node => ({ ...node }));
    clone.stats = { ...this.stats };
    clone.setOps = new UnionFindSetOperations(clone.nodes, clone.stats);
    return clone;
  }
}
