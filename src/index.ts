/**
 * @file Main entry point for reynard-algorithms package
 *
 * Algorithms, data structures, and computational utilities for spatial computing, collision detection, pathfinding, and procedural generation.
 * A comprehensive collection of reusable algorithmic building blocks with
 * automatic optimization and performance monitoring.
 */

/* eslint-disable max-lines */
/*
This file serves as a comprehensive barrel export that aggregates all public APIs
from the algorithms package. It intentionally contains extensive export statements
(over 750 lines) to provide a single convenient entry point for consumers, consolidating
exports from more than 30 algorithm modules, data structures, and utility modules
across computational geometry, pathfinding, collision detection, and procedural generation.
Breaking this into multiple index files would fragment the API surface and reduce
discoverability, which contradicts the purpose of a unified package entry point.
*/

// ============================================================================
// Core Types - Canonical type definitions
// ============================================================================
export type {
  Point,
  MutablePoint,
  Point3D,
  MutablePoint3D,
  Vector,
  MutableVector,
  Vector3D,
  MutableVector3D,
  Line,
  Rectangle,
  Circle,
  Polygon,
  AABB,
  AABB3D,
  BoundingBox,
  BoundingBox3D,
  Sphere3D,
  Ray3D,
  Frustum3D,
  Plane3D,
  Transform,
  // Spatial types
  SpatialData,
  SpatialObjectData,
  GameEntityData,
  CollisionData,
  RenderData,
  CollisionObjectData,
  SpatialDataType,
  SpatialObject,
  SpatialQueryResult,
  // Performance types
  PerformanceMemoryInfo,
  PerformanceMemoryAPI,
  ExtendedPerformance,
  ExtendedGlobal,
  ThrottleOptions,
  DebounceOptions,
  FunctionSignature,
  ThrottledFunction,
  DebouncedFunction,
  MemoryPoolConfig,
  PooledObject,
  SpatialHashConfig,
  SpatialHashStats,
} from "./core/types";
// Note: PerformanceMemoryPoolStats is exported separately from utils/memory to avoid duplicate

// ============================================================================
// Core Geometry - Basic geometric primitives
// ============================================================================
export { PointOps } from "./core/geometry/point";
export { VectorOps } from "./core/geometry/vector";
// Note: LineOps, RectangleOps, CircleOps, PolygonOps, TransformOps
// are exported from their respective modules in geometry/shapes
// These will be added when the shape algorithm files are properly organized

// ============================================================================
// Data Structures - Basic
// ============================================================================
// Union-Find
export { UnionFind } from "./data-structures/basic/union-find/union-find-core";
export type { UnionFindStats, UnionFindNode } from "./data-structures/basic/union-find/union-find-types";

// Priority Queue / Binary Heap
export { PriorityQueue } from "./data-structures/basic/priority-queue";
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
} from "./data-structures/basic/priority-queue";

// LRU Cache
export { LRUCache } from "./data-structures/basic/lru-cache";
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
} from "./data-structures/basic/lru-cache";

// Trie (Prefix Tree)
export { Trie } from "./data-structures/basic/trie/trie-core";
export type { TrieNode, TrieConfig, TrieSearchResult } from "./data-structures/basic/trie/trie-types";

// Bloom Filter
export { BloomFilter } from "./data-structures/basic/bloom-filter/bloom-filter-core";
export type { BloomFilterConfig, BloomFilterStats } from "./data-structures/basic/bloom-filter/bloom-filter-types";

// ============================================================================
// Data Structures - Trees
// ============================================================================
// Fenwick Tree (Binary Indexed Tree)
export { FenwickTree } from "./data-structures/trees/fenwick-tree/fenwick-tree-core";
export type { FenwickTreeConfig, FenwickTreeStats } from "./data-structures/trees/fenwick-tree/fenwick-tree-types";

// Interval Tree
export { IntervalTree } from "./data-structures/trees/interval-tree/interval-tree-core";
export type {
  Interval,
  IntervalTreeNode,
  IntervalTreeConfig,
  IntervalTreeStats,
} from "./data-structures/trees/interval-tree/interval-tree-types";

// Segment Tree
export { SegmentTree } from "./data-structures/trees/segment-tree/segment-tree-core";
export type {
  SegmentTreeNode,
  SegmentTreeConfig,
  SegmentTreeStats,
} from "./data-structures/trees/segment-tree/segment-tree-types";

// ============================================================================
// Data Structures - Spatial
// ============================================================================
// Spatial Hash
export { SpatialHash } from "./data-structures/spatial/spatial-hash/spatial-hash-core";
export type { QueryResult } from "./data-structures/spatial/spatial-hash/spatial-hash-types";
// Note: SpatialHashConfig, SpatialHashStats, SpatialObject are exported from core/types to avoid duplicates

// K-d Tree
export { KdTree } from "./data-structures/spatial/kdtree";
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
} from "./data-structures/spatial/kdtree";
export { KdTreeEventType } from "./data-structures/spatial/kdtree";

// Octree
export { Octree } from "./data-structures/spatial/octree";
export type {
  Point3D as OctreePoint3D,
  Bounds3D,
  Sphere3D as OctreeSphere3D,
  Ray3D as OctreeRay3D,
  Frustum3D as OctreeFrustum3D,
  OctreeNode,
  OctreeConfig,
  OctreeStats,
  OctreeResult,
  SpatialQueryResult as OctreeSpatialQueryResult,
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
} from "./data-structures/spatial/octree";
export { Octant, OctreeEventType } from "./data-structures/spatial/octree";

// BVH (Bounding Volume Hierarchy)
export { BVH } from "./data-structures/spatial/bvh";
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
} from "./data-structures/spatial/bvh";
export { BVHEventType } from "./data-structures/spatial/bvh";

// Quadtree
export { Quadtree } from "./data-structures/spatial/quadtree";
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
} from "./data-structures/spatial/quadtree";

// R-Tree
export { RTree } from "./data-structures/spatial/rtree/rtree-core";
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
} from "./data-structures/spatial/rtree/rtree-types";

// ============================================================================
// Algorithms - Computational Geometry
// ============================================================================
// Bresenham's Line Algorithm
export { BresenhamLine } from "./algorithms/computational-geometry/bresenham/bresenham-core";
export type {
  Point as BresenhamPoint,
  Pixel,
  BresenhamConfig,
  BresenhamResult,
  LineDrawingOptions,
  LineDrawingResult,
  MultiLineOptions,
  MultiLineResult,
} from "./algorithms/computational-geometry/bresenham/bresenham-types";

// Additional Line Algorithms
export { DDALine } from "./algorithms/computational-geometry/dda/dda-core";
export type { Point2D as DDAPoint, DDALineResult } from "./algorithms/computational-geometry/dda/dda-core";
export { SupercoverLine } from "./algorithms/computational-geometry/supercover/supercover-core";
export type {
  Point2D as SupercoverPoint,
  SupercoverLineResult,
} from "./algorithms/computational-geometry/supercover/supercover-core";

// Delaunay Triangulation
export { DelaunayTriangulation } from "./algorithms/computational-geometry/delaunay/delaunay-core";
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
} from "./algorithms/computational-geometry/delaunay/delaunay-types";

// Voronoi Diagram
export { VoronoiDiagram } from "./algorithms/computational-geometry/voronoi/voronoi-core";
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
} from "./algorithms/computational-geometry/voronoi/voronoi-types";

// Polygon Clipping
export { PolygonClipping } from "./algorithms/computational-geometry/polygon-clipping/polygon-clipping-core";
export { SutherlandHodgmanClipper } from "./algorithms/computational-geometry/polygon-clipping/sutherland-hodgman";
export { WeilerAthertonClipper } from "./algorithms/computational-geometry/polygon-clipping/weiler-atherton";
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
} from "./algorithms/computational-geometry/polygon-clipping/polygon-clipping-types";

// Line Segment Intersection
export { LineIntersection } from "./algorithms/computational-geometry/line-intersection/line-intersection-core";
export {
  SweepLineEventQueue,
  SweepLineStatusStructure,
  SweepLineUtils,
} from "./algorithms/computational-geometry/line-intersection/sweep-line";
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
} from "./algorithms/computational-geometry/line-intersection/line-intersection-types";

// Bezier Curves
export {
  evaluateQuadraticBezier,
  evaluateCubicBezier,
  derivativeQuadraticBezier,
  derivativeCubicBezier,
  evaluateQuadraticBezierFull,
  evaluateCubicBezierFull,
  generateQuadraticBezierPoints,
  generateCubicBezierPoints,
  quadraticToCubic,
} from "./algorithms/computational-geometry/splines/bezier-core";
export type {
  BezierConfig,
  BezierResult,
  QuadraticBezier,
  CubicBezier,
  BezierOptions,
  BezierEvaluation,
} from "./algorithms/computational-geometry/splines/bezier-types";

// Catmull-Rom Splines
export {
  evaluateCatmullRomSegment,
  derivativeCatmullRomSegment,
  evaluateCatmullRomSegmentFull,
  generateCatmullRomSpline,
  generateCatmullRomSVGPath,
} from "./algorithms/computational-geometry/splines/catmull-rom-core";
export type {
  CatmullRomConfig,
  CatmullRomResult,
  CatmullRomSegment,
  CatmullRomOptions,
  CatmullRomEvaluation,
} from "./algorithms/computational-geometry/splines/catmull-rom-types";

// Oriented Bounding Box (OBB)
export { OBB } from "./algorithms/collision/narrow-phase/obb/obb-core";
export { OBBUtils } from "./algorithms/collision/narrow-phase/obb/obb-utils";
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
} from "./algorithms/collision/narrow-phase/obb/obb-types";

// Minimum Bounding Box
export { MinimumBoundingBox } from "./algorithms/computational-geometry/minimum-bounding-box/minimum-bounding-box-core";
export { MinimumBoundingBoxUtils } from "./algorithms/computational-geometry/minimum-bounding-box/minimum-bounding-box-utils";
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
} from "./algorithms/computational-geometry/minimum-bounding-box/minimum-bounding-box-types";

// Convex Hull Algorithms
export { ConvexHull } from "./algorithms/computational-geometry/convex-hull/convex-hull-core";
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
} from "./algorithms/computational-geometry/convex-hull/convex-hull-types";

// ============================================================================
// Algorithms - Procedural Generation
// ============================================================================
// Marching Squares Algorithm
export { MarchingSquares } from "./algorithms/procedural-generation/marching-squares/marching-squares-core";
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
} from "./algorithms/procedural-generation/marching-squares/marching-squares-types";

// Simplex Noise Algorithm
export { SimplexNoise } from "./algorithms/procedural-generation/simplex-noise/simplex-noise-core";
export type {
  Point2D,
  Point3D as SimplexPoint3D,
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
} from "./algorithms/procedural-generation/simplex-noise/simplex-noise-types";

// Poisson Disk Sampling Algorithm
export { PoissonDisk } from "./algorithms/procedural-generation/poisson-disk/poisson-disk-core";
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
} from "./algorithms/procedural-generation/poisson-disk/poisson-disk-types";

// Wave Function Collapse Algorithm
export { WaveFunctionCollapse } from "./algorithms/procedural-generation/wave-function-collapse/wave-function-collapse-core";
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
} from "./algorithms/procedural-generation/wave-function-collapse/wave-function-collapse-types";

// ============================================================================
// Algorithms - Collision Detection
// ============================================================================
// AABB collision detection
export type {
  AABB as AABBCollision,
  CollisionPair,
  CollisionResult,
} from "./algorithms/collision/narrow-phase/aabb/aabb-types";
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
} from "./algorithms/collision/narrow-phase/aabb";

// Separating Axis Theorem (SAT) Collision Detection
export { SAT } from "./algorithms/collision/narrow-phase/sat/sat-core";
export type { Projection, SATCollisionResult } from "./algorithms/collision/narrow-phase/sat/sat-types";

// Sweep and Prune Broad-Phase Collision Detection
export { SweepPrune } from "./algorithms/collision/broad-phase/sweep-prune/sweep-prune-core";
export type {
  AABB as SweepPruneAABB,
  Endpoint,
  SweepPruneConfig,
  SweepPruneResult,
} from "./algorithms/collision/broad-phase/sweep-prune/sweep-prune-types";

// Spatial collision optimization
export { SpatialCollisionOptimizer } from "./algorithms/collision/optimization";

// ============================================================================
// Algorithms - Pathfinding
// ============================================================================
// A* Pathfinding Algorithm
export { AStar } from "./algorithms/pathfinding/astar";
export type { AStarNode, AStarConfig, AStarResult, AStarHeuristic } from "./algorithms/pathfinding/astar";
export { manhattanDistance, euclideanDistance, chebyshevDistance } from "./algorithms/pathfinding/astar";

// Jump Point Search (JPS)
export { JPS } from "./algorithms/pathfinding/jps/jps-core";
export { JPSUtils } from "./algorithms/pathfinding/jps/jps-utils";
export type {
  Point as JPSPoint,
  Vector as JPSVector,
  Direction,
  MovementType,
  CellType as JPSCellType,
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
} from "./algorithms/pathfinding/jps/jps-types";

// Theta* Any-Angle Pathfinding
export { ThetaStar, ThetaStarUtils, LineOfSight, CellType } from "./algorithms/pathfinding/theta-star";
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
} from "./algorithms/pathfinding/theta-star/theta-star-types";

// Visibility (Shadowcasting FOV)
export { shadowcastingFOV } from "./algorithms/pathfinding/visibility/shadowcasting";

// Flow Field Pathfinding
export { FlowField } from "./algorithms/pathfinding/flow-field/flow-field-core";
export { FlowFieldUtils } from "./algorithms/pathfinding/flow-field/flow-field-utils";
export { FlowFieldGenerator } from "./algorithms/pathfinding/flow-field/flow-field-generator";
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
} from "./algorithms/pathfinding/flow-field/flow-field-types";

// HPA* Hierarchical Pathfinding
export { HPAStar } from "./algorithms/pathfinding/hpa-star/hpa-star-core";
export { HPAStarUtils } from "./algorithms/pathfinding/hpa-star/hpa-star-utils";
export { HPAClustering } from "./algorithms/pathfinding/hpa-star/hpa-clustering";
export { HPAAbstractGraph } from "./algorithms/pathfinding/hpa-star/hpa-abstract-graph";
export { HPAPathRefinement } from "./algorithms/pathfinding/hpa-star/hpa-path-refinement";
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
} from "./algorithms/pathfinding/hpa-star/hpa-star-types";

// ============================================================================
// Utils - Performance
// ============================================================================
export { PerformanceTimer } from "./utils/performance/timer";
export { MemoryMonitor, MemoryLeakDetector } from "./utils/memory/memory";
export { PerformanceBenchmark, measureAsync, measureSync } from "./utils/performance/benchmark";
export { FrameRateMonitor } from "./utils/performance/framerate";
export { throttle, debounce } from "./utils/performance/throttle";
export { PerformanceBudgetChecker } from "./utils/performance/budget";

// ============================================================================
// Utils - Memory
// ============================================================================
export { MemoryPool } from "./utils/memory/memory-pool-core";
export type {
  PooledObject as MemoryPooledObject,
  PerformanceMemoryPoolConfig,
  PerformanceMemoryPoolStats,
} from "./utils/memory/memory-pool-core";
export * from "./utils/memory/memory-pool-utils";

// ============================================================================
// Utils - Memoization
// ============================================================================
export {
  memoize,
  memoizeMath,
  memoizeGeometry,
  weakMemoize,
  batchMemoize,
  MathMemo,
  clearMathMemo,
  getMathMemoStats,
} from "./utils/memoization";
export type { MemoizationConfig, MemoizedResult, MemoizationStats } from "./utils/memoization";

// ============================================================================
// Optimization Framework
// ============================================================================
export {
  detectCollisions,
  performSpatialQuery,
  PerformanceMonitor,
  OptimizationConfig,
  configureOptimization,
  cleanup,
} from "./optimized";
