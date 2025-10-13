/**
 * @module algorithms/pathfinding/flow-field/flow-field-core
 * @description Main implementation of Flow Field pathfinding algorithm.
 */

import {
  Point,
  CellType,
  IntegrationCell,
  FlowCell,
  FlowFieldConfig,
  FlowFieldStats,
  FlowFieldResult,
  FlowFieldOptions,
  AgentPathfindingOptions,
  AgentPathfindingResult,
  FlowFieldValidationOptions,
  FlowFieldValidationResult,
  FlowFieldSerializationOptions,
  FlowFieldSerialization,
  FlowFieldComparisonOptions,
  FlowFieldComparisonResult,
  CrowdSimulationOptions,
  CrowdSimulationResult,
} from "./flow-field-types";
import { FlowFieldGenerator } from "./flow-field-generator";

/**
 * The FlowField class provides functionality for crowd pathfinding using flow fields.
 * Flow fields are particularly efficient for scenarios where many agents need to
 * navigate to the same goal(s), as they precompute the optimal direction for each
 * cell in the grid, allowing agents to find paths with O(1) lookups.
 *
 * @example
 * ```typescript
 * const flowField = new FlowField();
 * const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.3);
 * const goals = [{ x: 99, y: 99 }];
 * const result = flowField.generateFlowField(grid, 100, 100, goals);
 * 
 * // Use flow field for agent pathfinding
 * const agentStart = { x: 0, y: 0 };
 * const agentPath = flowField.findAgentPath(agentStart, result.flowField, 100, 100);
 * console.log(agentPath.path); // Optimal path using flow field
 * ```
 */
export class FlowField {
  private config: FlowFieldConfig;
  private stats: FlowFieldStats;
  private cache: Map<string, FlowFieldResult> = new Map();
  private integrationField: IntegrationCell[] = [];
  private flowField: FlowCell[] = [];

  /**
   * Creates an instance of FlowField.
   * @param config - Optional configuration for the algorithm.
   */
  constructor(config: Partial<FlowFieldConfig> = {}) {
    this.config = {
      width: 100,
      height: 100,
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      cardinalCost: 1,
      diagonalCost: Math.sqrt(2),
      maxCost: 10000,
      useManhattanDistance: false,
      useEuclideanDistance: true,
      validateInput: true,
      enableCaching: true,
      tolerance: 1e-10,
      ...config,
    };

    this.stats = {
      cellsProcessed: 0,
      goalCells: 0,
      obstacleCells: 0,
      walkableCells: 0,
      maxIntegrationCost: 0,
      minIntegrationCost: 0,
      averageIntegrationCost: 0,
      executionTime: 0,
      success: true,
    };
  }

  /**
   * Generates a flow field for the given grid and goals.
   * @param grid - The grid as a 1D array.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param goals - Array of goal points.
   * @param options - Generation options.
   * @returns Flow field result.
   */
  generateFlowField(
    grid: CellType[],
    width: number,
    height: number,
    goals: Point[],
    options: Partial<FlowFieldOptions> = {}
  ): FlowFieldResult {
    const startTime = performance.now();
    const flowOptions: FlowFieldOptions = {
      returnIntegrationField: true,
      returnFlowField: true,
      normalizeFlowVectors: true,
      useEarlyTermination: true,
      maxIterations: width * height,
      useGoalBounding: false,
      useMultiGoal: false,
      ...options,
    };

    try {
      // Update configuration
      this.config = { ...this.config, width, height };

      // Validate input
      if (this.config.validateInput) {
        const validation = this.validateInput(grid, width, height, goals);
        if (!validation.isValid) {
          throw new Error(`Invalid input: ${validation.errors.join(", ")}`);
        }
      }

      // Check cache
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, goals, flowOptions);
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Reset statistics
      this.resetStats();

      // Count cell types
      this.countCellTypes(grid);

      // Generate flow field
      const result = FlowFieldGenerator.generateFlowField(grid, goals, this.config, flowOptions);
      
      this.integrationField = result.integrationField;
      this.flowField = result.flowField;

      // Calculate statistics
      this.calculateStats();

      const executionTime = performance.now() - startTime;
      this.stats.executionTime = executionTime;
      this.stats.success = true;

      const flowFieldResult: FlowFieldResult = {
        integrationField: this.integrationField,
        flowField: this.flowField,
        success: true,
        stats: this.getStats(),
      };

      // Cache result
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, goals, flowOptions);
        this.cache.set(cacheKey, flowFieldResult);
      }

      return flowFieldResult;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        integrationField: [],
        flowField: [],
        success: false,
        stats: {
          cellsProcessed: this.stats.cellsProcessed,
          goalCells: this.stats.goalCells,
          obstacleCells: this.stats.obstacleCells,
          walkableCells: this.stats.walkableCells,
          maxIntegrationCost: 0,
          minIntegrationCost: 0,
          averageIntegrationCost: 0,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Finds a path for an agent using the flow field.
   * @param start - Starting point.
   * @param flowField - The flow field.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Agent pathfinding options.
   * @returns Agent pathfinding result.
   */
  findAgentPath(
    start: Point,
    flowField: FlowCell[],
    width: number,
    height: number,
    options: Partial<AgentPathfindingOptions> = {}
  ): AgentPathfindingResult {
    const startTime = performance.now();
    const agentOptions: AgentPathfindingOptions = {
      useFlowField: true,
      useIntegrationField: false,
      useAStarFallback: true,
      maxPathLength: width * height,
      smoothPath: false,
      smoothingFactor: 0.5,
      useEarlyTermination: true,
      ...options,
    };

    try {
      const path: Point[] = [start];
      let current = start;
      let flowFieldLookups = 0;
      let integrationFieldLookups = 0;
      let aStarNodes = 0;
      let usedFlowField = false;
      let usedAStarFallback = false;

      // Follow flow field
      if (agentOptions.useFlowField) {
        usedFlowField = true;
        
        while (path.length < agentOptions.maxPathLength) {
          const currentIndex = current.y * width + current.x;
          const flowCell = flowField[currentIndex];
          flowFieldLookups++;

          if (!flowCell.valid || flowCell.magnitude === 0) {
            // No valid flow direction, try A* fallback
            if (agentOptions.useAStarFallback) {
              usedAStarFallback = true;
              const aStarPath = this.findAStarPath(current, flowField, width, height);
              if (aStarPath.length > 0) {
                path.push(...aStarPath.slice(1));
                aStarNodes = aStarPath.length;
              }
            }
            break;
          }

          // Move in flow direction
          const next: Point = {
            x: Math.round(current.x + flowCell.vector.x),
            y: Math.round(current.y + flowCell.vector.y),
          };

          // Check if we've reached a goal or hit an obstacle
          if (this.isGoal(next, flowField, width, height) || 
              this.isObstacle(next, flowField, width, height)) {
            break;
          }

          // Check for loops
          if (path.some(p => this.pointsEqual(p, next, this.config.tolerance))) {
            break;
          }

          path.push(next);
          current = next;

          // Early termination
          if (agentOptions.useEarlyTermination && path.length > 100) {
            break;
          }
        }
      }

      const executionTime = performance.now() - startTime;
      const cost = this.calculatePathCost(path);
      const found = path.length > 1;

      return {
        path,
        found,
        cost,
        length: path.length,
        usedFlowField,
        usedAStarFallback,
        stats: {
          flowFieldLookups,
          integrationFieldLookups,
          aStarNodes,
          executionTime,
        },
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        path: [start],
        found: false,
        cost: 0,
        length: 1,
        usedFlowField: false,
        usedAStarFallback: false,
        stats: {
          flowFieldLookups: 0,
          integrationFieldLookups: 0,
          aStarNodes: 0,
          executionTime,
        },
      };
    }
  }

  /**
   * Simulates crowd movement using flow fields.
   * @param agents - Array of agent starting positions.
   * @param flowField - The flow field.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Crowd simulation options.
   * @returns Crowd simulation result.
   */
  simulateCrowd(
    agents: Point[],
    flowField: FlowCell[],
    width: number,
    height: number,
    options: Partial<CrowdSimulationOptions> = {}
  ): CrowdSimulationResult {
    const startTime = performance.now();
    const crowdOptions: CrowdSimulationOptions = {
      agentCount: agents.length,
      useFlowFieldForAll: true,
      useAStarForSome: false,
      aStarPercentage: 0,
      useCollisionAvoidance: false,
      collisionAvoidanceRadius: 2,
      useFlockingBehavior: false,
      flockingParameters: {
        separationWeight: 1.0,
        alignmentWeight: 1.0,
        cohesionWeight: 1.0,
      },
      ...options,
    };

    try {
      const agentPaths: Point[][] = [];
      let agentsReachedGoal = 0;
      let agentsStuck = 0;
      let totalPathLength = 0;
      let collisionCount = 0;

      // Simulate each agent
      for (let i = 0; i < Math.min(agents.length, crowdOptions.agentCount); i++) {
        const agentStart = agents[i];
        const agentPath = this.findAgentPath(agentStart, flowField, width, height);
        
        agentPaths.push(agentPath.path);
        totalPathLength += agentPath.length;

        if (agentPath.found) {
          agentsReachedGoal++;
        } else {
          agentsStuck++;
        }

        // Simple collision detection
        if (crowdOptions.useCollisionAvoidance) {
          for (let j = 0; j < i; j++) {
            if (this.checkCollision(agentPath.path, agentPaths[j], crowdOptions.collisionAvoidanceRadius)) {
              collisionCount++;
            }
          }
        }
      }

      const executionTime = performance.now() - startTime;
      const averagePathLength = agentPaths.length > 0 ? totalPathLength / agentPaths.length : 0;

      return {
        agentPaths,
        success: true,
        stats: {
          agentsReachedGoal,
          agentsStuck,
          averagePathLength,
          averageExecutionTime: executionTime / agentPaths.length,
          totalExecutionTime: executionTime,
          collisionCount,
        },
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        agentPaths: [],
        success: false,
        stats: {
          agentsReachedGoal: 0,
          agentsStuck: 0,
          averagePathLength: 0,
          averageExecutionTime: 0,
          totalExecutionTime: executionTime,
          collisionCount: 0,
        },
      };
    }
  }

  /**
   * Validates a flow field.
   * @param flowField - The flow field to validate.
   * @param integrationField - The integration field to validate.
   * @param options - Validation options.
   * @returns Validation result.
   */
  validateFlowField(
    flowField: FlowCell[],
    integrationField: IntegrationCell[],
    options: Partial<FlowFieldValidationOptions> = {}
  ): FlowFieldValidationResult {
    const validationOptions: FlowFieldValidationOptions = {
      checkFlowFieldValidity: true,
      checkIntegrationFieldValidity: true,
      checkUnreachableAreas: true,
      checkInvalidFlowVectors: true,
      maxFlowVectorMagnitude: 2.0,
      minFlowVectorMagnitude: 0.0,
      checkCircularFlows: true,
      ...options,
    };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check flow field validity
    if (validationOptions.checkFlowFieldValidity) {
      for (const cell of flowField) {
        if (!cell.valid && cell.magnitude > 0) {
          errors.push(`Invalid flow cell at (${cell.x}, ${cell.y}) with magnitude ${cell.magnitude}`);
        }
      }
    }

    // Check integration field validity
    if (validationOptions.checkIntegrationFieldValidity) {
      for (const cell of integrationField) {
        if (cell.cost < 0) {
          errors.push(`Negative integration cost at (${cell.x}, ${cell.y}): ${cell.cost}`);
        }
        if (cell.cost > this.config.maxCost) {
          warnings.push(`High integration cost at (${cell.x}, ${cell.y}): ${cell.cost}`);
        }
      }
    }

    // Check for unreachable areas
    if (validationOptions.checkUnreachableAreas) {
      const unreachableCount = integrationField.filter(cell => cell.cost >= this.config.maxCost).length;
      if (unreachableCount > 0) {
        warnings.push(`${unreachableCount} unreachable cells found`);
      }
    }

    // Check for invalid flow vectors
    if (validationOptions.checkInvalidFlowVectors) {
      for (const cell of flowField) {
        if (cell.valid) {
          if (cell.magnitude > validationOptions.maxFlowVectorMagnitude) {
            errors.push(`Flow vector magnitude too high at (${cell.x}, ${cell.y}): ${cell.magnitude}`);
          }
          if (cell.magnitude < validationOptions.minFlowVectorMagnitude) {
            warnings.push(`Flow vector magnitude too low at (${cell.x}, ${cell.y}): ${cell.magnitude}`);
          }
        }
      }
    }

    // Check for circular flows
    if (validationOptions.checkCircularFlows) {
      const circularFlows = this.detectCircularFlows(flowField);
      if (circularFlows.length > 0) {
        warnings.push(`${circularFlows.length} circular flows detected`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasValidFlowField: !errors.some(e => e.includes("flow cell") || e.includes("flow vector")),
      hasValidIntegrationField: !errors.some(e => e.includes("integration cost")),
      hasUnreachableAreas: warnings.some(w => w.includes("unreachable")),
      hasInvalidFlowVectors: errors.some(e => e.includes("flow vector")),
      hasCircularFlows: warnings.some(w => w.includes("circular flows")),
    };
  }

  /**
   * Compares two flow fields.
   * @param flowField1 - First flow field.
   * @param flowField2 - Second flow field.
   * @param options - Comparison options.
   * @returns Comparison result.
   */
  compareFlowFields(
    flowField1: FlowFieldResult,
    flowField2: FlowFieldResult,
    options: Partial<FlowFieldComparisonOptions> = {}
  ): FlowFieldComparisonResult {
    const comparisonOptions: FlowFieldComparisonOptions = {
      compareIntegrationFields: true,
      compareFlowFields: true,
      compareStats: true,
      tolerance: this.config.tolerance,
      compareExecutionTimes: true,
      compareMemoryUsage: false,
      ...options,
    };

    const differences: string[] = [];
    let integrationFieldSimilarity = 1.0;
    let flowFieldSimilarity = 1.0;
    let overallSimilarity = 1.0;

    // Compare integration fields
    if (comparisonOptions.compareIntegrationFields) {
      const integrationSimilarity = this.compareIntegrationFields(
        flowField1.integrationField,
        flowField2.integrationField,
        comparisonOptions.tolerance!
      );
      integrationFieldSimilarity = integrationSimilarity.similarity;
      
      if (integrationSimilarity.differences.length > 0) {
        differences.push(...integrationSimilarity.differences);
      }
    }

    // Compare flow fields
    if (comparisonOptions.compareFlowFields) {
      const flowSimilarity = this.compareFlowFieldArrays(
        flowField1.flowField,
        flowField2.flowField,
        comparisonOptions.tolerance!
      );
      flowFieldSimilarity = flowSimilarity.similarity;
      
      if (flowSimilarity.differences.length > 0) {
        differences.push(...flowSimilarity.differences);
      }
    }

    // Compare statistics
    if (comparisonOptions.compareStats) {
      const statsSimilarity = this.compareStats(flowField1.stats, flowField2.stats);
      if (statsSimilarity.differences.length > 0) {
        differences.push(...statsSimilarity.differences);
      }
    }

    // Calculate overall similarity
    overallSimilarity = (integrationFieldSimilarity + flowFieldSimilarity) / 2;

    // Compare execution times
    const executionTimeDifference = Math.abs(flowField1.stats.executionTime - flowField2.stats.executionTime);

    return {
      areEquivalent: differences.length === 0,
      integrationFieldSimilarity,
      flowFieldSimilarity,
      overallSimilarity,
      executionTimeDifference,
      memoryUsageDifference: 0, // Not implemented
      differencesCount: differences.length,
      differences,
    };
  }

  /**
   * Serializes a flow field result to JSON.
   * @param result - Result to serialize.
   * @param options - Serialization options.
   * @returns Serialized result.
   */
  serialize(
    result: FlowFieldResult,
    options: Partial<FlowFieldSerializationOptions> = {}
  ): FlowFieldSerialization {
    const serializationOptions: FlowFieldSerializationOptions = {
      precision: 6,
      includeStats: false,
      includeIntegrationField: false,
      includeFlowField: false,
      includeGrid: false,
      compress: false,
      ...options,
    };

    const round = (value: number) => {
      return Math.round(value * Math.pow(10, serializationOptions.precision!)) / 
             Math.pow(10, serializationOptions.precision!);
    };

    const serialized: FlowFieldSerialization = {
      dimensions: {
        width: this.config.width,
        height: this.config.height,
      },
      success: result.success,
    };

    if (serializationOptions.includeStats) {
      serialized.stats = result.stats;
    }

    if (serializationOptions.includeIntegrationField) {
      serialized.integrationField = result.integrationField.map(cell => ({
        x: cell.x,
        y: cell.y,
        cost: round(cell.cost),
        processed: cell.processed,
      }));
    }

    if (serializationOptions.includeFlowField) {
      serialized.flowField = result.flowField.map(cell => ({
        x: cell.x,
        y: cell.y,
        vector: {
          x: round(cell.vector.x),
          y: round(cell.vector.y),
        },
        magnitude: round(cell.magnitude),
        valid: cell.valid,
      }));
    }

    return serialized;
  }

  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   */
  updateConfig(newConfig: Partial<FlowFieldConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets the current configuration.
   * @returns The current configuration.
   */
  getConfig(): FlowFieldConfig {
    return { ...this.config };
  }

  /**
   * Gets the current statistics.
   * @returns The current statistics.
   */
  getStats(): FlowFieldStats {
    return { ...this.stats };
  }

  /**
   * Resets the statistics.
   */
  resetStats(): void {
    this.stats = {
      cellsProcessed: 0,
      goalCells: 0,
      obstacleCells: 0,
      walkableCells: 0,
      maxIntegrationCost: 0,
      minIntegrationCost: 0,
      averageIntegrationCost: 0,
      executionTime: 0,
      success: true,
    };
  }

  /**
   * Clears the cache.
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Validates input parameters.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param goals - Goal points.
   * @returns Validation result.
   */
  private validateInput(
    grid: CellType[],
    width: number,
    height: number,
    goals: Point[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (grid.length !== width * height) {
      errors.push(`Grid length mismatch: expected ${width * height}, got ${grid.length}`);
    }

    if (goals.length === 0) {
      errors.push("No goals provided");
    }

    for (const goal of goals) {
      if (goal.x < 0 || goal.x >= width || goal.y < 0 || goal.y >= height) {
        errors.push(`Goal out of bounds: (${goal.x}, ${goal.y})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Counts different cell types in the grid.
   * @param grid - The grid.
   */
  private countCellTypes(grid: CellType[]): void {
    this.stats.goalCells = 0;
    this.stats.obstacleCells = 0;
    this.stats.walkableCells = 0;

    for (const cell of grid) {
      switch (cell) {
        case CellType.GOAL:
          this.stats.goalCells++;
          break;
        case CellType.OBSTACLE:
          this.stats.obstacleCells++;
          break;
        case CellType.WALKABLE:
        case CellType.AGENT:
          this.stats.walkableCells++;
          break;
      }
    }
  }

  /**
   * Calculates statistics from the integration field.
   */
  private calculateStats(): void {
    if (this.integrationField.length === 0) return;

    let totalCost = 0;
    let validCells = 0;
    this.stats.maxIntegrationCost = 0;
    this.stats.minIntegrationCost = this.config.maxCost;

    for (const cell of this.integrationField) {
      if (cell.cost < this.config.maxCost) {
        totalCost += cell.cost;
        validCells++;
        this.stats.maxIntegrationCost = Math.max(this.stats.maxIntegrationCost, cell.cost);
        this.stats.minIntegrationCost = Math.min(this.stats.minIntegrationCost, cell.cost);
      }
    }

    this.stats.averageIntegrationCost = validCells > 0 ? totalCost / validCells : 0;
    this.stats.cellsProcessed = validCells;
  }

  /**
   * Generates a cache key for the given parameters.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param goals - Goal points.
   * @param options - Generation options.
   * @returns Cache key.
   */
  private getCacheKey(
    grid: CellType[],
    width: number,
    height: number,
    goals: Point[],
    options: FlowFieldOptions
  ): string {
    const gridHash = grid.slice(0, Math.min(100, grid.length)).join(',');
    const goalsHash = goals.map(g => `${g.x},${g.y}`).join('|');
    const optionsHash = JSON.stringify(options);
    return `flow-${width}x${height}_${goalsHash}_${gridHash}_${optionsHash}`;
  }

  /**
   * Finds a path using A* as fallback.
   * @param start - Starting point.
   * @param flowField - The flow field.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns A* path.
   */
  private findAStarPath(start: Point, flowField: FlowCell[], width: number, height: number): Point[] {
    // Simple A* implementation for fallback
    const visited = new Set<string>();
    const queue: Array<{ point: Point; cost: number; path: Point[] }> = [
      { point: start, cost: 0, path: [start] }
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentKey = this.pointToKey(current.point);

      if (visited.has(currentKey)) continue;
      visited.add(currentKey);

      if (this.isGoal(current.point, flowField, width, height)) {
        return current.path;
      }

      // Get neighbors
      const neighbors = this.getNeighbors(current.point, width, height);
      for (const neighbor of neighbors) {
        const neighborKey = this.pointToKey(neighbor);
        if (visited.has(neighborKey)) continue;

        const newPath = [...current.path, neighbor];
        const newCost = current.cost + 1;

        queue.push({ point: neighbor, cost: newCost, path: newPath });
      }

      // Sort by cost
      queue.sort((a, b) => a.cost - b.cost);
    }

    return [];
  }

  /**
   * Checks if a point is a goal.
   * @param point - Point to check.
   * @param flowField - The flow field.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is a goal.
   */
  private isGoal(point: Point, flowField: FlowCell[], width: number, height: number): boolean {
    if (!this.isWithinBounds(point, width, height)) return false;
    
    const index = point.y * width + point.x;
    const cell = flowField[index];
    return cell.magnitude === 0; // Goals have zero magnitude
  }

  /**
   * Checks if a point is an obstacle.
   * @param point - Point to check.
   * @param flowField - The flow field.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is an obstacle.
   */
  private isObstacle(point: Point, flowField: FlowCell[], width: number, height: number): boolean {
    if (!this.isWithinBounds(point, width, height)) return true;
    
    const index = point.y * width + point.x;
    const cell = flowField[index];
    return !cell.valid; // Obstacles have invalid flow
  }

  /**
   * Calculates the cost of a path.
   * @param path - Path to calculate cost for.
   * @returns Path cost.
   */
  private calculatePathCost(path: Point[]): number {
    let cost = 0;
    for (let i = 1; i < path.length; i++) {
      const from = path[i - 1];
      const to = path[i];
      const dx = Math.abs(to.x - from.x);
      const dy = Math.abs(to.y - from.y);
      
      if (dx === 1 && dy === 1) {
        cost += this.config.diagonalCost;
      } else if (dx === 1 || dy === 1) {
        cost += this.config.cardinalCost;
      } else {
        cost += Math.sqrt(dx * dx + dy * dy) * this.config.cardinalCost;
      }
    }
    return cost;
  }

  /**
   * Detects circular flows in the flow field.
   * @param flowField - The flow field.
   * @returns Array of circular flow points.
   */
  private detectCircularFlows(flowField: FlowCell[]): Point[] {
    const circularFlows: Point[] = [];
    const visited = new Set<string>();

    for (const cell of flowField) {
      if (!cell.valid || cell.magnitude === 0) continue;

      const startKey = this.pointToKey(cell);
      if (visited.has(startKey)) continue;

      const path: Point[] = [];
      let current = { x: cell.x, y: cell.y };
      const currentVisited = new Set<string>();

      while (true) {
        const currentKey = this.pointToKey(current);
        
        if (currentVisited.has(currentKey)) {
          // Found a cycle
          const cycleStart = path.indexOf(current);
          if (cycleStart >= 0) {
            circularFlows.push(...path.slice(cycleStart));
          }
          break;
        }

        if (visited.has(currentKey)) break;

        currentVisited.add(currentKey);
        visited.add(currentKey);
        path.push(current);

        const currentIndex = current.y * this.config.width + current.x;
        const flowCell = flowField[currentIndex];

        if (!flowCell.valid || flowCell.magnitude === 0) break;

        current = {
          x: Math.round(current.x + flowCell.vector.x),
          y: Math.round(current.y + flowCell.vector.y),
        };

        if (!this.isWithinBounds(current, this.config.width, this.config.height)) break;
      }
    }

    return circularFlows;
  }

  /**
   * Compares two integration fields.
   * @param field1 - First integration field.
   * @param field2 - Second integration field.
   * @param tolerance - Comparison tolerance.
   * @returns Comparison result.
   */
  private compareIntegrationFields(
    field1: IntegrationCell[],
    field2: IntegrationCell[],
    tolerance: number
  ): { similarity: number; differences: string[] } {
    const differences: string[] = [];
    let totalCells = 0;
    let matchingCells = 0;

    for (let i = 0; i < Math.min(field1.length, field2.length); i++) {
      totalCells++;
      const cell1 = field1[i];
      const cell2 = field2[i];

      if (Math.abs(cell1.cost - cell2.cost) > tolerance) {
        differences.push(`Integration cost difference at (${cell1.x}, ${cell1.y}): ${cell1.cost} vs ${cell2.cost}`);
      } else {
        matchingCells++;
      }
    }

    const similarity = totalCells > 0 ? matchingCells / totalCells : 1.0;
    return { similarity, differences };
  }

  /**
   * Compares two flow field arrays.
   * @param field1 - First flow field.
   * @param field2 - Second flow field.
   * @param tolerance - Comparison tolerance.
   * @returns Comparison result.
   */
  private compareFlowFieldArrays(
    field1: FlowCell[],
    field2: FlowCell[],
    tolerance: number
  ): { similarity: number; differences: string[] } {
    const differences: string[] = [];
    let totalCells = 0;
    let matchingCells = 0;

    for (let i = 0; i < Math.min(field1.length, field2.length); i++) {
      totalCells++;
      const cell1 = field1[i];
      const cell2 = field2[i];

      if (cell1.valid !== cell2.valid) {
        differences.push(`Flow validity difference at (${cell1.x}, ${cell1.y}): ${cell1.valid} vs ${cell2.valid}`);
      } else if (Math.abs(cell1.magnitude - cell2.magnitude) > tolerance) {
        differences.push(`Flow magnitude difference at (${cell1.x}, ${cell1.y}): ${cell1.magnitude} vs ${cell2.magnitude}`);
      } else if (Math.abs(cell1.vector.x - cell2.vector.x) > tolerance || 
                 Math.abs(cell1.vector.y - cell2.vector.y) > tolerance) {
        differences.push(`Flow vector difference at (${cell1.x}, ${cell1.y}): (${cell1.vector.x}, ${cell1.vector.y}) vs (${cell2.vector.x}, ${cell2.vector.y})`);
      } else {
        matchingCells++;
      }
    }

    const similarity = totalCells > 0 ? matchingCells / totalCells : 1.0;
    return { similarity, differences };
  }

  /**
   * Compares two statistics objects.
   * @param stats1 - First statistics.
   * @param stats2 - Second statistics.
   * @returns Comparison result.
   */
  private compareStats(stats1: FlowFieldStats, stats2: FlowFieldStats): { differences: string[] } {
    const differences: string[] = [];

    if (stats1.cellsProcessed !== stats2.cellsProcessed) {
      differences.push(`Cells processed difference: ${stats1.cellsProcessed} vs ${stats2.cellsProcessed}`);
    }

    if (stats1.goalCells !== stats2.goalCells) {
      differences.push(`Goal cells difference: ${stats1.goalCells} vs ${stats2.goalCells}`);
    }

    if (stats1.obstacleCells !== stats2.obstacleCells) {
      differences.push(`Obstacle cells difference: ${stats1.obstacleCells} vs ${stats2.obstacleCells}`);
    }

    return { differences };
  }

  /**
   * Checks for collision between two paths.
   * @param path1 - First path.
   * @param path2 - Second path.
   * @param radius - Collision radius.
   * @returns True if collision detected.
   */
  private checkCollision(path1: Point[], path2: Point[], radius: number): boolean {
    for (const point1 of path1) {
      for (const point2 of path2) {
        const distance = Math.sqrt(
          Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
        );
        if (distance < radius) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Gets neighbors of a point.
   * @param point - Current point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Array of neighbor points.
   */
  private getNeighbors(point: Point, width: number, height: number): Point[] {
    const neighbors: Point[] = [];
    const directions = [
      { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
      { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }, { x: -1, y: -1 }
    ];

    for (const dir of directions) {
      const neighbor = { x: point.x + dir.x, y: point.y + dir.y };
      if (this.isWithinBounds(neighbor, width, height)) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  /**
   * Checks if a point is within grid bounds.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is within bounds.
   */
  private isWithinBounds(point: Point, width: number, height: number): boolean {
    return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
  }

  /**
   * Creates a key for a point (for use in maps/sets).
   * @param point - Point to create key for.
   * @returns String key.
   */
  private pointToKey(point: Point): string {
    return `${point.x},${point.y}`;
  }

  /**
   * Checks if two points are equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Numerical tolerance.
   * @returns True if points are equal.
   */
  private pointsEqual(a: Point, b: Point, tolerance: number = 1e-10): boolean {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }
}
