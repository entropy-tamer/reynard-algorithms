/**
 * Line Algorithms
 *
 * Specialized algorithms for line operations, intersection testing,
 * and geometric calculations involving line segments.
 *
 * @module algorithms/line-algorithms
 */

import { Point, PointOps } from "./point-algorithms";
import { Line } from "./shapes";

/**
 * Line operations
 */
export class LineOps {
  static create(start: Point, end: Point): Line {
    return { start, end };
  }

  static getLength(line: Line): number {
    return PointOps.distance(line.start, line.end);
  }

  static getLengthSquared(line: Line): number {
    return PointOps.distanceSquared(line.start, line.end);
  }

  static midpoint(line: Line): Point {
    return PointOps.midpoint(line.start, line.end);
  }

  static direction(line: Line): import("../vectors/vector-algorithms").Vector {
    return { x: line.end.x - line.start.x, y: line.end.y - line.start.y };
  }

  static normal(line: Line): import("../vectors/vector-algorithms").Vector {
    const dir = this.direction(line);
    const mag = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: -dir.y / mag, y: dir.x / mag };
  }

  static pointAt(line: Line, t: number): Point {
    return PointOps.lerp(line.start, line.end, t);
  }

  static distanceToPoint(line: Line, point: Point): number {
    const A = point.x - line.start.x;
    const B = point.y - line.start.y;
    const C = line.end.x - line.start.x;
    const D = line.end.y - line.start.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) return PointOps.distance(line.start, point);

    const param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = line.start.x;
      yy = line.start.y;
    } else if (param > 1) {
      xx = line.end.x;
      yy = line.end.y;
    } else {
      xx = line.start.x + param * C;
      yy = line.start.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static intersects(a: Line, b: Line): Point | null {
    const x1 = a.start.x,
      y1 = a.start.y;
    const x2 = a.end.x,
      y2 = a.end.y;
    const x3 = b.start.x,
      y3 = b.start.y;
    const x4 = b.end.x,
      y4 = b.end.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1),
      };
    }

    return null;
  }
}
