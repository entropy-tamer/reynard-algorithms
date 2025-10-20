/**
 * @module algorithms/geometry/algorithms/line-intersection
 * @description Bentley-Ottmann line segment intersection algorithm implementation.
 */

export { LineIntersection } from "./line-intersection-core";
export { SweepLineEventQueue, SweepLineStatusStructure, SweepLineUtils } from "./sweep-line";
export type {
  Point,
  LineSegment,
  IntersectionPoint,
  SweepLineEvent,
  LineIntersectionConfig,
  LineIntersectionStats,
  LineIntersectionResult,
  IntersectionQueryOptions,
  IntersectionQueryResult,
  SegmentValidationOptions,
  SegmentValidationResult,
  IntersectionFilterOptions,
  PerformanceOptions,
  IntersectionSerializationOptions,
  IntersectionSerialization,
  EventQueue,
  StatusStructure,
  StatusNode,
} from "./line-intersection-types";
