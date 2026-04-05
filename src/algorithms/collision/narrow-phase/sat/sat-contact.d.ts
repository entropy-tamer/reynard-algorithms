/**
 * SAT Contact Detection
 *
 * Contact point detection and analysis for the Separating Axis Theorem.
 * Handles finding contact points between colliding polygons.
 *
 * @module algorithms/geometry/collision/sat
 */
import type { ConvexPolygon, ProjectionAxis, Point2D, SATConfig } from "./sat-types";
/**
 * Find contact points between two colliding polygons
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param separationAxis The separation axis
 * @param _separationAxis
 * @param config SAT configuration
 * @returns Array of contact points
 * @example
 */
export declare function findContactPoints(polygon1: ConvexPolygon, polygon2: ConvexPolygon, _separationAxis: ProjectionAxis, config: SATConfig): Point2D[];
/**
 * Find contact points using edge-edge intersection
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param config SAT configuration
 * @returns Array of contact points
 * @example
 */
export declare function findEdgeContactPoints(polygon1: ConvexPolygon, polygon2: ConvexPolygon, config: SATConfig): Point2D[];
/**
 * Find contact points using vertex-face contact detection
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param config SAT configuration
 * @returns Array of contact points
 * @example
 */
export declare function findVertexFaceContactPoints(polygon1: ConvexPolygon, polygon2: ConvexPolygon, config: SATConfig): Point2D[];
//# sourceMappingURL=sat-contact.d.ts.map