/**
 * Flow Field Comparison Operations
 *
 * Handles comparison and analysis of flow fields for debugging,
 * optimization, and validation purposes.
 *
 * @module algorithms/pathfinding/flow-field
 */
import type { Point, FlowCell, IntegrationCell, FlowFieldStats, FlowFieldResult, FlowFieldComparisonOptions, FlowFieldComparisonResult } from "./flow-field-types";
/**
 * Compare two flow fields
 *
 * @param flowField1 First flow field
 * @param flowField2 Second flow field
 * @param width Grid width
 * @param height Grid height
 * @param options Comparison options
 * @returns Comparison result
 * @example
 */
export declare function compareFlowFields(flowField1: FlowCell[], flowField2: FlowCell[], width: number, height: number, options?: Partial<FlowFieldComparisonOptions>): FlowFieldComparisonResult;
/**
 * Compare two integration fields
 *
 * @param integrationField1 First integration field
 * @param integrationField2 Second integration field
 * @param width Grid width
 * @param height Grid height
 * @param tolerance Comparison tolerance
 * @returns Comparison result
 * @example
 */
export declare function compareIntegrationFields(integrationField1: IntegrationCell[], integrationField2: IntegrationCell[], width: number, height: number, tolerance?: number): FlowFieldComparisonResult;
/**
 * Compare flow field statistics
 *
 * @param stats1 First statistics
 * @param stats2 Second statistics
 * @param tolerance Comparison tolerance
 * @returns Comparison result
 * @example
 */
export declare function compareStats(stats1: FlowFieldStats, stats2: FlowFieldStats, tolerance?: number): {
    identical: boolean;
    differences: string[];
};
/**
 * Compare two flow field results
 *
 * @param result1 First flow field result
 * @param result2 Second flow field result
 * @param options Comparison options
 * @returns Comparison result
 * @example
 */
export declare function compareFlowFieldResults(result1: FlowFieldResult, result2: FlowFieldResult, options?: Partial<FlowFieldComparisonOptions>): FlowFieldComparisonResult;
/**
 * Calculate flow field similarity score
 *
 * @param flowField1 First flow field
 * @param flowField2 Second flow field
 * @param width Grid width
 * @param height Grid height
 * @returns Similarity score (0-1)
 * @example
 */
export declare function calculateSimilarity(flowField1: FlowCell[], flowField2: FlowCell[], width: number, height: number): number;
/**
 * Find differences between flow fields
 *
 * @param flowField1 First flow field
 * @param flowField2 Second flow field
 * @param width Grid width
 * @param height Grid height
 * @param _height
 * @param threshold Difference threshold
 * @returns Array of difference points
 * @example
 */
export declare function findDifferences(flowField1: FlowCell[], flowField2: FlowCell[], width: number, _height: number, threshold?: number): Point[];
//# sourceMappingURL=flow-field-comparison.d.ts.map