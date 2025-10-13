/**
 * @module algorithms/geometry/algorithms/polygon-clipping
 * @description Polygon clipping algorithms including Sutherland-Hodgman and Weiler-Atherton.
 */

export { PolygonClipping } from "./polygon-clipping-core";
export { SutherlandHodgmanClipper } from "./sutherland-hodgman";
export { WeilerAthertonClipper } from "./weiler-atherton";
export type {
  Point,
  Vector,
  LineSegment,
  Polygon,
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
} from "./polygon-clipping-types";



