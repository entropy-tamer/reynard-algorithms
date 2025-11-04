/**
 * @module algorithms/geometry/algorithms/dda/dda-core
 * @description Implements the Digital Differential Analyzer (DDA) line algorithm.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface DDALineResult {
  points: Point2D[];
  pointCount: number;
  success: boolean;
}

/**
 *
 */
export class DDALine {
  /**
   * Generate integer grid points for a line using the classic DDA algorithm.
   * @param start
   * @param end
   * @example
   */
  static draw(start: Point2D, end: Point2D): DDALineResult {
    const points: Point2D[] = [];
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    if (steps === 0) {
      points.push({ x: Math.round(start.x), y: Math.round(start.y) });
      return { points, pointCount: 1, success: true };
    }

    const xIncrement = dx / steps;
    const yIncrement = dy / steps;

    let x = start.x;
    let y = start.y;
    for (let i = 0; i <= steps; i++) {
      points.push({ x: Math.round(x), y: Math.round(y) });
      x += xIncrement;
      y += yIncrement;
    }

    return { points, pointCount: points.length, success: true };
  }
}

export const DDA = { draw: DDALine.draw };



