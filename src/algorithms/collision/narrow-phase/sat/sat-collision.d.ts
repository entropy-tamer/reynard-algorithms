/**
 * SAT Collision Detection Core
 *
 * Core collision detection logic for the Separating Axis Theorem.
 * Handles the main SAT algorithm, axis testing, and collision determination.
 *
 * @module algorithms/geometry/collision/sat
 */
import type { ConvexPolygon, ProjectionAxis, SATCollisionResult, SATConfig } from "./sat-types";
/**
 * Perform the core SAT collision test
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param config SAT configuration
 * @returns Collision detection result
 * @example
 */
export declare function performSATTest(polygon1: ConvexPolygon, polygon2: ConvexPolygon, config: SATConfig): SATCollisionResult;
/**
 * Check if two polygons are colliding using SAT
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param config SAT configuration
 * @returns True if polygons are colliding
 * @example
 */
export declare function arePolygonsColliding(polygon1: ConvexPolygon, polygon2: ConvexPolygon, config: SATConfig): boolean;
/**
 * Get the minimum translation vector to separate two colliding polygons
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param config SAT configuration
 * @returns MTV vector or null if not colliding
 * @example
 */
export declare function getMinimumTranslationVector(polygon1: ConvexPolygon, polygon2: ConvexPolygon, config: SATConfig): {
    x: number;
    y: number;
} | null;
/**
 * Get the separation axis with minimum overlap
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param config SAT configuration
 * @returns Separation axis or null if colliding
 * @example
 */
export declare function getSeparationAxis(polygon1: ConvexPolygon, polygon2: ConvexPolygon, config: SATConfig): ProjectionAxis | null;
//# sourceMappingURL=sat-collision.d.ts.map