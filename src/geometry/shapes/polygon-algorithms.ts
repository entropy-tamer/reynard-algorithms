/**
 * Polygon Algorithms
 *
 * Specialized algorithms for polygon operations, intersection testing,
 * and geometric calculations involving polygonal shapes.
 *
 * @module algorithms/polygon-algorithms
 */

import { Point, PointOps } from "./point-algorithms";
import { Polygon } from "./shapes";

/**
 * Polygon operations
 */
export class PolygonOps {
  static create(points: Point[]): Polygon {
    return { points: [...points] };
  }

  static area(polygon: Polygon): number {
    if (polygon.points.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < polygon.points.length; i++) {
      const j = (i + 1) % polygon.points.length;
      area += polygon.points[i].x * polygon.points[j].y;
      area -= polygon.points[j].x * polygon.points[i].y;
    }
    return Math.abs(area) / 2;
  }

  static perimeter(polygon: Polygon): number {
    if (polygon.points.length < 2) return 0;

    let perimeter = 0;
    for (let i = 0; i < polygon.points.length; i++) {
      const j = (i + 1) % polygon.points.length;
      perimeter += PointOps.distance(polygon.points[i], polygon.points[j]);
    }
    return perimeter;
  }

  static centroid(polygon: Polygon): Point {
    if (polygon.points.length === 0) return { x: 0, y: 0 };
    if (polygon.points.length === 1) return polygon.points[0];

    let cx = 0,
      cy = 0;
    for (const point of polygon.points) {
      cx += point.x;
      cy += point.y;
    }
    return { x: cx / polygon.points.length, y: cy / polygon.points.length };
  }

  static containsPoint(polygon: Polygon, point: Point): boolean {
    if (polygon.points.length < 3) return false;

    let inside = false;
    for (let i = 0, j = polygon.points.length - 1; i < polygon.points.length; j = i++) {
      const xi = polygon.points[i].x,
        yi = polygon.points[i].y;
      const xj = polygon.points[j].x,
        yj = polygon.points[j].y;

      if (yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  static boundingBox(polygon: Polygon): import("./shapes").Rectangle {
    if (polygon.points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = polygon.points[0].x,
      maxX = polygon.points[0].x;
    let minY = polygon.points[0].y,
      maxY = polygon.points[0].y;

    for (const point of polygon.points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  static translate(polygon: Polygon, offset: import("../vectors/vector-algorithms").Vector): Polygon {
    return {
      points: polygon.points.map(point => PointOps.add(point, offset)),
    };
  }

  static scale(polygon: Polygon, factor: number, center?: Point): Polygon {
    if (center) {
      // Scale around specified center
      return {
        points: polygon.points.map(point => {
          const offset = PointOps.subtract(point, center);
          const scaled = PointOps.multiply(offset, factor);
          return PointOps.add(center, scaled);
        }),
      };
    } else {
      // Scale from origin (0,0)
      return {
        points: polygon.points.map(point => PointOps.multiply(point, factor)),
      };
    }
  }
}
