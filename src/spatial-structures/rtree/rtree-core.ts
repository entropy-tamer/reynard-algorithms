/**
 * @module algorithms/spatial-structures/rtree/rtree-core
 * @description Implements the R-Tree spatial data structure for efficient spatial queries.
 */

import {
  Point,
  Rectangle,
  RTreeEntry,
  RTreeNode,
  RTreeConfig,
  RTreeStats,
  RTreeQueryResult,
  RTreeQueryOptions,
  RTreeInsertResult,
  RTreeDeleteResult,
} from "./rtree-types";

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
export class RTree<T = any> {
  private root: RTreeNode<T> | null = null;
  private config: RTreeConfig;
  private entryCount: number = 0;

  /**
   * Creates an instance of RTree.
   * @param config - Optional configuration for the R-Tree.
   */
  constructor(config: Partial<RTreeConfig> = {}) {
    this.config = {
      minEntries: 2,
      maxEntries: 8,
      reinsertOnOverflow: true,
      useQuadraticSplit: true,
      ...config,
    };
  }

  /**
   * Inserts an entry into the R-Tree.
   * @param entry - The entry to insert.
   * @returns An RTreeInsertResult object with insertion statistics.
   */
  insert(entry: RTreeEntry<T>): RTreeInsertResult {
    const startTime = performance.now();
    let nodesCreated = 0;
    let nodesSplit = 0;

    try {
      if (!this.root) {
        this.root = this.createLeafNode();
        nodesCreated++;
      }

      const result = this.insertEntry(this.root, entry);
      if (result.newNode) {
        // Root was split, create new root
        const newRoot = this.createInternalNode();
        newRoot.entries.push({ id: "root1", bounds: this.root.bounds }, { id: "root2", bounds: result.newNode.bounds });
        this.root.parent = newRoot;
        result.newNode.parent = newRoot;
        this.root = newRoot;
        nodesCreated++;
      }

      this.entryCount++;
      return {
        success: true,
        nodesCreated,
        nodesSplit,
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        nodesCreated,
        nodesSplit,
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Removes an entry from the R-Tree by ID.
   * @param id - The ID of the entry to remove.
   * @returns An RTreeDeleteResult object with deletion statistics.
   */
  delete(id: string | number): RTreeDeleteResult {
    const startTime = performance.now();
    let entriesDeleted = 0;
    let nodesRemoved = 0;

    try {
      if (!this.root) {
        return {
          success: false,
          entriesDeleted: 0,
          nodesRemoved: 0,
          executionTime: performance.now() - startTime,
          error: "Tree is empty",
        };
      }

      const result = this.deleteEntry(this.root, id);
      if (result.found) {
        entriesDeleted = 1;
        this.entryCount--;

        // If root has only one entry and is not a leaf, make its child the new root
        if (this.root.entries.length === 1 && !this.root.isLeaf) {
          const childEntry = this.root.entries[0];
          const childNode = this.findNodeByEntry(childEntry);
          if (childNode) {
            this.root = childNode;
            this.root.parent = undefined;
            nodesRemoved = 1;
          }
        }
      }

      return {
        success: result.found,
        entriesDeleted,
        nodesRemoved,
        executionTime: performance.now() - startTime,
        error: result.found ? undefined : "Entry not found",
      };
    } catch (error) {
      return {
        success: false,
        entriesDeleted,
        nodesRemoved,
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Queries the R-Tree for entries that intersect with the given rectangle.
   * @param bounds - The query rectangle.
   * @param options - Optional query options.
   * @returns An RTreeQueryResult object with matching entries and statistics.
   */
  query(bounds: Rectangle, options: Partial<RTreeQueryOptions> = {}): RTreeQueryResult<T> {
    const startTime = performance.now();
    const queryOptions: RTreeQueryOptions = {
      limit: 0,
      includeTouching: false,
      ...options,
    };

    const entries: RTreeEntry<T>[] = [];
    let nodesVisited = 0;

    if (this.root) {
      this.queryNode(this.root, bounds, entries, queryOptions, nodesVisited);
    }

    return {
      entries,
      nodesVisited,
      executionTime: performance.now() - startTime,
    };
  }

  /**
   * Finds the nearest entry to a given point.
   * @param point - The query point.
   * @param maxDistance - Maximum distance to search (0 = no limit).
   * @returns The nearest entry or null if none found.
   */
  nearest(point: Point, maxDistance: number = 0): RTreeEntry<T> | null {
    if (!this.root) return null;

    let nearestEntry: RTreeEntry<T> | null = null;
    let nearestDistance = maxDistance > 0 ? maxDistance : Infinity;

    this.nearestNode(this.root, point, nearestEntry, nearestDistance);

    return nearestEntry;
  }

  /**
   * Gets statistics about the R-Tree structure.
   * @returns An RTreeStats object with tree statistics.
   */
  getStats(): RTreeStats {
    const stats = this.calculateStats(this.root);
    return {
      entryCount: this.entryCount,
      nodeCount: stats.nodeCount,
      height: stats.height,
      averageEntriesPerNode: stats.totalEntries / Math.max(stats.nodeCount, 1),
      storageUtilization: (stats.totalEntries / (stats.nodeCount * this.config.maxEntries!)) * 100,
    };
  }

  /**
   * Clears all entries from the R-Tree.
   */
  clear(): void {
    this.root = null;
    this.entryCount = 0;
  }

  /**
   * Checks if the R-Tree is empty.
   * @returns True if the tree is empty, false otherwise.
   */
  isEmpty(): boolean {
    return this.root === null || this.entryCount === 0;
  }

  /**
   * Gets the total number of entries in the tree.
   * @returns The number of entries.
   */
  size(): number {
    return this.entryCount;
  }

  // Private helper methods

  private createLeafNode(): RTreeNode<T> {
    return {
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
      entries: [],
      isLeaf: true,
    };
  }

  private createInternalNode(): RTreeNode<T> {
    return {
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
      entries: [],
      isLeaf: false,
    };
  }

  private insertEntry(node: RTreeNode<T>, entry: RTreeEntry<T>): { newNode?: RTreeNode<T> } {
    if (node.isLeaf) {
      node.entries.push(entry);
      this.updateBounds(node);

      if (node.entries.length > this.config.maxEntries!) {
        return this.splitNode(node);
      }
      return {};
    } else {
      // Choose the best child node to insert into
      const bestChild = this.chooseBestChild(node, entry);
      const result = this.insertEntry(bestChild, entry);

      if (result.newNode) {
        // Child was split, add the new node to current node
        node.entries.push({ id: `node_${Date.now()}`, bounds: result.newNode.bounds });
        this.updateBounds(node);

        if (node.entries.length > this.config.maxEntries!) {
          return this.splitNode(node);
        }
      } else {
        this.updateBounds(node);
      }

      return result;
    }
  }

  private chooseBestChild(node: RTreeNode<T>, entry: RTreeEntry<T>): RTreeNode<T> {
    let bestChild: RTreeNode<T> | null = null;
    let minEnlargement = Infinity;

    for (const childEntry of node.entries) {
      const childNode = this.findNodeByEntry(childEntry);
      if (!childNode) continue;

      const enlargement = this.calculateEnlargement(childNode.bounds, entry.bounds);
      if (
        enlargement < minEnlargement ||
        (enlargement === minEnlargement &&
          this.area(childNode.bounds) < this.area(bestChild?.bounds || { minX: 0, minY: 0, maxX: 0, maxY: 0 }))
      ) {
        minEnlargement = enlargement;
        bestChild = childNode;
      }
    }

    return bestChild!;
  }

  private splitNode(node: RTreeNode<T>): { newNode: RTreeNode<T> } {
    if (this.config.useQuadraticSplit) {
      return this.quadraticSplit(node);
    } else {
      return this.linearSplit(node);
    }
  }

  private quadraticSplit(node: RTreeNode<T>): { newNode: RTreeNode<T> } {
    const entries = [...node.entries];
    const newNode = node.isLeaf ? this.createLeafNode() : this.createInternalNode();

    // Find the two entries that are farthest apart
    let maxDistance = -1;
    let seed1 = 0;
    let seed2 = 0;

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const distance = this.calculateDistance(entries[i].bounds, entries[j].bounds);
        if (distance > maxDistance) {
          maxDistance = distance;
          seed1 = i;
          seed2 = j;
        }
      }
    }

    // Create two groups
    const group1: RTreeEntry<T>[] = [entries[seed1]];
    const group2: RTreeEntry<T>[] = [entries[seed2]];

    // Remove seeds from remaining entries
    const remaining = entries.filter((_, index) => index !== seed1 && index !== seed2);

    // Distribute remaining entries
    while (remaining.length > 0) {
      if (group1.length + remaining.length <= this.config.minEntries!) {
        group1.push(...remaining);
        break;
      }
      if (group2.length + remaining.length <= this.config.minEntries!) {
        group2.push(...remaining);
        break;
      }

      // Choose which group to add the next entry to
      let bestGroup = 1;
      let minEnlargement1 = Infinity;
      let minEnlargement2 = Infinity;

      for (const entry of remaining) {
        const enlargement1 = this.calculateGroupEnlargement(group1, entry);
        const enlargement2 = this.calculateGroupEnlargement(group2, entry);
        if (enlargement1 < minEnlargement1) minEnlargement1 = enlargement1;
        if (enlargement2 < minEnlargement2) minEnlargement2 = enlargement2;
      }

      if (minEnlargement1 < minEnlargement2) {
        bestGroup = 1;
      } else if (minEnlargement2 < minEnlargement1) {
        bestGroup = 2;
      } else {
        // Choose group with smaller area
        const area1 = this.calculateGroupArea(group1);
        const area2 = this.calculateGroupArea(group2);
        bestGroup = area1 < area2 ? 1 : 2;
      }

      const entryToAdd = remaining.shift()!;
      if (bestGroup === 1) {
        group1.push(entryToAdd);
      } else {
        group2.push(entryToAdd);
      }
    }

    // Update nodes
    node.entries = group1;
    newNode.entries = group2;
    this.updateBounds(node);
    this.updateBounds(newNode);

    return { newNode };
  }

  private linearSplit(node: RTreeNode<T>): { newNode: RTreeNode<T> } {
    const entries = [...node.entries];
    const newNode = node.isLeaf ? this.createLeafNode() : this.createInternalNode();

    // Find the two entries that are farthest apart along each axis
    let maxXDistance = -1;
    let maxYDistance = -1;
    let seed1X = 0;
    let seed2X = 0;
    let seed1Y = 0;
    let seed2Y = 0;

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const xDistance =
          Math.abs(entries[i].bounds.maxX - entries[j].bounds.minX) +
          Math.abs(entries[j].bounds.maxX - entries[i].bounds.minX);
        const yDistance =
          Math.abs(entries[i].bounds.maxY - entries[j].bounds.minY) +
          Math.abs(entries[j].bounds.maxY - entries[i].bounds.minY);

        if (xDistance > maxXDistance) {
          maxXDistance = xDistance;
          seed1X = i;
          seed2X = j;
        }
        if (yDistance > maxYDistance) {
          maxYDistance = yDistance;
          seed1Y = i;
          seed2Y = j;
        }
      }
    }

    // Choose the axis with the maximum separation
    const useXAxis = maxXDistance > maxYDistance;
    const seed1 = useXAxis ? seed1X : seed1Y;
    const seed2 = useXAxis ? seed2X : seed2Y;

    // Create two groups
    const group1: RTreeEntry<T>[] = [entries[seed1]];
    const group2: RTreeEntry<T>[] = [entries[seed2]];

    // Remove seeds from remaining entries
    const remaining = entries.filter((_, index) => index !== seed1 && index !== seed2);

    // Distribute remaining entries
    while (remaining.length > 0) {
      if (group1.length + remaining.length <= this.config.minEntries!) {
        group1.push(...remaining);
        break;
      }
      if (group2.length + remaining.length <= this.config.minEntries!) {
        group2.push(...remaining);
        break;
      }

      // Choose which group to add the next entry to
      const entryToAdd = remaining.shift()!;
      const enlargement1 = this.calculateGroupEnlargement(group1, entryToAdd);
      const enlargement2 = this.calculateGroupEnlargement(group2, entryToAdd);

      if (enlargement1 < enlargement2) {
        group1.push(entryToAdd);
      } else if (enlargement2 < enlargement1) {
        group2.push(entryToAdd);
      } else {
        // Choose group with smaller area
        const area1 = this.calculateGroupArea(group1);
        const area2 = this.calculateGroupArea(group2);
        if (area1 < area2) {
          group1.push(entryToAdd);
        } else {
          group2.push(entryToAdd);
        }
      }
    }

    // Update nodes
    node.entries = group1;
    newNode.entries = group2;
    this.updateBounds(node);
    this.updateBounds(newNode);

    return { newNode };
  }

  private deleteEntry(node: RTreeNode<T>, id: string | number): { found: boolean } {
    if (node.isLeaf) {
      const index = node.entries.findIndex(entry => entry.id === id);
      if (index !== -1) {
        node.entries.splice(index, 1);
        this.updateBounds(node);
        return { found: true };
      }
      return { found: false };
    } else {
      for (const entry of node.entries) {
        if (this.boundsIntersect(entry.bounds, { minX: 0, minY: 0, maxX: 0, maxY: 0 })) {
          const childNode = this.findNodeByEntry(entry);
          if (childNode) {
            const result = this.deleteEntry(childNode, id);
            if (result.found) {
              this.updateBounds(node);
              return { found: true };
            }
          }
        }
      }
      return { found: false };
    }
  }

  private queryNode(
    node: RTreeNode<T>,
    bounds: Rectangle,
    results: RTreeEntry<T>[],
    options: RTreeQueryOptions,
    nodesVisited: number
  ): void {
    nodesVisited++;

    if (!this.boundsIntersect(node.bounds, bounds)) {
      return;
    }

    if (node.isLeaf) {
      for (const entry of node.entries) {
        if (this.boundsIntersect(entry.bounds, bounds, options.includeTouching)) {
          results.push(entry);
          if (options.limit && options.limit > 0 && results.length >= options.limit) {
            return;
          }
        }
      }
    } else {
      for (const entry of node.entries) {
        if (this.boundsIntersect(entry.bounds, bounds)) {
          const childNode = this.findNodeByEntry(entry);
          if (childNode) {
            this.queryNode(childNode, bounds, results, options, nodesVisited);
            if (options.limit && options.limit > 0 && results.length >= options.limit) {
              return;
            }
          }
        }
      }
    }
  }

  private nearestNode(
    node: RTreeNode<T>,
    point: Point,
    nearestEntry: RTreeEntry<T> | null,
    nearestDistance: number
  ): void {
    if (node.isLeaf) {
      for (const entry of node.entries) {
        const distance = this.pointToBoundsDistance(point, entry.bounds);
        if (distance < nearestDistance) {
          nearestEntry = entry;
          nearestDistance = distance;
        }
      }
    } else {
      // Sort children by distance to point
      const childrenWithDistance = node.entries
        .map(entry => ({
          entry,
          distance: this.pointToBoundsDistance(point, entry.bounds),
        }))
        .sort((a, b) => a.distance - b.distance);

      for (const { entry, distance } of childrenWithDistance) {
        if (distance < nearestDistance) {
          const childNode = this.findNodeByEntry(entry);
          if (childNode) {
            this.nearestNode(childNode, point, nearestEntry, nearestDistance);
          }
        }
      }
    }
  }

  private findNodeByEntry(entry: RTreeEntry<T>): RTreeNode<T> | null {
    // This is a simplified implementation. In a real R-Tree, you'd maintain
    // parent-child relationships or use a different approach to find nodes.
    // For this implementation, we'll use a recursive search.
    if (!this.root) return null;
    return this.findNodeByEntryRecursive(this.root, entry);
  }

  private findNodeByEntryRecursive(node: RTreeNode<T>, targetEntry: RTreeEntry<T>): RTreeNode<T> | null {
    if (node.isLeaf) {
      return node.entries.some(entry => entry.id === targetEntry.id) ? node : null;
    }

    for (const entry of node.entries) {
      if (entry.id === targetEntry.id) {
        return node;
      }
      const childNode = this.findNodeByEntryRecursive(node, entry);
      if (childNode) {
        return childNode;
      }
    }

    return null;
  }

  private updateBounds(node: RTreeNode<T>): void {
    if (node.entries.length === 0) {
      node.bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const entry of node.entries) {
      minX = Math.min(minX, entry.bounds.minX);
      minY = Math.min(minY, entry.bounds.minY);
      maxX = Math.max(maxX, entry.bounds.maxX);
      maxY = Math.max(maxY, entry.bounds.maxY);
    }

    node.bounds = { minX, minY, maxX, maxY };
  }

  private calculateStats(node: RTreeNode<T> | null): { nodeCount: number; height: number; totalEntries: number } {
    if (!node) {
      return { nodeCount: 0, height: 0, totalEntries: 0 };
    }

    let nodeCount = 1;
    let height = 1;
    let totalEntries = node.entries.length;

    if (!node.isLeaf) {
      for (const entry of node.entries) {
        const childNode = this.findNodeByEntry(entry);
        if (childNode) {
          const childStats = this.calculateStats(childNode);
          nodeCount += childStats.nodeCount;
          height = Math.max(height, childStats.height + 1);
          totalEntries += childStats.totalEntries;
        }
      }
    }

    return { nodeCount, height, totalEntries };
  }

  // Utility methods

  private boundsIntersect(bounds1: Rectangle, bounds2: Rectangle, includeTouching: boolean = false): boolean {
    if (includeTouching) {
      return !(
        bounds1.maxX < bounds2.minX ||
        bounds2.maxX < bounds1.minX ||
        bounds1.maxY < bounds2.minY ||
        bounds2.maxY < bounds1.minY
      );
    } else {
      return !(
        bounds1.maxX <= bounds2.minX ||
        bounds2.maxX <= bounds1.minX ||
        bounds1.maxY <= bounds2.minY ||
        bounds2.maxY <= bounds1.minY
      );
    }
  }

  private calculateEnlargement(bounds1: Rectangle, bounds2: Rectangle): number {
    const enlarged = {
      minX: Math.min(bounds1.minX, bounds2.minX),
      minY: Math.min(bounds1.minY, bounds2.minY),
      maxX: Math.max(bounds1.maxX, bounds2.maxX),
      maxY: Math.max(bounds1.maxY, bounds2.maxY),
    };
    return this.area(enlarged) - this.area(bounds1);
  }

  private calculateGroupEnlargement(group: RTreeEntry<T>[], entry: RTreeEntry<T>): number {
    if (group.length === 0) return this.area(entry.bounds);

    const groupBounds = this.calculateGroupBounds(group);
    return this.calculateEnlargement(groupBounds, entry.bounds);
  }

  private calculateGroupBounds(group: RTreeEntry<T>[]): Rectangle {
    if (group.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const entry of group) {
      minX = Math.min(minX, entry.bounds.minX);
      minY = Math.min(minY, entry.bounds.minY);
      maxX = Math.max(maxX, entry.bounds.maxX);
      maxY = Math.max(maxY, entry.bounds.maxY);
    }

    return { minX, minY, maxX, maxY };
  }

  private calculateGroupArea(group: RTreeEntry<T>[]): number {
    const bounds = this.calculateGroupBounds(group);
    return this.area(bounds);
  }

  private area(bounds: Rectangle): number {
    return (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
  }

  private calculateDistance(bounds1: Rectangle, bounds2: Rectangle): number {
    const dx = Math.max(0, Math.max(bounds1.minX, bounds2.minX) - Math.min(bounds1.maxX, bounds2.maxX));
    const dy = Math.max(0, Math.max(bounds1.minY, bounds2.minY) - Math.min(bounds1.maxY, bounds2.maxY));
    return dx * dx + dy * dy;
  }

  private pointToBoundsDistance(point: Point, bounds: Rectangle): number {
    const dx = Math.max(0, Math.max(bounds.minX - point.x, point.x - bounds.maxX));
    const dy = Math.max(0, Math.max(bounds.minY - point.y, point.y - bounds.maxY));
    return dx * dx + dy * dy;
  }
}
