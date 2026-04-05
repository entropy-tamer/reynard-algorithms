/**
 * Core Union-Find Algorithm Implementation
 *
 * A highly optimized Union-Find data structure for efficient set operations
 * and cycle detection. Used for managing connected components and detecting
 * cycles in graphs.
 *
 * @module algorithms/unionFindCore
 */
import { UnionFindStats } from "./union-find-types";
/**
 *
 */
export declare class UnionFind {
    private nodes;
    private stats;
    private setOps;
    /**
     *
     * @param size
     * @example
     */
    constructor(size: number);
    /**
     *
     * @param x
     * @example
     */
    find(x: number): number;
    /**
     *
     * @param x
     * @param y
     * @example
     */
    union(x: number, y: number): boolean;
    /**
     *
     * @param x
     * @param y
     * @example
     */
    connected(x: number, y: number): boolean;
    /**
     *
     * @param x
     * @example
     */
    getSetSize(x: number): number;
    /**
     *
     * @param x
     * @example
     */
    getSetMembers(x: number): number[];
    /**
     *
     * @example
     */
    getStats(): UnionFindStats;
    /**
     *
     * @example
     */
    reset(): void;
    /**
     *
     * @example
     */
    clone(): UnionFind;
}
//# sourceMappingURL=union-find-core.d.ts.map