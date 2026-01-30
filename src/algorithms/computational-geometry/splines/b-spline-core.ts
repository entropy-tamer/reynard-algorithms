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
  BSplineEvaluation,
  BSplineOptions,
  BSplineResult,
  KnotVectorOptions,
} from "./b-spline-types.js";

/**
 * Generate a uniform knot vector
 * @param options
 * @example
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
 * @param options
 * @example
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
      const current = customKnots[i];
      const previous = customKnots[i - 1];
      if (current !== undefined && previous !== undefined && current < previous) {
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
 * @param i
 * @param p
 * @param t
 * @param knots
 * @example
 */
export function basisFunction(i: number, p: number, t: number, knots: number[]): number {
  // Bounds checking
  if (i < 0 || i >= knots.length - 1 || p < 0) {
    return 0;
  }

  // Base case: degree 0
  if (p === 0) {
    if (i + 1 >= knots.length) return 0;
    const knotI = knots[i];
    const knotIPlus1 = knots[i + 1];
    const lastKnot = knots[knots.length - 1];

    if (knotI === undefined || knotIPlus1 === undefined) return 0;

    // Handle last knot specially (closed interval)
    if (i === knots.length - 2 && lastKnot !== undefined && t === lastKnot) {
      return 1;
    }
    return knotI <= t && t < knotIPlus1 ? 1 : 0;
  }

  // Bounds check for recursive calls
  if (i + p >= knots.length || i + p + 1 >= knots.length) {
    return 0;
  }

  // Recursive case
  const knotI = knots[i];
  const knotIP = knots[i + p];
  const knotIPlus1 = knots[i + 1];
  const knotIPlusPPlus1 = knots[i + p + 1];

  let left = 0;
  if (knotI !== undefined && knotIP !== undefined && knotIP !== knotI) {
    left = ((t - knotI) / (knotIP - knotI)) * basisFunction(i, p - 1, t, knots);
  }

  let right = 0;
  if (
    knotIPlus1 !== undefined &&
    knotIPlusPPlus1 !== undefined &&
    knotIPlusPPlus1 !== knotIPlus1 &&
    i + 1 < knots.length
  ) {
    right = ((knotIPlusPPlus1 - t) / (knotIPlusPPlus1 - knotIPlus1)) * basisFunction(i + 1, p - 1, t, knots);
  }

  return left + right;
}

/**
 * Evaluate a B-spline curve at parameter t
 * @param spline
 * @param t
 * @example
 */
export function evaluateBSpline(spline: BSpline, t: number): Point {
  const { controlPoints, degree, knots: providedKnots, closed } = spline;

  // Generate knot vector if not provided
  const knots =
    providedKnots ||
    generateUniformKnotVector({
      degree,
      numControlPoints: controlPoints.length,
      ...(closed !== undefined && { closed }),
    });

  // Clamp t to valid range
  const tMin = knots[degree];
  const tMax = knots[knots.length - degree - 1];

  if (tMin === undefined || tMax === undefined) {
    throw new Error("Invalid knot vector: unable to determine valid parameter range");
  }

  const clampedT = Math.max(tMin, Math.min(tMax, t));

  // Find the knot span
  let span = degree;
  for (let i = degree; i < knots.length - degree - 1; i++) {
    const knotI = knots[i];
    const knotIPlus1 = knots[i + 1];
    if (knotI !== undefined && knotIPlus1 !== undefined && clampedT >= knotI && clampedT < knotIPlus1) {
      span = i;
      break;
    }
  }
  const lastValidKnot = knots[knots.length - degree - 1];
  if (lastValidKnot !== undefined && clampedT >= lastValidKnot) {
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
    const point = controlPoints[i];
    if (point) {
      x += point.x * basis;
      y += point.y * basis;
    }
  }

  return { x, y };
}

/**
 * Evaluate a B-spline curve with full information
 * @param spline
 * @param t
 * @example
 */
export function evaluateBSplineFull(spline: BSpline, t: number): BSplineEvaluation {
  const { controlPoints, degree, knots: providedKnots, closed } = spline;

  // Generate knot vector if not provided
  const knots =
    providedKnots ||
    generateUniformKnotVector({
      degree,
      numControlPoints: controlPoints.length,
      ...(closed !== undefined && { closed }),
    });

  // Clamp t to valid range
  const tMin = knots[degree];
  const tMax = knots[knots.length - degree - 1];

  if (tMin === undefined || tMax === undefined) {
    throw new Error("Invalid knot vector: unable to determine valid parameter range");
  }

  const clampedT = Math.max(tMin, Math.min(tMax, t));

  // Find the knot span
  let span = degree;
  for (let i = degree; i < knots.length - degree - 1; i++) {
    const knotI = knots[i];
    const knotIPlus1 = knots[i + 1];
    if (knotI !== undefined && knotIPlus1 !== undefined && clampedT >= knotI && clampedT < knotIPlus1) {
      span = i;
      break;
    }
  }
  const lastValidKnot = knots[knots.length - degree - 1];
  if (lastValidKnot !== undefined && clampedT >= lastValidKnot) {
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
      const point = controlPoints[i];
      if (point) {
        basisValues.push(basis);
        x += point.x * basis;
        y += point.y * basis;
      } else {
        basisValues.push(0);
      }
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
      const knotI = knots[i];
      const knotIDegree = knots[i + degree];
      const knotIDegreePlus1 = knots[i + degree + 1];
      const knotIPlus1 = knots[i + 1];

      if (knotI !== undefined && knotIDegree !== undefined && knotIDegree !== knotI) {
        const left = (degree / (knotIDegree - knotI)) * basisFunction(i, degree - 1, clampedT, knots);
        derivBasis += left;
      }

      if (knotIPlus1 !== undefined && knotIDegreePlus1 !== undefined && knotIDegreePlus1 !== knotIPlus1) {
        const right = (degree / (knotIDegreePlus1 - knotIPlus1)) * basisFunction(i + 1, degree - 1, clampedT, knots);
        derivBasis -= right;
      }
    }
    const point = controlPoints[i];
    if (point) {
      dx += point.x * derivBasis;
      dy += point.y * derivBasis;
    }
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
 * @param spline
 * @param options
 * @example
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
      ...(closed !== undefined && { closed }),
    });

  const tMin = knots[degree];
  const tMax = knots[knots.length - degree - 1];

  if (tMin === undefined || tMax === undefined) {
    throw new Error("Invalid knot vector: unable to determine valid parameter range");
  }

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
  if (options.generateSVG !== false && points.length > 0) {
    const firstPoint = points[0];
    if (firstPoint) {
      svgPath = `M ${firstPoint.x} ${firstPoint.y}`;
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point) {
          svgPath += ` L ${point.x} ${point.y}`;
        }
      }
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

  /**
   *
   * @param controlPoints
   * @param config
   * @example
   */
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
      closed: false,
    };
  }

  /**
   * Evaluate the curve at parameter t
   * @param t
   * @example
   */
  evaluate(t: number): Point {
    return evaluateBSpline(this.spline, t);
  }

  /**
   * Evaluate the curve with full information
   * @param t
   * @example
   */
  evaluateFull(t: number): BSplineEvaluation {
    return evaluateBSplineFull(this.spline, t);
  }

  /**
   * Generate points along the curve
   * @param options
   * @example
   */
  generatePoints(options: BSplineOptions = {}): BSplineResult {
    return generateBSplinePoints(this.spline, options);
  }

  /**
   * Set the knot vector
   * @param knots
   * @example
   */
  setKnots(knots: number[]): void {
    this.spline.knots = knots;
  }

  /**
   * Get the knot vector
   * @example
   */
  getKnots(): number[] {
    if (this.spline.knots) {
      return [...this.spline.knots];
    }
    return generateUniformKnotVector({
      degree: this.spline.degree,
      numControlPoints: this.spline.controlPoints.length,
      ...(this.spline.closed !== undefined && { closed: this.spline.closed }),
    });
  }
}
