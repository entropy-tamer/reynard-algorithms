/**
 * @module algorithms/geometry/algorithms/bresenham/bresenham-core
 * @description Implements Bresenham's Line Algorithm for efficient line drawing.
 */

import {
  Point,
  BresenhamConfig,
  BresenhamResult,
  LineDrawingOptions,
  LineDrawingResult,
  MultiLineOptions,
  MultiLineResult,
} from "./bresenham-types";

/**
 * The BresenhamLine class provides an efficient implementation of Bresenham's Line Algorithm
 * for drawing lines on a pixel grid. It's particularly useful for computer graphics,
 * game development, and any application that needs to draw lines efficiently.
 *
 * @example
 * ```typescript
 * const bresenham = new BresenhamLine();
 * const result = bresenham.drawLine({ x: 0, y: 0 }, { x: 10, y: 5 });
 * console.log(result.points); // Array of points representing the line
 * ```
 */
export class BresenhamLine {
  private config: BresenhamConfig;

  /**
   * Creates an instance of BresenhamLine.
   * @param config - Optional configuration for the algorithm.
   * @example
   */
  constructor(config: Partial<BresenhamConfig> = {}) {
    this.config = {
      includeStart: true,
      includeEnd: true,
      useOriginalBresenham: true,
      handleNegativeCoordinates: false,
      ...config,
    };
  }

  /**
   * Draws a line between two points using Bresenham's algorithm.
   * @param start - The starting point.
   * @param end - The ending point.
   * @param options - Optional line drawing options.
   * @returns A LineDrawingResult object with the generated points and statistics.
   * @example
   */
  drawLine(start: Point, end: Point, options: Partial<LineDrawingOptions> = {}): LineDrawingResult {
    const startTime = performance.now();
    const lineOptions: LineDrawingOptions = {
      ...this.config,
      ...options,
    };

    try {
      const points = this.generateLinePoints(start, end, lineOptions);
      const executionTime = performance.now() - startTime;

      return {
        points,
        pointCount: points.length,
        executionTime,
        success: true,
        stoppedEarly: false,
        pointsProcessed: points.length,
      };
    } catch (error) {
      return {
        points: [],
        pointCount: 0,
        executionTime: performance.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stoppedEarly: false,
        pointsProcessed: 0,
      };
    }
  }

  /**
   * Draws multiple lines between consecutive points.
   * @param points - Array of points to connect with lines.
   * @param options - Optional multi-line drawing options.
   * @returns A MultiLineResult object with all generated lines and statistics.
   * @example
   */
  drawMultiLine(points: Point[], options: Partial<MultiLineOptions> = {}): MultiLineResult {
    const startTime = performance.now();
    const multiOptions: MultiLineOptions = {
      ...this.config,
      ...options,
    };

    const lines: BresenhamResult[] = [];
    let totalPoints = 0;
    let allSuccessful = true;

    try {
      for (let i = 0; i < points.length - 1; i++) {
        // Convert MultiLineOptions to LineDrawingOptions for individual line drawing
        const lineOptions: Partial<LineDrawingOptions> = {
          includeStart: multiOptions.includeStart,
          includeEnd: multiOptions.includeEnd,
          useOriginalBresenham: multiOptions.useOriginalBresenham,
          handleNegativeCoordinates: multiOptions.handleNegativeCoordinates,
          onPoint: multiOptions.onPoint ? (point: Point) => multiOptions.onPoint!(point, i) : undefined,
        };

        const lineResult = this.drawLine(points[i], points[i + 1], lineOptions);
        lines.push(lineResult);
        totalPoints += lineResult.pointCount;

        if (!lineResult.success) {
          allSuccessful = false;
        }

        // If connecting lines and not the last segment, remove the end point
        // to avoid duplication (except for the very last line)
        if (multiOptions.connectLines && i < points.length - 2 && lineResult.points.length > 0) {
          lineResult.points.pop();
          lineResult.pointCount--;
          totalPoints--;
        }
      }

      return {
        lines,
        totalPoints,
        executionTime: performance.now() - startTime,
        success: allSuccessful,
      };
    } catch (error) {
      return {
        lines,
        totalPoints,
        executionTime: performance.now() - startTime,
        success: false,
      };
    }
  }

  /**
   * Draws a line using the basic Bresenham algorithm (without additional features).
   * @param start - The starting point.
   * @param end - The ending point.
   * @returns A BresenhamResult object with the generated points and statistics.
   * @example
   */
  drawBasicLine(start: Point, end: Point): BresenhamResult {
    const startTime = performance.now();

    try {
      const points = this.generateBasicLinePoints(start, end);
      const executionTime = performance.now() - startTime;

      return {
        points,
        pointCount: points.length,
        executionTime,
        success: true,
      };
    } catch (error) {
      return {
        points: [],
        pointCount: 0,
        executionTime: performance.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generates points for a line using Bresenham's algorithm with additional features.
   * @param start - The starting point.
   * @param end - The ending point.
   * @param options - Line drawing options.
   * @returns Array of points representing the line.
   * @example
   */
  private generateLinePoints(start: Point, end: Point, options: LineDrawingOptions): Point[] {
    const points: Point[] = [];
    let processedCount = 0;

    // Handle negative coordinates if requested
    let adjustedStart = start;
    let adjustedEnd = end;
    let offsetX = 0;
    let offsetY = 0;

    if (options.handleNegativeCoordinates) {
      const minX = Math.min(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      if (minX < 0 || minY < 0) {
        offsetX = -minX;
        offsetY = -minY;
        adjustedStart = { x: start.x + offsetX, y: start.y + offsetY };
        adjustedEnd = { x: end.x + offsetX, y: end.y + offsetY };
      }
    }

    // Generate the basic line points
    const basicPoints = this.generateBasicLinePoints(adjustedStart, adjustedEnd, options);

    // Process each point
    for (const point of basicPoints) {
      // Apply offset back if we adjusted for negative coordinates
      const finalPoint = options.handleNegativeCoordinates ? { x: point.x - offsetX, y: point.y - offsetY } : point;

      // Check if we should stop early
      if (options.maxPoints && points.length >= options.maxPoints) {
        break;
      }

      // Call the onPoint callback if provided
      if (options.onPoint) {
        const shouldContinue = options.onPoint(finalPoint);
        if (!shouldContinue) {
          break;
        }
      }

      points.push(finalPoint);
      processedCount++;
    }

    return points;
  }

  /**
   * Generates points for a line using the basic Bresenham algorithm.
   * @param start - The starting point.
   * @param end - The ending point.
   * @param options - Optional configuration options.
   * @returns Array of points representing the line.
   * @example
   */
  private generateBasicLinePoints(start: Point, end: Point, options: Partial<BresenhamConfig> = {}): Point[] {
    const config = { ...this.config, ...options };
    const points: Point[] = [];

    // Handle the case where start and end are the same
    if (start.x === end.x && start.y === end.y) {
      if (config.includeStart || config.includeEnd) {
        points.push({ x: start.x, y: start.y });
      }
      return points;
    }

    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    const sx = start.x < end.x ? 1 : -1;
    const sy = start.y < end.y ? 1 : -1;

    let x = start.x;
    let y = start.y;
    let err = dx - dy;

    // Add start point if requested
    if (config.includeStart) {
      points.push({ x, y });
    }

    // Main Bresenham loop
    while (true) {
      if (x === end.x && y === end.y) {
        break;
      }

      const e2 = 2 * err;

      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }

      if (e2 < dx) {
        err += dx;
        y += sy;
      }

      points.push({ x, y });
    }

    // Remove end point if not requested
    if (!config.includeEnd && points.length > 0) {
      points.pop();
    }

    return points;
  }

  /**
   * Calculates the distance between two points.
   * @param start - The starting point.
   * @param end - The ending point.
   * @returns The Euclidean distance between the points.
   * @example
   */
  static distance(start: Point, end: Point): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates the Manhattan distance between two points.
   * @param start - The starting point.
   * @param end - The ending point.
   * @returns The Manhattan distance between the points.
   * @example
   */
  static manhattanDistance(start: Point, end: Point): number {
    return Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
  }

  /**
   * Calculates the Chebyshev distance between two points.
   * @param start - The starting point.
   * @param end - The ending point.
   * @returns The Chebyshev distance between the points.
   * @example
   */
  static chebyshevDistance(start: Point, end: Point): number {
    return Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
  }

  /**
   * Checks if a point is on a line segment.
   * @param point - The point to check.
   * @param start - The start of the line segment.
   * @param end - The end of the line segment.
   * @param tolerance - Tolerance for floating point comparison.
   * @returns True if the point is on the line segment.
   * @example
   */
  static isPointOnLine(point: Point, start: Point, end: Point, tolerance: number = 0.001): boolean {
    // Check if point is within the bounding box of the line segment
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    if (
      point.x < minX - tolerance ||
      point.x > maxX + tolerance ||
      point.y < minY - tolerance ||
      point.y > maxY + tolerance
    ) {
      return false;
    }

    // Check if point is on the line using cross product
    const crossProduct = Math.abs((end.y - start.y) * (point.x - start.x) - (end.x - start.x) * (point.y - start.y));

    return crossProduct <= tolerance;
  }

  /**
   * Finds the closest point on a line segment to a given point.
   * @param point - The point to find the closest point for.
   * @param start - The start of the line segment.
   * @param end - The end of the line segment.
   * @returns The closest point on the line segment.
   * @example
   */
  static closestPointOnLine(point: Point, start: Point, end: Point): Point {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return start; // Line segment is a point
    }

    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));

    return {
      x: start.x + t * dx,
      y: start.y + t * dy,
    };
  }

  /**
   * Generates a circle using Bresenham's circle algorithm.
   * @param center - The center of the circle.
   * @param radius - The radius of the circle.
   * @param options - Optional configuration options.
   * @returns Array of points representing the circle.
   * @example
   */
  static drawCircle(center: Point, radius: number, options: Partial<BresenhamConfig> = {}): Point[] {
    const config = {
      includeStart: true,
      includeEnd: true,
      ...options,
    };

    const points: Point[] = [];
    let x = 0;
    let y = radius;
    let d = 3 - 2 * radius;

    // Add initial points
    if (config.includeStart) {
      points.push({ x: center.x, y: center.y + radius });
      points.push({ x: center.x, y: center.y - radius });
      points.push({ x: center.x + radius, y: center.y });
      points.push({ x: center.x - radius, y: center.y });
    }

    while (y >= x) {
      x++;

      if (d > 0) {
        y--;
        d = d + 4 * (x - y) + 10;
      } else {
        d = d + 4 * x + 6;
      }

      // Add 8 symmetric points
      points.push({ x: center.x + x, y: center.y + y });
      points.push({ x: center.x - x, y: center.y + y });
      points.push({ x: center.x + x, y: center.y - y });
      points.push({ x: center.x - x, y: center.y - y });
      points.push({ x: center.x + y, y: center.y + x });
      points.push({ x: center.x - y, y: center.y + x });
      points.push({ x: center.x + y, y: center.y - x });
      points.push({ x: center.x - y, y: center.y - x });
    }

    return points;
  }
}
