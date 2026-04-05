/**
 * SAT Projection Utilities
 *
 * Projection operations for the Separating Axis Theorem collision detection.
 * Handles polygon projection onto axes and overlap calculations.
 *
 * @module algorithms/geometry/collision/sat
 */
import type { ConvexPolygon, ProjectionAxis, Projection, Vector2D } from "./sat-types";
/**
 *
 * @param polygon
 * @param axis
 * @example
 */
export declare function projectPolygon(polygon: ConvexPolygon, axis: ProjectionAxis): Projection;
/**
 * Calculate overlap between two projections
 *
 * @param projection1 First projection
 * @param projection2 Second projection
 * @returns Overlap distance (negative if no overlap)
 * @example
 */
export declare function getProjectionOverlap(projection1: Projection, projection2: Projection): number;
/**
 * Calculate Minimum Translation Vector (MTV) for separating polygons
 *
 * @param axis The separation axis
 * @param overlap The overlap distance
 * @param epsilon Tolerance for floating-point comparisons
 * @returns MTV vector
 * @example
 */
export declare function calculateMTV(axis: ProjectionAxis, overlap: number, epsilon?: number): Vector2D;
/**
 * Get all potential separation axes for two polygons
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @returns Array of potential separation axes
 * @example
 */
export declare function getSeparationAxes(polygon1: ConvexPolygon, polygon2: ConvexPolygon): ProjectionAxis[];
/**
 * Get face normals for a polygon
 *
 * @param polygon The polygon
 * @returns Array of face normal axes
 * @example
 */
export declare function getFaceNormals(polygon: ConvexPolygon): ProjectionAxis[];
/**
 * Check if two projections overlap
 *
 * @param projection1 First projection
 * @param projection2 Second projection
 * @param epsilon Tolerance for floating-point comparisons
 * @returns True if projections overlap
 * @example
 */
export declare function projectionsOverlap(projection1: Projection, projection2: Projection, epsilon?: number): boolean;
/**
 * Calculate the center of a projection
 *
 * @param projection The projection
 * @returns Center point of the projection
 * @example
 */
export declare function getProjectionCenter(projection: Projection): number;
/**
 * Calculate the extent of a projection
 *
 * @param projection The projection
 * @returns Extent (half-width) of the projection
 * @example
 */
export declare function getProjectionExtent(projection: Projection): number;
//# sourceMappingURL=sat-projection.d.ts.map