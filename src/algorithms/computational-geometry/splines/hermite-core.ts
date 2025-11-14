/**
 * Hermite Spline Algorithms
 *
 * Implementation of Hermite spline algorithms for smooth curve interpolation
 * with explicit tangent control.
 */

import type { Point } from "../../../core/types/index.js";
import type {
  HermiteConfig,
  HermiteResult,
  HermiteSegment,
  HermiteOptions,
  HermiteEvaluation,
} from "./hermite-types.js";

/**
 * Evaluate a Hermite spline segment at parameter t (0 to 1)
 * Uses cubic Hermite interpolation: H(t) = h00(t)*P0 + h10(t)*T0 + h01(t)*P1 + h11(t)*T1
 */
export function evaluateHermiteSegment(segment: HermiteSegment, t: number): Point {
  const { p0, p1, t0, t1 } = segment;

  // Hermite basis functions
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1; // H00
  const h10 = t3 - 2 * t2 + t; // H10
  const h01 = -2 * t3 + 3 * t2; // H01
  const h11 = t3 - t2; // H11

  return {
    x: h00 * p0.x + h10 * t0.x + h01 * p1.x + h11 * t1.x,
    y: h00 * p0.y + h10 * t0.y + h01 * p1.y + h11 * t1.y,
  };
}

/**
 * Calculate the derivative (tangent) of a Hermite segment at parameter t
 */
export function derivativeHermiteSegment(segment: HermiteSegment, t: number): Point {
  const { p0, p1, t0, t1 } = segment;

  // Derivatives of Hermite basis functions
  const t2 = t * t;
  const dh00 = 6 * t2 - 6 * t; // dH00/dt
  const dh10 = 3 * t2 - 4 * t + 1; // dH10/dt
  const dh01 = -6 * t2 + 6 * t; // dH01/dt
  const dh11 = 3 * t2 - 2 * t; // dH11/dt

  return {
    x: dh00 * p0.x + dh10 * t0.x + dh01 * p1.x + dh11 * t1.x,
    y: dh00 * p0.y + dh10 * t0.y + dh01 * p1.y + dh11 * t1.y,
  };
}

/**
 * Calculate the second derivative of a Hermite segment at parameter t
 */
function secondDerivativeHermiteSegment(segment: HermiteSegment, t: number): Point {
  const { p0, p1, t0, t1 } = segment;

  // Second derivatives of Hermite basis functions
  const d2h00 = 12 * t - 6; // d²H00/dt²
  const d2h10 = 6 * t - 4; // d²H10/dt²
  const d2h01 = -12 * t + 6; // d²H01/dt²
  const d2h11 = 6 * t - 2; // d²H11/dt²

  return {
    x: d2h00 * p0.x + d2h10 * t0.x + d2h01 * p1.x + d2h11 * t1.x,
    y: d2h00 * p0.y + d2h10 * t0.y + d2h01 * p1.y + d2h11 * t1.y,
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
function calculateCurvature(tangent: Point, secondDerivative: Point): number {
  const cross = tangent.x * secondDerivative.y - tangent.y * secondDerivative.x;
  const tangentLength = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
  const curvature = Math.abs(cross) / (tangentLength * tangentLength * tangentLength);
  return isNaN(curvature) ? 0 : curvature;
}

/**
 * Evaluate a Hermite segment with additional information
 */
export function evaluateHermiteSegmentFull(segment: HermiteSegment, t: number): HermiteEvaluation {
  const point = evaluateHermiteSegment(segment, t);
  const tangent = derivativeHermiteSegment(segment, t);
  const normal = calculateNormal(tangent);
  const secondDerivative = secondDerivativeHermiteSegment(segment, t);
  const curvature = calculateCurvature(tangent, secondDerivative);

  return {
    point,
    tangent,
    normal,
    curvature,
  };
}

/**
 * Generate a Hermite spline from segments
 */
export function generateHermiteSpline(segments: HermiteSegment[], options: HermiteOptions = {}): HermiteResult {
  if (segments.length === 0) {
    return {
      points: [],
      length: 0,
      svgPath: "",
      segments: [],
    };
  }

  const pointsPerSegment = options.pointsPerSegment ?? 20;
  const points: Point[] = [];
  let totalLength = 0;
  let prevPoint: Point | null = null;

  for (const segment of segments) {
    for (let i = 0; i <= pointsPerSegment; i++) {
      const t = i / pointsPerSegment;
      const point = evaluateHermiteSegment(segment, t);
      points.push(point);

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
  if (options.generateSVG !== false) {
    if (points.length > 0) {
      svgPath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        svgPath += ` L ${points[i].x} ${points[i].y}`;
      }
    }
  }

  return {
    points,
    length: totalLength,
    svgPath,
    segments: [...segments],
  };
}

/**
 * Generate Hermite segments from points and tangents
 */
export function createHermiteSegments(points: Point[], tangents: Point[], closed: boolean = false): HermiteSegment[] {
  if (points.length < 2) {
    return [];
  }

  if (tangents.length !== points.length) {
    throw new Error(`Number of tangents (${tangents.length}) must match number of points (${points.length})`);
  }

  const segments: HermiteSegment[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    segments.push({
      p0: points[i],
      p1: points[i + 1],
      t0: tangents[i],
      t1: tangents[i + 1],
    });
  }

  if (closed && points.length >= 2) {
    segments.push({
      p0: points[points.length - 1],
      p1: points[0],
      t0: tangents[points.length - 1],
      t1: tangents[0],
    });
  }

  return segments;
}

/**
 * Hermite spline class for convenient usage
 */
export class HermiteSpline {
  private segments: HermiteSegment[];
  private config: HermiteConfig;

  constructor(segments: HermiteSegment[], config: Partial<HermiteConfig> = {}) {
    this.config = {
      pointsPerSegment: 20,
      arcLengthPrecision: 0.001,
      ...config,
    };
    this.segments = [...segments];
  }

  /**
   * Evaluate the spline at parameter t (0 to 1 across all segments)
   */
  evaluate(t: number): Point {
    if (this.segments.length === 0) {
      throw new Error("No segments in spline");
    }

    const clampedT = Math.max(0, Math.min(1, t));
    const segmentIndex = Math.min(Math.floor(clampedT * this.segments.length), this.segments.length - 1);
    const segmentT = (clampedT * this.segments.length) % 1;

    return evaluateHermiteSegment(this.segments[segmentIndex], segmentT);
  }

  /**
   * Evaluate the spline with full information
   */
  evaluateFull(t: number): HermiteEvaluation {
    if (this.segments.length === 0) {
      throw new Error("No segments in spline");
    }

    const clampedT = Math.max(0, Math.min(1, t));
    const segmentIndex = Math.min(Math.floor(clampedT * this.segments.length), this.segments.length - 1);
    const segmentT = (clampedT * this.segments.length) % 1;

    return evaluateHermiteSegmentFull(this.segments[segmentIndex], segmentT);
  }

  /**
   * Generate points along the spline
   */
  generatePoints(options: HermiteOptions = {}): HermiteResult {
    return generateHermiteSpline(this.segments, options);
  }

  /**
   * Get segments
   */
  getSegments(): HermiteSegment[] {
    return [...this.segments];
  }
}





