/**
 * @module algorithms/geometry/algorithms/voronoi
 * @description Voronoi diagram implementation using Delaunay triangulation dual.
 */

export { VoronoiDiagram } from "./voronoi-core";
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
} from "./voronoi-types";
export {
  calculateCircumcenter,
  calculatePolygonArea,
  calculatePolygonCentroid,
  isPointInPolygon,
  findNearestSite,
  distance,
  clipCellToBounds,
  performLloydRelaxation,
  validatePointsForTriangulation,
  createBoundingBox,
  sortPoints,
  pointsEqual,
  lineIntersection,
} from "./voronoi-utils";



