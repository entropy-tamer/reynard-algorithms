/**
 * @module algorithms/pathfinding/theta-star
 * @description Theta* any-angle pathfinding algorithm implementation.
 */

export { ThetaStar } from "./theta-star-core";
export { ThetaStarUtils } from "./theta-star-utils";
export { LineOfSight } from "./line-of-sight";

export type {
  Point,
  Vector,
  Direction,
  MovementType,
  CellType,
  GridCell,
  ThetaStarNode,
  ThetaStarConfig,
  ThetaStarStats,
  ThetaStarResult,
  ThetaStarOptions,
  LineOfSightOptions,
  LineOfSightResult,
  GridValidationOptions,
  GridValidationResult,
  PathOptimizationOptions,
  PathOptimizationResult,
  ThetaStarSerializationOptions,
  ThetaStarSerialization,
  PathComparisonOptions,
  PathComparisonResult,
  LazyEvaluationOptions,
  LazyEvaluationResult,
} from "./theta-star-types";
