/**
 * Rectangle Algorithms
 *
 * Specialized algorithms for rectangle operations, intersection testing,
 * and geometric calculations involving rectangular shapes.
 *
 * @module algorithms/rectangle-algorithms
 */

import { RectangleBasic } from "./rectangle-basic";
import { RectangleAdvanced } from "./rectangle-advanced";

/**
 * Combined rectangle operations
 */
export class RectangleOps {
  // Basic operations
  static create = RectangleBasic.create;
  static fromPoints = RectangleBasic.fromPoints;
  static area = RectangleBasic.area;
  static perimeter = RectangleBasic.perimeter;
  static center = RectangleBasic.center;
  static topLeft = RectangleBasic.topLeft;
  static topRight = RectangleBasic.topRight;
  static bottomLeft = RectangleBasic.bottomLeft;
  static bottomRight = RectangleBasic.bottomRight;
  static containsPoint = RectangleBasic.containsPoint;
  static containsRectangle = RectangleBasic.containsRectangle;

  // Advanced operations
  static intersects = RectangleAdvanced.intersects;
  static intersection = RectangleAdvanced.intersection;
  static union = RectangleAdvanced.union;
  static expand = RectangleAdvanced.expand;
  static shrink = RectangleAdvanced.shrink;
  static translate = RectangleAdvanced.translate;
  static scale = RectangleAdvanced.scale;
}
