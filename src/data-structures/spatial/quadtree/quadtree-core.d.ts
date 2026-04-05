/**
 * Quadtree Core Implementation
 *
 * A highly optimized quadtree spatial data structure for efficient spatial partitioning
 * and querying of 2D objects. Uses recursive space subdivision for O(log n + k) query performance.
 *
 * Mathematical Foundation:
 * - Recursive space subdivision: divide space into 4 quadrants (NW, NE, SW, SE)
 * - Subdivision condition: when node contains more than maxObjects items
 * - Query optimization: only search nodes that intersect with query bounds
 * - Tree height: h ≤ log₂(max(width, height) / minNodeSize)
 *
 * Time Complexity:
 * - Insert: O(log n) average case, O(n) worst case
 * - Remove: O(log n) average case, O(n) worst case
 * - Query: O(log n + k) where k is the number of results
 * - Nearest Neighbor: O(log n) average case
 *
 * Space Complexity: O(n) where n is the number of objects
 *
 * @module algorithms/spatialStructures/quadtreeCore
 */
import { Point, Rectangle, QuadtreeData, QuadtreeStats, QuadtreeQueryResult, CircleQuery, RectangleQuery, PointQuery, QuadtreeOptions, QuadtreeTraversalResult, QuadtreeCollisionResult, QuadtreeNearestNeighborResult, QuadtreePerformanceMetrics } from "./quadtree-types";
/**
 * Quadtree Implementation
 *
 * A complete quadtree implementation with comprehensive features including
 * spatial queries, collision detection, nearest neighbor search, and performance monitoring.
 *
 * @template T - The type of data stored in the quadtree
 */
export declare class Quadtree<T> {
    private root;
    private config;
    private stats;
    private eventHandler?;
    private performanceMetrics;
    /**
     * Creates a new Quadtree instance
     *
     * @param bounds - The bounding box for the root node
     * @param options - Configuration options for the quadtree
     * @example
     */
    constructor(bounds: Rectangle, options?: QuadtreeOptions<T>);
    /**
     * Inserts an object into the quadtree
     *
     * Mathematical Process:
     * 1. Find appropriate leaf node for the object: O(log n)
     * 2. Add object to node's object list: O(1)
     * 3. If node exceeds maxObjects, subdivide: O(k) where k is objects in node
     * 4. Redistribute objects to child nodes: O(k)
     *
     * @param data - The data object to insert
     * @param position - The position of the object
     * @param bounds - Optional bounding box for the object
     * @returns True if insertion was successful
     * @example
     */
    insert(data: T, position: Point, bounds?: Rectangle): boolean;
    /**
     * Removes an object from the quadtree
     *
     * Mathematical Process:
     * 1. Find the node containing the object: O(log n)
     * 2. Remove object from node's object list: O(k) where k is objects in node
     * 3. If node becomes empty and has siblings, merge: O(1)
     *
     * @param data - The data object to remove
     * @param position - The position of the object
     * @returns True if removal was successful
     * @example
     */
    remove(data: T, position: Point): boolean;
    /**
     * Queries objects within a rectangular area
     *
     * Mathematical Process:
     * 1. Start from root node: O(1)
     * 2. Recursively traverse nodes that intersect query bounds: O(log n)
     * 3. Collect objects from intersecting leaf nodes: O(k) where k is results
     * 4. Total complexity: O(log n + k)
     *
     * @param query - Rectangle query parameters
     * @returns Query result with found objects and statistics
     * @example
     */
    queryRect(query: RectangleQuery): QuadtreeQueryResult<T>;
    /**
     * Queries objects within a circular area
     *
     * @param query - Circle query parameters
     * @returns Query result with found objects and statistics
     * @example
     */
    queryCircle(query: CircleQuery): QuadtreeQueryResult<T>;
    /**
     * Queries objects at a specific point
     *
     * @param query - Point query parameters
     * @returns Query result with found objects and statistics
     * @example
     */
    queryPoint(query: PointQuery): QuadtreeQueryResult<T>;
    /**
     * Finds the nearest neighbor to a given point
     *
     * Mathematical Process:
     * 1. Use quadtree structure to prune search space: O(log n)
     * 2. Maintain minimum distance during traversal
     * 3. Skip nodes that cannot contain closer objects
     *
     * @param point - The point to find nearest neighbor for
     * @param maxDistance - Maximum search distance (optional)
     * @returns Nearest neighbor result
     * @example
     */
    findNearestNeighbor(point: Point, maxDistance?: number): QuadtreeNearestNeighborResult<T>;
    /**
     * Detects collisions between objects in the quadtree
     *
     * @param collisionRadius - Radius for collision detection
     * @returns Collision detection result
     * @example
     */
    detectCollisions(collisionRadius: number): QuadtreeCollisionResult<T>;
    /**
     * Clears all objects from the quadtree
     * @example
     */
    clear(): void;
    /**
     * Gets the current statistics
     *
     * @returns Current quadtree statistics
     * @example
     */
    getStats(): QuadtreeStats;
    /**
     * Gets performance metrics
     *
     * @returns Current performance metrics
     * @example
     */
    getPerformanceMetrics(): QuadtreePerformanceMetrics;
    /**
     * Traverses the entire quadtree structure
     *
     * @returns Traversal result with all nodes and objects
     * @example
     */
    traverse(): QuadtreeTraversalResult<T>;
    /**
     * Gets all objects in the quadtree
     *
     * @returns Array of all objects
     * @example
     */
    getAllObjects(): QuadtreeData<T>[];
    /**
     * Creates a new quadtree node
     *
     * @param bounds - Bounding box for the node
     * @param depth - Depth level of the node
     * @param parent - Parent node
     * @returns New quadtree node
     * @example
     */
    private createNode;
    /**
     * Finds the appropriate node for inserting an object
     *
     * @param node - Starting node
     * @param position - Object position
     * @param bounds - Object bounds
     * @returns Target node for insertion
     * @example
     */
    private findNode;
    /**
     * Determines if a node should be subdivided
     *
     * @param node - Node to check
     * @returns True if node should be subdivided
     * @example
     */
    private shouldSubdivide;
    /**
     * Checks if a node can be subdivided
     *
     * @param node - Node to check
     * @returns True if node can be subdivided
     * @example
     */
    private canSubdivide;
    /**
     * Subdivides a node into four child nodes
     *
     * @param node - Node to subdivide
     * @example
     */
    private subdivide;
    /**
     * Determines if a node should be merged
     *
     * @param node - Node to check
     * @returns True if node should be merged
     * @example
     */
    private shouldMerge;
    /**
     * Gets total number of objects in a subtree
     *
     * @param node - Root of subtree
     * @returns Total object count
     * @example
     */
    private getTotalObjectsInSubtree;
    /**
     * Merges a node with its children
     *
     * @param node - Node to merge
     * @example
     */
    private merge;
    /**
     * Checks if two rectangles intersect
     *
     * @param rect1 - First rectangle
     * @param rect2 - Second rectangle
     * @returns True if rectangles intersect
     * @example
     */
    private intersects;
    /**
     * Checks if an object is within bounds
     *
     * @param obj - Object to check
     * @param bounds - Bounds to check against
     * @returns True if object is within bounds
     * @example
     */
    private objectInBounds;
    /**
     * Checks if an object is within a circle
     *
     * @param obj - Object to check
     * @param center - Circle center
     * @param radius - Circle radius
     * @returns True if object is within circle
     * @example
     */
    private objectInCircle;
    /**
     * Calculates distance between two points
     *
     * @param p1 - First point
     * @param p2 - Second point
     * @returns Euclidean distance
     * @example
     */
    private distance;
    private _distanceMemo?;
    /**
     * Calculates minimum distance from a point to a rectangle
     *
     * @param bounds - Rectangle bounds
     * @param point - Point
     * @returns Minimum distance
     * @example
     */
    private nodeMinDistance;
    /**
     * Generates a unique ID for objects
     *
     * @returns Unique identifier
     * @example
     */
    private generateId;
    /**
     * Updates average objects per node statistic
     * @example
     */
    private updateAverageObjectsPerNode;
    /**
     * Updates average insertion time
     *
     * @param time - Time taken for insertion
     * @example
     */
    private updateAverageInsertTime;
    /**
     * Updates average removal time
     *
     * @param time - Time taken for removal
     * @example
     */
    private updateAverageRemoveTime;
    /**
     * Updates average query time
     *
     * @param time - Time taken for query
     * @example
     */
    private updateAverageQueryTime;
    /**
     * Updates average subdivision time
     *
     * @param time - Time taken for subdivision
     * @example
     */
    private updateAverageSubdivisionTime;
    /**
     * Updates query efficiency metric
     *
     * @param objectsFound - Number of objects found
     * @param nodesSearched - Number of nodes searched
     * @example
     */
    private updateQueryEfficiency;
    /**
     * Updates memory usage estimate
     * @example
     */
    private updateMemoryUsage;
    /**
     * Emits an event if event handler is configured
     *
     * @param type - Event type
     * @param data - Event data
     * @param node - Event node
     * @param metadata - Additional metadata
     * @example
     */
    private emitEvent;
}
//# sourceMappingURL=quadtree-core.d.ts.map