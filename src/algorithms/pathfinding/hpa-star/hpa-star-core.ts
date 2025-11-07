/**
 * @module algorithms/pathfinding/hpa-star/hpa-star-core
 * @description Main implementation of HPA* (Hierarchical Pathfinding A*) algorithm.
 */

import {
  Point,
  CellType,
  GridCell,
  Cluster,
  Entrance,
  AbstractNode,
  AbstractEdge,
  HPAConfig,
  HPAStats,
  HPAResult,
  HPAOptions,
  HPAValidationOptions,
  HPAValidationResult,
  HPAComparisonOptions,
  HPAComparisonResult,
  HPASerializationOptions,
  HPASerialization,
  HPAPerformanceOptions,
  HPAPerformanceResult,
  DynamicUpdateOptions,
  DynamicUpdateResult,
} from "./hpa-star-types";
import { HPAClustering } from "./hpa-clustering";
import { HPAAbstractGraph } from "./hpa-abstract-graph";
import { HPAPathRefinement } from "./hpa-path-refinement";

/**
 * The HPAStar class provides hierarchical pathfinding using A* with abstract graph abstraction.
 * HPA* is particularly efficient for large maps where traditional A* would be too slow,
 * as it preprocesses the map into clusters and creates an abstract graph for high-level planning.
 *
 * @example
 * ```typescript
 * const hpaStar = new HPAStar();
 * const grid = HPAStarUtils.generateTestGrid(1000, 1000, 0.3);
 * const start = { x: 0, y: 0 };
 * const goal = { x: 999, y: 999 };
 * const result = hpaStar.findPath(grid, 1000, 1000, start, goal);
 *
 * console.log(result.path); // Hierarchical path from start to goal
 * console.log(result.stats); // Performance statistics
 * ```
 */
export class HPAStar {
  private config: HPAConfig;
  private stats: HPAStats;
  private cache: Map<string, HPAResult> = new Map();
  private clusters: Cluster[] = [];
  private entrances: Entrance[] = [];
  private abstractNodes: AbstractNode[] = [];
  private abstractEdges: AbstractEdge[] = [];

  /**
   * Creates an instance of HPAStar.
   * @param config - Optional configuration for the algorithm.
   * @example
   */
  constructor(config: Partial<HPAConfig> = {}) {
    this.config = {
      width: 100,
      height: 100,
      clusterSize: 10,
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      cardinalCost: 1,
      diagonalCost: Math.sqrt(2),
      maxPathLength: 10000,
      usePathSmoothing: true,
      smoothingFactor: 0.5,
      useEarlyTermination: true,
      validateInput: true,
      enableCaching: true,
      tolerance: 1e-10,
      ...config,
    };

    // Validate configuration
    if (this.config.width <= 0 || this.config.height <= 0) {
      throw new Error(`Invalid grid dimensions: width=${this.config.width}, height=${this.config.height}`);
    }
    if (this.config.clusterSize <= 0) {
      throw new Error(`Invalid cluster size: ${this.config.clusterSize}`);
    }
    if (this.config.cardinalCost <= 0 || this.config.diagonalCost <= 0) {
      throw new Error(
        `Invalid movement costs: cardinal=${this.config.cardinalCost}, diagonal=${this.config.diagonalCost}`
      );
    }

    this.stats = {
      clustersCreated: 0,
      entrancesFound: 0,
      abstractNodesProcessed: 0,
      abstractEdgesCreated: 0,
      pathRefinements: 0,
      executionTime: 0,
      abstractPathfindingTime: 0,
      pathRefinementTime: 0,
      success: true,
    };
  }

  /**
   * Finds a path from start to goal using hierarchical pathfinding.
   * @param grid - The grid as a 1D array.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Pathfinding options.
   * @returns HPA* pathfinding result.
   * @example
   */
  findPath(
    grid: CellType[],
    width: number,
    height: number,
    start: Point,
    goal: Point,
    options: Partial<HPAOptions> = {}
  ): HPAResult {
    const startTime = performance.now();
    const hpaOptions: HPAOptions = {
      returnAbstractPath: true,
      returnRefinedPath: true,
      usePathSmoothing: true,
      useEarlyTermination: true,
      maxIterations: width * height,
      useGoalBounding: false,
      useHierarchicalAbstraction: true,
      ...options,
    };

    try {
      // Update configuration
      this.config = { ...this.config, width, height };

      // Validate input
      if (this.config.validateInput) {
        const validation = this.validateInput(grid, width, height, start, goal);
        if (!validation.isValid) {
          throw new Error(`Invalid input: ${validation.errors.join(", ")}`);
        }
      }

      // Check cache
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, start, goal, hpaOptions);
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Reset statistics
      this.resetStats();

      // Generate clusters if not already done
      if (this.clusters.length === 0) {
        this.generateClusters(grid);
      }

      // Check if start and goal are the same
      const dx = Math.abs(start.x - goal.x);
      const dy = Math.abs(start.y - goal.y);
      if (dx < this.config.tolerance && dy < this.config.tolerance) {
        const executionTime = performance.now() - startTime;
        this.resetStats();
        return {
          path: [start],
          found: true,
          cost: 0,
          length: 1,
          abstractPath: [],
          refinedPath: [start],
          stats: this.getStats(),
        };
      }

      // Find abstract path
      const abstractPath = this.findAbstractPath(start, goal, hpaOptions);

      if (abstractPath.length === 0) {
        return this.createFailureResult(startTime, "No abstract path found");
      }

      // Refine path
      const refinedPath = this.refinePath(abstractPath, grid, hpaOptions);

      if (refinedPath.length === 0) {
        return this.createFailureResult(startTime, "Path refinement failed");
      }

      // Ensure path starts at start and ends at goal
      const finalPath: Point[] = [];
      if (refinedPath.length > 0) {
        // Add start if not already at the beginning
        if (refinedPath[0].x !== start.x || refinedPath[0].y !== start.y) {
          finalPath.push(start);
        }
        // Add refined path
        finalPath.push(...refinedPath);
        // Ensure goal is at the end
        const lastPoint = finalPath[finalPath.length - 1];
        if (lastPoint.x !== goal.x || lastPoint.y !== goal.y) {
          finalPath.push(goal);
        }
      }

      const executionTime = performance.now() - startTime;
      this.stats.executionTime = executionTime;
      this.stats.success = true;

      const result: HPAResult = {
        path: finalPath.length > 0 ? finalPath : refinedPath,
        found: true,
        cost: this.calculatePathCost(finalPath.length > 0 ? finalPath : refinedPath),
        length: finalPath.length > 0 ? finalPath.length : refinedPath.length,
        abstractPath,
        refinedPath: finalPath.length > 0 ? finalPath : refinedPath,
        stats: this.getStats(),
      };

      // Cache result
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, start, goal, hpaOptions);
        this.cache.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      return this.createFailureResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }

  /**
   * Generates clusters from the grid.
   * @param grid - The grid.
   * @example
   */
  private generateClusters(grid: CellType[]): void {
    const clusterResult = HPAClustering.generateClusters(grid, this.config);

    if (clusterResult.success) {
      this.clusters = clusterResult.clusters;
      this.stats.clustersCreated = clusterResult.stats.clustersCreated;
      this.stats.entrancesFound = clusterResult.stats.entrancesFound;
    } else {
      throw new Error("Failed to generate clusters");
    }
  }

  /**
   * Finds an abstract path using the hierarchical graph.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Pathfinding options.
   * @returns Abstract path.
   * @example
   */
  private findAbstractPath(start: Point, goal: Point, options: HPAOptions): AbstractNode[] {
    const abstractStartTime = performance.now();

    try {
      // Create abstract graph if not already done
      if (this.abstractNodes.length === 0) {
        this.createAbstractGraph();
      }

      // Find start and goal clusters
      const startCluster = this.findClusterContainingPoint(start);
      const goalCluster = this.findClusterContainingPoint(goal);

      if (!startCluster || !goalCluster) {
        return [];
      }

      // Find abstract path using A*
      const abstractPath = this.findAbstractPathWithAStar(startCluster, goalCluster, options);

      const abstractEndTime = performance.now();
      this.stats.abstractPathfindingTime = abstractEndTime - abstractStartTime;

      return abstractPath;
    } catch (error) {
      return [];
    }
  }

  /**
   * Creates the abstract graph from clusters and entrances.
   * @example
   */
  private createAbstractGraph(): void {
    const graphResult = HPAAbstractGraph.constructAbstractGraph(this.clusters, this.entrances, this.config);

    if (graphResult.success) {
      this.abstractNodes = graphResult.nodes;
      this.abstractEdges = graphResult.edges;
      this.stats.abstractNodesProcessed = graphResult.stats.nodesCreated;
      this.stats.abstractEdgesCreated = graphResult.stats.edgesCreated;
    } else {
      throw new Error("Failed to create abstract graph");
    }
  }

  /**
   * Finds an abstract path using A* on the abstract graph.
   * @param startCluster - Starting cluster.
   * @param goalCluster - Goal cluster.
   * @param options - Pathfinding options.
   * @returns Abstract path.
   * @example
   */
  private findAbstractPathWithAStar(startCluster: Cluster, goalCluster: Cluster, options: HPAOptions): AbstractNode[] {
    const openSet: AbstractNode[] = [];
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const startNode = this.abstractNodes.find(n => n.clusterId === startCluster.id);
    const goalNode = this.abstractNodes.find(n => n.clusterId === goalCluster.id);

    if (!startNode || !goalNode) {
      return [];
    }

    gScore.set(startNode.id, 0);
    fScore.set(startNode.id, this.heuristic(startNode, goalNode));
    openSet.push({ ...startNode, g: 0, h: this.heuristic(startNode, goalNode), f: fScore.get(startNode.id)! });

    let iterations = 0;
    const maxIterations = options.maxIterations || 1000;

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;

      // Find node with lowest f score
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }

      const current = openSet.splice(currentIndex, 1)[0];

      if (current.id === goalNode.id) {
        // Reconstruct path
        const path: AbstractNode[] = [];
        let nodeId: string | undefined = goalNode.id;

        while (nodeId) {
          const node = this.abstractNodes.find(n => n.id === nodeId);
          if (node) {
            path.unshift(node);
          }
          nodeId = cameFrom.get(nodeId!);
        }

        return path;
      }

      closedSet.add(current.id);

      // Check neighbors
      const neighbors = this.getAbstractNeighbors(current);

      for (const neighbor of neighbors) {
        if (closedSet.has(neighbor.id)) {
          continue;
        }

        const tentativeG = gScore.get(current.id)! + this.getAbstractEdgeCost(current, neighbor);

        if (!gScore.has(neighbor.id) || tentativeG < gScore.get(neighbor.id)!) {
          cameFrom.set(neighbor.id, current.id);
          gScore.set(neighbor.id, tentativeG);
          fScore.set(neighbor.id, tentativeG + this.heuristic(neighbor, goalNode));

          // Add to open set if not already there
          if (!openSet.some(node => node.id === neighbor.id)) {
            openSet.push({
              ...neighbor,
              g: tentativeG,
              h: this.heuristic(neighbor, goalNode),
              f: fScore.get(neighbor.id)!,
            });
          }
        }
      }
    }

    return [];
  }

  /**
   * Refines an abstract path into a detailed path.
   * @param abstractPath - Abstract path.
   * @param grid - The grid.
   * @param options - Pathfinding options.
   * @returns Refined path.
   * @example
   */
  private refinePath(abstractPath: AbstractNode[], grid: CellType[], options: HPAOptions): Point[] {
    const refinementStartTime = performance.now();

    try {
      const refinementResult = HPAPathRefinement.refinePath(
        abstractPath,
        this.clusters,
        this.entrances,
        grid,
        this.config,
        {
          useAStarRefinement: true,
          usePathSmoothing: options.usePathSmoothing,
          smoothingFactor: this.config.smoothingFactor,
        }
      );

      const refinementEndTime = performance.now();
      this.stats.pathRefinementTime = refinementEndTime - refinementStartTime;
      this.stats.pathRefinements++;

      return refinementResult.refinedPath;
    } catch (error) {
      return [];
    }
  }

  /**
   * Finds the cluster containing a point.
   * @param point - Point to find cluster for.
   * @returns Cluster containing the point or null.
   * @example
   */
  private findClusterContainingPoint(point: Point): Cluster | null {
    for (const cluster of this.clusters) {
      if (
        point.x >= cluster.x &&
        point.x < cluster.x + cluster.width &&
        point.y >= cluster.y &&
        point.y < cluster.y + cluster.height
      ) {
        return cluster;
      }
    }
    return null;
  }

  /**
   * Gets abstract neighbors of a node.
   * @param node - Abstract node.
   * @returns Array of neighbor nodes.
   * @example
   */
  private getAbstractNeighbors(node: AbstractNode): AbstractNode[] {
    const neighbors: AbstractNode[] = [];

    for (const edge of this.abstractEdges) {
      if (edge.from === node.id) {
        const neighbor = this.abstractNodes.find(n => n.id === edge.to);
        if (neighbor) {
          neighbors.push(neighbor);
        }
      }
    }

    return neighbors;
  }

  /**
   * Gets the cost of an abstract edge.
   * @param from - From node.
   * @param to - To node.
   * @returns Edge cost.
   * @example
   */
  private getAbstractEdgeCost(from: AbstractNode, to: AbstractNode): number {
    const edge = this.abstractEdges.find(e => e.from === from.id && e.to === to.id);
    return edge ? edge.cost : Infinity;
  }

  /**
   * Calculates the heuristic distance between two abstract nodes.
   * @param from - From node.
   * @param to - To node.
   * @returns Heuristic distance.
   * @example
   */
  private heuristic(from: AbstractNode, to: AbstractNode): number {
    const dx = Math.abs(to.position.x - from.position.x);
    const dy = Math.abs(to.position.y - from.position.y);

    if (this.config.allowDiagonal) {
      return Math.sqrt(dx * dx + dy * dy);
    } else {
      return dx + dy;
    }
  }

  /**
   * Calculates the cost of a path.
   * @param path - Path to calculate cost for.
   * @returns Path cost.
   * @example
   */
  private calculatePathCost(path: Point[]): number {
    let cost = 0;
    for (let i = 1; i < path.length; i++) {
      const from = path[i - 1];
      const to = path[i];
      const dx = Math.abs(to.x - from.x);
      const dy = Math.abs(to.y - from.y);

      if (dx === 1 && dy === 1) {
        cost += this.config.diagonalCost;
      } else if (dx === 1 || dy === 1) {
        cost += this.config.cardinalCost;
      } else {
        cost += Math.sqrt(dx * dx + dy * dy) * this.config.cardinalCost;
      }
    }
    return cost;
  }

  /**
   * Creates a failure result.
   * @param startTime - Start time of the operation.
   * @param error - Error message.
   * @returns Failure result.
   * @example
   */
  private createFailureResult(startTime: number, error: string): HPAResult {
    const executionTime = performance.now() - startTime;
    return {
      path: [],
      found: false,
      cost: 0,
      length: 0,
      abstractPath: [],
      refinedPath: [],
      stats: {
        clustersCreated: this.stats.clustersCreated,
        entrancesFound: this.stats.entrancesFound,
        abstractNodesProcessed: this.stats.abstractNodesProcessed,
        abstractEdgesCreated: this.stats.abstractEdgesCreated,
        pathRefinements: this.stats.pathRefinements,
        executionTime,
        abstractPathfindingTime: this.stats.abstractPathfindingTime,
        pathRefinementTime: this.stats.pathRefinementTime,
        success: false,
        error,
      },
    };
  }

  /**
   * Validates input parameters.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @returns Validation result.
   * @example
   */
  private validateInput(
    grid: CellType[],
    width: number,
    height: number,
    start: Point,
    goal: Point
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (grid.length !== width * height) {
      errors.push(`Grid length mismatch: expected ${width * height}, got ${grid.length}`);
    }

    if (start.x < 0 || start.x >= width || start.y < 0 || start.y >= height) {
      errors.push(`Start point out of bounds: (${start.x}, ${start.y})`);
    }

    if (goal.x < 0 || goal.x >= width || goal.y < 0 || goal.y >= height) {
      errors.push(`Goal point out of bounds: (${goal.x}, ${goal.y})`);
    }

    const startIndex = start.y * width + start.x;
    if (startIndex >= 0 && startIndex < grid.length && grid[startIndex] === CellType.OBSTACLE) {
      errors.push("Start point is on an obstacle");
    }

    const goalIndex = goal.y * width + goal.x;
    if (goalIndex >= 0 && goalIndex < grid.length && grid[goalIndex] === CellType.OBSTACLE) {
      errors.push("Goal point is on an obstacle");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generates a cache key for the given parameters.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Pathfinding options.
   * @returns Cache key.
   * @example
   */
  private getCacheKey(
    grid: CellType[],
    width: number,
    height: number,
    start: Point,
    goal: Point,
    options: HPAOptions
  ): string {
    const gridHash = grid.slice(0, Math.min(100, grid.length)).join(",");
    const optionsHash = JSON.stringify(options);
    return `hpa-${width}x${height}_${start.x},${start.y}_${goal.x},${goal.y}_${gridHash}_${optionsHash}`;
  }

  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   * @example
   */
  updateConfig(newConfig: Partial<HPAConfig>): void {
    const updatedConfig = { ...this.config, ...newConfig };

    // Validate configuration
    if (updatedConfig.width <= 0 || updatedConfig.height <= 0) {
      throw new Error(`Invalid grid dimensions: width=${updatedConfig.width}, height=${updatedConfig.height}`);
    }
    if (updatedConfig.clusterSize <= 0) {
      throw new Error(`Invalid cluster size: ${updatedConfig.clusterSize}`);
    }
    if (updatedConfig.cardinalCost <= 0 || updatedConfig.diagonalCost <= 0) {
      throw new Error(
        `Invalid movement costs: cardinal=${updatedConfig.cardinalCost}, diagonal=${updatedConfig.diagonalCost}`
      );
    }

    this.config = updatedConfig;
    // Clear cache when configuration changes
    this.clearCache();
  }

  /**
   * Gets the current configuration.
   * @returns The current configuration.
   * @example
   */
  getConfig(): HPAConfig {
    return { ...this.config };
  }

  /**
   * Gets the current statistics.
   * @returns The current statistics.
   * @example
   */
  getStats(): HPAStats {
    return { ...this.stats };
  }

  /**
   * Resets the statistics.
   * @example
   */
  resetStats(): void {
    this.stats = {
      clustersCreated: 0,
      entrancesFound: 0,
      abstractNodesProcessed: 0,
      abstractEdgesCreated: 0,
      pathRefinements: 0,
      executionTime: 0,
      abstractPathfindingTime: 0,
      pathRefinementTime: 0,
      success: true,
    };
  }

  /**
   * Clears the cache.
   * @example
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gets the current clusters.
   * @returns Array of clusters.
   * @example
   */
  getClusters(): Cluster[] {
    return [...this.clusters];
  }

  /**
   * Gets the current entrances.
   * @returns Array of entrances.
   * @example
   */
  getEntrances(): Entrance[] {
    return [...this.entrances];
  }

  /**
   * Gets the current abstract nodes.
   * @returns Array of abstract nodes.
   * @example
   */
  getAbstractNodes(): AbstractNode[] {
    return [...this.abstractNodes];
  }

  /**
   * Gets the current abstract edges.
   * @returns Array of abstract edges.
   * @example
   */
  getAbstractEdges(): AbstractEdge[] {
    return [...this.abstractEdges];
  }
}
