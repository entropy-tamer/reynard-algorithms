/**
 * Vector Algorithms
 *
 * Specialized algorithms for vector operations, including mathematical
 * operations, transformations, and geometric calculations.
 *
 * @module algorithms/vector-algorithms
 */

import { Point } from "../shapes/point-algorithms";
import { memoizeMath, memoizeGeometry } from "../../utils/memoization";
import { adaptiveMemo } from "../../utils";

export interface Vector {
  x: number;
  y: number;
}

/**
 * Vector operations
 */
export class VectorOps {
  // Memoized mathematical operations for performance
  private static readonly memoizedSqrt = memoizeMath((x: number) => Math.sqrt(x));
  private static readonly memoizedCos = memoizeMath((x: number) => Math.cos(x));
  private static readonly memoizedSin = memoizeMath((x: number) => Math.sin(x));
  private static readonly memoizedAtan2 = memoizeGeometry((y: number, x: number) => Math.atan2(y, x));
  private static readonly memoizedAcos = memoizeMath((x: number) => Math.acos(x));
  private static readonly memoizedMagnitude = memoizeGeometry((x: number, y: number) => Math.sqrt(x * x + y * y));

  static create(x: number, y: number): Vector {
    return { x, y };
  }

  static fromPoints(start: Point, end: Point): Vector {
    return { x: end.x - start.x, y: end.y - start.y };
  }

  static add(a: Vector, b: Vector): Vector {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  static subtract(a: Vector, b: Vector): Vector {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  static multiply(a: Vector, scalar: number): Vector {
    return { x: a.x * scalar, y: a.y * scalar };
  }

  static divide(a: Vector, scalar: number): Vector {
    if (scalar === 0) {
      throw new Error("Division by zero");
    }
    return { x: a.x / scalar, y: a.y / scalar };
  }

  static dot(a: Vector, b: Vector): number {
    return a.x * b.x + a.y * b.y;
  }

  static cross(a: Vector, b: Vector): number {
    return a.x * b.y - a.y * b.x;
  }

  static magnitude(vector: Vector): number {
    return VectorOps.memoizedMagnitude(vector.x, vector.y);
  }

  static magnitudeSquared(vector: Vector): number {
    return vector.x * vector.x + vector.y * vector.y;
  }

  static normalize(vector: Vector): Vector {
    if (!this._normalizeMemo) {
      this._normalizeMemo = adaptiveMemo(
        (x: number, y: number) => {
          const mag = Math.sqrt(x * x + y * y);
          if (mag === 0) return { x: 0, y: 0 };
          return { x: x / mag, y: y / mag };
        },
        { maxSize: 2048, minHitRate: 0.6, windowSize: 300, minSamples: 150 },
        (x: number, y: number) => `${x}|${y}`
      );
    }
    return this._normalizeMemo(vector.x, vector.y);
  }

  private static _normalizeMemo?: (x: number, y: number) => Vector;

  static rotate(vector: Vector, angle: number): Vector {
    const cos = VectorOps.memoizedCos(angle);
    const sin = VectorOps.memoizedSin(angle);
    return {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos,
    };
  }

  static angle(vector: Vector): number {
    return VectorOps.memoizedAtan2(vector.y, vector.x);
  }

  static angleBetween(a: Vector, b: Vector): number {
    const dot = this.dot(a, b);
    const magA = this.magnitude(a);
    const magB = this.magnitude(b);
    return VectorOps.memoizedAcos(dot / (magA * magB));
  }
}
