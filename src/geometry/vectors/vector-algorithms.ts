/**
 * Vector Algorithms
 *
 * Specialized algorithms for vector operations, including mathematical
 * operations, transformations, and geometric calculations.
 *
 * @module algorithms/vector-algorithms
 */

import { Point } from "../shapes/point-algorithms";

export interface Vector {
  x: number;
  y: number;
}

/**
 * Vector operations
 */
export class VectorOps {
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
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }

  static magnitudeSquared(vector: Vector): number {
    return vector.x * vector.x + vector.y * vector.y;
  }

  static normalize(vector: Vector): Vector {
    const mag = this.magnitude(vector);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: vector.x / mag, y: vector.y / mag };
  }

  static rotate(vector: Vector, angle: number): Vector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos,
    };
  }

  static angle(vector: Vector): number {
    return Math.atan2(vector.y, vector.x);
  }

  static angleBetween(a: Vector, b: Vector): number {
    const dot = this.dot(a, b);
    const magA = this.magnitude(a);
    const magB = this.magnitude(b);
    return Math.acos(dot / (magA * magB));
  }
}
