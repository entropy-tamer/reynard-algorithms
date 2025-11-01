/**
 * Flow Field Validation Operations
 *
 * Handles input validation, error checking, and flow field validation
 * for the Flow Field pathfinding algorithm.
 *
 * @module algorithms/pathfinding/flow-field
 */

import type {
  Point,
  FlowCell,
  FlowFieldValidationOptions,
  FlowFieldValidationResult,
} from "./flow-field-types";
import { CellType } from "./flow-field-types";
import { 
  UnifiedValidationResult, 
  createUnifiedValidationResult, 
  createValidationMessage, 
  createDetailedValidationResult,
  ValidationSeverity 
} from "../../types/validation-types";

/**
 * Validate input parameters for flow field generation
 *
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param goals Array of goal points
 * @returns Validation result
 */
export function validateInput(
  grid: CellType[],
  width: number,
  height: number,
  goals: Point[]
): UnifiedValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate grid dimensions
  if (width <= 0 || height <= 0) {
    errors.push("Grid dimensions must be positive");
  }

  if (grid.length !== width * height) {
    errors.push(`Grid length (${grid.length}) does not match width * height (${width * height})`);
  }

  // Validate goals
  if (!goals || goals.length === 0) {
    errors.push("At least one goal point is required");
  } else {
    for (let i = 0; i < goals.length; i++) {
      const goal = goals[i];
      if (!isValidPoint(goal, width, height)) {
        errors.push(`Goal ${i} is outside grid bounds: (${goal.x}, ${goal.y})`);
      } else {
        const index = goal.y * width + goal.x;
        if (grid[index] === CellType.OBSTACLE) {
          errors.push(`Goal ${i} is placed on an obstacle: (${goal.x}, ${goal.y})`);
        }
      }
    }
  }

  // Check for unreachable areas
  const reachableCells = countReachableCells(grid, width, height, goals);
  const totalWalkableCells = grid.filter(cell => cell === CellType.WALKABLE).length;
  
  if (reachableCells < totalWalkableCells * 0.5) {
    warnings.push("Less than 50% of walkable cells are reachable from goals");
  }

  return createUnifiedValidationResult(
    errors.length === 0,
    errors.map((e, i) => createValidationMessage(`error-${i}`, ValidationSeverity.ERROR, e)),
    warnings.map((w, i) => createValidationMessage(`warning-${i}`, ValidationSeverity.WARNING, w)),
    [],
    [
      {
        component: "grid",
        isValid: errors.length === 0,
        errors: errors.map((e, i) => createValidationMessage(`grid-error-${i}`, ValidationSeverity.ERROR, e)),
        warnings: warnings.map((w, i) => createValidationMessage(`grid-warning-${i}`, ValidationSeverity.WARNING, w)),
        metadata: {
          gridSize: width * height,
          goalCount: goals.length,
          reachableCells,
          totalWalkableCells,
        },
      },
    ]
  );
}

/**
 * Validate flow field structure and content
 *
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @param options Validation options
 * @returns Validation result
 */
export function validateFlowField(
  flowField: FlowCell[],
  width: number,
  height: number,
  options: Partial<FlowFieldValidationOptions> = {}
): FlowFieldValidationResult {
  const validationOptions: FlowFieldValidationOptions = {
    checkFlowFieldValidity: options.checkFlowFieldValidity ?? true,
    checkIntegrationFieldValidity: options.checkIntegrationFieldValidity ?? false,
    checkUnreachableAreas: options.checkUnreachableAreas ?? false,
    checkInvalidFlowVectors: options.checkInvalidFlowVectors ?? true,
    maxFlowVectorMagnitude: options.maxFlowVectorMagnitude ?? Infinity,
    minFlowVectorMagnitude: options.minFlowVectorMagnitude ?? 0,
    checkCircularFlows: options.checkCircularFlows ?? false,
    checkMagnitude: options.checkMagnitude ?? true,
    checkDirection: options.checkDirection ?? true,
    checkConsistency: options.checkConsistency ?? true,
    tolerance: options.tolerance ?? 1e-10,
  };

  const errors: string[] = [];
  const warnings: string[] = [];
  const stats = {
    totalCells: width * height,
    validCells: 0,
    invalidCells: 0,
    zeroMagnitudeCells: 0,
    maxMagnitude: 0,
    minMagnitude: Infinity,
  };

  // Validate flow field dimensions
  if (flowField.length !== width * height) {
    errors.push(`Flow field length (${flowField.length}) does not match grid size (${width * height})`);
    return {
      isValid: false,
      errors,
      warnings,
      hasValidFlowField: false,
      hasValidIntegrationField: true,
      hasUnreachableAreas: false,
      hasInvalidFlowVectors: true,
      hasCircularFlows: false,
      stats,
    };
  }

  // Check each cell
  for (let i = 0; i < flowField.length; i++) {
    const cell = flowField[i];
    const point = { x: i % width, y: Math.floor(i / width) };

    if (!isValidFlowCell(cell, validationOptions.tolerance || 1e-10)) {
      errors.push(`Invalid flow cell at (${point.x}, ${point.y}): ${JSON.stringify(cell)}`);
      stats.invalidCells++;
      continue;
    }

    stats.validCells++;

    if (validationOptions.checkMagnitude) {
      if (cell.magnitude < 0) {
        errors.push(`Negative magnitude at (${point.x}, ${point.y}): ${cell.magnitude}`);
      }

      if (cell.magnitude === 0) {
        stats.zeroMagnitudeCells++;
      }

      stats.maxMagnitude = Math.max(stats.maxMagnitude, cell.magnitude);
      stats.minMagnitude = Math.min(stats.minMagnitude, cell.magnitude);
    }

    if (validationOptions.checkDirection) {
      const expectedMagnitude = Math.sqrt(cell.x * cell.x + cell.y * cell.y);
      const magnitudeDiff = Math.abs(cell.magnitude - expectedMagnitude);
      
      if (magnitudeDiff > (validationOptions.tolerance || 1e-10)) {
        warnings.push(`Magnitude mismatch at (${point.x}, ${point.y}): expected ${expectedMagnitude}, got ${cell.magnitude}`);
      }
    }
  }

  // Check consistency
  if (validationOptions.checkConsistency) {
    const consistencyIssues = checkFlowFieldConsistency(flowField, width, height);
    warnings.push(...consistencyIssues);
  }

  // Update stats
  if (stats.minMagnitude === Infinity) {
    stats.minMagnitude = 0;
  }

  const isValid = errors.length === 0;
  return {
    isValid,
    errors,
    warnings,
    hasValidFlowField: isValid,
    hasValidIntegrationField: true,
    hasUnreachableAreas: false,
    hasInvalidFlowVectors: stats.invalidCells > 0,
    hasCircularFlows: false,
    stats,
  };
}

/**
 * Check if a flow cell is valid
 *
 * @param cell Flow cell to check
 * @param tolerance Tolerance for validation
 * @returns True if cell is valid
 */
function isValidFlowCell(cell: FlowCell, tolerance: number): boolean {
  if (typeof cell.x !== 'number' || typeof cell.y !== 'number' || typeof cell.magnitude !== 'number') {
    return false;
  }

  if (!isFinite(cell.x) || !isFinite(cell.y) || !isFinite(cell.magnitude)) {
    return false;
  }

  return true;
}

/**
 * Check flow field consistency
 *
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @returns Array of consistency issues
 */
function checkFlowFieldConsistency(
  flowField: FlowCell[],
  width: number,
  height: number
): string[] {
  const issues: string[] = [];
  const circularFlows = detectCircularFlows(flowField, width, height);

  if (circularFlows.length > 0) {
    issues.push(`Detected ${circularFlows.length} circular flow patterns`);
  }

  // Check for isolated regions
  const isolatedRegions = detectIsolatedRegions(flowField, width, height);
  if (isolatedRegions.length > 0) {
    issues.push(`Detected ${isolatedRegions.length} isolated regions`);
  }

  return issues;
}

/**
 * Detect circular flows in the flow field
 *
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @returns Array of points in circular flows
 */
function detectCircularFlows(
  flowField: FlowCell[],
  width: number,
  height: number
): Point[] {
  const visited = new Set<string>();
  const circularPoints: Point[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const point = { x, y };
      const key = pointToKey(point);

      if (visited.has(key)) {
        continue;
      }

      const cycle = findCycle(point, flowField, width, height, visited);
      if (cycle.length > 0) {
        circularPoints.push(...cycle);
      }
    }
  }

  return circularPoints;
}

/**
 * Find cycle starting from a point
 *
 * @param start Starting point
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @param visited Set of visited points
 * @returns Array of points in the cycle
 */
function findCycle(
  start: Point,
  flowField: FlowCell[],
  width: number,
  height: number,
  visited: Set<string>
): Point[] {
  const path: Point[] = [];
  const pathSet = new Set<string>();
  let current = start;

  while (current) {
    const key = pointToKey(current);
    
    if (pathSet.has(key)) {
      // Found a cycle
      const cycleStart = path.findIndex(p => pointToKey(p) === key);
      return path.slice(cycleStart);
    }

    if (visited.has(key)) {
      break;
    }

    path.push(current);
    pathSet.add(key);
    visited.add(key);

    const next = getNextPoint(current, flowField, width, height);
    if (!next) {
      break;
    }

    current = next;
  }

  return [];
}

/**
 * Get next point based on flow field
 *
 * @param point Current point
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @returns Next point or null
 */
function getNextPoint(
  point: Point,
  flowField: FlowCell[],
  width: number,
  height: number
): Point | null {
  const index = point.y * width + point.x;
  const flow = flowField[index];

  if (flow.magnitude === 0) {
    return null;
  }

  const next = {
    x: Math.round(point.x + flow.x),
    y: Math.round(point.y + flow.y),
  };

  if (isValidPoint(next, width, height)) {
    return next;
  }

  return null;
}

/**
 * Detect isolated regions in the flow field
 *
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @returns Array of isolated region points
 */
function detectIsolatedRegions(
  flowField: FlowCell[],
  width: number,
  height: number
): Point[][] {
  const visited = new Set<string>();
  const regions: Point[][] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const point = { x, y };
      const key = pointToKey(point);

      if (visited.has(key)) {
        continue;
      }

      const region = floodFill(point, flowField, width, height, visited);
      if (region.length > 1) {
        regions.push(region);
      }
    }
  }

  return regions;
}

/**
 * Flood fill to find connected region
 *
 * @param start Starting point
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @param visited Set of visited points
 * @returns Array of points in the region
 */
function floodFill(
  start: Point,
  flowField: FlowCell[],
  width: number,
  height: number,
  visited: Set<string>
): Point[] {
  const region: Point[] = [];
  const queue: Point[] = [start];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = pointToKey(current);

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);
    region.push(current);

    const neighbors = getNeighbors(current, width, height);
    for (const neighbor of neighbors) {
      const neighborKey = pointToKey(neighbor);
      if (!visited.has(neighborKey)) {
        queue.push(neighbor);
      }
    }
  }

  return region;
}

/**
 * Count reachable cells from goals
 *
 * @param grid Grid of cell types
 * @param width Grid width
 * @param height Grid height
 * @param goals Array of goal points
 * @returns Number of reachable cells
 */
function countReachableCells(
  grid: CellType[],
  width: number,
  height: number,
  goals: Point[]
): number {
  const visited = new Set<string>();
  const queue: Point[] = [...goals];

  for (const goal of goals) {
    const key = pointToKey(goal);
    if (!visited.has(key)) {
      visited.add(key);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = getNeighbors(current, width, height);

    for (const neighbor of neighbors) {
      const key = pointToKey(neighbor);
      if (visited.has(key)) {
        continue;
      }

      const index = neighbor.y * width + neighbor.x;
      if (grid[index] === CellType.WALKABLE) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }

  return visited.size;
}

/**
 * Get valid neighbors for a point
 *
 * @param point Current point
 * @param width Grid width
 * @param height Grid height
 * @returns Array of valid neighbor points
 */
function getNeighbors(point: Point, width: number, height: number): Point[] {
  const neighbors: Point[] = [];
  const directions = [
    { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 },
    { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 },
  ];

  for (const direction of directions) {
    const neighbor = {
      x: point.x + direction.x,
      y: point.y + direction.y,
    };

    if (isValidPoint(neighbor, width, height)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

/**
 * Check if a point is valid
 *
 * @param point Point to check
 * @param width Grid width
 * @param height Grid height
 * @returns True if point is valid
 */
function isValidPoint(point: Point, width: number, height: number): boolean {
  return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
}

/**
 * Convert point to string key
 *
 * @param point Point to convert
 * @returns String key
 */
function pointToKey(point: Point): string {
  return `${point.x},${point.y}`;
}

