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

import {
  Point,
  Rectangle,
  QuadtreeData,
  QuadtreeNode,
  QuadtreeConfig,
  QuadtreeStats,
  QuadtreeQueryResult,
  CircleQuery,
  RectangleQuery,
  PointQuery,
  QuadtreeOptions,
  QuadtreeEvent,
  QuadtreeEventType,
  QuadtreeEventHandler,
  QuadtreeTraversalResult,
  QuadtreeCollisionResult,
  QuadtreeNearestNeighborResult,
  QuadtreePerformanceMetrics,
} from "./quadtree-types";

/**
 * Quadtree Implementation
 *
 * A complete quadtree implementation with comprehensive features including
 * spatial queries, collision detection, nearest neighbor search, and performance monitoring.
 *
 * @template T - The type of data stored in the quadtree
 */
export class Quadtree<T> {
  private root: QuadtreeNode<T>;
  private config: Required<QuadtreeConfig>;
  private stats: QuadtreeStats;
  private eventHandler?: QuadtreeEventHandler<T>;
  private performanceMetrics: QuadtreePerformanceMetrics;

  /**
   * Creates a new Quadtree instance
   *
   * @param bounds - The bounding box for the root node
   * @param options - Configuration options for the quadtree
   */
  constructor(bounds: Rectangle, options: QuadtreeOptions<T> = {}) {
    this.config = {
      maxObjects: options.maxObjects ?? 10,
      maxDepth: options.maxDepth ?? 8,
      minNodeSize: options.minNodeSize ?? 10,
      autoSubdivide: options.autoSubdivide ?? true,
      autoMerge: options.autoMerge ?? true,
    };

    this.eventHandler = options.onEvent;

    this.stats = {
      totalObjects: 0,
      totalNodes: 1,
      leafNodes: 1,
      maxDepth: 0,
      averageObjectsPerNode: 0,
      subdivisions: 0,
      merges: 0,
      queries: 0,
      averageQueryTime: 0,
    };

    this.performanceMetrics = {
      averageInsertTime: 0,
      averageRemoveTime: 0,
      averageQueryTime: 0,
      averageSubdivisionTime: 0,
      estimatedMemoryUsage: 0,
      queryEfficiency: 0,
    };

    // Create root node
    this.root = this.createNode(bounds, 0, null);
  }

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
   */
  insert(data: T, position: Point, bounds?: Rectangle): boolean {
    const startTime = performance.now();

    try {
      const quadtreeData: QuadtreeData<T> = {
        data,
        position,
        bounds,
        id: this.generateId(),
      };

      const node = this.findNode(this.root, position, bounds);
      if (!node) {
        return false;
      }

      node.objects.push(quadtreeData);
      this.stats.totalObjects++;
      this.updateAverageObjectsPerNode();

      // Subdivide if necessary
      if (this.shouldSubdivide(node)) {
        this.subdivide(node);
      }

      this.updateAverageInsertTime(performance.now() - startTime);
      this.updateMemoryUsage();
      this.emitEvent("insert", quadtreeData, node);

      return true;
    } catch (error) {
      this.emitEvent("insert", undefined, undefined, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

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
   */
  remove(data: T, position: Point): boolean {
    const startTime = performance.now();

    let node = this.findNode(this.root, position);
    if (!node) {
      return false;
    }

    let index = node.objects.findIndex(
      obj => obj.data === data && obj.position.x === position.x && obj.position.y === position.y
    );

    // Fallback: remove by data anywhere in the current subtree if exact position didn't match
    if (index === -1) {
      // Search entire tree by data as a fallback (positions may be approximate)
      const stack: QuadtreeNode<T>[] = [this.root];
      let foundNode: QuadtreeNode<T> | null = null;
      let foundIndex = -1;
      while (stack.length > 0 && foundIndex === -1) {
        const n = stack.pop()!;
        const i = n.objects.findIndex(obj => obj.data === data);
        if (i !== -1) {
          foundNode = n;
          foundIndex = i;
          break;
        }
        if (n.children) stack.push(...n.children);
      }
      if (foundNode && foundIndex !== -1) {
        node = foundNode;
        index = foundIndex;
      } else {
        return false;
      }
    }

    const removedObject = node.objects.splice(index, 1)[0];
    this.stats.totalObjects--;
    this.updateAverageObjectsPerNode();

    // Merge upwards if necessary
    let current: QuadtreeNode<T> | null = node;
    while (current && current.parent) {
      if (this.shouldMerge(current.parent)) {
        this.merge(current.parent);
        current = current.parent.parent;
      } else {
        break;
      }
    }

    this.updateAverageRemoveTime(performance.now() - startTime);
    this.updateMemoryUsage();
    this.emitEvent("remove", removedObject, node);

    return true;
  }

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
   */
  queryRect(query: RectangleQuery): QuadtreeQueryResult<T> {
    const startTime = performance.now();
    let nodesSearched = 0;

    const objects: QuadtreeData<T>[] = [];
    const searchStack: QuadtreeNode<T>[] = [this.root];

    while (searchStack.length > 0) {
      const node = searchStack.pop()!;
      nodesSearched++;

      // Check if node intersects with query bounds
      if (!this.intersects(node.bounds, query.bounds)) {
        continue;
      }

      // Add objects from this node
      for (const obj of node.objects) {
        if (this.objectInBounds(obj, query.bounds)) {
          objects.push(obj);
        }
      }

      // Add child nodes to search stack
      if (node.children) {
        for (const child of node.children) {
          searchStack.push(child);
        }
      }
    }

    const queryTime = performance.now() - startTime;
    this.stats.queries++;
    this.updateAverageQueryTime(queryTime);
    this.stats.averageQueryTime =
      (this.stats.averageQueryTime * (this.stats.queries - 1) + queryTime) / this.stats.queries;
    this.updateQueryEfficiency(objects.length, nodesSearched);

    this.emitEvent("query", undefined, undefined, {
      queryType: "rectangle",
      resultCount: objects.length,
      nodesSearched,
    });

    return {
      objects,
      nodesSearched,
      queryTime,
      queryBounds: query.bounds,
    };
  }

  /**
   * Queries objects within a circular area
   *
   * @param query - Circle query parameters
   * @returns Query result with found objects and statistics
   */
  queryCircle(query: CircleQuery): QuadtreeQueryResult<T> {
    const startTime = performance.now();
    let nodesSearched = 0;

    // Convert circle to bounding box for initial filtering
    const bounds: Rectangle = {
      x: query.center.x - query.radius,
      y: query.center.y - query.radius,
      width: query.radius * 2,
      height: query.radius * 2,
    };

    const objects: QuadtreeData<T>[] = [];
    const searchStack: QuadtreeNode<T>[] = [this.root];

    while (searchStack.length > 0) {
      const node = searchStack.pop()!;
      nodesSearched++;

      // Check if node intersects with circle bounds
      if (!this.intersects(node.bounds, bounds)) {
        continue;
      }

      // Add objects from this node
      for (const obj of node.objects) {
        if (this.objectInCircle(obj, query.center, query.radius)) {
          objects.push(obj);
        }
      }

      // Add child nodes to search stack
      if (node.children) {
        for (const child of node.children) {
          searchStack.push(child);
        }
      }
    }

    const queryTime = performance.now() - startTime;
    this.stats.queries++;
    this.updateAverageQueryTime(queryTime);
    this.stats.averageQueryTime =
      (this.stats.averageQueryTime * (this.stats.queries - 1) + queryTime) / this.stats.queries;
    this.updateQueryEfficiency(objects.length, nodesSearched);

    this.emitEvent("query", undefined, undefined, {
      queryType: "circle",
      resultCount: objects.length,
      nodesSearched,
    });

    return {
      objects,
      nodesSearched,
      queryTime,
      queryBounds: bounds,
    };
  }

  /**
   * Queries objects at a specific point
   *
   * @param query - Point query parameters
   * @returns Query result with found objects and statistics
   */
  queryPoint(query: PointQuery): QuadtreeQueryResult<T> {
    const tolerance = query.tolerance ?? 0;
    const bounds: Rectangle = {
      x: query.point.x - tolerance,
      y: query.point.y - tolerance,
      width: tolerance * 2,
      height: tolerance * 2,
    };

    return this.queryRect({ bounds });
  }

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
   */
  findNearestNeighbor(point: Point, maxDistance?: number): QuadtreeNearestNeighborResult<T> {
    const startTime = performance.now();
    let objectsChecked = 0;
    let nearest: QuadtreeData<T> | null = null;
    let minDistance = maxDistance ?? Infinity;

    const searchStack: QuadtreeNode<T>[] = [this.root];

    while (searchStack.length > 0) {
      const node = searchStack.pop()!;

      // Skip nodes that cannot contain closer objects
      if (this.nodeMinDistance(node.bounds, point) >= minDistance) {
        continue;
      }

      // Check objects in this node
      for (const obj of node.objects) {
        objectsChecked++;
        const distance = this.distance(obj.position, point);

        if (distance < minDistance) {
          minDistance = distance;
          nearest = obj;
        }
      }

      // Add child nodes to search stack
      if (node.children) {
        for (const child of node.children) {
          searchStack.push(child);
        }
      }
    }

    const queryTime = performance.now() - startTime;

    return {
      nearest,
      distance: nearest ? minDistance : -1,
      objectsChecked,
      queryTime,
    };
  }

  /**
   * Detects collisions between objects in the quadtree
   *
   * @param collisionRadius - Radius for collision detection
   * @returns Collision detection result
   */
  detectCollisions(collisionRadius: number): QuadtreeCollisionResult<T> {
    const startTime = performance.now();
    const collisions: Array<{
      object1: QuadtreeData<T>;
      object2: QuadtreeData<T>;
      distance?: number;
    }> = [];
    let checksPerformed = 0;
    const seenPairs = new Set<string>();

    // Get all objects
    const allObjects = this.getAllObjects();

    // Check each object against nearby objects using spatial queries
    for (const obj1 of allObjects) {
      const nearby = this.queryCircle({
        center: obj1.position,
        radius: collisionRadius * 2, // Search in larger radius
      });

      for (const obj2 of nearby.objects) {
        if (obj1 === obj2) continue;

        checksPerformed++;
        const distance = this.distance(obj1.position, obj2.position);

        if (distance <= collisionRadius) {
          const id1 = obj1.id ?? String(obj1.data);
          const id2 = obj2.id ?? String(obj2.data);
          const key = id1 < id2 ? `${id1}|${id2}` : `${id2}|${id1}`;
          if (!seenPairs.has(key)) {
            seenPairs.add(key);
            collisions.push({
              object1: obj1,
              object2: obj2,
              distance,
            });
          }
        }
      }
    }

    const detectionTime = performance.now() - startTime;

    return {
      collisions,
      checksPerformed,
      detectionTime,
    };
  }

  /**
   * Clears all objects from the quadtree
   */
  clear(): void {
    this.root.objects = [];
    this.root.children = null;
    this.stats.totalObjects = 0;
    this.stats.totalNodes = 1;
    this.stats.leafNodes = 1;
    this.stats.maxDepth = 0;
    this.emitEvent("clear");
  }

  /**
   * Gets the current statistics
   *
   * @returns Current quadtree statistics
   */
  getStats(): QuadtreeStats {
    return { ...this.stats };
  }

  /**
   * Gets performance metrics
   *
   * @returns Current performance metrics
   */
  getPerformanceMetrics(): QuadtreePerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Traverses the entire quadtree structure
   *
   * @returns Traversal result with all nodes and objects
   */
  traverse(): QuadtreeTraversalResult<T> {
    const nodes: QuadtreeNode<T>[] = [];
    const objects: QuadtreeData<T>[] = [];
    let maxDepth = 0;
    let nodesVisited = 0;

    const traverseNode = (node: QuadtreeNode<T>) => {
      nodes.push(node);
      nodesVisited++;
      maxDepth = Math.max(maxDepth, node.depth);

      objects.push(...node.objects);

      if (node.children) {
        for (const child of node.children) {
          traverseNode(child);
        }
      }
    };

    traverseNode(this.root);

    return {
      nodes,
      objects,
      maxDepth,
      nodesVisited,
    };
  }

  /**
   * Gets all objects in the quadtree
   *
   * @returns Array of all objects
   */
  getAllObjects(): QuadtreeData<T>[] {
    const result = this.traverse();
    return result.objects;
  }

  /**
   * Creates a new quadtree node
   *
   * @param bounds - Bounding box for the node
   * @param depth - Depth level of the node
   * @param parent - Parent node
   * @returns New quadtree node
   */
  private createNode(bounds: Rectangle, depth: number, parent: QuadtreeNode<T> | null): QuadtreeNode<T> {
    return {
      bounds,
      objects: [],
      children: null,
      parent,
      depth,
      maxObjects: this.config.maxObjects,
      maxDepth: this.config.maxDepth,
    };
  }

  /**
   * Finds the appropriate node for inserting an object
   *
   * @param node - Starting node
   * @param position - Object position
   * @param bounds - Object bounds
   * @returns Target node for insertion
   */
  private findNode(node: QuadtreeNode<T>, position: Point, bounds?: Rectangle): QuadtreeNode<T> | null {
    // Check if object fits in this node
    if (!this.objectInBounds({ position, bounds } as QuadtreeData<T>, node.bounds)) {
      return null;
    }

    // If this is a leaf node, return it
    if (!node.children) {
      return node;
    }

    // Find appropriate child node
    for (const child of node.children) {
      const found = this.findNode(child, position, bounds);
      if (found) {
        return found;
      }
    }

    return null;
  }

  /**
   * Determines if a node should be subdivided
   *
   * @param node - Node to check
   * @returns True if node should be subdivided
   */
  private shouldSubdivide(node: QuadtreeNode<T>): boolean {
    return (
      this.config.autoSubdivide &&
      node.objects.length > this.config.maxObjects &&
      node.depth < this.config.maxDepth &&
      this.canSubdivide(node)
    );
  }

  /**
   * Checks if a node can be subdivided
   *
   * @param node - Node to check
   * @returns True if node can be subdivided
   */
  private canSubdivide(node: QuadtreeNode<T>): boolean {
    return node.bounds.width > this.config.minNodeSize && node.bounds.height > this.config.minNodeSize;
  }

  /**
   * Subdivides a node into four child nodes
   *
   * @param node - Node to subdivide
   */
  private subdivide(node: QuadtreeNode<T>): void {
    const startTime = performance.now();

    const { x, y, width, height } = node.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Create four child nodes
    const children: QuadtreeNode<T>[] = [
      // Northwest
      this.createNode({ x, y, width: halfWidth, height: halfHeight }, node.depth + 1, node),
      // Northeast
      this.createNode({ x: x + halfWidth, y, width: halfWidth, height: halfHeight }, node.depth + 1, node),
      // Southwest
      this.createNode({ x, y: y + halfHeight, width: halfWidth, height: halfHeight }, node.depth + 1, node),
      // Southeast
      this.createNode(
        { x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight },
        node.depth + 1,
        node
      ),
    ];

    node.children = children;
    this.stats.totalNodes += 4;
    this.stats.leafNodes += 3; // 4 new leaves - 1 old leaf = 3 net gain
    this.stats.maxDepth = Math.max(this.stats.maxDepth, node.depth + 1);
    this.stats.subdivisions++;

    // Redistribute objects to child nodes
    const objectsToRedistribute = [...node.objects];
    node.objects = [];

    for (const obj of objectsToRedistribute) {
      for (const child of children) {
        if (this.objectInBounds(obj, child.bounds)) {
          child.objects.push(obj);
          break;
        }
      }
    }

    this.updateAverageSubdivisionTime(performance.now() - startTime);
    this.emitEvent("subdivide", undefined, node);
  }

  /**
   * Determines if a node should be merged
   *
   * @param node - Node to check
   * @returns True if node should be merged
   */
  private shouldMerge(node: QuadtreeNode<T>): boolean {
    return (
      this.config.autoMerge && node.children !== null && this.getTotalObjectsInSubtree(node) <= this.config.maxObjects
    );
  }

  /**
   * Gets total number of objects in a subtree
   *
   * @param node - Root of subtree
   * @returns Total object count
   */
  private getTotalObjectsInSubtree(node: QuadtreeNode<T>): number {
    let count = node.objects.length;

    if (node.children) {
      for (const child of node.children) {
        count += this.getTotalObjectsInSubtree(child);
      }
    }

    return count;
  }

  /**
   * Merges a node with its children
   *
   * @param node - Node to merge
   */
  private merge(node: QuadtreeNode<T>): void {
    if (!node.children) {
      return;
    }

    // Collect all objects from children
    const allObjects: QuadtreeData<T>[] = [];
    for (const child of node.children) {
      allObjects.push(...child.objects);
    }

    // Move objects to parent
    node.objects.push(...allObjects);
    node.children = null;

    this.stats.totalNodes -= 4;
    this.stats.leafNodes -= 3;
    this.stats.merges++;

    this.emitEvent("merge", undefined, node);
  }

  /**
   * Checks if two rectangles intersect
   *
   * @param rect1 - First rectangle
   * @param rect2 - Second rectangle
   * @returns True if rectangles intersect
   */
  private intersects(rect1: Rectangle, rect2: Rectangle): boolean {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    );
  }

  /**
   * Checks if an object is within bounds
   *
   * @param obj - Object to check
   * @param bounds - Bounds to check against
   * @returns True if object is within bounds
   */
  private objectInBounds(obj: QuadtreeData<T>, bounds: Rectangle): boolean {
    if (obj.bounds) {
      return this.intersects(obj.bounds, bounds);
    }

    return (
      obj.position.x >= bounds.x &&
      obj.position.x <= bounds.x + bounds.width &&
      obj.position.y >= bounds.y &&
      obj.position.y <= bounds.y + bounds.height
    );
  }

  /**
   * Checks if an object is within a circle
   *
   * @param obj - Object to check
   * @param center - Circle center
   * @param radius - Circle radius
   * @returns True if object is within circle
   */
  private objectInCircle(obj: QuadtreeData<T>, center: Point, radius: number): boolean {
    const distance = this.distance(obj.position, center);
    return distance <= radius;
  }

  /**
   * Calculates distance between two points
   *
   * @param p1 - First point
   * @param p2 - Second point
   * @returns Euclidean distance
   */
  private distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates minimum distance from a point to a rectangle
   *
   * @param bounds - Rectangle bounds
   * @param point - Point
   * @returns Minimum distance
   */
  private nodeMinDistance(bounds: Rectangle, point: Point): number {
    const dx = Math.max(0, Math.max(bounds.x - point.x, point.x - (bounds.x + bounds.width)));
    const dy = Math.max(0, Math.max(bounds.y - point.y, point.y - (bounds.y + bounds.height)));
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Generates a unique ID for objects
   *
   * @returns Unique identifier
   */
  private generateId(): string {
    return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Updates average objects per node statistic
   */
  private updateAverageObjectsPerNode(): void {
    this.stats.averageObjectsPerNode = this.stats.totalObjects / this.stats.totalNodes;
  }

  /**
   * Updates average insertion time
   *
   * @param time - Time taken for insertion
   */
  private updateAverageInsertTime(time: number): void {
    this.performanceMetrics.averageInsertTime =
      (this.performanceMetrics.averageInsertTime * (this.stats.totalObjects - 1) + time) / this.stats.totalObjects;
  }

  /**
   * Updates average removal time
   *
   * @param time - Time taken for removal
   */
  private updateAverageRemoveTime(time: number): void {
    this.performanceMetrics.averageRemoveTime =
      (this.performanceMetrics.averageRemoveTime * (this.stats.totalObjects - 1) + time) / this.stats.totalObjects;
  }

  /**
   * Updates average query time
   *
   * @param time - Time taken for query
   */
  private updateAverageQueryTime(time: number): void {
    this.performanceMetrics.averageQueryTime =
      (this.performanceMetrics.averageQueryTime * (this.stats.queries - 1) + time) / this.stats.queries;
  }

  /**
   * Updates average subdivision time
   *
   * @param time - Time taken for subdivision
   */
  private updateAverageSubdivisionTime(time: number): void {
    this.performanceMetrics.averageSubdivisionTime =
      (this.performanceMetrics.averageSubdivisionTime * (this.stats.subdivisions - 1) + time) / this.stats.subdivisions;
  }

  /**
   * Updates query efficiency metric
   *
   * @param objectsFound - Number of objects found
   * @param nodesSearched - Number of nodes searched
   */
  private updateQueryEfficiency(objectsFound: number, nodesSearched: number): void {
    this.performanceMetrics.queryEfficiency = objectsFound / Math.max(1, nodesSearched);
  }

  /**
   * Updates memory usage estimate
   */
  private updateMemoryUsage(): void {
    // Rough estimate: nodes + objects + overhead
    const nodeSize = this.stats.totalNodes * 200; // Approximate node size
    const objectSize = this.stats.totalObjects * 100; // Approximate object size
    this.performanceMetrics.estimatedMemoryUsage = nodeSize + objectSize;
  }

  /**
   * Emits an event if event handler is configured
   *
   * @param type - Event type
   * @param data - Event data
   * @param node - Event node
   * @param metadata - Additional metadata
   */
  private emitEvent(
    type: QuadtreeEventType,
    data?: QuadtreeData<T>,
    node?: QuadtreeNode<T>,
    metadata?: Record<string, any>
  ): void {
    if (this.eventHandler) {
      const event: QuadtreeEvent<T> = {
        type,
        timestamp: Date.now(),
        data,
        node,
        metadata,
      };
      this.eventHandler(event);
    }
  }
}
