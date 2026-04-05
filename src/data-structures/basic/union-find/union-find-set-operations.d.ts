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
export declare class UnionFindSetOperations {
    private nodes;
    private stats;
    /**
     *
     * @param nodes
     * @param stats
     * @param stats.compressionCount
     * @param stats.unionCount
     * @example
     */
    constructor(nodes: UnionFindNode[], stats: {
        compressionCount: number;
        unionCount: number;
    });
    /**
     * Find the root of a node with path compression
     * @param x
     * @example
     */
    find(x: number): number;
    /**
     * Get the size of the set containing x
     * @param x
     * @example
     */
    getSetSize(x: number): number;
    /**
     * Get all nodes in the same set as x
     * @param x
     * @example
     */
    getSetMembers(x: number): number[];
    /**
     * Get statistics about the Union-Find structure
     * @example
     */
    getStats(): UnionFindStats;
}
//# sourceMappingURL=union-find-set-operations.d.ts.map