/**
 * @file Wave Function Collapse Generation Loop
 * @description Core generation loop and cell operations
 */
import type { Position3D, Constraint, Cell } from "./wave-function-collapse-types";
import { BacktrackManager } from "./wfc-backtrack";
/**
 * Handle backtracking when contradictions are found
 * @param backtrackManager
 * @param grid
 * @param collapsedPositions
 * @example
 */
export declare function handleBacktrack(backtrackManager: BacktrackManager, grid: Cell[][][], collapsedPositions: Position3D[]): {
    step: number;
} | null;
/**
 * Collapse cell and propagate constraints
 * @param grid
 * @param position
 * @param activeConstraints
 * @param width
 * @param height
 * @param depth
 * @param collapsedPositions
 * @param random
 * @example
 */
export declare function collapseAndPropagate(grid: Cell[][][], position: Position3D, activeConstraints: Constraint[], width: number, height: number, depth: number, collapsedPositions: Position3D[], random: () => number): boolean;
export type GenerationLoopResult = {
    iterations: number;
    success: boolean;
};
/**
 * Run the main generation loop
 * @param grid
 * @param activeConstraints
 * @param width
 * @param height
 * @param depth
 * @param maxIterations
 * @param random
 * @example
 */
export declare function runGenerationLoop(grid: Cell[][][], activeConstraints: Constraint[], width: number, height: number, depth: number, maxIterations: number, random: () => number): GenerationLoopResult;
//# sourceMappingURL=wfc-generation-loop.d.ts.map