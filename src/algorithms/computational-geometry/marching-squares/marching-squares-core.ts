/**
 * @file marching-squares-core.ts
 * @module algorithms/geometry/algorithms/marching-squares/marching-squares-core
 * @description Implements Marching Squares algorithm for generating contours from 2D scalar fields.
 */

import {
  Contour,
  LineSegment,
  MarchingCell,
  MarchingSquaresConfig,
  MarchingSquaresQueryOptions,
  MarchingSquaresQueryResult,
  MarchingSquaresResult,
  MarchingSquaresStats,
  Point,
} from "./marching-squares-types";

/**
 * The MarchingSquares class provides an implementation of the Marching Squares algorithm
 * for generating contours from 2D scalar fields. It analyzes each cell in the field
 * and generates line segments that approximate the isosurface.
 *
 * @example
 * ```typescript
 * const marchingSquares = new MarchingSquares();
 * const scalarField = [
 *   [0.0, 0.0, 0.0],
 *   [0.0, 1.0, 0.0],
 *   [0.0, 0.0, 0.0],
 * ];
 * const result = marchingSquares.generateContours(scalarField, 1.0, 1.0);
 * console.log(result.contours.length); // Number of contours found
 * ```
 */
export class MarchingSquares {
  private config: Required<MarchingSquaresConfig>;

  /**
   * Creates an instance of MarchingSquares.
   * @param config - Optional configuration for the algorithm.
   * @example
   * ```typescript
   * const marchingSquares = new MarchingSquares({
   *   threshold: 0.5,
   *   simplifyContours: true
   * });
   * ```
   */
  constructor(config: MarchingSquaresConfig = {}) {
    this.config = {
      threshold: 0.5,
      simplifyContours: true,
      simplificationTolerance: 1e-6,
      connectContours: true,
      validateInput: true,
      ...config,
    };
  }

  /**
   * Generates contours from a 2D scalar field using the marching squares algorithm.
   *
   * @param scalarField - 2D array of scalar values
   * @param cellWidth - Width of each cell in world units
   * @param cellHeight - Height of each cell in world units
   * @returns Result containing contours and statistics
   * @example
   * ```typescript
   * const result = marchingSquares.generateContours(scalarField, 1.0, 1.0);
   * console.log(`Found ${result.contours.length} contours`);
   * ```
   */
  generateContours(
    scalarField: number[][],
    cellWidth: number = 1.0,
    cellHeight: number = 1.0,
  ): MarchingSquaresResult {
    const startTime = performance.now();

    try {
      if (this.config.validateInput) {
        this.validateInput(scalarField);
      }

      const segments = this.processScalarField(scalarField, cellWidth, cellHeight);
      const contours = this.config.connectContours
        ? this.connectSegmentsToContours(segments)
        : segments.map(segment => ({
            vertices: [segment.start, segment.end],
            isClosed: false,
            level: this.config.threshold,
          }));

      const simplifiedContours = this.config.simplifyContours
        ? contours.map(contour => this.simplifyContour(contour))
        : contours;

      const stats: MarchingSquaresStats = {
        width: scalarField[0]?.length || 0,
        height: scalarField.length,
        segmentCount: segments.length,
        vertexCount: simplifiedContours.reduce((sum, c) => sum + c.vertices.length, 0),
        executionTime: performance.now() - startTime,
        success: true,
      };

      return {
        contours: simplifiedContours,
        stats,
      };
    } catch (error) {
      const stats: MarchingSquaresStats = {
        width: scalarField[0]?.length || 0,
        height: scalarField.length,
        segmentCount: 0,
        vertexCount: 0,
        executionTime: performance.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };

      return {
        contours: [],
        stats,
      };
    }
  }

  /**
   * Queries contours based on specified criteria.
   *
   * @param result - Result from generateContours
   * @param options - Query options
   * @returns Filtered contours and statistics
   * @example
   * ```typescript
   * const filtered = marchingSquares.queryContours(result, {
   *   minLength: 10,
   *   closedOnly: true
   * });
   * ```
   */
  queryContours(
    result: MarchingSquaresResult,
    options: MarchingSquaresQueryOptions = {},
  ): MarchingSquaresQueryResult {
    const {
      minLength = 0,
      maxLength = Infinity,
      closedOnly = false,
      bounds,
    } = options;

    let filteredCount = 0;
    const filteredContours = result.contours.filter(contour => {
      // Check if contour meets length requirements
      const length = this.calculateContourLength(contour);
      if (length < minLength || length > maxLength) {
        filteredCount++;
        return false;
      }

      // Check if contour should be closed only
      if (closedOnly && !contour.isClosed) {
        filteredCount++;
        return false;
      }

      // Check if contour intersects bounds
      if (bounds && !this.contourIntersectsBounds(contour, bounds)) {
        filteredCount++;
        return false;
      }

      return true;
    });

    return {
      contours: filteredContours,
      filteredCount,
    };
  }

  /**
   * Validates the input scalar field.
   * @param scalarField - The 2D array to validate
   * @example
   * ```typescript
   * this.validateInput(scalarField);
   * ```
   */
  private validateInput(scalarField: number[][]): void {
    if (!Array.isArray(scalarField) || scalarField.length === 0) {
      throw new Error("Scalar field must be a non-empty 2D array");
    }

    const firstRow = scalarField[0];
    if (!Array.isArray(firstRow) || firstRow.length === 0) {
      throw new Error("First row of scalar field must be a non-empty array");
    }

    const width = firstRow.length;
    for (let i = 1; i < scalarField.length; i++) {
      const row = scalarField[i];
      if (!Array.isArray(row) || row.length !== width) {
        throw new Error("All rows in scalar field must have the same length");
      }
    }

    // Check for valid numbers
    for (const row of scalarField) {
      for (const value of row) {
        if (typeof value !== "number" || isNaN(value)) {
          throw new Error("All values in scalar field must be valid numbers");
        }
      }
    }
  }

  /**
   * Processes the scalar field and generates line segments.
   * @param scalarField - 2D array of scalar values
   * @param cellWidth - Width of each cell
   * @param cellHeight - Height of each cell
   * @returns Array of line segments
   * @example
   * ```typescript
   * const segments = this.processScalarField(scalarField, 1.0, 1.0);
   * ```
   */
  private processScalarField(
    scalarField: number[][],
    cellWidth: number,
    cellHeight: number,
  ): LineSegment[] {
    const segments: LineSegment[] = [];
    const height = scalarField.length;
    const width = scalarField[0]?.length || 0;

    // Process each cell in the grid
    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const cell: MarchingCell = {
          corners: [
            scalarField[y]![x]!,        // bottom-left
            scalarField[y]![x + 1]!,    // bottom-right
            scalarField[y + 1]![x + 1]!, // top-right
            scalarField[y + 1]![x]!,    // top-left
          ],
          position: { x: x * cellWidth, y: y * cellHeight },
          size: { width: cellWidth, height: cellHeight },
        };

        const cellSegments = this.processCell(cell);
        segments.push(...cellSegments);
      }
    }

    return segments;
  }

  /**
   * Processes a single cell and returns line segments for that cell.
   * @param cell - The marching squares cell to process
   * @returns Array of line segments for this cell
   * @example
   * ```typescript
   * const segments = this.processCell(cell);
   * ```
   */
  private processCell(cell: MarchingCell): LineSegment[] {
    const { corners } = cell;
    const { threshold } = this.config;

    // Determine which corners are above the threshold
    const aboveThreshold = corners.map(value => value >= threshold);

    // Calculate the case index (0-15) based on which corners are above threshold
    let caseIndex = 0;
    for (let i = 0; i < 4; i++) {
      if (aboveThreshold[i]) {
        caseIndex |= 1 << i;
      }
    }

    return this.getSegmentsForCase(caseIndex, cell);
  }

  /**
   * Returns the line segments for a given marching squares case.
   * @param caseIndex - The marching squares case index (0-15)
   * @param cell - The cell data
   * @returns Array of line segments
   * @example
   * ```typescript
   * const segments = this.getSegmentsForCase(5, cell);
   * ```
   */
  private getSegmentsForCase(caseIndex: number, cell: MarchingCell): LineSegment[] {
    const segments: LineSegment[] = [];

    // Marching squares lookup table
    // Each case defines which edges are crossed
    const edgeTable = [
      [], // Case 0: no crossings
      [0, 3], // Case 1: bottom-left corner
      [0, 1], // Case 2: bottom-right corner
      [1, 3], // Case 3: bottom edge
      [1, 2], // Case 4: top-right corner
      [0, 1, 2, 3], // Case 5: ambiguous case (saddle point)
      [0, 2], // Case 6: right edge
      [2, 3], // Case 7: top-left to bottom-right diagonal
      [2, 3], // Case 8: top-left corner
      [0, 2], // Case 9: left edge
      [0, 3, 1, 2], // Case 10: ambiguous case (saddle point)
      [1, 2], // Case 11: top edge
      [1, 3], // Case 12: bottom edge (reverse)
      [0, 1], // Case 13: bottom-right to top-left diagonal
      [0, 3], // Case 14: bottom-left to top-right diagonal
      [], // Case 15: all corners above threshold
    ];

    const edges = edgeTable[caseIndex];
    if (!edges || edges.length === 0) {
      return segments;
    }

    // Convert edge indices to actual line segments
    for (let i = 0; i < edges.length; i += 2) {
      const edge1 = edges[i];
      const edge2 = edges[i + 1];

      if (edge1 !== undefined && edge2 !== undefined) {
        const point1 = this.getEdgeIntersection(cell, edge1);
        const point2 = this.getEdgeIntersection(cell, edge2);

        if (point1 && point2) {
          segments.push({ start: point1, end: point2 });
        }
      }
    }

    return segments;
  }

  /**
   * Calculates the intersection point of an edge with the isosurface.
   * @param cell - The cell data
   * @param edgeIndex - Index of the edge (0-3)
   * @returns Intersection point or null if no intersection
   * @example
   * ```typescript
   * const point = this.getEdgeIntersection(cell, 0);
   * ```
   */
  private getEdgeIntersection(cell: MarchingCell, edgeIndex: number): Point | null {
    const { corners, position, size } = cell;
    const { threshold } = this.config;

    // Define the edges of the cell (bottom: 0, right: 1, top: 2, left: 3)
    const edges = [
      { p1: corners[0], p2: corners[1], start: { x: position.x, y: position.y }, end: { x: position.x + size.width, y: position.y } }, // bottom
      { p1: corners[1], p2: corners[2], start: { x: position.x + size.width, y: position.y }, end: { x: position.x + size.width, y: position.y + size.height } }, // right
      { p1: corners[2], p2: corners[3], start: { x: position.x + size.width, y: position.y + size.height }, end: { x: position.x, y: position.y + size.height } }, // top
      { p1: corners[3], p2: corners[0], start: { x: position.x, y: position.y + size.height }, end: { x: position.x, y: position.y } }, // left
    ];

    const edge = edges[edgeIndex];
    if (!edge) return null;

    // Linear interpolation to find exact crossing point
    const t = (threshold - edge.p1) / (edge.p2 - edge.p1);
    if (t < 0 || t > 1) return null;

    return {
      x: edge.start.x + t * (edge.end.x - edge.start.x),
      y: edge.start.y + t * (edge.end.y - edge.start.y),
    };
  }

  /**
   * Connects line segments into continuous contours.
   * @param segments - Array of line segments to connect
   * @returns Array of connected contours
   * @example
   * ```typescript
   * const contours = this.connectSegmentsToContours(segments);
   * ```
   */
  private connectSegmentsToContours(segments: LineSegment[]): Contour[] {
    const contours: Contour[] = [];
    const used = new Set<number>();

    for (let i = 0; i < segments.length; i++) {
      if (used.has(i)) continue;

      const contour = this.buildContour(segments, i, used);
      if (contour.vertices.length > 1) {
        contours.push(contour);
      }
    }

    return contours;
  }

  /**
   * Builds a single contour by connecting segments.
   * @param segments - Array of all segments
   * @param startIndex - Index of the starting segment
   * @param used - Set of already used segment indices
   * @returns A connected contour
   * @example
   * ```typescript
   * const contour = this.buildContour(segments, 0, used);
   * ```
   */
  private buildContour(segments: LineSegment[], startIndex: number, used: Set<number>): Contour {
    const vertices: Point[] = [];
    const currentSegment = segments[startIndex];
    if (!currentSegment) {
      return {
        vertices: [],
        isClosed: false,
        level: this.config.threshold,
      };
    }
    let currentPoint = currentSegment.start;
    let nextPoint = currentSegment.end;

    vertices.push(currentPoint);
    used.add(startIndex);

    // Try to connect more segments
    while (nextPoint) {
      vertices.push(nextPoint);
      currentPoint = nextPoint;

      // Find the next segment that connects to currentPoint
      let found = false;
      for (let i = 0; i < segments.length; i++) {
        if (used.has(i)) continue;

        const segment = segments[i];
        if (segment && this.pointsEqual(segment.start, currentPoint)) {
          nextPoint = segment.end;
          used.add(i);
          found = true;
          break;
        } else if (segment && this.pointsEqual(segment.end, currentPoint)) {
          nextPoint = segment.start;
          used.add(i);
          found = true;
          break;
        }
      }

      if (!found) break;
    }

    // Check if contour is closed
    const firstVertex = vertices[0];
    const lastVertex = vertices[vertices.length - 1];
    const isClosed = vertices.length > 2 && firstVertex && lastVertex
      ? this.pointsEqual(firstVertex, lastVertex)
      : false;

    return {
      vertices: isClosed ? vertices.slice(0, -1) : vertices,
      isClosed,
      level: this.config.threshold,
    };
  }

  /**
   * Simplifies a contour by removing redundant vertices.
   * @param contour - The contour to simplify
   * @returns Simplified contour
   * @example
   * ```typescript
   * const simplified = this.simplifyContour(contour);
   * ```
   */
  private simplifyContour(contour: Contour): Contour {
    if (contour.vertices.length <= 2) return contour;

    const { simplificationTolerance } = this.config;
    const firstVertex = contour.vertices[0];
    if (!firstVertex) return contour;

    const simplified: Point[] = [firstVertex];

    for (let i = 1; i < contour.vertices.length - 1; i++) {
      const prev = simplified[simplified.length - 1];
      const curr = contour.vertices[i];
      const next = contour.vertices[i + 1];

      if (prev && curr && next) {
        const distance = this.pointLineDistance(curr, prev, next);
        if (distance > simplificationTolerance) {
          simplified.push(curr);
        }
      }
    }

    const lastVertex = contour.vertices[contour.vertices.length - 1];
    if (lastVertex) {
      simplified.push(lastVertex);
    }

    return {
      ...contour,
      vertices: simplified,
    };
  }

  /**
   * Calculates the distance from a point to a line segment.
   * @param point - The point to measure distance from
   * @param lineStart - Start point of the line segment
   * @param lineEnd - End point of the line segment
   * @returns Distance from point to line segment
   * @example
   * ```typescript
   * const distance = this.pointLineDistance(point, start, end);
   * ```
   */
  private pointLineDistance(point: Point | undefined, lineStart: Point, lineEnd: Point | undefined): number {
    if (!point || !lineEnd) return 0;

    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return 0;

    const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (length * length)));
    const projX = lineStart.x + t * dx;
    const projY = lineStart.y + t * dy;

    const distX = point.x - projX;
    const distY = point.y - projY;

    return Math.sqrt(distX * distX + distY * distY);
  }

  /**
   * Calculates the total length of a contour.
   * @param contour - The contour to measure
   * @returns Total length of the contour
   * @example
   * ```typescript
   * const length = this.calculateContourLength(contour);
   * ```
   */
  private calculateContourLength(contour: Contour): number {
    let length = 0;
    for (let i = 1; i < contour.vertices.length; i++) {
      const currentVertex = contour.vertices[i];
      const previousVertex = contour.vertices[i - 1];
      if (currentVertex && previousVertex) {
        const dx = currentVertex.x - previousVertex.x;
        const dy = currentVertex.y - previousVertex.y;
        length += Math.sqrt(dx * dx + dy * dy);
      }
    }
    if (contour.isClosed && contour.vertices.length > 1) {
      const firstVertex = contour.vertices[0];
      const lastVertex = contour.vertices[contour.vertices.length - 1];
      if (firstVertex && lastVertex) {
        const dx = firstVertex.x - lastVertex.x;
        const dy = firstVertex.y - lastVertex.y;
        length += Math.sqrt(dx * dx + dy * dy);
      }
    }
    return length;
  }

  /**
   * Checks if a contour intersects with the given bounds.
   * @param contour - The contour to check
   * @param bounds - Bounding box [minX, minY, maxX, maxY]
   * @returns True if contour intersects bounds
   * @example
   * ```typescript
   * const intersects = this.contourIntersectsBounds(contour, bounds);
   * ```
   */
  private contourIntersectsBounds(contour: Contour, bounds: [number, number, number, number]): boolean {
    const [minX, minY, maxX, maxY] = bounds;

    for (const vertex of contour.vertices) {
      if (vertex.x >= minX && vertex.x <= maxX && vertex.y >= minY && vertex.y <= maxY) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if two points are approximately equal.
   * @param p1 - First point
   * @param p2 - Second point
   * @param tolerance - Comparison tolerance
   * @returns True if points are approximately equal
   * @example
   * ```typescript
   * const equal = this.pointsEqual(p1, p2, 1e-6);
   * ```
   */
  private pointsEqual(p1: Point, p2: Point, tolerance: number = 1e-10): boolean {
    return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
  }
}
