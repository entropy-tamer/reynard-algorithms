/**
 * Flow Field Generation Operations
 *
 * Handles core flow field generation algorithms including
 * integration field calculation and flow vector generation.
 *
 * @module algorithms/pathfinding/flow-field
 */
import type { Point, IntegrationCell, FlowCell, FlowFieldConfig, FlowFieldOptions, FlowFieldStats } from "./flow-field-types";
import { CellType } from "./flow-field-types";
/**
 * Generate integration field using Dijkstra-like algorithm
 *
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param goals Array of goal points
 * @param config Flow field configuration
 * @param stats Statistics object to update
 * @returns Integration field array
 * @example
 */
export declare function generateIntegrationField(grid: CellType[], width: number, height: number, goals: Point[], config: FlowFieldConfig, stats: FlowFieldStats): IntegrationCell[];
/**
 * Generate flow field from integration field
 *
 * @param integrationField Integration field array
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param config Flow field configuration
 * @param options Generation options
 * @returns Flow field array
 * @example
 */
export declare function generateFlowField(integrationField: IntegrationCell[], grid: CellType[], width: number, height: number, config: FlowFieldConfig, options: FlowFieldOptions): FlowCell[];
//# sourceMappingURL=flow-field-generation.d.ts.map