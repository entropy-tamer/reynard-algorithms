/**
 * Point geometry operations and utilities
 */

export interface Point {
  x: number;
  y: number;
}

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

  static distance(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static midpoint(a: Point, b: Point): Point {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
}
