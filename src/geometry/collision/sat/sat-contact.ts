/**
 * SAT Contact Detection
 *
 * Contact point detection and analysis for the Separating Axis Theorem.
 * Handles finding contact points between colliding polygons.
 *
 * @module algorithms/geometry/collision/sat
 */

import type {
  ConvexPolygon,
  ProjectionAxis,
  Point2D,
  SATConfig,
} from "./sat-types";
import { isPointInsidePolygon } from "./sat-geometry";

/**
 * Find contact points between two colliding polygons
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param separationAxis The separation axis
 * @param config SAT configuration
 * @returns Array of contact points
 */
export function findContactPoints(
  polygon1: ConvexPolygon,
  polygon2: ConvexPolygon,
  separationAxis: ProjectionAxis,
  config: SATConfig
): Point2D[] {
  const contactPoints: Point2D[] = [];

  // Find vertices of polygon1 that are inside polygon2
  for (const vertex of polygon1.vertices) {
    if (isPointInsidePolygon(vertex, polygon2)) {
      contactPoints.push(vertex);
    }
  }

  // Find vertices of polygon2 that are inside polygon1
  for (const vertex of polygon2.vertices) {
    if (isPointInsidePolygon(vertex, polygon1)) {
      contactPoints.push(vertex);
    }
  }

  // Limit number of contact points
  if (contactPoints.length > config.maxContactPoints) {
    contactPoints.splice(config.maxContactPoints);
  }

  return contactPoints;
}

/**
 * Find contact points using edge-edge intersection
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param config SAT configuration
 * @returns Array of contact points
 */
export function findEdgeContactPoints(
  polygon1: ConvexPolygon,
  polygon2: ConvexPolygon,
  config: SATConfig
): Point2D[] {
  const contactPoints: Point2D[] = [];

  // Check all edge pairs for intersection
  for (let i = 0; i < polygon1.vertices.length; i++) {
    const edge1Start = polygon1.vertices[i];
    const edge1End = polygon1.vertices[(i + 1) % polygon1.vertices.length];

    for (let j = 0; j < polygon2.vertices.length; j++) {
      const edge2Start = polygon2.vertices[j];
      const edge2End = polygon2.vertices[(j + 1) % polygon2.vertices.length];

      const intersection = getLineIntersection(
        edge1Start,
        edge1End,
        edge2Start,
        edge2End
      );

      if (intersection) {
        contactPoints.push(intersection);
      }
    }
  }

  // Remove duplicate points
  const uniquePoints = removeDuplicatePoints(contactPoints, config.epsilon);

  // Limit number of contact points
  if (uniquePoints.length > config.maxContactPoints) {
    uniquePoints.splice(config.maxContactPoints);
  }

  return uniquePoints;
}

/**
 * Find contact points using vertex-face contact detection
 *
 * @param polygon1 First polygon
 * @param polygon2 Second polygon
 * @param config SAT configuration
 * @returns Array of contact points
 */
export function findVertexFaceContactPoints(
  polygon1: ConvexPolygon,
  polygon2: ConvexPolygon,
  config: SATConfig
): Point2D[] {
  const contactPoints: Point2D[] = [];

  // Check vertices of polygon1 against faces of polygon2
  for (const vertex of polygon1.vertices) {
    const closestPoint = getClosestPointOnPolygon(vertex, polygon2);
    if (closestPoint && isPointInsidePolygon(closestPoint, polygon1)) {
      contactPoints.push(closestPoint);
    }
  }

  // Check vertices of polygon2 against faces of polygon1
  for (const vertex of polygon2.vertices) {
    const closestPoint = getClosestPointOnPolygon(vertex, polygon1);
    if (closestPoint && isPointInsidePolygon(closestPoint, polygon2)) {
      contactPoints.push(closestPoint);
    }
  }

  // Remove duplicate points
  const uniquePoints = removeDuplicatePoints(contactPoints, config.epsilon);

  // Limit number of contact points
  if (uniquePoints.length > config.maxContactPoints) {
    uniquePoints.splice(config.maxContactPoints);
  }

  return uniquePoints;
}

/**
 * Get the intersection point of two line segments
 *
 * @param p1 Start of first line segment
 * @param p2 End of first line segment
 * @param p3 Start of second line segment
 * @param p4 End of second line segment
 * @returns Intersection point or null if no intersection
 */
function getLineIntersection(
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  p4: Point2D
): Point2D | null {
  const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  
  if (Math.abs(denom) < 1e-10) {
    return null; // Lines are parallel
  }

  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
  const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;

  // Check if intersection is within both line segments
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y),
    };
  }

  return null;
}

/**
 * Get the closest point on a polygon to a given point
 *
 * @param point The point
 * @param polygon The polygon
 * @returns Closest point on polygon or null if not found
 */
function getClosestPointOnPolygon(point: Point2D, polygon: ConvexPolygon): Point2D | null {
  let closestPoint: Point2D | null = null;
  let minDistance = Infinity;

  for (let i = 0; i < polygon.vertices.length; i++) {
    const start = polygon.vertices[i];
    const end = polygon.vertices[(i + 1) % polygon.vertices.length];
    
    const closest = getClosestPointOnLineSegment(point, start, end);
    const distance = getDistanceSquared(point, closest);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = closest;
    }
  }

  return closestPoint;
}

/**
 * Get the closest point on a line segment to a given point
 *
 * @param point The point
 * @param lineStart Start of line segment
 * @param lineEnd End of line segment
 * @returns Closest point on line segment
 */
function getClosestPointOnLineSegment(
  point: Point2D,
  lineStart: Point2D,
  lineEnd: Point2D
): Point2D {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared < 1e-10) {
    return lineStart; // Line segment is a point
  }

  const t = Math.max(0, Math.min(1, 
    ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared
  ));

  return {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy,
  };
}

/**
 * Calculate squared distance between two points
 *
 * @param p1 First point
 * @param p2 Second point
 * @returns Squared distance
 */
function getDistanceSquared(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

/**
 * Remove duplicate points from an array
 *
 * @param points Array of points
 * @param epsilon Tolerance for equality
 * @returns Array of unique points
 */
function removeDuplicatePoints(points: Point2D[], epsilon: number): Point2D[] {
  const unique: Point2D[] = [];
  
  for (const point of points) {
    const isDuplicate = unique.some(existing => 
      Math.abs(existing.x - point.x) < epsilon && 
      Math.abs(existing.y - point.y) < epsilon
    );
    
    if (!isDuplicate) {
      unique.push(point);
    }
  }
  
  return unique;
}

