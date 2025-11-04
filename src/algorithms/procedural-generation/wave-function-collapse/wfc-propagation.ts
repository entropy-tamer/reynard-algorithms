/**
 * @file Wave Function Collapse propagation and entropy operations
 */
/* eslint-disable max-lines, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Wave Function Collapse Propagation Operations
 *
 * Handles constraint propagation and entropy calculation
 * for the Wave Function Collapse algorithm.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */

import type {
  Cell,
  Constraint,
  Position2D,
  Position3D,
  Direction2D,
  Direction3D,
} from "./wave-function-collapse-types";

/**
 * Propagate constraints after a cell collapse
 *
 * @param grid Grid of cells
 * @param constraints Array of constraints
 * @param position Position of collapsed cell
 * @param collapsedTile Tile that was collapsed to
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @returns True if propagation was successful (no contradictions)
 * @example
 */
export function propagateConstraints(
  grid: Cell[][][],
  constraints: Constraint[],
  position: Position3D,
  collapsedTile: string,
  width: number,
  height: number,
  depth: number
): boolean {
  const queue: Position3D[] = [position];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentPos = queue.shift()!;
    const posKey = `${currentPos.x},${currentPos.y},${currentPos.z}`;

    if (visited.has(posKey)) continue;
    visited.add(posKey);

    const currentCell = grid[currentPos.z][currentPos.y][currentPos.x];
    if (currentCell.isCollapsed) continue;

    // Check all directions
    const directions: Direction3D[] = ["north", "south", "east", "west", "up", "down"];

    for (const direction of directions) {
      const neighborPos = getNeighborPosition3D(currentPos, direction);

      if (!isValidPosition3D(neighborPos, width, height, depth)) continue;

      const neighborCell = grid[neighborPos.z][neighborPos.y][neighborPos.x];
      if (neighborCell.isCollapsed) continue;

      // Apply constraints
      const wasModified = applyConstraintsToNeighbor(currentCell, neighborCell, constraints, direction);

      if (wasModified) {
        // Check if neighbor has no valid tiles left
        if (neighborCell.possibleTiles.length === 0) {
          return false; // Contradiction found
        }

        // Add neighbor to queue for further propagation
        queue.push(neighborPos);
      }
    }
  }

  return true; // No contradictions found
}

/**
 * Apply constraints to a neighbor cell
 *
 * @param currentCell Current cell
 * @param neighborCell Neighbor cell to update
 * @param constraints Array of constraints
 * @param direction Direction from current to neighbor
 * @returns True if neighbor was modified
 * @example
 */
function applyConstraintsToNeighbor(
  currentCell: Cell,
  neighborCell: Cell,
  constraints: Constraint[],
  direction: Direction3D
): boolean {
  let wasModified = false;
  const originalLength = neighborCell.possibleTiles.length;

  // Get allowed tiles for the current cell's possible tiles in this direction
  const allowedTiles = new Set<string>();

  for (const tile of currentCell.possibleTiles) {
    const tileConstraints = constraints.filter(c => c.tile1 === tile && c.direction === direction);

    for (const constraint of tileConstraints) {
      allowedTiles.add(constraint.tile2);
    }
  }

  // Filter neighbor's possible tiles to only include allowed ones
  neighborCell.possibleTiles = neighborCell.possibleTiles.filter(tile => allowedTiles.has(tile));

  wasModified = neighborCell.possibleTiles.length !== originalLength;
  return wasModified;
}

/**
 * Calculate entropy for a cell
 *
 * @param cell Cell to calculate entropy for
 * @returns Entropy value
 * @example
 */
export function calculateEntropy(cell: Cell): number {
  if (cell.isCollapsed || cell.possibleTiles.length === 0) {
    return 0;
  }

  if (cell.possibleTiles.length === 1) {
    return 0;
  }

  // Shannon entropy calculation
  const totalWeight = cell.possibleTiles.reduce((sum, tile) => sum + 1, 0);
  let entropy = 0;

  for (const tile of cell.possibleTiles) {
    const probability = 1 / totalWeight;
    if (probability > 0) {
      entropy -= probability * Math.log2(probability);
    }
  }

  return entropy;
}

/**
 * Find cell with minimum entropy
 *
 * @param grid Grid of cells
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @returns Position of cell with minimum entropy, or null if all collapsed
 * @example
 */
export function findMinimumEntropyCell(
  grid: Cell[][][],
  width: number,
  height: number,
  depth: number
): Position3D | null {
  let minEntropy = Infinity;
  let minEntropyPos: Position3D | null = null;

  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid[z][y][x];

        if (cell.isCollapsed) continue;

        const entropy = calculateEntropy(cell);

        if (entropy < minEntropy) {
          minEntropy = entropy;
          minEntropyPos = { x, y, z };
        }
      }
    }
  }

  return minEntropyPos;
}

/**
 * Collapse a cell to a specific tile
 *
 * @param cell Cell to collapse
 * @param _tile Tile to collapse to
 * @param _random Random number generator
 * @example
 */
export function collapseCell(cell: Cell, _tile: any, _random: () => number): void {
  cell.isCollapsed = true;
  cell.possibleTiles = [_tile];
  cell.entropy = 0;
}

/**
 * Select a random tile from possible tiles
 *
 * @param cell Cell to select tile for
 * @param random Random number generator
 * @returns Selected tile
 * @example
 */
export function selectRandomTile(cell: Cell, random: () => number): any {
  if (cell.possibleTiles.length === 0) {
    throw new Error("No possible tiles available for selection");
  }

  if (cell.possibleTiles.length === 1) {
    return cell.possibleTiles[0];
  }

  // Weighted random selection
  const totalWeight = cell.possibleTiles.length;
  let randomValue = random() * totalWeight;

  for (let i = 0; i < cell.possibleTiles.length; i++) {
    randomValue -= 1;
    if (randomValue <= 0) {
      return cell.possibleTiles[i];
    }
  }

  // Fallback to last tile
  return cell.possibleTiles[cell.possibleTiles.length - 1];
}

/**
 * Check if grid is fully collapsed
 *
 * @param grid Grid of cells
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @returns True if all cells are collapsed
 * @example
 */
export function isGridFullyCollapsed(grid: Cell[][][], width: number, height: number, depth: number): boolean {
  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!grid[z][y][x].isCollapsed) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Get neighbor position in 3D
 *
 * @param pos Current position
 * @param direction Direction to move
 * @returns Neighbor position
 * @example
 */
function getNeighborPosition3D(pos: Position3D, direction: Direction3D): Position3D {
  switch (direction) {
    case "north":
      return { x: pos.x, y: pos.y - 1, z: pos.z };
    case "south":
      return { x: pos.x, y: pos.y + 1, z: pos.z };
    case "east":
      return { x: pos.x + 1, y: pos.y, z: pos.z };
    case "west":
      return { x: pos.x - 1, y: pos.y, z: pos.z };
    case "up":
      return { x: pos.x, y: pos.y, z: pos.z + 1 };
    case "down":
      return { x: pos.x, y: pos.y, z: pos.z - 1 };
    default:
      return pos;
  }
}

/**
 * Check if 3D position is valid
 *
 * @param pos Position to check
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @returns True if position is valid
 * @example
 */
function isValidPosition3D(pos: Position3D, width: number, height: number, depth: number): boolean {
  return pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height && pos.z >= 0 && pos.z < depth;
}
