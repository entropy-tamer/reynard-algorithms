/**
 * A* Pathfinding Heuristics
 *
 * Collection of heuristic functions for the A* pathfinding algorithm.
 * Heuristics estimate the cost from a given node to the goal, helping
 * the algorithm find optimal paths efficiently.
 *
 * @module algorithms/pathfinding/astar/heuristics
 */

import type { Point, AStarHeuristic } from './astar-types';

/**
 * Manhattan Distance Heuristic
 * 
 * Calculates the sum of absolute differences between coordinates.
 * Suitable for grid-based movement where only horizontal and vertical
 * movement is allowed (no diagonal movement).
 * 
 * Formula: |x1 - x2| + |y1 - y2|
 * 
 * @param from Starting point
 * @param to Goal point
 * @returns Manhattan distance between points
 */
export const manhattanDistance: AStarHeuristic = (from: Point, to: Point): number => {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
};

/**
 * Euclidean Distance Heuristic
 * 
 * Calculates the straight-line distance between two points.
 * Suitable for continuous movement where diagonal movement is allowed.
 * This is the most accurate heuristic but slightly more expensive to compute.
 * 
 * Formula: √((x1 - x2)² + (y1 - y2)²)
 * 
 * @param from Starting point
 * @param to Goal point
 * @returns Euclidean distance between points
 */
export const euclideanDistance: AStarHeuristic = (from: Point, to: Point): number => {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Chebyshev Distance Heuristic
 * 
 * Calculates the maximum of the absolute differences between coordinates.
 * Suitable for grid-based movement where diagonal movement is allowed
 * and has the same cost as regular movement.
 * 
 * Formula: max(|x1 - x2|, |y1 - y2|)
 * 
 * @param from Starting point
 * @param to Goal point
 * @returns Chebyshev distance between points
 */
export const chebyshevDistance: AStarHeuristic = (from: Point, to: Point): number => {
  return Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
};

/**
 * Octile Distance Heuristic
 * 
 * Calculates distance for grid-based movement where diagonal movement
 * is allowed but costs more than regular movement (typically √2 times more).
 * This is a good compromise between Manhattan and Euclidean distances.
 * 
 * Formula: max(|x1 - x2|, |y1 - y2|) + (√2 - 1) * min(|x1 - x2|, |y1 - y2|)
 * 
 * @param from Starting point
 * @param to Goal point
 * @returns Octile distance between points
 */
export const octileDistance: AStarHeuristic = (from: Point, to: Point): number => {
  const dx = Math.abs(from.x - to.x);
  const dy = Math.abs(from.y - to.y);
  const diagonalCost = Math.sqrt(2) - 1;
  return Math.max(dx, dy) + diagonalCost * Math.min(dx, dy);
};

/**
 * Squared Euclidean Distance Heuristic
 * 
 * Calculates the squared Euclidean distance, avoiding the expensive
 * square root operation. Useful when you only need to compare distances
 * and don't need the actual distance value.
 * 
 * Formula: (x1 - x2)² + (y1 - y2)²
 * 
 * @param from Starting point
 * @param to Goal point
 * @returns Squared Euclidean distance between points
 */
export const squaredEuclideanDistance: AStarHeuristic = (from: Point, to: Point): number => {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return dx * dx + dy * dy;
};

/**
 * Diagonal Distance Heuristic
 * 
 * Calculates distance for grid-based movement with diagonal movement
 * allowed. This is similar to octile distance but uses a different
 * diagonal cost calculation.
 * 
 * Formula: max(|x1 - x2|, |y1 - y2|) + (√2 - 1) * min(|x1 - x2|, |y1 - y2|)
 * 
 * @param from Starting point
 * @param to Goal point
 * @param diagonalCost Cost of diagonal movement (default: √2)
 * @returns Diagonal distance between points
 */
export const diagonalDistance = (diagonalCost: number = Math.sqrt(2)): AStarHeuristic => {
  return (from: Point, to: Point): number => {
    const dx = Math.abs(from.x - to.x);
    const dy = Math.abs(from.y - to.y);
    const diagonalFactor = diagonalCost - 1;
    return Math.max(dx, dy) + diagonalFactor * Math.min(dx, dy);
  };
};

/**
 * Zero Heuristic
 * 
 * Always returns 0, effectively turning A* into Dijkstra's algorithm.
 * Useful when you want guaranteed optimal paths but don't have a good
 * heuristic estimate.
 * 
 * @param from Starting point
 * @param to Goal point
 * @returns Always 0
 */
export const zeroHeuristic: AStarHeuristic = (from: Point, to: Point): number => {
  return 0;
};

/**
 * Weighted Heuristic
 * 
 * Applies a weight factor to any base heuristic. A weight > 1 makes
 * the algorithm faster but potentially suboptimal. A weight < 1 makes
 * it slower but more optimal.
 * 
 * @param baseHeuristic Base heuristic function
 * @param weight Weight factor to apply
 * @returns Weighted heuristic function
 */
export const weightedHeuristic = (baseHeuristic: AStarHeuristic, weight: number): AStarHeuristic => {
  return (from: Point, to: Point): number => {
    return baseHeuristic(from, to) * weight;
  };
};

/**
 * Adaptive Heuristic
 * 
 * Dynamically adjusts heuristic weight based on search progress.
 * Starts with high weight for speed, then reduces weight for accuracy
 * as the search progresses.
 * 
 * @param baseHeuristic Base heuristic function
 * @param initialWeight Initial weight factor
 * @param finalWeight Final weight factor
 * @param progressCallback Function to get current search progress (0-1)
 * @returns Adaptive heuristic function
 */
export const adaptiveHeuristic = (
  baseHeuristic: AStarHeuristic,
  initialWeight: number,
  finalWeight: number,
  progressCallback: () => number
): AStarHeuristic => {
  return (from: Point, to: Point): number => {
    const progress = progressCallback();
    const weight = initialWeight + (finalWeight - initialWeight) * progress;
    return baseHeuristic(from, to) * weight;
  };
};

/**
 * Multi-Objective Heuristic
 * 
 * Combines multiple heuristics with different weights to optimize
 * for multiple objectives (e.g., distance and safety).
 * 
 * @param heuristics Array of heuristic functions
 * @param weights Array of corresponding weights
 * @returns Combined heuristic function
 */
export const multiObjectiveHeuristic = (
  heuristics: AStarHeuristic[],
  weights: number[]
): AStarHeuristic => {
  if (heuristics.length !== weights.length) {
    throw new Error('Number of heuristics must match number of weights');
  }

  return (from: Point, to: Point): number => {
    let total = 0;
    for (let i = 0; i < heuristics.length; i++) {
      total += heuristics[i](from, to) * weights[i];
    }
    return total;
  };
};

/**
 * Precomputed Heuristic
 * 
 * Uses a precomputed lookup table for heuristic values. Useful when
 * the goal is fixed and you need to perform many pathfinding operations
 * to the same goal.
 * 
 * @param lookupTable Precomputed heuristic values
 * @param gridWidth Width of the grid
 * @param gridHeight Height of the grid
 * @returns Precomputed heuristic function
 */
export const precomputedHeuristic = (
  lookupTable: number[][],
  gridWidth: number,
  gridHeight: number
): AStarHeuristic => {
  return (from: Point, to: Point): number => {
    const x = Math.floor(to.x);
    const y = Math.floor(to.y);
    
    if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) {
      // Fallback to Euclidean distance for out-of-bounds
      return euclideanDistance(from, to);
    }
    
    return lookupTable[y][x];
  };
};

/**
 * Heuristic factory function
 * 
 * Creates a heuristic function based on the specified type and options.
 * 
 * @param type Type of heuristic to create
 * @param options Additional options for the heuristic
 * @returns Configured heuristic function
 */
export const createHeuristic = (
  type: 'manhattan' | 'euclidean' | 'chebyshev' | 'octile' | 'squared-euclidean' | 'diagonal' | 'zero',
  options: { weight?: number; diagonalCost?: number } = {}
): AStarHeuristic => {
  const { weight = 1, diagonalCost = Math.sqrt(2) } = options;
  
  let baseHeuristic: AStarHeuristic;
  
  switch (type) {
    case 'manhattan':
      baseHeuristic = manhattanDistance;
      break;
    case 'euclidean':
      baseHeuristic = euclideanDistance;
      break;
    case 'chebyshev':
      baseHeuristic = chebyshevDistance;
      break;
    case 'octile':
      baseHeuristic = octileDistance;
      break;
    case 'squared-euclidean':
      baseHeuristic = squaredEuclideanDistance;
      break;
    case 'diagonal':
      baseHeuristic = diagonalDistance(diagonalCost);
      break;
    case 'zero':
      baseHeuristic = zeroHeuristic;
      break;
    default:
      throw new Error(`Unknown heuristic type: ${type}`);
  }
  
  return weight !== 1 ? weightedHeuristic(baseHeuristic, weight) : baseHeuristic;
};

/**
 * Default heuristic function (Euclidean distance)
 */
export const defaultHeuristic: AStarHeuristic = euclideanDistance;

/**
 * All available heuristic functions
 */
export const heuristics = {
  manhattanDistance,
  euclideanDistance,
  chebyshevDistance,
  octileDistance,
  squaredEuclideanDistance,
  diagonalDistance,
  zeroHeuristic,
  weightedHeuristic,
  adaptiveHeuristic,
  multiObjectiveHeuristic,
  precomputedHeuristic,
  createHeuristic,
  defaultHeuristic,
};

