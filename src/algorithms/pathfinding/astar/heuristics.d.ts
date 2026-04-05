/**
 * A* Pathfinding Heuristics
 *
 * Collection of heuristic functions for the A* pathfinding algorithm.
 * Heuristics estimate the cost from a given node to the goal, helping
 * the algorithm find optimal paths efficiently.
 *
 * @module algorithms/pathfinding/astar/heuristics
 */
import type { AStarHeuristic } from "./astar-types";
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
 * @example
 */
export declare const manhattanDistance: AStarHeuristic;
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
export declare const euclideanDistance: AStarHeuristic;
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
 * @example
 */
export declare const chebyshevDistance: AStarHeuristic;
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
 * @example
 */
export declare const octileDistance: AStarHeuristic;
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
 * @example
 */
export declare const squaredEuclideanDistance: AStarHeuristic;
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
 * @example
 */
export declare const diagonalDistance: (diagonalCost?: number) => AStarHeuristic;
/**
 * Zero Heuristic
 *
 * Always returns 0, effectively turning A* into Dijkstra's algorithm.
 * Useful when you want guaranteed optimal paths but don't have a good
 * heuristic estimate.
 *
 * @param from Starting point
 * @param to Goal point
 * @param _from
 * @param _to
 * @returns Always 0
 * @example
 */
export declare const zeroHeuristic: AStarHeuristic;
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
 * @example
 */
export declare const weightedHeuristic: (baseHeuristic: AStarHeuristic, weight: number) => AStarHeuristic;
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
 * @example
 */
export declare const adaptiveHeuristic: (baseHeuristic: AStarHeuristic, initialWeight: number, finalWeight: number, progressCallback: () => number) => AStarHeuristic;
/**
 * Multi-Objective Heuristic
 *
 * Combines multiple heuristics with different weights to optimize
 * for multiple objectives (e.g., distance and safety).
 *
 * @param heuristics Array of heuristic functions
 * @param weights Array of corresponding weights
 * @returns Combined heuristic function
 * @example
 */
export declare const multiObjectiveHeuristic: (heuristics: AStarHeuristic[], weights: number[]) => AStarHeuristic;
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
 * @example
 */
export declare const precomputedHeuristic: (lookupTable: number[][], gridWidth: number, gridHeight: number) => AStarHeuristic;
/**
 * Heuristic factory function
 *
 * Creates a heuristic function based on the specified type and options.
 *
 * @param type Type of heuristic to create
 * @param options Additional options for the heuristic
 * @param options.weight
 * @param options.diagonalCost
 * @returns Configured heuristic function
 * @example
 */
export declare const createHeuristic: (type: "manhattan" | "euclidean" | "chebyshev" | "octile" | "squared-euclidean" | "diagonal" | "zero", options?: {
    weight?: number;
    diagonalCost?: number;
}) => AStarHeuristic;
/**
 * Default heuristic function (Euclidean distance)
 */
export declare const defaultHeuristic: AStarHeuristic;
/**
 * All available heuristic functions
 */
export declare const heuristics: {
    manhattanDistance: AStarHeuristic;
    euclideanDistance: AStarHeuristic;
    chebyshevDistance: AStarHeuristic;
    octileDistance: AStarHeuristic;
    squaredEuclideanDistance: AStarHeuristic;
    diagonalDistance: (diagonalCost?: number) => AStarHeuristic;
    zeroHeuristic: AStarHeuristic;
    weightedHeuristic: (baseHeuristic: AStarHeuristic, weight: number) => AStarHeuristic;
    adaptiveHeuristic: (baseHeuristic: AStarHeuristic, initialWeight: number, finalWeight: number, progressCallback: () => number) => AStarHeuristic;
    multiObjectiveHeuristic: (heuristics: AStarHeuristic[], weights: number[]) => AStarHeuristic;
    precomputedHeuristic: (lookupTable: number[][], gridWidth: number, gridHeight: number) => AStarHeuristic;
    createHeuristic: (type: "manhattan" | "euclidean" | "chebyshev" | "octile" | "squared-euclidean" | "diagonal" | "zero", options?: {
        weight?: number;
        diagonalCost?: number;
    }) => AStarHeuristic;
    defaultHeuristic: AStarHeuristic;
};
//# sourceMappingURL=heuristics.d.ts.map