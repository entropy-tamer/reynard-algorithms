/**
 * SAT Geometry Utilities
 *
 * Core geometric operations for the Separating Axis Theorem collision detection.
 * Provides vector operations, polygon validation, and geometric calculations.
 *
 * @module algorithms/geometry/collision/sat
 */
import type { Vector2D, Point2D, ConvexPolygon, TransformMatrix } from "./sat-types";
/**
 * Normalize a vector to unit length
 *
 * @param vector The vector to normalize
 * @param epsilon Minimum length threshold
 * @returns Normalized vector or zero vector if too small
 * @example
 */
export declare function normalize(vector: Vector2D, epsilon?: number): Vector2D;
/**
 * Calculate dot product of two vectors
 *
 * @param point Point (treated as vector from origin)
 * @param vector Vector
 * @returns Dot product
 * @example
 */
export declare function dotProduct(point: Point2D, vector: Vector2D): number;
/**
 * Check if bounding circles of two polygons overlap
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @returns True if circles overlap
 * @example
 */
export declare function boundingCirclesOverlap(polygon1: ConvexPolygon, polygon2: ConvexPolygon): boolean;
/**
 * Check if a polygon is degenerate (point, line, or zero area)
 *
 * @param polygon The polygon to check
 * @param epsilon Minimum area threshold
 * @returns True if polygon is degenerate
 * @example
 */
export declare function isDegenerate(polygon: ConvexPolygon, epsilon?: number): boolean;
/**
 * Check if a point is inside a polygon using ray casting algorithm
 *
 * @param point The point to test
 * @param polygon The polygon
 * @returns True if point is inside polygon
 * @example
 */
export declare function isPointInsidePolygon(point: Point2D, polygon: ConvexPolygon): boolean;
/**
 * Calculate the distance between two points
 *
 * @param p1 First point
 * @param p2 Second point
 * @returns Distance between points
 * @example
 */
export declare function distance(p1: Point2D, p2: Point2D): number;
/**
 * Calculate the squared distance between two points (faster than distance)
 *
 * @param p1 First point
 * @param p2 Second point
 * @returns Squared distance between points
 * @example
 */
export declare function distanceSquared(p1: Point2D, p2: Point2D): number;
/**
 * Calculate the cross product of two 2D vectors (returns scalar)
 *
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Cross product scalar
 * @example
 */
export declare function crossProduct(v1: Vector2D, v2: Vector2D): number;
/**
 * Calculate the magnitude of a vector
 *
 * @param vector The vector
 * @returns Magnitude of the vector
 * @example
 */
export declare function magnitude(vector: Vector2D): number;
/**
 * Calculate the squared magnitude of a vector (faster than magnitude)
 *
 * @param vector The vector
 * @returns Squared magnitude of the vector
 * @example
 */
export declare function magnitudeSquared(vector: Vector2D): number;
/**
 * Add two vectors
 *
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Sum of the vectors
 * @example
 */
export declare function addVectors(v1: Vector2D, v2: Vector2D): Vector2D;
/**
 * Subtract two vectors
 *
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Difference of the vectors
 * @example
 */
export declare function subtractVectors(v1: Vector2D, v2: Vector2D): Vector2D;
/**
 * Scale a vector by a scalar
 *
 * @param vector The vector
 * @param scalar The scalar
 * @returns Scaled vector
 * @example
 */
export declare function scaleVector(vector: Vector2D, scalar: number): Vector2D;
/**
 * Transform a polygon using a transformation matrix
 *
 * @param polygon The polygon to transform
 * @param transform The transformation matrix
 * @returns Transformed polygon
 * @example
 */
export declare function transformPolygon(polygon: ConvexPolygon, transform: TransformMatrix): ConvexPolygon;
//# sourceMappingURL=sat-geometry.d.ts.map