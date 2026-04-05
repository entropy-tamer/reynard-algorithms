/**
 * @module algorithms/pathfinding/hpa-star/hpa-star-utils
 * @description Utility functions for HPA* hierarchical pathfinding algorithm.
 */
import type { AbstractGraphOptions, ClusterGenerationOptions, EntranceDetectionOptions, HPAConfig, HPAOptions, HPAValidationOptions, PathRefinementOptions, Point } from "./hpa-star-types";
import { CellType } from "./hpa-star-types";
/**
 * Utility functions for HPA* pathfinding.
 */
export declare class HPAStarUtils {
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
     * Generates a grid with a specific pattern.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param pattern - Pattern type.
     * @param seed - Random seed for reproducible results.
     * @returns Generated grid.
     * @example
     */
    static generatePatternGrid(width: number, height: number, pattern: "maze" | "rooms" | "corridors" | "spiral", seed?: number): CellType[];
    /**
     * Generates a maze-like grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns Generated maze grid.
     * @example
     */
    private static generateMazeGrid;
    /**
     * Generates a room-based grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns Generated room grid.
     * @example
     */
    private static generateRoomGrid;
    /**
     * Generates a corridor-based grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns Generated corridor grid.
     * @example
     */
    private static generateCorridorGrid;
    /**
     * Generates a spiral grid.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns Generated spiral grid.
     * @example
     */
    private static generateSpiralGrid;
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
     * Generates random goal points.
     * @param count - Number of goals to generate.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param grid - The grid.
     * @param seed - Random seed.
     * @returns Array of goal points.
     * @example
     */
    static generateRandomGoals(count: number, width: number, height: number, grid: CellType[], seed?: number): Point[];
    /**
     * Generates goal points in a specific pattern.
     * @param pattern - Goal pattern.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param grid - The grid.
     * @param seed - Random seed.
     * @returns Array of goal points.
     * @example
     */
    static generateGoalPattern(pattern: "corners" | "center" | "edges" | "random", width: number, height: number, grid: CellType[], seed?: number): Point[];
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
     * Creates a default configuration for HPA*.
     * @returns Default configuration.
     * @example
     */
    static createDefaultConfig(): HPAConfig;
    /**
     * Creates a default options object for HPA* pathfinding.
     * @returns Default options.
     * @example
     */
    static createDefaultOptions(): HPAOptions;
    /**
     * Creates a default cluster generation options object.
     * @returns Default cluster generation options.
     * @example
     */
    static createDefaultClusterGenerationOptions(): ClusterGenerationOptions;
    /**
     * Creates a default entrance detection options object.
     * @returns Default entrance detection options.
     * @example
     */
    static createDefaultEntranceDetectionOptions(): EntranceDetectionOptions;
    /**
     * Creates a default abstract graph options object.
     * @returns Default abstract graph options.
     * @example
     */
    static createDefaultAbstractGraphOptions(): AbstractGraphOptions;
    /**
     * Creates a default path refinement options object.
     * @returns Default path refinement options.
     * @example
     */
    static createDefaultPathRefinementOptions(): PathRefinementOptions;
    /**
     * Creates a default HPA* validation options object.
     * @returns Default HPA* validation options.
     * @example
     */
    static createDefaultHPAValidationOptions(): HPAValidationOptions;
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
     * @param goals - Optional goal points.
     * @param agents - Optional agent points.
     * @returns Visual string representation.
     * @example
     */
    static gridToString(grid: CellType[], width: number, height: number, goals?: Point[], agents?: Point[]): string;
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
//# sourceMappingURL=hpa-star-utils.d.ts.map