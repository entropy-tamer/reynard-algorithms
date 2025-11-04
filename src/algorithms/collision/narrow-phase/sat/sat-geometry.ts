/**
 * SAT Geometry Utilities
 *
 * Core geometric operations for the Separating Axis Theorem collision detection.
 * Provides vector operations, polygon validation, and geometric calculations.
 *
 * @module algorithms/geometry/collision/sat
 */

import type { Vector2D, Point2D, ConvexPolygon, SATConfig, TransformMatrix } from "./sat-types";

/**
 * Normalize a vector to unit length
 *
 * @param vector The vector to normalize
 * @param epsilon Minimum length threshold
 * @returns Normalized vector or zero vector if too small
 * @example
 */
export function normalize(vector: Vector2D, epsilon: number = 1e-10): Vector2D {
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
 * Calculate dot product of two vectors
 *
 * @param point Point (treated as vector from origin)
 * @param vector Vector
 * @returns Dot product
 * @example
 */
export function dotProduct(point: Point2D, vector: Vector2D): number {
  return point.x * vector.x + point.y * vector.y;
}

/**
 * Check if bounding circles of two polygons overlap
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @returns True if circles overlap
 * @example
 */
export function boundingCirclesOverlap(polygon1: ConvexPolygon, polygon2: ConvexPolygon): boolean {
  const dx = polygon1.center.x - polygon2.center.x;
  const dy = polygon1.center.y - polygon2.center.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const combinedRadius = polygon1.radius + polygon2.radius;

  return distance <= combinedRadius;
}

/**
 * Check if a polygon is degenerate (point, line, or zero area)
 *
 * @param polygon The polygon to check
 * @param epsilon Minimum area threshold
 * @returns True if polygon is degenerate
 * @example
 */
export function isDegenerate(polygon: ConvexPolygon, epsilon: number = 1e-10): boolean {
  if (!polygon.vertices || polygon.vertices.length < 3) return true;

  // Shoelace formula for area calculation
  let area = 0;
  for (let i = 0, j = polygon.vertices.length - 1; i < polygon.vertices.length; j = i++) {
    const vi = polygon.vertices[i];
    const vj = polygon.vertices[j];
    area += vj.x * vi.y - vi.x * vj.y;
  }
  area = Math.abs(area) / 2;

  return area <= epsilon;
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 *
 * @param point The point to test
 * @param polygon The polygon
 * @returns True if point is inside polygon
 * @example
 */
export function isPointInsidePolygon(point: Point2D, polygon: ConvexPolygon): boolean {
  const vertices = polygon.vertices;
  let inside = false;

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const vi = vertices[i];
    const vj = vertices[j];

    if (vi.y > point.y !== vj.y > point.y && point.x < ((vj.x - vi.x) * (point.y - vi.y)) / (vj.y - vi.y) + vi.x) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Calculate the distance between two points
 *
 * @param p1 First point
 * @param p2 Second point
 * @returns Distance between points
 * @example
 */
export function distance(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the squared distance between two points (faster than distance)
 *
 * @param p1 First point
 * @param p2 Second point
 * @returns Squared distance between points
 * @example
 */
export function distanceSquared(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

/**
 * Calculate the cross product of two 2D vectors (returns scalar)
 *
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Cross product scalar
 * @example
 */
export function crossProduct(v1: Vector2D, v2: Vector2D): number {
  return v1.x * v2.y - v1.y * v2.x;
}

/**
 * Calculate the magnitude of a vector
 *
 * @param vector The vector
 * @returns Magnitude of the vector
 * @example
 */
export function magnitude(vector: Vector2D): number {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

/**
 * Calculate the squared magnitude of a vector (faster than magnitude)
 *
 * @param vector The vector
 * @returns Squared magnitude of the vector
 * @example
 */
export function magnitudeSquared(vector: Vector2D): number {
  return vector.x * vector.x + vector.y * vector.y;
}

/**
 * Add two vectors
 *
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Sum of the vectors
 * @example
 */
export function addVectors(v1: Vector2D, v2: Vector2D): Vector2D {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };
}

/**
 * Subtract two vectors
 *
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Difference of the vectors
 * @example
 */
export function subtractVectors(v1: Vector2D, v2: Vector2D): Vector2D {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
  };
}

/**
 * Scale a vector by a scalar
 *
 * @param vector The vector
 * @param scalar The scalar
 * @returns Scaled vector
 * @example
 */
export function scaleVector(vector: Vector2D, scalar: number): Vector2D {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
  };
}

/**
 * Transform a polygon using a transformation matrix
 *
 * @param polygon The polygon to transform
 * @param transform The transformation matrix
 * @returns Transformed polygon
 * @example
 */
export function transformPolygon(polygon: ConvexPolygon, transform: TransformMatrix): ConvexPolygon {
  const transformedVertices = polygon.vertices.map(vertex => {
    // Apply rotation
    const cos = Math.cos(transform.rotation);
    const sin = Math.sin(transform.rotation);

    const rotatedX = vertex.x * cos - vertex.y * sin;
    const rotatedY = vertex.x * sin + vertex.y * cos;

    // Apply scale
    const scaledX = rotatedX * transform.scale.x;
    const scaledY = rotatedY * transform.scale.y;

    // Apply translation
    return {
      x: scaledX + transform.translation.x,
      y: scaledY + transform.translation.y,
    };
  });

  // Transform center
  const cos = Math.cos(transform.rotation);
  const sin = Math.sin(transform.rotation);

  const rotatedCenterX = polygon.center.x * cos - polygon.center.y * sin;
  const rotatedCenterY = polygon.center.x * sin + polygon.center.y * cos;

  const transformedCenter = {
    x: rotatedCenterX * transform.scale.x + transform.translation.x,
    y: rotatedCenterY * transform.scale.y + transform.translation.y,
  };

  return {
    ...polygon,
    vertices: transformedVertices,
    center: transformedCenter,
    radius: polygon.radius * Math.max(transform.scale.x, transform.scale.y),
  };
}
