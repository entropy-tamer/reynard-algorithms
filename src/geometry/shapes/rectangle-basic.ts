/**
 * Rectangle Basic Operations
 *
 * Basic rectangle operations including creation, measurements,
 * and simple geometric calculations.
 *
 * @module algorithms/rectangle-basic
 */

import { Point } from "./point-algorithms";
import { Rectangle } from "./shapes";

/**
 * Basic rectangle operations
 */
export class RectangleBasic {
  static create(x: number, y: number, width: number, height: number): Rectangle {
    return { x, y, width, height };
  }

  static fromPoints(topLeft: Point, bottomRight: Point): Rectangle {
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    };
  }

  static area(rect: Rectangle): number {
    return rect.width * rect.height;
  }

  static perimeter(rect: Rectangle): number {
    return 2 * (rect.width + rect.height);
  }

  static center(rect: Rectangle): Point {
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }

  static topLeft(rect: Rectangle): Point {
    return { x: rect.x, y: rect.y };
  }

  static topRight(rect: Rectangle): Point {
    return { x: rect.x + rect.width, y: rect.y };
  }

  static bottomLeft(rect: Rectangle): Point {
    return { x: rect.x, y: rect.y + rect.height };
  }

  static bottomRight(rect: Rectangle): Point {
    return { x: rect.x + rect.width, y: rect.y + rect.height };
  }

  static containsPoint(rect: Rectangle, point: Point): boolean {
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
  }

  static containsRectangle(outer: Rectangle, inner: Rectangle): boolean {
    return (
      inner.x >= outer.x &&
      inner.y >= outer.y &&
      inner.x + inner.width <= outer.x + outer.width &&
      inner.y + inner.height <= outer.y + outer.height
    );
  }
}
