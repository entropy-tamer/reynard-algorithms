/**
 * NURBS Algorithms
 *
 * Implementation of Non-Uniform Rational B-Spline (NURBS) curve algorithms.
 */

import type { Point } from "../../../core/types/index.js";
import type { NURBS, NURBSConfig, NURBSResult, NURBSOptions, NURBSEvaluation } from "./nurbs-types.js";
import { generateUniformKnotVector, basisFunction } from "./b-spline-core.js";

/**
 * Evaluate a NURBS curve at parameter t
 * @param nurbs
 * @param t
 * @example
 */
export function evaluateNURBS(nurbs: NURBS, t: number): Point {
  const { controlPoints, weights, degree, knots: providedKnots, closed } = nurbs;

  // Validate weights
  if (weights.length !== controlPoints.length) {
    throw new Error(
      `Number of weights (${weights.length}) must match number of control points (${controlPoints.length})`
    );
  }

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
    throw new Error("Invalid knot vector: insufficient knots for degree");
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
  const lastKnot = knots[knots.length - degree - 1];
  if (lastKnot !== undefined && clampedT >= lastKnot) {
    span = knots.length - degree - 2;
  }

  // Evaluate using rational basis functions
  // Only evaluate basis functions for relevant control points (span-degree to span)
  let numeratorX = 0;
  let numeratorY = 0;
  let denominator = 0;
  const startIdx = Math.max(0, span - degree);
  const endIdx = Math.min(controlPoints.length, span + 1);

  for (let i = startIdx; i < endIdx; i++) {
    const weight = weights[i];
    const controlPoint = controlPoints[i];
    if (weight === undefined || controlPoint === undefined) {
      continue;
    }
    const basis = basisFunction(i, degree, clampedT, knots);
    const weightedBasis = weight * basis;
    numeratorX += controlPoint.x * weightedBasis;
    numeratorY += controlPoint.y * weightedBasis;
    denominator += weightedBasis;
  }

  // Avoid division by zero
  if (Math.abs(denominator) < 1e-10) {
    return { x: 0, y: 0 };
  }

  return {
    x: numeratorX / denominator,
    y: numeratorY / denominator,
  };
}

/**
 * Evaluate a NURBS curve with full information
 * @param nurbs
 * @param t
 * @example
 */
export function evaluateNURBSFull(nurbs: NURBS, t: number): NURBSEvaluation {
  const { controlPoints, weights, degree, knots: providedKnots, closed } = nurbs;

  // Validate weights
  if (weights.length !== controlPoints.length) {
    throw new Error(
      `Number of weights (${weights.length}) must match number of control points (${controlPoints.length})`
    );
  }

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
    throw new Error("Invalid knot vector: insufficient knots for degree");
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
  const lastKnot = knots[knots.length - degree - 1];
  if (lastKnot !== undefined && clampedT >= lastKnot) {
    span = knots.length - degree - 2;
  }

  // Evaluate point using rational basis functions
  // Only evaluate basis functions for relevant control points (span-degree to span)
  let numeratorX = 0;
  let numeratorY = 0;
  let denominator = 0;
  const basisValues: number[] = [];
  const startIdx = Math.max(0, span - degree);
  const endIdx = Math.min(controlPoints.length, span + 1);

  // First pass: calculate denominator
  for (let i = startIdx; i < endIdx; i++) {
    const weight = weights[i];
    if (weight === undefined) {
      continue;
    }
    const basis = basisFunction(i, degree, clampedT, knots);
    const weightedBasis = weight * basis;
    denominator += weightedBasis;
  }

  // Second pass: calculate numerators and basis values
  for (let i = 0; i < controlPoints.length; i++) {
    const weight = weights[i];
    const controlPoint = controlPoints[i];
    if (i >= startIdx && i < endIdx && weight !== undefined && controlPoint !== undefined) {
      const basis = basisFunction(i, degree, clampedT, knots);
      const weightedBasis = weight * basis;
      basisValues.push(denominator > 0 ? weightedBasis / denominator : 0);
      numeratorX += controlPoint.x * weightedBasis;
      numeratorY += controlPoint.y * weightedBasis;
    } else {
      basisValues.push(0);
    }
  }

  if (Math.abs(denominator) < 1e-10) {
    return {
      point: { x: 0, y: 0 },
      tangent: { x: 0, y: 0 },
      normal: { x: 0, y: 0 },
      curvature: 0,
      basisValues,
    };
  }

  const point = {
    x: numeratorX / denominator,
    y: numeratorY / denominator,
  };

  // Calculate tangent (derivative of rational function)
  let dNumeratorX = 0;
  let dNumeratorY = 0;
  let dDenominator = 0;

  for (let i = 0; i < controlPoints.length; i++) {
    const weight = weights[i];
    const controlPoint = controlPoints[i];
    if (weight === undefined || controlPoint === undefined) {
      continue;
    }
    // Derivative of basis function
    let derivBasis = 0;
    if (degree > 0) {
      const knotIDegree = knots[i + degree];
      const knotI = knots[i];
      const knotIDegreePlus1 = knots[i + degree + 1];
      const knotIPlus1 = knots[i + 1];
      const left =
        knotIDegree !== undefined && knotI !== undefined && knotIDegree !== knotI
          ? (degree / (knotIDegree - knotI)) * basisFunction(i, degree - 1, clampedT, knots)
          : 0;
      const right =
        knotIDegreePlus1 !== undefined && knotIPlus1 !== undefined && knotIDegreePlus1 !== knotIPlus1
          ? (degree / (knotIDegreePlus1 - knotIPlus1)) * basisFunction(i + 1, degree - 1, clampedT, knots)
          : 0;
      derivBasis = left - right;
    }
    const weightedDerivBasis = weight * derivBasis;
    dNumeratorX += controlPoint.x * weightedDerivBasis;
    dNumeratorY += controlPoint.y * weightedDerivBasis;
    dDenominator += weightedDerivBasis;
  }

  // Quotient rule: (f/g)' = (f'g - fg') / g^2
  const tangentX = (dNumeratorX * denominator - numeratorX * dDenominator) / (denominator * denominator);
  const tangentY = (dNumeratorY * denominator - numeratorY * dDenominator) / (denominator * denominator);

  const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
  const normalizedTangent =
    tangentLength > 0 ? { x: tangentX / tangentLength, y: tangentY / tangentLength } : { x: 0, y: 0 };

  // Normal is perpendicular to tangent
  const normal = { x: -normalizedTangent.y, y: normalizedTangent.x };

  // Calculate curvature (simplified)
  const curvature =
    tangentLength > 0
      ? Math.abs(tangentX * tangentY - tangentY * tangentX) / (tangentLength * tangentLength * tangentLength)
      : 0;

  return {
    point,
    tangent: normalizedTangent,
    normal,
    curvature: isNaN(curvature) ? 0 : curvature,
    basisValues,
  };
}

/**
 * Generate points along a NURBS curve
 * @param nurbs
 * @param options
 * @example
 */
export function generateNURBSPoints(nurbs: NURBS, options: NURBSOptions = {}): NURBSResult {
  const { controlPoints, weights, degree, knots: providedKnots, closed } = nurbs;
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
    throw new Error("Invalid knot vector: insufficient knots for degree");
  }

  const points: Point[] = [];
  let totalLength = 0;
  let prevPoint: Point | null = null;

  for (let i = 0; i <= numPoints; i++) {
    const t = tMin + ((tMax - tMin) * i) / numPoints;
    const point = evaluateNURBS(nurbs, t);
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
    if (firstPoint !== undefined) {
      svgPath = `M ${firstPoint.x} ${firstPoint.y}`;
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point !== undefined) {
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
    weights: [...weights],
  };
}

/**
 * NURBS class for convenient usage
 */
export class NURBSCurve {
  private nurbs: NURBS;
  private config: NURBSConfig;

  /**
   *
   * @param controlPoints
   * @param weights
   * @param config
   * @example
   */
  constructor(controlPoints: Point[], weights: number[], config: Partial<NURBSConfig> = {}) {
    this.config = {
      degree: 3,
      numPoints: 50,
      arcLengthPrecision: 0.001,
      ...config,
    };

    if (weights.length !== controlPoints.length) {
      throw new Error(
        `Number of weights (${weights.length}) must match number of control points (${controlPoints.length})`
      );
    }

    this.nurbs = {
      controlPoints,
      weights,
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
    return evaluateNURBS(this.nurbs, t);
  }

  /**
   * Evaluate the curve with full information
   * @param t
   * @example
   */
  evaluateFull(t: number): NURBSEvaluation {
    return evaluateNURBSFull(this.nurbs, t);
  }

  /**
   * Generate points along the curve
   * @param options
   * @example
   */
  generatePoints(options: NURBSOptions = {}): NURBSResult {
    return generateNURBSPoints(this.nurbs, options);
  }

  /**
   * Set the knot vector
   * @param knots
   * @example
   */
  setKnots(knots: number[]): void {
    this.nurbs.knots = knots;
  }

  /**
   * Get the knot vector
   * @example
   */
  getKnots(): number[] {
    if (this.nurbs.knots) {
      return [...this.nurbs.knots];
    }
    return generateUniformKnotVector({
      degree: this.nurbs.degree,
      numControlPoints: this.nurbs.controlPoints.length,
      ...(this.nurbs.closed !== undefined && { closed: this.nurbs.closed }),
    });
  }

  /**
   * Set weights
   * @param weights
   * @example
   */
  setWeights(weights: number[]): void {
    if (weights.length !== this.nurbs.controlPoints.length) {
      throw new Error(
        `Number of weights (${weights.length}) must match number of control points (${this.nurbs.controlPoints.length})`
      );
    }
    this.nurbs.weights = [...weights];
  }

  /**
   * Get weights
   * @example
   */
  getWeights(): number[] {
    return [...this.nurbs.weights];
  }
}
