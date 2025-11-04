/**
 * SAT Projection Utilities
 *
 * Projection operations for the Separating Axis Theorem collision detection.
 * Handles polygon projection onto axes and overlap calculations.
 *
 * @module algorithms/geometry/collision/sat
 */

import type { ConvexPolygon, ProjectionAxis, Projection, Vector2D, Point2D } from "./sat-types";
import { adaptiveMemo } from "../../../../utils";

/**
 * Project a polygon onto an axis
 *
 * @param polygon The polygon to project
 * @param axis The axis to project onto
 * @returns Projection result
 */
// Memoized projection function
let _projectMemo: ((axX: number, axY: number, verts: Point2D[]) => { min: number; max: number }) | undefined;

/**
 *
 * @param polygon
 * @param axis
 * @example
 */
export function projectPolygon(polygon: ConvexPolygon, axis: ProjectionAxis): Projection {
  if (!_projectMemo) {
    _projectMemo = adaptiveMemo(
      (axX: number, axY: number, verts: Point2D[]): { min: number; max: number } => {
        let min = Infinity;
        let max = -Infinity;
        for (const v of verts) {
          const d = v.x * axX + v.y * axY;
          if (d < min) min = d;
          if (d > max) max = d;
        }
        return { min, max };
      },
      { maxSize: 2048, minHitRate: 0.6, windowSize: 300, minSamples: 150 },
      (axX: number, axY: number, verts: Point2D[]) => `${axX.toFixed(4)}|${axY.toFixed(4)}|${verts.length}`
    );
  }

  const { min, max } = _projectMemo(axis.normal.x, axis.normal.y, polygon.vertices);
  return { min, max, axis };
}

/**
 * Calculate overlap between two projections
 *
 * @param projection1 First projection
 * @param projection2 Second projection
 * @returns Overlap distance (negative if no overlap)
 * @example
 */
export function getProjectionOverlap(projection1: Projection, projection2: Projection): number {
  const overlap1 = projection1.max - projection2.min;
  const overlap2 = projection2.max - projection1.min;

  // Return the smaller overlap (or negative if no overlap)
  return Math.min(overlap1, overlap2);
}

/**
 * Calculate Minimum Translation Vector (MTV) for separating polygons
 *
 * @param axis The separation axis
 * @param overlap The overlap distance
 * @param epsilon Tolerance for floating-point comparisons
 * @returns MTV vector
 * @example
 */
export function calculateMTV(axis: ProjectionAxis, overlap: number, epsilon: number = 1e-10): Vector2D {
  const length = Math.sqrt(axis.normal.x * axis.normal.x + axis.normal.y * axis.normal.y);

  if (length < epsilon) {
    return { x: 0, y: 0 };
  }

  const n = {
    x: axis.normal.x / length,
    y: axis.normal.y / length,
  };

  let x = n.x * overlap;
  let y = n.y * overlap;

  // Snap to dominant axis (horizontal or vertical) for cleaner MTV
  if (Math.abs(x) > Math.abs(y)) {
    y = 0; // Horizontal MTV
  } else {
    x = 0; // Vertical MTV
  }

  return { x, y };
}

/**
 * Get all potential separation axes for two polygons
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @returns Array of potential separation axes
 * @example
 */
export function getSeparationAxes(polygon1: ConvexPolygon, polygon2: ConvexPolygon): ProjectionAxis[] {
  const axes: ProjectionAxis[] = [];

  // Get face normals from both polygons
  axes.push(...getFaceNormals(polygon1));
  axes.push(...getFaceNormals(polygon2));

  return axes;
}

/**
 * Get face normals for a polygon
 *
 * @param polygon The polygon
 * @returns Array of face normal axes
 * @example
 */
export function getFaceNormals(polygon: ConvexPolygon): ProjectionAxis[] {
  const axes: ProjectionAxis[] = [];
  const vertices = polygon.vertices;

  for (let i = 0; i < vertices.length; i++) {
    const current = vertices[i];
    const next = vertices[(i + 1) % vertices.length];

    // Calculate edge vector
    const edge = {
      x: next.x - current.x,
      y: next.y - current.y,
    };

    // Calculate face normal (perpendicular to edge)
    const normal = normalize({
      x: -edge.y,
      y: edge.x,
    });

    axes.push({
      normal,
      isFaceNormal: true,
      faceIndex: i,
    });
  }

  return axes;
}

/**
 * Normalize a vector to unit length
 *
 * @param vector The vector to normalize
 * @param epsilon Minimum length threshold
 * @returns Normalized vector or zero vector if too small
 * @example
 */
function normalize(vector: Vector2D, epsilon: number = 1e-10): Vector2D {
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
 * Check if two projections overlap
 *
 * @param projection1 First projection
 * @param projection2 Second projection
 * @param epsilon Tolerance for floating-point comparisons
 * @returns True if projections overlap
 * @example
 */
export function projectionsOverlap(projection1: Projection, projection2: Projection, epsilon: number = 1e-10): boolean {
  return getProjectionOverlap(projection1, projection2) > epsilon;
}

/**
 * Calculate the center of a projection
 *
 * @param projection The projection
 * @returns Center point of the projection
 * @example
 */
export function getProjectionCenter(projection: Projection): number {
  return (projection.min + projection.max) / 2;
}

/**
 * Calculate the extent of a projection
 *
 * @param projection The projection
 * @returns Extent (half-width) of the projection
 * @example
 */
export function getProjectionExtent(projection: Projection): number {
  return (projection.max - projection.min) / 2;
}
