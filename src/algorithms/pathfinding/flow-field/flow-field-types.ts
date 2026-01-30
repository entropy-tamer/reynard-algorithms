/**
 * @module algorithms/pathfinding/flow-field/flow-field-types
 * @description Type definitions for Flow Field pathfinding algorithm.
 */

/**
 * A 2D point with x and y coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * A 2D vector with x and y components.
 */
export interface Vector {
  x: number;
  y: number;
}

/**
 * Cell types in the flow field grid.
 */
export enum CellType {
  WALKABLE = 0,
  OBSTACLE = 1,
  GOAL = 2,
  AGENT = 3,
}

/**
 * A grid cell with position and type.
 */
export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  cost?: number;
}

/**
 * Integration cost field cell.
 */
export interface IntegrationCell {
  x: number;
  y: number;
  cost: number;
  processed: boolean;
}

/**
 * Flow vector field cell.
 */
export interface FlowCell {
  x: number;
  y: number;
  vector: Vector;
  magnitude: number;
  valid: boolean;
}

/**
 * Configuration options for Flow Field generation.
 */
export interface FlowFieldConfig {
  /** Grid width */
  width: number;
  /** Grid height */
  height: number;
  /** Whether to allow diagonal movement */
  allowDiagonal: boolean;
  /** Whether to use diagonal movement only when both cardinal directions are clear */
  diagonalOnlyWhenClear: boolean;
  /** Movement cost for cardinal directions */
  cardinalCost: number;
  /** Movement cost for diagonal directions */
  diagonalCost: number;
  /** Maximum integration cost (for unreachable areas) */
  maxCost: number;
  /** Whether to use Manhattan distance for integration */
  useManhattanDistance: boolean;
  /** Whether to use Euclidean distance for integration */
  useEuclideanDistance: boolean;
  /** Whether to validate input */
  validateInput: boolean;
  /** Whether to enable caching */
  enableCaching: boolean;
  /** Numerical tolerance for floating-point comparisons */
  tolerance: number;
}

/**
 * Statistics about the Flow Field computation.
 */
export interface FlowFieldStats {
  /** Number of cells processed during integration */
  cellsProcessed: number;
  /** Number of goal cells */
  goalCells: number;
  /** Number of obstacle cells */
  obstacleCells: number;
  /** Number of walkable cells */
  walkableCells: number;
  /** Maximum integration cost found */
  maxIntegrationCost: number;
  /** Minimum integration cost found */
  minIntegrationCost: number;
  /** Average integration cost */
  averageIntegrationCost: number;
  /** Total execution time in milliseconds */
  executionTime: number;
  /** Whether the computation was successful */
  success: boolean;
  /** Error message if computation failed */
  error?: string;
}

/**
 * Result of the Flow Field generation.
 */
export interface FlowFieldResult {
  /** The integration cost field */
  integrationField: IntegrationCell[];
  /** The flow vector field */
  flowField: FlowCell[];
  /** Whether the flow field was generated successfully */
  success: boolean;
  /** Statistics about the computation */
  stats: FlowFieldStats;
  /** Total execution time in milliseconds (optional convenience) */
  executionTime?: number;
  /** Error message if failed (optional) */
  error?: string;
  /** Grid width (optional convenience) */
  width?: number;
  /** Grid height (optional convenience) */
  height?: number;
  /** Goal cells (optional convenience) */
  goals?: Point[];
}

/**
 * Options for Flow Field generation.
 */
export interface FlowFieldOptions {
  /** Whether to return integration field */
  returnIntegrationField: boolean;
  /** Whether to return flow field */
  returnFlowField: boolean;
  /** Whether to normalize flow vectors */
  normalizeFlowVectors: boolean;
  /** Whether to use early termination */
  useEarlyTermination: boolean;
  /** Maximum number of iterations */
  maxIterations: number;
  /** Whether to use goal bounding for optimization */
  useGoalBounding: boolean;
  /** Whether to use multi-goal field composition */
  useMultiGoal: boolean;
  /** Custom cost function */
  customCostFunction?: (from: Point, to: Point) => number;
}

/**
 * Options for agent pathfinding using flow field.
 */
export interface AgentPathfindingOptions {
  /** Whether to use flow field for pathfinding */
  useFlowField: boolean;
  /** Whether to use integration field for pathfinding */
  useIntegrationField: boolean;
  /** Whether to use A* as fallback */
  useAStarFallback: boolean;
  /** Optional alias used in some call sites */
  useAStar?: boolean;
  /** Maximum path length */
  maxPathLength: number;
  /** Whether to smooth the path */
  smoothPath: boolean;
  /** Smoothing factor */
  smoothingFactor: number;
  /** Whether to use early termination */
  useEarlyTermination: boolean;
}

/**
 * Result of agent pathfinding using flow field.
 */
export interface AgentPathfindingResult {
  /** The found path as an array of points */
  path: Point[];
  /** Whether a path was found */
  found: boolean;
  /** Total cost of the path */
  cost: number;
  /** Length of the path */
  length: number;
  /** Whether flow field was used */
  usedFlowField: boolean;
  /** Whether A* fallback was used */
  usedAStarFallback: boolean;
  /** Statistics about the pathfinding */
  stats: {
    flowFieldLookups: number;
    integrationFieldLookups: number;
    aStarNodes: number;
    executionTime: number;
  };
}

/**
 * Options for multi-goal flow field composition.
 */
export interface MultiGoalOptions {
  /** Whether to use multi-goal composition */
  useMultiGoal: boolean;
  /** Goal weights for composition */
  goalWeights: number[];
  /** Whether to use weighted average */
  useWeightedAverage: boolean;
  /** Whether to use minimum cost */
  useMinimumCost: boolean;
  /** Whether to use maximum cost */
  useMaximumCost: boolean;
  /** Composition method */
  compositionMethod: "average" | "minimum" | "maximum" | "weighted";
}

/**
 * Result of multi-goal flow field composition.
 */
export interface MultiGoalResult {
  /** The composed integration field */
  composedIntegrationField: IntegrationCell[];
  /** The composed flow field */
  composedFlowField: FlowCell[];
  /** Whether composition was successful */
  success: boolean;
  /** Statistics about the composition */
  stats: {
    goalsProcessed: number;
    compositionTime: number;
    averageCost: number;
    maxCost: number;
    minCost: number;
  };
}

/**
 * Options for dynamic obstacle updates.
 */
export interface DynamicObstacleOptions {
  /** Whether to enable dynamic updates */
  enableDynamicUpdates: boolean;
  /** Whether to use incremental updates */
  useIncrementalUpdates: boolean;
  /** Whether to use full recomputation */
  useFullRecomputation: boolean;
  /** Update radius for incremental updates */
  updateRadius: number;
  /** Whether to use obstacle influence */
  useObstacleInfluence: boolean;
  /** Obstacle influence radius */
  obstacleInfluenceRadius: number;
  /** Obstacle influence strength */
  obstacleInfluenceStrength: number;
}

/**
 * Result of dynamic obstacle update.
 */
export interface DynamicObstacleResult {
  /** The updated integration field */
  updatedIntegrationField: IntegrationCell[];
  /** The updated flow field */
  updatedFlowField: FlowCell[];
  /** Whether update was successful */
  success: boolean;
  /** Statistics about the update */
  stats: {
    cellsUpdated: number;
    updateTime: number;
    obstaclesAdded: number;
    obstaclesRemoved: number;
  };
}

/**
 * Options for flow field validation.
 */
export interface FlowFieldValidationOptions {
  /** Whether to check flow field validity */
  checkFlowFieldValidity?: boolean;
  /** Whether to check integration field validity */
  checkIntegrationFieldValidity?: boolean;
  /** Whether to check for unreachable areas */
  checkUnreachableAreas?: boolean;
  /** Whether to check for invalid flow vectors */
  checkInvalidFlowVectors?: boolean;
  /** Maximum allowed flow vector magnitude */
  maxFlowVectorMagnitude: number;
  /** Minimum allowed flow vector magnitude */
  minFlowVectorMagnitude: number;
  /** Whether to check for circular flows */
  checkCircularFlows?: boolean;
  /** Optional tolerance for magnitude/direction checks */
  tolerance?: number;
  /** Optional magnitude check toggle */
  checkMagnitude?: boolean;
  /** Optional direction check toggle */
  checkDirection?: boolean;
  /** Optional consistency check toggle */
  checkConsistency?: boolean;
}

/**
 * Result of flow field validation.
 */
export interface FlowFieldValidationResult {
  /** Whether the flow field is valid */
  isValid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of validation warnings */
  warnings: string[];
  /** Whether flow field is valid */
  hasValidFlowField: boolean;
  /** Whether integration field is valid */
  hasValidIntegrationField: boolean;
  /** Whether there are unreachable areas */
  hasUnreachableAreas: boolean;
  /** Whether there are invalid flow vectors */
  hasInvalidFlowVectors: boolean;
  /** Whether there are circular flows */
  hasCircularFlows: boolean;
  /** Optional stats bag */
  stats?: Record<string, unknown>;
}

/**
 * Options for flow field serialization.
 */
export interface FlowFieldSerializationOptions {
  /** Number of decimal places for coordinates */
  precision?: number;
  /** Whether to include statistics */
  includeStats: boolean;
  /** Whether to include integration field */
  includeIntegrationField?: boolean;
  /** Whether to include flow field */
  includeFlowField?: boolean;
  /** Whether to include grid data */
  includeGrid?: boolean;
  /** Whether to compress the data */
  compress: boolean;
}

/**
 * Serialized representation of Flow Field result.
 */
export interface FlowFieldSerialization {
  /** Grid dimensions */
  dimensions: {
    width: number;
    height: number;
  };
  /** Optional convenience duplicates for some call sites */
  width?: number;
  height?: number;
  /** Whether generation was successful */
  success: boolean;
  /** Statistics (if included) */
  stats?: FlowFieldStats;
  /** Integration field (if included) */
  integrationField?: IntegrationCell[];
  /** Flow field (if included) */
  flowField?: FlowCell[];
  /** Grid data (if included) */
  grid?: {
    cells: GridCell[];
  };
  /** Optional goals (if included) */
  goals?: Point[];
  /** Optional version tag */
  version?: string;
}

/**
 * Options for flow field comparison.
 */
export interface FlowFieldComparisonOptions {
  /** Whether to compare integration fields */
  compareIntegrationFields: boolean;
  /** Whether to compare flow fields */
  compareFlowFields?: boolean;
  /** Whether to compare statistics */
  compareStats?: boolean;
  /** Tolerance for comparisons */
  tolerance: number;
  /** Whether to compare execution times */
  compareExecutionTimes?: boolean;
  /** Whether to compare memory usage */
  compareMemoryUsage?: boolean;
  /** Optional: compare flow vector directions */
  compareDirections?: boolean;
  /** Optional: compare vector magnitudes */
  compareMagnitudes?: boolean;
  /** Optional: include detailed analysis */
  detailedAnalysis?: boolean;
}

/**
 * Result of flow field comparison.
 */
export interface FlowFieldComparisonResult {
  /** Whether flow fields are equivalent */
  areEquivalent: boolean;
  /** Optional strict identical flag for convenience */
  identical?: boolean;
  /** Optional overall similarity metric (0-1) */
  similarity?: number;
  /** Integration field similarity score (0-1) */
  integrationFieldSimilarity: number;
  /** Flow field similarity score (0-1) */
  flowFieldSimilarity: number;
  /** Overall similarity score (0-1) */
  overallSimilarity: number;
  /** Execution time difference */
  executionTimeDifference: number;
  /** Memory usage difference */
  memoryUsageDifference: number;
  /** Number of differences found */
  differencesCount: number;
  /** List of differences */
  differences: string[];
  /** Optional stats bag */
  stats?: Record<string, unknown>;
}

/**
 * Options for performance analysis.
 */
export interface FlowFieldPerformanceOptions {
  /** Whether to track memory usage */
  trackMemory: boolean;
  /** Whether to track cache hits */
  trackCacheHits: boolean;
  /** Whether to track integration efficiency */
  trackIntegrationEfficiency: boolean;
  /** Whether to generate performance report */
  generateReport: boolean;
  /** Whether to track flow field generation time */
  trackFlowFieldGenerationTime: boolean;
  /** Whether to track agent pathfinding time */
  trackAgentPathfindingTime: boolean;
}

/**
 * Result of performance analysis.
 */
export interface FlowFieldPerformanceResult {
  /** Performance metrics */
  metrics: {
    cellsPerSecond: number;
    memoryUsage: number;
    cacheHitRate: number;
    integrationEfficiency: number;
    flowFieldGenerationTime: number;
    agentPathfindingTime: number;
  };
  /** Performance report */
  report?: {
    bottlenecks: string[];
    recommendations: string[];
    optimizationSuggestions: string[];
  };
}

/**
 * Options for crowd simulation.
 */
export interface CrowdSimulationOptions {
  /** Number of agents to simulate */
  agentCount: number;
  /** Whether to use flow field for all agents */
  useFlowFieldForAll: boolean;
  /** Whether to use A* for some agents */
  useAStarForSome: boolean;
  /** Percentage of agents using A* */
  aStarPercentage: number;
  /** Whether to use collision avoidance */
  useCollisionAvoidance: boolean;
  /** Collision avoidance radius */
  collisionAvoidanceRadius: number;
  /** Whether to use flocking behavior */
  useFlockingBehavior: boolean;
  /** Flocking parameters */
  flockingParameters: {
    separationWeight: number;
    alignmentWeight: number;
    cohesionWeight: number;
  };
}

/**
 * Result of crowd simulation.
 */
export interface CrowdSimulationResult {
  /** Agent paths */
  agentPaths: Point[][];
  /** Whether simulation was successful */
  success: boolean;
  /** Statistics about the simulation */
  stats: {
    agentsReachedGoal: number;
    agentsStuck: number;
    averagePathLength: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
    collisionCount: number;
  };
}
