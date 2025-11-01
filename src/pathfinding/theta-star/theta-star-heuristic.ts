/**
 * Theta* Heuristic Operations
 *
 * Handles heuristic calculations and distance functions
 * for the Theta* pathfinding algorithm.
 *
 * @module algorithms/pathfinding/theta-star
 */

import type {
  Point,
  ThetaStarOptions,
} from "./theta-star-types";

/**
 * Calculate heuristic distance between two points
 *
 * @param from Source point
 * @param to Destination point
 * @param options Pathfinding options
 * @returns Heuristic value
 */
export function calculateHeuristic(from: Point, to: Point, options: ThetaStarOptions): number {
  if (options.useEuclideanDistance) {
    return euclideanDistance(from, to);
  } else {
    return manhattanDistance(from, to);
  }
}

/**
 * Calculate Euclidean distance between two points
 *
 * @param a First point
 * @param b Second point
 * @returns Euclidean distance
 */
export function euclideanDistance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate Manhattan distance between two points
 *
 * @param a First point
 * @param b Second point
 * @returns Manhattan distance
 */
export function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

/**
 * Calculate Chebyshev distance between two points
 *
 * @param a First point
 * @param b Second point
 * @returns Chebyshev distance
 */
export function chebyshevDistance(a: Point, b: Point): number {
  return Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
}

/**
 * Calculate octile distance between two points
 *
 * @param a First point
 * @param b Second point
 * @returns Octile distance
 */
export function octileDistance(a: Point, b: Point): number {
  const dx = Math.abs(b.x - a.x);
  const dy = Math.abs(b.y - a.y);
  return Math.max(dx, dy) + (Math.sqrt(2) - 1) * Math.min(dx, dy);
}

/**
 * Calculate diagonal distance between two points
 *
 * @param a First point
 * @param b Second point
 * @param diagonalCost Cost of diagonal movement
 * @param cardinalCost Cost of cardinal movement
 * @returns Diagonal distance
 */
export function diagonalDistance(
  a: Point, 
  b: Point, 
  diagonalCost: number = Math.sqrt(2), 
  cardinalCost: number = 1
): number {
  const dx = Math.abs(b.x - a.x);
  const dy = Math.abs(b.y - a.y);
  
  if (dx > dy) {
    return diagonalCost * dy + cardinalCost * (dx - dy);
  } else {
    return diagonalCost * dx + cardinalCost * (dy - dx);
  }
}

/**
 * Calculate weighted heuristic with tie-breaking
 *
 * @param from Source point
 * @param to Destination point
 * @param options Pathfinding options
 * @param tieBreakingFactor Tie-breaking factor (0-1)
 * @returns Weighted heuristic value
 */
export function calculateWeightedHeuristic(
  from: Point,
  to: Point,
  options: ThetaStarOptions,
  tieBreakingFactor: number = 0.001
): number {
  const baseHeuristic = calculateHeuristic(from, to, options);
  
  if (options.useTieBreaking && tieBreakingFactor > 0) {
    // Add small tie-breaking value to prefer paths closer to goal
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const tieBreaking = tieBreakingFactor * (dx + dy);
    return baseHeuristic + tieBreaking;
  }
  
  return baseHeuristic;
}

/**
 * Calculate dynamic heuristic that adapts to pathfinding progress
 *
 * @param from Source point
 * @param to Destination point
 * @param options Pathfinding options
 * @param progress Pathfinding progress (0-1)
 * @returns Dynamic heuristic value
 */
export function calculateDynamicHeuristic(
  from: Point,
  to: Point,
  options: ThetaStarOptions,
  progress: number = 0
): number {
  const baseHeuristic = calculateHeuristic(from, to, options);
  
  // Adjust heuristic based on progress
  // Early in search: more aggressive (lower heuristic)
  // Later in search: more conservative (higher heuristic)
  const progressFactor = 1 + (progress * 0.5);
  
  return baseHeuristic * progressFactor;
}

/**
 * Calculate multi-objective heuristic
 *
 * @param from Source point
 * @param to Destination point
 * @param options Pathfinding options
 * @param weights Weight factors for different objectives
 * @returns Multi-objective heuristic value
 */
export function calculateMultiObjectiveHeuristic(
  from: Point,
  to: Point,
  options: ThetaStarOptions,
  weights: {
    distance: number;
    smoothness: number;
    safety: number;
  } = { distance: 1.0, smoothness: 0.1, safety: 0.2 }
): number {
  const distanceHeuristic = calculateHeuristic(from, to, options);
  
  // Calculate smoothness factor (prefer straighter paths)
  const smoothnessFactor = calculateSmoothnessFactor(from, to);
  
  // Calculate safety factor (prefer paths away from obstacles)
  const safetyFactor = calculateSafetyFactor(from, to);
  
  return (
    weights.distance * distanceHeuristic +
    weights.smoothness * smoothnessFactor +
    weights.safety * safetyFactor
  );
}

/**
 * Calculate smoothness factor for path planning
 *
 * @param from Source point
 * @param to Destination point
 * @returns Smoothness factor (0-1, lower is better)
 */
function calculateSmoothnessFactor(from: Point, to: Point): number {
  // Simple smoothness based on angle change
  // In a real implementation, this would consider the path history
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  
  // Return normalized angle change (0 = straight, 1 = 90 degrees)
  return Math.abs(angle) / (Math.PI / 2);
}

/**
 * Calculate safety factor for path planning
 *
 * @param from Source point
 * @param to Destination point
 * @returns Safety factor (0-1, lower is better)
 */
function calculateSafetyFactor(from: Point, to: Point): number {
  // Simple safety based on distance from obstacles
  // In a real implementation, this would check actual obstacle proximity
  const distance = euclideanDistance(from, to);
  
  // Return normalized safety factor
  return Math.min(distance / 10, 1.0);
}

/**
 * Calculate admissible heuristic (never overestimates)
 *
 * @param from Source point
 * @param to Destination point
 * @param options Pathfinding options
 * @returns Admissible heuristic value
 */
export function calculateAdmissibleHeuristic(
  from: Point,
  to: Point,
  options: ThetaStarOptions
): number {
  // Manhattan distance is always admissible for grid-based pathfinding
  return manhattanDistance(from, to);
}

/**
 * Calculate consistent heuristic (satisfies triangle inequality)
 *
 * @param from Source point
 * @param to Destination point
 * @param options Pathfinding options
 * @returns Consistent heuristic value
 */
export function calculateConsistentHeuristic(
  from: Point,
  to: Point,
  options: ThetaStarOptions
): number {
  // Euclidean distance is consistent for grid-based pathfinding
  return euclideanDistance(from, to);
}

/**
 * Calculate heuristic with goal bounding
 *
 * @param from Source point
 * @param to Destination point
 * @param options Pathfinding options
 * @param goalBounds Goal bounding box
 * @returns Bounded heuristic value
 */
export function calculateBoundedHeuristic(
  from: Point,
  to: Point,
  options: ThetaStarOptions,
  goalBounds: { min: Point; max: Point }
): number {
  // Calculate distance to goal bounds instead of exact goal
  const distanceToBounds = calculateDistanceToBounds(from, goalBounds);
  const baseHeuristic = calculateHeuristic(from, to, options);
  
  return Math.min(distanceToBounds, baseHeuristic);
}

/**
 * Calculate distance to goal bounds
 *
 * @param point Current point
 * @param bounds Goal bounds
 * @returns Distance to bounds
 */
function calculateDistanceToBounds(point: Point, bounds: { min: Point; max: Point }): number {
  const dx = Math.max(0, Math.max(bounds.min.x - point.x, point.x - bounds.max.x));
  const dy = Math.max(0, Math.max(bounds.min.y - point.y, point.y - bounds.max.y));
  return Math.sqrt(dx * dx + dy * dy);
}

