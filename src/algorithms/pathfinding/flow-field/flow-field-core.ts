/**
 * Flow Field Core Implementation
 *
 * Main FlowField class that orchestrates flow field generation
 * using modular components for generation, pathfinding, validation, caching, and comparison.
 *
 * @module algorithms/pathfinding/flow-field
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
import { generateIntegrationField, generateFlowField } from "./flow-field-generation";
import { findAgentPath, simulateCrowd } from "./flow-field-pathfinding";
import { validateInput, validateFlowField } from "./flow-field-validation";
import { FlowFieldCache, generateCacheKey } from "./flow-field-cache";
import { compareFlowFields, compareFlowFieldResults } from "./flow-field-comparison";
import { FlowFieldGenerator } from "./flow-field-generator";

/**
 * The FlowField class provides functionality for crowd pathfinding using flow fields.
 * Flow fields are particularly efficient for scenarios where many agents need to
 * navigate to the same goal(s), as they precompute the optimal direction for each
 * cell in the grid, allowing agents to find paths with O(1) lookups.
 */
export class FlowField {
  private config: FlowFieldConfig;
  private stats: FlowFieldStats;
  private cache: FlowFieldCache;
  private integrationField: IntegrationCell[] = [];
  private flowField: FlowCell[] = [];

  /**
   *
   * @param config
   * @example
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

    this.cache = new FlowFieldCache();
  }

  /**
   * Generates a flow field for the given grid and goals.
   * @param grid
   * @param width
   * @param height
   * @param goals
   * @param options
   * @example
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
        const validation = validateInput(grid, width, height, goals);
        if (!validation.isValid) {
          throw new Error(`Invalid input: ${validation.errors.join(", ")}`);
        }
      }

      // Check cache
      if (this.config.enableCaching) {
        const cacheKey = generateCacheKey(grid, width, height, goals, flowOptions, this.config);
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Reset statistics
      this.resetStats();

      // Count cell types
      this.countCellTypes(grid);

      // Generate integration field
      this.integrationField = generateIntegrationField(grid, width, height, goals, this.config, this.stats);

      // Generate flow field
      this.flowField = generateFlowField(this.integrationField, grid, width, height, this.config, flowOptions);

      // Calculate statistics
      this.calculateStats();

      const executionTime = performance.now() - startTime;
      this.stats.executionTime = executionTime;

      const result: FlowFieldResult = {
        success: true,
        flowField: flowOptions.returnFlowField ? this.flowField : [],
        integrationField: flowOptions.returnIntegrationField ? this.integrationField : [],
        width,
        height,
        goals,
        stats: this.stats,
        executionTime,
      };

      // Cache result
      if (this.config.enableCaching) {
        const cacheKey = generateCacheKey(grid, width, height, goals, flowOptions, this.config);
        this.cache.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      const errorStats = {
        ...this.stats,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
      return {
        success: false,
        flowField: [],
        integrationField: [],
        width,
        height,
        goals,
        stats: errorStats,
        executionTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Find agent path using flow field.
   * @param start
   * @param flowField
   * @param width
   * @param height
   * @param options
   * @example
   */
  findAgentPath(
    start: Point,
    flowField: FlowCell[],
    width: number,
    height: number,
    options: Partial<AgentPathfindingOptions> = {}
  ): AgentPathfindingResult {
    return findAgentPath(start, flowField, width, height, options);
  }

  /**
   * Simulate crowd movement using flow field.
   * @param agents
   * @param flowField
   * @param width
   * @param height
   * @param options
   * @example
   */
  simulateCrowd(
    agents: Point[],
    flowField: FlowCell[],
    width: number,
    height: number,
    options: Partial<CrowdSimulationOptions> = {}
  ): CrowdSimulationResult {
    return simulateCrowd(agents, flowField, width, height, options);
  }

  /**
   * Validate flow field structure and content.
   * @param flowField
   * @param width
   * @param height
   * @param options
   * @example
   */
  validateFlowField(
    flowField: FlowCell[],
    width: number,
    height: number,
    options: Partial<FlowFieldValidationOptions> = {}
  ): FlowFieldValidationResult {
    return validateFlowField(flowField, width, height, options);
  }

  /**
   * Compare two flow fields.
   * @param flowField1
   * @param flowField2
   * @param width
   * @param height
   * @param options
   * @example
   */
  compareFlowFields(
    flowField1: FlowCell[],
    flowField2: FlowCell[],
    width: number,
    height: number,
    options: Partial<FlowFieldComparisonOptions> = {}
  ): FlowFieldComparisonResult {
    return compareFlowFields(flowField1, flowField2, width, height, options);
  }

  /**
   * Compare two flow field results.
   * @param result1
   * @param result2
   * @param options
   * @example
   */
  compareFlowFieldResults(
    result1: FlowFieldResult,
    result2: FlowFieldResult,
    options: Partial<FlowFieldComparisonOptions> = {}
  ): FlowFieldComparisonResult {
    return compareFlowFieldResults(result1, result2, options);
  }

  /**
   * Serialize flow field result.
   * @param result
   * @param options
   * @example
   */
  serialize(result: FlowFieldResult, options: Partial<FlowFieldSerializationOptions> = {}): FlowFieldSerialization {
    const serializationOptions: FlowFieldSerializationOptions = {
      includeStats: true,
      includeIntegrationField: true,
      compress: false,
      ...options,
    };

    return {
      version: "1.0",
      dimensions: {
        width: result.width || 0,
        height: result.height || 0,
      },
      width: result.width,
      height: result.height,
      success: result.success,
      stats: serializationOptions.includeStats ? result.stats : undefined,
      integrationField: serializationOptions.includeIntegrationField ? result.integrationField : undefined,
      flowField: serializationOptions.includeFlowField ? result.flowField : undefined,
      grid: serializationOptions.includeGrid ? { cells: [] } : undefined,
      goals: result.goals,
    };
  }

  /**
   * Update configuration.
   * @param newConfig
   * @example
   */
  updateConfig(newConfig: Partial<FlowFieldConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration.
   * @example
   */
  getConfig(): FlowFieldConfig {
    return { ...this.config };
  }

  /**
   * Get current statistics.
   * @example
   */
  getStats(): FlowFieldStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics.
   * @example
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
   * Clear cache.
   * @example
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics.
   * @example
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Count cell types in grid.
   * @param grid
   * @example
   */
  private countCellTypes(grid: CellType[]): void {
    this.stats.obstacleCells = grid.filter(cell => cell === CellType.OBSTACLE).length;
    this.stats.walkableCells = grid.filter(cell => cell === CellType.WALKABLE).length;
  }

  /**
   * Calculate statistics from integration field.
   * @example
   */
  private calculateStats(): void {
    const costs = this.integrationField.filter(cell => cell.cost < this.config.maxCost).map(cell => cell.cost);

    if (costs.length > 0) {
      this.stats.maxIntegrationCost = Math.max(...costs);
      this.stats.minIntegrationCost = Math.min(...costs);
      this.stats.averageIntegrationCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
    }
  }
}
