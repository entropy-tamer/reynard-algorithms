/**
 * Circle Algorithms
 *
 * Specialized algorithms for circle operations, intersection testing,
 * and geometric calculations involving circular shapes.
 *
 * @module algorithms/circle-algorithms
 */

import { Point, PointOps } from "./point-algorithms";
import { Circle } from "./shapes";

/**
 * Circle operations
 */
export class CircleOps {
  static create(center: Point, radius: number): Circle {
    return { center, radius };
  }

  static area(circle: Circle): number {
    return Math.PI * circle.radius * circle.radius;
  }

  static circumference(circle: Circle): number {
    return 2 * Math.PI * circle.radius;
  }

  static containsPoint(circle: Circle, point: Point): boolean {
    return PointOps.distanceSquared(circle.center, point) <= circle.radius * circle.radius;
  }

  static intersects(a: Circle, b: Circle): boolean {
    const distance = PointOps.distance(a.center, b.center);
    return distance <= a.radius + b.radius;
  }

  static expand(circle: Circle, amount: number): Circle {
    return { center: circle.center, radius: circle.radius + amount };
  }

  static shrink(circle: Circle, amount: number): Circle {
    return {
      center: circle.center,
      radius: Math.max(0, circle.radius - amount),
    };
  }

  static translate(circle: Circle, offset: import("../vectors/vector-algorithms").Vector): Circle {
    return {
      center: PointOps.add(circle.center, offset),
      radius: circle.radius,
    };
  }
}
