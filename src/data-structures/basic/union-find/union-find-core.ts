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

/**
 *
 */
export class UnionFind {
  private nodes: UnionFindNode[];
  private stats = {
    compressionCount: 0,
    unionCount: 0,
  };
  private setOps: UnionFindSetOperations;

    /**
   * Creates a Union-Find data structure with `size` initial disjoint sets.
   *
   * Each element starts as its own set, represented by union-by-rank and path
   * compression to achieve nearly-constant-time operations on average:
   * O(α(n)) per operation where α is the inverse Ackermann function.
   *
   * @param size Number of elements in the structure (indices 0 through `size - 1`).
   */
  constructor(size: number) {
    this.nodes = Array.from({ length: size }, (_, i) => ({
      parent: i,
      rank: 0,
    }));
    this.setOps = new UnionFindSetOperations(this.nodes, this.stats);
  }

  /**
   * Finds the root representative of the set containing element `x`.
   *
   * Uses path compression to flatten the tree during traversal, ensuring future
   * queries on these nodes are nearly O(1). Returns the canonical element that
   * uniquely identifies the connected component.
   *
   * @param x The element whose root representative is to be found.
   */
  find(x: number): number {
    return this.setOps.find(x);
  }

  /**
   * Unites the sets containing elements `x` and `y`.
   *
   * Uses union-by-rank to keep tree height logarithmic. Returns `true` if the
   * merge succeeded (different components), or `false` if they were already in
   * the same set.
   *
   * @param x First element.
   * @param y Second element.
   */
  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return false;

    const nodeX = this.nodes[rootX];
    const nodeY = this.nodes[rootY];

    if (!nodeX || !nodeY) return false;

    this.stats.unionCount++;

    if (nodeX.rank < nodeY.rank) {
      nodeX.parent = rootY;
    } else if (nodeX.rank > nodeY.rank) {
      nodeY.parent = rootX;
    } else {
      nodeY.parent = rootX;
      nodeX.rank++;
    }

    return true;
  }

  /**
   * Checks whether elements `x` and `y` are in the same set.
   *
   * This is equivalent to `find(x) === find(y)` but avoids building redundant
   * path compression on either side — useful when you only need a boolean answer.
   *
   * @param x First element.
   * @param y Second element.
   */
  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  /**
   * Returns the number of elements in the set containing `x`.
   *
   * O(α(n)) amortized thanks to path compression — effectively constant time
   * for all practical input sizes. Returns `0` if `x` is not a valid element.
   *
   * @param x The element whose component size to report.
   */
  getSetSize(x: number): number {
    return this.setOps.getSetSize(x);
  }

  /**
   * Returns a copy of all element indices in the set containing `x`.
   *
   * O(n) — iterates over every node to find those whose root matches
   * `find(x)`. Useful for debugging, visualization, or reporting connected
   * components. Not suitable as a hot-path operation on large inputs.
   *
   * @param x Any element in the set; its component is enumerated and returned.
   */
  getSetMembers(x: number): number[] {
    return this.setOps.getSetMembers(x);
  }

  /**
   * Returns runtime statistics for this structure.
   *
   * Reports the total number of path compressions and successful unions since
   * construction or last reset, useful for performance monitoring and algorithmic
   * tuning (e.g. deciding when to rebuild a Union-Find from scratch).
   */
  getStats(): UnionFindStats {
    return this.setOps.getStats();
  }

  /**
   * Resets the structure to its initial state — every element becomes its own
   * singleton set with rank `0` and zero path compression count.
   *
   * O(n) — iterates over all elements. Use this before re-running an algorithm
   * that builds a Union-Find from scratch rather than constructing a new instance, since it
   * avoids the allocation overhead of a fresh array.
   */
  reset(): void {
    this.nodes = this.nodes.map((_, i) => ({
      parent: i,
      rank: 0,
    }));
    this.stats.compressionCount = 0;
    this.stats.unionCount = 0;
    this.setOps = new UnionFindSetOperations(this.nodes, this.stats);
  }

  /**
   * Returns an independent deep copy of this structure.
   *
   * Mutations to the returned instance do not affect the original (and vice versa).
   * Useful for snapshotting state before a batch operation or branching computation paths.
   */
  clone(): UnionFind {
    const clone = new UnionFind(this.nodes.length);
    clone.nodes = this.nodes.map(node => ({ ...node }));
    clone.stats = { ...this.stats };
    clone.setOps = new UnionFindSetOperations(clone.nodes, clone.stats);
    return clone;
  }
}
