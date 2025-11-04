/**
 * A* Pathfinding Algorithm Core Implementation
 *
 * Implementation of the A* (A-star) pathfinding algorithm with comprehensive
 * features including multiple heuristics, caching, statistics, and optimization.
 *
 * Mathematical Theory:
 * A* is an informed search algorithm that finds the shortest path between
 * two points by using a heuristic function to estimate the cost from any
 * node to the goal. The algorithm maintains two sets of nodes:
 * - Open set: Nodes to be evaluated
 * - Closed set: Nodes already evaluated
 *
 * The algorithm uses the evaluation function: f(n) = g(n) + h(n)
 * where:
 * - g(n) is the cost from start to node n
 * - h(n) is the heuristic estimate from node n to goal
 * - f(n) is the total estimated cost of the path through n
 *
 * @module algorithms/pathfinding/astar
 */

import type {
  Point,
  AStarNode,
  AStarConfig,
  AStarResult,
  AStarGrid,
  AStarStats,
  AStarEvent,
  AStarEventHandler,
  AStarOptions,
  AStarCacheEntry,
  AStarPerformanceMetrics,
  AStarHeuristic,
} from "./astar-types";
import { AStarEventType, DEFAULT_ASTAR_CONFIG, DEFAULT_ASTAR_OPTIONS } from "./astar-types";

import { defaultHeuristic } from "./heuristics";

/**
 * A* Pathfinding Algorithm Implementation
 *
 * Provides comprehensive pathfinding capabilities with multiple optimization
 * features including caching, statistics collection, and event handling.
 */
export class AStar {
  private config: AStarConfig;
  private heuristic: AStarHeuristic;
  private eventHandlers: AStarEventHandler[];
  private cache: Map<string, AStarCacheEntry>;
  private stats: AStarStats;
  private enableCaching: boolean;
  private enableStats: boolean;
  private enableDebug: boolean;
  private cacheSize: number;

  /**
   *
   * @param options
   * @example
   */
  constructor(options: Partial<AStarOptions> = {}) {
    const opts = { ...DEFAULT_ASTAR_OPTIONS, ...options };

    this.config = { ...DEFAULT_ASTAR_CONFIG, ...opts.config };
    this.heuristic = opts.heuristic || defaultHeuristic;
    this.eventHandlers = opts.eventHandlers || [];
    this.enableCaching = opts.enableCaching;
    this.enableStats = opts.enableStats;
    this.enableDebug = opts.enableDebug;
    this.cacheSize = opts.cacheSize;

    this.cache = new Map();
    this.stats = {
      totalOperations: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      totalNodesExplored: 0,
      averageNodesExplored: 0,
      successRate: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Find path between two points using A* algorithm
   *
   * @param start Starting point
   * @param goal Goal point
   * @param grid Optional grid for obstacle checking
   * @returns Pathfinding result
   * @example
   */
  findPath(start: Point, goal: Point, grid?: AStarGrid): AStarResult {
    const startTime = performance.now();
    this.emitEvent(AStarEventType.PATHFINDING_STARTED, { start, goal });

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(start, goal);
      if (this.enableCaching && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        cached.accessCount++;
        this.emitEvent(AStarEventType.CACHE_HIT, { cacheKey });

        const result: AStarResult = {
          success: true,
          path: cached.path,
          totalCost: cached.totalCost,
          nodesExplored: 0,
          iterations: 0,
          executionTime: 0,
          detailedPath: [],
          exploredNodes: [],
        };

        this.updateStats(result, performance.now() - startTime);
        return result;
      }

      this.emitEvent(AStarEventType.CACHE_MISS, { cacheKey });

      // Perform A* search
      const result = this.performAStarSearch(start, goal, grid);

      // Cache result if successful
      if (this.enableCaching && result.success) {
        this.cacheResult(cacheKey, start, goal, result);
      }

      this.updateStats(result, performance.now() - startTime);
      this.emitEvent(AStarEventType.PATHFINDING_COMPLETED, result);

      return result;
    } catch (error) {
      const result: AStarResult = {
        success: false,
        path: [],
        totalCost: 0,
        nodesExplored: 0,
        iterations: 0,
        executionTime: performance.now() - startTime,
        detailedPath: [],
        exploredNodes: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };

      this.updateStats(result, result.executionTime);
      this.emitEvent(AStarEventType.PATH_NOT_FOUND, result);

      return result;
    }
  }

  /**
   * Perform the core A* search algorithm
   *
   * @param start Starting point
   * @param goal Goal point
   * @param grid Optional grid for obstacle checking
   * @returns Pathfinding result
   * @example
   */
  private performAStarSearch(start: Point, goal: Point, grid?: AStarGrid): AStarResult {
    const openSet = new Map<string, AStarNode>();
    const closedSet = new Set<string>();
    const nodes = new Map<string, AStarNode>();

    // Create start and goal nodes
    const startNode = this.createNode(start, 0, this.heuristic(start, goal), null, true);
    const goalNode = this.createNode(goal, 0, 0, null, true);

    openSet.set(startNode.id, startNode);
    nodes.set(startNode.id, startNode);
    nodes.set(goalNode.id, goalNode);

    let iterations = 0;
    const exploredNodes: AStarNode[] = [];

    while (openSet.size > 0 && iterations < this.config.maxIterations) {
      iterations++;

      // Find node with lowest f-score
      const currentNode = this.getLowestFScoreNode(openSet);

      // Move current node from open to closed set
      openSet.delete(currentNode.id);
      closedSet.add(currentNode.id);
      exploredNodes.push(currentNode);

      this.emitEvent(AStarEventType.NODE_EXPLORED, { node: currentNode, iteration: iterations });

      // Check if we reached the goal
      if (this.isGoalReached(currentNode, goal)) {
        const path = this.reconstructPath(currentNode);
        const detailedPath = this.reconstructDetailedPath(currentNode);

        this.emitEvent(AStarEventType.PATH_FOUND, { path, iterations });

        return {
          success: true,
          path,
          totalCost: currentNode.gScore,
          nodesExplored: exploredNodes.length,
          iterations,
          executionTime: 0, // Will be set by caller
          detailedPath,
          exploredNodes,
        };
      }

      // Explore neighbors
      const neighbors = this.getNeighbors(currentNode, grid);

      for (const neighbor of neighbors) {
        const neighborId = neighbor.id;

        // Skip if already in closed set
        if (closedSet.has(neighborId)) {
          continue;
        }

        // Calculate tentative g-score
        const tentativeGScore = currentNode.gScore + this.getDistance(currentNode, neighbor);

        // Check if this is a better path to the neighbor
        if (!openSet.has(neighborId)) {
          // New node, add to open set
          neighbor.gScore = tentativeGScore;
          neighbor.hScore = this.heuristic(neighbor.position, goal);
          neighbor.fScore = neighbor.gScore + neighbor.hScore;
          neighbor.parent = currentNode;

          openSet.set(neighborId, neighbor);
          nodes.set(neighborId, neighbor);
        } else {
          // Existing node, check if this path is better
          const existingNode = openSet.get(neighborId)!;
          if (tentativeGScore < existingNode.gScore) {
            existingNode.gScore = tentativeGScore;
            existingNode.fScore = existingNode.gScore + existingNode.hScore;
            existingNode.parent = currentNode;
          }
        }
      }
    }

    // No path found
    this.emitEvent(AStarEventType.PATH_NOT_FOUND, { iterations, nodesExplored: exploredNodes.length });

    return {
      success: false,
      path: [],
      totalCost: 0,
      nodesExplored: exploredNodes.length,
      iterations,
      executionTime: 0, // Will be set by caller
      detailedPath: [],
      exploredNodes,
    };
  }

  /**
   * Create a new A* node
   * @param position
   * @param gScore
   * @param hScore
   * @param parent
   * @param walkable
   * @param data
   * @example
   */
  private createNode(
    position: Point,
    gScore: number,
    hScore: number,
    parent: AStarNode | null,
    walkable: boolean,
    data?: any
  ): AStarNode {
    return {
      id: this.getNodeId(position),
      position,
      gScore,
      hScore,
      fScore: gScore + hScore,
      parent,
      walkable,
      data,
    };
  }

  /**
   * Generate unique node ID from position
   * @param position
   * @example
   */
  private getNodeId(position: Point): string {
    return `${position.x},${position.y}`;
  }

  /**
   * Get node with lowest f-score from open set
   * @param openSet
   * @example
   */
  private getLowestFScoreNode(openSet: Map<string, AStarNode>): AStarNode {
    let lowestNode: AStarNode | null = null;
    let lowestFScore = Infinity;

    for (const node of openSet.values()) {
      if (node.fScore < lowestFScore) {
        lowestFScore = node.fScore;
        lowestNode = node;
      } else if (this.config.useTieBreaking && node.fScore === lowestFScore) {
        // Tie-breaking: prefer node with higher g-score
        if (node.gScore > lowestNode!.gScore) {
          lowestNode = node;
        }
      }
    }

    return lowestNode!;
  }

  /**
   * Check if goal is reached
   * @param node
   * @param goal
   * @example
   */
  private isGoalReached(node: AStarNode, goal: Point): boolean {
    return node.position.x === goal.x && node.position.y === goal.y;
  }

  /**
   * Get neighboring nodes
   * @param node
   * @param grid
   * @example
   */
  private getNeighbors(node: AStarNode, grid?: AStarGrid): AStarNode[] {
    const neighbors: AStarNode[] = [];
    const { x, y } = node.position;

    // Define movement directions
    const directions = [
      { dx: 0, dy: -1, cost: this.config.regularCost }, // North
      { dx: 1, dy: 0, cost: this.config.regularCost }, // East
      { dx: 0, dy: 1, cost: this.config.regularCost }, // South
      { dx: -1, dy: 0, cost: this.config.regularCost }, // West
    ];

    // Add diagonal directions if allowed
    if (this.config.allowDiagonal) {
      directions.push(
        { dx: 1, dy: -1, cost: this.config.diagonalCost }, // Northeast
        { dx: 1, dy: 1, cost: this.config.diagonalCost }, // Southeast
        { dx: -1, dy: 1, cost: this.config.diagonalCost }, // Southwest
        { dx: -1, dy: -1, cost: this.config.diagonalCost } // Northwest
      );
    }

    for (const { dx, dy, cost: _cost } of directions) {
      const newX = x + dx;
      const newY = y + dy;

      // Check bounds and obstacles
      if (this.isValidPosition(newX, newY, grid)) {
        const neighbor = this.createNode(
          { x: newX, y: newY },
          0, // g-score will be calculated later
          0, // h-score will be calculated later
          null,
          true
        );
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  /**
   * Check if position is valid (within bounds and not blocked)
   * @param x
   * @param y
   * @param grid
   * @example
   */
  private isValidPosition(x: number, y: number, grid?: AStarGrid): boolean {
    if (!grid) {
      return true; // No grid constraints
    }

    // Check bounds
    if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) {
      return false;
    }

    // Check if cell is walkable
    return grid.cells[y][x];
  }

  /**
   * Calculate distance between two nodes
   * @param node1
   * @param node2
   * @example
   */
  private getDistance(node1: AStarNode, node2: AStarNode): number {
    const dx = Math.abs(node1.position.x - node2.position.x);
    const dy = Math.abs(node1.position.y - node2.position.y);

    if (dx === 1 && dy === 1) {
      return this.config.diagonalCost;
    } else {
      return this.config.regularCost;
    }
  }

  /**
   * Reconstruct path from goal to start
   * @param goalNode
   * @example
   */
  private reconstructPath(goalNode: AStarNode): Point[] {
    const path: Point[] = [];
    let currentNode: AStarNode | null = goalNode;

    while (currentNode) {
      path.unshift(currentNode.position);
      currentNode = currentNode.parent;
    }

    return path;
  }

  /**
   * Reconstruct detailed path with node information
   * @param goalNode
   * @example
   */
  private reconstructDetailedPath(goalNode: AStarNode): AStarNode[] {
    const path: AStarNode[] = [];
    let currentNode: AStarNode | null = goalNode;

    while (currentNode) {
      path.unshift(currentNode);
      currentNode = currentNode.parent;
    }

    return path;
  }

  /**
   * Generate cache key for start and goal points
   * @param start
   * @param goal
   * @example
   */
  private getCacheKey(start: Point, goal: Point): string {
    return `${start.x},${start.y}-${goal.x},${goal.y}`;
  }

  /**
   * Cache pathfinding result
   * @param cacheKey
   * @param start
   * @param goal
   * @param result
   * @example
   */
  private cacheResult(cacheKey: string, start: Point, goal: Point, result: AStarResult): void {
    if (this.cache.size >= this.cacheSize) {
      // Remove least recently used entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(cacheKey, {
      start,
      goal,
      path: result.path,
      totalCost: result.totalCost,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  /**
   * Update statistics
   * @param result
   * @param executionTime
   * @example
   */
  private updateStats(result: AStarResult, executionTime: number): void {
    if (!this.enableStats) return;

    result.executionTime = executionTime;

    this.stats.totalOperations++;
    this.stats.totalExecutionTime += executionTime;
    this.stats.averageExecutionTime = this.stats.totalExecutionTime / this.stats.totalOperations;
    this.stats.totalNodesExplored += result.nodesExplored;
    this.stats.averageNodesExplored = this.stats.totalNodesExplored / this.stats.totalOperations;

    const successfulOperations = this.stats.totalOperations * this.stats.successRate + (result.success ? 1 : 0);
    this.stats.successRate = successfulOperations / this.stats.totalOperations;

    // Calculate cache hit rate
    const cacheHits = this.stats.totalOperations * this.stats.cacheHitRate + (result.executionTime === 0 ? 1 : 0);
    this.stats.cacheHitRate = cacheHits / this.stats.totalOperations;

    // Estimate memory usage
    this.stats.memoryUsage = this.cache.size * 100; // Rough estimate
  }

  /**
   * Emit event to registered handlers
   * @param type
   * @param data
   * @example
   */
  private emitEvent(type: AStarEventType, data?: any): void {
    if (!this.enableDebug) return;

    const event: AStarEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in A* event handler:", error);
      }
    }
  }

  /**
   * Add event handler
   * @param handler
   * @example
   */
  addEventHandler(handler: AStarEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   * @param handler
   * @example
   */
  removeEventHandler(handler: AStarEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Get current statistics
   * @example
   */
  getStats(): AStarStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   * @example
   */
  getPerformanceMetrics(): AStarPerformanceMetrics {
    const totalPathLength =
      this.stats.totalOperations > 0
        ? this.cache.size > 0
          ? Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.path.length, 0) / this.cache.size
          : 0
        : 0;

    const averageExplorationRatio =
      this.stats.totalOperations > 0 ? this.stats.averageNodesExplored / Math.max(totalPathLength, 1) : 0;

    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        this.stats.successRate * 40 + this.stats.cacheHitRate * 30 + Math.max(0, 1 - averageExplorationRatio) * 30
      )
    );

    return {
      memoryUsage: this.stats.memoryUsage,
      cacheSize: this.cache.size,
      cacheHitRate: this.stats.cacheHitRate,
      averagePathLength: totalPathLength,
      averageExplorationRatio,
      performanceScore,
    };
  }

  /**
   * Clear cache
   * @example
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reset statistics
   * @example
   */
  resetStats(): void {
    this.stats = {
      totalOperations: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      totalNodesExplored: 0,
      averageNodesExplored: 0,
      successRate: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Update configuration
   * @param newConfig
   * @example
   */
  updateConfig(newConfig: Partial<AStarConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Set heuristic function
   * @param heuristic
   * @example
   */
  setHeuristic(heuristic: AStarHeuristic): void {
    this.heuristic = heuristic;
  }
}
