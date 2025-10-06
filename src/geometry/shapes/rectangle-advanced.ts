/**
 * Rectangle Advanced Operations
 *
 * Advanced rectangle operations including intersection testing,
 * transformations, and complex geometric calculations.
 *
 * @module algorithms/rectangle-advanced
 */

import { Point } from "./point-algorithms";
import { Rectangle } from "./shapes";

/**
 * Advanced rectangle operations
 */
export class RectangleAdvanced {
  static intersects(a: Rectangle, b: Rectangle): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  static intersection(a: Rectangle, b: Rectangle): Rectangle | null {
    if (!this.intersects(a, b)) return null;

    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.width, b.x + b.width);
    const y2 = Math.min(a.y + a.height, b.y + b.height);

    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }

  static union(a: Rectangle, b: Rectangle): Rectangle {
    const x1 = Math.min(a.x, b.x);
    const y1 = Math.min(a.y, b.y);
    const x2 = Math.max(a.x + a.width, b.x + b.width);
    const y2 = Math.max(a.y + a.height, b.y + b.height);

    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }

  static expand(rect: Rectangle, amount: number): Rectangle {
    return {
      x: rect.x - amount,
      y: rect.y - amount,
      width: rect.width + amount * 2,
      height: rect.height + amount * 2,
    };
  }

  static shrink(rect: Rectangle, amount: number): Rectangle {
    return {
      x: rect.x + amount,
      y: rect.y + amount,
      width: Math.max(0, rect.width - amount * 2),
      height: Math.max(0, rect.height - amount * 2),
    };
  }

  static translate(rect: Rectangle, offset: import("../vectors/vector-algorithms").Vector): Rectangle {
    return {
      x: rect.x + offset.x,
      y: rect.y + offset.y,
      width: rect.width,
      height: rect.height,
    };
  }

  static scale(rect: Rectangle, factor: number, center?: Point): Rectangle {
    if (center) {
      // Scale around specified center
      const newWidth = rect.width * factor;
      const newHeight = rect.height * factor;
      const newX = center.x - newWidth / 2;
      const newY = center.y - newHeight / 2;
      return { x: newX, y: newY, width: newWidth, height: newHeight };
    } else {
      // Scale from origin (0,0)
      return {
        x: rect.x * factor,
        y: rect.y * factor,
        width: rect.width * factor,
        height: rect.height * factor,
      };
    }
  }
}
