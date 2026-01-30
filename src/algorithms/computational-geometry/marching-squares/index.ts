/**
 * @file index.ts
 * @module algorithms/geometry/algorithms/marching-squares
 * @description Provides Marching Squares algorithm for generating contours from 2D scalar fields.
 */

export { MarchingSquares } from "./marching-squares-core";
export type {
  Point,
  LineSegment,
  MarchingCell,
  MarchingSquaresConfig,
  MarchingSquaresResult,
  MarchingSquaresStats,
  MarchingSquaresQueryOptions,
  MarchingSquaresQueryResult,
  Contour,
} from "./marching-squares-types";
