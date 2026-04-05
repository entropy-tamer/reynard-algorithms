/**
 * Flow Field Validation Operations
 *
 * Handles input validation, error checking, and flow field validation
 * for the Flow Field pathfinding algorithm.
 *
 * @module algorithms/pathfinding/flow-field
 */
import { UnifiedValidationResult } from "../../../core/types/validation-types";
import type { FlowCell, FlowFieldValidationOptions, FlowFieldValidationResult, Point } from "./flow-field-types";
import { CellType } from "./flow-field-types";
/**
 * Validate input parameters for flow field generation
 *
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param goals Array of goal points
 * @returns Validation result
 * @example
 */
export declare function validateInput(grid: CellType[], width: number, height: number, goals: Point[]): UnifiedValidationResult;
/**
 * Validate flow field structure and content
 *
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @param options Validation options
 * @returns Validation result
 * @example
 */
export declare function validateFlowField(flowField: FlowCell[], width: number, height: number, options?: Partial<FlowFieldValidationOptions>): FlowFieldValidationResult;
//# sourceMappingURL=flow-field-validation.d.ts.map