/**
 * Theta* Validation Operations
 *
 * Handles input validation, grid validation, and error checking
 * for the Theta* pathfinding algorithm.
 *
 * @module algorithms/pathfinding/theta-star
 */

import type { Point, GridValidationOptions, GridValidationResult } from "./theta-star-types";
import { CellType } from "./theta-star-types";

/**
 * Validate grid for Theta* pathfinding
 *
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param options Validation options
 * @returns Validation result
 * @example
 */
export function validateGrid(
  grid: CellType[],
  width: number,
  height: number,
  options: Partial<GridValidationOptions> = {}
): GridValidationResult {
  const validationOptions: GridValidationOptions = {
    checkBounds: options.checkBounds ?? true,
    checkObstacles: options.checkObstacles ?? true,
    checkStartGoal: options.checkStartGoal ?? false,
    checkConnectivity: options.checkConnectivity ?? true,
    minGridSize: options.minGridSize ?? 1,
    maxGridSize: options.maxGridSize ?? Infinity,
  };

  const errors: string[] = [];
  const warnings: string[] = [];
  const stats = {
    totalCells: width * height,
    walkableCells: 0,
    obstacleCells: 0,
    isolatedRegions: 0,
  };

  // Validate bounds
  if (validationOptions.checkBounds) {
    if (width <= 0 || height <= 0) {
      errors.push("Grid dimensions must be positive");
    }

    if (grid.length !== width * height) {
      errors.push(`Grid length (${grid.length}) does not match width * height (${width * height})`);
    }

    const gridSize = width * height;
    if (gridSize < validationOptions.minGridSize || gridSize > validationOptions.maxGridSize) {
      errors.push(
        `Grid size ${gridSize} is outside allowed range [${validationOptions.minGridSize}, ${validationOptions.maxGridSize}]`
      );
    }
  }

  // Count cell types
  if (validationOptions.checkObstacles) {
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === CellType.WALKABLE) {
        stats.walkableCells++;
      } else if (grid[i] === CellType.OBSTACLE) {
        stats.obstacleCells++;
      }
    }

    if (stats.obstacleCells === 0) {
      warnings.push("No obstacles found in grid");
    }
  }

  // Check connectivity
  let isConnected = true;
  if (validationOptions.checkConnectivity) {
    const isolatedRegions = findIsolatedRegions(grid, width, height);
    stats.isolatedRegions = isolatedRegions.length;
    isConnected = isolatedRegions.length <= 1;

    if (isolatedRegions.length > 1) {
      warnings.push(`Found ${isolatedRegions.length} isolated regions`);
    }
  }

  const hasValidBounds = width > 0 && height > 0 && grid.length === width * height;
  const hasValidObstacles = stats.obstacleCells > 0 || !validationOptions.checkObstacles;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasValidBounds,
    hasValidObstacles,
    hasValidStartGoal: true, // Would need start/goal parameters to check
    isConnected,
  };
}

/**
 * Validate pathfinding parameters
 *
 * @param start Starting point
 * @param goal Goal point
 * @param width Grid width
 * @param height Grid height
 * @returns Validation result
 * @example
 */
export function validatePathfindingParams(
  start: Point,
  goal: Point,
  width: number,
  height: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate start point
  if (!isValidPoint(start, width, height)) {
    errors.push(`Invalid start point: (${start.x}, ${start.y})`);
  }

  // Validate goal point
  if (!isValidPoint(goal, width, height)) {
    errors.push(`Invalid goal point: (${goal.x}, ${goal.y})`);
  }

  // Check if start and goal are the same (this is allowed, just a warning)
  // Don't add as error since findPath handles this case

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate path for correctness
 *
 * @param path Path to validate
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @returns Validation result
 * @example
 */
export function validatePath(
  path: Point[],
  grid: CellType[],
  width: number,
  height: number
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (path.length === 0) {
    errors.push("Path is empty");
    return { isValid: false, errors, warnings };
  }

  // Check if all points are valid
  for (let i = 0; i < path.length; i++) {
    const point = path[i];
    if (!isValidPoint(point, width, height)) {
      errors.push(`Invalid point at index ${i}: (${point.x}, ${point.y})`);
    }
  }

  // Check if all points are walkable
  for (let i = 0; i < path.length; i++) {
    const point = path[i];
    if (!isWalkable(grid, point, width, height)) {
      errors.push(`Non-walkable point at index ${i}: (${point.x}, ${point.y})`);
    }
  }

  // Check path continuity
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1];
    const current = path[i];

    if (!isAdjacent(prev, current)) {
      warnings.push(`Non-adjacent points at indices ${i - 1} and ${i}`);
    }
  }

  // Check for redundant points
  const redundantPoints = findRedundantPoints(path);
  if (redundantPoints.length > 0) {
    warnings.push(`Found ${redundantPoints.length} redundant points`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Find isolated regions in the grid
 *
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @returns Array of isolated regions
 * @example
 */
function findIsolatedRegions(grid: CellType[], width: number, height: number): Point[][] {
  const visited = new Set<string>();
  const regions: Point[][] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const point = { x, y };
      const key = pointToKey(point);

      if (visited.has(key) || grid[y * width + x] !== CellType.WALKABLE) {
        continue;
      }

      const region = floodFill(point, grid, width, height, visited);
      if (region.length > 0) {
        regions.push(region);
      }
    }
  }

  return regions;
}

/**
 * Flood fill to find connected region
 *
 * @param start Starting point
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param visited Set of visited points
 * @returns Array of points in the region
 * @example
 */
function floodFill(start: Point, grid: CellType[], width: number, height: number, visited: Set<string>): Point[] {
  const region: Point[] = [];
  const queue: Point[] = [start];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = pointToKey(current);

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);
    region.push(current);

    const neighbors = getNeighbors(current, width, height);
    for (const neighbor of neighbors) {
      const neighborKey = pointToKey(neighbor);
      if (!visited.has(neighborKey) && isWalkable(grid, neighbor, width, height)) {
        queue.push(neighbor);
      }
    }
  }

  return region;
}

/**
 * Find redundant points in path
 *
 * @param path Path to analyze
 * @returns Array of redundant point indices
 * @example
 */
function findRedundantPoints(path: Point[]): number[] {
  const redundant: number[] = [];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];

    // Check if current point is redundant
    if (isPointRedundant(prev, current, next)) {
      redundant.push(i);
    }
  }

  return redundant;
}

/**
 * Check if a point is redundant
 *
 * @param prev Previous point
 * @param current Current point
 * @param next Next point
 * @returns True if point is redundant
 * @example
 */
function isPointRedundant(prev: Point, current: Point, next: Point): boolean {
  // Check if we can go directly from prev to next
  const dx1 = current.x - prev.x;
  const dy1 = current.y - prev.y;
  const dx2 = next.x - current.x;
  const dy2 = next.y - current.y;

  // If directions are the same, point is redundant
  return dx1 === dx2 && dy1 === dy2;
}

/**
 * Check if two points are adjacent
 *
 * @param p1 First point
 * @param p2 Second point
 * @returns True if points are adjacent
 * @example
 */
function isAdjacent(p1: Point, p2: Point): boolean {
  const dx = Math.abs(p2.x - p1.x);
  const dy = Math.abs(p2.y - p1.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1);
}

/**
 * Get valid neighbors for a point
 *
 * @param point Current point
 * @param width Grid width
 * @param height Grid height
 * @returns Array of valid neighbor points
 * @example
 */
function getNeighbors(point: Point, width: number, height: number): Point[] {
  const neighbors: Point[] = [];
  const directions = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: 1 },
  ];

  for (const direction of directions) {
    const neighbor = {
      x: point.x + direction.x,
      y: point.y + direction.y,
    };

    if (isValidPoint(neighbor, width, height)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

/**
 * Check if point is valid
 *
 * @param point Point to check
 * @param width Grid width
 * @param height Grid height
 * @returns True if point is valid
 * @example
 */
function isValidPoint(point: Point, width: number, height: number): boolean {
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
 * Check if two points are equal
 *
 * @param a First point
 * @param b Second point
 * @returns True if points are equal
 * @example
 */
function pointsEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
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
