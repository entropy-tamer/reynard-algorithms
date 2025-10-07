/**
 * @module algorithms/geometry/algorithms/convex-hull
 * @description Provides multiple Convex Hull algorithms including Graham Scan, Jarvis March, and QuickHull.
 */

export { ConvexHull } from "./convex-hull-core";
export type {
  Point,
  Vector,
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
} from "./convex-hull-types";
