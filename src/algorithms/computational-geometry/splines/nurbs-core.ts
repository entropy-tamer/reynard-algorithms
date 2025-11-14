/**
 * NURBS Algorithms
 *
 * Implementation of Non-Uniform Rational B-Spline (NURBS) curve algorithms.
 */

import type { Point } from "../../../core/types/index.js";
import type { NURBS, NURBSConfig, NURBSResult, NURBSOptions, NURBSEvaluation } from "./nurbs-types.js";
import { generateUniformKnotVector, generateNonUniformKnotVector, basisFunction } from "./b-spline-core.js";
import type { KnotVectorOptions } from "./b-spline-types.js";

/**
 * Evaluate a NURBS curve at parameter t
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

  // Evaluate using rational basis functions
  // Only evaluate basis functions for relevant control points (span-degree to span)
  let numeratorX = 0;
  let numeratorY = 0;
  let denominator = 0;
  const startIdx = Math.max(0, span - degree);
  const endIdx = Math.min(controlPoints.length, span + 1);

  for (let i = startIdx; i < endIdx; i++) {
    const basis = basisFunction(i, degree, clampedT, knots);
    const weightedBasis = weights[i] * basis;
    numeratorX += controlPoints[i].x * weightedBasis;
    numeratorY += controlPoints[i].y * weightedBasis;
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
    const basis = basisFunction(i, degree, clampedT, knots);
    const weightedBasis = weights[i] * basis;
    denominator += weightedBasis;
  }

  // Second pass: calculate numerators and basis values
  for (let i = 0; i < controlPoints.length; i++) {
    if (i >= startIdx && i < endIdx) {
      const basis = basisFunction(i, degree, clampedT, knots);
      const weightedBasis = weights[i] * basis;
      basisValues.push(denominator > 0 ? weightedBasis / denominator : 0);
      numeratorX += controlPoints[i].x * weightedBasis;
      numeratorY += controlPoints[i].y * weightedBasis;
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
    const weightedDerivBasis = weights[i] * derivBasis;
    dNumeratorX += controlPoints[i].x * weightedDerivBasis;
    dNumeratorY += controlPoints[i].y * weightedDerivBasis;
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
      closed,
    });

  const tMin = knots[degree];
  const tMax = knots[knots.length - degree - 1];

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
    weights: [...weights],
  };
}

/**
 * NURBS class for convenient usage
 */
export class NURBSCurve {
  private nurbs: NURBS;
  private config: NURBSConfig;

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
      knots: undefined, // Will be generated
      closed: false,
    };
  }

  /**
   * Evaluate the curve at parameter t
   */
  evaluate(t: number): Point {
    return evaluateNURBS(this.nurbs, t);
  }

  /**
   * Evaluate the curve with full information
   */
  evaluateFull(t: number): NURBSEvaluation {
    return evaluateNURBSFull(this.nurbs, t);
  }

  /**
   * Generate points along the curve
   */
  generatePoints(options: NURBSOptions = {}): NURBSResult {
    return generateNURBSPoints(this.nurbs, options);
  }

  /**
   * Set the knot vector
   */
  setKnots(knots: number[]): void {
    this.nurbs.knots = knots;
  }

  /**
   * Get the knot vector
   */
  getKnots(): number[] {
    if (this.nurbs.knots) {
      return [...this.nurbs.knots];
    }
    return generateUniformKnotVector({
      degree: this.nurbs.degree,
      numControlPoints: this.nurbs.controlPoints.length,
      closed: this.nurbs.closed,
    });
  }

  /**
   * Set weights
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
   */
  getWeights(): number[] {
    return [...this.nurbs.weights];
  }
}
