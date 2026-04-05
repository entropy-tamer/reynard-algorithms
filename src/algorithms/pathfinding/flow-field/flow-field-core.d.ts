/**
 * Flow Field Core Implementation
 *
 * Main FlowField class that orchestrates flow field generation
 * using modular components for generation, pathfinding, validation, caching, and comparison.
 *
 * @module algorithms/pathfinding/flow-field
 */
import { Point, CellType, IntegrationCell, FlowCell, FlowFieldConfig, FlowFieldStats, FlowFieldResult, FlowFieldOptions, AgentPathfindingOptions, AgentPathfindingResult, FlowFieldValidationOptions, FlowFieldValidationResult, FlowFieldSerializationOptions, FlowFieldSerialization, FlowFieldComparisonOptions, FlowFieldComparisonResult, CrowdSimulationOptions, CrowdSimulationResult } from "./flow-field-types";
/**
 * The FlowField class provides functionality for crowd pathfinding using flow fields.
 * Flow fields are particularly efficient for scenarios where many agents need to
 * navigate to the same goal(s), as they precompute the optimal direction for each
 * cell in the grid, allowing agents to find paths with O(1) lookups.
 */
export declare class FlowField {
    private config;
    private stats;
    private cache;
    private integrationField;
    private flowField;
    /**
     *
     * @param config
     * @example
     */
    constructor(config?: Partial<FlowFieldConfig>);
    /**
     * Generates a flow field for the given grid and goals.
     * @param grid
     * @param width
     * @param height
     * @param goals
     * @param options
     * @example
     */
    generateFlowField(grid: CellType[], width: number, height: number, goals: Point[], options?: Partial<FlowFieldOptions>): FlowFieldResult;
    /**
     * Find agent path using flow field.
     * @param start
     * @param flowField
     * @param width
     * @param height
     * @param options
     * @example
     */
    findAgentPath(start: Point, flowField: FlowCell[], width: number, height: number, options?: Partial<AgentPathfindingOptions>): AgentPathfindingResult;
    /**
     * Simulate crowd movement using flow field.
     * @param agents
     * @param flowField
     * @param width
     * @param height
     * @param options
     * @example
     */
    simulateCrowd(agents: Point[], flowField: FlowCell[], width: number, height: number, options?: Partial<CrowdSimulationOptions>): CrowdSimulationResult;
    /**
     * Validate flow field structure and content.
     * @param flowField
     * @param width
     * @param height
     * @param integrationFieldOrWidth
     * @param optionsOrHeight
     * @param options
     * @example
     */
    validateFlowField(flowField: FlowCell[], integrationFieldOrWidth?: IntegrationCell[] | number, optionsOrHeight?: Partial<FlowFieldValidationOptions> | number, options?: Partial<FlowFieldValidationOptions>): FlowFieldValidationResult;
    /**
     * Compare two flow fields.
     * @param flowField1
     * @param flowField2
     * @param width
     * @param height
     * @param flowField1OrResult1
     * @param flowField2OrResult2
     * @param widthOrOptions
     * @param heightOrUndefined
     * @param options
     * @example
     */
    compareFlowFields(flowField1OrResult1: FlowCell[] | FlowFieldResult, flowField2OrResult2?: FlowCell[] | FlowFieldResult, widthOrOptions?: number | Partial<FlowFieldComparisonOptions>, heightOrUndefined?: number, options?: Partial<FlowFieldComparisonOptions>): FlowFieldComparisonResult;
    /**
     * Compare two flow field results.
     * @param result1
     * @param result2
     * @param options
     * @example
     */
    compareFlowFieldResults(result1: FlowFieldResult, result2: FlowFieldResult, options?: Partial<FlowFieldComparisonOptions>): FlowFieldComparisonResult;
    /**
     * Serialize flow field result.
     * @param result
     * @param options
     * @example
     */
    serialize(result: FlowFieldResult, options?: Partial<FlowFieldSerializationOptions>): FlowFieldSerialization;
    /**
     * Update configuration.
     * @param newConfig
     * @example
     */
    updateConfig(newConfig: Partial<FlowFieldConfig>): void;
    /**
     * Get current configuration.
     * @example
     */
    getConfig(): FlowFieldConfig;
    /**
     * Get current statistics.
     * @example
     */
    getStats(): FlowFieldStats;
    /**
     * Reset statistics.
     * @example
     */
    resetStats(): void;
    /**
     * Clear cache.
     * @example
     */
    clearCache(): void;
    /**
     * Get cache statistics.
     * @example
     */
    getCacheStats(): {
        size: number;
        maxSize: number;
        hitCount: number;
        missCount: number;
        hitRate: number;
    };
    /**
     * Count cell types in grid.
     * @param grid
     * @example
     */
    private countCellTypes;
    /**
     * Calculate statistics from integration field.
     * @example
     */
    private calculateStats;
}
//# sourceMappingURL=flow-field-core.d.ts.map