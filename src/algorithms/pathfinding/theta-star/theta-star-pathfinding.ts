/**
 * Theta* Pathfinding Operations
 *
 * Handles core pathfinding algorithm implementation
 * for the Theta* any-angle pathfinding algorithm.
 *
 * @module algorithms/pathfinding/theta-star
 */

import type {
  Point,
  ThetaStarNode,
  ThetaStarConfig,
  ThetaStarStats,
  ThetaStarResult,
  ThetaStarOptions,
} from "./theta-star-types";
import { CellType, Direction, MovementType } from "./theta-star-types";
import { calculateHeuristic } from "./theta-star-heuristic";

/**
 * Find path using Theta* algorithm
 *
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param start Starting point
 * @param goal Goal point
 * @param config Theta* configuration
 * @param stats Statistics object to update
 * @param options Pathfinding options
 * @param lineOfSightCache Line of sight cache
 * @returns Pathfinding result
 * @example
 */
export function findThetaStarPath(
  grid: CellType[],
  width: number,
  height: number,
  start: Point,
  goal: Point,
  config: ThetaStarConfig,
  stats: ThetaStarStats,
  options: ThetaStarOptions,
  lineOfSightCache: Map<string, boolean>
): ThetaStarResult {
  const startTime = performance.now();

  try {
    // Check if start and goal are the same
    if (pointsEqual(start, goal, config.tolerance)) {
      const executionTime = performance.now() - startTime;
      stats.executionTime = executionTime;
      return {
        found: true,
        path: [start],
        cost: 0,
        length: 1,
        explored: [],
        stats,
        executionTime,
        metadata: { iterations: 0, lineOfSightChecks: 0 },
      };
    }

    // Initialize open and closed sets
    const openSet: ThetaStarNode[] = [];
    const openSetMap = new Map<string, ThetaStarNode>();
    const closedSet = new Set<string>();

    // Create start node
    const startNode: ThetaStarNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: calculateHeuristic(start, goal, options),
      f: 0,
      parent: undefined,
    };
    startNode.f = startNode.g + startNode.h;

    openSet.push(startNode);
    openSetMap.set(pointToKey(start), startNode);

    let iterations = 0;
    const maxIterations = options.maxIterations || config.maxIterations;

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;
      stats.iterations = iterations;

      // Get node with lowest f-cost
      const currentNode = getLowestFCostNode(openSet, openSetMap);
      if (!currentNode) {
        break;
      }

      // Check if we reached the goal
      const currentNodePoint = { x: currentNode.x, y: currentNode.y };
      if (pointsEqual(currentNodePoint, goal, config.tolerance)) {
        const path = reconstructPath(currentNode);
        const executionTime = performance.now() - startTime;
        stats.executionTime = executionTime;

        return {
          found: true,
          path,
          cost: currentNode.g,
          length: path.length,
          explored: Array.from(closedSet).map(key => {
            const [x, y] = key.split(",").map(Number);
            return { x, y, g: 0, h: 0, f: 0 };
          }),
          stats,
          executionTime,
          metadata: { iterations, lineOfSightChecks: stats.lineOfSightChecks },
        };
      }

      // Move current node from open to closed set
      removeFromOpenSet(openSet, openSetMap, currentNode);
      closedSet.add(pointToKey(currentNodePoint));
      stats.nodesExplored++;

      // Explore neighbors
      const neighbors = getNeighbors(currentNodePoint, grid, width, height, config);

      for (const neighborPoint of neighbors) {
        const neighborKey = pointToKey(neighborPoint);

        if (closedSet.has(neighborKey)) {
          continue;
        }

        // Check if neighbor is walkable
        if (!isWalkable(grid, neighborPoint, width, height)) {
          continue;
        }

        // Calculate tentative g-cost
        const tentativeG = currentNode.g + getMovementCost(currentNodePoint, neighborPoint, config);

        // Check if we have line of sight to parent
        let parentNode = currentNode.parent;
        if (
          parentNode &&
          checkLineOfSight({ x: parentNode.x, y: parentNode.y }, neighborPoint, grid, width, height, lineOfSightCache)
        ) {
          // Use parent's g-cost + direct movement cost
          const directG = parentNode.g + getMovementCost({ x: parentNode.x, y: parentNode.y }, neighborPoint, config);
          if (directG < tentativeG) {
            parentNode = currentNode.parent;
            stats.parentUpdates++;
          }
        }

        // Check if this path to neighbor is better
        const existingNode = openSetMap.get(neighborKey);
        if (!existingNode || tentativeG < existingNode.g) {
          const neighborNode: ThetaStarNode = {
            x: neighborPoint.x,
            y: neighborPoint.y,
            g: tentativeG,
            h: calculateHeuristic(neighborPoint, goal, options),
            f: 0,
            parent: parentNode || currentNode,
          };
          neighborNode.f = neighborNode.g + neighborNode.h;

          if (!existingNode) {
            openSet.push(neighborNode);
            openSetMap.set(neighborKey, neighborNode);
          } else {
            // Update existing node
            existingNode.g = tentativeG;
            existingNode.f = existingNode.g + existingNode.h;
            existingNode.parent = parentNode || currentNode;
          }
        }
      }
    }

    // No path found
    const executionTime = performance.now() - startTime;
    stats.executionTime = executionTime;

    return {
      found: false,
      path: [],
      cost: 0,
      length: 0,
      explored: Array.from(closedSet).map(key => {
        const [x, y] = key.split(",").map(Number);
        return { x, y, g: 0, h: 0, f: 0 };
      }),
      stats,
      executionTime,
      metadata: {
        error: "No path found",
        iterations,
        lineOfSightChecks: stats.lineOfSightChecks,
      },
    };
  } catch (error) {
    return {
      found: false,
      path: [],
      cost: 0,
      length: 0,
      explored: [],
      stats,
      executionTime: performance.now() - startTime,
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Get valid neighbors for a point
 *
 * @param point Current point
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param config Theta* configuration
 * @returns Array of neighbor points
 * @example
 */
function getNeighbors(point: Point, grid: CellType[], width: number, height: number, config: ThetaStarConfig): Point[] {
  const neighbors: Point[] = [];
  const directions = getValidDirections(config);

  for (const direction of directions) {
    const neighbor = getNeighborInDirection(point, direction);

    if (isWithinBounds(neighbor, width, height)) {
      // Check diagonal movement restrictions
      if (isDiagonalMove(point, neighbor)) {
        if (config.diagonalOnlyWhenClear) {
          const adjacent1 = getNeighborInDirection(point, direction as any); // Type assertion for diagonal
          const adjacent2 = getNeighborInDirection(point, direction as any); // Type assertion for diagonal

          if (!isWalkable(grid, adjacent1, width, height) || !isWalkable(grid, adjacent2, width, height)) {
            continue;
          }
        }
      }

      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

/**
 * Get valid movement directions
 *
 * @param config Theta* configuration
 * @returns Array of valid directions
 * @example
 */
function getValidDirections(config: ThetaStarConfig): Direction[] {
  const directions: Direction[] = [Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST];

  if (config.allowDiagonal) {
    directions.push(Direction.NORTHEAST, Direction.NORTHWEST, Direction.SOUTHEAST, Direction.SOUTHWEST);
  }

  return directions;
}

/**
 * Get neighbor point in a specific direction
 *
 * @param point Current point
 * @param direction Movement direction
 * @returns Neighbor point
 * @example
 */
function getNeighborInDirection(point: Point, direction: Direction): Point {
  switch (direction) {
    case Direction.NORTH:
      return { x: point.x, y: point.y - 1 };
    case Direction.SOUTH:
      return { x: point.x, y: point.y + 1 };
    case Direction.EAST:
      return { x: point.x + 1, y: point.y };
    case Direction.WEST:
      return { x: point.x - 1, y: point.y };
    case Direction.NORTHEAST:
      return { x: point.x + 1, y: point.y - 1 };
    case Direction.NORTHWEST:
      return { x: point.x - 1, y: point.y - 1 };
    case Direction.SOUTHEAST:
      return { x: point.x + 1, y: point.y + 1 };
    case Direction.SOUTHWEST:
      return { x: point.x - 1, y: point.y + 1 };
    default:
      return point;
  }
}

/**
 * Calculate movement cost between two points
 *
 * @param from Source point
 * @param to Destination point
 * @param config Theta* configuration
 * @returns Movement cost
 * @example
 */
function getMovementCost(from: Point, to: Point, config: ThetaStarConfig): number {
  if (isDiagonalMove(from, to)) {
    return Math.sqrt(2);
  }
  return 1;
}

/**
 * Check if movement is diagonal
 *
 * @param from Source point
 * @param to Destination point
 * @returns True if movement is diagonal
 * @example
 */
function isDiagonalMove(from: Point, to: Point): boolean {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  return dx === 1 && dy === 1;
}

/**
 * Check line of sight between two points
 *
 * @param from Source point
 * @param to Destination point
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param cache Line of sight cache
 * @returns True if line of sight exists
 * @example
 */
function checkLineOfSight(
  from: Point,
  to: Point,
  grid: CellType[],
  width: number,
  height: number,
  cache: Map<string, boolean>
): boolean {
  const cacheKey = `${pointToKey(from)}-${pointToKey(to)}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  // Simple line of sight check using Bresenham's algorithm
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const sx = from.x < to.x ? 1 : -1;
  const sy = from.y < to.y ? 1 : -1;
  let err = dx - dy;

  let x = from.x;
  let y = from.y;

  while (true) {
    if (x === to.x && y === to.y) {
      break;
    }

    if (!isWalkable(grid, { x, y }, width, height)) {
      cache.set(cacheKey, false);
      return false;
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  cache.set(cacheKey, true);
  return true;
}

/**
 * Calculate heuristic distance
 *
 * @param from Source point
 * @param to Destination point
 * @param options Pathfinding options
 * @returns Heuristic value
 * @example
 */
function calculateHeuristic(from: Point, to: Point, options: ThetaStarOptions): number {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);

  if (options.useEuclideanDistance) {
    return Math.sqrt(dx * dx + dy * dy);
  } else {
    return dx + dy; // Manhattan distance
  }
}

/**
 * Get node with lowest f-cost from open set
 *
 * @param openSet Open set array
 * @param openSetMap Open set map for quick lookup
 * @returns Node with lowest f-cost or null
 * @example
 */
function getLowestFCostNode(openSet: ThetaStarNode[], openSetMap: Map<string, ThetaStarNode>): ThetaStarNode | null {
  if (openSet.length === 0) {
    return null;
  }

  let lowestIndex = 0;
  for (let i = 1; i < openSet.length; i++) {
    if (openSet[i].f < openSet[lowestIndex].f) {
      lowestIndex = i;
    }
  }

  return openSet[lowestIndex];
}

/**
 * Remove node from open set
 *
 * @param openSet Open set array
 * @param openSetMap Open set map
 * @param node Node to remove
 * @example
 */
function removeFromOpenSet(
  openSet: ThetaStarNode[],
  openSetMap: Map<string, ThetaStarNode>,
  node: ThetaStarNode
): void {
  const index = openSet.indexOf(node);
  if (index > -1) {
    openSet.splice(index, 1);
  }
  openSetMap.delete(pointToKey({ x: node.x, y: node.y }));
}

/**
 * Reconstruct path from goal node
 *
 * @param goalNode Goal node
 * @returns Path array
 * @example
 */
function reconstructPath(goalNode: ThetaStarNode): Point[] {
  const path: Point[] = [];
  let current: ThetaStarNode | undefined = goalNode;

  while (current) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }

  return path;
}

/**
 * Check if point is within bounds
 *
 * @param point Point to check
 * @param width Grid width
 * @param height Grid height
 * @returns True if point is within bounds
 * @example
 */
function isWithinBounds(point: Point, width: number, height: number): boolean {
  return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
}

/**
 * Check if point is walkable
 *
 * @param grid Grid of cell types
 * @param point Point to check
 * @param width Grid width
 * @param height Grid height
 * @returns True if point is walkable
 * @example
 */
function isWalkable(grid: CellType[], point: Point, width: number, height: number): boolean {
  const index = point.y * width + point.x;
  return grid[index] === CellType.WALKABLE;
}

/**
 * Convert point to string key
 *
 * @param point Point to convert
 * @returns String key
 * @example
 */
function pointToKey(point: Point): string {
  return `${point.x},${point.y}`;
}

/**
 * Check if two points are equal
 *
 * @param a First point
 * @param b Second point
 * @param tolerance Tolerance for comparison
 * @returns True if points are equal
 * @example
 */
function pointsEqual(a: Point, b: Point, tolerance: number = 1e-10): boolean {
  return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
}
