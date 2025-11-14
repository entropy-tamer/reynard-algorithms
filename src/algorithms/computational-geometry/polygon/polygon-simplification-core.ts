/**
 * Polygon Simplification Algorithms
 *
 * Implementation of polygon simplification algorithms including
 * Douglas-Peucker, Visvalingam-Whyatt, and Reumann-Witkam.
 */

import type { Point } from "../../../core/types/index.js";
import type {
  PolygonSimplificationConfig,
  PolygonSimplificationResult,
  PolygonSimplificationOptions,
} from "./polygon-simplification-types.js";
import { SimplificationAlgorithm } from "./polygon-simplification-types.js";

/**
 * Calculate perpendicular distance from a point to a line segment
 */
function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    // Line is a point
    const px = point.x - lineStart.x;
    const py = point.y - lineStart.y;
    return Math.sqrt(px * px + py * py);
  }

  // Project point onto line
  const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSq));
  const projX = lineStart.x + t * dx;
  const projY = lineStart.y + t * dy;

  // Distance from point to projection
  const px = point.x - projX;
  const py = point.y - projY;
  return Math.sqrt(px * px + py * py);
}

/**
 * Douglas-Peucker algorithm for polygon simplification
 */
function douglasPeucker(vertices: Point[], tolerance: number, preserveTopology: boolean): Point[] {
  if (vertices.length <= 2) {
    return [...vertices];
  }

  // Find the point with maximum distance from the line between first and last
  let maxDistance = 0;
  let maxIndex = 0;

  for (let i = 1; i < vertices.length - 1; i++) {
    const distance = perpendicularDistance(vertices[i], vertices[0], vertices[vertices.length - 1]);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    // Recursively simplify left and right parts
    const leftPart = douglasPeucker(vertices.slice(0, maxIndex + 1), tolerance, preserveTopology);
    const rightPart = douglasPeucker(vertices.slice(maxIndex), tolerance, preserveTopology);

    // Combine results (remove duplicate point at maxIndex)
    return [...leftPart.slice(0, -1), ...rightPart];
  } else {
    // All points are within tolerance, return only endpoints
    return [vertices[0], vertices[vertices.length - 1]];
  }
}

/**
 * Calculate triangle area formed by three points
 */
function triangleArea(p1: Point, p2: Point, p3: Point): number {
  return Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)) / 2;
}

/**
 * Visvalingam-Whyatt algorithm for polygon simplification
 */
function visvalingamWhyatt(vertices: Point[], tolerance: number): Point[] {
  if (vertices.length <= 2) {
    return [...vertices];
  }

  // Create list of effective areas (triangles)
  const areas: Array<{ index: number; area: number }> = [];

  for (let i = 1; i < vertices.length - 1; i++) {
    const area = triangleArea(vertices[i - 1], vertices[i], vertices[i + 1]);
    areas.push({ index: i, area });
  }

  // Sort by area (smallest first)
  areas.sort((a, b) => a.area - b.area);

  // Remove points with smallest effective area until tolerance is met
  const result = [...vertices];
  const removed = new Set<number>();

  for (const { index, area } of areas) {
    if (area < tolerance && !removed.has(index)) {
      removed.add(index);
    }
  }

  // Reconstruct polygon without removed points
  return result.filter((_, index) => !removed.has(index));
}

/**
 * Reumann-Witkam algorithm for polygon simplification
 */
function reumannWitkam(vertices: Point[], tolerance: number): Point[] {
  if (vertices.length <= 2) {
    return [...vertices];
  }

  const result: Point[] = [vertices[0]];
  let currentIndex = 0;

  while (currentIndex < vertices.length - 1) {
    let nextIndex = currentIndex + 1;

    // Find the furthest point that can be reached with a line within tolerance
    for (let i = currentIndex + 2; i < vertices.length; i++) {
      let allWithinTolerance = true;

      // Check all intermediate points
      for (let j = currentIndex + 1; j < i; j++) {
        const distance = perpendicularDistance(vertices[j], vertices[currentIndex], vertices[i]);
        if (distance > tolerance) {
          allWithinTolerance = false;
          break;
        }
      }

      if (allWithinTolerance) {
        nextIndex = i;
      } else {
        break;
      }
    }

    result.push(vertices[nextIndex]);
    currentIndex = nextIndex;
  }

  return result;
}

/**
 * Remove collinear points
 */
function removeCollinear(vertices: Point[], tolerance: number = 1e-10): Point[] {
  if (vertices.length <= 2) {
    return [...vertices];
  }

  const result: Point[] = [vertices[0]];

  for (let i = 1; i < vertices.length - 1; i++) {
    const area = triangleArea(vertices[i - 1], vertices[i], vertices[i + 1]);
    if (area > tolerance) {
      result.push(vertices[i]);
    }
  }

  result.push(vertices[vertices.length - 1]);
  return result;
}

/**
 * Calculate maximum error introduced by simplification
 */
function calculateMaxError(original: Point[], simplified: Point[]): number {
  let maxError = 0;

  // For each original point, find distance to nearest simplified segment
  for (const point of original) {
    let minDistance = Infinity;

    for (let i = 0; i < simplified.length - 1; i++) {
      const distance = perpendicularDistance(point, simplified[i], simplified[i + 1]);
      minDistance = Math.min(minDistance, distance);
    }

    maxError = Math.max(maxError, minDistance);
  }

  return maxError;
}

/**
 * Calculate average error introduced by simplification
 */
function calculateAverageError(original: Point[], simplified: Point[]): number {
  let totalError = 0;

  for (const point of original) {
    let minDistance = Infinity;

    for (let i = 0; i < simplified.length - 1; i++) {
      const distance = perpendicularDistance(point, simplified[i], simplified[i + 1]);
      minDistance = Math.min(minDistance, distance);
    }

    totalError += minDistance;
  }

  return totalError / original.length;
}

/**
 * Simplify a polygon using the specified algorithm
 */
export function simplifyPolygon(vertices: Point[], options: PolygonSimplificationOptions): PolygonSimplificationResult {
  if (vertices.length <= 2) {
    return {
      vertices: [...vertices],
      verticesRemoved: 0,
      compressionRatio: 1,
      maxError: 0,
      averageError: 0,
    };
  }

  let simplified: Point[];

  // Remove collinear points first if requested
  const cleaned = options.removeCollinear ? removeCollinear(vertices) : [...vertices];

  // Apply simplification algorithm
  switch (options.algorithm || SimplificationAlgorithm.DOUGLAS_PEUCKER) {
    case SimplificationAlgorithm.DOUGLAS_PEUCKER:
      simplified = douglasPeucker(cleaned, options.tolerance, options.preserveTopology ?? true);
      break;
    case SimplificationAlgorithm.VISVALINGAM_WHYATT:
      simplified = visvalingamWhyatt(cleaned, options.tolerance);
      break;
    case SimplificationAlgorithm.REUMANN_WITKAM:
      simplified = reumannWitkam(cleaned, options.tolerance);
      break;
    default:
      simplified = douglasPeucker(cleaned, options.tolerance, options.preserveTopology ?? true);
  }

  // Calculate statistics
  const verticesRemoved = cleaned.length - simplified.length;
  const compressionRatio = cleaned.length > 0 ? cleaned.length / simplified.length : 1;
  const maxError = calculateMaxError(cleaned, simplified);
  const averageError = calculateAverageError(cleaned, simplified);

  return {
    vertices: simplified,
    verticesRemoved,
    compressionRatio,
    maxError,
    averageError,
  };
}

/**
 * Polygon simplification class for convenient usage
 */
export class PolygonSimplifier {
  private config: PolygonSimplificationConfig;

  constructor(config: Partial<PolygonSimplificationConfig> = {}) {
    this.config = {
      tolerance: 1.0,
      algorithm: SimplificationAlgorithm.DOUGLAS_PEUCKER,
      preserveTopology: true,
      preserveShape: false,
      ...config,
    };
  }

  /**
   * Simplify a polygon
   */
  simplify(vertices: Point[], options?: Partial<PolygonSimplificationOptions>): PolygonSimplificationResult {
    const opts: PolygonSimplificationOptions = {
      tolerance: this.config.tolerance ?? 1.0,
      algorithm: options?.algorithm ?? this.config.algorithm ?? SimplificationAlgorithm.DOUGLAS_PEUCKER,
      preserveTopology: options?.preserveTopology ?? this.config.preserveTopology ?? true,
      preserveShape: options?.preserveShape ?? this.config.preserveShape ?? false,
      removeCollinear: options?.removeCollinear ?? true,
    };

    return simplifyPolygon(vertices, opts);
  }
}
