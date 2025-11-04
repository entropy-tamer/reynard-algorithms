/**
 * @module algorithms/geometry/algorithms/marching-squares
 * @description Provides the Marching Squares algorithm for contour generation from scalar fields.
 */

export { MarchingSquares } from "./marching-squares-core";
export type {
  Point,
  Vector,
  LineSegment,
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
} from "./marching-squares-types";
