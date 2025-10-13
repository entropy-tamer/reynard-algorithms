/**
 * @module algorithms/pathfinding/theta-star/theta-star-core
 * @description Main implementation of Theta* any-angle pathfinding algorithm.
 */

import {
  Point,
  Vector,
  Direction,
  MovementType,
  CellType,
  GridCell,
  ThetaStarNode,
  ThetaStarConfig,
  ThetaStarStats,
  ThetaStarResult,
  ThetaStarOptions,
  LineOfSightOptions,
  GridValidationOptions,
  GridValidationResult,
  PathOptimizationOptions,
  PathOptimizationResult,
  ThetaStarSerializationOptions,
  ThetaStarSerialization,
  PathComparisonOptions,
  PathComparisonResult,
  LazyEvaluationOptions,
  LazyEvaluationResult,
} from "./theta-star-types";
import { LineOfSight } from "./line-of-sight";

/**
 * The ThetaStar class provides functionality for pathfinding using the Theta* algorithm.
 * Theta* is an any-angle pathfinding algorithm that produces smoother, more natural paths
 * than grid-based algorithms like A* by allowing movement in any direction, not just
 * grid-aligned directions.
 *
 * @example
 * ```typescript
 * const thetaStar = new ThetaStar();
 * const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.3);
 * const start = { x: 0, y: 0 };
 * const goal = { x: 99, y: 99 };
 * const result = thetaStar.findPath(grid, 100, 100, start, goal);
 * console.log(result.path); // Smoother path than A*
 * ```
 */
export class ThetaStar {
  private config: ThetaStarConfig;
  private stats: ThetaStarStats;
  private cache: Map<string, ThetaStarResult> = new Map();
  private lineOfSightCache: Map<string, boolean> = new Map();

  /**
   * Creates an instance of ThetaStar.
   * @param config - Optional configuration for the algorithm.
   */
  constructor(config: Partial<ThetaStarConfig> = {}) {
    this.config = {
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      movementType: MovementType.ALL,
      useTieBreaking: true,
      useLazyEvaluation: true,
      useGoalBounding: false,
      validateInput: true,
      enableCaching: true,
      maxIterations: 10000,
      tolerance: 1e-10,
      ...config,
    };

    this.stats = {
      nodesExplored: 0,
      lineOfSightChecks: 0,
      parentUpdates: 0,
      iterations: 0,
      diagonalMoves: 0,
      cardinalMoves: 0,
      executionTime: 0,
      success: true,
    };
  }

  /**
   * Finds a path from start to goal using Theta*.
   * @param grid - The grid as a 1D array.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Pathfinding options.
   * @returns Pathfinding result.
   */
  findPath(
    grid: CellType[],
    width: number,
    height: number,
    start: Point,
    goal: Point,
    options: Partial<ThetaStarOptions> = {}
  ): ThetaStarResult {
    const startTime = performance.now();
    const pathOptions: ThetaStarOptions = {
      returnExplored: false,
      returnLineOfSight: false,
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
      if (this.pointsEqual(start, goal, this.config.tolerance)) {
        const result: ThetaStarResult = {
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
      const openSet: ThetaStarNode[] = [];
      const closedSet = new Set<string>();
      const cameFrom = new Map<string, ThetaStarNode>();

      // Create start node
      const startNode: ThetaStarNode = {
        x: start.x,
        y: start.y,
        g: 0,
        h: this.calculateHeuristic(start, goal, pathOptions),
        f: 0,
      };
      startNode.f = startNode.g + startNode.h;

      openSet.push(startNode);
      const openSetMap = new Map<string, ThetaStarNode>();
      openSetMap.set(this.pointToKey(start), startNode);

      let found = false;
      let goalNode: ThetaStarNode | null = null;

      // Main pathfinding loop
      while (openSet.length > 0 && this.stats.iterations < this.config.maxIterations) {
        this.stats.iterations++;

        // Get node with lowest f-cost
        const current = this.getLowestFCostNode(openSet, openSetMap);
        if (!current) break;

        const currentKey = this.pointToKey(current);

        // Remove from open set
        this.removeFromOpenSet(openSet, openSetMap, current);
        closedSet.add(currentKey);

        // Check if we reached the goal
        if (this.pointsEqual(current, goal, this.config.tolerance)) {
          found = true;
          goalNode = current;
          break;
        }

        // Get neighbors
        const neighbors = this.getNeighbors(current, grid, width, height);

        // Process each neighbor
        for (const neighbor of neighbors) {
          const neighborKey = this.pointToKey(neighbor);

          // Skip if already in closed set
          if (closedSet.has(neighborKey)) {
            continue;
          }

          // Calculate tentative g-cost
          let tentativeG = current.g + this.getMovementCost(current, neighbor);

          // Theta* parent update: check line of sight to grandparent
          if (current.parent) {
            const lineOfSightOptions: LineOfSightOptions = {
              useBresenham: true,
              checkEndpoints: false,
              useEarlyTermination: true,
              maxDistance: Math.max(width, height),
            };

            const hasLineOfSight = this.checkLineOfSight(
              grid,
              current.parent,
              neighbor,
              width,
              height,
              lineOfSightOptions
            );

            if (hasLineOfSight) {
              // Update parent to grandparent if line of sight exists
              const grandparentG = current.parent.g + this.getMovementCost(current.parent, neighbor);
              if (grandparentG < tentativeG) {
                tentativeG = grandparentG;
                neighbor.parent = current.parent;
                this.stats.parentUpdates++;
              }
            }
          }

          // Check if this is a better path
          const existingNode = openSetMap.get(neighborKey);
          if (!existingNode || tentativeG < existingNode.g) {
            // Update or create node
            const newNode: ThetaStarNode = {
              x: neighbor.x,
              y: neighbor.y,
              parent: current,
              g: tentativeG,
              h: this.calculateHeuristic(neighbor, goal, pathOptions),
              f: 0,
            };
            newNode.f = newNode.g + newNode.h;

            // Update statistics
            if (this.isDiagonalMove(current, neighbor)) {
              this.stats.diagonalMoves++;
            } else {
              this.stats.cardinalMoves++;
            }

            // Add to open set
            if (existingNode) {
              this.removeFromOpenSet(openSet, openSetMap, existingNode);
            }
            openSet.push(newNode);
            openSetMap.set(neighborKey, newNode);
            cameFrom.set(neighborKey, current);
          }
        }

        this.stats.nodesExplored++;
      }

      // Reconstruct path if found
      let path: Point[] = [];
      let cost = 0;
      let explored: ThetaStarNode[] = [];

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

      const result: ThetaStarResult = {
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
          lineOfSightChecks: this.stats.lineOfSightChecks,
          parentUpdates: this.stats.parentUpdates,
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
      if (!this.isWithinBounds(start, width, height)) {
        errors.push(`Start point out of bounds: (${start.x}, ${start.y})`);
      }
      if (!this.isWithinBounds(goal, width, height)) {
        errors.push(`Goal point out of bounds: (${goal.x}, ${goal.y})`);
      }
      if (this.isWithinBounds(start, width, height) && !this.isWalkable(grid, start, width, height)) {
        errors.push(`Start point is not walkable: (${start.x}, ${start.y})`);
      }
      if (this.isWithinBounds(goal, width, height) && !this.isWalkable(grid, goal, width, height)) {
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
      visited.add(this.pointToKey(start));

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (this.pointsEqual(current, goal, this.config.tolerance)) {
          break;
        }

        const neighbors = this.getNeighbors(current, grid, width, height);
        for (const neighbor of neighbors) {
          const neighborKey = this.pointToKey(neighbor);
          if (!visited.has(neighborKey)) {
            visited.add(neighborKey);
            queue.push(neighbor);
          }
        }
      }

      if (!visited.has(this.pointToKey(goal))) {
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
        optimizedPath = this.removeRedundantPoints(optimizedPath, grid, width, height);
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
   */
  compare(
    result1: ThetaStarResult,
    result2: ThetaStarResult,
    options: Partial<PathComparisonOptions> = {}
  ): PathComparisonResult {
    const comparisonOptions: PathComparisonOptions = {
      compareLength: true,
      compareCost: true,
      compareExploration: true,
      compareTime: true,
      compareLineOfSight: true,
      tolerance: this.config.tolerance,
      ...options,
    };

    const lengthDifference = Math.abs(result1.length - result2.length);
    const costDifference = Math.abs(result1.cost - result2.cost);
    const explorationDifference = Math.abs(result1.stats.nodesExplored - result2.stats.nodesExplored);
    const timeDifference = Math.abs(result1.stats.executionTime - result2.stats.executionTime);
    const lineOfSightDifference = Math.abs(result1.stats.lineOfSightChecks - result2.stats.lineOfSightChecks);

    const areEquivalent = lengthDifference < comparisonOptions.tolerance! &&
                         costDifference < comparisonOptions.tolerance! &&
                         explorationDifference < comparisonOptions.tolerance! &&
                         timeDifference < comparisonOptions.tolerance! &&
                         lineOfSightDifference < comparisonOptions.tolerance!;

    // Calculate similarity score
    const maxLength = Math.max(result1.length, result2.length);
    const maxCost = Math.max(result1.cost, result2.cost);
    const maxExploration = Math.max(result1.stats.nodesExplored, result2.stats.nodesExplored);
    const maxTime = Math.max(result1.stats.executionTime, result2.stats.executionTime);
    const maxLineOfSight = Math.max(result1.stats.lineOfSightChecks, result2.stats.lineOfSightChecks);

    const lengthSimilarity = maxLength === 0 ? 1 : 1 - lengthDifference / maxLength;
    const costSimilarity = maxCost === 0 ? 1 : 1 - costDifference / maxCost;
    const explorationSimilarity = maxExploration === 0 ? 1 : 1 - explorationDifference / maxExploration;
    const timeSimilarity = maxTime === 0 ? 1 : 1 - timeDifference / maxTime;
    const lineOfSightSimilarity = maxLineOfSight === 0 ? 1 : 1 - lineOfSightDifference / maxLineOfSight;

    const similarity = (lengthSimilarity + costSimilarity + explorationSimilarity + timeSimilarity + lineOfSightSimilarity) / 5;

    return {
      areEquivalent,
      lengthDifference,
      costDifference,
      explorationDifference,
      timeDifference,
      lineOfSightDifference,
      similarity: Math.max(0, Math.min(1, similarity)),
    };
  }

  /**
   * Serializes a Theta* result to JSON.
   * @param result - Result to serialize.
   * @param options - Serialization options.
   * @returns Serialized result.
   */
  serialize(
    result: ThetaStarResult,
    options: Partial<ThetaStarSerializationOptions> = {}
  ): ThetaStarSerialization {
    const serializationOptions: ThetaStarSerializationOptions = {
      precision: 6,
      includeStats: false,
      includeExplored: false,
      includeLineOfSight: false,
      includeGrid: false,
      ...options,
    };

    const round = (value: number) => {
      return Math.round(value * Math.pow(10, serializationOptions.precision!)) / 
             Math.pow(10, serializationOptions.precision!);
    };

    const roundPoint = (point: Point) => ({
      x: round(point.x),
      y: round(point.y),
    });

    const serialized: ThetaStarSerialization = {
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

    return serialized;
  }

  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   */
  updateConfig(newConfig: Partial<ThetaStarConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets the current configuration.
   * @returns The current configuration.
   */
  getConfig(): ThetaStarConfig {
    return { ...this.config };
  }

  /**
   * Gets the current statistics.
   * @returns The current statistics.
   */
  getStats(): ThetaStarStats {
    return { ...this.stats };
  }

  /**
   * Resets the statistics.
   */
  resetStats(): void {
    this.stats = {
      nodesExplored: 0,
      lineOfSightChecks: 0,
      parentUpdates: 0,
      iterations: 0,
      diagonalMoves: 0,
      cardinalMoves: 0,
      executionTime: 0,
      success: true,
    };
  }

  /**
   * Clears the cache.
   */
  clearCache(): void {
    this.cache.clear();
    this.lineOfSightCache.clear();
  }

  /**
   * Calculates the heuristic cost between two points.
   * @param from - Starting point.
   * @param to - Goal point.
   * @param options - Pathfinding options.
   * @returns Heuristic cost.
   */
  private calculateHeuristic(from: Point, to: Point, options: ThetaStarOptions): number {
    if (options.customHeuristic) {
      return options.customHeuristic(from, to);
    }

    if (options.useEuclideanHeuristic) {
      return this.distance(from, to);
    }

    if (options.useManhattanHeuristic) {
      return this.manhattanDistance(from, to);
    }

    // Default to Manhattan distance
    return this.manhattanDistance(from, to);
  }

  /**
   * Gets the node with the lowest f-cost from the open set.
   * @param openSet - Open set array.
   * @param openSetMap - Open set map.
   * @returns Node with lowest f-cost.
   */
  private getLowestFCostNode(openSet: ThetaStarNode[], openSetMap: Map<string, ThetaStarNode>): ThetaStarNode | null {
    if (openSet.length === 0) return null;

    let lowest = openSet[0];
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < lowest.f || 
          (this.config.useTieBreaking && openSet[i].f === lowest.f && openSet[i].h < lowest.h)) {
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
   */
  private removeFromOpenSet(openSet: ThetaStarNode[], openSetMap: Map<string, ThetaStarNode>, node: ThetaStarNode): void {
    const key = this.pointToKey(node);
    openSetMap.delete(key);
    
    const index = openSet.findIndex(n => this.pointsEqual(n, node, this.config.tolerance));
    if (index !== -1) {
      openSet.splice(index, 1);
    }
  }

  /**
   * Reconstructs the path from the goal node.
   * @param goalNode - Goal node.
   * @returns Reconstructed path.
   */
  private reconstructPath(goalNode: ThetaStarNode): Point[] {
    const path: Point[] = [];
    let current: ThetaStarNode | undefined = goalNode;

    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }

    return path;
  }

  /**
   * Gets neighbors of a node.
   * @param node - Current node.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Array of neighbor points.
   */
  private getNeighbors(node: Point, grid: CellType[], width: number, height: number): Point[] {
    const neighbors: Point[] = [];
    const directions = this.getValidDirections();

    for (const direction of directions) {
      const neighbor = this.getNeighborInDirection(node, direction);
      
      if (this.isWithinBounds(neighbor, width, height) && 
          this.isWalkable(grid, neighbor, width, height)) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  /**
   * Gets valid directions based on configuration.
   * @returns Array of valid directions.
   */
  private getValidDirections(): Direction[] {
    const directions: Direction[] = [];
    
    // Always include cardinal directions
    directions.push(Direction.NORTH, Direction.EAST, Direction.SOUTH, Direction.WEST);
    
    if (this.config.allowDiagonal) {
      directions.push(Direction.NORTHEAST, Direction.SOUTHEAST, Direction.SOUTHWEST, Direction.NORTHWEST);
    }
    
    return directions;
  }

  /**
   * Gets a neighbor in a specific direction.
   * @param point - Current point.
   * @param direction - Direction to move.
   * @returns Neighbor point.
   */
  private getNeighborInDirection(point: Point, direction: Direction): Point {
    const directionVectors: Vector[] = [
      { x: 0, y: -1 },  // NORTH
      { x: 1, y: -1 },  // NORTHEAST
      { x: 1, y: 0 },   // EAST
      { x: 1, y: 1 },   // SOUTHEAST
      { x: 0, y: 1 },   // SOUTH
      { x: -1, y: 1 },  // SOUTHWEST
      { x: -1, y: 0 },  // WEST
      { x: -1, y: -1 }, // NORTHWEST
    ];

    const vector = directionVectors[direction];
    return { x: point.x + vector.x, y: point.y + vector.y };
  }

  /**
   * Calculates the movement cost between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Movement cost.
   */
  private getMovementCost(from: Point, to: Point): number {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    
    if (dx === 1 && dy === 1) {
      return Math.sqrt(2); // Diagonal movement
    } else if (dx === 1 || dy === 1) {
      return 1; // Cardinal movement
    } else {
      return this.distance(from, to); // Any-angle movement
    }
  }

  /**
   * Checks if a move is diagonal.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns True if move is diagonal.
   */
  private isDiagonalMove(from: Point, to: Point): boolean {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    return dx === 1 && dy === 1;
  }

  /**
   * Checks line of sight between two points.
   * @param grid - The grid.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Line-of-sight options.
   * @returns True if line of sight exists.
   */
  private checkLineOfSight(
    grid: CellType[],
    from: Point,
    to: Point,
    width: number,
    height: number,
    options: LineOfSightOptions
  ): boolean {
    this.stats.lineOfSightChecks++;

    // Check cache first
    if (this.config.enableCaching) {
      const cacheKey = `${this.pointToKey(from)}-${this.pointToKey(to)}`;
      const cached = this.lineOfSightCache.get(cacheKey);
      if (cached !== undefined) {
        return cached;
      }
    }

    const result = LineOfSight.check(grid, from, to, width, height, options);
    const hasLineOfSight = result.hasLineOfSight;

    // Cache result
    if (this.config.enableCaching) {
      const cacheKey = `${this.pointToKey(from)}-${this.pointToKey(to)}`;
      this.lineOfSightCache.set(cacheKey, hasLineOfSight);
    }

    return hasLineOfSight;
  }

  /**
   * Removes redundant points from a path using line-of-sight optimization.
   * @param path - Path to optimize.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Optimized path.
   */
  private removeRedundantPoints(path: Point[], grid: CellType[], width: number, height: number): Point[] {
    if (path.length <= 2) return path;

    const optimized: Point[] = [path[0]];
    let lastValid = 0;

    for (let i = 2; i < path.length; i++) {
      const lineOfSightOptions: LineOfSightOptions = {
        useBresenham: true,
        checkEndpoints: false,
        useEarlyTermination: true,
        maxDistance: Math.max(width, height),
      };

      if (!this.checkLineOfSight(grid, path[lastValid], path[i], width, height, lineOfSightOptions)) {
        optimized.push(path[i - 1]);
        lastValid = i - 1;
      }
    }

    optimized.push(path[path.length - 1]);
    return optimized;
  }

  /**
   * Smooths a path using simple interpolation.
   * @param path - Path to smooth.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param factor - Smoothing factor.
   * @returns Smoothed path.
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
      if (this.isWalkable(grid, smoothedPoint, width, height)) {
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
   */
  private getCacheKey(
    grid: CellType[],
    width: number,
    height: number,
    start: Point,
    goal: Point,
    options: ThetaStarOptions
  ): string {
    const gridHash = grid.slice(0, Math.min(100, grid.length)).join(',');
    const optionsHash = JSON.stringify(options);
    return `theta-${width}x${height}_${start.x},${start.y}_${goal.x},${goal.y}_${gridHash}_${optionsHash}`;
  }

  /**
   * Calculates the distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Distance.
   */
  private distance(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates the Manhattan distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Manhattan distance.
   */
  private manhattanDistance(a: Point, b: Point): number {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  }

  /**
   * Checks if a point is within grid bounds.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is within bounds.
   */
  private isWithinBounds(point: Point, width: number, height: number): boolean {
    return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
  }

  /**
   * Checks if a cell is walkable.
   * @param grid - The grid.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if cell is walkable.
   */
  private isWalkable(grid: CellType[], point: Point, width: number, height: number): boolean {
    if (!this.isWithinBounds(point, width, height)) {
      return false;
    }
    
    const index = point.y * width + point.x;
    return grid[index] === CellType.WALKABLE || 
           grid[index] === CellType.START || 
           grid[index] === CellType.GOAL;
  }

  /**
   * Creates a key for a point (for use in maps/sets).
   * @param point - Point to create key for.
   * @returns String key.
   */
  private pointToKey(point: Point): string {
    return `${point.x},${point.y}`;
  }

  /**
   * Checks if two points are equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Numerical tolerance.
   * @returns True if points are equal.
   */
  private pointsEqual(a: Point, b: Point, tolerance: number = 1e-10): boolean {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }
}
