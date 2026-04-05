/**
 * @module algorithms/pathfinding/jps/jps-utils
 * @description Utility functions for Jump Point Search (JPS) pathfinding algorithm.
 */
import type { Point, Vector, JumpPoint, JPSConfig, JumpPointOptions } from "./jps-types";
import { Direction, MovementType, CellType } from "./jps-types";
/**
 * Utility functions for JPS pathfinding.
 */
export declare class JPSUtils {
    /**
     * Direction vectors for movement.
     */
    private static readonly DIRECTION_VECTORS;
    /**
     * Cardinal directions (N, E, S, W).
     */
    private static readonly CARDINAL_DIRECTIONS;
    /**
     * Diagonal directions (NE, SE, SW, NW).
     */
    private static readonly DIAGONAL_DIRECTIONS;
    /**
     * Gets the direction vector for a given direction.
     * @param direction - The direction.
     * @returns The direction vector.
     * @example
     */
    static getDirectionVector(direction: Direction): Vector;
    /**
     * Gets the direction from a vector.
     * @param vector - The vector.
     * @returns The direction.
     * @example
     */
    static getDirectionFromVector(vector: Vector): Direction;
    /**
     * Normalizes a vector to unit length.
     * @param vector - Vector to normalize.
     * @returns Normalized vector.
     * @example
     */
    static normalizeVector(vector: Vector): Vector;
    /**
     * Adds two vectors.
     * @param a - First vector.
     * @param b - Second vector.
     * @returns Sum of vectors.
     * @example
     */
    static addVectors(a: Vector, b: Vector): Vector;
    /**
     * Multiplies a vector by a scalar.
     * @param vector - Vector to multiply.
     * @param scalar - Scalar multiplier.
     * @returns Scaled vector.
     * @example
     */
    static multiplyVector(vector: Vector, scalar: number): Vector;
    /**
     * Calculates the distance between two points.
     * @param a - First point.
     * @param b - Second point.
     * @returns Distance.
     * @example
     */
    static distance(a: Point, b: Point): number;
    /**
     * Calculates the Manhattan distance between two points.
     * @param a - First point.
     * @param b - Second point.
     * @returns Manhattan distance.
     * @example
     */
    static manhattanDistance(a: Point, b: Point): number;
    /**
     * Calculates the Chebyshev distance between two points.
     * @param a - First point.
     * @param b - Second point.
     * @returns Chebyshev distance.
     * @example
     */
    static chebyshevDistance(a: Point, b: Point): number;
    /**
     * Checks if a point is within grid bounds.
     * @param point - Point to check.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns True if point is within bounds.
     * @example
     */
    static isWithinBounds(point: Point, width: number, height: number): boolean;
    /**
     * Checks if a cell is walkable.
     * @param grid - The grid.
     * @param point - Point to check.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns True if cell is walkable.
     * @example
     */
    static isWalkable(grid: CellType[], point: Point, width: number, height: number): boolean;
    /**
     * Gets the cell type at a point.
     * @param grid - The grid.
     * @param point - Point to check.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns Cell type.
     * @example
     */
    static getCellType(grid: CellType[], point: Point, width: number, height: number): CellType;
    /**
     * Sets the cell type at a point.
     * @param grid - The grid.
     * @param point - Point to set.
     * @param type - Cell type.
     * @param width - Grid width.
     * @param height - Grid height.
     * @example
     */
    static setCellType(grid: CellType[], point: Point, type: CellType, width: number, height: number): void;
    /**
     * Gets all valid directions based on movement type.
     * @param movementType - Movement type.
     * @param allowDiagonal - Whether diagonal movement is allowed.
     * @returns Array of valid directions.
     * @example
     */
    static getValidDirections(movementType: MovementType, allowDiagonal: boolean): Direction[];
    /**
     * Checks if a direction is cardinal.
     * @param direction - Direction to check.
     * @returns True if direction is cardinal.
     * @example
     */
    static isCardinalDirection(direction: Direction): boolean;
    /**
     * Checks if a direction is diagonal.
     * @param direction - Direction to check.
     * @returns True if direction is diagonal.
     * @example
     */
    static isDiagonalDirection(direction: Direction): boolean;
    /**
     * Gets the cost of moving in a direction.
     * @param direction - Direction of movement.
     * @param allowDiagonal - Whether diagonal movement is allowed.
     * @returns Movement cost.
     * @example
     */
    static getMovementCost(direction: Direction, allowDiagonal: boolean): number;
    /**
     * Checks if a point has forced neighbors in a given direction.
     * @param grid - The grid.
     * @param point - Current point.
     * @param direction - Direction to check.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns True if forced neighbors exist.
     * @example
     */
    static hasForcedNeighbors(grid: CellType[], point: Point, direction: Direction, width: number, height: number): boolean;
    /**
     * Gets the perpendicular direction to a cardinal direction.
     * @param direction - Cardinal direction.
     * @param clockwise - Whether to get clockwise perpendicular.
     * @returns Perpendicular direction.
     * @example
     */
    static getPerpendicularDirection(direction: Direction, clockwise: boolean): Direction;
    /**
     * Gets a cardinal component of a diagonal direction.
     * @param direction - Diagonal direction.
     * @param first - Whether to get first component.
     * @returns Cardinal direction component.
     * @example
     */
    static getCardinalComponent(direction: Direction, first: boolean): Direction;
    /**
     * Jumps in a given direction until a jump point or obstacle is found.
     * @param grid - The grid.
     * @param start - Starting point.
     * @param direction - Direction to jump.
     * @param goal - Goal point.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param options - Jump point options.
     * @returns Jump point or null if no jump point found.
     * @example
     */
    static jump(grid: CellType[], start: Point, direction: Direction, goal: Point, width: number, height: number, options?: JumpPointOptions): Point | null;
    /**
     * Gets all jump points from a given point.
     * @param grid - The grid.
     * @param point - Starting point.
     * @param goal - Goal point.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param config - JPS configuration.
     * @param options - Jump point options.
     * @returns Array of jump points.
     * @example
     */
    static getJumpPoints(grid: CellType[], point: Point, goal: Point, width: number, height: number, config: JPSConfig, options?: JumpPointOptions): JumpPoint[];
    /**
     * Creates a key for a point (for use in maps/sets).
     * @param point - Point to create key for.
     * @returns String key.
     * @example
     */
    static pointToKey(point: Point): string;
    /**
     * Parses a key back to a point.
     * @param key - String key.
     * @returns Point.
     * @example
     */
    static keyToPoint(key: string): Point;
    /**
     * Checks if two points are equal.
     * @param a - First point.
     * @param b - Second point.
     * @param tolerance - Numerical tolerance.
     * @returns True if points are equal.
     * @example
     */
    static pointsEqual(a: Point, b: Point, tolerance?: number): boolean;
    /**
     * Calculates the angle between two points.
     * @param from - Starting point.
     * @param to - Ending point.
     * @returns Angle in radians.
     * @example
     */
    static angleBetweenPoints(from: Point, to: Point): number;
    /**
     * Checks if a path is valid (no obstacles).
     * @param grid - The grid.
     * @param path - Path to validate.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns True if path is valid.
     * @example
     */
    static isPathValid(grid: CellType[], path: Point[], width: number, height: number): boolean;
    /**
     * Optimizes a path by removing redundant points.
     * @param path - Path to optimize.
     * @param grid - The grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns Optimized path.
     * @example
     */
    static optimizePath(path: Point[], grid: CellType[], width: number, height: number): Point[];
    /**
     * Checks if there's a line of sight between two points.
     * @param grid - The grid.
     * @param from - Starting point.
     * @param to - Ending point.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns True if line of sight exists.
     * @example
     */
    static hasLineOfSight(grid: CellType[], from: Point, to: Point, width: number, height: number): boolean;
    /**
     * Generates a simple grid for testing.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param obstacleRatio - Ratio of obstacles (0-1).
     * @returns Generated grid.
     * @example
     */
    static generateTestGrid(width: number, height: number, obstacleRatio?: number): CellType[];
    /**
     * Creates a grid from a 2D array.
     * @param grid2D - 2D array representation.
     * @returns 1D grid array.
     * @example
     */
    static from2DArray(grid2D: number[][]): CellType[];
    /**
     * Converts a 1D grid to a 2D array.
     * @param grid - 1D grid array.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns 2D array representation.
     * @example
     */
    static to2DArray(grid: CellType[], width: number, height: number): number[][];
}
//# sourceMappingURL=jps-utils.d.ts.map