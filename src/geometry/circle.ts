/**
 * Circle geometry operations and utilities
 */

import type { Point } from "./point";
import { PointOps } from "./point";

export interface Circle {
  center: Point;
  radius: number;
}

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
    return PointOps.distance(circle.center, point) <= circle.radius;
  }
}
