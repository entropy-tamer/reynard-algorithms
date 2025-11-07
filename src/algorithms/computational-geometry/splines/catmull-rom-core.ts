/**
 * Catmull-Rom Spline Algorithms
 *
 * Implementation of Catmull-Rom spline algorithms for smooth curve interpolation.
 * Catmull-Rom splines pass through all control points, making them ideal for
 * smooth connections through multiple points.
 */

import type { Point } from "../../../core/types/index.js";
import type {
  CatmullRomConfig,
  CatmullRomResult,
  CatmullRomSegment,
  CatmullRomOptions,
  CatmullRomEvaluation,
} from "./catmull-rom-types.js";

/**
 * Calculate distance between two points
 */
function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate alpha parameter for Catmull-Rom based on tension
 */
function calculateAlpha(tension: number, p0: Point, p1: Point): number {
  const dist = distance(p0, p1);
  if (dist === 0) return 0;
  return Math.pow(dist, tension);
}

/**
 * Calculate control points for Catmull-Rom segment
 */
function calculateCatmullRomControlPoints(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  tension: number = 0.5
): { c1: Point; c2: Point } {
  // Calculate alpha for each interval
  const alpha01 = calculateAlpha(tension, p0, p1);
  const alpha12 = calculateAlpha(tension, p1, p2);
  const alpha23 = calculateAlpha(tension, p2, p3);

  // Avoid division by zero
  const alpha01Inv = alpha01 === 0 ? 0 : 1 / alpha01;
  const alpha12Inv = alpha12 === 0 ? 0 : 1 / alpha12;
  const alpha23Inv = alpha23 === 0 ? 0 : 1 / alpha23;

  // Calculate control points
  const c1x = p1.x + (p2.x - p0.x) * alpha12Inv * alpha01;
  const c1y = p1.y + (p2.y - p0.y) * alpha12Inv * alpha01;

  const c2x = p2.x - (p3.x - p1.x) * alpha12Inv * alpha23;
  const c2y = p2.y - (p3.y - p1.y) * alpha12Inv * alpha23;

  return {
    c1: { x: c1x, y: c1y },
    c2: { x: c2x, y: c2y },
  };
}

/**
 * Evaluate a Catmull-Rom segment at parameter t (0 to 1)
 * Uses the standard Catmull-Rom formula
 */
export function evaluateCatmullRomSegment(segment: CatmullRomSegment, t: number, tension: number = 0.5): Point {
  const { p0, p1, p2, p3 } = segment;
  const { c1, c2 } = calculateCatmullRomControlPoints(p0, p1, p2, p3, tension);

  // Convert to cubic Bezier and evaluate
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;

  return {
    x: mt3 * p1.x + 3 * mt2 * t * c1.x + 3 * mt * t2 * c2.x + t3 * p2.x,
    y: mt3 * p1.y + 3 * mt2 * t * c1.y + 3 * mt * t2 * c2.y + t3 * p2.y,
  };
}

/**
 * Calculate the derivative (tangent) of a Catmull-Rom segment at parameter t
 */
export function derivativeCatmullRomSegment(segment: CatmullRomSegment, t: number, tension: number = 0.5): Point {
  const { p0, p1, p2, p3 } = segment;
  const { c1, c2 } = calculateCatmullRomControlPoints(p0, p1, p2, p3, tension);

  const t2 = t * t;
  const mt = 1 - t;
  const mt2 = mt * mt;

  return {
    x: 3 * mt2 * (c1.x - p1.x) + 6 * mt * t * (c2.x - c1.x) + 3 * t2 * (p2.x - c2.x),
    y: 3 * mt2 * (c1.y - p1.y) + 6 * mt * t * (c2.y - c1.y) + 3 * t2 * (p2.y - c2.y),
  };
}

/**
 * Calculate the normal vector at a point on the curve
 */
function calculateNormal(tangent: Point): Point {
  const length = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  // Normal is perpendicular to tangent (rotate 90 degrees)
  return { x: -tangent.y / length, y: tangent.x / length };
}

/**
 * Evaluate a Catmull-Rom segment with additional information
 */
export function evaluateCatmullRomSegmentFull(
  segment: CatmullRomSegment,
  t: number,
  tension: number = 0.5
): CatmullRomEvaluation {
  const point = evaluateCatmullRomSegment(segment, t, tension);
  const tangent = derivativeCatmullRomSegment(segment, t, tension);
  const normal = calculateNormal(tangent);

  // Calculate curvature (simplified)
  const tangentLength = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
  const curvature = tangentLength === 0 ? 0 : 1 / tangentLength;

  return {
    point,
    tangent,
    normal,
    curvature,
  };
}

/**
 * Generate a Catmull-Rom spline from a series of control points
 */
export function generateCatmullRomSpline(points: Point[], options: CatmullRomOptions = {}): CatmullRomResult {
  if (points.length < 2) {
    return {
      points: [...points],
      length: 0,
      svgPath: "",
      segments: [],
    };
  }

  const tension = options.tension ?? 0.5;
  const pointsPerSegment = options.pointsPerSegment ?? 20;
  const closed = options.closed ?? false;
  const generateSVG = options.generateSVG !== false;

  const allPoints: Point[] = [];
  const segments: CatmullRomSegment[] = [];
  let totalLength = 0;

  // Handle closed spline by duplicating points
  const controlPoints: Point[] = closed
    ? [points[points.length - 1], ...points, points[0], points[1]]
    : [
        // Add virtual start point
        { x: 2 * points[0].x - points[1].x, y: 2 * points[0].y - points[1].y },
        ...points,
        // Add virtual end point
        {
          x: 2 * points[points.length - 1].x - points[points.length - 2].x,
          y: 2 * points[points.length - 1].y - points[points.length - 2].y,
        },
      ];

  // Generate segments
  for (let i = 1; i < controlPoints.length - 2; i++) {
    const segment: CatmullRomSegment = {
      p0: controlPoints[i - 1],
      p1: controlPoints[i],
      p2: controlPoints[i + 1],
      p3: controlPoints[i + 2],
    };
    segments.push(segment);

    // Generate points along this segment
    let prevPoint: Point | null = null;
    for (let j = 0; j <= pointsPerSegment; j++) {
      const t = j / pointsPerSegment;
      const point = evaluateCatmullRomSegment(segment, t, tension);
      allPoints.push(point);

      if (prevPoint) {
        const dx = point.x - prevPoint.x;
        const dy = point.y - prevPoint.y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
      }
      prevPoint = point;
    }
  }

  // Generate SVG path
  let svgPath = "";
  if (generateSVG && allPoints.length > 0) {
    svgPath = `M ${allPoints[0].x} ${allPoints[0].y}`;
    // Use Catmull-Rom spline command (S or C)
    // For simplicity, we'll use cubic bezier approximation
    for (let i = 1; i < allPoints.length; i++) {
      const point = allPoints[i];
      if (i === 1) {
        svgPath += ` L ${point.x} ${point.y}`;
      } else {
        // Use smooth curve approximation
        const prevPoint = allPoints[i - 1];
        const nextPoint = i < allPoints.length - 1 ? allPoints[i + 1] : point;
        const cp1x = prevPoint.x + (point.x - prevPoint.x) * 0.3;
        const cp1y = prevPoint.y + (point.y - prevPoint.y) * 0.3;
        const cp2x = point.x - (nextPoint.x - point.x) * 0.3;
        const cp2y = point.y - (nextPoint.y - point.y) * 0.3;
        svgPath += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${point.x} ${point.y}`;
      }
    }
    if (closed) {
      svgPath += " Z";
    }
  }

  return {
    points: allPoints,
    length: totalLength,
    svgPath,
    segments,
  };
}

/**
 * Generate a Catmull-Rom spline path string for SVG
 */
export function generateCatmullRomSVGPath(points: Point[], tension: number = 0.5, closed: boolean = false): string {
  if (points.length < 2) return "";

  const result = generateCatmullRomSpline(points, {
    tension,
    closed,
    generateSVG: true,
    pointsPerSegment: 20,
  });

  return result.svgPath;
}
