/**
 * @module algorithms/geometry/algorithms/marching-squares/marching-squares-core
 * @description Implements the Marching Squares algorithm for contour generation from scalar fields.
 */

import {
  Point,
  LineSegment,
  Contour,
  MarchingSquaresConfig,
  MarchingSquaresResult,
  ContourAnalysisOptions,
  ContourAnalysis,
  ContourSimplificationOptions,
  ContourSimplificationResult,
  MultiLevelContourOptions,
  MultiLevelContourResult,
} from "./marching-squares-types";

/**
 * The MarchingSquares class provides an implementation of the Marching Squares algorithm
 * for generating contour lines from scalar field data. It's commonly used in computer
 * graphics, scientific visualization, and procedural generation.
 *
 * @example
 * ```typescript
 * const marchingSquares = new MarchingSquares();
 * const grid = [
 *   [0, 0, 0],
 *   [0, 1, 0],
 *   [0, 0, 0],
 * ];
 * const result = marchingSquares.compute(grid, 0.5);
 * console.log(result.contours.length); // Should be 1 contour
 * ```
 */
export class MarchingSquares {
  private config: MarchingSquaresConfig;

  /**
   * Creates an instance of MarchingSquares.
   * @param config - Optional configuration for the algorithm.
   * @example
   */
  constructor(config: Partial<MarchingSquaresConfig> = {}) {
    this.config = {
      threshold: 0.5,
      generateClosedContours: true,
      generateOpenContours: true,
      interpolate: true,
      tolerance: 1e-10,
      validateInput: true,
      ...config,
    };
  }

  /**
   * Computes contours from a 2D scalar field using the marching squares algorithm.
   * @param grid - 2D array representing the scalar field values.
   * @param threshold - Optional threshold override.
   * @returns A MarchingSquaresResult object with generated contours and statistics.
   * @example
   */
  compute(grid: number[][], threshold?: number): MarchingSquaresResult {
    const startTime = performance.now();
    const actualThreshold = threshold ?? this.config.threshold!;

    try {
      // Validate input
      if (this.config.validateInput) {
        this.validateGrid(grid);
      }

      // Handle edge cases
      if (grid.length === 0 || grid[0].length === 0) {
        return this.createEmptyResult(0, 0, startTime, "Grid cannot be empty");
      }

      const width = grid[0].length;
      const height = grid.length;

      // Generate contours
      const contours = this.generateContours(grid, actualThreshold);

      const executionTime = performance.now() - startTime;

      return {
        contours,
        stats: {
          gridWidth: width,
          gridHeight: height,
          contourCount: contours.length,
          segmentCount: contours.reduce((sum, contour) => sum + contour.segments.length, 0),
          executionTime,
          success: true,
        },
      };
    } catch (error) {
      return this.createEmptyResult(
        grid.length > 0 ? grid[0].length : 0,
        grid.length,
        startTime,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /**
   * Computes multi-level contours for different threshold values.
   * @param grid - 2D array representing the scalar field values.
   * @param options - Multi-level contour options.
   * @returns A MultiLevelContourResult object with contours organized by level.
   * @example
   */
  computeMultiLevel(grid: number[][], options: Partial<MultiLevelContourOptions>): MultiLevelContourResult {
    const startTime = performance.now();
    const multiOptions: MultiLevelContourOptions = {
      thresholds: options.thresholds || [0.5],
      generateAllLevels: true,
      mergeOverlapping: false,
      ...options,
    };

    try {
      if (this.config.validateInput) {
        this.validateGrid(grid);
      }

      if (grid.length === 0 || grid[0].length === 0) {
        return {
          contoursByLevel: new Map(),
          allContours: [],
          stats: {
            gridWidth: 0,
            gridHeight: 0,
            contourCount: 0,
            segmentCount: 0,
            executionTime: performance.now() - startTime,
            success: false,
            error: "Grid cannot be empty",
          },
        };
      }

      const contoursByLevel = new Map<number, Contour[]>();
      const allContours: Contour[] = [];

      for (const threshold of multiOptions.thresholds) {
        const result = this.compute(grid, threshold);
        if (result.stats.success) {
          contoursByLevel.set(threshold, result.contours);
          allContours.push(...result.contours);
        }
      }

      const executionTime = performance.now() - startTime;

      return {
        contoursByLevel,
        allContours,
        stats: {
          gridWidth: grid[0].length,
          gridHeight: grid.length,
          contourCount: allContours.length,
          segmentCount: allContours.reduce((sum, contour) => sum + contour.segments.length, 0),
          executionTime,
          success: true,
        },
      };
    } catch (error) {
      return {
        contoursByLevel: new Map(),
        allContours: [],
        stats: {
          gridWidth: grid.length > 0 ? grid[0].length : 0,
          gridHeight: grid.length,
          contourCount: 0,
          segmentCount: 0,
          executionTime: performance.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Analyzes a contour and computes various properties.
   * @param contour - The contour to analyze.
   * @param options - Analysis options.
   * @returns A ContourAnalysis object with computed properties.
   * @example
   */
  analyzeContour(contour: Contour, options: Partial<ContourAnalysisOptions> = {}): ContourAnalysis {
    const analysisOptions: ContourAnalysisOptions = {
      computeLengths: true,
      computeAreas: true,
      computeCentroids: true,
      computeBoundingBoxes: true,
      ...options,
    };

    const analysis: ContourAnalysis = {
      length: 0,
      centroid: { x: 0, y: 0 },
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    };

    if (contour.segments.length === 0) {
      return analysis;
    }

    if (analysisOptions.computeLengths) {
      analysis.length = this.computeContourLength(contour);
    }

    if (analysisOptions.computeAreas && contour.isClosed) {
      analysis.area = this.computeContourArea(contour);
    }

    if (analysisOptions.computeCentroids) {
      analysis.centroid = this.computeContourCentroid(contour);
    }

    if (analysisOptions.computeBoundingBoxes) {
      analysis.boundingBox = this.computeContourBoundingBox(contour);
    }

    return analysis;
  }

  /**
   * Simplifies a contour by removing unnecessary segments.
   * @param contour - The contour to simplify.
   * @param options - Simplification options.
   * @returns A ContourSimplificationResult object.
   * @example
   */
  simplifyContour(contour: Contour, options: Partial<ContourSimplificationOptions> = {}): ContourSimplificationResult {
    const simplificationOptions: ContourSimplificationOptions = {
      maxDistance: 0.1,
      preserveEndpoints: true,
      preserveCorners: false,
      ...options,
    };

    if (contour.segments.length <= 2) {
      return {
        simplifiedContour: { ...contour },
        segmentsRemoved: 0,
        compressionRatio: 1,
      };
    }

    // Extract points from segments
    const points: Point[] = [];
    for (const segment of contour.segments) {
      points.push(segment.start);
    }
    if (contour.segments.length > 0) {
      points.push(contour.segments[contour.segments.length - 1].end);
    }

    // Apply Douglas-Peucker algorithm
    const simplifiedPoints = this.douglasPeucker(
      points,
      simplificationOptions.maxDistance!,
      simplificationOptions.preserveEndpoints!
    );

    // Convert back to segments
    const simplifiedSegments: LineSegment[] = [];
    for (let i = 0; i < simplifiedPoints.length - 1; i++) {
      simplifiedSegments.push({
        start: simplifiedPoints[i],
        end: simplifiedPoints[i + 1],
      });
    }

    const simplifiedContour: Contour = {
      segments: simplifiedSegments,
      isClosed: contour.isClosed,
      level: contour.level,
    };

    return {
      simplifiedContour,
      segmentsRemoved: contour.segments.length - simplifiedSegments.length,
      compressionRatio: contour.segments.length / simplifiedSegments.length,
    };
  }

  // Private helper methods

  /**
   *
   * @param grid
   * @example
   */
  private validateGrid(grid: number[][]): void {
    if (!Array.isArray(grid)) {
      throw new Error("Grid must be a 2D array");
    }

    if (grid.length === 0) {
      throw new Error("Grid cannot be empty");
    }

    const firstRowLength = grid[0].length;
    if (firstRowLength === 0) {
      throw new Error("Grid rows cannot be empty");
    }

    for (let i = 0; i < grid.length; i++) {
      const row = grid[i];
      if (!Array.isArray(row)) {
        throw new Error(`Row ${i} must be an array`);
      }

      if (row.length !== firstRowLength) {
        throw new Error(
          `All rows must have the same length. Row ${i} has length ${row.length}, expected ${firstRowLength}`
        );
      }

      for (let j = 0; j < row.length; j++) {
        const value = row[j];
        if (typeof value !== "number" || !isFinite(value)) {
          throw new Error(`Invalid value at [${i}][${j}]: must be a finite number`);
        }
      }
    }
  }

  /**
   *
   * @param grid
   * @param threshold
   * @example
   */
  private generateContours(grid: number[][], threshold: number): Contour[] {
    const contours: Contour[] = [];
    const width = grid[0].length;
    const height = grid.length;

    // March through each cell
    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const cellContours = this.processCell(grid, x, y, threshold);
        contours.push(...cellContours);
      }
    }

    // Merge connected contours
    return this.mergeContours(contours);
  }

  /**
   *
   * @param grid
   * @param x
   * @param y
   * @param threshold
   * @example
   */
  private processCell(grid: number[][], x: number, y: number, threshold: number): Contour[] {
    // Grid dimensions available if needed
    // const width = grid[0].length;
    // const height = grid.length;

    // Get the four corner values
    const topLeft = grid[y][x];
    const topRight = grid[y][x + 1];
    const bottomLeft = grid[y + 1][x];
    const bottomRight = grid[y + 1][x + 1];

    // Determine which corners are above the threshold
    const corners = [topLeft >= threshold, topRight >= threshold, bottomRight >= threshold, bottomLeft >= threshold];

    // Calculate the case index (0-15)
    let caseIndex = 0;
    for (let i = 0; i < 4; i++) {
      if (corners[i]) {
        caseIndex |= 1 << i;
      }
    }

    // Generate line segments based on the case
    const segments = this.generateSegmentsForCase(caseIndex, x, y, grid, threshold);

    // Create contours from segments
    const contours: Contour[] = [];
    for (const segment of segments) {
      contours.push({
        segments: [segment],
        isClosed: false,
        level: threshold,
      });
    }

    return contours;
  }

  /**
   *
   * @param caseIndex
   * @param x
   * @param y
   * @param grid
   * @param threshold
   * @example
   */
  private generateSegmentsForCase(
    caseIndex: number,
    x: number,
    y: number,
    grid: number[][],
    threshold: number
  ): LineSegment[] {
    const segments: LineSegment[] = [];

    // Marching squares lookup table
    const cases = [
      [], // 0: all below threshold
      [[0, 3]], // 1: top-left above
      [[0, 1]], // 2: top-right above
      [[1, 3]], // 3: top-left and top-right above
      [[1, 2]], // 4: bottom-right above
      [
        [0, 1],
        [2, 3],
      ], // 5: top-left and bottom-right above
      [[0, 2]], // 6: top-right and bottom-right above
      [[2, 3]], // 7: top-left, top-right, and bottom-right above
      [[2, 3]], // 8: bottom-left above
      [[0, 2]], // 9: top-left and bottom-left above
      [
        [0, 1],
        [2, 3],
      ], // 10: top-right and bottom-left above
      [[1, 2]], // 11: top-left, top-right, and bottom-left above
      [[1, 3]], // 12: bottom-left and bottom-right above
      [[0, 1]], // 13: top-left, bottom-left, and bottom-right above
      [[0, 3]], // 14: top-right, bottom-left, and bottom-right above
      [], // 15: all above threshold
    ];

    const edges = cases[caseIndex];
    if (!edges) return segments;

    for (const edge of edges) {
      const [startEdge, endEdge] = edge;
      const startPoint = this.getEdgePoint(startEdge, x, y, grid, threshold);
      const endPoint = this.getEdgePoint(endEdge, x, y, grid, threshold);

      if (startPoint && endPoint) {
        segments.push({ start: startPoint, end: endPoint });
      }
    }

    return segments;
  }

  /**
   *
   * @param edgeIndex
   * @param x
   * @param y
   * @param grid
   * @param threshold
   * @example
   */
  private getEdgePoint(edgeIndex: number, x: number, y: number, grid: number[][], threshold: number): Point | null {
    // Grid dimensions available if needed
    // const width = grid[0].length;
    // const height = grid.length;

    // Edge indices: 0=top, 1=right, 2=bottom, 3=left
    switch (edgeIndex) {
      case 0: // Top edge
        if (this.config.interpolate) {
          const left = grid[y][x];
          const right = grid[y][x + 1];
          const t = this.interpolate(threshold, left, right);
          return { x: x + t, y: y };
        } else {
          return { x: x + 0.5, y: y };
        }

      case 1: // Right edge
        if (this.config.interpolate) {
          const top = grid[y][x + 1];
          const bottom = grid[y + 1][x + 1];
          const t = this.interpolate(threshold, top, bottom);
          return { x: x + 1, y: y + t };
        } else {
          return { x: x + 1, y: y + 0.5 };
        }

      case 2: // Bottom edge
        if (this.config.interpolate) {
          const left = grid[y + 1][x];
          const right = grid[y + 1][x + 1];
          const t = this.interpolate(threshold, left, right);
          return { x: x + t, y: y + 1 };
        } else {
          return { x: x + 0.5, y: y + 1 };
        }

      case 3: // Left edge
        if (this.config.interpolate) {
          const top = grid[y][x];
          const bottom = grid[y + 1][x];
          const t = this.interpolate(threshold, top, bottom);
          return { x: x, y: y + t };
        } else {
          return { x: x, y: y + 0.5 };
        }

      default:
        return null;
    }
  }

  /**
   *
   * @param threshold
   * @param value1
   * @param value2
   * @example
   */
  private interpolate(threshold: number, value1: number, value2: number): number {
    if (Math.abs(value1 - value2) < this.config.tolerance!) {
      return 0.5;
    }
    return (threshold - value1) / (value2 - value1);
  }

  /**
   *
   * @param contours
   * @example
   */
  private mergeContours(contours: Contour[]): Contour[] {
    if (contours.length === 0) return contours;

    const merged: Contour[] = [];
    const used = new Set<number>();

    for (let i = 0; i < contours.length; i++) {
      if (used.has(i)) continue;

      const contour = contours[i];
      const mergedContour: Contour = {
        segments: [...contour.segments],
        isClosed: contour.isClosed,
        level: contour.level,
      };

      used.add(i);

      // Try to merge with other contours
      let mergedAny = true;
      while (mergedAny) {
        mergedAny = false;
        for (let j = 0; j < contours.length; j++) {
          if (used.has(j)) continue;

          const otherContour = contours[j];
          if (Math.abs(otherContour.level - mergedContour.level) > this.config.tolerance!) {
            continue;
          }

          const mergedResult = this.tryMergeContours(mergedContour, otherContour);
          if (mergedResult) {
            mergedContour.segments = mergedResult.segments;
            mergedContour.isClosed = mergedResult.isClosed;
            used.add(j);
            mergedAny = true;
            break;
          }
        }
      }

      merged.push(mergedContour);
    }

    return merged;
  }

  /**
   *
   * @param contour1
   * @param contour2
   * @example
   */
  private tryMergeContours(contour1: Contour, contour2: Contour): Contour | null {
    if (contour1.segments.length === 0 || contour2.segments.length === 0) {
      return null;
    }

    const start1 = contour1.segments[0].start;
    const end1 = contour1.segments[contour1.segments.length - 1].end;
    const start2 = contour2.segments[0].start;
    const end2 = contour2.segments[contour2.segments.length - 1].end;

    // Check if contours can be merged
    if (this.pointsEqual(end1, start2)) {
      // contour1 end connects to contour2 start
      return {
        segments: [...contour1.segments, ...contour2.segments],
        isClosed: this.pointsEqual(start1, end2),
        level: contour1.level,
      };
    } else if (this.pointsEqual(end2, start1)) {
      // contour2 end connects to contour1 start
      return {
        segments: [...contour2.segments, ...contour1.segments],
        isClosed: this.pointsEqual(start2, end1),
        level: contour1.level,
      };
    } else if (this.pointsEqual(end1, end2)) {
      // contour1 end connects to contour2 end (reverse contour2)
      const reversedSegments = contour2.segments
        .map(seg => ({
          start: seg.end,
          end: seg.start,
        }))
        .reverse();
      return {
        segments: [...contour1.segments, ...reversedSegments],
        isClosed: this.pointsEqual(start1, start2),
        level: contour1.level,
      };
    } else if (this.pointsEqual(start1, start2)) {
      // contour1 start connects to contour2 start (reverse contour1)
      const reversedSegments = contour1.segments
        .map(seg => ({
          start: seg.end,
          end: seg.start,
        }))
        .reverse();
      return {
        segments: [...reversedSegments, ...contour2.segments],
        isClosed: this.pointsEqual(end1, end2),
        level: contour1.level,
      };
    }

    return null;
  }

  /**
   *
   * @param p1
   * @param p2
   * @example
   */
  private pointsEqual(p1: Point, p2: Point): boolean {
    return Math.abs(p1.x - p2.x) < this.config.tolerance! && Math.abs(p1.y - p2.y) < this.config.tolerance!;
  }

  /**
   *
   * @param contour
   * @example
   */
  private computeContourLength(contour: Contour): number {
    let length = 0;
    for (const segment of contour.segments) {
      const dx = segment.end.x - segment.start.x;
      const dy = segment.end.y - segment.start.y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }

  /**
   *
   * @param contour
   * @example
   */
  private computeContourArea(contour: Contour): number {
    if (!contour.isClosed || contour.segments.length < 3) {
      return 0;
    }

    // Use shoelace formula
    let area = 0;
    for (const segment of contour.segments) {
      area += segment.start.x * segment.end.y;
      area -= segment.end.x * segment.start.y;
    }
    return Math.abs(area) / 2;
  }

  /**
   *
   * @param contour
   * @example
   */
  private computeContourCentroid(contour: Contour): Point {
    if (contour.segments.length === 0) {
      return { x: 0, y: 0 };
    }

    let cx = 0;
    let cy = 0;
    let totalLength = 0;

    for (const segment of contour.segments) {
      const length = Math.sqrt((segment.end.x - segment.start.x) ** 2 + (segment.end.y - segment.start.y) ** 2);
      cx += ((segment.start.x + segment.end.x) / 2) * length;
      cy += ((segment.start.y + segment.end.y) / 2) * length;
      totalLength += length;
    }

    return {
      x: totalLength > 0 ? cx / totalLength : 0,
      y: totalLength > 0 ? cy / totalLength : 0,
    };
  }

  /**
   *
   * @param contour
   * @example
   */
  private computeContourBoundingBox(contour: Contour): { minX: number; minY: number; maxX: number; maxY: number } {
    if (contour.segments.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const segment of contour.segments) {
      minX = Math.min(minX, segment.start.x, segment.end.x);
      minY = Math.min(minY, segment.start.y, segment.end.y);
      maxX = Math.max(maxX, segment.start.x, segment.end.x);
      maxY = Math.max(maxY, segment.start.y, segment.end.y);
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   *
   * @param points
   * @param maxDistance
   * @param preserveEndpoints
   * @example
   */
  private douglasPeucker(points: Point[], maxDistance: number, preserveEndpoints: boolean): Point[] {
    if (points.length <= 2) return points;

    // Find the point with maximum distance from the line between first and last points
    let maxDist = 0;
    let maxIndex = 0;

    for (let i = 1; i < points.length - 1; i++) {
      const dist = this.pointToLineDistance(points[i], points[0], points[points.length - 1]);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }

    // If max distance is greater than threshold, recursively simplify
    if (maxDist > maxDistance) {
      const left = this.douglasPeucker(points.slice(0, maxIndex + 1), maxDistance, preserveEndpoints);
      const right = this.douglasPeucker(points.slice(maxIndex), maxDistance, preserveEndpoints);

      // Combine results, removing duplicate middle point
      return [...left.slice(0, -1), ...right];
    } else {
      // If max distance is within threshold, return only endpoints
      if (preserveEndpoints) {
        return [points[0], points[points.length - 1]];
      } else {
        return [points[0]];
      }
    }
  }

  /**
   *
   * @param point
   * @param lineStart
   * @param lineEnd
   * @example
   */
  private pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) {
      return Math.sqrt(A * A + B * B);
    }

    const param = dot / lenSq;
    const xx = lineStart.x + param * C;
    const yy = lineStart.y + param * D;

    const dx = point.x - xx;
    const dy = point.y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   *
   * @param width
   * @param height
   * @param startTime
   * @param error
   * @example
   */
  private createEmptyResult(width: number, height: number, startTime: number, error: string): MarchingSquaresResult {
    return {
      contours: [],
      stats: {
        gridWidth: width,
        gridHeight: height,
        contourCount: 0,
        segmentCount: 0,
        executionTime: performance.now() - startTime,
        success: false,
        error,
      },
    };
  }
}
