/**
 * Flow Field Generation Operations
 *
 * Handles core flow field generation algorithms including
 * integration field calculation and flow vector generation.
 *
 * @module algorithms/pathfinding/flow-field
 */

import type {
  Point,
  IntegrationCell,
  FlowCell,
  FlowFieldConfig,
  FlowFieldOptions,
  FlowFieldStats,
} from "./flow-field-types";
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
export function generateIntegrationField(
  grid: CellType[],
  width: number,
  height: number,
  goals: Point[],
  config: FlowFieldConfig,
  stats: FlowFieldStats
): IntegrationCell[] {
  const integrationField: IntegrationCell[] = new Array(width * height);
  const queue: { point: Point; cost: number }[] = [];
  const visited = new Set<string>();

  // Initialize integration field
  for (let i = 0; i < width * height; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    integrationField[i] = {
      x,
      y,
      cost: config.maxCost,
      processed: false,
    };
  }

  // Add goal points to queue
  for (const goal of goals) {
    const index = goal.y * width + goal.x;
    if (isValidCell(goal, width, height) && grid[index] !== CellType.OBSTACLE) {
      integrationField[index] = { x: goal.x, y: goal.y, cost: 0, processed: true };
      queue.push({ point: goal, cost: 0 });
      visited.add(pointToKey(goal));
      stats.goalCells++;
      stats.cellsProcessed++; // Count goal cells as processed
    }
  }

  // Process queue
  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift()!;
    const currentIndex = current.point.y * width + current.point.x;
    const currentKey = pointToKey(current.point);

    if (visited.has(currentKey) && integrationField[currentIndex].processed) {
      continue;
    }

    visited.add(currentKey);
    integrationField[currentIndex].processed = true;
    stats.cellsProcessed++;

    // Check neighbors
    const neighbors = getNeighbors(current.point, width, height);
    for (const neighbor of neighbors) {
      const neighborIndex = neighbor.y * width + neighbor.x;
      const neighborKey = pointToKey(neighbor);

      if (visited.has(neighborKey) || grid[neighborIndex] === CellType.OBSTACLE) {
        continue;
      }

      const movementCost = getMovementCost(current.point, neighbor, config);
      const newCost = integrationField[currentIndex].cost + movementCost;

      if (newCost < integrationField[neighborIndex].cost) {
        integrationField[neighborIndex].cost = newCost;
        queue.push({ point: neighbor, cost: newCost });
        visited.add(neighborKey);
      }
    }
  }

  return integrationField;
}

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
export function generateFlowField(
  integrationField: IntegrationCell[],
  grid: CellType[],
  width: number,
  height: number,
  config: FlowFieldConfig,
  options: FlowFieldOptions
): FlowCell[] {
  const flowField: FlowCell[] = new Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const point = { x, y };

      if (grid[index] === CellType.OBSTACLE) {
        flowField[index] = {
          x,
          y,
          vector: { x: 0, y: 0 },
          magnitude: 0,
          valid: false,
        };
        continue;
      }

      const flowVector = calculateFlowVector(point, integrationField, width, height, config);

      if (options.normalizeFlowVectors && flowVector.magnitude > 0) {
        const normalized = normalizeVector(flowVector);
        flowField[index] = normalized;
      } else {
        flowField[index] = flowVector;
      }
    }
  }

  return flowField;
}

/**
 * Calculate flow vector for a point
 *
 * @param point Point to calculate flow vector for
 * @param integrationField Integration field
 * @param width Grid width
 * @param height Grid height
 * @param config Flow field configuration
 * @returns Flow vector
 * @example
 */
function calculateFlowVector(
  point: Point,
  integrationField: IntegrationCell[],
  width: number,
  height: number,
  config: FlowFieldConfig
): FlowCell {
  const currentIndex = point.y * width + point.x;
  const currentCost = integrationField[currentIndex].cost;

  if (currentCost >= config.maxCost) {
    return {
      x: point.x,
      y: point.y,
      vector: { x: 0, y: 0 },
      magnitude: 0,
      valid: false,
    };
  }

  let bestDirection = { x: 0, y: 0 };
  let lowestCost = currentCost;

  const neighbors = getNeighbors(point, width, height);
  for (const neighbor of neighbors) {
    const neighborIndex = neighbor.y * width + neighbor.x;
    const neighborCost = integrationField[neighborIndex].cost;

    if (neighborCost < lowestCost) {
      lowestCost = neighborCost;
      bestDirection = {
        x: neighbor.x - point.x,
        y: neighbor.y - point.y,
      };
    }
  }

  const magnitude = Math.sqrt(bestDirection.x ** 2 + bestDirection.y ** 2);
  return {
    x: point.x,
    y: point.y,
    vector: bestDirection,
    magnitude,
    valid: magnitude > 0,
  };
}

/**
 * Get valid neighbors for a point
 *
 * @param point Current point
 * @param width Grid width
 * @param height Grid height
 * @returns Array of valid neighbor points
 * @example
 */
function getNeighbors(point: Point, width: number, height: number): Point[] {
  const neighbors: Point[] = [];
  const directions = [
    { x: -1, y: 0 }, // West
    { x: 1, y: 0 }, // East
    { x: 0, y: -1 }, // North
    { x: 0, y: 1 }, // South
    { x: -1, y: -1 }, // Northwest
    { x: 1, y: -1 }, // Northeast
    { x: -1, y: 1 }, // Southwest
    { x: 1, y: 1 }, // Southeast
  ];

  for (const direction of directions) {
    const neighbor = {
      x: point.x + direction.x,
      y: point.y + direction.y,
    };

    if (isValidCell(neighbor, width, height)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

/**
 * Check if a cell is valid
 *
 * @param point Point to check
 * @param width Grid width
 * @param height Grid height
 * @returns True if cell is valid
 * @example
 */
function isValidCell(point: Point, width: number, height: number): boolean {
  return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
}

/**
 * Get movement cost between two points
 *
 * @param from Source point
 * @param to Destination point
 * @param config Flow field configuration
 * @returns Movement cost
 * @example
 */
function getMovementCost(from: Point, to: Point, config: FlowFieldConfig): number {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);

  if (dx === 0 && dy === 0) {
    return 0;
  }

  if (dx === 1 && dy === 1) {
    return config.diagonalCost;
  }

  if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
    return config.cardinalCost;
  }

  return config.maxCost;
}

/**
 * Normalize a flow vector
 *
 * @param vector Flow vector to normalize
 * @returns Normalized flow vector
 * @example
 */
function normalizeVector(vector: FlowCell): FlowCell {
  if (vector.magnitude === 0) {
    return {
      x: vector.x,
      y: vector.y,
      vector: { x: 0, y: 0 },
      magnitude: 0,
      valid: false,
    };
  }

  const normalizedVector = {
    x: vector.vector.x / vector.magnitude,
    y: vector.vector.y / vector.magnitude,
  };
  return {
    x: vector.x,
    y: vector.y,
    vector: normalizedVector,
    magnitude: 1,
    valid: true,
  };
}

/**
 * Convert point to string key
 *
 * @param point Point to convert
 * @returns String key
 * @example
 */
function pointToKey(point: Point): string {
  return `${point.x},${point.y}`;
}
