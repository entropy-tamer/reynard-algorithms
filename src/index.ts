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
  AABB,
  AABB3D,
  BoundingBox,
  BoundingBox3D,
  Circle,
  CollisionData,
  CollisionObjectData,
  DebouncedFunction,
  DebounceOptions,
  ExtendedGlobal,
  ExtendedPerformance,
  Frustum3D,
  FunctionSignature,
  GameEntityData,
  Line,
  MemoryPoolConfig,
  MutablePoint,
  MutablePoint3D,
  MutableVector,
  MutableVector3D,
  PerformanceMemoryAPI,
  // Performance types
  PerformanceMemoryInfo,
  Plane3D,
  Point,
  Point3D,
  Polygon,
  PooledObject,
  Ray3D,
  Rectangle,
  RenderData,
  // Spatial types
  SpatialData,
  SpatialDataType,
  SpatialHashConfig,
  SpatialHashStats,
  SpatialObject,
  SpatialObjectData,
  SpatialQueryResult,
  Sphere3D,
  ThrottledFunction,
  ThrottleOptions,
  Transform,
  Vector,
  Vector3D,
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
export type { UnionFindNode, UnionFindStats } from "./data-structures/basic/union-find/union-find-types";

// Priority Queue / Binary Heap
export { PriorityQueue } from "./data-structures/basic/priority-queue";
export type {
  PriorityQueueBatchResult,
  PriorityQueueComparator,
  PriorityQueueConfig,
  PriorityQueueEvent,
  PriorityQueueEventHandler,
  PriorityQueueEventType,
  PriorityQueueIteratorResult,
  PriorityQueueNode,
  PriorityQueueOptions,
  PriorityQueuePeekResult,
  PriorityQueueStats,
} from "./data-structures/basic/priority-queue";

// LRU Cache
export { LRUCache } from "./data-structures/basic/lru-cache";
export type {
  LRUCacheBatchResult,
  LRUCacheConfig,
  LRUCacheEntry,
  LRUCacheEvent,
  LRUCacheEventHandler,
  LRUCacheEventType,
  LRUCacheIteratorResult,
  LRUCacheNode,
  LRUCacheOptions,
  LRUCachePerformanceMetrics,
  LRUCacheSnapshot,
  LRUCacheStats,
} from "./data-structures/basic/lru-cache";

// Trie (Prefix Tree)
export { Trie } from "./data-structures/basic/trie/trie-core";
export type { TrieConfig, TrieNode, TrieSearchResult } from "./data-structures/basic/trie/trie-types";

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
  IntervalTreeConfig,
  IntervalTreeNode,
  IntervalTreeStats,
} from "./data-structures/trees/interval-tree/interval-tree-types";

// Segment Tree
export { SegmentTree } from "./data-structures/trees/segment-tree/segment-tree-core";
export type {
  SegmentTreeConfig,
  SegmentTreeNode,
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
export { KdTree, KdTreeEventType } from "./data-structures/spatial/kdtree";
export type {
  KdNode,
  BatchOperationResult as KdTreeBatchOperationResult,
  BoundingBox as KdTreeBoundingBox,
  KdTreeConfig,
  KdTreeEvent,
  KdTreeEventHandler,
  KdTreeOptions,
  KdTreePerformanceMetrics,
  Point as KdTreePoint,
  Point2D as KdTreePoint2D,
  Point3D as KdTreePoint3D,
  KdTreeResult,
  KdTreeSerialization,
  KdTreeStats,
  KNearestNeighborsOptions,
  KNearestNeighborsResult,
  NearestNeighborOptions,
  NearestNeighborResult,
  RangeQueryOptions,
  RangeQueryResult,
} from "./data-structures/spatial/kdtree";

// Octree
export { Octant, Octree, OctreeEventType } from "./data-structures/spatial/octree";
export type {
  Bounds3D,
  BatchOperationResult as OctreeBatchOperationResult,
  OctreeConfig,
  OctreeEvent,
  OctreeEventHandler,
  Frustum3D as OctreeFrustum3D,
  FrustumCullingOptions as OctreeFrustumCullingOptions,
  FrustumCullingResult as OctreeFrustumCullingResult,
  OctreeNode,
  OctreeOptions,
  OctreePerformanceMetrics,
  Point3D as OctreePoint3D,
  Ray3D as OctreeRay3D,
  RayIntersectionOptions as OctreeRayIntersectionOptions,
  RayIntersectionResult as OctreeRayIntersectionResult,
  OctreeResult,
  OctreeSerialization,
  SpatialQueryResult as OctreeSpatialQueryResult,
  Sphere3D as OctreeSphere3D,
  OctreeStats,
  SpatialQueryOptions,
  Voxel,
  VoxelGrid,
} from "./data-structures/spatial/octree";

// BVH (Bounding Volume Hierarchy)
export { BVH, BVHEventType } from "./data-structures/spatial/bvh";
export type {
  AABBIntersectionOptions,
  AABBIntersectionResult,
  AABB as BVHAABB,
  BatchOperationResult as BVHBatchOperationResult,
  BVHBuildConfig,
  BVHEvent,
  BVHEventHandler,
  BVHNode,
  BVHOptions,
  BVHPerformanceMetrics,
  Ray3D as BVHRay3D,
  RayIntersectionOptions as BVHRayIntersectionOptions,
  RayIntersectionResult as BVHRayIntersectionResult,
  BVHResult,
  BVHSerialization,
  BVHStats,
  Triangle as BVHTriangle,
  Primitive,
  SAHSplitCandidate,
  TraversalStack,
} from "./data-structures/spatial/bvh";

// Quadtree
export { Quadtree } from "./data-structures/spatial/quadtree";
export type {
  CircleQuery,
  PointQuery,
  QuadtreeCollisionResult,
  QuadtreeConfig,
  QuadtreeData,
  QuadtreeEvent,
  QuadtreeEventHandler,
  QuadtreeEventType,
  QuadtreeNearestNeighborResult,
  QuadtreeNode,
  QuadtreeOptions,
  QuadtreePerformanceMetrics,
  Point as QuadtreePoint,
  QuadtreeQueryResult,
  Rectangle as QuadtreeRectangle,
  QuadtreeStats,
  QuadtreeTraversalResult,
  RectangleQuery,
} from "./data-structures/spatial/quadtree";

// R-Tree
export { RTree } from "./data-structures/spatial/rtree/rtree-core";
export type {
  RTreeConfig,
  RTreeDeleteResult,
  RTreeEntry,
  RTreeInsertResult,
  RTreeNode,
  Point as RTreePoint,
  RTreeQueryOptions,
  RTreeQueryResult,
  Rectangle as RTreeRectangle,
  RTreeStats,
} from "./data-structures/spatial/rtree/rtree-types";

// ============================================================================
// Algorithms - Computational Geometry
// ============================================================================
// Bresenham's Line Algorithm
export { BresenhamLine } from "./algorithms/computational-geometry/bresenham/bresenham-core";
export type {
  BresenhamConfig,
  Point as BresenhamPoint,
  BresenhamResult,
  LineDrawingOptions,
  LineDrawingResult,
  MultiLineOptions,
  MultiLineResult,
  Pixel,
} from "./algorithms/computational-geometry/bresenham/bresenham-types";

// Additional Line Algorithms
export { DDALine } from "./algorithms/computational-geometry/dda/dda-core";
export type { DDALineResult, Point2D as DDAPoint } from "./algorithms/computational-geometry/dda/dda-core";
export { SupercoverLine } from "./algorithms/computational-geometry/supercover/supercover-core";
export type {
  SupercoverLineResult,
  Point2D as SupercoverPoint,
} from "./algorithms/computational-geometry/supercover/supercover-core";

// Delaunay Triangulation
export { DelaunayTriangulation } from "./algorithms/computational-geometry/delaunay/delaunay-core";
export type {
  Circumcircle,
  ConstrainedDelaunayOptions,
  ConstrainedDelaunayResult,
  DelaunayConfig,
  Edge as DelaunayEdge,
  Point as DelaunayPoint,
  DelaunayResult,
  DelaunayStats,
  Triangle as DelaunayTriangle,
  Mesh,
  MeshGenerationOptions,
  TriangulationQueryOptions,
  TriangulationQueryResult,
} from "./algorithms/computational-geometry/delaunay/delaunay-types";

// Voronoi Diagram
export { VoronoiDiagram } from "./algorithms/computational-geometry/voronoi/voronoi-core";
export type {
  LloydRelaxationOptions,
  LloydRelaxationResult,
  VoronoiCell,
  VoronoiConfig,
  VoronoiEdge,
  VoronoiQueryOptions,
  VoronoiQueryResult,
  VoronoiResult,
  VoronoiSerialization,
  VoronoiSerializationOptions,
  VoronoiStats,
  VoronoiVertex,
} from "./algorithms/computational-geometry/voronoi/voronoi-types";

// Polygon Clipping
export { PolygonClipping } from "./algorithms/computational-geometry/polygon-clipping/polygon-clipping-core";
export type {
  ClipOperation,
  ClippingPlane,
  ClippingStats,
  ClipResult,
  PolygonClippingConfig,
  LineSegment as PolygonClippingLineSegment,
  Point as PolygonClippingPoint,
  Polygon as PolygonClippingPolygon,
  PolygonSimplificationOptions as PolygonClippingSimplificationOptions,
  Vector as PolygonClippingVector,
  PolygonSerialization,
  PolygonSerializationOptions,
  PolygonValidationOptions,
  PolygonValidationResult,
  SutherlandHodgmanOptions,
  WAEdge,
  WAPolygon,
  WAVertex,
  WeilerAthertonOptions,
} from "./algorithms/computational-geometry/polygon-clipping/polygon-clipping-types";
export { SutherlandHodgmanClipper } from "./algorithms/computational-geometry/polygon-clipping/sutherland-hodgman";
export { WeilerAthertonClipper } from "./algorithms/computational-geometry/polygon-clipping/weiler-atherton";

// Polygon Simplification
export {
  PolygonSimplifier,
  simplifyPolygon,
} from "./algorithms/computational-geometry/polygon/polygon-simplification-core";
export type {
  PolygonSimplificationConfig,
  PolygonSimplificationOptions,
  PolygonSimplificationResult,
  SimplificationAlgorithm,
} from "./algorithms/computational-geometry/polygon/polygon-simplification-types";

// Polygon Boolean Operations
export {
  BooleanOperation,
  performPolygonBoolean,
  PolygonBooleanOps,
} from "./algorithms/computational-geometry/polygon/polygon-boolean-core";
export type {
  PolygonBooleanConfig,
  PolygonBooleanOptions,
  Polygon as PolygonBooleanPolygon,
  PolygonBooleanResult,
} from "./algorithms/computational-geometry/polygon/polygon-boolean-types";

// Line Segment Intersection
export { LineIntersection } from "./algorithms/computational-geometry/line-intersection/line-intersection-core";
export type {
  EventQueue,
  IntersectionFilterOptions,
  IntersectionPoint,
  IntersectionQueryOptions,
  IntersectionQueryResult,
  IntersectionSerialization,
  IntersectionSerializationOptions,
  LineIntersectionConfig,
  LineSegment as LineIntersectionLineSegment,
  Point as LineIntersectionPoint,
  LineIntersectionResult,
  LineIntersectionStats,
  PerformanceOptions,
  SegmentValidationOptions,
  SegmentValidationResult,
  StatusNode,
  StatusStructure,
  SweepLineEvent,
} from "./algorithms/computational-geometry/line-intersection/line-intersection-types";
export {
  SweepLineEventQueue,
  SweepLineStatusStructure,
  SweepLineUtils,
} from "./algorithms/computational-geometry/line-intersection/sweep-line";

// Bezier Curves
export {
  derivativeCubicBezier,
  derivativeQuadraticBezier,
  evaluateCubicBezier,
  evaluateCubicBezierFull,
  evaluateQuadraticBezier,
  evaluateQuadraticBezierFull,
  generateCubicBezierPoints,
  generateQuadraticBezierPoints,
  quadraticToCubic,
} from "./algorithms/computational-geometry/splines/bezier-core";
export type {
  BezierConfig,
  BezierEvaluation,
  BezierOptions,
  BezierResult,
  CubicBezier,
  QuadraticBezier,
} from "./algorithms/computational-geometry/splines/bezier-types";

// Catmull-Rom Splines
export {
  derivativeCatmullRomSegment,
  evaluateCatmullRomSegment,
  evaluateCatmullRomSegmentFull,
  generateCatmullRomSpline,
  generateCatmullRomSVGPath,
} from "./algorithms/computational-geometry/splines/catmull-rom-core";
export type {
  CatmullRomConfig,
  CatmullRomEvaluation,
  CatmullRomOptions,
  CatmullRomResult,
  CatmullRomSegment,
} from "./algorithms/computational-geometry/splines/catmull-rom-types";

// B-Splines
export {
  basisFunction,
  BSplineCurve,
  evaluateBSpline,
  evaluateBSplineFull,
  generateBSplinePoints,
  generateNonUniformKnotVector,
  generateUniformKnotVector,
} from "./algorithms/computational-geometry/splines/b-spline-core";
export type {
  BSpline,
  BSplineConfig,
  BSplineEvaluation,
  BSplineOptions,
  BSplineResult,
  KnotVectorOptions,
} from "./algorithms/computational-geometry/splines/b-spline-types";

// NURBS
export {
  evaluateNURBS,
  evaluateNURBSFull,
  generateNURBSPoints,
  NURBSCurve,
} from "./algorithms/computational-geometry/splines/nurbs-core";
export type {
  NURBS,
  NURBSConfig,
  NURBSEvaluation,
  NURBSOptions,
  NURBSResult,
} from "./algorithms/computational-geometry/splines/nurbs-types";

// Hermite Splines
export {
  createHermiteSegments,
  derivativeHermiteSegment,
  evaluateHermiteSegment,
  evaluateHermiteSegmentFull,
  generateHermiteSpline,
  HermiteSpline,
} from "./algorithms/computational-geometry/splines/hermite-core";
export type {
  HermiteConfig,
  HermiteEvaluation,
  HermiteOptions,
  HermiteResult,
  HermiteSegment,
} from "./algorithms/computational-geometry/splines/hermite-types";

// Oriented Bounding Box (OBB)
export { OBB } from "./algorithms/collision/narrow-phase/obb/obb-core";
export type {
  OBBCollisionResult,
  OBBConfig,
  OBBConstructionOptions,
  OBBConstructionResult,
  OBBContainmentOptions,
  OBBContainmentResult,
  OBBIntersectionOptions,
  OBBIntersectionResult,
  Point as OBBPoint,
  OBBPointTestResult,
  OBBSerialization,
  OBBSerializationOptions,
  OBBStats,
  OBBTransformOptions,
  OBBTransformResult,
  OBBData as OBBType,
  OBBValidationOptions,
  OBBValidationResult,
  Vector as OBBVector,
  SATOptions,
} from "./algorithms/collision/narrow-phase/obb/obb-types";
export { OBBUtils } from "./algorithms/collision/narrow-phase/obb/obb-utils";

// Minimum Bounding Box
export { MinimumBoundingBox } from "./algorithms/computational-geometry/minimum-bounding-box/minimum-bounding-box-core";
export type {
  BoundingBoxComparisonOptions,
  BoundingBoxComparisonResult,
  ConvexHullOptions,
  MinimumBoundingBoxConfig,
  MinimumBoundingBoxOptimizationOptions,
  MinimumBoundingBoxOptimizationResult,
  MinimumBoundingBoxOptions,
  Point as MinimumBoundingBoxPoint,
  Rectangle as MinimumBoundingBoxRectangle,
  MinimumBoundingBoxResult,
  MinimumBoundingBoxSerialization,
  MinimumBoundingBoxSerializationOptions,
  MinimumBoundingBoxStats,
  MinimumBoundingBoxValidationOptions,
  MinimumBoundingBoxValidationResult,
  Vector as MinimumBoundingBoxVector,
  RotatingCalipersOptions,
} from "./algorithms/computational-geometry/minimum-bounding-box/minimum-bounding-box-types";
export { MinimumBoundingBoxUtils } from "./algorithms/computational-geometry/minimum-bounding-box/minimum-bounding-box-utils";

// Convex Hull Algorithms
export { ConvexHull } from "./algorithms/computational-geometry/convex-hull/convex-hull-core";
export type {
  ConvexHullAlgorithm,
  ConvexHullConfig,
  Point as ConvexHullPoint,
  ConvexHullResult,
  ConvexHullStats,
  Vector as ConvexHullVector,
  HullAnalysis,
  HullAnalysisOptions,
  HullComparison,
  HullComparisonOptions,
  HullEdge,
  HullSimplificationOptions,
  HullSimplificationResult,
} from "./algorithms/computational-geometry/convex-hull/convex-hull-types";

// Circular Positioning
export {
  calculateArcLength,
  calculateCircularPosition,
  calculateCircularPositionFull,
  calculateRadialPositions,
  calculateSectorArea,
  degreesToRadians,
  normalizeAngle,
  radiansToDegrees,
} from "./algorithms/computational-geometry/circular";
export type {
  CircularPositionOptions,
  CircularPositionResult,
  RadialDistributionOptions,
} from "./algorithms/computational-geometry/circular";

// Marching Squares Algorithm
export { MarchingSquares } from "./algorithms/computational-geometry/marching-squares/marching-squares-core";
export type {
  Point as MarchingSquaresPoint,
  LineSegment as MarchingSquaresLineSegment,
  MarchingCell,
  MarchingSquaresConfig,
  MarchingSquaresResult,
  MarchingSquaresStats,
  MarchingSquaresQueryOptions,
  MarchingSquaresQueryResult,
  Contour,
} from "./algorithms/computational-geometry/marching-squares/marching-squares-types";

// ============================================================================
// Algorithms - Procedural Generation
// ============================================================================

// Simplex Noise Algorithm
export { SimplexNoise } from "./algorithms/procedural-generation/simplex-noise/simplex-noise-core";
export {
  generateMultiscaleNoise2D as generateMultiscaleSimplexNoise2D,
  generateMultiscaleNoise3D as generateMultiscaleSimplexNoise3D,
  generateMultiscaleNoise4D as generateMultiscaleSimplexNoise4D,
} from "./algorithms/procedural-generation/simplex-noise/simplex-noise-multiscale";
export type {
  FractalNoiseOptions,
  MultiscaleSimplexNoiseOptions,
  MultiscaleSimplexNoiseResult,
  Noise2DOptions,
  Noise3DOptions,
  Noise4DOptions,
  NoiseAnalysis,
  NoiseAnalysisOptions,
  NoiseFilterOptions,
  NoiseFilterResult,
  NoiseResult,
  NoiseStats,
  Point2D,
  Point4D,
  MultiscaleCombinationMode as SimplexMultiscaleCombinationMode,
  SimplexNoiseConfig,
  Point3D as SimplexPoint3D,
  ScaleDefinition as SimplexScaleDefinition,
  ScaleStats as SimplexScaleStats,
} from "./algorithms/procedural-generation/simplex-noise/simplex-noise-types";

// Perlin Noise Algorithm
export {
  fractalPerlinNoise2D,
  PerlinNoise,
  perlinNoise2D,
  perlinNoise3D,
} from "./algorithms/procedural-generation/perlin-noise/perlin-noise-core";
export {
  generateMultiscaleNoise2D,
  generateMultiscaleNoise3D,
} from "./algorithms/procedural-generation/perlin-noise/perlin-noise-multiscale";
export type {
  FractalPerlinNoiseOptions,
  MultiscalePerlinNoiseOptions,
  MultiscalePerlinNoiseResult,
  MultiscaleCombinationMode as PerlinMultiscaleCombinationMode,
  PerlinNoiseConfig,
  PerlinNoiseOptions,
  PerlinNoiseResult,
  PerlinNoiseStats,
  ScaleDefinition as PerlinScaleDefinition,
  ScaleStats as PerlinScaleStats,
} from "./algorithms/procedural-generation/perlin-noise/perlin-noise-types";

// Poisson Disk Sampling Algorithm
export { PoissonDisk } from "./algorithms/procedural-generation/poisson-disk/poisson-disk-core";
export type {
  AdaptivePoissonDiskOptions,
  AdaptivePoissonDiskResult,
  ConstrainedPoissonDiskOptions,
  ConstrainedPoissonDiskResult,
  PoissonDisk2DOptions,
  PoissonDisk3DOptions,
  PoissonDiskAnalysis,
  PoissonDiskAnalysisOptions,
  PoissonDiskConfig,
  Point2D as PoissonDiskPoint2D,
  Point3D as PoissonDiskPoint3D,
  PoissonDiskResult,
  PoissonDiskStats,
} from "./algorithms/procedural-generation/poisson-disk/poisson-disk-types";

// Wave Function Collapse Algorithm
export { WaveFunctionCollapse } from "./algorithms/procedural-generation/wave-function-collapse/wave-function-collapse-core";
export type {
  Cell,
  Constraint,
  ConstraintBasedWaveFunctionCollapseOptions,
  ConstraintBasedWaveFunctionCollapseResult,
  Direction2D,
  Direction3D,
  MultiScaleWaveFunctionCollapseOptions,
  MultiScaleWaveFunctionCollapseResult,
  Pattern,
  Tile,
  TileSymmetry,
  WaveFunctionCollapse2DOptions,
  WaveFunctionCollapse3DOptions,
  WaveFunctionCollapseAnalysis,
  WaveFunctionCollapseAnalysisOptions,
  WaveFunctionCollapseConfig,
  Position2D as WaveFunctionCollapsePosition2D,
  Position3D as WaveFunctionCollapsePosition3D,
  WaveFunctionCollapseResult,
  WaveFunctionCollapseStats,
  WaveFunctionCollapseTrainingOptions,
  WaveFunctionCollapseTrainingResult,
} from "./algorithms/procedural-generation/wave-function-collapse/wave-function-collapse-types";

// StructureForge Algorithm
export { StructureForge } from "./algorithms/procedural-generation/structure-forge/structure-forge-core";
export {
  createBuildingConfig,
  createTowerConfig,
  createMazeConfig,
  createDungeonConfig,
} from "./algorithms/procedural-generation/structure-forge";
export type {
  StructureType,
  MaterialType,
  CellType,
  StructureCell,
  LayerPattern,
  PatternConstraint,
  StructureConfig,
  GenerationResult,
  StructureForgeOptions,
} from "./algorithms/procedural-generation/structure-forge";

// ============================================================================
// Algorithms - Collision Detection
// ============================================================================
// AABB collision detection
export {
  areAABBsTouching,
  batchCollisionDetection,
  batchCollisionWithSpatialHash,
  checkCollision,
  containsAABB,
  expandAABB,
  intersectionAABB,
  pointInAABB,
  unionAABB,
} from "./algorithms/collision/narrow-phase/aabb";
export type {
  AABB as AABBCollision,
  CollisionPair,
  CollisionResult,
} from "./algorithms/collision/narrow-phase/aabb/aabb-types";

// Separating Axis Theorem (SAT) Collision Detection
export { SAT } from "./algorithms/collision/narrow-phase/sat/sat-core";
export type { Projection, SATCollisionResult } from "./algorithms/collision/narrow-phase/sat/sat-types";

// Sweep and Prune Broad-Phase Collision Detection
export { SweepPrune } from "./algorithms/collision/broad-phase/sweep-prune/sweep-prune-core";
export type {
  Endpoint,
  AABB as SweepPruneAABB,
  SweepPruneConfig,
  SweepPruneResult,
} from "./algorithms/collision/broad-phase/sweep-prune/sweep-prune-types";

// Spatial collision optimization
export { SpatialCollisionOptimizer } from "./algorithms/collision/optimization";

// ============================================================================
// Algorithms - Pathfinding
// ============================================================================
// A* Pathfinding Algorithm
export { AStar, chebyshevDistance, euclideanDistance, manhattanDistance } from "./algorithms/pathfinding/astar";
export type { AStarConfig, AStarHeuristic, AStarNode, AStarResult } from "./algorithms/pathfinding/astar";

// Jump Point Search (JPS)
export { JPS } from "./algorithms/pathfinding/jps/jps-core";
export type {
  Direction,
  GridCell,
  GridValidationOptions,
  GridValidationResult,
  CellType as JPSCellType,
  JPSConfig,
  JPSOptions,
  JPSPerformanceOptions,
  JPSPerformanceResult,
  JPSPlusOptions,
  JPSPlusResult,
  Point as JPSPoint,
  JPSResult,
  JPSSerialization,
  JPSSerializationOptions,
  JPSStats,
  Vector as JPSVector,
  JumpPoint,
  JumpPointOptions,
  MovementType,
  PathComparisonOptions,
  PathComparisonResult,
  PathOptimizationOptions,
  PathOptimizationResult,
} from "./algorithms/pathfinding/jps/jps-types";
export { JPSUtils } from "./algorithms/pathfinding/jps/jps-utils";

// Theta* Any-Angle Pathfinding
export { CellType, LineOfSight, ThetaStar, ThetaStarUtils } from "./algorithms/pathfinding/theta-star";
export type {
  LazyEvaluationOptions,
  LazyEvaluationResult,
  LineOfSightOptions,
  LineOfSightResult,
  CellType as ThetaStarCellType,
  ThetaStarConfig,
  Direction as ThetaStarDirection,
  GridCell as ThetaStarGridCell,
  GridValidationOptions as ThetaStarGridValidationOptions,
  GridValidationResult as ThetaStarGridValidationResult,
  MovementType as ThetaStarMovementType,
  ThetaStarNode,
  ThetaStarOptions,
  PathComparisonOptions as ThetaStarPathComparisonOptions,
  PathComparisonResult as ThetaStarPathComparisonResult,
  PathOptimizationOptions as ThetaStarPathOptimizationOptions,
  PathOptimizationResult as ThetaStarPathOptimizationResult,
  Point as ThetaStarPoint,
  ThetaStarResult,
  ThetaStarSerialization,
  ThetaStarSerializationOptions,
  ThetaStarStats,
  Vector as ThetaStarVector,
} from "./algorithms/pathfinding/theta-star/theta-star-types";

// Visibility (Shadowcasting FOV)
export { shadowcastingFOV } from "./algorithms/pathfinding/visibility/shadowcasting";

// Flow Field Pathfinding
export { FlowField } from "./algorithms/pathfinding/flow-field/flow-field-core";
export { FlowFieldGenerator } from "./algorithms/pathfinding/flow-field/flow-field-generator";
export type {
  AgentPathfindingOptions,
  AgentPathfindingResult,
  CrowdSimulationOptions,
  CrowdSimulationResult,
  DynamicObstacleOptions,
  DynamicObstacleResult,
  FlowCell,
  CellType as FlowFieldCellType,
  FlowFieldComparisonOptions,
  FlowFieldComparisonResult,
  FlowFieldConfig,
  GridCell as FlowFieldGridCell,
  FlowFieldOptions,
  FlowFieldPerformanceOptions,
  FlowFieldPerformanceResult,
  Point as FlowFieldPoint,
  FlowFieldResult,
  FlowFieldSerialization,
  FlowFieldSerializationOptions,
  FlowFieldStats,
  FlowFieldValidationOptions,
  FlowFieldValidationResult,
  Vector as FlowFieldVector,
  IntegrationCell,
  MultiGoalOptions,
  MultiGoalResult,
} from "./algorithms/pathfinding/flow-field/flow-field-types";
export { FlowFieldUtils } from "./algorithms/pathfinding/flow-field/flow-field-utils";

// HPA* Hierarchical Pathfinding
export { HPAAbstractGraph } from "./algorithms/pathfinding/hpa-star/hpa-abstract-graph";
export { HPAClustering } from "./algorithms/pathfinding/hpa-star/hpa-clustering";
export { HPAPathRefinement } from "./algorithms/pathfinding/hpa-star/hpa-path-refinement";
export { HPAStar } from "./algorithms/pathfinding/hpa-star/hpa-star-core";
export type {
  AbstractEdge,
  AbstractGraphOptions,
  AbstractNode,
  Cluster,
  ClusterGenerationOptions,
  Entrance,
  EntranceDetectionOptions,
  HPAComparisonOptions,
  HPAComparisonResult,
  HPAConfig,
  HPAOptions,
  HPAPerformanceOptions,
  HPAPerformanceResult,
  HPAResult,
  HPASerialization,
  HPASerializationOptions,
  CellType as HPAStarCellType,
  Point as HPAStarPoint,
  HPAStats,
  HPAValidationOptions,
  HPAValidationResult,
  PathRefinementOptions,
} from "./algorithms/pathfinding/hpa-star/hpa-star-types";
export { HPAStarUtils } from "./algorithms/pathfinding/hpa-star/hpa-star-utils";

// ============================================================================
// Algorithms - Graph Layout
// ============================================================================
// Force-Directed Graph Layout
export {
  ForceDirectedAlgorithm,
  ForceDirectedLayout,
  performForceDirectedLayout,
} from "./algorithms/graph/force-directed-core";
export type {
  ForceDirectedConfig,
  ForceDirectedOptions,
  ForceDirectedResult,
  Graph,
  GraphEdge,
  GraphNode,
} from "./algorithms/graph/force-directed-types";

// ============================================================================
// Algorithms - Machine Learning - Dimensionality Reduction
// ============================================================================
// Isomap
export { Isomap } from "./algorithms/machine-learning/dimensionality-reduction/isomap";
export { DEFAULT_ISOMAP_CONFIG } from "./algorithms/machine-learning/dimensionality-reduction/isomap/isomap-types";
export type {
  IsomapConfig,
  IsomapOptions,
  IsomapResult,
} from "./algorithms/machine-learning/dimensionality-reduction/isomap/isomap-types";

// PCA
export { PCA } from "./algorithms/machine-learning/dimensionality-reduction/pca";
export { DEFAULT_PCA_CONFIG } from "./algorithms/machine-learning/dimensionality-reduction/pca/pca-types";
export type {
  PCAConfig,
  PCAOptions,
  PCAResult,
} from "./algorithms/machine-learning/dimensionality-reduction/pca/pca-types";

// MDS
export { MDS } from "./algorithms/machine-learning/dimensionality-reduction/mds";
export { DEFAULT_MDS_CONFIG } from "./algorithms/machine-learning/dimensionality-reduction/mds/mds-types";
export type {
  MDSConfig,
  MDSOptions,
  MDSResult,
} from "./algorithms/machine-learning/dimensionality-reduction/mds/mds-types";

// ============================================================================
// Algorithms - Signal Processing
// ============================================================================
// Fast Fourier Transform (FFT)
export { BitReversal } from "./algorithms/signal-processing/fft/core/bit-reversal";
export { ComplexArrayOps, ComplexNumber } from "./algorithms/signal-processing/fft/core/complex-number";
export { OptimizedTwiddleFactors, TwiddleFactors } from "./algorithms/signal-processing/fft/core/twiddle-factors";
export { FFTBase } from "./algorithms/signal-processing/fft/fft-base";
export { FFTFactory } from "./algorithms/signal-processing/fft/fft-factory";
export {
  FFTAlgorithm,
  FFTCoefficientStrategy,
  FFTNormalizationMode,
} from "./algorithms/signal-processing/fft/fft-types";
export type {
  ComplexArray,
  DSPStats,
  FFTConfig,
  FFTPerformanceMetrics,
  FFTResult,
  FFTValidationWarning,
  FrequencyBin,
  HarmonicCoefficients,
} from "./algorithms/signal-processing/fft/fft-types";
export { MixedRadixFFT } from "./algorithms/signal-processing/fft/mixed-radix-fft";
export { Radix2FFT } from "./algorithms/signal-processing/fft/radix2-fft";
export { Radix4FFT } from "./algorithms/signal-processing/fft/radix4-fft";
export { RealFFT } from "./algorithms/signal-processing/fft/real-fft";

// Discrete Cosine Transform (DCT)
export {
  DCTBase,
  DCTFactory,
  DCTType,
  DCTTypeI,
  DCTTypeII,
  DCTTypeIII,
  DCTTypeIV,
} from "./algorithms/signal-processing/fft/dct";
export type { DCTConfig, DCTResult } from "./algorithms/signal-processing/fft/dct";

// Discrete Sine Transform (DST)
export {
  DSTBase,
  DSTFactory,
  DSTType,
  DSTTypeI,
  DSTTypeII,
  DSTTypeIII,
  DSTTypeIV,
} from "./algorithms/signal-processing/fft/dst";
export type { DSTConfig, DSTResult } from "./algorithms/signal-processing/fft/dst";

// ============================================================================
// Utils - Performance
// ============================================================================
export { MemoryLeakDetector, MemoryMonitor } from "./utils/memory/memory";
export { measureAsync, measureSync, PerformanceBenchmark } from "./utils/performance/benchmark";
export { PerformanceBudgetChecker } from "./utils/performance/budget";
export { FrameRateMonitor } from "./utils/performance/framerate";
export { debounce, throttle } from "./utils/performance/throttle";
export { PerformanceTimer } from "./utils/performance/timer";

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
  batchMemoize,
  clearMathMemo,
  getMathMemoStats,
  MathMemo,
  memoize,
  memoizeGeometry,
  memoizeMath,
  weakMemoize,
} from "./utils/memoization";
export type { MemoizationConfig, MemoizationStats, MemoizedResult } from "./utils/memoization";

// ============================================================================
// Optimization Framework
// ============================================================================
export {
  cleanup,
  configureOptimization,
  detectCollisions,
  OptimizationConfig,
  PerformanceMonitor,
  performSpatialQuery,
} from "./optimized";

// PAW Optimization Adapters
export { OptimizedMarchingSquaresAdapter } from "./optimization/adapters/optimized-marching-squares-adapter";
export type {
  MarchingSquaresPerformanceStats,
  OptimizedMarchingSquaresConfig,
} from "./optimization/adapters/optimized-marching-squares-adapter";

// ============================================================================
// Algorithms - Machine Learning - Clustering
// ============================================================================
// K-Means Clustering
export { KMeans } from "./algorithms/machine-learning/clustering";
export type {
  ElbowMethodResult,
  KMeansConfig,
  KMeansOptions,
  KMeansResult,
  KMeansStats,
  SilhouetteAnalysis,
} from "./algorithms/machine-learning/clustering";

// ============================================================================
// Algorithms - Machine Learning - Markov Chains
// ============================================================================
// Markov Chains and Hidden Markov Models
export { HiddenMarkovModel, MarkovChain } from "./algorithms/machine-learning/markov-chains";
export type {
  HMMConfig,
  HMMForwardResult,
  HMMViterbiResult,
  MarkovChainConfig,
  MarkovChainResult,
  State,
  TransitionMatrix,
} from "./algorithms/machine-learning/markov-chains";

// ============================================================================
// Algorithms - Machine Learning - Decision Trees
// ============================================================================
// Decision Trees
export { DecisionTree } from "./algorithms/machine-learning/decision-trees";
export type {
  DataPoint,
  DecisionTreeConfig,
  DecisionTreeNode,
  DecisionTreeResult,
  FeatureValue,
} from "./algorithms/machine-learning/decision-trees";

// ============================================================================
// Algorithms - Machine Learning - Behavior Trees
// ============================================================================
// Behavior Trees
export { BehaviorTree } from "./algorithms/machine-learning/behavior-trees";
export type {
  BehaviorTreeConfig,
  BehaviorTreeNode,
  BehaviorTreeResult,
  Blackboard,
  NodeStatus,
  NodeType,
} from "./algorithms/machine-learning/behavior-trees";

// ============================================================================
// Algorithms - Machine Learning - NEAT
// ============================================================================
// NEAT (NeuroEvolution of Augmenting Topologies)
export { NEAT } from "./algorithms/machine-learning/neat";
export type {
  Connection,
  Genome,
  NEATConfig,
  NEATEvolutionResult,
  Node as NEATNode,
} from "./algorithms/machine-learning/neat";

// ============================================================================
// Algorithms - Machine Learning - Reinforcement Learning
// ============================================================================
// Q-Learning and DQN
export { DQN, QLearning } from "./algorithms/machine-learning/reinforcement-learning";
export type {
  Action,
  DQNConfig,
  Experience,
  QLearningConfig,
  QLearningResult,
  State as RLState,
} from "./algorithms/machine-learning/reinforcement-learning";

// ============================================================================
// Algorithms - Game Mechanics - Steering Behaviors
// ============================================================================
// Steering Behaviors (Boids/Flocking)
export { SteeringBehaviors } from "./algorithms/game-mechanics/steering-behaviors";
export type {
  Agent,
  EvasionParams,
  FleeParams,
  FlockingParams,
  ObstacleAvoidanceParams,
  PursuitParams,
  SeekParams,
  SteeringBehaviorsConfig,
  SteeringForce,
  SteeringOptions,
  WanderParams,
} from "./algorithms/game-mechanics/steering-behaviors";

// ============================================================================
// Algorithms - Game Mechanics - Inverse Kinematics
// ============================================================================
// Inverse Kinematics
export { InverseKinematics } from "./algorithms/game-mechanics/inverse-kinematics";
export type { IKChain, IKConfig, IKOptions, IKResult, Joint } from "./algorithms/game-mechanics/inverse-kinematics";

// ============================================================================
// Algorithms - Game Mechanics - Constraint Solvers
// ============================================================================
// Constraint Solvers
export { ConstraintSolver } from "./algorithms/game-mechanics/constraint-solvers";
export type {
  AngleConstraint,
  ConstraintSolverConfig,
  ConstraintSolverOptions,
  ConstraintSolverResult,
  DistanceConstraint,
  JointConstraint,
  PhysicsBody,
} from "./algorithms/game-mechanics/constraint-solvers";

// ============================================================================
// Algorithms - Game Mechanics - Navmesh
// ============================================================================
// Navmesh Generation and Pathfinding
export { Navmesh } from "./algorithms/game-mechanics/navmesh";
export type {
  NavmeshConfig,
  NavmeshPathfindingOptions,
  NavmeshPathfindingResult,
  NavmeshPolygon,
  NavmeshResult,
} from "./algorithms/game-mechanics/navmesh";

// ============================================================================
// Algorithms - Pathfinding - Visibility Graph
// ============================================================================
// Visibility Graph
export { VisibilityGraph } from "./algorithms/pathfinding/visibility-graph";
export type {
  Obstacle,
  VisibilityEdge,
  VisibilityGraphConfig,
  VisibilityGraphPathfindingOptions,
  VisibilityGraphPathfindingResult,
  VisibilityGraphResult,
} from "./algorithms/pathfinding/visibility-graph";

// ============================================================================
// Algorithms - Computational Geometry - Triangulation - Ear Clipping
// ============================================================================
// Ear Clipping Triangulation
export { EarClipping } from "./algorithms/computational-geometry/triangulation/ear-clipping";
export type {
  EarClippingConfig,
  EarClippingOptions,
  EarClippingResult,
  EarClippingStats,
  Triangle as EarClippingTriangle,
} from "./algorithms/computational-geometry/triangulation/ear-clipping";

// ============================================================================
// Algorithms - Procedural Generation - Cellular Automata
// ============================================================================
// Cellular Automata
export { CellularAutomata } from "./algorithms/procedural-generation/cellular-automata";
export type {
  BoundaryCondition,
  CaveGenerationConfig,
  CellState,
  CellularAutomataConfig,
  CellularAutomataOptions,
  CellularAutomataResult,
  CellularAutomataStats,
  GameOfLifeConfig,
  RuleFunction,
} from "./algorithms/procedural-generation/cellular-automata";

// ============================================================================
// Algorithms - Rendering - Frustum Culling
// ============================================================================
// Frustum Culling
export { FrustumCulling } from "./algorithms/rendering/frustum-culling";
export type {
  CullableObject,
  CullingResult,
  FrustumCullingConfig,
  FrustumCullingOptions,
  FrustumCullingResult,
  FrustumCullingStats,
} from "./algorithms/rendering/frustum-culling";

// ============================================================================
// Algorithms - Sorting
// ============================================================================
// Sorting Algorithms
export * from "./algorithms/sorting";
