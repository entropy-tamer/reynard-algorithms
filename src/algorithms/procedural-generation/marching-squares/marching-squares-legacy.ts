/**
 * @module algorithms/procedural-generation/marching-squares/marching-squares-legacy
 * @description Legacy implementation of the Marching Squares algorithm for contour generation from scalar fields.
 * This is the original implementation preserved for backward compatibility.
 */

import {
  Contour,
  ContourAnalysis,
  ContourAnalysisOptions,
  ContourSimplificationOptions,
  ContourSimplificationResult,
  LineSegment,
  MarchingSquaresConfig,
  MarchingSquaresResult,
  MultiLevelContourOptions,
  MultiLevelContourResult,
  Point,
} from "./marching-squares-types";

/**
 * The MarchingSquaresLegacy class provides the original implementation of the Marching Squares algorithm
 * for generating contour lines from scalar field data. This is preserved for backward compatibility.
 * For better performance, use the default MarchingSquares class which uses the refined LUT implementation.
 *
 * @example
 * ```typescript
 * const marchingSquares = new MarchingSquaresLegacy();
 * const grid = [
 *   [0, 0, 0],
 *   [0, 1, 0],
 *   [0, 0, 0],
 * ];
 * const result = marchingSquares.compute(grid, 0.5);
 * console.log(result.contours.length); // Should be 1 contour
 * ```
 */
export class MarchingSquaresLegacy {
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
      if (grid.length === 0 || !grid[0] || grid[0].length === 0) {
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
        grid.length > 0 && grid[0] ? grid[0].length : 0,
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

      if (grid.length === 0 || !grid[0] || grid[0].length === 0) {
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
          gridWidth: grid[0]?.length ?? 0,
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
          gridWidth: grid.length > 0 && grid[0] ? grid[0].length : 0,
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
      const lastSegment = contour.segments[contour.segments.length - 1];
      if (lastSegment) {
        points.push(lastSegment.end);
      }
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
      const start = simplifiedPoints[i];
      const end = simplifiedPoints[i + 1];
      if (start && end) {
        simplifiedSegments.push({
          start,
          end,
        });
      }
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
   * Validates a scalar field before contour generation.
   * Ensures the grid is a non-empty rectangular array of finite numbers whose rows all have the same length,
   * throwing at the first violation.
   *
   * @param grid Scalar field to validate.
   * @throws If the grid is not a 2D array, is empty, has ragged rows, or contains non-finite values.
   */
  private validateGrid(grid: number[][]): void {
    if (!Array.isArray(grid)) {
      throw new Error("Grid must be a 2D array");
    }

    if (grid.length === 0) {
      throw new Error("Grid cannot be empty");
    }

    const firstRow = grid[0];
    if (!firstRow) {
      throw new Error("Grid cannot be empty");
    }
    const firstRowLength = firstRow.length;
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
   * Marches every cell of the scalar field and merges the resulting segments into contours.
   * Each cell is classified against the threshold and emits its segments, which are then joined
   * into longer contours by matching endpoints.
   *
   * @param grid Scalar field sampled at grid vertices.
   * @param threshold Iso-level used to classify corners and interpolate edge crossings.
   * @returns The merged contours extracted from the field.
   * Complexity: see `catalog-algorithms-procedural-generation-marching-squares` in ~/src/foxtools/registry/algorithms/ (unknown: no machine-readable bound recorded; the guide is authoritative).
   */
  private generateContours(grid: number[][], threshold: number): Contour[] {
    const contours: Contour[] = [];
    const firstRow = grid[0];
    if (!firstRow) {
      return contours;
    }
    const width = firstRow.length;
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
   * Classifies one grid cell and wraps each of its contour segments in an open contour.
   * The four corner values are compared against the threshold to form the 4-bit case index,
   * which selects the cell's edge crossings.
   *
   * @param grid Scalar field sampled at grid vertices.
   * @param x Column index of the cell's top-left corner.
   * @param y Row index of the cell's top-left corner.
   * @param threshold Iso-level used to classify corners.
   * @returns One open contour per emitted segment, each tagged with the threshold level.
   */
  private processCell(grid: number[][], x: number, y: number, threshold: number): Contour[] {
    // Grid dimensions available if needed
    // const width = grid[0].length;
    // const height = grid.length;

    // Get the four corner values
    const rowY = grid[y];
    const rowY1 = grid[y + 1];
    if (!rowY || !rowY1) {
      return [];
    }
    const topLeft = rowY[x];
    const topRight = rowY[x + 1];
    const bottomLeft = rowY1[x];
    const bottomRight = rowY1[x + 1];

    if (topLeft === undefined || topRight === undefined || bottomLeft === undefined || bottomRight === undefined) {
      return [];
    }

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
   * Maps a marching-squares case to its edge crossings and emits one segment per connected edge pair.
   * The 16-entry lookup table gives pairs of cell edges; each edge is resolved to a point and the
   * pairs are connected into line segments.
   *
   * @param caseIndex 4-bit index encoding which of the four corners are above the threshold.
   * @param x Column index of the cell's top-left corner.
   * @param y Row index of the cell's top-left corner.
   * @param grid Scalar field sampled at grid vertices.
   * @param threshold Iso-level used to interpolate edge crossings.
   * @returns Line segments connecting the crossing points selected by the case.
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
      if (startEdge === undefined || endEdge === undefined) continue;
      const startPoint = this.getEdgePoint(startEdge, x, y, grid, threshold);
      const endPoint = this.getEdgePoint(endEdge, x, y, grid, threshold);

      if (startPoint && endPoint) {
        segments.push({ start: startPoint, end: endPoint });
      }
    }

    return segments;
  }

  /**
   * Computes where the iso-level crosses one edge of a cell.
   * Edge indices are 0 = top, 1 = right, 2 = bottom, 3 = left; crossings are linearly
   * interpolated between the two corner values unless interpolation is disabled, in which
   * case the edge midpoint is used.
   *
   * @param edgeIndex Which cell edge to cross (0 top, 1 right, 2 bottom, 3 left).
   * @param x Column index of the cell's top-left corner.
   * @param y Row index of the cell's top-left corner.
   * @param grid Scalar field sampled at grid vertices.
   * @param threshold Iso-level used for interpolation.
   * @returns The crossing point, or null when the edge's corner values are missing.
   */
  private getEdgePoint(edgeIndex: number, x: number, y: number, grid: number[][], threshold: number): Point | null {
    // Grid dimensions available if needed
    // const width = grid[0].length;
    // const height = grid.length;

    // Edge indices: 0=top, 1=right, 2=bottom, 3=left
    switch (edgeIndex) {
      case 0: // Top edge
        if (this.config.interpolate) {
          const rowY = grid[y];
          if (!rowY) return null;
          const left = rowY[x];
          const right = rowY[x + 1];
          if (left === undefined || right === undefined) return null;
          const t = this.interpolate(threshold, left, right);
          return { x: x + t, y: y };
        } else {
          return { x: x + 0.5, y: y };
        }

      case 1: // Right edge
        if (this.config.interpolate) {
          const rowY = grid[y];
          const rowY1 = grid[y + 1];
          if (!rowY || !rowY1) return null;
          const top = rowY[x + 1];
          const bottom = rowY1[x + 1];
          if (top === undefined || bottom === undefined) return null;
          const t = this.interpolate(threshold, top, bottom);
          return { x: x + 1, y: y + t };
        } else {
          return { x: x + 1, y: y + 0.5 };
        }

      case 2: // Bottom edge
        if (this.config.interpolate) {
          const rowY1 = grid[y + 1];
          if (!rowY1) return null;
          const left = rowY1[x];
          const right = rowY1[x + 1];
          if (left === undefined || right === undefined) return null;
          const t = this.interpolate(threshold, left, right);
          return { x: x + t, y: y + 1 };
        } else {
          return { x: x + 0.5, y: y + 1 };
        }

      case 3: // Left edge
        if (this.config.interpolate) {
          const rowY = grid[y];
          const rowY1 = grid[y + 1];
          if (!rowY || !rowY1) return null;
          const top = rowY[x];
          const bottom = rowY1[x];
          if (top === undefined || bottom === undefined) return null;
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
   * Returns the linear interpolation fraction of the iso-level between two corner values.
   * The fraction is t = (threshold - value1) / (value2 - value1); a flat pair within the
   * configured tolerance yields 0.5 to avoid division by zero.
   *
   * @param threshold Iso-level to locate between the two values.
   * @param value1 Scalar value at the start of the edge.
   * @param value2 Scalar value at the end of the edge.
   * @returns Fraction in [0, 1] giving the crossing position along the edge.
   */
  private interpolate(threshold: number, value1: number, value2: number): number {
    if (Math.abs(value1 - value2) < this.config.tolerance!) {
      return 0.5;
    }
    return (threshold - value1) / (value2 - value1);
  }

  /**
   * Greedily joins contours at the same level whose endpoints touch into longer contours.
   * Each contour is tried against the others repeatedly, comparing levels and endpoints with
   * the configured tolerance until no further merge is possible.
   *
   * @param contours Per-cell contours to merge.
   * @returns The merged contours, with consumed inputs removed.
   */
  private mergeContours(contours: Contour[]): Contour[] {
    if (contours.length === 0) return contours;

    const merged: Contour[] = [];
    const used = new Set<number>();

    for (let i = 0; i < contours.length; i++) {
      if (used.has(i)) continue;

      const contour = contours[i];
      if (!contour) continue;
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
          if (!otherContour) continue;
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
   * Attempts to concatenate two contours by matching their endpoints.
   * Handles both orientations by reversing one contour's segments as needed, and marks the
   * result closed when the remaining endpoints also coincide.
   *
   * @param contour1 First contour, whose level is kept by the result.
   * @param contour2 Second contour to attach.
   * @returns The merged contour, or null when no pair of endpoints matches.
   */
  private tryMergeContours(contour1: Contour, contour2: Contour): Contour | null {
    if (contour1.segments.length === 0 || contour2.segments.length === 0) {
      return null;
    }

    const firstSeg1 = contour1.segments[0];
    const lastSeg1 = contour1.segments[contour1.segments.length - 1];
    const firstSeg2 = contour2.segments[0];
    const lastSeg2 = contour2.segments[contour2.segments.length - 1];

    if (!firstSeg1 || !lastSeg1 || !firstSeg2 || !lastSeg2) {
      return null;
    }

    const start1 = firstSeg1.start;
    const end1 = lastSeg1.end;
    const start2 = firstSeg2.start;
    const end2 = lastSeg2.end;

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
   * Tests whether two points coincide within the configured tolerance.
   * Both coordinates must differ by less than the tolerance for the points to be considered equal.
   *
   * @param p1 First point.
   * @param p2 Second point.
   * @returns True when both coordinates are within tolerance.
   */
  private pointsEqual(p1: Point, p2: Point): boolean {
    return Math.abs(p1.x - p2.x) < this.config.tolerance! && Math.abs(p1.y - p2.y) < this.config.tolerance!;
  }

  /**
   * Sums the Euclidean lengths of a contour's segments.
   *
   * @param contour Contour whose segments are measured.
   * @returns Total polyline length.
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
   * Computes the enclosed area of a closed contour with the shoelace formula.
   * Open contours or those with fewer than three segments have zero area.
   *
   * @param contour Closed contour to measure.
   * @returns Absolute enclosed area, or 0 when the contour is open or too short.
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
   * Computes the length-weighted centroid of a contour's segments.
   * Segment midpoints are averaged by their lengths; an empty contour yields the origin.
   *
   * @param contour Contour to measure.
   * @returns Length-weighted centroid of the segment midpoints.
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
   * Computes the axis-aligned bounding box enclosing every segment endpoint of a contour.
   *
   * @param contour Contour to measure.
   * @returns Minimum and maximum x and y coordinates, all zero for an empty contour.
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
   * Simplifies a polyline with the Douglas-Peucker algorithm.
   * The point farthest from the line joining the endpoints is found recursively; when its
   * distance exceeds the threshold the polyline is split there, otherwise the interior
   * points are dropped.
   *
   * @param points Ordered points forming the polyline to simplify.
   * @param maxDistance Maximum perpendicular distance for a point to be discarded.
   * @param preserveEndpoints Whether to keep both endpoints when the interior is dropped.
   * @returns The simplified polyline.
   */
  private douglasPeucker(points: Point[], maxDistance: number, preserveEndpoints: boolean): Point[] {
    if (points.length <= 2) return points;

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    if (!firstPoint || !lastPoint) {
      return points;
    }

    // Find the point with maximum distance from the line between first and last points
    let maxDist = 0;
    let maxIndex = 0;

    for (let i = 1; i < points.length - 1; i++) {
      const point = points[i];
      if (!point) continue;
      const dist = this.pointToLineDistance(point, firstPoint, lastPoint);
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
        return [firstPoint, lastPoint];
      } else {
        return [firstPoint];
      }
    }
  }

  /**
   * Computes the perpendicular distance from a point to the infinite line through two points.
   * A degenerate line whose endpoints coincide falls back to the distance to that single point.
   *
   * @param point Point whose distance is measured.
   * @param lineStart First point defining the line.
   * @param lineEnd Second point defining the line.
   * @returns Euclidean distance from the point to the line.
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
   * Builds a failed result with no contours and statistics describing the failure.
   * The returned stats carry the grid dimensions, elapsed time, success = false, and the error text.
   *
   * @param width Width of the input grid, or 0 when unavailable.
   * @param height Height of the input grid.
   * @param startTime Timestamp used to report elapsed execution time.
   * @param error Error message to expose in the statistics.
   * @returns An empty MarchingSquaresResult marked as failed.
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
