/**
 * SAT Collision Detection Core
 *
 * Core collision detection logic for the Separating Axis Theorem.
 * Handles the main SAT algorithm, axis testing, and collision determination.
 *
 * @module algorithms/geometry/collision/sat
 */

import type { ConvexPolygon, ProjectionAxis, SATCollisionResult, SATConfig } from "./sat-types";
import { getSeparationAxes, projectPolygon, getProjectionOverlap, calculateMTV } from "./sat-projection";
import { boundingCirclesOverlap, isDegenerate, isPointInsidePolygon } from "./sat-geometry";

/**
 * Perform the core SAT collision test
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param config SAT configuration
 * @returns Collision detection result
 * @example
 */
export function performSATTest(
  polygon1: ConvexPolygon,
  polygon2: ConvexPolygon,
  config: SATConfig
): SATCollisionResult {
  // Early termination with bounding circles
  if (config.useBoundingCircleOptimization) {
    if (!boundingCirclesOverlap(polygon1, polygon2)) {
      const sep = normalize({
        x: polygon2.center.x - polygon1.center.x,
        y: polygon2.center.y - polygon1.center.y,
      });
      return {
        colliding: false,
        mtv: null,
        overlap: 0,
        separationAxis: { normal: sep, isFaceNormal: false },
        contactPoints: [],
        penetrationDepth: 0,
        executionTime: 0,
        axesTested: 0,
        success: true,
      };
    }
  }

  // Handle degenerate polygons (point/line/zero-area) by point-in-polygon heuristic
  if (isDegenerate(polygon1, config.epsilon) || isDegenerate(polygon2, config.epsilon)) {
    const aInB = polygon1.vertices.some(v => isPointInsidePolygon(v, polygon2));
    const bInA = polygon2.vertices.some(v => isPointInsidePolygon(v, polygon1));
    const colliding = aInB || bInA;
    return {
      colliding,
      mtv: null,
      overlap: colliding ? config.epsilon : 0,
      separationAxis: null,
      contactPoints: [],
      penetrationDepth: colliding ? config.epsilon : 0,
      executionTime: 0,
      axesTested: 0,
      success: true,
    };
  }

  // Get all potential separation axes
  const axes = getSeparationAxes(polygon1, polygon2);
  let minOverlap = Infinity;
  let separationAxis: ProjectionAxis | null = null;
  let axesTested = 0;

  // Test each axis
  for (const axis of axes) {
    axesTested++;

    // Project both polygons onto the axis
    const projection1 = projectPolygon(polygon1, axis);
    const projection2 = projectPolygon(polygon2, axis);

    // Check for overlap
    const overlap = getProjectionOverlap(projection1, projection2);

    if (overlap <= 0) {
      // No overlap found - polygons are separated
      return {
        colliding: false,
        mtv: null,
        overlap: 0,
        separationAxis: axis,
        contactPoints: [],
        penetrationDepth: 0,
        executionTime: 0,
        axesTested,
        success: true,
      };
    }

    // Track minimum overlap for MTV calculation
    if (
      overlap < minOverlap ||
      (Math.abs(overlap - minOverlap) <= config.epsilon &&
        separationAxis &&
        Math.abs(axis.normal.x) < Math.abs(separationAxis.normal.x))
    ) {
      minOverlap = overlap;
      separationAxis = axis;
    }

    // Early termination if we have a good enough separation
    if (config.useEarlyTermination && minOverlap < config.epsilon) {
      break;
    }
  }

  // All axes show overlap - polygons are colliding
  const mtv = separationAxis ? calculateMTV(separationAxis, minOverlap, config.epsilon) : null;

  return {
    colliding: true,
    mtv,
    overlap: minOverlap,
    separationAxis,
    contactPoints: [], // Will be filled by contact detection if needed
    penetrationDepth: config.calculatePenetrationDepth ? minOverlap : 0,
    executionTime: 0, // Will be set by caller
    axesTested,
    success: true,
  };
}

/**
 * Normalize a vector to unit length
 *
 * @param vector The vector to normalize
 * @param vector.x
 * @param epsilon Minimum length threshold
 * @param vector.y
 * @returns Normalized vector or zero vector if too small
 * @example
 */
function normalize(vector: { x: number; y: number }, epsilon: number = 1e-10): { x: number; y: number } {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  if (length < epsilon) {
    return { x: 0, y: 0 };
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

/**
 * Check if two polygons are colliding using SAT
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param config SAT configuration
 * @returns True if polygons are colliding
 * @example
 */
export function arePolygonsColliding(polygon1: ConvexPolygon, polygon2: ConvexPolygon, config: SATConfig): boolean {
  const result = performSATTest(polygon1, polygon2, config);
  return result.colliding;
}

/**
 * Get the minimum translation vector to separate two colliding polygons
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param config SAT configuration
 * @returns MTV vector or null if not colliding
 * @example
 */
export function getMinimumTranslationVector(
  polygon1: ConvexPolygon,
  polygon2: ConvexPolygon,
  config: SATConfig
): { x: number; y: number } | null {
  const result = performSATTest(polygon1, polygon2, config);
  return result.mtv;
}

/**
 * Get the separation axis with minimum overlap
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param config SAT configuration
 * @returns Separation axis or null if colliding
 * @example
 */
export function getSeparationAxis(
  polygon1: ConvexPolygon,
  polygon2: ConvexPolygon,
  config: SATConfig
): ProjectionAxis | null {
  const result = performSATTest(polygon1, polygon2, config);
  return result.separationAxis;
}
