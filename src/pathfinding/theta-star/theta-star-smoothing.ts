/**
 * Theta* Path Smoothing Operations
 *
 * Handles path optimization and smoothing
 * for the Theta* pathfinding algorithm.
 *
 * @module algorithms/pathfinding/theta-star
 */

import type {
  Point,
  PathOptimizationOptions,
  PathOptimizationResult,
} from "./theta-star-types";
import { CellType } from "./theta-star-types";

/**
 * Optimize path by removing redundant points and smoothing
 *
 * @param path Original path
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param options Optimization options
 * @returns Optimization result
 */
export function optimizePath(
  path: Point[],
  grid: CellType[],
  width: number,
  height: number,
  options: Partial<PathOptimizationOptions> = {}
): PathOptimizationResult {
  const startTime = performance.now();
  const optimizationOptions: PathOptimizationOptions = {
    removeRedundant: options.removeRedundant ?? true,
    smoothPath: options.smoothPath ?? true,
    useLineOfSight: options.useLineOfSight ?? true,
    smoothingFactor: options.smoothingFactor ?? 0.5,
    maxSmoothingIterations: options.maxSmoothingIterations ?? 3,
  };

  try {
    let optimizedPath = [...path];

    // Remove redundant points
    if (optimizationOptions.removeRedundant) {
      optimizedPath = removeRedundantPoints(optimizedPath, grid, width, height);
    }

    // Smooth path
    if (optimizationOptions.smoothPath) {
      optimizedPath = smoothPath(
        optimizedPath,
        grid,
        width,
        height,
        optimizationOptions.smoothingFactor!,
        optimizationOptions.maxSmoothingIterations!
      );
    }

    const executionTime = performance.now() - startTime;
    const originalLength = path.length;
    const optimizedLength = optimizedPath.length;

    const pointsRemoved = originalLength - optimizedLength;
    return {
      path: optimizedPath,
      pointsRemoved,
      success: true,
      stats: {
        originalLength,
        optimizedLength,
        reduction: pointsRemoved,
        iterations: optimizationOptions.maxSmoothingIterations || 0,
      },
    };
  } catch (error) {
    return {
      path: path,
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
 * Remove redundant points from path
 *
 * @param path Original path
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @returns Path with redundant points removed
 */
export function removeRedundantPoints(
  path: Point[],
  grid: CellType[],
  width: number,
  height: number
): Point[] {
  if (path.length <= 2) {
    return path;
  }

  const optimizedPath: Point[] = [path[0]];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];

    // Check if current point is necessary
    if (isPointNecessary(prev, current, next, grid, width, height)) {
      optimizedPath.push(current);
    }
  }

  optimizedPath.push(path[path.length - 1]);
  return optimizedPath;
}

/**
 * Smooth path using iterative relaxation
 *
 * @param path Original path
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param factor Smoothing factor (0-1)
 * @param maxIterations Maximum smoothing iterations
 * @returns Smoothed path
 */
export function smoothPath(
  path: Point[],
  grid: CellType[],
  width: number,
  height: number,
  factor: number,
  maxIterations: number
): Point[] {
  if (path.length <= 2) {
    return path;
  }

  let smoothedPath = [...path];

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const newPath = [smoothedPath[0]];

    for (let i = 1; i < smoothedPath.length - 1; i++) {
      const prev = smoothedPath[i - 1];
      const current = smoothedPath[i];
      const next = smoothedPath[i + 1];

      // Calculate smoothed position
      const smoothedX = current.x + factor * (prev.x + next.x - 2 * current.x) / 2;
      const smoothedY = current.y + factor * (prev.y + next.y - 2 * current.y) / 2;

      const smoothedPoint = {
        x: Math.round(smoothedX),
        y: Math.round(smoothedY),
      };

      // Check if smoothed point is valid
      if (isValidPoint(smoothedPoint, width, height) && 
          isWalkable(grid, smoothedPoint, width, height)) {
        newPath.push(smoothedPoint);
      } else {
        newPath.push(current);
      }
    }

    newPath.push(smoothedPath[smoothedPath.length - 1]);
    smoothedPath = newPath;
  }

  return smoothedPath;
}

/**
 * Check if a point is necessary in the path
 *
 * @param prev Previous point
 * @param current Current point
 * @param next Next point
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @returns True if point is necessary
 */
function isPointNecessary(
  prev: Point,
  current: Point,
  next: Point,
  grid: CellType[],
  width: number,
  height: number
): boolean {
  // Check if we can go directly from prev to next
  if (hasLineOfSight(prev, next, grid, width, height)) {
    return false;
  }

  // Check if current point provides a necessary turn
  const direction1 = getDirection(prev, current);
  const direction2 = getDirection(current, next);
  
  return direction1 !== direction2;
}

/**
 * Check if there's a line of sight between two points
 *
 * @param from Source point
 * @param to Destination point
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @returns True if line of sight exists
 */
function hasLineOfSight(
  from: Point,
  to: Point,
  grid: CellType[],
  width: number,
  height: number
): boolean {
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

  return true;
}

/**
 * Get direction from one point to another
 *
 * @param from Source point
 * @param to Destination point
 * @returns Direction string
 */
function getDirection(from: Point, to: Point): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  if (dx === 0 && dy === 0) return "none";
  if (dx === 0) return dy > 0 ? "south" : "north";
  if (dy === 0) return dx > 0 ? "east" : "west";
  if (dx > 0) return dy > 0 ? "southeast" : "northeast";
  return dy > 0 ? "southwest" : "northwest";
}

/**
 * Apply path compression to remove unnecessary waypoints
 *
 * @param path Original path
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @returns Compressed path
 */
export function compressPath(
  path: Point[],
  grid: CellType[],
  width: number,
  height: number
): Point[] {
  if (path.length <= 2) {
    return path;
  }

  const compressedPath: Point[] = [path[0]];
  let lastValidIndex = 0;

  for (let i = 2; i < path.length; i++) {
    if (!hasLineOfSight(path[lastValidIndex], path[i], grid, width, height)) {
      // Need to add the previous point
      compressedPath.push(path[i - 1]);
      lastValidIndex = i - 1;
    }
  }

  compressedPath.push(path[path.length - 1]);
  return compressedPath;
}

/**
 * Apply path relaxation to smooth sharp turns
 *
 * @param path Original path
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param relaxationFactor Relaxation factor (0-1)
 * @returns Relaxed path
 */
export function relaxPath(
  path: Point[],
  grid: CellType[],
  width: number,
  height: number,
  relaxationFactor: number = 0.5
): Point[] {
  if (path.length <= 2) {
    return path;
  }

  const relaxedPath: Point[] = [path[0]];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];

    // Calculate relaxed position
    const relaxedX = current.x + relaxationFactor * (prev.x + next.x - 2 * current.x) / 2;
    const relaxedY = current.y + relaxationFactor * (prev.y + next.y - 2 * current.y) / 2;

    const relaxedPoint = {
      x: Math.round(relaxedX),
      y: Math.round(relaxedY),
    };

    // Use relaxed point if valid, otherwise keep original
    if (isValidPoint(relaxedPoint, width, height) && 
        isWalkable(grid, relaxedPoint, width, height)) {
      relaxedPath.push(relaxedPoint);
    } else {
      relaxedPath.push(current);
    }
  }

  relaxedPath.push(path[path.length - 1]);
  return relaxedPath;
}

/**
 * Check if point is valid
 *
 * @param point Point to check
 * @param width Grid width
 * @param height Grid height
 * @returns True if point is valid
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
 */
function isWalkable(grid: CellType[], point: Point, width: number, height: number): boolean {
  const index = point.y * width + point.x;
  return grid[index] === CellType.WALKABLE;
}

