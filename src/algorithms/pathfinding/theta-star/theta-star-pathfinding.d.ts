/**
 * Theta* Pathfinding Operations
 *
 * Handles core pathfinding algorithm implementation
 * for the Theta* any-angle pathfinding algorithm.
 *
 * @module algorithms/pathfinding/theta-star
 */
import type { Point, ThetaStarConfig, ThetaStarOptions, ThetaStarResult, ThetaStarStats } from "./theta-star-types";
import { CellType } from "./theta-star-types";
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
export declare function findThetaStarPath(grid: CellType[], width: number, height: number, start: Point, goal: Point, config: ThetaStarConfig, stats: ThetaStarStats, options: ThetaStarOptions, lineOfSightCache: Map<string, boolean>): ThetaStarResult;
//# sourceMappingURL=theta-star-pathfinding.d.ts.map