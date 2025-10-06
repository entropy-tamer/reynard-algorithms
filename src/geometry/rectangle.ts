/**
 * Rectangle geometry operations and utilities
 */

import type { Point } from "./point";

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class RectangleOps {
  static create(x: number, y: number, width: number, height: number): Rectangle {
    return { x, y, width, height };
  }

  static area(rect: Rectangle): number {
    return rect.width * rect.height;
  }

  static center(rect: Rectangle): Point {
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }

  static containsPoint(rect: Rectangle, point: Point): boolean {
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
  }

  static intersection(rect1: Rectangle, rect2: Rectangle): Rectangle | null {
    const left = Math.max(rect1.x, rect2.x);
    const top = Math.max(rect1.y, rect2.y);
    const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

    if (left < right && top < bottom) {
      return { x: left, y: top, width: right - left, height: bottom - top };
    }
    return null;
  }
}
