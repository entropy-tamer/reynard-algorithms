/**
 * @module algorithms/computational-geometry
 * @description Computational geometry algorithms for spatial computing and geometric analysis.
 */

// Bresenham's Line Algorithm
export { BresenhamLine } from "./bresenham/bresenham-core";
export type {
  BresenhamConfig,
  Point as BresenhamPoint,
  BresenhamResult,
  LineDrawingOptions,
  LineDrawingResult,
  MultiLineOptions,
  MultiLineResult,
  Pixel,
} from "./bresenham/bresenham-types";

// Additional Line Algorithms
export { DDALine } from "./dda/dda-core";
export type { DDALineResult, Point2D as DDAPoint } from "./dda/dda-core";
export { SupercoverLine } from "./supercover/supercover-core";
export type {
  SupercoverLineResult,
  Point2D as SupercoverPoint,
} from "./supercover/supercover-core";

// Delaunay Triangulation
export { DelaunayTriangulation } from "./delaunay/delaunay-core";
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
} from "./delaunay/delaunay-types";

// Voronoi Diagram
export { VoronoiDiagram } from "./voronoi/voronoi-core";
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
} from "./voronoi/voronoi-types";

// Polygon Clipping
export { PolygonClipping } from "./polygon-clipping/polygon-clipping-core";
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
} from "./polygon-clipping/polygon-clipping-types";
export { SutherlandHodgmanClipper } from "./polygon-clipping/sutherland-hodgman";
export { WeilerAthertonClipper } from "./polygon-clipping/weiler-atherton";

// Polygon Simplification
export {
  PolygonSimplifier,
  simplifyPolygon,
} from "./polygon/polygon-simplification-core";
export type {
  PolygonSimplificationConfig,
  PolygonSimplificationOptions,
  PolygonSimplificationResult,
  SimplificationAlgorithm,
} from "./polygon/polygon-simplification-types";

// Polygon Boolean Operations
export {
  BooleanOperation,
  performPolygonBoolean,
  PolygonBooleanOps,
} from "./polygon/polygon-boolean-core";
export type {
  PolygonBooleanConfig,
  PolygonBooleanOptions,
  Polygon as PolygonBooleanPolygon,
  PolygonBooleanResult,
} from "./polygon/polygon-boolean-types";

// Line Segment Intersection
export { LineIntersection } from "./line-intersection/line-intersection-core";
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
} from "./line-intersection/line-intersection-types";
export {
  SweepLineEventQueue,
  SweepLineStatusStructure,
  SweepLineUtils,
} from "./line-intersection/sweep-line";

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
} from "./splines/bezier-core";
export type {
  BezierConfig,
  BezierEvaluation,
  BezierOptions,
  BezierResult,
  CubicBezier,
  QuadraticBezier,
} from "./splines/bezier-types";

// Catmull-Rom Splines
export {
  derivativeCatmullRomSegment,
  evaluateCatmullRomSegment,
  evaluateCatmullRomSegmentFull,
  generateCatmullRomSpline,
  generateCatmullRomSVGPath,
} from "./splines/catmull-rom-core";
export type {
  CatmullRomConfig,
  CatmullRomEvaluation,
  CatmullRomOptions,
  CatmullRomResult,
  CatmullRomSegment,
} from "./splines/catmull-rom-types";

// B-Splines
export {
  basisFunction,
  BSplineCurve,
  evaluateBSpline,
  evaluateBSplineFull,
  generateBSplinePoints,
  generateNonUniformKnotVector,
  generateUniformKnotVector,
} from "./splines/b-spline-core";
export type {
  BSpline,
  BSplineConfig,
  BSplineEvaluation,
  BSplineOptions,
  BSplineResult,
  KnotVectorOptions,
} from "./splines/b-spline-types";

// NURBS
export {
  evaluateNURBS,
  evaluateNURBSFull,
  generateNURBSPoints,
  NURBSCurve,
} from "./splines/nurbs-core";
export type {
  NURBS,
  NURBSConfig,
  NURBSEvaluation,
  NURBSOptions,
  NURBSResult,
} from "./splines/nurbs-types";

// Hermite Splines
export {
  createHermiteSegments,
  derivativeHermiteSegment,
  evaluateHermiteSegment,
  evaluateHermiteSegmentFull,
  generateHermiteSpline,
  HermiteSpline,
} from "./splines/hermite-core";
export type {
  HermiteConfig,
  HermiteEvaluation,
  HermiteOptions,
  HermiteResult,
  HermiteSegment,
} from "./splines/hermite-types";

// Minimum Bounding Box
export { MinimumBoundingBox } from "./minimum-bounding-box/minimum-bounding-box-core";
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
} from "./minimum-bounding-box/minimum-bounding-box-types";
export { MinimumBoundingBoxUtils } from "./minimum-bounding-box/minimum-bounding-box-utils";

// Convex Hull Algorithms
export { ConvexHull } from "./convex-hull/convex-hull-core";
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
} from "./convex-hull/convex-hull-types";

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
} from "./circular";
export type {
  CircularPositionOptions,
  CircularPositionResult,
  RadialDistributionOptions,
} from "./circular";

// Triangulation - Ear Clipping
export { EarClipping } from "./triangulation/ear-clipping";
export type {
  EarClippingConfig,
  EarClippingOptions,
  EarClippingResult,
  EarClippingStats,
  Triangle as EarClippingTriangle,
} from "./triangulation/ear-clipping";

// Marching Squares Algorithm
export { MarchingSquares } from "./marching-squares/marching-squares-core";
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
} from "./marching-squares/marching-squares-types";

// DP-NNS (Delaunay-history successor DAG nearest-neighbor search)
export { bruteForceNearest, bruteForceNearest3D, buildDpNnsIndex, buildDpNnsIndex3D, computeGridStarts, computeGridStarts3D, generateClusteredManifold3D, generateGaussianHillSurface3D, generateRingManifold3D, generateSaddleSurface3D, generateSphereSurface3D, generateTorusSurface3D, generateVolumeQueries3D, projectPointsXY, queryBatchDpNns, queryDpNns, queryDpNns3D } from "./dp-nns";
export type {
  Bounds2D,
  Bounds3D as DpNnsBounds3D,
  DpNnsBatchQueryStats,
  DpNnsBuildOptions,
  DpNnsBuildOptions3D,
  DpNnsBuildStats,
  DpNnsIndex,
  DpNnsIndex3D,
  DpNnsQueryOptions,
  DpNnsQueryResult,
  DpNnsQueryResult3D,
  DpNnsQueryTraceStep,
  InsertionOrderMode,
  Point2D as DpNnsPoint2D,
  Point3D as DpNnsPoint3D,
} from "./dp-nns";
