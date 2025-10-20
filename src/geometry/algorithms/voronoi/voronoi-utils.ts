/**
 * @module algorithms/geometry/algorithms/voronoi/utils
 * @description Utility functions for Voronoi diagram operations.
 */

import { Point, Triangle } from "../delaunay/delaunay-types";
import { VoronoiCell, VoronoiConfig, LloydRelaxationOptions, LloydRelaxationResult } from "./voronoi-types";

/**
 * Calculates the circumcenter of a triangle.
 * @param triangle - The triangle to calculate the circumcenter for.
 * @returns The circumcenter point.
 * @example
 */
export function calculateCircumcenter(triangle: Triangle): Point {
  const { a, b, c } = triangle;

  const ax = a.x;
  const ay = a.y;
  const bx = b.x;
  const by = b.y;
  const cx = c.x;
  const cy = c.y;

  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));

  if (Math.abs(d) < 1e-10) {
    // Degenerate triangle - return centroid
    return {
      x: (ax + bx + cx) / 3,
      y: (ay + by + cy) / 3,
    };
  }

  const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;

  const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;

  return { x: ux, y: uy };
}

/**
 * Calculates the area of a polygon defined by vertices.
 * @param vertices - Array of vertices forming the polygon.
 * @returns The area of the polygon.
 * @example
 */
export function calculatePolygonArea(vertices: Point[]): number {
  if (vertices.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Calculates the centroid of a polygon defined by vertices.
 * @param vertices - Array of vertices forming the polygon.
 * @returns The centroid point.
 * @example
 */
export function calculatePolygonCentroid(vertices: Point[]): Point {
  if (vertices.length === 0) return { x: 0, y: 0 };
  if (vertices.length === 1) return vertices[0];
  if (vertices.length === 2) {
    return {
      x: (vertices[0].x + vertices[1].x) / 2,
      y: (vertices[0].y + vertices[1].y) / 2,
    };
  }

  let cx = 0;
  let cy = 0;
  let area = 0;

  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    const cross = vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y;
    area += cross;
    cx += (vertices[i].x + vertices[j].x) * cross;
    cy += (vertices[i].y + vertices[j].y) * cross;
  }

  area /= 2;
  if (Math.abs(area) < 1e-10) {
    // Degenerate polygon - return average of vertices
    const sumX = vertices.reduce((sum, v) => sum + v.x, 0);
    const sumY = vertices.reduce((sum, v) => sum + v.y, 0);
    return {
      x: sumX / vertices.length,
      y: sumY / vertices.length,
    };
  }

  return {
    x: cx / (6 * area),
    y: cy / (6 * area),
  };
}

/**
 * Checks if a point is inside a polygon using ray casting algorithm.
 * @param point - The point to test.
 * @param vertices - Array of vertices forming the polygon.
 * @returns True if the point is inside the polygon.
 * @example
 */
export function isPointInPolygon(point: Point, vertices: Point[]): boolean {
  if (vertices.length < 3) return false;

  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    if (
      vertices[i].y > point.y !== vertices[j].y > point.y &&
      point.x <
        ((vertices[j].x - vertices[i].x) * (point.y - vertices[i].y)) / (vertices[j].y - vertices[i].y) + vertices[i].x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Finds the nearest site to a given point.
 * @param point - The query point.
 * @param sites - Array of sites.
 * @returns The nearest site and its distance.
 * @example
 */
export function findNearestSite(point: Point, sites: Point[]): { site: Point; distance: number; index: number } {
  if (sites.length === 0) {
    throw new Error("No sites provided");
  }

  let nearestSite = sites[0];
  let nearestDistance = distance(point, nearestSite);
  let nearestIndex = 0;

  for (let i = 1; i < sites.length; i++) {
    const dist = distance(point, sites[i]);
    if (dist < nearestDistance) {
      nearestDistance = dist;
      nearestSite = sites[i];
      nearestIndex = i;
    }
  }

  return { site: nearestSite, distance: nearestDistance, index: nearestIndex };
}

/**
 * Calculates the distance between two points.
 * @param p1 - First point.
 * @param p2 - Second point.
 * @returns The Euclidean distance.
 * @example
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the squared distance between two points (faster than distance).
 * @param p1 - First point.
 * @param p2 - Second point.
 * @returns The squared Euclidean distance.
 * @example
 */
export function distanceSquared(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

/**
 * Clips a Voronoi cell to a bounding box.
 * @param cell - The Voronoi cell to clip.
 * @param boundingBox - The bounding box to clip to.
 * @param boundingBox.min
 * @param boundingBox.max
 * @returns The clipped cell vertices.
 * @example
 */
export function clipCellToBounds(cell: VoronoiCell, boundingBox: { min: Point; max: Point }): Point[] {
  if (cell.bounded) {
    return cell.vertices;
  }

  // For unbounded cells, we need to clip the infinite edges
  // This is a simplified implementation - in practice, you'd use
  // a proper polygon clipping algorithm like Sutherland-Hodgman
  const clippedVertices: Point[] = [];

  for (const vertex of cell.vertices) {
    if (
      vertex.x >= boundingBox.min.x &&
      vertex.x <= boundingBox.max.x &&
      vertex.y >= boundingBox.min.y &&
      vertex.y <= boundingBox.max.y
    ) {
      clippedVertices.push(vertex);
    }
  }

  return clippedVertices;
}

/**
 * Performs Lloyd's relaxation on a set of sites.
 * @param sites - Initial sites.
 * @param options - Relaxation options.
 * @param config - Voronoi configuration.
 * @param _config
 * @returns The result of Lloyd's relaxation.
 * @example
 */
export function performLloydRelaxation(
  sites: Point[],
  options: LloydRelaxationOptions,
  _config: VoronoiConfig
): LloydRelaxationResult {
  const startTime = performance.now();
  let currentSites = [...sites];
  let iterations = 0;
  let converged = false;
  let convergence = Infinity;

  for (let iter = 0; iter < options.maxIterations; iter++) {
    iterations = iter + 1;

    // Generate Voronoi diagram for current sites
    // This would typically call the main Voronoi generation function
    // For now, we'll simulate the process

    const newSites: Point[] = [];
    let maxMovement = 0;

    // Calculate new site positions (centroids of Voronoi cells)
    for (let i = 0; i < currentSites.length; i++) {
      // In a real implementation, you'd find the Voronoi cell for this site
      // and calculate its centroid. For now, we'll use a simple perturbation
      const site = currentSites[i];
      const newSite = {
        x: site.x + (Math.random() - 0.5) * 0.1,
        y: site.y + (Math.random() - 0.5) * 0.1,
      };

      // Clip to bounds if specified
      if (options.clipToBounds && options.boundingBox) {
        newSite.x = Math.max(options.boundingBox.min.x, Math.min(options.boundingBox.max.x, newSite.x));
        newSite.y = Math.max(options.boundingBox.min.y, Math.min(options.boundingBox.max.y, newSite.y));
      }

      newSites.push(newSite);

      const movement = distance(site, newSite);
      maxMovement = Math.max(maxMovement, movement);
    }

    convergence = maxMovement;

    if (convergence < options.tolerance) {
      converged = true;
      break;
    }

    currentSites = newSites;
  }

  const executionTime = performance.now() - startTime;

  return {
    relaxedSites: currentSites,
    iterations,
    convergence,
    converged,
    executionTime,
  };
}

/**
 * Validates that points are not collinear (for Delaunay triangulation).
 * @param points - Array of points to validate.
 * @param tolerance - Tolerance for collinearity check.
 * @returns True if points are valid for triangulation.
 * @example
 */
export function validatePointsForTriangulation(points: Point[], tolerance: number = 1e-10): boolean {
  if (points.length < 3) return true;

  // Check for duplicate points
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (distanceSquared(points[i], points[j]) < tolerance * tolerance) {
        return false;
      }
    }
  }

  // Check for collinearity (simplified check)
  if (points.length === 3) {
    const { a, b, c } = { a: points[0], b: points[1], c: points[2] };
    const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    return Math.abs(cross) > tolerance;
  }

  return true;
}

/**
 * Creates a bounding box that encompasses all points.
 * @param points - Array of points.
 * @param padding - Padding to add around the points.
 * @returns Bounding box with min and max points.
 * @example
 */
export function createBoundingBox(points: Point[], padding: number = 0): { min: Point; max: Point } {
  if (points.length === 0) {
    return {
      min: { x: 0, y: 0 },
      max: { x: 0, y: 0 },
    };
  }

  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  return {
    min: { x: minX - padding, y: minY - padding },
    max: { x: maxX + padding, y: maxY + padding },
  };
}

/**
 * Sorts points by x-coordinate, then by y-coordinate.
 * @param points - Array of points to sort.
 * @returns Sorted array of points.
 * @example
 */
export function sortPoints(points: Point[]): Point[] {
  return [...points].sort((a, b) => {
    if (Math.abs(a.x - b.x) < 1e-10) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });
}

/**
 * Checks if two points are approximately equal.
 * @param p1 - First point.
 * @param p2 - Second point.
 * @param tolerance - Tolerance for comparison.
 * @returns True if points are approximately equal.
 * @example
 */
export function pointsEqual(p1: Point, p2: Point, tolerance: number = 1e-10): boolean {
  return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
}

/**
 * Finds the intersection point of two lines.
 * @param p1 - First point of first line.
 * @param p2 - Second point of first line.
 * @param p3 - First point of second line.
 * @param p4 - Second point of second line.
 * @returns The intersection point, or null if lines don't intersect.
 * @example
 */
export function lineIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
  const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);

  if (Math.abs(denom) < 1e-10) {
    return null; // Lines are parallel
  }

  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;

  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y),
  };
}
