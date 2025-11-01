/**
 * Wave Function Collapse Backtrack Operations
 *
 * Handles backtracking, state management, and conflict resolution
 * for the Wave Function Collapse algorithm.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */

import type {
  Cell,
  Position3D,
} from "./wave-function-collapse-types";

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
export class BacktrackManager {
  private states: BacktrackState[] = [];
  private maxBacktrackSteps: number;

  constructor(maxBacktrackSteps: number = 1000) {
    this.maxBacktrackSteps = maxBacktrackSteps;
  }

  /**
   * Save current state for backtracking
   *
   * @param grid Current grid state
   * @param collapsedPositions Positions that have been collapsed
   * @param step Current step number
   */
  saveState(grid: Cell[][][], collapsedPositions: Position3D[], step: number): void {
    if (this.states.length >= this.maxBacktrackSteps) {
      // Remove oldest state to make room
      this.states.shift();
    }

    const state: BacktrackState = {
      grid: this.deepCopyGrid(grid),
      collapsedPositions: [...collapsedPositions],
      step,
    };

    this.states.push(state);
  }

  /**
   * Restore to previous state
   *
   * @returns Previous state or null if no states available
   */
  restoreState(): BacktrackState | null {
    if (this.states.length === 0) {
      return null;
    }

    return this.states.pop() || null;
  }

  /**
   * Check if backtracking is possible
   *
   * @returns True if backtracking is possible
   */
  canBacktrack(): boolean {
    return this.states.length > 0;
  }

  /**
   * Get number of saved states
   *
   * @returns Number of saved states
   */
  getStateCount(): number {
    return this.states.length;
  }

  /**
   * Clear all saved states
   */
  clearStates(): void {
    this.states = [];
  }

  /**
   * Deep copy grid for state saving
   *
   * @param grid Grid to copy
   * @returns Deep copy of grid
   */
  private deepCopyGrid(grid: Cell[][][]): Cell[][][] {
    return grid.map(layer =>
      layer.map(row =>
        row.map(cell => ({
          ...cell,
          possibleTiles: [...cell.possibleTiles],
        }))
      )
    );
  }
}

/**
 * Check if grid has contradictions
 *
 * @param grid Grid to check
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @returns True if contradictions found
 */
export function hasContradictions(
  grid: Cell[][][],
  width: number,
  height: number,
  depth: number
): boolean {
  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid[z][y][x];
        if (!cell.isCollapsed && cell.possibleTiles.length === 0) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Find cells with contradictions
 *
 * @param grid Grid to check
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @returns Array of positions with contradictions
 */
export function findContradictionPositions(
  grid: Cell[][][],
  width: number,
  height: number,
  depth: number
): Position3D[] {
  const contradictions: Position3D[] = [];

  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid[z][y][x];
        if (!cell.isCollapsed && cell.possibleTiles.length === 0) {
          contradictions.push({ x, y, z });
        }
      }
    }
  }

  return contradictions;
}

/**
 * Reset cell to initial state
 *
 * @param cell Cell to reset
 * @param initialTiles Initial possible tiles
 */
export function resetCell(cell: Cell, initialTiles: any[]): void {
  cell.isCollapsed = false;
  cell.possibleTiles = [...initialTiles];
  cell.entropy = 0;
}

/**
 * Reset grid to initial state
 *
 * @param grid Grid to reset
 * @param initialTiles Initial possible tiles
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 */
export function resetGrid(
  grid: Cell[][][],
  initialTiles: any[],
  width: number,
  height: number,
  depth: number
): void {
  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        resetCell(grid[z][y][x], initialTiles);
      }
    }
  }
}

/**
 * Get last collapsed position
 *
 * @param collapsedPositions Array of collapsed positions
 * @returns Last collapsed position or null
 */
export function getLastCollapsedPosition(collapsedPositions: Position3D[]): Position3D | null {
  return collapsedPositions.length > 0 ? collapsedPositions[collapsedPositions.length - 1] : null;
}

/**
 * Remove last collapsed position
 *
 * @param collapsedPositions Array of collapsed positions
 * @returns Removed position or null
 */
export function removeLastCollapsedPosition(collapsedPositions: Position3D[]): Position3D | null {
  return collapsedPositions.pop() || null;
}

/**
 * Check if position was recently collapsed
 *
 * @param position Position to check
 * @param collapsedPositions Array of collapsed positions
 * @param recentCount Number of recent positions to check
 * @returns True if position was recently collapsed
 */
export function wasRecentlyCollapsed(
  position: Position3D,
  collapsedPositions: Position3D[],
  recentCount: number = 5
): boolean {
  const recentPositions = collapsedPositions.slice(-recentCount);
  return recentPositions.some(pos => 
    pos.x === position.x && pos.y === position.y && pos.z === position.z
  );
}

/**
 * Get backtrack statistics
 *
 * @param backtrackManager Backtrack manager
 * @returns Backtrack statistics
 */
export function getBacktrackStats(backtrackManager: BacktrackManager): {
  stateCount: number;
  canBacktrack: boolean;
  maxSteps: number;
} {
  return {
    stateCount: backtrackManager.getStateCount(),
    canBacktrack: backtrackManager.canBacktrack(),
    maxSteps: 1000, // This would be configurable in a real implementation
  };
}

/**
 * Create initial grid state
 *
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @param initialTiles Initial possible tiles
 * @returns Initialized grid
 */
export function createInitialGrid(
  width: number,
  height: number,
  depth: number,
  initialTiles: any[]
): Cell[][][] {
  const grid: Cell[][][] = [];

  for (let z = 0; z < depth; z++) {
    const layer: Cell[][] = [];
    for (let y = 0; y < height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < width; x++) {
      row.push({
        position: { x, y, z },
        possibleTiles: [...initialTiles],
        isCollapsed: false,
        entropy: 0,
        weightSum: initialTiles.length,
      });
      }
      layer.push(row);
    }
    grid.push(layer);
  }

  return grid;
}
