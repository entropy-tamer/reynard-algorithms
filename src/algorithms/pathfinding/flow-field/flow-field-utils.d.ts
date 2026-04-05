/**
 * @module algorithms/pathfinding/flow-field/flow-field-utils
 * @description Utility functions for Flow Field pathfinding algorithm.
 */
import type { Point, Vector, FlowFieldConfig, FlowFieldOptions, AgentPathfindingOptions, MultiGoalOptions, DynamicObstacleOptions, FlowFieldValidationOptions } from "./flow-field-types";
import { CellType } from "./flow-field-types";
/**
 * Utility functions for Flow Field pathfinding.
 */
export declare class FlowFieldUtils {
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
     * Gets the direction vector between two points.
     * @param from - Starting point.
     * @param to - Ending point.
     * @returns Direction vector.
     * @example
     */
    static getDirectionVector(from: Point, to: Point): Vector;
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
     * Generates random agent positions.
     * @param count - Number of agents to generate.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param grid - The grid.
     * @param seed - Random seed.
     * @returns Array of agent positions.
     * @example
     */
    static generateRandomAgents(count: number, width: number, height: number, grid: CellType[], seed?: number): Point[];
    /**
     * Generates agent positions in a specific pattern.
     * @param pattern - Agent pattern.
     * @param count - Number of agents.
     * @param width - Grid width.
     * @param height - Grid height.
     * @param grid - The grid.
     * @param seed - Random seed.
     * @returns Array of agent positions.
     * @example
     */
    static generateAgentPattern(pattern: "line" | "circle" | "grid" | "random", count: number, width: number, height: number, grid: CellType[], seed?: number): Point[];
    /**
     * Creates a default configuration for Flow Field.
     * @returns Default configuration.
     * @example
     */
    static createDefaultConfig(): FlowFieldConfig;
    /**
     * Creates a default options object for flow field generation.
     * @returns Default options.
     * @example
     */
    static createDefaultOptions(): FlowFieldOptions;
    /**
     * Creates a default agent pathfinding options object.
     * @returns Default agent pathfinding options.
     * @example
     */
    static createDefaultAgentPathfindingOptions(): AgentPathfindingOptions;
    /**
     * Creates a default multi-goal options object.
     * @returns Default multi-goal options.
     * @example
     */
    static createDefaultMultiGoalOptions(): MultiGoalOptions;
    /**
     * Creates a default dynamic obstacle options object.
     * @returns Default dynamic obstacle options.
     * @example
     */
    static createDefaultDynamicObstacleOptions(): DynamicObstacleOptions;
    /**
     * Creates a default flow field validation options object.
     * @returns Default flow field validation options.
     * @example
     */
    static createDefaultFlowFieldValidationOptions(): FlowFieldValidationOptions;
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
     * Converts a flow field to a visual string representation.
     * @param flowField - The flow field.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns Visual string representation.
     * @example
     */
    static flowFieldToString(flowField: any[], width: number, height: number): string;
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
//# sourceMappingURL=flow-field-utils.d.ts.map