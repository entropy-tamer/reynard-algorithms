/**
 * Geometric Shape Interfaces
 *
 * Core interfaces for geometric shapes used in collision detection
 * and spatial relationship calculations.
 *
 * @module algorithms/shapes
 */

import { Point } from "./point-algorithms";

export interface Line {
  start: Point;
  end: Point;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  center: Point;
  radius: number;
}

export interface Polygon {
  points: Point[];
}
