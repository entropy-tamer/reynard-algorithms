/**
 * @file Wave Function Collapse Generation Loop
 * @description Core generation loop and cell operations
 */

import type { Position3D, Constraint, Cell } from "./wave-function-collapse-types";
import { BacktrackManager, hasContradictions } from "./wfc-backtrack";
import {
  propagateConstraints,
  findMinimumEntropyCell,
  collapseCell,
  selectRandomTile,
  isGridFullyCollapsed,
} from "./wfc-propagation";

/**
 * Handle backtracking when contradictions are found
 * @param backtrackManager
 * @param grid
 * @param collapsedPositions
 * @example
 */
export function handleBacktrack(
  backtrackManager: BacktrackManager,
  grid: Cell[][][],
  collapsedPositions: Position3D[]
): { step: number } | null {
  const previousState = backtrackManager.restoreState();
  if (previousState) {
    Object.assign(grid, previousState.grid);
    collapsedPositions.length = 0;
    collapsedPositions.push(...previousState.collapsedPositions);
    return { step: previousState.step };
  }
  return null;
}

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
export function collapseAndPropagate(
  grid: Cell[][][],
  position: Position3D,
  activeConstraints: Constraint[],
  width: number,
  height: number,
  depth: number,
  collapsedPositions: Position3D[],
  random: () => number
): boolean {
  const layer = grid[position.z];
  if (!layer) {
    throw new Error(`Invalid z position: ${position.z}`);
  }
  const row = layer[position.y];
  if (!row) {
    throw new Error(`Invalid y position: ${position.y}`);
  }
  const cell = row[position.x];
  if (!cell) {
    throw new Error(`Invalid x position: ${position.x}`);
  }
  const selectedTile = selectRandomTile(cell, random);
  if (typeof selectedTile !== "string") {
    throw new Error("Invalid tile selected");
  }
  collapseCell(cell, selectedTile, random);
  collapsedPositions.push(position);
  return propagateConstraints(grid, activeConstraints, position, selectedTile, width, height, depth);
}

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
export function runGenerationLoop(
  grid: Cell[][][],
  activeConstraints: Constraint[],
  width: number,
  height: number,
  depth: number,
  maxIterations: number,
  random: () => number
): GenerationLoopResult {
  const backtrackManager = new BacktrackManager();
  const collapsedPositions: Position3D[] = [];
  let iterations = 0;
  let success = false;

  while (iterations < maxIterations && !success) {
    if (hasContradictions(grid, width, height, depth)) {
      const previousState = handleBacktrack(backtrackManager, grid, collapsedPositions);
      if (previousState) {
        iterations = previousState.step;
        continue;
      } else {
        break;
      }
    }

    if (isGridFullyCollapsed(grid, width, height, depth)) {
      success = true;
      break;
    }

    const minEntropyPos = findMinimumEntropyCell(grid, width, height, depth);
    if (!minEntropyPos) {
      break;
    }

    backtrackManager.saveState(grid, [...collapsedPositions], iterations);
    if (
      !collapseAndPropagate(grid, minEntropyPos, activeConstraints, width, height, depth, collapsedPositions, random)
    ) {
      continue;
    }

    iterations++;
  }

  return { iterations, success };
}
