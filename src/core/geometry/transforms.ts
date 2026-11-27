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
   * Returns the identity transform: no translation, unit scale, and zero rotation.
   *
   * @returns A transform that leaves points and rectangles unchanged.
   */
  static identity(): Transform {
    return { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1, rotation: 0 };
  }

  /**
   * Returns a pure translation transform by `x` and `y`.
   *
   * @param x Horizontal shift.
   * @param y Vertical shift.
   * @returns A transform with unit scale and zero rotation.
   */
  static translate(x: number, y: number): Transform {
    return { translateX: x, translateY: y, scaleX: 1, scaleY: 1, rotation: 0 };
  }

  /**
   * Returns a pure scaling transform; omitting `y` gives uniform scaling.
   *
   * @param x Horizontal scale factor.
   * @param y Vertical scale factor, defaulting to `x`.
   * @returns A transform with no translation or rotation.
   */
  static scale(x: number, y: number = x): Transform {
    return { translateX: 0, translateY: 0, scaleX: x, scaleY: y, rotation: 0 };
  }

  /**
   * Returns a pure rotation transform about the origin.
   *
   * @param angle Rotation in radians.
   * @returns A transform with no translation and unit scale.
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
   * Composes transform `b` onto `a`, with `a` applied first to a point.
   *
   * `b`'s translation is rotated and scaled by `a`; scales multiply and rotations add.
   *
   * @param a Outer transform applied after `b`'s basis is mapped.
   * @param b Inner transform being composed into `a`.
   * @returns The combined transform.
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
   * Applies a transform to a point: scale about the origin, rotate, then translate.
   *
   * @param transform Transform to apply.
   * @param point Point to transform.
   * @returns The transformed point.
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
   * Transforms a rectangle's four corners and returns the axis-aligned bounds enclosing them.
   *
   * Rotation can enlarge the result beyond the original width and height.
   *
   * @param transform Transform to apply.
   * @param rect Rectangle whose corners are transformed.
   * @returns Bounding rectangle of the transformed corners.
   */
  static applyToRectangle(transform: Transform, rect: Rectangle): Rectangle {
    // Calculate rectangle corners
    const topLeft: Point = { x: rect.x, y: rect.y };
    const topRight: Point = { x: rect.x + rect.width, y: rect.y };
    const bottomLeft: Point = { x: rect.x, y: rect.y + rect.height };
    const bottomRight: Point = { x: rect.x + rect.width, y: rect.y + rect.height };

    const corners = [topLeft, topRight, bottomLeft, bottomRight];
    const transformedCorners = corners.map(corner => TransformOps.applyToPoint(transform, corner));

    const firstCorner = transformedCorners[0];
    if (!firstCorner) {
      return rect;
    }

    let minX = firstCorner.x,
      maxX = firstCorner.x;
    let minY = firstCorner.y,
      maxY = firstCorner.y;

    for (const corner of transformedCorners) {
      minX = Math.min(minX, corner.x);
      maxX = Math.max(maxX, corner.x);
      minY = Math.min(minY, corner.y);
      maxY = Math.max(maxY, corner.y);
    }

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  /**
   * Returns the transform that undoes `transform`: negated rotation, reciprocal scales, and
   * translation transformed back through those values.
   *
   * A zero scale factor yields non-finite translation components.
   *
   * @param transform Transform to invert.
   * @returns The inverse transform.
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
