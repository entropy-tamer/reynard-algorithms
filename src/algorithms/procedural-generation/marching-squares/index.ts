/**
 * @module algorithms/procedural-generation/marching-squares
 * @description Provides the Marching Squares algorithm for contour generation from scalar fields.
 */

export { MarchingSquares } from "./marching-squares-core";
export { MarchingSquaresLegacy } from "./marching-squares-legacy";
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
