/**
 * @module algorithms/pathfinding/hpa-star/hpa-path-refinement
 * @description Path refinement for HPA* hierarchical pathfinding.
 */

import type {
  Point,
  GridCell,
  Cluster,
  Entrance,
  AbstractNode,
  AbstractEdge,
  HPAConfig,
  PathRefinementOptions,
  PathRefinementResult,
} from "./hpa-star-types";
import { CellType } from "./hpa-star-types";

/**
 * Path refinement utilities for HPA*.
 */
export class HPAPathRefinement {
  /**
   * Refines an abstract path into a detailed path.
   * @param abstractPath - Abstract path from high-level planning.
   * @param clusters - Clusters in the hierarchical map.
   * @param entrances - Entrances between clusters.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Path refinement options.
   * @returns Path refinement result.
   * @example
   */
  static refinePath(
    abstractPath: AbstractNode[],
    clusters: Cluster[],
    entrances: Entrance[],
    grid: CellType[],
    config: HPAConfig,
    options: Partial<PathRefinementOptions> = {}
  ): PathRefinementResult {
    const startTime = performance.now();
    const refinementOptions: PathRefinementOptions = {
      useAStarRefinement: true,
      useJPSRefinement: false,
      useThetaStarRefinement: false,
      usePathSmoothing: true,
      smoothingFactor: 0.5,
      useEarlyTermination: true,
      maxRefinementIterations: 1000,
      ...options,
    };

    try {
      let refinedPath: Point[] = [];
      let iterationsUsed = 0;

      // Convert abstract path to point sequence
      const pointSequence = this.convertAbstractPathToPoints(abstractPath, clusters, entrances);

      if (pointSequence.length === 0) {
        return {
          refinedPath: [],
          success: false,
          stats: {
            refinementTime: performance.now() - startTime,
            pathLength: 0,
            smoothingApplied: false,
            iterationsUsed: 0,
          },
        };
      }

      // Refine path using selected algorithm
      if (refinementOptions.useAStarRefinement) {
        const aStarResult = this.refineWithAStar(pointSequence, grid, config, refinementOptions);
        refinedPath = aStarResult.path;
        iterationsUsed = aStarResult.iterations;
      } else if (refinementOptions.useJPSRefinement) {
        const jpsResult = this.refineWithJPS(pointSequence, grid, config, refinementOptions);
        refinedPath = jpsResult.path;
        iterationsUsed = jpsResult.iterations;
      } else if (refinementOptions.useThetaStarRefinement) {
        const thetaStarResult = this.refineWithThetaStar(pointSequence, grid, config, refinementOptions);
        refinedPath = thetaStarResult.path;
        iterationsUsed = thetaStarResult.iterations;
      } else {
        // No refinement, just use the abstract path
        refinedPath = pointSequence;
      }

      // Apply path smoothing if requested
      let smoothingApplied = false;
      if (refinementOptions.usePathSmoothing && refinedPath.length > 2) {
        refinedPath = this.smoothPath(refinedPath, grid, config, refinementOptions.smoothingFactor!);
        smoothingApplied = true;
      }

      const endTime = performance.now();
      const refinementTime = endTime - startTime;

      return {
        refinedPath,
        success: true,
        stats: {
          refinementTime,
          pathLength: refinedPath.length,
          smoothingApplied,
          iterationsUsed,
        },
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        refinedPath: [],
        success: false,
        stats: {
          refinementTime: endTime - startTime,
          pathLength: 0,
          smoothingApplied: false,
          iterationsUsed: 0,
        },
      };
    }
  }

  /**
   * Converts an abstract path to a sequence of points.
   * @param abstractPath - Abstract path.
   * @param clusters - Clusters in the hierarchical map.
   * @param entrances - Entrances between clusters.
   * @returns Sequence of points.
   * @example
   */
  private static convertAbstractPathToPoints(
    abstractPath: AbstractNode[],
    clusters: Cluster[],
    entrances: Entrance[]
  ): Point[] {
    const points: Point[] = [];

    for (const node of abstractPath) {
      if (node.type === "cluster") {
        const cluster = clusters.find(c => c.id === node.clusterId);
        if (cluster) {
          points.push({
            x: cluster.x + cluster.width / 2,
            y: cluster.y + cluster.height / 2,
          });
        }
      } else if (node.type === "entrance") {
        const entrance = entrances.find(e => e.id === node.entranceId);
        if (entrance) {
          points.push({
            x: entrance.x,
            y: entrance.y,
          });
        }
      }
    }

    return points;
  }

  /**
   * Refines a path using A* algorithm.
   * @param pointSequence - Sequence of points to connect.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Refinement options.
   * @returns A* refinement result.
   * @example
   */
  private static refineWithAStar(
    pointSequence: Point[],
    grid: CellType[],
    config: HPAConfig,
    options: PathRefinementOptions
  ): { path: Point[]; iterations: number } {
    const refinedPath: Point[] = [];
    let totalIterations = 0;

    for (let i = 0; i < pointSequence.length - 1; i++) {
      const start = pointSequence[i];
      const goal = pointSequence[i + 1];

      const aStarResult = this.findAStarPath(start, goal, grid, config, options);
      refinedPath.push(...aStarResult.path.slice(0, -1)); // Exclude the last point to avoid duplication
      totalIterations += aStarResult.iterations;
    }

    // Add the final point
    if (pointSequence.length > 0) {
      refinedPath.push(pointSequence[pointSequence.length - 1]);
    }

    return { path: refinedPath, iterations: totalIterations };
  }

  /**
   * Refines a path using Jump Point Search.
   * @param pointSequence - Sequence of points to connect.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Refinement options.
   * @returns JPS refinement result.
   * @example
   */
  private static refineWithJPS(
    pointSequence: Point[],
    grid: CellType[],
    config: HPAConfig,
    options: PathRefinementOptions
  ): { path: Point[]; iterations: number } {
    // Simplified JPS implementation for path refinement
    // In a real implementation, this would use the actual JPS algorithm
    return this.refineWithAStar(pointSequence, grid, config, options);
  }

  /**
   * Refines a path using Theta* algorithm.
   * @param pointSequence - Sequence of points to connect.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Refinement options.
   * @returns Theta* refinement result.
   * @example
   */
  private static refineWithThetaStar(
    pointSequence: Point[],
    grid: CellType[],
    config: HPAConfig,
    options: PathRefinementOptions
  ): { path: Point[]; iterations: number } {
    // Simplified Theta* implementation for path refinement
    // In a real implementation, this would use the actual Theta* algorithm
    return this.refineWithAStar(pointSequence, grid, config, options);
  }

  /**
   * Finds a path using A* algorithm.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Refinement options.
   * @returns A* pathfinding result.
   * @example
   */
  private static findAStarPath(
    start: Point,
    goal: Point,
    grid: CellType[],
    config: HPAConfig,
    options: PathRefinementOptions
  ): { path: Point[]; iterations: number } {
    const openSet: Array<{ point: Point; g: number; h: number; f: number; parent?: Point }> = [];
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, Point>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const startKey = this.pointToKey(start);
    const goalKey = this.pointToKey(goal);

    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(start, goal, config));
    openSet.push({ point: start, g: 0, h: this.heuristic(start, goal, config), f: fScore.get(startKey)! });

    let iterations = 0;
    const maxIterations = options.maxRefinementIterations || 1000;

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
      const currentKey = this.pointToKey(current.point);

      if (currentKey === goalKey) {
        // Reconstruct path
        const path: Point[] = [];
        let node: Point | undefined = goal;

        while (node) {
          path.unshift(node);
          node = cameFrom.get(this.pointToKey(node));
        }

        return { path, iterations };
      }

      closedSet.add(currentKey);

      // Check neighbors
      const neighbors = this.getNeighbors(current.point, grid, config);

      for (const neighbor of neighbors) {
        const neighborKey = this.pointToKey(neighbor);

        if (closedSet.has(neighborKey)) {
          continue;
        }

        const tentativeG = gScore.get(currentKey)! + this.getMovementCost(current.point, neighbor, config);

        if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)!) {
          cameFrom.set(neighborKey, current.point);
          gScore.set(neighborKey, tentativeG);
          fScore.set(neighborKey, tentativeG + this.heuristic(neighbor, goal, config));

          // Add to open set if not already there
          if (!openSet.some(node => this.pointToKey(node.point) === neighborKey)) {
            openSet.push({
              point: neighbor,
              g: tentativeG,
              h: this.heuristic(neighbor, goal, config),
              f: fScore.get(neighborKey)!,
            });
          }
        }
      }
    }

    // No path found
    return { path: [], iterations };
  }

  /**
   * Smooths a path by removing redundant waypoints.
   * @param path - Path to smooth.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param smoothingFactor - Smoothing factor (0-1).
   * @returns Smoothed path.
   * @example
   */
  private static smoothPath(path: Point[], grid: CellType[], config: HPAConfig, smoothingFactor: number): Point[] {
    if (path.length <= 2) {
      return path;
    }

    const smoothedPath: Point[] = [path[0]];

    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const current = path[i];
      const next = path[i + 1];

      // Check if we can skip this point
      if (this.hasLineOfSight(prev, next, grid, config)) {
        // Skip this point with probability based on smoothing factor
        if (Math.random() > smoothingFactor) {
          smoothedPath.push(current);
        }
      } else {
        smoothedPath.push(current);
      }
    }

    smoothedPath.push(path[path.length - 1]);

    return smoothedPath;
  }

  /**
   * Checks if there's a line of sight between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @returns True if there's a line of sight.
   * @example
   */
  private static hasLineOfSight(from: Point, to: Point, grid: CellType[], config: HPAConfig): boolean {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const steps = Math.max(dx, dy);

    if (steps === 0) {
      return true;
    }

    const stepX = (to.x - from.x) / steps;
    const stepY = (to.y - from.y) / steps;

    for (let i = 0; i <= steps; i++) {
      const x = Math.round(from.x + i * stepX);
      const y = Math.round(from.y + i * stepY);

      if (x < 0 || x >= config.width || y < 0 || y >= config.height) {
        return false;
      }

      const index = y * config.width + x;
      if (index >= 0 && index < grid.length && grid[index] === CellType.OBSTACLE) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets neighbors of a point.
   * @param point - Current point.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @returns Array of neighbor points.
   * @example
   */
  private static getNeighbors(point: Point, grid: CellType[], config: HPAConfig): Point[] {
    const neighbors: Point[] = [];
    const directions = this.getValidDirections(config);

    for (const direction of directions) {
      const neighbor = this.getNeighborInDirection(point, direction);

      if (
        this.isWithinBounds(neighbor, config.width, config.height) &&
        this.isWalkable(grid, neighbor, config.width, config.height)
      ) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  /**
   * Gets valid directions based on configuration.
   * @param config - HPA configuration.
   * @returns Array of valid directions.
   * @example
   */
  private static getValidDirections(config: HPAConfig): number[] {
    const directions: number[] = [];

    // Always include cardinal directions
    directions.push(0, 1, 2, 3); // North, East, South, West

    if (config.allowDiagonal) {
      directions.push(4, 5, 6, 7); // Northeast, Southeast, Southwest, Northwest
    }

    return directions;
  }

  /**
   * Gets a neighbor in a specific direction.
   * @param point - Current point.
   * @param direction - Direction to move.
   * @returns Neighbor point.
   * @example
   */
  private static getNeighborInDirection(point: Point, direction: number): Point {
    const directionVectors: Point[] = [
      { x: 0, y: -1 }, // North
      { x: 1, y: 0 }, // East
      { x: 0, y: 1 }, // South
      { x: -1, y: 0 }, // West
      { x: 1, y: -1 }, // Northeast
      { x: 1, y: 1 }, // Southeast
      { x: -1, y: 1 }, // Southwest
      { x: -1, y: -1 }, // Northwest
    ];

    const vector = directionVectors[direction];
    return { x: point.x + vector.x, y: point.y + vector.y };
  }

  /**
   * Calculates the movement cost between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param config - HPA configuration.
   * @returns Movement cost.
   * @example
   */
  private static getMovementCost(from: Point, to: Point, config: HPAConfig): number {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    if (dx === 1 && dy === 1) {
      return config.diagonalCost;
    } else if (dx === 1 || dy === 1) {
      return config.cardinalCost;
    } else {
      // Any-angle movement
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance * config.cardinalCost;
    }
  }

  /**
   * Calculates the heuristic distance between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param config - HPA configuration.
   * @returns Heuristic distance.
   * @example
   */
  private static heuristic(from: Point, to: Point, config: HPAConfig): number {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    if (config.allowDiagonal) {
      // Euclidean distance
      return Math.sqrt(dx * dx + dy * dy);
    } else {
      // Manhattan distance
      return dx + dy;
    }
  }

  /**
   * Checks if a point is within grid bounds.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is within bounds.
   * @example
   */
  private static isWithinBounds(point: Point, width: number, height: number): boolean {
    return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
  }

  /**
   * Checks if a cell is walkable.
   * @param grid - The grid.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if cell is walkable.
   * @example
   */
  private static isWalkable(grid: CellType[], point: Point, width: number, height: number): boolean {
    if (!this.isWithinBounds(point, width, height)) {
      return false;
    }

    const index = point.y * width + point.x;
    return grid[index] === CellType.WALKABLE || grid[index] === CellType.GOAL || grid[index] === CellType.AGENT;
  }

  /**
   * Creates a key for a point (for use in maps/sets).
   * @param point - Point to create key for.
   * @returns String key.
   * @example
   */
  private static pointToKey(point: Point): string {
    return `${point.x},${point.y}`;
  }
}
