/**
 * @module algorithms/pathfinding/theta-star/theta-star-utils
 * @description Utility functions for Theta* pathfinding algorithm.
 */
import type { Point, Vector, ThetaStarConfig, ThetaStarOptions, LineOfSightOptions, GridValidationOptions, PathOptimizationOptions } from "./theta-star-types";
import { Direction, CellType } from "./theta-star-types";
/**
 * Utility functions for Theta* pathfinding.
 */
export declare class ThetaStarUtils {
    /**
     * Generates a test grid with random obstacles.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param obstacleRatio - Ratio of obstacles (0-1).
     * @param seed - Random seed for reproducible results.
     * @returns Generated grid.
     * @example
     */
    static generateTestGrid(width: number, height: number, obstacleRatio?: number, seed?: number): CellType[];
    /**
     * Generates a maze-like grid using recursive backtracking.
     * @param width - Grid width (must be odd).
     * @param height - Grid height (must be odd).
     * @param seed - Random seed for reproducible results.
     * @returns Generated maze grid.
     * @example
     */
    static generateMazeGrid(width: number, height: number, seed?: number): CellType[];
    /**
     * Generates a grid with rooms and corridors.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param roomCount - Number of rooms to generate.
     * @param minRoomSize - Minimum room size.
     * @param maxRoomSize - Maximum room size.
     * @param seed - Random seed for reproducible results.
     * @returns Generated room grid.
     * @example
     */
    static generateRoomGrid(width: number, height: number, roomCount?: number, minRoomSize?: number, maxRoomSize?: number, seed?: number): CellType[];
    /**
     * Creates a corridor between two points.
     * @param grid - The grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param from - Starting point.
     * @param to - Ending point.
     * @example
     */
    private static createCorridor;
    /**
     * Gets unvisited neighbors for maze generation.
     * @param point - Current point.
     * @param grid - The grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns Array of unvisited neighbors.
     * @example
     */
    private static getUnvisitedNeighbors;
    /**
     * Gets the wall between two points for maze generation.
     * @param from - First point.
     * @param to - Second point.
     * @returns Wall point.
     * @example
     */
    private static getWallBetween;
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
     @param b - Second point.
     * @returns Chebyshev distance.
     * @example
     */
    static chebyshevDistance(a: Point, b: Point): number;
    /**
     * Gets the direction vector between two points.
     * @param from - Starting point.
     * @param to - Ending point.
     * @returns Direction vector.
     * @example
     */
    static getDirectionVector(from: Point, to: Point): Vector;
    /**
     * Gets the direction enum from a direction vector.
     * @param vector - Direction vector.
     * @returns Direction enum.
     * @example
     */
    static getDirectionFromVector(vector: Vector): Direction;
    /**
     * Normalizes a direction vector.
     * @param vector - Vector to normalize.
     * @returns Normalized vector.
     * @example
     */
    static normalizeVector(vector: Vector): Vector;
    /**
     * Calculates the dot product of two vectors.
     * @param a - First vector.
     * @param b - Second vector.
     * @returns Dot product.
     * @example
     */
    static dotProduct(a: Vector, b: Vector): number;
    /**
     * Calculates the cross product of two vectors.
     * @param a - First vector.
     * @param b - Second vector.
     * @returns Cross product (scalar in 2D).
     * @example
     */
    static crossProduct(a: Vector, b: Vector): number;
    /**
     * Calculates the angle between two vectors.
     * @param a - First vector.
     * @param b - Second vector.
     * @returns Angle in radians.
     * @example
     */
    static angleBetweenVectors(a: Vector, b: Vector): number;
    /**
     * Rotates a vector by an angle.
     * @param vector - Vector to rotate.
     * @param angle - Angle in radians.
     * @returns Rotated vector.
     * @example
     */
    static rotateVector(vector: Vector, angle: number): Vector;
    /**
     * Interpolates between two points.
     * @param a - First point.
     * @param b - Second point.
     * @param t - Interpolation factor (0-1).
     * @returns Interpolated point.
     * @example
     */
    static interpolatePoints(a: Point, b: Point, t: number): Point;
    /**
     * Calculates the centroid of a set of points.
     * @param points - Array of points.
     * @returns Centroid point.
     * @example
     */
    static calculateCentroid(points: Point[]): Point;
    /**
     * Calculates the bounding box of a set of points.
     * @param points - Array of points.
     * @returns Bounding box.
     * @example
     */
    static calculateBoundingBox(points: Point[]): {
        min: Point;
        max: Point;
    };
    /**
     * Checks if a point is inside a polygon.
     * @param point - Point to check.
     * @param polygon - Polygon vertices.
     * @returns True if point is inside polygon.
     * @example
     */
    static isPointInPolygon(point: Point, polygon: Point[]): boolean;
    /**
     * Calculates the area of a polygon.
     * @param polygon - Polygon vertices.
     * @returns Polygon area.
     * @example
     */
    static calculatePolygonArea(polygon: Point[]): number;
    /**
     * Calculates the perimeter of a polygon.
     * @param polygon - Polygon vertices.
     * @returns Polygon perimeter.
     * @example
     */
    static calculatePolygonPerimeter(polygon: Point[]): number;
    /**
     * Generates a random point within bounds.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param seed - Random seed.
     * @returns Random point.
     * @example
     */
    static generateRandomPoint(width: number, height: number, seed?: number): Point;
    /**
     * Generates multiple random points within bounds.
     * @param count - Number of points to generate.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param seed - Random seed.
     * @returns Array of random points.
     * @example
     */
    static generateRandomPoints(count: number, width: number, height: number, seed?: number): Point[];
    /**
     * Finds the closest point to a target from a set of points.
     * @param target - Target point.
     * @param points - Array of points to search.
     * @returns Closest point.
     * @example
     */
    static findClosestPoint(target: Point, points: Point[]): Point | null;
    /**
     * Finds all points within a radius of a target.
     * @param target - Target point.
     * @param points - Array of points to search.
     * @param radius - Search radius.
     * @returns Array of points within radius.
     * @example
     */
    static findPointsInRadius(target: Point, points: Point[], radius: number): Point[];
    /**
     * Sorts points by distance from a target.
     * @param target - Target point.
     * @param points - Array of points to sort.
     * @returns Sorted array of points.
     * @example
     */
    static sortPointsByDistance(target: Point, points: Point[]): Point[];
    /**
     * Creates a default configuration for Theta*.
     * @returns Default configuration.
     * @example
     */
    static createDefaultConfig(): ThetaStarConfig;
    /**
     * Creates a default options object for pathfinding.
     * @returns Default options.
     * @example
     */
    static createDefaultOptions(): ThetaStarOptions;
    /**
     * Creates a default line-of-sight options object.
     * @returns Default line-of-sight options.
     * @example
     */
    static createDefaultLineOfSightOptions(): LineOfSightOptions;
    /**
     * Creates a default grid validation options object.
     * @returns Default grid validation options.
     * @example
     */
    static createDefaultGridValidationOptions(): GridValidationOptions;
    /**
     * Creates a default path optimization options object.
     * @returns Default path optimization options.
     * @example
     */
    static createDefaultPathOptimizationOptions(): PathOptimizationOptions;
    /**
     * Seeds the random number generator for reproducible results.
     * @param seed - Random seed.
     * @example
     */
    private static seedRandom;
    /**
     * Converts a grid to a visual string representation.
     * @param grid - The grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param start - Optional start point.
     * @param goal - Optional goal point.
     * @returns Visual string representation.
     * @example
     */
    static gridToString(grid: CellType[], width: number, height: number, start?: Point, goal?: Point): string;
    /**
     * Converts a path to a visual string representation on a grid.
     * @param grid - The grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param path - Path to visualize.
     * @returns Visual string representation.
     * @example
     */
    static pathToString(grid: CellType[], width: number, height: number, path: Point[]): string;
    /**
     * Checks if two points are equal.
     * @param a - First point.
     * @param b - Second point.
     * @param tolerance - Numerical tolerance.
     * @returns True if points are equal.
     * @example
     */
    private static pointsEqual;
}
//# sourceMappingURL=theta-star-utils.d.ts.map