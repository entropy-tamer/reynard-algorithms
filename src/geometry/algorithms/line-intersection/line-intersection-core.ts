/**
 * @module algorithms/geometry/algorithms/line-intersection/line-intersection-core
 * @description Implements the Bentley-Ottmann line segment intersection algorithm.
 */

import {
  Point,
  LineSegment,
  IntersectionPoint,
  SweepLineEvent,
  LineIntersectionConfig,
  LineIntersectionStats,
  LineIntersectionResult,
  IntersectionQueryOptions,
  IntersectionQueryResult,
  SegmentValidationOptions,
  SegmentValidationResult,
  IntersectionSerializationOptions,
  IntersectionSerialization,
} from "./line-intersection-types";
import { SweepLineEventQueue, SweepLineStatusStructure, SweepLineUtils } from "./sweep-line";

/**
 * The LineIntersection class implements the Bentley-Ottmann algorithm for finding
 * all intersections between a set of line segments. This algorithm uses a sweep
 * line approach with an event queue and status structure to efficiently find
 * intersections in O((n + k) log n) time, where n is the number of segments
 * and k is the number of intersections.
 *
 * @example
 * ```typescript
 * const intersection = new LineIntersection();
 * const segments = [
 *   { id: 1, start: { x: 0, y: 0 }, end: { x: 2, y: 2 } },
 *   { id: 2, start: { x: 0, y: 2 }, end: { x: 2, y: 0 } },
 * ];
 * const result = intersection.findIntersections(segments);
 * console.log(result.intersections.length); // Should be 1
 * ```
 */
export class LineIntersection {
  private config: LineIntersectionConfig;
  private eventQueue: SweepLineEventQueue;
  private statusStructure: SweepLineStatusStructure;

  /**
   * Creates an instance of LineIntersection.
   * @param config - Optional configuration for the algorithm.
   * @example
   */
  constructor(config: Partial<LineIntersectionConfig> = {}) {
    this.config = {
      tolerance: 1e-10,
      validateInput: true,
      handleDegenerates: true,
      removeDuplicates: true,
      sortSegments: true,
      maxIntersections: Infinity,
      ...config,
    };

    this.eventQueue = new SweepLineEventQueue();
    this.statusStructure = new SweepLineStatusStructure(this.config.tolerance);
  }

  /**
   * Finds all intersections between the given line segments.
   * @param segments - Array of line segments to analyze.
   * @returns The result containing all intersections found.
   * @example
   */
  findIntersections(segments: LineSegment[]): LineIntersectionResult {
    const startTime = performance.now();

    try {
      // Validate input
      if (this.config.validateInput) {
        const validation = this.validateSegments(segments);
        if (!validation.isValid) {
          return this.createEmptyResult(startTime, `Validation failed: ${validation.errors.join(", ")}`);
        }
      }

      // Handle edge cases
      if (segments.length < 2) {
        return this.createEmptyResult(startTime, "At least 2 segments are required for intersection finding");
      }

      // Sort segments if requested
      const processedSegments = this.config.sortSegments ? this.sortSegments(segments) : segments;

      // Initialize event queue with segment endpoints
      this.initializeEventQueue(processedSegments);

      // Run the sweep line algorithm
      const intersections = this.runSweepLineAlgorithm();

      // Post-process results
      const processedIntersections = this.postProcessIntersections(intersections);

      const executionTime = performance.now() - startTime;

      const stats: LineIntersectionStats = {
        segmentCount: segments.length,
        intersectionCount: processedIntersections.length,
        eventCount: this.eventQueue.size(),
        degenerateCount: 0, // Will be calculated during processing
        executionTime,
        success: true,
        maxTreeDepth: this.calculateMaxTreeDepth(),
        averageTreeDepth: this.calculateAverageTreeDepth(),
      };

      return {
        intersections: processedIntersections,
        stats,
        hasIntersections: processedIntersections.length > 0,
        uniqueIntersectionCount: processedIntersections.length,
      };
    } catch (error) {
      return this.createEmptyResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }

  /**
   * Queries for intersections matching specific criteria.
   * @param segments - Array of line segments to analyze.
   * @param options - Query options.
   * @returns The query result.
   * @example
   */
  queryIntersections(segments: LineSegment[], options: IntersectionQueryOptions = {}): IntersectionQueryResult {
    const startTime = performance.now();

    const result = this.findIntersections(segments);
    let filteredIntersections = result.intersections;

    // Apply bounding box filter
    if (options.boundingBox) {
      filteredIntersections = filteredIntersections.filter(intersection =>
        this.isPointInBoundingBox(intersection.point, options.boundingBox!)
      );
    }

    // Apply segment ID filter
    if (options.segmentIds) {
      filteredIntersections = filteredIntersections.filter(
        intersection =>
          options.segmentIds!.includes(intersection.segments[0].id) ||
          options.segmentIds!.includes(intersection.segments[1].id)
      );
    }

    // Apply distance filter
    if (options.maxDistance !== undefined) {
      filteredIntersections = filteredIntersections.filter(intersection =>
        this.isPointWithinDistance(intersection.point, options.maxDistance!)
      );
    }

    // Apply degenerate filter
    if (!options.includeDegenerates) {
      filteredIntersections = filteredIntersections.filter(
        intersection => !this.isDegenerateIntersection(intersection)
      );
    }

    const executionTime = performance.now() - startTime;

    return {
      intersections: filteredIntersections,
      count: filteredIntersections.length,
      executionTime,
    };
  }

  /**
   * Validates a set of line segments.
   * @param segments - The segments to validate.
   * @param options - Validation options.
   * @returns The validation result.
   * @example
   */
  validateSegments(segments: LineSegment[], options: Partial<SegmentValidationOptions> = {}): SegmentValidationResult {
    const validationOptions: SegmentValidationOptions = {
      checkZeroLength: true,
      checkDuplicates: true,
      checkInfinite: true,
      minLength: 0,
      ...options,
    };

    const errors: string[] = [];
    const warnings: string[] = [];
    let invalidCount = 0;
    let duplicateCount = 0;

    // Check basic structure
    if (!Array.isArray(segments)) {
      errors.push("Segments must be an array");
      return this.createValidationResult(false, errors, warnings, 0, 0);
    }

    if (segments.length === 0) {
      errors.push("At least one segment is required");
      return this.createValidationResult(false, errors, warnings, 0, 0);
    }

    // Check each segment
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      if (!segment || typeof segment.id === "undefined") {
        errors.push(`Segment ${i} must have an id`);
        invalidCount++;
        continue;
      }

      if (!segment.start || !segment.end) {
        errors.push(`Segment ${i} must have start and end points`);
        invalidCount++;
        continue;
      }

      if (!this.isValidPoint(segment.start) || !this.isValidPoint(segment.end)) {
        errors.push(`Segment ${i} has invalid start or end point`);
        invalidCount++;
        continue;
      }

      // Check for zero-length segments
      if (validationOptions.checkZeroLength) {
        const length = SweepLineUtils.distance(segment.start, segment.end);
        if (length < validationOptions.minLength!) {
          warnings.push(`Segment ${i} has zero or very small length`);
        }
      }

      // Check for infinite coordinates
      if (validationOptions.checkInfinite) {
        if (
          !isFinite(segment.start.x) ||
          !isFinite(segment.start.y) ||
          !isFinite(segment.end.x) ||
          !isFinite(segment.end.y)
        ) {
          errors.push(`Segment ${i} has infinite coordinates`);
          invalidCount++;
        }
      }
    }

    // Check for duplicate segments
    if (validationOptions.checkDuplicates) {
      for (let i = 0; i < segments.length; i++) {
        for (let j = i + 1; j < segments.length; j++) {
          if (this.areSegmentsEqual(segments[i], segments[j])) {
            duplicateCount++;
            warnings.push(`Segments ${i} and ${j} are duplicates`);
          }
        }
      }
    }

    return this.createValidationResult(errors.length === 0, errors, warnings, invalidCount, duplicateCount);
  }

  /**
   * Serializes intersection results to a JSON-serializable format.
   * @param result - The intersection result to serialize.
   * @param options - Serialization options.
   * @returns Serialized intersection data.
   * @example
   */
  serialize(
    result: LineIntersectionResult,
    options: Partial<IntersectionSerializationOptions> = {}
  ): IntersectionSerialization {
    const serializationOptions: IntersectionSerializationOptions = {
      precision: 6,
      includeSegmentData: false,
      includeStats: false,
      includeValidation: false,
      ...options,
    };

    const round = (value: number) => {
      return (
        Math.round(value * Math.pow(10, serializationOptions.precision!)) /
        Math.pow(10, serializationOptions.precision!)
      );
    };

    const roundPoint = (point: Point) => ({
      x: round(point.x),
      y: round(point.y),
    });

    const serializedIntersections = result.intersections.map(intersection => ({
      point: roundPoint(intersection.point),
      segmentIds: [intersection.segments[0].id, intersection.segments[1].id] as [string | number, string | number],
      parameters: [round(intersection.t1), round(intersection.t2)] as [number, number],
    }));

    const serialized: IntersectionSerialization = {
      intersections: serializedIntersections,
      config: this.config,
    };

    if (serializationOptions.includeStats) {
      serialized.stats = result.stats;
    }

    return serialized;
  }

  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   * @example
   */
  updateConfig(newConfig: Partial<LineIntersectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.statusStructure = new SweepLineStatusStructure(this.config.tolerance);
  }

  /**
   * Gets the current configuration.
   * @returns The current configuration.
   * @example
   */
  getConfig(): LineIntersectionConfig {
    return { ...this.config };
  }

  /**
   * Initializes the event queue with segment endpoints.
   * @param segments - The segments to process.
   * @example
   */
  private initializeEventQueue(segments: LineSegment[]): void {
    this.eventQueue.clear();

    for (const segment of segments) {
      const events = SweepLineUtils.createSegmentEvents(segment);
      for (const event of events) {
        this.eventQueue.add(event);
      }
    }
  }

  /**
   * Runs the main sweep line algorithm.
   * @returns Array of intersection points found.
   * @example
   */
  private runSweepLineAlgorithm(): IntersectionPoint[] {
    const intersections: IntersectionPoint[] = [];
    let eventCount = 0;

    while (!this.eventQueue.isEmpty() && intersections.length < this.config.maxIntersections!) {
      const event = this.eventQueue.poll()!;
      eventCount++;

      switch (event.type) {
        case "start":
          this.handleStartEvent(event, intersections);
          break;
        case "end":
          this.handleEndEvent(event, intersections);
          break;
        case "intersection":
          this.handleIntersectionEvent(event, intersections);
          break;
      }
    }

    return intersections;
  }

  /**
   * Handles a start event (segment begins).
   * @param event - The start event.
   * @param intersections - Array to collect intersections.
   * @example
   */
  private handleStartEvent(event: SweepLineEvent, intersections: IntersectionPoint[]): void {
    const segment = event.segment!;
    this.statusStructure.insert(segment, event.point.y);

    // Check for intersections with neighboring segments
    const neighbors = this.statusStructure.findNeighbors(segment, event.point.y);

    if (neighbors.above) {
      this.checkAndAddIntersection(segment, neighbors.above, event.point.y, intersections);
    }

    if (neighbors.below) {
      this.checkAndAddIntersection(segment, neighbors.below, event.point.y, intersections);
    }
  }

  /**
   * Handles an end event (segment ends).
   * @param event - The end event.
   * @param intersections - Array to collect intersections.
   * @example
   */
  private handleEndEvent(event: SweepLineEvent, intersections: IntersectionPoint[]): void {
    const segment = event.segment!;
    const neighbors = this.statusStructure.findNeighbors(segment, event.point.y);

    this.statusStructure.remove(segment, event.point.y);

    // Check for intersections between neighbors
    if (neighbors.above && neighbors.below) {
      this.checkAndAddIntersection(neighbors.above, neighbors.below, event.point.y, intersections);
    }
  }

  /**
   * Handles an intersection event.
   * @param event - The intersection event.
   * @param intersections - Array to collect intersections.
   * @example
   */
  private handleIntersectionEvent(event: SweepLineEvent, intersections: IntersectionPoint[]): void {
    const [segment1, segment2] = event.segments!;

    // Swap segments in the status structure
    this.statusStructure.remove(segment1, event.point.y);
    this.statusStructure.remove(segment2, event.point.y);
    this.statusStructure.insert(segment2, event.point.y);
    this.statusStructure.insert(segment1, event.point.y);

    // Check for new intersections with neighbors
    const neighbors1 = this.statusStructure.findNeighbors(segment1, event.point.y);
    const neighbors2 = this.statusStructure.findNeighbors(segment2, event.point.y);

    if (neighbors1.above) {
      this.checkAndAddIntersection(segment1, neighbors1.above, event.point.y, intersections);
    }

    if (neighbors2.below) {
      this.checkAndAddIntersection(segment2, neighbors2.below, event.point.y, intersections);
    }

    // Add the intersection point
    const intersection = this.createIntersectionPoint(event.point, segment1, segment2);
    if (intersection) {
      intersections.push(intersection);
    }
  }

  /**
   * Checks if two segments intersect and adds the intersection to the queue if found.
   * @param seg1 - First segment.
   * @param seg2 - Second segment.
   * @param sweepY - Current sweep line y-coordinate.
   * @param intersections - Array to collect intersections.
   * @param _intersections
   * @example
   */
  private checkAndAddIntersection(
    seg1: LineSegment,
    seg2: LineSegment,
    sweepY: number,
    _intersections: IntersectionPoint[]
  ): void {
    const intersection = SweepLineUtils.lineSegmentsIntersect(seg1, seg2, this.config.tolerance);

    if (intersection && intersection.point.y > sweepY + (this.config.tolerance ?? 1e-10)) {
      // Create intersection event
      const event = SweepLineUtils.createIntersectionEvent(intersection.point, seg1, seg2);
      this.eventQueue.add(event);
    }
  }

  /**
   * Creates an intersection point from an intersection event.
   * @param point - The intersection point.
   * @param _point
   * @param seg1 - First segment.
   * @param seg2 - Second segment.
   * @returns The intersection point, or null if invalid.
   * @example
   */
  private createIntersectionPoint(_point: Point, seg1: LineSegment, seg2: LineSegment): IntersectionPoint | null {
    const intersection = SweepLineUtils.lineSegmentsIntersect(seg1, seg2, this.config.tolerance);

    if (!intersection) {
      return null;
    }

    return {
      point: intersection.point,
      segments: [seg1, seg2],
      t1: intersection.t1,
      t2: intersection.t2,
    };
  }

  /**
   * Post-processes intersection results.
   * @param intersections - Raw intersection points.
   * @returns Processed intersection points.
   * @example
   */
  private postProcessIntersections(intersections: IntersectionPoint[]): IntersectionPoint[] {
    let processed = intersections;

    // Remove duplicates if requested
    if (this.config.removeDuplicates) {
      processed = this.removeDuplicateIntersections(processed);
    }

    // Filter out degenerate intersections if not handling them
    if (!this.config.handleDegenerates) {
      processed = processed.filter(intersection => !this.isDegenerateIntersection(intersection));
    }

    return processed;
  }

  /**
   * Removes duplicate intersection points.
   * @param intersections - Array of intersection points.
   * @returns Array with duplicates removed.
   * @example
   */
  private removeDuplicateIntersections(intersections: IntersectionPoint[]): IntersectionPoint[] {
    const unique: IntersectionPoint[] = [];

    for (const intersection of intersections) {
      const isDuplicate = unique.some(
        existing =>
          SweepLineUtils.pointsEqual(existing.point, intersection.point, this.config.tolerance) &&
          ((existing.segments[0].id === intersection.segments[0].id &&
            existing.segments[1].id === intersection.segments[1].id) ||
            (existing.segments[0].id === intersection.segments[1].id &&
              existing.segments[1].id === intersection.segments[0].id))
      );

      if (!isDuplicate) {
        unique.push(intersection);
      }
    }

    return unique;
  }

  /**
   * Checks if an intersection is degenerate (at segment endpoints).
   * @param intersection - The intersection to check.
   * @returns True if the intersection is degenerate.
   * @example
   */
  private isDegenerateIntersection(intersection: IntersectionPoint): boolean {
    const { point, segments } = intersection;
    const [seg1, seg2] = segments;

    return (
      SweepLineUtils.pointOnSegment(point, seg1, this.config.tolerance) ||
      SweepLineUtils.pointOnSegment(point, seg2, this.config.tolerance)
    );
  }

  /**
   * Sorts segments for better performance.
   * @param segments - Array of segments to sort.
   * @returns Sorted array of segments.
   * @example
   */
  private sortSegments(segments: LineSegment[]): LineSegment[] {
    return [...segments].sort((a, b) => {
      // Sort by minimum y-coordinate
      const minYA = Math.min(a.start.y, a.end.y);
      const minYB = Math.min(b.start.y, b.end.y);

      if (Math.abs(minYA - minYB) > (this.config.tolerance ?? 1e-10)) {
        return minYA - minYB;
      }

      // Secondary sort by minimum x-coordinate
      const minXA = Math.min(a.start.x, a.end.x);
      const minXB = Math.min(b.start.x, b.end.x);

      return minXA - minXB;
    });
  }

  /**
   * Checks if a point is within a bounding box.
   * @param point - The point to check.
   * @param boundingBox - The bounding box.
   * @param boundingBox.min
   * @param boundingBox.max
   * @returns True if the point is within the bounding box.
   * @example
   */
  private isPointInBoundingBox(point: Point, boundingBox: { min: Point; max: Point }): boolean {
    return (
      point.x >= boundingBox.min.x &&
      point.x <= boundingBox.max.x &&
      point.y >= boundingBox.min.y &&
      point.y <= boundingBox.max.y
    );
  }

  /**
   * Checks if a point is within a certain distance from the origin.
   * @param point - The point to check.
   * @param maxDistance - The maximum distance.
   * @returns True if the point is within the distance.
   * @example
   */
  private isPointWithinDistance(point: Point, maxDistance: number): boolean {
    const distance = Math.sqrt(point.x * point.x + point.y * point.y);
    return distance <= maxDistance;
  }

  /**
   * Validates a point.
   * @param point - The point to validate.
   * @returns True if the point is valid.
   * @example
   */
  private isValidPoint(point: Point): boolean {
    return (
      point && typeof point.x === "number" && typeof point.y === "number" && isFinite(point.x) && isFinite(point.y)
    );
  }

  /**
   * Checks if two segments are equal.
   * @param seg1 - First segment.
   * @param seg2 - Second segment.
   * @returns True if the segments are equal.
   * @example
   */
  private areSegmentsEqual(seg1: LineSegment, seg2: LineSegment): boolean {
    return (
      (SweepLineUtils.pointsEqual(seg1.start, seg2.start, this.config.tolerance) &&
        SweepLineUtils.pointsEqual(seg1.end, seg2.end, this.config.tolerance)) ||
      (SweepLineUtils.pointsEqual(seg1.start, seg2.end, this.config.tolerance) &&
        SweepLineUtils.pointsEqual(seg1.end, seg2.start, this.config.tolerance))
    );
  }

  /**
   * Calculates the maximum depth of the status tree.
   * @returns The maximum depth.
   * @example
   */
  private calculateMaxTreeDepth(): number {
    // This is a simplified implementation
    // In a real implementation, you'd traverse the tree to find the actual depth
    return Math.ceil(Math.log2(this.statusStructure.size() + 1));
  }

  /**
   * Calculates the average depth of the status tree.
   * @returns The average depth.
   * @example
   */
  private calculateAverageTreeDepth(): number {
    // This is a simplified implementation
    // In a real implementation, you'd calculate the actual average depth
    return this.calculateMaxTreeDepth() / 2;
  }

  /**
   * Creates a validation result object.
   * @param isValid - Whether validation passed.
   * @param errors - Array of errors.
   * @param warnings - Array of warnings.
   * @param invalidCount - Number of invalid segments.
   * @param duplicateCount - Number of duplicate segments.
   * @returns The validation result.
   * @example
   */
  private createValidationResult(
    isValid: boolean,
    errors: string[],
    warnings: string[],
    invalidCount: number,
    duplicateCount: number
  ): SegmentValidationResult {
    return {
      isValid,
      errors,
      warnings,
      invalidCount,
      duplicateCount,
    };
  }

  /**
   * Creates an empty result for error cases.
   * @param startTime - Start time for execution time calculation.
   * @param error - Error message.
   * @returns Empty intersection result.
   * @example
   */
  private createEmptyResult(startTime: number, error: string): LineIntersectionResult {
    const executionTime = performance.now() - startTime;
    const stats: LineIntersectionStats = {
      segmentCount: 0,
      intersectionCount: 0,
      eventCount: 0,
      degenerateCount: 0,
      executionTime,
      success: false,
      error,
      maxTreeDepth: 0,
      averageTreeDepth: 0,
    };

    return {
      intersections: [],
      stats,
      hasIntersections: false,
      uniqueIntersectionCount: 0,
    };
  }
}
