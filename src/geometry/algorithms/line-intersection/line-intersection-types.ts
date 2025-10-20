/**
 * @module algorithms/geometry/algorithms/line-intersection/types
 * @description Defines the types and interfaces for Bentley-Ottmann line segment intersection algorithm.
 */

/**
 * Represents a 2D point with x and y coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents a line segment between two points.
 */
export interface LineSegment {
  id: string | number;
  start: Point;
  end: Point;
  data?: any; // Optional additional data associated with the segment
}

/**
 * Represents an intersection point between two line segments.
 */
export interface IntersectionPoint {
  point: Point;
  segments: [LineSegment, LineSegment];
  t1: number; // Parameter along first segment (0-1)
  t2: number; // Parameter along second segment (0-1)
}

/**
 * Represents an event in the sweep line algorithm.
 */
export interface SweepLineEvent {
  type: "start" | "end" | "intersection";
  point: Point;
  segment?: LineSegment;
  segments?: [LineSegment, LineSegment]; // For intersection events
  priority: number; // For event queue ordering
}

/**
 * Represents a node in the sweep line status structure (balanced binary search tree).
 */
export interface StatusNode {
  segment: LineSegment;
  left: StatusNode | null;
  right: StatusNode | null;
  parent: StatusNode | null;
  height: number;
}

/**
 * Configuration options for the Bentley-Ottmann algorithm.
 */
export interface LineIntersectionConfig {
  /**
   * Tolerance for floating point comparisons.
   * @default 1e-10
   */
  tolerance?: number;
  /**
   * Whether to validate input segments.
   * @default true
   */
  validateInput?: boolean;
  /**
   * Whether to handle degenerate cases (overlapping segments, etc.).
   * @default true
   */
  handleDegenerates?: boolean;
  /**
   * Whether to remove duplicate intersections.
   * @default true
   */
  removeDuplicates?: boolean;
  /**
   * Whether to sort segments before processing.
   * @default true
   */
  sortSegments?: boolean;
  /**
   * Maximum number of intersections to find (for performance control).
   * @default Infinity
   */
  maxIntersections?: number;
}

/**
 * Statistics about the line intersection algorithm execution.
 */
export interface LineIntersectionStats {
  /**
   * Number of input line segments.
   */
  segmentCount: number;
  /**
   * Number of intersection points found.
   */
  intersectionCount: number;
  /**
   * Number of events processed.
   */
  eventCount: number;
  /**
   * Number of degenerate cases handled.
   */
  degenerateCount: number;
  /**
   * Time taken for intersection finding in milliseconds.
   */
  executionTime: number;
  /**
   * Whether the algorithm execution was successful.
   */
  success: boolean;
  /**
   * Error message if execution failed.
   */
  error?: string;
  /**
   * Maximum depth of the status tree.
   */
  maxTreeDepth: number;
  /**
   * Average depth of the status tree.
   */
  averageTreeDepth: number;
}

/**
 * The result of a line intersection operation.
 */
export interface LineIntersectionResult {
  /**
   * Array of intersection points found.
   */
  intersections: IntersectionPoint[];
  /**
   * Statistics about the algorithm execution.
   */
  stats: LineIntersectionStats;
  /**
   * Whether any intersections were found.
   */
  hasIntersections: boolean;
  /**
   * Number of unique intersection points.
   */
  uniqueIntersectionCount: number;
}

/**
 * Options for querying intersections.
 */
export interface IntersectionQueryOptions {
  /**
   * Whether to return only intersections within a specific region.
   */
  boundingBox?: {
    min: Point;
    max: Point;
  };
  /**
   * Whether to return intersections involving specific segments.
   */
  segmentIds?: (string | number)[];
  /**
   * Maximum distance for intersection points to be considered.
   */
  maxDistance?: number;
  /**
   * Whether to include degenerate intersections (overlapping segments).
   * @default false
   */
  includeDegenerates?: boolean;
}

/**
 * The result of an intersection query.
 */
export interface IntersectionQueryResult {
  /**
   * Intersection points matching the query criteria.
   */
  intersections: IntersectionPoint[];
  /**
   * Number of intersections found.
   */
  count: number;
  /**
   * Time taken for the query in milliseconds.
   */
  executionTime: number;
}

/**
 * Options for segment validation.
 */
export interface SegmentValidationOptions {
  /**
   * Whether to check for zero-length segments.
   * @default true
   */
  checkZeroLength?: boolean;
  /**
   * Whether to check for duplicate segments.
   * @default true
   */
  checkDuplicates?: boolean;
  /**
   * Whether to check for segments with infinite coordinates.
   * @default true
   */
  checkInfinite?: boolean;
  /**
   * Minimum length for a segment to be considered valid.
   * @default 0
   */
  minLength?: number;
}

/**
 * Result of segment validation.
 */
export interface SegmentValidationResult {
  /**
   * Whether all segments are valid.
   */
  isValid: boolean;
  /**
   * Array of validation errors.
   */
  errors: string[];
  /**
   * Array of validation warnings.
   */
  warnings: string[];
  /**
   * Number of invalid segments.
   */
  invalidCount: number;
  /**
   * Number of duplicate segments.
   */
  duplicateCount: number;
}

/**
 * Options for intersection point filtering.
 */
export interface IntersectionFilterOptions {
  /**
   * Whether to filter out intersections at segment endpoints.
   * @default false
   */
  excludeEndpoints?: boolean;
  /**
   * Whether to filter out intersections at segment start points.
   * @default false
   */
  excludeStartPoints?: boolean;
  /**
   * Minimum distance between intersection points to be considered unique.
   * @default 1e-10
   */
  minDistance?: number;
  /**
   * Whether to merge nearby intersection points.
   * @default false
   */
  mergeNearby?: boolean;
}

/**
 * Options for performance optimization.
 */
export interface PerformanceOptions {
  /**
   * Whether to use spatial indexing for initial filtering.
   * @default false
   */
  useSpatialIndex?: boolean;
  /**
   * Grid size for spatial indexing.
   * @default 100
   */
  gridSize?: number;
  /**
   * Whether to use parallel processing for large datasets.
   * @default false
   */
  useParallel?: boolean;
  /**
   * Number of worker threads for parallel processing.
   * @default 4
   */
  workerCount?: number;
  /**
   * Whether to use memory pooling for frequent allocations.
   * @default true
   */
  useMemoryPool?: boolean;
}

/**
 * Options for result serialization.
 */
export interface IntersectionSerializationOptions {
  /**
   * Precision for floating point values.
   * @default 6
   */
  precision?: number;
  /**
   * Whether to include segment data in serialization.
   * @default false
   */
  includeSegmentData?: boolean;
  /**
   * Whether to include statistics in serialization.
   * @default false
   */
  includeStats?: boolean;
  /**
   * Whether to include validation information.
   * @default false
   */
  includeValidation?: boolean;
}

/**
 * Serialized intersection data.
 */
export interface IntersectionSerialization {
  /**
   * The intersection points.
   */
  intersections: Array<{
    point: Point;
    segmentIds: [string | number, string | number];
    parameters: [number, number];
  }>;
  /**
   * Statistics (if included).
   */
  stats?: LineIntersectionStats;
  /**
   * Validation information (if included).
   */
  validation?: SegmentValidationResult;
  /**
   * Configuration used.
   */
  config: LineIntersectionConfig;
}

/**
 * Event queue for the sweep line algorithm.
 */
export interface EventQueue {
  /**
   * Adds an event to the queue.
   * @param event - The event to add.
   */
  add(event: SweepLineEvent): void;
  /**
   * Removes and returns the next event from the queue.
   * @returns The next event, or null if queue is empty.
   */
  poll(): SweepLineEvent | null;
  /**
   * Returns the next event without removing it.
   * @returns The next event, or null if queue is empty.
   */
  peek(): SweepLineEvent | null;
  /**
   * Returns the number of events in the queue.
   * @returns The queue size.
   */
  size(): number;
  /**
   * Returns whether the queue is empty.
   * @returns True if the queue is empty.
   */
  isEmpty(): boolean;
  /**
   * Clears all events from the queue.
   */
  clear(): void;
}

/**
 * Status structure for the sweep line algorithm.
 */
export interface StatusStructure {
  /**
   * Inserts a segment into the status structure.
   * @param segment - The segment to insert.
   * @param sweepY - Current y-coordinate of the sweep line.
   */
  insert(segment: LineSegment, sweepY: number): void;
  /**
   * Removes a segment from the status structure.
   * @param segment - The segment to remove.
   * @param sweepY - Current y-coordinate of the sweep line.
   */
  remove(segment: LineSegment, sweepY: number): void;
  /**
   * Finds the segments immediately above and below a given segment.
   * @param segment - The segment to find neighbors for.
   * @param sweepY - Current y-coordinate of the sweep line.
   * @returns Object with above and below segments.
   */
  findNeighbors(
    segment: LineSegment,
    sweepY: number
  ): {
    above: LineSegment | null;
    below: LineSegment | null;
  };
  /**
   * Returns all segments in the status structure.
   * @param sweepY - Current y-coordinate of the sweep line.
   * @returns Array of segments ordered by their x-coordinate at sweepY.
   */
  getAllSegments(sweepY: number): LineSegment[];
  /**
   * Returns the number of segments in the status structure.
   * @returns The number of segments.
   */
  size(): number;
  /**
   * Returns whether the status structure is empty.
   * @returns True if the status structure is empty.
   */
  isEmpty(): boolean;
  /**
   * Clears all segments from the status structure.
   */
  clear(): void;
}
