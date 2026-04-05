/**
 * @module algorithms/spatial-structures/rtree/rtree-core
 * @description Implements the R-Tree spatial data structure for efficient spatial queries.
 */
import { Point, Rectangle, RTreeEntry, RTreeConfig, RTreeStats, RTreeQueryResult, RTreeQueryOptions, RTreeInsertResult, RTreeDeleteResult } from "./rtree-types";
/**
 * The RTree class provides an efficient spatial data structure for storing and querying
 * spatial objects. It's particularly useful for range queries, nearest neighbor searches,
 * and spatial indexing in applications like GIS, computer graphics, and game development.
 *
 * @example
 * ```typescript
 * const rtree = new RTree();
 * rtree.insert({ id: 'obj1', bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 }, data: 'object1' });
 * rtree.insert({ id: 'obj2', bounds: { minX: 5, minY: 5, maxX: 15, maxY: 15 }, data: 'object2' });
 *
 * const results = rtree.query({ minX: 2, minY: 2, maxX: 8, maxY: 8 });
 * console.log(results.entries.length); // Should be 2 (both objects overlap with query)
 * ```
 */
export declare class RTree<T = any> {
    private root;
    private config;
    private entryCount;
    /**
     * Creates an instance of RTree.
     * @param config - Optional configuration for the R-Tree.
     * @example
     */
    constructor(config?: Partial<RTreeConfig>);
    /**
     * Inserts an entry into the R-Tree.
     * @param entry - The entry to insert.
     * @returns An RTreeInsertResult object with insertion statistics.
     * @example
     */
    insert(entry: RTreeEntry<T>): RTreeInsertResult;
    /**
     * Removes an entry from the R-Tree by ID.
     * @param id - The ID of the entry to remove.
     * @returns An RTreeDeleteResult object with deletion statistics.
     * @example
     */
    delete(id: string | number): RTreeDeleteResult;
    /**
     * Queries the R-Tree for entries that intersect with the given rectangle.
     * @param bounds - The query rectangle.
     * @param options - Optional query options.
     * @returns An RTreeQueryResult object with matching entries and statistics.
     * @example
     */
    query(bounds: Rectangle, options?: Partial<RTreeQueryOptions>): RTreeQueryResult<T>;
    /**
     * Finds the nearest entry to a given point.
     * @param point - The query point.
     * @param maxDistance - Maximum distance to search (0 = no limit).
     * @returns The nearest entry or null if none found.
     * @example
     */
    nearest(point: Point, maxDistance?: number): RTreeEntry<T> | null;
    /**
     * Gets statistics about the R-Tree structure.
     * @returns An RTreeStats object with tree statistics.
     * @example
     */
    getStats(): RTreeStats;
    /**
     * Clears all entries from the R-Tree.
     * @example
     */
    clear(): void;
    /**
     * Checks if the R-Tree is empty.
     * @returns True if the tree is empty, false otherwise.
     * @example
     */
    isEmpty(): boolean;
    /**
     * Gets the total number of entries in the tree.
     * @returns The number of entries.
     * @example
     */
    size(): number;
    /**
     *
     * @example
     */
    private createLeafNode;
    /**
     *
     * @example
     */
    private createInternalNode;
    /**
     *
     * @param node
     * @param entry
     * @example
     */
    private insertEntry;
    /**
     *
     * @param node
     * @param entry
     * @example
     */
    private chooseBestChild;
    /**
     *
     * @param node
     * @example
     */
    private splitNode;
    /**
     *
     * @param node
     * @example
     */
    private quadraticSplit;
    /**
     *
     * @param node
     * @example
     */
    private linearSplit;
    /**
     *
     * @param node
     * @param id
     * @example
     */
    private deleteEntry;
    /**
     *
     * @param node
     * @param bounds
     * @param results
     * @param options
     * @param nodesVisited
     * @example
     */
    private queryNode;
    /**
     *
     * @param node
     * @param point
     * @param nearestEntry
     * @param nearestDistance
     * @example
     */
    private nearestNode;
    /**
     *
     * @param entry
     * @example
     */
    private findNodeByEntry;
    /**
     *
     * @param node
     * @param targetEntry
     * @example
     */
    private findNodeByEntryRecursive;
    /**
     *
     * @param node
     * @example
     */
    private updateBounds;
    /**
     *
     * @param node
     * @example
     */
    private calculateStats;
    /**
     *
     * @param bounds1
     * @param bounds2
     * @param includeTouching
     * @example
     */
    private boundsIntersect;
    /**
     *
     * @param bounds1
     * @param bounds2
     * @example
     */
    private calculateEnlargement;
    /**
     *
     * @param group
     * @param entry
     * @example
     */
    private calculateGroupEnlargement;
    /**
     *
     * @param group
     * @example
     */
    private calculateGroupBounds;
    /**
     *
     * @param group
     * @example
     */
    private calculateGroupArea;
    /**
     *
     * @param bounds
     * @example
     */
    private area;
    /**
     *
     * @param bounds1
     * @param bounds2
     * @example
     */
    private calculateDistance;
    /**
     *
     * @param point
     * @param bounds
     * @example
     */
    private pointToBoundsDistance;
}
//# sourceMappingURL=rtree-core.d.ts.map