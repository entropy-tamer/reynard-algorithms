/**
 * @module algorithms/geometry/algorithms/delaunay
 * @description Provides Delaunay Triangulation using the Bowyer-Watson algorithm.
 */

export { DelaunayTriangulation } from "./delaunay-core";
export type {
  Point,
  Triangle,
  Edge,
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
} from "./delaunay-types";
