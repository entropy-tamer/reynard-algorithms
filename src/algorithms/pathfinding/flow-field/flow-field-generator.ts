/**
 * @module algorithms/pathfinding/flow-field/flow-field-generator
 * @description Flow field generation algorithms using Dijkstra-based integration.
 */

import type { Point, Vector, IntegrationCell, FlowCell, FlowFieldConfig, FlowFieldOptions } from "./flow-field-types";
import { CellType } from "./flow-field-types";

/**
 * Flow field generation algorithms using Dijkstra-based integration.
 */
export class FlowFieldGenerator {
  /**
   * Generates an integration cost field using Dijkstra's algorithm.
   * @param grid - The grid as a 1D array.
   * @param goals - Array of goal points.
   * @param config - Flow field configuration.
   * @param options - Generation options.
   * @returns Integration cost field.
   * @example
   */
  static generateIntegrationField(
    grid: CellType[],
    goals: Point[],
    config: FlowFieldConfig,
    options: FlowFieldOptions = {
      returnIntegrationField: true,
      returnFlowField: false,
      normalizeFlowVectors: true,
      useEarlyTermination: true,
      maxIterations: config.width * config.height,
      useGoalBounding: false,
      useMultiGoal: false,
    }
  ): IntegrationCell[] {
    const { useEarlyTermination = true, maxIterations = config.width * config.height } = options;

    const integrationField: IntegrationCell[] = [];
    const processed = new Set<string>();
    const queue: Array<{ point: Point; cost: number }> = [];

    // Initialize integration field
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const index = y * config.width + x;
        const point = { x, y };

        if (grid[index] === CellType.GOAL) {
          integrationField.push({
            x,
            y,
            cost: 0,
            processed: true,
          });
          queue.push({ point, cost: 0 });
          processed.add(this.pointToKey(point));
        } else if (grid[index] === CellType.OBSTACLE) {
          integrationField.push({
            x,
            y,
            cost: config.maxCost,
            processed: true,
          });
          processed.add(this.pointToKey(point));
        } else {
          integrationField.push({
            x,
            y,
            cost: config.maxCost,
            processed: false,
          });
        }
      }
    }

    // Add goals from parameter to queue if they're not already in the grid
    for (const goal of goals) {
      const goalKey = this.pointToKey(goal);
      if (!processed.has(goalKey)) {
        const goalIndex = goal.y * config.width + goal.x;
        if (goalIndex >= 0 && goalIndex < grid.length && grid[goalIndex] !== CellType.OBSTACLE) {
          integrationField[goalIndex].cost = 0;
          integrationField[goalIndex].processed = true;
          queue.push({ point: goal, cost: 0 });
          processed.add(goalKey);
        }
      }
    }

    // Dijkstra's algorithm
    let iterations = 0;
    while (queue.length > 0 && iterations < maxIterations) {
      iterations++;

      // Get cell with minimum cost
      let minIndex = 0;
      for (let i = 1; i < queue.length; i++) {
        if (queue[i].cost < queue[minIndex].cost) {
          minIndex = i;
        }
      }

      const current = queue.splice(minIndex, 1)[0];
      const currentKey = this.pointToKey(current.point);

      if (processed.has(currentKey)) {
        continue;
      }

      processed.add(currentKey);

      // Update integration field
      const cellIndex = current.point.y * config.width + current.point.x;
      integrationField[cellIndex].cost = current.cost;
      integrationField[cellIndex].processed = true;

      // Process neighbors
      const neighbors = this.getNeighbors(current.point, grid, config);

      for (const neighbor of neighbors) {
        const neighborKey = this.pointToKey(neighbor);

        if (processed.has(neighborKey)) {
          continue;
        }

        const movementCost = this.getMovementCost(current.point, neighbor, config);
        const newCost = current.cost + movementCost;

        // Check if this is a better path
        const neighborCellIndex = neighbor.y * config.width + neighbor.x;
        if (newCost < integrationField[neighborCellIndex].cost) {
          integrationField[neighborCellIndex].cost = newCost;

          // Add to queue
          queue.push({ point: neighbor, cost: newCost });
        }
      }

      // Early termination for performance
      if (useEarlyTermination && iterations > 1000) {
        break;
      }
    }

    return integrationField;
  }

  /**
   * Generates a flow vector field from an integration cost field.
   * @param integrationField - The integration cost field.
   * @param grid - The grid as a 1D array.
   * @param config - Flow field configuration.
   * @param options - Generation options.
   * @returns Flow vector field.
   * @example
   */
  static generateFlowFieldFromIntegration(
    integrationField: IntegrationCell[],
    grid: CellType[],
    config: FlowFieldConfig,
    options: FlowFieldOptions = {
      returnIntegrationField: false,
      returnFlowField: true,
      normalizeFlowVectors: true,
      useEarlyTermination: false,
      maxIterations: config.width * config.height,
      useGoalBounding: false,
      useMultiGoal: false,
    }
  ): FlowCell[] {
    const { normalizeFlowVectors = true } = options;

    const flowField: FlowCell[] = [];

    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const index = y * config.width + x;
        const point = { x, y };

        if (grid[index] === CellType.OBSTACLE) {
          flowField.push({
            x,
            y,
            vector: { x: 0, y: 0 },
            magnitude: 0,
            valid: false,
          });
          continue;
        }

        // Find the neighbor with minimum integration cost
        const neighbors = this.getNeighbors(point, grid, config);
        let bestNeighbor: Point | null = null;
        let minCost = integrationField[index].cost;

        for (const neighbor of neighbors) {
          const neighborIndex = neighbor.y * config.width + neighbor.x;
          const neighborCost = integrationField[neighborIndex].cost;

          if (neighborCost < minCost) {
            minCost = neighborCost;
            bestNeighbor = neighbor;
          }
        }

        if (bestNeighbor) {
          // Calculate flow vector
          const vector: Vector = {
            x: bestNeighbor.x - point.x,
            y: bestNeighbor.y - point.y,
          };

          // Normalize vector if requested
          if (normalizeFlowVectors) {
            const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            if (magnitude > 0) {
              vector.x /= magnitude;
              vector.y /= magnitude;
            }
          }

          const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

          flowField.push({
            x,
            y,
            vector,
            magnitude,
            valid: true,
          });
        } else {
          // No valid neighbor found
          flowField.push({
            x,
            y,
            vector: { x: 0, y: 0 },
            magnitude: 0,
            valid: false,
          });
        }
      }
    }

    return flowField;
  }

  /**
   * Generates a complete flow field (integration + flow).
   * @param grid - The grid as a 1D array.
   * @param goals - Array of goal points.
   * @param config - Flow field configuration.
   * @param options - Generation options.
   * @returns Complete flow field result.
   * @example
   */
  static generateFlowField(
    grid: CellType[],
    goals: Point[],
    config: FlowFieldConfig,
    options: FlowFieldOptions = {
      returnIntegrationField: true,
      returnFlowField: true,
      normalizeFlowVectors: true,
      useEarlyTermination: true,
      maxIterations: config.width * config.height,
      useGoalBounding: false,
      useMultiGoal: false,
    }
  ): { integrationField: IntegrationCell[]; flowField: FlowCell[] } {
    // Generate integration field
    const integrationField = this.generateIntegrationField(grid, goals, config, options);

    // Generate flow field
    const flowField = this.generateFlowFieldFromIntegration(integrationField, grid, config, options);

    return { integrationField, flowField };
  }

  /**
   * Generates a multi-goal flow field by composing multiple single-goal fields.
   * @param grid - The grid as a 1D array.
   * @param goalGroups - Array of goal groups.
   * @param config - Flow field configuration.
   * @param options - Generation options.
   * @returns Composed flow field result.
   * @example
   */
  static generateMultiGoalFlowField(
    grid: CellType[],
    goalGroups: Point[][],
    config: FlowFieldConfig,
    options: FlowFieldOptions = {
      returnIntegrationField: true,
      returnFlowField: true,
      normalizeFlowVectors: true,
      useEarlyTermination: true,
      maxIterations: config.width * config.height,
      useGoalBounding: false,
      useMultiGoal: true,
    }
  ): { integrationField: IntegrationCell[]; flowField: FlowCell[] } {
    const integrationFields: IntegrationCell[][] = [];
    const flowFields: FlowCell[][] = [];

    // Generate flow field for each goal group
    for (const goals of goalGroups) {
      const result = this.generateFlowField(grid, goals, config, options);
      integrationFields.push(result.integrationField);
      flowFields.push(result.flowField);
    }

    // Compose the fields
    const composedIntegrationField = this.composeIntegrationFields(integrationFields, config);
    const composedFlowField = this.composeFlowFields(flowFields, config);

    return {
      integrationField: composedIntegrationField,
      flowField: composedFlowField,
    };
  }

  /**
   * Composes multiple integration fields into one.
   * @param integrationFields - Array of integration fields.
   * @param config - Flow field configuration.
   * @returns Composed integration field.
   * @example
   */
  private static composeIntegrationFields(
    integrationFields: IntegrationCell[][],
    config: FlowFieldConfig
  ): IntegrationCell[] {
    const composed: IntegrationCell[] = [];

    for (let i = 0; i < config.width * config.height; i++) {
      let minCost = config.maxCost;

      for (const field of integrationFields) {
        if (field[i].cost < minCost) {
          minCost = field[i].cost;
        }
      }

      composed.push({
        x: integrationFields[0][i].x,
        y: integrationFields[0][i].y,
        cost: minCost,
        processed: true,
      });
    }

    return composed;
  }

  /**
   * Composes multiple flow fields into one.
   * @param flowFields - Array of flow fields.
   * @param config - Flow field configuration.
   * @returns Composed flow field.
   * @example
   */
  private static composeFlowFields(flowFields: FlowCell[][], config: FlowFieldConfig): FlowCell[] {
    const composed: FlowCell[] = [];

    for (let i = 0; i < config.width * config.height; i++) {
      let bestVector: Vector = { x: 0, y: 0 };
      let bestMagnitude = 0;
      let valid = false;

      for (const field of flowFields) {
        if (field[i].valid && field[i].magnitude > bestMagnitude) {
          bestVector = field[i].vector;
          bestMagnitude = field[i].magnitude;
          valid = true;
        }
      }

      composed.push({
        x: flowFields[0][i].x,
        y: flowFields[0][i].y,
        vector: bestVector,
        magnitude: bestMagnitude,
        valid,
      });
    }

    return composed;
  }

  /**
   * Gets neighbors of a point.
   * @param point - Current point.
   * @param grid - The grid.
   * @param config - Flow field configuration.
   * @returns Array of neighbor points.
   * @example
   */
  private static getNeighbors(point: Point, grid: CellType[], config: FlowFieldConfig): Point[] {
    const neighbors: Point[] = [];
    const directions = this.getValidDirections(config);

    for (const direction of directions) {
      const neighbor = this.getNeighborInDirection(point, direction);

      if (
        this.isWithinBounds(neighbor, config.width, config.height) &&
        this.isWalkable(grid, neighbor, config.width, config.height)
      ) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  /**
   * Gets valid directions based on configuration.
   * @param config - Flow field configuration.
   * @returns Array of valid directions.
   * @example
   */
  private static getValidDirections(config: FlowFieldConfig): number[] {
    const directions: number[] = [];

    // Always include cardinal directions
    directions.push(0, 1, 2, 3); // North, East, South, West

    if (config.allowDiagonal) {
      directions.push(4, 5, 6, 7); // Northeast, Southeast, Southwest, Northwest
    }

    return directions;
  }

  /**
   * Gets a neighbor in a specific direction.
   * @param point - Current point.
   * @param direction - Direction to move.
   * @returns Neighbor point.
   * @example
   */
  private static getNeighborInDirection(point: Point, direction: number): Point {
    const directionVectors: Vector[] = [
      { x: 0, y: -1 }, // North
      { x: 1, y: 0 }, // East
      { x: 0, y: 1 }, // South
      { x: -1, y: 0 }, // West
      { x: 1, y: -1 }, // Northeast
      { x: 1, y: 1 }, // Southeast
      { x: -1, y: 1 }, // Southwest
      { x: -1, y: -1 }, // Northwest
    ];

    const vector = directionVectors[direction];
    return { x: point.x + vector.x, y: point.y + vector.y };
  }

  /**
   * Calculates the movement cost between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param config - Flow field configuration.
   * @returns Movement cost.
   * @example
   */
  private static getMovementCost(from: Point, to: Point, config: FlowFieldConfig): number {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    if (dx === 1 && dy === 1) {
      return config.diagonalCost;
    } else if (dx === 1 || dy === 1) {
      return config.cardinalCost;
    } else {
      // Any-angle movement
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance * config.cardinalCost;
    }
  }

  /**
   * Checks if a point is within grid bounds.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is within bounds.
   * @example
   */
  private static isWithinBounds(point: Point, width: number, height: number): boolean {
    return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
  }

  /**
   * Checks if a cell is walkable.
   * @param grid - The grid.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if cell is walkable.
   * @example
   */
  private static isWalkable(grid: CellType[], point: Point, width: number, height: number): boolean {
    if (!this.isWithinBounds(point, width, height)) {
      return false;
    }

    const index = point.y * width + point.x;
    return grid[index] === CellType.WALKABLE || grid[index] === CellType.GOAL || grid[index] === CellType.AGENT;
  }

  /**
   * Creates a key for a point (for use in maps/sets).
   * @param point - Point to create key for.
   * @returns String key.
   * @example
   */
  private static pointToKey(point: Point): string {
    return `${point.x},${point.y}`;
  }
}
