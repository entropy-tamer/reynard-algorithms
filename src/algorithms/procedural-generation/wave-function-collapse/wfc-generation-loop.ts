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
  const cell = grid[position.z][position.y][position.x];
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
