/**
 * @file Supercover line algorithm (grid traversal covering all intersected cells).
 * @module algorithms/geometry/algorithms/supercover/supercover-core
 * @description Supercover line algorithm (grid traversal covering all intersected cells).
 */

export interface Point2D { x: number; y: number }

export interface SupercoverLineResult {
  points: Point2D[]
  pointCount: number
  success: boolean
}

/**
 * Supercover line: returns every grid cell the line passes through.
 * Based on Amanatides & Woo style grid traversal with integer rounding.
 */
export class SupercoverLine {
  /**
   * Compute the supercover path between two points on an integer grid.
   * Includes every grid cell the line passes through, including both endpoints.
   *
   * @param start - Inclusive start point; coordinates are floored to grid indices
   * @param end - Inclusive end point; coordinates are floored to grid indices
   * @returns Result containing ordered grid cells and metadata
   * @example
   * // Basic usage
   * const result = SupercoverLine.draw({ x: 0, y: 0 }, { x: 3, y: 2 })
   * console.log(result.points)
   */
  static draw(start: Point2D, end: Point2D): SupercoverLineResult {
    const points: Point2D[] = []

    const x0 = Math.floor(start.x)
    const y0 = Math.floor(start.y)
    const x1 = Math.floor(end.x)
    const y1 = Math.floor(end.y)

    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1

    let x = x0
    let y = y0
    points.push({ x, y })

    if (dx === 0 && dy === 0) {
      return { points, pointCount: 1, success: true }
    }

    let err = dx - dy
    let e2: number

    while (!(x === x1 && y === y1)) {
      e2 = 2 * err

      // horizontal step
      if (e2 > -dy) {
        err -= dy
        x += sx
        points.push({ x, y })
      }

      // vertical step
      if (e2 < dx) {
        err += dx
        y += sy
        // ensure we include both cells when crossing a corner
        if (points.length === 0 || points[points.length - 1].x !== x || points[points.length - 1].y !== y) {
          points.push({ x, y })
        }
      }
    }

    return { points, pointCount: points.length, success: true }
  }
}

export const Supercover = { draw: SupercoverLine.draw }


