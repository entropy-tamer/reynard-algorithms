/**
 * @module algorithms/pathfinding/jps/jps-core
 * @description Main implementation of Jump Point Search (JPS) pathfinding algorithm.
 */

import {
  Point,
  MovementType,
  CellType,
  JumpPoint,
  JPSConfig,
  JPSStats,
  JPSResult,
  JPSOptions,
  JumpPointOptions,
  GridValidationOptions,
  GridValidationResult,
  PathOptimizationOptions,
  PathOptimizationResult,
  JPSPlusResult,
  JPSSerializationOptions,
  JPSSerialization,
  PathComparisonOptions,
  PathComparisonResult,
} from "./jps-types";
import { JPSUtils } from "./jps-utils";

// Re-export JPSUtils for external use
export { JPSUtils };

/**
 * The JPS class provides functionality for pathfinding using the Jump Point Search algorithm.
 * JPS is an optimization of A* that eliminates symmetric paths by jumping over uniform areas,
 * resulting in 10-40x performance improvements on uniform grids.
 *
 * @example
 * ```typescript
 * const jps = new JPS();
 * const grid = JPSUtils.generateTestGrid(100, 100, 0.3);
 * const start = { x: 0, y: 0 };
 * const goal = { x: 99, y: 99 };
 * const result = jps.findPath(grid, 100, 100, start, goal);
 * console.log(result.path); // Found path
 * ```
 */
export class JPS {
  private config: JPSConfig;
  private stats: JPSStats;
  private cache: Map<string, JPSResult> = new Map();
  private jpsPlusCache: Map<string, JPSPlusResult> = new Map();

  /**
   * Creates an instance of JPS.
   * @param config - Optional configuration for the algorithm.
   * @example
   */
  constructor(config: Partial<JPSConfig> = {}) {
    this.config = {
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      movementType: MovementType.ALL,
      useTieBreaking: true,
      useGoalBounding: false,
      useJPSPlus: false,
      validateInput: true,
      enableCaching: true,
      maxIterations: 10000,
      tolerance: 1e-10,
      ...config,
    };

    this.stats = {
      nodesExplored: 0,
      jumpPointsFound: 0,
      iterations: 0,
      diagonalMoves: 0,
      cardinalMoves: 0,
      executionTime: 0,
      success: true,
    };
  }

  /**
   * Finds a path from start to goal using JPS.
   * @param grid - The grid as a 1D array.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Pathfinding options.
   * @returns Pathfinding result.
   * @example
   */
  findPath(
    grid: CellType[],
    width: number,
    height: number,
    start: Point,
    goal: Point,
    options: Partial<JPSOptions> = {}
  ): JPSResult {
    const startTime = performance.now();
    const pathOptions: JPSOptions = {
      returnExplored: false,
      returnJumpPoints: false,
      useManhattanHeuristic: true,
      useEuclideanHeuristic: false,
      optimizePath: true,
      useGoalBounding: this.config.useGoalBounding,
      maxPathLength: width * height,
      ...options,
    };

    try {
      // Validate input
      if (this.config.validateInput) {
        const validation = this.validateGrid(grid, width, height, start, goal);
        if (!validation.isValid) {
          throw new Error(`Invalid grid: ${validation.errors.join(", ")}`);
        }
      }

      // Check cache
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, start, goal, pathOptions);
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Reset statistics
      this.resetStats();

      // Check if start and goal are the same
      if (JPSUtils.pointsEqual(start, goal, this.config.tolerance)) {
        const result: JPSResult = {
          path: [start],
          found: true,
          cost: 0,
          length: 1,
          explored: [],
          stats: this.getStats(),
        };

        if (this.config.enableCaching) {
          const cacheKey = this.getCacheKey(grid, width, height, start, goal, pathOptions);
          this.cache.set(cacheKey, result);
        }

        return result;
      }

      // Initialize open and closed sets
      const openSet: JumpPoint[] = [];
      const closedSet = new Set<string>();
      const cameFrom = new Map<string, JumpPoint>();

      // Create start node
      const startNode: JumpPoint = {
        x: start.x,
        y: start.y,
        g: 0,
        h: this.calculateHeuristic(start, goal, pathOptions),
        f: 0,
      };
      startNode.f = startNode.g + startNode.h;

      openSet.push(startNode);
      const openSetMap = new Map<string, JumpPoint>();
      openSetMap.set(JPSUtils.pointToKey(start), startNode);

      let found = false;
      let goalNode: JumpPoint | null = null;

      // Main pathfinding loop
      while (openSet.length > 0 && this.stats.iterations < this.config.maxIterations) {
        this.stats.iterations++;

        // Get node with lowest f-cost
        const current = this.getLowestFCostNode(openSet, openSetMap);
        if (!current) break;

        const currentKey = JPSUtils.pointToKey(current);

        // Remove from open set
        this.removeFromOpenSet(openSet, openSetMap, current);
        closedSet.add(currentKey);

        // Check if we reached the goal
        if (JPSUtils.pointsEqual(current, goal, this.config.tolerance)) {
          found = true;
          goalNode = current;
          break;
        }

        // Get jump points from current node
        const jumpPointOptions: JumpPointOptions = {
          checkForcedNeighbors: true,
          checkGoalProximity: true,
          useDiagonalPruning: true,
          maxJumpDistance: Math.max(width, height),
          useEarlyTermination: true,
        };

        const jumpPoints = JPSUtils.getJumpPoints(grid, current, goal, width, height, this.config, jumpPointOptions);

        this.stats.jumpPointsFound += jumpPoints.length;

        // Process each jump point
        for (const jumpPoint of jumpPoints) {
          const jumpKey = JPSUtils.pointToKey(jumpPoint);

          // Skip if already in closed set
          if (closedSet.has(jumpKey)) {
            continue;
          }

          // Check if movement type allows this direction
          const validDirections = JPSUtils.getValidDirections(this.config.movementType, this.config.allowDiagonal);
          if (!validDirections.includes(jumpPoint.direction!)) {
            continue;
          }
          
          // Calculate tentative g-cost
          const tentativeG = current.g + JPSUtils.getMovementCost(jumpPoint.direction!, this.config.allowDiagonal);

          // Check if this is a better path
          const existingNode = openSetMap.get(jumpKey);
          if (!existingNode || tentativeG < existingNode.g) {
            // Update or create node
            const newNode: JumpPoint = {
              x: jumpPoint.x,
              y: jumpPoint.y,
              parent: current,
              g: tentativeG,
              h: this.calculateHeuristic(jumpPoint, goal, pathOptions),
              f: 0,
              direction: jumpPoint.direction,
            };
            newNode.f = newNode.g + newNode.h;

            // Update statistics
            if (JPSUtils.isDiagonalDirection(jumpPoint.direction!)) {
              this.stats.diagonalMoves++;
            } else {
              this.stats.cardinalMoves++;
            }

            // Add to open set
            if (existingNode) {
              this.removeFromOpenSet(openSet, openSetMap, existingNode);
            }
            openSet.push(newNode);
            openSetMap.set(jumpKey, newNode);
            cameFrom.set(jumpKey, current);
          }
        }

        this.stats.nodesExplored++;
      }

      // Reconstruct path if found
      let path: Point[] = [];
      let cost = 0;
      let explored: JumpPoint[] = [];

      if (found && goalNode) {
        path = this.reconstructPath(goalNode);
        cost = goalNode.g;

        if (pathOptions.returnExplored) {
          explored = Array.from(cameFrom.values());
        }

        // Optimize path if requested
        if (pathOptions.optimizePath) {
          const optimization = this.optimizePath(path, grid, width, height);
          path = optimization.path;
        }
      }

      const executionTime = performance.now() - startTime;
      this.stats.executionTime = executionTime;
      this.stats.success = found;

      const result: JPSResult = {
        path,
        found,
        cost,
        length: path.length,
        explored,
        stats: this.getStats(),
      };

      // Cache result
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, start, goal, pathOptions);
        this.cache.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        path: [],
        found: false,
        cost: 0,
        length: 0,
        explored: [],
        stats: {
          nodesExplored: this.stats.nodesExplored,
          jumpPointsFound: this.stats.jumpPointsFound,
          iterations: this.stats.iterations,
          diagonalMoves: this.stats.diagonalMoves,
          cardinalMoves: this.stats.cardinalMoves,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Validates a grid for pathfinding.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Validation options.
   * @returns Validation result.
   * @example
   */
  validateGrid(
    grid: CellType[],
    width: number,
    height: number,
    start: Point,
    goal: Point,
    options: Partial<GridValidationOptions> = {}
  ): GridValidationResult {
    const validationOptions: GridValidationOptions = {
      checkBounds: true,
      checkObstacles: true,
      checkStartGoal: true,
      checkConnectivity: true,
      minGridSize: 1,
      maxGridSize: 10000,
      ...options,
    };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check grid bounds
    if (validationOptions.checkBounds) {
      if (width < validationOptions.minGridSize! || height < validationOptions.minGridSize!) {
        errors.push(`Grid size too small: ${width}x${height}`);
      }
      if (width > validationOptions.maxGridSize! || height > validationOptions.maxGridSize!) {
        errors.push(`Grid size too large: ${width}x${height}`);
      }
      if (grid.length !== width * height) {
        errors.push(`Grid array length mismatch: expected ${width * height}, got ${grid.length}`);
      }
    }

    // Check start/goal validity
    if (validationOptions.checkStartGoal) {
      if (!JPSUtils.isWithinBounds(start, width, height)) {
        errors.push(`Start point out of bounds: (${start.x}, ${start.y})`);
      }
      if (!JPSUtils.isWithinBounds(goal, width, height)) {
        errors.push(`Goal point out of bounds: (${goal.x}, ${goal.y})`);
      }
      if (JPSUtils.isWithinBounds(start, width, height) && !JPSUtils.isWalkable(grid, start, width, height)) {
        errors.push(`Start point is not walkable: (${start.x}, ${start.y})`);
      }
      if (JPSUtils.isWithinBounds(goal, width, height) && !JPSUtils.isWalkable(grid, goal, width, height)) {
        errors.push(`Goal point is not walkable: (${goal.x}, ${goal.y})`);
      }
    }

    // Check obstacles
    if (validationOptions.checkObstacles) {
      let obstacleCount = 0;
      for (const cell of grid) {
        if (cell === CellType.OBSTACLE) {
          obstacleCount++;
        }
      }
      const obstacleRatio = obstacleCount / grid.length;
      if (obstacleRatio > 0.8) {
        warnings.push(`High obstacle ratio: ${(obstacleRatio * 100).toFixed(1)}%`);
      }
    }

    // Check connectivity
    if (validationOptions.checkConnectivity && errors.length === 0) {
      // Simple connectivity check using BFS
      const visited = new Set<string>();
      const queue: Point[] = [start];
      visited.add(JPSUtils.pointToKey(start));

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (JPSUtils.pointsEqual(current, goal, this.config.tolerance)) {
          break;
        }

        const directions = JPSUtils.getValidDirections(this.config.movementType, this.config.allowDiagonal);
        for (const direction of directions) {
          const dir = JPSUtils.getDirectionVector(direction);
          const next = { x: current.x + dir.x, y: current.y + dir.y };
          const nextKey = JPSUtils.pointToKey(next);

          if (
            JPSUtils.isWithinBounds(next, width, height) &&
            JPSUtils.isWalkable(grid, next, width, height) &&
            !visited.has(nextKey)
          ) {
            visited.add(nextKey);
            queue.push(next);
          }
        }
      }

      if (!visited.has(JPSUtils.pointToKey(goal))) {
        errors.push("No path exists between start and goal");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasValidBounds: !errors.some(e => e.includes("bounds")),
      hasValidObstacles: !errors.some(e => e.includes("obstacle")),
      hasValidStartGoal: !errors.some(e => e.includes("Start") || e.includes("Goal")),
      isConnected: !errors.some(e => e.includes("path exists")),
    };
  }

  /**
   * Optimizes a path by removing redundant points.
   * @param path - Path to optimize.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Optimization options.
   * @returns Optimization result.
   * @example
   */
  optimizePath(
    path: Point[],
    grid: CellType[],
    width: number,
    height: number,
    options: Partial<PathOptimizationOptions> = {}
  ): PathOptimizationResult {
    const optimizationOptions: PathOptimizationOptions = {
      removeRedundant: true,
      smoothPath: false,
      useLineOfSight: true,
      smoothingFactor: 0.5,
      maxSmoothingIterations: 10,
      ...options,
    };

    try {
      let optimizedPath = [...path];
      let pointsRemoved = 0;
      let iterations = 0;

      if (optimizationOptions.removeRedundant) {
        const originalLength = optimizedPath.length;
        optimizedPath = JPSUtils.optimizePath(optimizedPath, grid, width, height);
        pointsRemoved = originalLength - optimizedPath.length;
      }

      if (optimizationOptions.smoothPath) {
        // Simple path smoothing
        for (let i = 0; i < optimizationOptions.maxSmoothingIterations!; i++) {
          iterations++;
          const smoothed = this.smoothPath(optimizedPath, grid, width, height, optimizationOptions.smoothingFactor!);
          if (smoothed.length === optimizedPath.length) break;
          optimizedPath = smoothed;
        }
      }

      const reduction = path.length > 0 ? (pointsRemoved / path.length) * 100 : 0;

      return {
        path: optimizedPath,
        pointsRemoved,
        success: true,
        stats: {
          originalLength: path.length,
          optimizedLength: optimizedPath.length,
          reduction,
          iterations,
        },
      };
    } catch (error) {
      return {
        path,
        pointsRemoved: 0,
        success: false,
        stats: {
          originalLength: path.length,
          optimizedLength: path.length,
          reduction: 0,
          iterations: 0,
        },
      };
    }
  }

  /**
   * Compares two pathfinding results.
   * @param result1 - First result.
   * @param result2 - Second result.
   * @param options - Comparison options.
   * @returns Comparison result.
   * @example
   */
  compare(result1: JPSResult, result2: JPSResult, options: Partial<PathComparisonOptions> = {}): PathComparisonResult {
    const comparisonOptions: PathComparisonOptions = {
      compareLength: true,
      compareCost: true,
      compareExploration: true,
      compareTime: true,
      tolerance: this.config.tolerance,
      ...options,
    };

    const lengthDifference = Math.abs(result1.length - result2.length);
    const costDifference = Math.abs(result1.cost - result2.cost);
    const explorationDifference = Math.abs(result1.stats.nodesExplored - result2.stats.nodesExplored);
    const timeDifference = Math.abs(result1.stats.executionTime - result2.stats.executionTime);

    const areEquivalent =
      lengthDifference < comparisonOptions.tolerance! &&
      costDifference < comparisonOptions.tolerance! &&
      explorationDifference < comparisonOptions.tolerance! &&
      timeDifference < comparisonOptions.tolerance!;

    // Calculate similarity score
    const maxLength = Math.max(result1.length, result2.length);
    const maxCost = Math.max(result1.cost, result2.cost);
    const maxExploration = Math.max(result1.stats.nodesExplored, result2.stats.nodesExplored);
    const maxTime = Math.max(result1.stats.executionTime, result2.stats.executionTime);

    const lengthSimilarity = maxLength === 0 ? 1 : 1 - lengthDifference / maxLength;
    const costSimilarity = maxCost === 0 ? 1 : 1 - costDifference / maxCost;
    const explorationSimilarity = maxExploration === 0 ? 1 : 1 - explorationDifference / maxExploration;
    const timeSimilarity = maxTime === 0 ? 1 : 1 - timeDifference / maxTime;

    const similarity = (lengthSimilarity + costSimilarity + explorationSimilarity + timeSimilarity) / 4;

    return {
      areEquivalent,
      lengthDifference,
      costDifference,
      explorationDifference,
      timeDifference,
      similarity: Math.max(0, Math.min(1, similarity)),
    };
  }

  /**
   * Serializes a JPS result to JSON.
   * @param result - Result to serialize.
   * @param options - Serialization options.
   * @returns Serialized result.
   * @example
   */
  serialize(result: JPSResult, options: Partial<JPSSerializationOptions> = {}): JPSSerialization {
    const serializationOptions: JPSSerializationOptions = {
      precision: 6,
      includeStats: false,
      includeExplored: false,
      includeJumpPoints: false,
      includeGrid: false,
      ...options,
    };

    const round = (value: number) => {
      return (
        Math.round(value * Math.pow(10, serializationOptions.precision!)) /
        Math.pow(10, serializationOptions.precision!)
      );
    };

    const roundPoint = (point: Point) => ({
      x: round(point.x),
      y: round(point.y),
    });

    const serialized: JPSSerialization = {
      path: result.path.map(roundPoint),
      found: result.found,
      cost: round(result.cost),
      length: result.length,
    };

    if (serializationOptions.includeStats) {
      serialized.stats = result.stats;
    }

    if (serializationOptions.includeExplored) {
      serialized.explored = result.explored;
    }

    if (serializationOptions.includeJumpPoints) {
      serialized.jumpPoints = result.explored.filter(node => node.direction !== undefined);
    }

    return serialized;
  }

  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   * @example
   */
  updateConfig(newConfig: Partial<JPSConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets the current configuration.
   * @returns The current configuration.
   * @example
   */
  getConfig(): JPSConfig {
    return { ...this.config };
  }

  /**
   * Gets the current statistics.
   * @returns The current statistics.
   * @example
   */
  getStats(): JPSStats {
    return { ...this.stats };
  }

  /**
   * Resets the statistics.
   * @example
   */
  resetStats(): void {
    this.stats = {
      nodesExplored: 0,
      jumpPointsFound: 0,
      iterations: 0,
      diagonalMoves: 0,
      cardinalMoves: 0,
      executionTime: 0,
      success: true,
    };
  }

  /**
   * Clears the cache.
   * @example
   */
  clearCache(): void {
    this.cache.clear();
    this.jpsPlusCache.clear();
  }

  /**
   * Calculates the heuristic cost between two points.
   * @param from - Starting point.
   * @param to - Goal point.
   * @param options - Pathfinding options.
   * @returns Heuristic cost.
   * @example
   */
  private calculateHeuristic(from: Point, to: Point, options: JPSOptions): number {
    if (options.customHeuristic) {
      return options.customHeuristic(from, to);
    }

    if (options.useEuclideanHeuristic) {
      return JPSUtils.distance(from, to);
    }

    if (options.useManhattanHeuristic) {
      return JPSUtils.manhattanDistance(from, to);
    }

    // Default to Manhattan distance
    return JPSUtils.manhattanDistance(from, to);
  }

  /**
   * Gets the node with the lowest f-cost from the open set.
   * @param openSet - Open set array.
   * @param openSetMap - Open set map.
   * @param _openSetMap
   * @returns Node with lowest f-cost.
   * @example
   */
  private getLowestFCostNode(openSet: JumpPoint[], _openSetMap: Map<string, JumpPoint>): JumpPoint | null {
    if (openSet.length === 0) return null;

    let lowest = openSet[0];
    for (let i = 1; i < openSet.length; i++) {
      if (
        openSet[i].f < lowest.f ||
        (this.config.useTieBreaking && openSet[i].f === lowest.f && openSet[i].h < lowest.h)
      ) {
        lowest = openSet[i];
      }
    }

    return lowest;
  }

  /**
   * Removes a node from the open set.
   * @param openSet - Open set array.
   * @param openSetMap - Open set map.
   * @param node - Node to remove.
   * @example
   */
  private removeFromOpenSet(openSet: JumpPoint[], openSetMap: Map<string, JumpPoint>, node: JumpPoint): void {
    const key = JPSUtils.pointToKey(node);
    openSetMap.delete(key);

    const index = openSet.findIndex(n => JPSUtils.pointsEqual(n, node, this.config.tolerance));
    if (index !== -1) {
      openSet.splice(index, 1);
    }
  }

  /**
   * Reconstructs the path from the goal node.
   * @param goalNode - Goal node.
   * @returns Reconstructed path.
   * @example
   */
  private reconstructPath(goalNode: JumpPoint): Point[] {
    const path: Point[] = [];
    let current: JumpPoint | undefined = goalNode;

    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }

    return path;
  }

  /**
   * Smooths a path using simple interpolation.
   * @param path - Path to smooth.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param factor - Smoothing factor.
   * @returns Smoothed path.
   * @example
   */
  private smoothPath(path: Point[], grid: CellType[], width: number, height: number, factor: number): Point[] {
    if (path.length <= 2) return path;

    const smoothed: Point[] = [path[0]];

    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const current = path[i];
      const next = path[i + 1];

      // Simple linear interpolation
      const smoothedX = current.x + factor * ((prev.x + next.x) / 2 - current.x);
      const smoothedY = current.y + factor * ((prev.y + next.y) / 2 - current.y);

      const smoothedPoint = { x: Math.round(smoothedX), y: Math.round(smoothedY) };

      // Check if smoothed point is walkable
      if (JPSUtils.isWalkable(grid, smoothedPoint, width, height)) {
        smoothed.push(smoothedPoint);
      } else {
        smoothed.push(current);
      }
    }

    smoothed.push(path[path.length - 1]);
    return smoothed;
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
    options: JPSOptions
  ): string {
    const gridHash = grid.slice(0, Math.min(100, grid.length)).join(",");
    const optionsHash = JSON.stringify(options);
    return `${width}x${height}_${start.x},${start.y}_${goal.x},${goal.y}_${gridHash}_${optionsHash}`;
  }
}
