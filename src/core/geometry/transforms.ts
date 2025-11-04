/**
 * Transformation Algorithms
 *
 * Specialized algorithms for geometric transformations, including
 * translation, scaling, rotation, and matrix operations.
 *
 * @module algorithms/transformation-algorithms
 */

import type { Point, Rectangle } from "../types";
import { memoizeMath } from "../../utils/memoization";

export interface Transform {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

/**
 * Transform operations
 */
export class TransformOps {
  // Memoized mathematical operations for performance
  private static readonly memoizedCos = memoizeMath((x: number) => Math.cos(x));
  private static readonly memoizedSin = memoizeMath((x: number) => Math.sin(x));

  /**
   *
   * @example
   */
  static identity(): Transform {
    return { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1, rotation: 0 };
  }

  /**
   *
   * @param x
   * @param y
   * @example
   */
  static translate(x: number, y: number): Transform {
    return { translateX: x, translateY: y, scaleX: 1, scaleY: 1, rotation: 0 };
  }

  /**
   *
   * @param x
   * @param y
   * @example
   */
  static scale(x: number, y: number = x): Transform {
    return { translateX: 0, translateY: 0, scaleX: x, scaleY: y, rotation: 0 };
  }

  /**
   *
   * @param angle
   * @example
   */
  static rotate(angle: number): Transform {
    return {
      translateX: 0,
      translateY: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: angle,
    };
  }

  /**
   *
   * @param a
   * @param b
   * @example
   */
  static combine(a: Transform, b: Transform): Transform {
    const cos = TransformOps.memoizedCos(a.rotation);
    const sin = TransformOps.memoizedSin(a.rotation);

    return {
      translateX: a.translateX + b.translateX * a.scaleX * cos - b.translateY * a.scaleY * sin,
      translateY: a.translateY + b.translateX * a.scaleX * sin + b.translateY * a.scaleY * cos,
      scaleX: a.scaleX * b.scaleX,
      scaleY: a.scaleY * b.scaleY,
      rotation: a.rotation + b.rotation,
    };
  }

  /**
   *
   * @param transform
   * @param point
   * @example
   */
  static applyToPoint(transform: Transform, point: Point): Point {
    const cos = TransformOps.memoizedCos(transform.rotation);
    const sin = TransformOps.memoizedSin(transform.rotation);

    return {
      x: point.x * transform.scaleX * cos - point.y * transform.scaleY * sin + transform.translateX,
      y: point.x * transform.scaleX * sin + point.y * transform.scaleY * cos + transform.translateY,
    };
  }

  /**
   *
   * @param transform
   * @param rect
   * @example
   */
  static applyToRectangle(transform: Transform, rect: Rectangle): Rectangle {
    // Calculate rectangle corners
    const topLeft: Point = { x: rect.x, y: rect.y };
    const topRight: Point = { x: rect.x + rect.width, y: rect.y };
    const bottomLeft: Point = { x: rect.x, y: rect.y + rect.height };
    const bottomRight: Point = { x: rect.x + rect.width, y: rect.y + rect.height };

    const corners = [topLeft, topRight, bottomLeft, bottomRight];
    const transformedCorners = corners.map(corner => this.applyToPoint(transform, corner));

    let minX = transformedCorners[0].x,
      maxX = transformedCorners[0].x;
    let minY = transformedCorners[0].y,
      maxY = transformedCorners[0].y;

    for (const corner of transformedCorners) {
      minX = Math.min(minX, corner.x);
      maxX = Math.max(maxX, corner.x);
      minY = Math.min(minY, corner.y);
      maxY = Math.max(maxY, corner.y);
    }

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  /**
   *
   * @param transform
   * @example
   */
  static inverse(transform: Transform): Transform {
    const cos = TransformOps.memoizedCos(-transform.rotation);
    const sin = TransformOps.memoizedSin(-transform.rotation);

    return {
      translateX: -(transform.translateX * cos - transform.translateY * sin) / transform.scaleX,
      translateY: -(transform.translateX * sin + transform.translateY * cos) / transform.scaleY,
      scaleX: 1 / transform.scaleX,
      scaleY: 1 / transform.scaleY,
      rotation: -transform.rotation,
    };
  }
}
