/**
 * Point Algorithms
 *
 * Specialized algorithms for point operations, including mathematical
 * operations, distance calculations, and geometric transformations.
 *
 * @module algorithms/point-algorithms
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Point operations
 */
export class PointOps {
  static create(x: number, y: number): Point {
    return { x, y };
  }

  static add(a: Point, b: Point): Point {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  static subtract(a: Point, b: Point): Point {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  static multiply(a: Point, scalar: number): Point {
    return { x: a.x * scalar, y: a.y * scalar };
  }

  static divide(a: Point, scalar: number): Point {
    if (scalar === 0) {
      throw new Error("Division by zero");
    }
    return { x: a.x / scalar, y: a.y / scalar };
  }

  static distance(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static distanceSquared(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  }

  static midpoint(a: Point, b: Point): Point {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  static lerp(a: Point, b: Point, t: number): Point {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  static equals(a: Point, b: Point): boolean {
    return Math.abs(a.x - b.x) < 1e-10 && Math.abs(a.y - b.y) < 1e-10;
  }

  static clone(point: Point): Point {
    return { x: point.x, y: point.y };
  }
}
