/**
 * @module algorithms/pathfinding/flow-field/flow-field-generator
 * @description Flow field generation algorithms using Dijkstra-based integration.
 */
import type { FlowCell, FlowFieldConfig, FlowFieldOptions, IntegrationCell, Point } from "./flow-field-types";
import { CellType } from "./flow-field-types";
/**
 * Flow field generation algorithms using Dijkstra-based integration.
 */
export declare class FlowFieldGenerator {
    /**
     * Generates an integration cost field using Dijkstra's algorithm.
     * @param grid - The grid as a 1D array.
     * @param goals - Array of goal points.
     * @param config - Flow field configuration.
     * @param options - Generation options.
     * @returns Integration cost field.
     * @example
     */
    static generateIntegrationField(grid: CellType[], goals: Point[], config: FlowFieldConfig, options?: FlowFieldOptions): IntegrationCell[];
    /**
     * Generates a flow vector field from an integration cost field.
     * @param integrationField - The integration cost field.
     * @param grid - The grid as a 1D array.
     * @param config - Flow field configuration.
     * @param options - Generation options.
     * @returns Flow vector field.
     * @example
     */
    static generateFlowFieldFromIntegration(integrationField: IntegrationCell[], grid: CellType[], config: FlowFieldConfig, options?: FlowFieldOptions): FlowCell[];
    /**
     * Generates a complete flow field (integration + flow).
     * @param grid - The grid as a 1D array.
     * @param goals - Array of goal points.
     * @param config - Flow field configuration.
     * @param options - Generation options.
     * @returns Complete flow field result.
     * @example
     */
    static generateFlowField(grid: CellType[], goals: Point[], config: FlowFieldConfig, options?: FlowFieldOptions): {
        integrationField: IntegrationCell[];
        flowField: FlowCell[];
    };
    /**
     * Generates a multi-goal flow field by composing multiple single-goal fields.
     * @param grid - The grid as a 1D array.
     * @param goalGroups - Array of goal groups.
     * @param config - Flow field configuration.
     * @param options - Generation options.
     * @returns Composed flow field result.
     * @example
     */
    static generateMultiGoalFlowField(grid: CellType[], goalGroups: Point[][], config: FlowFieldConfig, options?: FlowFieldOptions): {
        integrationField: IntegrationCell[];
        flowField: FlowCell[];
    };
    /**
     * Composes multiple integration fields into one.
     * @param integrationFields - Array of integration fields.
     * @param config - Flow field configuration.
     * @returns Composed integration field.
     * @example
     */
    private static composeIntegrationFields;
    /**
     * Composes multiple flow fields into one.
     * @param flowFields - Array of flow fields.
     * @param config - Flow field configuration.
     * @returns Composed flow field.
     * @example
     */
    private static composeFlowFields;
    /**
     * Gets neighbors of a point.
     * @param point - Current point.
     * @param grid - The grid.
     * @param config - Flow field configuration.
     * @returns Array of neighbor points.
     * @example
     */
    private static getNeighbors;
    /**
     * Gets valid directions based on configuration.
     * @param config - Flow field configuration.
     * @returns Array of valid directions.
     * @example
     */
    private static getValidDirections;
    /**
     * Gets a neighbor in a specific direction.
     * @param point - Current point.
     * @param direction - Direction to move.
     * @returns Neighbor point.
     * @example
     */
    private static getNeighborInDirection;
    /**
     * Calculates the movement cost between two points.
     * @param from - Starting point.
     * @param to - Ending point.
     * @param config - Flow field configuration.
     * @returns Movement cost.
     * @example
     */
    private static getMovementCost;
    /**
     * Checks if a point is within grid bounds.
     * @param point - Point to check.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns True if point is within bounds.
     * @example
     */
    private static isWithinBounds;
    /**
     * Checks if a cell is walkable.
     * @param grid - The grid.
     * @param point - Point to check.
     * @param width - Grid width.
     * @param height - Grid height.
     * @returns True if cell is walkable.
     * @example
     */
    private static isWalkable;
    /**
     * Creates a key for a point (for use in maps/sets).
     * @param point - Point to create key for.
     * @returns String key.
     * @example
     */
    private static pointToKey;
}
//# sourceMappingURL=flow-field-generator.d.ts.map