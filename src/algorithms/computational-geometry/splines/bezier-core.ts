/**
 * Bezier Curve Algorithms
 *
 * Implementation of Bezier curve algorithms for smooth curve generation.
 * Supports both quadratic (3 points) and cubic (4 points) Bezier curves.
 */

import type { Point } from "../../../core/types/index.js";
import type {
  BezierConfig,
  BezierResult,
  QuadraticBezier,
  CubicBezier,
  BezierOptions,
  BezierEvaluation,
} from "./bezier-types.js";

/**
 * Evaluate a quadratic Bezier curve at parameter t (0 to 1)
 */
export function evaluateQuadraticBezier(
  curve: QuadraticBezier,
  t: number
): Point {
  const { p0, p1, p2 } = curve;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x: mt2 * p0.x + 2 * mt * t * p1.x + t2 * p2.x,
    y: mt2 * p0.y + 2 * mt * t * p1.y + t2 * p2.y,
  };
}

/**
 * Evaluate a cubic Bezier curve at parameter t (0 to 1)
 */
export function evaluateCubicBezier(curve: CubicBezier, t: number): Point {
  const { p0, p1, p2, p3 } = curve;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
}

/**
 * Calculate the derivative (tangent) of a quadratic Bezier curve at parameter t
 */
export function derivativeQuadraticBezier(
  curve: QuadraticBezier,
  t: number
): Point {
  const { p0, p1, p2 } = curve;
  const mt = 1 - t;

  return {
    x: 2 * mt * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
    y: 2 * mt * (p1.y - p0.y) + 2 * t * (p2.y - p1.y),
  };
}

/**
 * Calculate the derivative (tangent) of a cubic Bezier curve at parameter t
 */
export function derivativeCubicBezier(curve: CubicBezier, t: number): Point {
  const { p0, p1, p2, p3 } = curve;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x: 3 * mt2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x),
    y: 3 * mt2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y),
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
 * Calculate curvature at a point on the curve
 */
function calculateCurvature(
  tangent: Point,
  secondDerivative: Point
): number {
  const cross = tangent.x * secondDerivative.y - tangent.y * secondDerivative.x;
  const tangentLength = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
  const curvature = Math.abs(cross) / (tangentLength * tangentLength * tangentLength);
  return isNaN(curvature) ? 0 : curvature;
}

/**
 * Evaluate a quadratic Bezier curve with additional information
 */
export function evaluateQuadraticBezierFull(
  curve: QuadraticBezier,
  t: number
): BezierEvaluation {
  const point = evaluateQuadraticBezier(curve, t);
  const tangent = derivativeQuadraticBezier(curve, t);
  const normal = calculateNormal(tangent);

  // Second derivative for curvature
  const { p0, p1, p2 } = curve;
  const secondDerivative = {
    x: 2 * (p2.x - 2 * p1.x + p0.x),
    y: 2 * (p2.y - 2 * p1.y + p0.y),
  };
  const curvature = calculateCurvature(tangent, secondDerivative);

  return {
    point,
    tangent,
    normal,
    curvature,
  };
}

/**
 * Evaluate a cubic Bezier curve with additional information
 */
export function evaluateCubicBezierFull(
  curve: CubicBezier,
  t: number
): BezierEvaluation {
  const point = evaluateCubicBezier(curve, t);
  const tangent = derivativeCubicBezier(curve, t);
  const normal = calculateNormal(tangent);

  // Second derivative for curvature
  const { p0, p1, p2, p3 } = curve;
  const mt = 1 - t;
  const secondDerivative = {
    x: 6 * mt * (p2.x - 2 * p1.x + p0.x) + 6 * t * (p3.x - 2 * p2.x + p1.x),
    y: 6 * mt * (p2.y - 2 * p1.y + p0.y) + 6 * t * (p3.y - 2 * p2.y + p1.y),
  };
  const curvature = calculateCurvature(tangent, secondDerivative);

  return {
    point,
    tangent,
    normal,
    curvature,
  };
}

/**
 * Generate points along a quadratic Bezier curve
 */
export function generateQuadraticBezierPoints(
  curve: QuadraticBezier,
  options: BezierOptions = {}
): BezierResult {
  const numPoints = options.numPoints ?? 50;
  const points: Point[] = [];
  let totalLength = 0;
  let prevPoint: Point | null = null;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const point = evaluateQuadraticBezier(curve, t);
    points.push(point);

    if (prevPoint) {
      const dx = point.x - prevPoint.x;
      const dy = point.y - prevPoint.y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }
    prevPoint = point;
  }

  // Generate SVG path
  const svgPath = options.generateSVG !== false
    ? `M ${curve.p0.x} ${curve.p0.y} Q ${curve.p1.x} ${curve.p1.y} ${curve.p2.x} ${curve.p2.y}`
    : "";

  return {
    points,
    length: totalLength,
    svgPath,
  };
}

/**
 * Generate points along a cubic Bezier curve
 */
export function generateCubicBezierPoints(
  curve: CubicBezier,
  options: BezierOptions = {}
): BezierResult {
  const numPoints = options.numPoints ?? 50;
  const points: Point[] = [];
  let totalLength = 0;
  let prevPoint: Point | null = null;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const point = evaluateCubicBezier(curve, t);
    points.push(point);

    if (prevPoint) {
      const dx = point.x - prevPoint.x;
      const dy = point.y - prevPoint.y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }
    prevPoint = point;
  }

  // Generate SVG path
  const svgPath = options.generateSVG !== false
    ? `M ${curve.p0.x} ${curve.p0.y} C ${curve.p1.x} ${curve.p1.y} ${curve.p2.x} ${curve.p2.y} ${curve.p3.x} ${curve.p3.y}`
    : "";

  return {
    points,
    length: totalLength,
    svgPath,
  };
}

/**
 * Convert a quadratic Bezier to cubic Bezier (for uniform handling)
 */
export function quadraticToCubic(curve: QuadraticBezier): CubicBezier {
  const { p0, p1, p2 } = curve;
  // Convert quadratic to cubic by adding a control point
  return {
    p0,
    p1: {
      x: p0.x + (2 / 3) * (p1.x - p0.x),
      y: p0.y + (2 / 3) * (p1.y - p0.y),
    },
    p2: {
      x: p2.x + (2 / 3) * (p1.x - p2.x),
      y: p2.y + (2 / 3) * (p1.y - p2.y),
    },
    p3: p2,
  };
}

