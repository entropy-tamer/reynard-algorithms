/**
 * @module algorithms/geometry/algorithms/bresenham/types
 * @description Defines the types and interfaces for Bresenham's Line Algorithm.
 */

/**
 * Represents a 2D point with integer coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents a 2D point with integer coordinates (alias for Point).
 */
export interface Pixel {
  x: number;
  y: number;
}

/**
 * Configuration options for Bresenham's Line Algorithm.
 */
export interface BresenhamConfig {
  /**
   * Whether to include the start point in the result.
   * @default true
   */
  includeStart?: boolean;
  /**
   * Whether to include the end point in the result.
   * @default true
   */
  includeEnd?: boolean;
  /**
   * Whether to use the original Bresenham algorithm (true) or a modified version (false).
   * @default true
   */
  useOriginalBresenham?: boolean;
  /**
   * Whether to handle negative coordinates by offsetting to positive space.
   * @default false
   */
  handleNegativeCoordinates?: boolean;
}

/**
 * The result of a Bresenham line drawing operation.
 */
export interface BresenhamResult {
  /**
   * Array of points representing the line.
   */
  points: Point[];
  /**
   * Number of points generated.
   */
  pointCount: number;
  /**
   * Time taken to generate the line in milliseconds.
   */
  executionTime: number;
  /**
   * Whether the operation was successful.
   */
  success: boolean;
  /**
   * Error message if the operation failed.
   */
  error?: string;
}

/**
 * Options for line drawing with additional features.
 */
export interface LineDrawingOptions extends BresenhamConfig {
  /**
   * Custom function to process each point as it's generated.
   * Return false to stop line generation early.
   */
  onPoint?: (point: Point) => boolean;
  /**
   * Maximum number of points to generate (0 = no limit).
   * @default 0
   */
  maxPoints?: number;
  /**
   * Whether to generate points in reverse order (from end to start).
   * @default false
   */
  reverse?: boolean;
}

/**
 * The result of a line drawing operation with additional features.
 */
export interface LineDrawingResult extends BresenhamResult {
  /**
   * Whether the line generation was stopped early.
   */
  stoppedEarly: boolean;
  /**
   * Number of points processed by the onPoint callback.
   */
  pointsProcessed: number;
}

/**
 * Options for drawing multiple lines.
 */
export interface MultiLineOptions extends BresenhamConfig {
  /**
   * Whether to connect the end of one line to the start of the next.
   * @default false
   */
  connectLines?: boolean;
  /**
   * Custom function to process each point as it's generated.
   */
  onPoint?: (point: Point, lineIndex: number) => boolean;
}

/**
 * The result of drawing multiple lines.
 */
export interface MultiLineResult {
  /**
   * Array of line results.
   */
  lines: BresenhamResult[];
  /**
   * Total number of points generated across all lines.
   */
  totalPoints: number;
  /**
   * Time taken to generate all lines in milliseconds.
   */
  executionTime: number;
  /**
   * Whether all operations were successful.
   */
  success: boolean;
}
