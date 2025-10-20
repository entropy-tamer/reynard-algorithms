/**
 * Clean exports for core algorithm classes
 * This file provides organized exports from the modular directory structure
 */

// ============================================================================
// CORE DATA STRUCTURES
// ============================================================================

// Union-Find data structure
export { UnionFind } from "./data-structures/union-find/union-find-core";
export type { UnionFindStats, UnionFindNode } from "./data-structures/union-find/union-find-types";

// Spatial Hash data structure
export { SpatialHash } from "./spatial-structures/spatial-hash/spatial-hash-core";
export type {
  SpatialHashConfig,
  SpatialHashStats,
  SpatialObject,
  QueryResult,
} from "./spatial-structures/spatial-hash/spatial-hash-types";

// Priority Queue / Binary Heap
export { PriorityQueue } from "./data-structures/priority-queue";
export type {
  PriorityQueueNode,
  PriorityQueueConfig,
  PriorityQueueStats,
  PriorityQueueComparator,
  PriorityQueueOptions,
  PriorityQueuePeekResult,
  PriorityQueueBatchResult,
  PriorityQueueEvent,
  PriorityQueueEventType,
  PriorityQueueEventHandler,
  PriorityQueueIteratorResult,
} from "./data-structures/priority-queue";

// LRU Cache
export { LRUCache } from "./data-structures/lru-cache";
export type {
  LRUCacheNode,
  LRUCacheConfig,
  LRUCacheStats,
  LRUCacheEntry,
  LRUCacheOptions,
  LRUCacheEvent,
  LRUCacheEventType,
  LRUCacheEventHandler,
  LRUCacheIteratorResult,
  LRUCacheBatchResult,
  LRUCacheSnapshot,
  LRUCachePerformanceMetrics,
} from "./data-structures/lru-cache";

// Trie (Prefix Tree)
export { Trie } from "./data-structures/trie/trie-core";
export type { TrieNode, TrieConfig, TrieSearchResult } from "./data-structures/trie/trie-types";

// Bloom Filter
export { BloomFilter } from "./data-structures/bloom-filter/bloom-filter-core";
export type { BloomFilterConfig, BloomFilterStats } from "./data-structures/bloom-filter/bloom-filter-types";

// Fenwick Tree (Binary Indexed Tree)
export { FenwickTree } from "./data-structures/fenwick-tree/fenwick-tree-core";
export type { FenwickTreeConfig, FenwickTreeStats } from "./data-structures/fenwick-tree/fenwick-tree-types";

// Interval Tree
export { IntervalTree } from "./data-structures/interval-tree/interval-tree-core";
export type {
  Interval,
  IntervalTreeNode,
  IntervalTreeConfig,
  IntervalTreeStats,
} from "./data-structures/interval-tree/interval-tree-types";

// Segment Tree
export { SegmentTree } from "./data-structures/segment-tree/segment-tree-core";
export type {
  SegmentTreeNode,
  SegmentTreeConfig,
  SegmentTreeStats,
} from "./data-structures/segment-tree/segment-tree-types";

// ============================================================================
// SPATIAL STRUCTURES
// ============================================================================

// K-d Tree
export { KdTree } from "./spatial-structures/kdtree";
export type {
  Point as KdTreePoint,
  Point2D as KdTreePoint2D,
  Point3D as KdTreePoint3D,
  BoundingBox as KdTreeBoundingBox,
  KdNode,
  KdTreeConfig,
  KdTreeStats,
  KdTreeResult,
  NearestNeighborResult,
  KNearestNeighborsResult,
  RangeQueryResult,
  NearestNeighborOptions,
  KNearestNeighborsOptions,
  RangeQueryOptions,
  KdTreeOptions,
  KdTreeEvent,
  KdTreeEventHandler,
  KdTreePerformanceMetrics,
  BatchOperationResult as KdTreeBatchOperationResult,
  KdTreeSerialization,
} from "./spatial-structures/kdtree";
export { KdTreeEventType } from "./spatial-structures/kdtree";

// Octree
export { Octree } from "./spatial-structures/octree";
export type {
  Point3D as OctreePoint3D,
  Bounds3D,
  Sphere3D,
  Ray3D as OctreeRay3D,
  Frustum3D,
  OctreeNode,
  OctreeConfig,
  OctreeStats,
  OctreeResult,
  SpatialQueryResult,
  RayIntersectionResult as OctreeRayIntersectionResult,
  FrustumCullingResult,
  SpatialQueryOptions,
  RayIntersectionOptions as OctreeRayIntersectionOptions,
  FrustumCullingOptions,
  OctreeOptions,
  OctreeEvent,
  OctreeEventHandler,
  OctreePerformanceMetrics,
  BatchOperationResult as OctreeBatchOperationResult,
  Voxel,
  VoxelGrid,
  OctreeSerialization,
} from "./spatial-structures/octree";
export { Octant, OctreeEventType } from "./spatial-structures/octree";

// BVH (Bounding Volume Hierarchy)
export { BVH } from "./spatial-structures/bvh";
export type {
  AABB as BVHAABB,
  Ray3D as BVHRay3D,
  Primitive,
  Triangle as BVHTriangle,
  BVHNode,
  BVHBuildConfig,
  BVHStats,
  BVHResult,
  RayIntersectionResult as BVHRayIntersectionResult,
  AABBIntersectionResult,
  RayIntersectionOptions as BVHRayIntersectionOptions,
  AABBIntersectionOptions,
  BVHOptions,
  BVHEvent,
  BVHEventHandler,
  BVHPerformanceMetrics,
  BatchOperationResult as BVHBatchOperationResult,
  TraversalStack,
  SAHSplitCandidate,
  BVHSerialization,
} from "./spatial-structures/bvh";
export { BVHEventType } from "./spatial-structures/bvh";

// Quadtree
export { Quadtree } from "./spatial-structures/quadtree";
export type {
  Point as QuadtreePoint,
  Rectangle as QuadtreeRectangle,
  QuadtreeData,
  QuadtreeNode,
  QuadtreeConfig,
  QuadtreeStats,
  QuadtreeQueryResult,
  CircleQuery,
  RectangleQuery,
  PointQuery,
  QuadtreeOptions,
  QuadtreeEvent,
  QuadtreeEventType,
  QuadtreeEventHandler,
  QuadtreeTraversalResult,
  QuadtreeCollisionResult,
  QuadtreeNearestNeighborResult,
  QuadtreePerformanceMetrics,
} from "./spatial-structures/quadtree";

// R-Tree
export { RTree } from "./spatial-structures/rtree/rtree-core";
export type {
  Point as RTreePoint,
  Rectangle as RTreeRectangle,
  RTreeEntry,
  RTreeNode,
  RTreeConfig,
  RTreeStats,
  RTreeQueryResult,
  RTreeQueryOptions,
  RTreeInsertResult,
  RTreeDeleteResult,
} from "./spatial-structures/rtree/rtree-types";

// ============================================================================
// GEOMETRY OPERATIONS
// ============================================================================

// Geometry types and operations
export type { Point } from "./geometry/shapes/point-algorithms";
export type { Vector } from "./geometry/vectors/vector-algorithms";
export type { Line, Rectangle, Circle, Polygon } from "./geometry/shapes/shapes";
export type { Transform } from "./geometry/transformations/transformation-algorithms";

// Geometry operation classes
export { PointOps } from "./geometry/shapes/point-algorithms";
export { VectorOps } from "./geometry/vectors/vector-algorithms";
export { LineOps } from "./geometry/shapes/line-algorithms";
export { RectangleOps } from "./geometry/shapes/rectangle-algorithms";
export { CircleOps } from "./geometry/shapes/circle-algorithms";
export { PolygonOps } from "./geometry/shapes/polygon-algorithms";
export { TransformOps } from "./geometry/transformations/transformation-algorithms";

// Bresenham's Line Algorithm
export { BresenhamLine } from "./geometry/algorithms/bresenham/bresenham-core";
export type {
  Point as BresenhamPoint,
  Pixel,
  BresenhamConfig,
  BresenhamResult,
  LineDrawingOptions,
  LineDrawingResult,
  MultiLineOptions,
  MultiLineResult,
} from "./geometry/algorithms/bresenham/bresenham-types";

// Delaunay Triangulation
export { DelaunayTriangulation } from "./geometry/algorithms/delaunay/delaunay-core";
export type {
  Point as DelaunayPoint,
  Triangle as DelaunayTriangle,
  Edge as DelaunayEdge,
  Circumcircle,
  DelaunayConfig,
  DelaunayStats,
  DelaunayResult,
  TriangulationQueryOptions,
  TriangulationQueryResult,
  MeshGenerationOptions,
  Mesh,
  ConstrainedDelaunayOptions,
  ConstrainedDelaunayResult,
} from "./geometry/algorithms/delaunay/delaunay-types";

// Voronoi Diagram
export { VoronoiDiagram } from "./geometry/algorithms/voronoi/voronoi-core";
export type {
  VoronoiCell,
  VoronoiEdge,
  VoronoiVertex,
  VoronoiConfig,
  VoronoiStats,
  VoronoiResult,
  VoronoiQueryOptions,
  VoronoiQueryResult,
  LloydRelaxationOptions,
  LloydRelaxationResult,
  VoronoiSerializationOptions,
  VoronoiSerialization,
} from "./geometry/algorithms/voronoi/voronoi-types";

// Polygon Clipping
export { PolygonClipping } from "./geometry/algorithms/polygon-clipping/polygon-clipping-core";
export { SutherlandHodgmanClipper } from "./geometry/algorithms/polygon-clipping/sutherland-hodgman";
export { WeilerAthertonClipper } from "./geometry/algorithms/polygon-clipping/weiler-atherton";
export type {
  Point as PolygonClippingPoint,
  Vector as PolygonClippingVector,
  LineSegment as PolygonClippingLineSegment,
  Polygon as PolygonClippingPolygon,
  ClippingPlane,
  ClipOperation,
  PolygonClippingConfig,
  ClippingStats,
  ClipResult,
  SutherlandHodgmanOptions,
  WeilerAthertonOptions,
  WAVertex,
  WAEdge,
  WAPolygon,
  PolygonValidationOptions,
  PolygonValidationResult,
  PolygonSimplificationOptions,
  PolygonSerializationOptions,
  PolygonSerialization,
} from "./geometry/algorithms/polygon-clipping/polygon-clipping-types";

// Line Segment Intersection
export { LineIntersection } from "./geometry/algorithms/line-intersection/line-intersection-core";
export {
  SweepLineEventQueue,
  SweepLineStatusStructure,
  SweepLineUtils,
} from "./geometry/algorithms/line-intersection/sweep-line";
export type {
  Point as LineIntersectionPoint,
  LineSegment as LineIntersectionLineSegment,
  IntersectionPoint,
  SweepLineEvent,
  LineIntersectionConfig,
  LineIntersectionStats,
  LineIntersectionResult,
  IntersectionQueryOptions,
  IntersectionQueryResult,
  SegmentValidationOptions,
  SegmentValidationResult,
  IntersectionFilterOptions,
  PerformanceOptions,
  IntersectionSerializationOptions,
  IntersectionSerialization,
  EventQueue,
  StatusStructure,
  StatusNode,
} from "./geometry/algorithms/line-intersection/line-intersection-types";

// Oriented Bounding Box (OBB)
export { OBB } from "./geometry/shapes/obb/obb-core";
export { OBBUtils } from "./geometry/shapes/obb/obb-utils";
export type {
  Point as OBBPoint,
  Vector as OBBVector,
  OBBData as OBBType,
  OBBConfig,
  OBBStats,
  OBBCollisionResult,
  OBBPointTestResult,
  OBBConstructionResult,
  OBBConstructionOptions,
  SATOptions,
  OBBTransformOptions,
  OBBTransformResult,
  OBBSerializationOptions,
  OBBSerialization,
  OBBValidationOptions,
  OBBValidationResult,
  OBBIntersectionOptions,
  OBBIntersectionResult,
  OBBContainmentOptions,
  OBBContainmentResult,
} from "./geometry/shapes/obb/obb-types";

// Minimum Bounding Box
export { MinimumBoundingBox } from "./geometry/algorithms/minimum-bounding-box/minimum-bounding-box-core";
export { MinimumBoundingBoxUtils } from "./geometry/algorithms/minimum-bounding-box/minimum-bounding-box-utils";
export type {
  Point as MinimumBoundingBoxPoint,
  Vector as MinimumBoundingBoxVector,
  Rectangle as MinimumBoundingBoxRectangle,
  MinimumBoundingBoxConfig,
  MinimumBoundingBoxStats,
  MinimumBoundingBoxResult,
  MinimumBoundingBoxOptions,
  RotatingCalipersOptions,
  ConvexHullOptions,
  MinimumBoundingBoxValidationOptions,
  MinimumBoundingBoxValidationResult,
  MinimumBoundingBoxSerializationOptions,
  MinimumBoundingBoxSerialization,
  BoundingBoxComparisonOptions,
  BoundingBoxComparisonResult,
  MinimumBoundingBoxOptimizationOptions,
  MinimumBoundingBoxOptimizationResult,
} from "./geometry/algorithms/minimum-bounding-box/minimum-bounding-box-types";

// Jump Point Search (JPS)
export { JPS } from "./pathfinding/jps/jps-core";
export { JPSUtils } from "./pathfinding/jps/jps-utils";
export type {
  Point as JPSPoint,
  Vector as JPSVector,
  Direction,
  MovementType,
  CellType,
  GridCell,
  JumpPoint,
  JPSConfig,
  JPSStats,
  JPSResult,
  JPSOptions,
  JumpPointOptions,
  GridValidationOptions,
  GridValidationResult,
  PathOptimizationOptions,
  PathOptimizationResult,
  JPSPlusOptions,
  JPSPlusResult,
  JPSSerializationOptions,
  JPSSerialization,
  PathComparisonOptions,
  PathComparisonResult,
  JPSPerformanceOptions,
  JPSPerformanceResult,
} from "./pathfinding/jps/jps-types";

// Theta* Any-Angle Pathfinding
export { ThetaStar } from "./pathfinding/theta-star/theta-star-core";
export { ThetaStarUtils } from "./pathfinding/theta-star/theta-star-utils";
export { LineOfSight } from "./pathfinding/theta-star/line-of-sight";
export type {
  Point as ThetaStarPoint,
  Vector as ThetaStarVector,
  Direction as ThetaStarDirection,
  MovementType as ThetaStarMovementType,
  CellType as ThetaStarCellType,
  GridCell as ThetaStarGridCell,
  ThetaStarNode,
  ThetaStarConfig,
  ThetaStarStats,
  ThetaStarResult,
  ThetaStarOptions,
  LineOfSightOptions,
  LineOfSightResult,
  GridValidationOptions as ThetaStarGridValidationOptions,
  GridValidationResult as ThetaStarGridValidationResult,
  PathOptimizationOptions as ThetaStarPathOptimizationOptions,
  PathOptimizationResult as ThetaStarPathOptimizationResult,
  ThetaStarSerializationOptions,
  ThetaStarSerialization,
  PathComparisonOptions as ThetaStarPathComparisonOptions,
  PathComparisonResult as ThetaStarPathComparisonResult,
  LazyEvaluationOptions,
  LazyEvaluationResult,
} from "./pathfinding/theta-star/theta-star-types";

// Flow Field Pathfinding
export { FlowField } from "./pathfinding/flow-field/flow-field-core";
export { FlowFieldUtils } from "./pathfinding/flow-field/flow-field-utils";
export { FlowFieldGenerator } from "./pathfinding/flow-field/flow-field-generator";
export type {
  Point as FlowFieldPoint,
  Vector as FlowFieldVector,
  CellType as FlowFieldCellType,
  GridCell as FlowFieldGridCell,
  IntegrationCell,
  FlowCell,
  FlowFieldConfig,
  FlowFieldStats,
  FlowFieldResult,
  FlowFieldOptions,
  AgentPathfindingOptions,
  AgentPathfindingResult,
  MultiGoalOptions,
  MultiGoalResult,
  DynamicObstacleOptions,
  DynamicObstacleResult,
  FlowFieldValidationOptions,
  FlowFieldValidationResult,
  FlowFieldSerializationOptions,
  FlowFieldSerialization,
  FlowFieldComparisonOptions,
  FlowFieldComparisonResult,
  FlowFieldPerformanceOptions,
  FlowFieldPerformanceResult,
  CrowdSimulationOptions,
  CrowdSimulationResult,
} from "./pathfinding/flow-field/flow-field-types";

// HPA* Hierarchical Pathfinding
export { HPAStar } from "./pathfinding/hpa-star/hpa-star-core";
export { HPAStarUtils } from "./pathfinding/hpa-star/hpa-star-utils";
export { HPAClustering } from "./pathfinding/hpa-star/hpa-clustering";
export { HPAAbstractGraph } from "./pathfinding/hpa-star/hpa-abstract-graph";
export { HPAPathRefinement } from "./pathfinding/hpa-star/hpa-path-refinement";
export type {
  Point as HPAStarPoint,
  CellType as HPAStarCellType,
  HPAConfig,
  HPAOptions,
  HPAStats,
  HPAResult,
  Cluster,
  ClusterGenerationOptions,
  Entrance,
  EntranceDetectionOptions,
  AbstractGraphOptions,
  AbstractNode,
  AbstractEdge,
  PathRefinementOptions,
  HPAValidationOptions,
  HPAValidationResult,
  HPAComparisonOptions,
  HPAComparisonResult,
  HPASerializationOptions,
  HPASerialization,
  HPAPerformanceOptions,
  HPAPerformanceResult,
} from "./pathfinding/hpa-star/hpa-star-types";

// Convex Hull Algorithms
export { ConvexHull } from "./geometry/algorithms/convex-hull/convex-hull-core";
export type {
  Point as ConvexHullPoint,
  Vector as ConvexHullVector,
  HullEdge,
  ConvexHullAlgorithm,
  ConvexHullConfig,
  ConvexHullStats,
  ConvexHullResult,
  HullAnalysisOptions,
  HullAnalysis,
  HullComparisonOptions,
  HullComparison,
  HullSimplificationOptions,
  HullSimplificationResult,
} from "./geometry/algorithms/convex-hull/convex-hull-types";

// Marching Squares Algorithm
export { MarchingSquares } from "./geometry/algorithms/marching-squares/marching-squares-core";
export type {
  Point as MarchingSquaresPoint,
  Vector as MarchingSquaresVector,
  LineSegment as MarchingSquaresLineSegment,
  Contour,
  MarchingSquaresConfig,
  MarchingSquaresStats,
  MarchingSquaresResult,
  ContourAnalysisOptions,
  ContourAnalysis,
  ContourSimplificationOptions,
  ContourSimplificationResult,
  MultiLevelContourOptions,
  MultiLevelContourResult,
} from "./geometry/algorithms/marching-squares/marching-squares-types";

// Simplex Noise Algorithm
export { SimplexNoise } from "./geometry/algorithms/simplex-noise/simplex-noise-core";
export type {
  Point2D,
  Point3D,
  Point4D,
  SimplexNoiseConfig,
  NoiseStats,
  NoiseResult,
  Noise2DOptions,
  Noise3DOptions,
  Noise4DOptions,
  FractalNoiseOptions,
  NoiseAnalysisOptions,
  NoiseAnalysis,
  NoiseFilterOptions,
  NoiseFilterResult,
} from "./geometry/algorithms/simplex-noise/simplex-noise-types";

// Poisson Disk Sampling Algorithm
export { PoissonDisk } from "./geometry/algorithms/poisson-disk/poisson-disk-core";
export type {
  Point2D as PoissonDiskPoint2D,
  Point3D as PoissonDiskPoint3D,
  PoissonDiskConfig,
  PoissonDiskStats,
  PoissonDiskResult,
  PoissonDisk2DOptions,
  PoissonDisk3DOptions,
  PoissonDiskAnalysisOptions,
  PoissonDiskAnalysis,
  AdaptivePoissonDiskOptions,
  AdaptivePoissonDiskResult,
  ConstrainedPoissonDiskOptions,
  ConstrainedPoissonDiskResult,
} from "./geometry/algorithms/poisson-disk/poisson-disk-types";

// Wave Function Collapse Algorithm
export { WaveFunctionCollapse } from "./geometry/algorithms/wave-function-collapse/wave-function-collapse-core";
export type {
  Position2D as WaveFunctionCollapsePosition2D,
  Position3D as WaveFunctionCollapsePosition3D,
  Tile,
  TileSymmetry,
  Constraint,
  Direction2D,
  Direction3D,
  WaveFunctionCollapseConfig,
  WaveFunctionCollapseStats,
  WaveFunctionCollapseResult,
  WaveFunctionCollapse2DOptions,
  WaveFunctionCollapse3DOptions,
  Cell,
  Pattern,
  WaveFunctionCollapseAnalysisOptions,
  WaveFunctionCollapseAnalysis,
  WaveFunctionCollapseTrainingOptions,
  WaveFunctionCollapseTrainingResult,
  ConstraintBasedWaveFunctionCollapseOptions,
  ConstraintBasedWaveFunctionCollapseResult,
  MultiScaleWaveFunctionCollapseOptions,
  MultiScaleWaveFunctionCollapseResult,
} from "./geometry/algorithms/wave-function-collapse/wave-function-collapse-types";

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

// Performance monitoring and optimization
export { PerformanceTimer } from "./performance/timer";
export { MemoryMonitor, MemoryLeakDetector } from "./performance/memory";
export { PerformanceBenchmark, measureAsync, measureSync } from "./performance/benchmark";
export { FrameRateMonitor } from "./performance/framerate";
export { throttle, debounce } from "./performance/throttle";
export { PerformanceBudgetChecker } from "./performance/budget";

// Memory Pool utilities
export { MemoryPool } from "./performance/memory-pool-core";
export type {
  PooledObject,
  PerformanceMemoryPoolConfig,
  PerformanceMemoryPoolStats,
} from "./performance/memory-pool-core";
export * from "./performance/memory-pool-utils";

// ============================================================================
// PATHFINDING ALGORITHMS
// ============================================================================

// A* Pathfinding Algorithm
export { AStar } from "./pathfinding/astar/astar-core";
export type { AStarNode, AStarConfig, AStarResult, AStarHeuristic } from "./pathfinding/astar/astar-types";
export { manhattanDistance, euclideanDistance, chebyshevDistance } from "./pathfinding/astar/heuristics";

// ============================================================================
// COLLISION DETECTION
// ============================================================================

// Separating Axis Theorem (SAT) Collision Detection
export { SAT } from "./geometry/collision/sat/sat-core";
export type { Projection, SATCollisionResult } from "./geometry/collision/sat/sat-types";

// Sweep and Prune Broad-Phase Collision Detection
export { SweepPrune } from "./geometry/collision/sweep-prune/sweep-prune-core";
export type {
  AABB as SweepPruneAABB,
  Endpoint,
  SweepPruneConfig,
  SweepPruneResult,
} from "./geometry/collision/sweep-prune/sweep-prune-types";

// AABB collision detection types and functions
export type { AABB as AABBCollision, CollisionPair, CollisionResult } from "./geometry/collision/aabb/aabb-types";
export {
  checkCollision,
  batchCollisionDetection,
  batchCollisionWithSpatialHash,
  pointInAABB,
  areAABBsTouching,
  expandAABB,
  unionAABB,
  intersectionAABB,
  containsAABB,
} from "./geometry/collision/aabb";

// Spatial collision optimization
export { SpatialCollisionOptimizer } from "./geometry/collision/optimization";

// ============================================================================
// OPTIMIZATION FRAMEWORK
// ============================================================================

// Optimization and algorithm selection
export {
  detectCollisions,
  performSpatialQuery,
  PerformanceMonitor,
  OptimizationConfig,
  configureOptimization,
  cleanup,
} from "./optimized";
