/**
 * B-Spline Algorithms
 *
 * Implementation of B-Spline curve algorithms for smooth curve generation.
 * Supports both uniform and non-uniform B-splines.
 */

import type { Point } from "../../../core/types/index.js";
import type {
  BSpline,
  BSplineConfig,
  BSplineResult,
  BSplineOptions,
  BSplineEvaluation,
  KnotVectorOptions,
} from "./b-spline-types.js";

/**
 * Generate a uniform knot vector
 */
export function generateUniformKnotVector(options: KnotVectorOptions): number[] {
  const { degree, numControlPoints, closed } = options;
  const n = numControlPoints - 1;
  const m = n + degree + 1;
  const knots: number[] = [];

  if (closed) {
    // Periodic/closed B-spline
    for (let i = 0; i <= m; i++) {
      knots.push(i);
    }
  } else {
    // Open B-spline (clamped)
    // First (degree + 1) knots are 0
    for (let i = 0; i <= degree; i++) {
      knots.push(0);
    }
    // Middle knots are evenly spaced
    for (let i = 1; i <= n - degree; i++) {
      knots.push(i);
    }
    // Last (degree + 1) knots are max
    const maxKnot = n - degree + 1;
    for (let i = 0; i <= degree; i++) {
      knots.push(maxKnot);
    }
  }

  return knots;
}

/**
 * Generate a non-uniform knot vector
 */
export function generateNonUniformKnotVector(options: KnotVectorOptions): number[] {
  const { customKnots, degree, numControlPoints } = options;

  if (customKnots) {
    // Validate knot vector
    if (customKnots.length !== numControlPoints + degree + 1) {
      throw new Error(`Knot vector length must be ${numControlPoints + degree + 1}, got ${customKnots.length}`);
    }
    // Check non-decreasing
    for (let i = 1; i < customKnots.length; i++) {
      if (customKnots[i] < customKnots[i - 1]) {
        throw new Error("Knot vector must be non-decreasing");
      }
    }
    return [...customKnots];
  }

  // Default to uniform if no custom knots provided
  return generateUniformKnotVector(options);
}

/**
 * Calculate B-spline basis function N(i,p,t) using Cox-de Boor recursion
 */
export function basisFunction(i: number, p: number, t: number, knots: number[]): number {
  // Bounds checking
  if (i < 0 || i >= knots.length - 1 || p < 0) {
    return 0;
  }

  // Base case: degree 0
  if (p === 0) {
    if (i + 1 >= knots.length) return 0;
    // Handle last knot specially (closed interval)
    if (i === knots.length - 2 && t === knots[knots.length - 1]) {
      return 1;
    }
    return knots[i] <= t && t < knots[i + 1] ? 1 : 0;
  }

  // Bounds check for recursive calls
  if (i + p >= knots.length || i + p + 1 >= knots.length) {
    return 0;
  }

  // Recursive case
  const left =
    knots[i + p] !== knots[i] ? ((t - knots[i]) / (knots[i + p] - knots[i])) * basisFunction(i, p - 1, t, knots) : 0;
  const right =
    knots[i + p + 1] !== knots[i + 1] && i + 1 < knots.length
      ? ((knots[i + p + 1] - t) / (knots[i + p + 1] - knots[i + 1])) * basisFunction(i + 1, p - 1, t, knots)
      : 0;

  return left + right;
}

/**
 * Evaluate a B-spline curve at parameter t
 */
export function evaluateBSpline(spline: BSpline, t: number): Point {
  const { controlPoints, degree, knots: providedKnots, closed } = spline;

  // Generate knot vector if not provided
  const knots =
    providedKnots ||
    generateUniformKnotVector({
      degree,
      numControlPoints: controlPoints.length,
      closed,
    });

  // Clamp t to valid range
  const tMin = knots[degree];
  const tMax = knots[knots.length - degree - 1];
  const clampedT = Math.max(tMin, Math.min(tMax, t));

  // Find the knot span
  let span = degree;
  for (let i = degree; i < knots.length - degree - 1; i++) {
    if (clampedT >= knots[i] && clampedT < knots[i + 1]) {
      span = i;
      break;
    }
  }
  if (clampedT >= knots[knots.length - degree - 1]) {
    span = knots.length - degree - 2;
  }

  // Evaluate using basis functions
  // Only evaluate basis functions for relevant control points (span-degree to span)
  let x = 0;
  let y = 0;
  const startIdx = Math.max(0, span - degree);
  const endIdx = Math.min(controlPoints.length, span + 1);

  for (let i = startIdx; i < endIdx; i++) {
    const basis = basisFunction(i, degree, clampedT, knots);
    x += controlPoints[i].x * basis;
    y += controlPoints[i].y * basis;
  }

  return { x, y };
}

/**
 * Evaluate a B-spline curve with full information
 */
export function evaluateBSplineFull(spline: BSpline, t: number): BSplineEvaluation {
  const { controlPoints, degree, knots: providedKnots, closed } = spline;

  // Generate knot vector if not provided
  const knots =
    providedKnots ||
    generateUniformKnotVector({
      degree,
      numControlPoints: controlPoints.length,
      closed,
    });

  // Clamp t to valid range
  const tMin = knots[degree];
  const tMax = knots[knots.length - degree - 1];
  const clampedT = Math.max(tMin, Math.min(tMax, t));

  // Find the knot span
  let span = degree;
  for (let i = degree; i < knots.length - degree - 1; i++) {
    if (clampedT >= knots[i] && clampedT < knots[i + 1]) {
      span = i;
      break;
    }
  }
  if (clampedT >= knots[knots.length - degree - 1]) {
    span = knots.length - degree - 2;
  }

  // Evaluate point and basis values
  // Only evaluate basis functions for relevant control points (span-degree to span)
  let x = 0;
  let y = 0;
  const basisValues: number[] = [];
  const startIdx = Math.max(0, span - degree);
  const endIdx = Math.min(controlPoints.length, span + 1);

  for (let i = 0; i < controlPoints.length; i++) {
    if (i >= startIdx && i < endIdx) {
      const basis = basisFunction(i, degree, clampedT, knots);
      basisValues.push(basis);
      x += controlPoints[i].x * basis;
      y += controlPoints[i].y * basis;
    } else {
      basisValues.push(0);
    }
  }

  const point = { x, y };

  // Calculate tangent (derivative)
  let dx = 0;
  let dy = 0;

  for (let i = 0; i < controlPoints.length; i++) {
    // Derivative of basis function
    let derivBasis = 0;
    if (degree > 0) {
      const left =
        knots[i + degree] !== knots[i]
          ? (degree / (knots[i + degree] - knots[i])) * basisFunction(i, degree - 1, clampedT, knots)
          : 0;
      const right =
        knots[i + degree + 1] !== knots[i + 1]
          ? (degree / (knots[i + degree + 1] - knots[i + 1])) * basisFunction(i + 1, degree - 1, clampedT, knots)
          : 0;
      derivBasis = left - right;
    }
    dx += controlPoints[i].x * derivBasis;
    dy += controlPoints[i].y * derivBasis;
  }

  const tangent = { x: dx, y: dy };
  const tangentLength = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
  const normalizedTangent =
    tangentLength > 0 ? { x: tangent.x / tangentLength, y: tangent.y / tangentLength } : { x: 0, y: 0 };

  // Normal is perpendicular to tangent
  const normal = { x: -normalizedTangent.y, y: normalizedTangent.x };

  // Calculate curvature (simplified)
  const curvature =
    tangentLength > 0 ? Math.abs(dx * dy - dy * dx) / (tangentLength * tangentLength * tangentLength) : 0;

  return {
    point,
    tangent: normalizedTangent,
    normal,
    curvature: isNaN(curvature) ? 0 : curvature,
    basisValues,
  };
}

/**
 * Generate points along a B-spline curve
 */
export function generateBSplinePoints(spline: BSpline, options: BSplineOptions = {}): BSplineResult {
  const { controlPoints, degree, knots: providedKnots, closed } = spline;
  const numPoints = options.numPoints ?? 50;

  // Generate knot vector if not provided
  const knots =
    providedKnots ||
    generateUniformKnotVector({
      degree,
      numControlPoints: controlPoints.length,
      closed,
    });

  const tMin = knots[degree];
  const tMax = knots[knots.length - degree - 1];

  const points: Point[] = [];
  let totalLength = 0;
  let prevPoint: Point | null = null;

  for (let i = 0; i <= numPoints; i++) {
    const t = tMin + ((tMax - tMin) * i) / numPoints;
    const point = evaluateBSpline(spline, t);
    points.push(point);

    if (prevPoint) {
      const dx = point.x - prevPoint.x;
      const dy = point.y - prevPoint.y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }
    prevPoint = point;
  }

  // Generate SVG path
  let svgPath = "";
  if (options.generateSVG !== false) {
    svgPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      svgPath += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  return {
    points,
    length: totalLength,
    svgPath,
    knots,
    controlPoints,
  };
}

/**
 * B-Spline class for convenient usage
 */
export class BSplineCurve {
  private spline: BSpline;
  private config: BSplineConfig;

  constructor(controlPoints: Point[], config: Partial<BSplineConfig> = {}) {
    this.config = {
      degree: 3,
      uniform: true,
      numPoints: 50,
      arcLengthPrecision: 0.001,
      ...config,
    };

    this.spline = {
      controlPoints,
      degree: this.config.degree ?? 3,
      knots: config.uniform === false ? undefined : undefined, // Will be generated
      closed: false,
    };
  }

  /**
   * Evaluate the curve at parameter t
   */
  evaluate(t: number): Point {
    return evaluateBSpline(this.spline, t);
  }

  /**
   * Evaluate the curve with full information
   */
  evaluateFull(t: number): BSplineEvaluation {
    return evaluateBSplineFull(this.spline, t);
  }

  /**
   * Generate points along the curve
   */
  generatePoints(options: BSplineOptions = {}): BSplineResult {
    return generateBSplinePoints(this.spline, options);
  }

  /**
   * Set the knot vector
   */
  setKnots(knots: number[]): void {
    this.spline.knots = knots;
  }

  /**
   * Get the knot vector
   */
  getKnots(): number[] {
    if (this.spline.knots) {
      return [...this.spline.knots];
    }
    return generateUniformKnotVector({
      degree: this.spline.degree,
      numControlPoints: this.spline.controlPoints.length,
      closed: this.spline.closed,
    });
  }
}
