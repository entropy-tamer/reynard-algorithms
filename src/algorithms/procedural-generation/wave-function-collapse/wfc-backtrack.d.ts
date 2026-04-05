/**
 * @file Wave Function Collapse Backtrack Operations
 *
 * Handles backtracking, state management, and conflict resolution
 * for the Wave Function Collapse algorithm.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */
import type { Cell, Position3D } from "./wave-function-collapse-types";
/**
 * State snapshot for backtracking
 */
export interface BacktrackState {
    grid: Cell[][][];
    collapsedPositions: Position3D[];
    step: number;
}
/**
 * Backtrack manager for Wave Function Collapse
 */
export declare class BacktrackManager {
    private states;
    private maxBacktrackSteps;
    /**
     * Creates a new backtrack manager
     *
     * @param maxBacktrackSteps Maximum number of backtrack steps to store
     * @example new BacktrackManager(500)
     */
    constructor(maxBacktrackSteps?: number);
    /**
     * Save current state for backtracking
     *
     * @param grid Current grid state
     * @param collapsedPositions Positions that have been collapsed
     * @param step Current step number
     * @example manager.saveState(grid, positions, 10)
     */
    saveState(grid: Cell[][][], collapsedPositions: Position3D[], step: number): void;
    /**
     * Restore to previous state
     *
     * @returns Previous state or null if no states available
     * @example const state = manager.restoreState()
     */
    restoreState(): BacktrackState | null;
    /**
     * Check if backtracking is possible
     *
     * @returns True if backtracking is possible
     * @example if (manager.canBacktrack()) { ... }
     */
    canBacktrack(): boolean;
    /**
     * Get number of saved states
     *
     * @returns Number of saved states
     * @example const count = manager.getStateCount()
     */
    getStateCount(): number;
    /**
     * Clear all saved states
     * @example manager.clearStates()
     */
    clearStates(): void;
    /**
     * Deep copy grid for state saving
     *
     * @param grid Grid to copy
     * @returns Deep copy of grid
     * @example const copy = this.deepCopyGrid(grid)
     */
    private deepCopyGrid;
}
/**
 * Check if grid has contradictions
 *
 * @param grid Grid to check
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @returns True if contradictions found
 * @example hasContradictions(grid, 10, 10, 1)
 */
export declare function hasContradictions(grid: Cell[][][], width: number, height: number, depth: number): boolean;
/**
 * Find cells with contradictions
 *
 * @param grid Grid to check
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @returns Array of positions with contradictions
 * @example const positions = findContradictionPositions(grid, 10, 10, 1)
 */
export declare function findContradictionPositions(grid: Cell[][][], width: number, height: number, depth: number): Position3D[];
/**
 * Reset cell to initial state
 *
 * @param cell Cell to reset
 * @param initialTiles Initial possible tiles
 * @example resetCell(cell, ['tile1', 'tile2'])
 */
export declare function resetCell(cell: Cell, initialTiles: string[]): void;
/**
 * Reset grid to initial state
 *
 * @param grid Grid to reset
 * @param initialTiles Initial possible tiles
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @example resetGrid(grid, ['tile1'], 10, 10, 1)
 */
export declare function resetGrid(grid: Cell[][][], initialTiles: string[], width: number, height: number, depth: number): void;
/**
 * Get last collapsed position
 *
 * @param collapsedPositions Array of collapsed positions
 * @returns Last collapsed position or null
 * @example const pos = getLastCollapsedPosition(positions)
 */
export declare function getLastCollapsedPosition(collapsedPositions: Position3D[]): Position3D | null;
/**
 * Remove last collapsed position
 *
 * @param collapsedPositions Array of collapsed positions
 * @returns Removed position or null
 * @example const pos = removeLastCollapsedPosition(positions)
 */
export declare function removeLastCollapsedPosition(collapsedPositions: Position3D[]): Position3D | null;
/**
 * Check if position was recently collapsed
 *
 * @param position Position to check
 * @param collapsedPositions Array of collapsed positions
 * @param recentCount Number of recent positions to check
 * @returns True if position was recently collapsed
 * @example wasRecentlyCollapsed({x: 1, y: 1, z: 0}, positions, 5)
 */
export declare function wasRecentlyCollapsed(position: Position3D, collapsedPositions: Position3D[], recentCount?: number): boolean;
/**
 * Get backtrack statistics
 *
 * @param backtrackManager Backtrack manager
 * @returns Backtrack statistics
 * @example const stats = getBacktrackStats(manager)
 */
export declare function getBacktrackStats(backtrackManager: BacktrackManager): {
    stateCount: number;
    canBacktrack: boolean;
    maxSteps: number;
};
/**
 * Create initial grid state
 *
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @param initialTiles Initial possible tiles
 * @returns Initialized grid
 * @example const grid = createInitialGrid(10, 10, 1, ['tile1', 'tile2'])
 */
export declare function createInitialGrid(width: number, height: number, depth: number, initialTiles: string[]): Cell[][][];
//# sourceMappingURL=wfc-backtrack.d.ts.map