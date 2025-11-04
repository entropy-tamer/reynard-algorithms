/**
 * @module algorithms/pathfinding/hpa-star/hpa-star-types
 * @description Type definitions for HPA* (Hierarchical Pathfinding A*) algorithm.
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
 * Cell types in the hierarchical grid.
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
 * Cluster types in the hierarchical structure.
 */
export enum ClusterType {
  REGULAR = 0,
  BORDER = 1,
  INTERIOR = 2,
  ENTRANCE = 3,
}

/**
 * A cluster in the hierarchical map.
 */
export interface Cluster {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ClusterType;
  cells: GridCell[];
  entrances: Entrance[];
  neighbors: string[];
}

/**
 * An entrance point between clusters.
 */
export interface Entrance {
  id: string;
  x: number;
  y: number;
  clusterId: string;
  connectedClusters: string[];
  isBorder: boolean;
  cost: number;
}

/**
 * Abstract node in the hierarchical graph.
 */
export interface AbstractNode {
  id: string;
  type: "cluster" | "entrance";
  clusterId?: string;
  entranceId?: string;
  position: Point;
  g: number;
  h: number;
  f: number;
  parent?: string;
  visited: boolean;
  inOpenSet: boolean;
}

/**
 * Abstract edge in the hierarchical graph.
 */
export interface AbstractEdge {
  from: string;
  to: string;
  cost: number;
  path?: Point[];
  isInterCluster: boolean;
  clusterId?: string;
}

/**
 * Hierarchical pathfinding configuration.
 */
export interface HPAConfig {
  /** Grid width */
  width: number;
  /** Grid height */
  height: number;
  /** Cluster size (width and height) */
  clusterSize: number;
  /** Whether to allow diagonal movement */
  allowDiagonal: boolean;
  /** Whether to use diagonal movement only when both cardinal directions are clear */
  diagonalOnlyWhenClear: boolean;
  /** Movement cost for cardinal directions */
  cardinalCost: number;
  /** Movement cost for diagonal directions */
  diagonalCost: number;
  /** Maximum path length */
  maxPathLength: number;
  /** Whether to use path smoothing */
  usePathSmoothing: boolean;
  /** Smoothing factor */
  smoothingFactor: number;
  /** Whether to use early termination */
  useEarlyTermination: boolean;
  /** Whether to validate input */
  validateInput: boolean;
  /** Whether to enable caching */
  enableCaching: boolean;
  /** Numerical tolerance for floating-point comparisons */
  tolerance: number;
}

/**
 * Statistics about the HPA* computation.
 */
export interface HPAStats {
  /** Number of clusters created */
  clustersCreated: number;
  /** Number of entrances found */
  entrancesFound: number;
  /** Number of abstract nodes processed */
  abstractNodesProcessed: number;
  /** Number of abstract edges created */
  abstractEdgesCreated: number;
  /** Number of path refinements performed */
  pathRefinements: number;
  /** Total execution time in milliseconds */
  executionTime: number;
  /** Abstract pathfinding time */
  abstractPathfindingTime: number;
  /** Path refinement time */
  pathRefinementTime: number;
  /** Whether the computation was successful */
  success: boolean;
  /** Error message if computation failed */
  error?: string;
}

/**
 * Result of the HPA* pathfinding.
 */
export interface HPAResult {
  /** The found path as an array of points */
  path: Point[];
  /** Whether a path was found */
  found: boolean;
  /** Total cost of the path */
  cost: number;
  /** Length of the path */
  length: number;
  /** Abstract path (high-level) */
  abstractPath: AbstractNode[];
  /** Refined path (detailed) */
  refinedPath: Point[];
  /** Statistics about the computation */
  stats: HPAStats;
}

/**
 * Options for HPA* pathfinding.
 */
export interface HPAOptions {
  /** Whether to return abstract path */
  returnAbstractPath: boolean;
  /** Whether to return refined path */
  returnRefinedPath: boolean;
  /** Whether to use path smoothing */
  usePathSmoothing: boolean;
  /** Whether to use early termination */
  useEarlyTermination: boolean;
  /** Maximum number of iterations */
  maxIterations: number;
  /** Whether to use goal bounding for optimization */
  useGoalBounding: boolean;
  /** Whether to use hierarchical abstraction */
  useHierarchicalAbstraction: boolean;
  /** Custom cost function */
  customCostFunction?: (from: Point, to: Point) => number;
}

/**
 * Options for cluster generation.
 */
export interface ClusterGenerationOptions {
  /** Cluster size (width and height) */
  clusterSize: number;
  /** Whether to use overlapping clusters */
  useOverlappingClusters: boolean;
  /** Overlap size */
  overlapSize: number;
  /** Whether to use adaptive cluster sizing */
  useAdaptiveSizing: boolean;
  /** Minimum cluster size */
  minClusterSize: number;
  /** Maximum cluster size */
  maxClusterSize: number;
  /** Whether to merge small clusters */
  mergeSmallClusters: boolean;
  /** Small cluster threshold */
  smallClusterThreshold: number;
}

/**
 * Result of cluster generation.
 */
export interface ClusterGenerationResult {
  /** Generated clusters */
  clusters: Cluster[];
  /** Whether generation was successful */
  success: boolean;
  /** Statistics about the generation */
  stats: {
    clustersCreated: number;
    entrancesFound: number;
    averageClusterSize: number;
    generationTime: number;
  };
}

/**
 * Options for entrance detection.
 */
export interface EntranceDetectionOptions {
  /** Whether to detect border entrances */
  detectBorderEntrances: boolean;
  /** Whether to detect interior entrances */
  detectInteriorEntrances: boolean;
  /** Minimum entrance width */
  minEntranceWidth: number;
  /** Maximum entrance width */
  maxEntranceWidth: number;
  /** Whether to use adaptive entrance detection */
  useAdaptiveDetection: boolean;
  /** Entrance detection threshold */
  detectionThreshold: number;
}

/**
 * Result of entrance detection.
 */
export interface EntranceDetectionResult {
  /** Detected entrances */
  entrances: Entrance[];
  /** Whether detection was successful */
  success: boolean;
  /** Statistics about the detection */
  stats: {
    entrancesFound: number;
    borderEntrances: number;
    interiorEntrances: number;
    detectionTime: number;
  };
}

/**
 * Options for abstract graph construction.
 */
export interface AbstractGraphOptions {
  /** Whether to use inter-cluster edges */
  useInterClusterEdges: boolean;
  /** Whether to use intra-cluster edges */
  useIntraClusterEdges: boolean;
  /** Whether to use entrance edges */
  useEntranceEdges: boolean;
  /** Whether to use direct cluster connections */
  useDirectClusterConnections: boolean;
  /** Maximum edge cost */
  maxEdgeCost: number;
  /** Whether to use edge caching */
  useEdgeCaching: boolean;
}

/**
 * Result of abstract graph construction.
 */
export interface AbstractGraphResult {
  /** Abstract nodes */
  nodes: AbstractNode[];
  /** Abstract edges */
  edges: AbstractEdge[];
  /** Whether construction was successful */
  success: boolean;
  /** Statistics about the construction */
  stats: {
    nodesCreated: number;
    edgesCreated: number;
    interClusterEdges: number;
    intraClusterEdges: number;
    constructionTime: number;
  };
}

/**
 * Options for path refinement.
 */
export interface PathRefinementOptions {
  /** Whether to use A* for refinement */
  useAStarRefinement: boolean;
  /** Whether to use JPS for refinement */
  useJPSRefinement: boolean;
  /** Whether to use Theta* for refinement */
  useThetaStarRefinement: boolean;
  /** Whether to use path smoothing */
  usePathSmoothing: boolean;
  /** Smoothing factor */
  smoothingFactor: number;
  /** Whether to use early termination */
  useEarlyTermination: boolean;
  /** Maximum refinement iterations */
  maxRefinementIterations: number;
}

/**
 * Result of path refinement.
 */
export interface PathRefinementResult {
  /** Refined path */
  refinedPath: Point[];
  /** Whether refinement was successful */
  success: boolean;
  /** Statistics about the refinement */
  stats: {
    refinementTime: number;
    pathLength: number;
    smoothingApplied: boolean;
    iterationsUsed: number;
  };
}

/**
 * Options for HPA* validation.
 */
export interface HPAValidationOptions {
  /** Whether to check cluster validity */
  checkClusterValidity: boolean;
  /** Whether to check entrance validity */
  checkEntranceValidity: boolean;
  /** Whether to check abstract graph validity */
  checkAbstractGraphValidity: boolean;
  /** Whether to check path validity */
  checkPathValidity: boolean;
  /** Whether to check for unreachable areas */
  checkUnreachableAreas: boolean;
  /** Whether to check for invalid connections */
  checkInvalidConnections: boolean;
  /** Maximum allowed path length */
  maxPathLength: number;
  /** Minimum allowed path length */
  minPathLength: number;
}

/**
 * Result of HPA* validation.
 */
export interface HPAValidationResult {
  /** Whether the HPA* structure is valid */
  isValid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of validation warnings */
  warnings: string[];
  /** Whether clusters are valid */
  hasValidClusters: boolean;
  /** Whether entrances are valid */
  hasValidEntrances: boolean;
  /** Whether abstract graph is valid */
  hasValidAbstractGraph: boolean;
  /** Whether path is valid */
  hasValidPath: boolean;
  /** Whether there are unreachable areas */
  hasUnreachableAreas: boolean;
  /** Whether there are invalid connections */
  hasInvalidConnections: boolean;
}

/**
 * Options for HPA* serialization.
 */
export interface HPASerializationOptions {
  /** Number of decimal places for coordinates */
  precision: number;
  /** Whether to include statistics */
  includeStats: boolean;
  /** Whether to include clusters */
  includeClusters: boolean;
  /** Whether to include entrances */
  includeEntrances: boolean;
  /** Whether to include abstract graph */
  includeAbstractGraph: boolean;
  /** Whether to include path */
  includePath: boolean;
  /** Whether to compress the data */
  compress: boolean;
}

/**
 * Serialized representation of HPA* result.
 */
export interface HPASerialization {
  /** Grid dimensions */
  dimensions: {
    width: number;
    height: number;
  };
  /** Cluster configuration */
  clusterConfig: {
    clusterSize: number;
    clusterCount: number;
  };
  /** Whether pathfinding was successful */
  success: boolean;
  /** Statistics (if included) */
  stats?: HPAStats;
  /** Clusters (if included) */
  clusters?: Cluster[];
  /** Entrances (if included) */
  entrances?: Entrance[];
  /** Abstract graph (if included) */
  abstractGraph?: {
    nodes: AbstractNode[];
    edges: AbstractEdge[];
  };
  /** Path (if included) */
  path?: Point[];
}

/**
 * Options for HPA* comparison.
 */
export interface HPAComparisonOptions {
  /** Whether to compare clusters */
  compareClusters: boolean;
  /** Whether to compare entrances */
  compareEntrances: boolean;
  /** Whether to compare abstract graphs */
  compareAbstractGraphs: boolean;
  /** Whether to compare paths */
  comparePaths: boolean;
  /** Whether to compare statistics */
  compareStats: boolean;
  /** Tolerance for comparisons */
  tolerance: number;
  /** Whether to compare execution times */
  compareExecutionTimes: boolean;
  /** Whether to compare memory usage */
  compareMemoryUsage: boolean;
}

/**
 * Result of HPA* comparison.
 */
export interface HPAComparisonResult {
  /** Whether HPA* structures are equivalent */
  areEquivalent: boolean;
  /** Cluster similarity score (0-1) */
  clusterSimilarity: number;
  /** Entrance similarity score (0-1) */
  entranceSimilarity: number;
  /** Abstract graph similarity score (0-1) */
  abstractGraphSimilarity: number;
  /** Path similarity score (0-1) */
  pathSimilarity: number;
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
}

/**
 * Options for performance analysis.
 */
export interface HPAPerformanceOptions {
  /** Whether to track memory usage */
  trackMemory: boolean;
  /** Whether to track cache hits */
  trackCacheHits: boolean;
  /** Whether to track cluster efficiency */
  trackClusterEfficiency: boolean;
  /** Whether to generate performance report */
  generateReport: boolean;
  /** Whether to track abstract pathfinding time */
  trackAbstractPathfindingTime: boolean;
  /** Whether to track path refinement time */
  trackPathRefinementTime: boolean;
  /** Whether to track cluster generation time */
  trackClusterGenerationTime: boolean;
}

/**
 * Result of performance analysis.
 */
export interface HPAPerformanceResult {
  /** Performance metrics */
  metrics: {
    clustersPerSecond: number;
    memoryUsage: number;
    cacheHitRate: number;
    clusterEfficiency: number;
    abstractPathfindingTime: number;
    pathRefinementTime: number;
    clusterGenerationTime: number;
  };
  /** Performance report */
  report?: {
    bottlenecks: string[];
    recommendations: string[];
    optimizationSuggestions: string[];
  };
}

/**
 * Options for dynamic updates.
 */
export interface DynamicUpdateOptions {
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
 * Result of dynamic update.
 */
export interface DynamicUpdateResult {
  /** Updated clusters */
  updatedClusters: Cluster[];
  /** Updated entrances */
  updatedEntrances: Entrance[];
  /** Updated abstract graph */
  updatedAbstractGraph: {
    nodes: AbstractNode[];
    edges: AbstractEdge[];
  };
  /** Whether update was successful */
  success: boolean;
  /** Statistics about the update */
  stats: {
    clustersUpdated: number;
    entrancesUpdated: number;
    edgesUpdated: number;
    updateTime: number;
    obstaclesAdded: number;
    obstaclesRemoved: number;
  };
}
