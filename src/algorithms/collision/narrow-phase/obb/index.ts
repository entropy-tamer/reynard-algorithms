/**
 * @module algorithms/geometry/shapes/obb
 * @description Oriented Bounding Box (OBB) with SAT collision detection.
 */

export { OBB } from "./obb-core";
export { OBBUtils } from "./obb-utils";
export type {
  Point,
  Vector,
  OBBData,
  OBBConfig,
  OBBStats,
  OBBCollisionResult,
  OBBPointTestResult,
  OBBConstructionResult,
  OBBConstructionOptions,
  SATOptions,
  OBBTransformOptions,
  OBBTransformResult,
  OBBSerializationOptions,
  OBBSerialization,
  OBBValidationOptions,
  OBBValidationResult,
  OBBIntersectionOptions,
  OBBIntersectionResult,
  OBBContainmentOptions,
  OBBContainmentResult,
} from "./obb-types";
