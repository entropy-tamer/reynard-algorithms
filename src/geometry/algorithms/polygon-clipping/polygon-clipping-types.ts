/**
 * @module algorithms/geometry/algorithms/polygon-clipping/types
 * @description Defines the types and interfaces for Polygon Clipping algorithms.
 */

/**
 * Represents a 2D point with x and y coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents a 2D vector with x and y components.
 */
export interface Vector {
  x: number;
  y: number;
}

/**
 * Represents a line segment between two points.
 */
export interface LineSegment {
  start: Point;
  end: Point;
}

/**
 * Represents a polygon as an array of vertices.
 */
export interface Polygon {
  vertices: Point[];
  holes?: Polygon[]; // Optional holes in the polygon
}

/**
 * Represents a clipping plane (line) for Sutherland-Hodgman algorithm.
 */
export interface ClippingPlane {
  point: Point; // A point on the plane
  normal: Vector; // Normal vector pointing to the inside
}

/**
 * Enumeration of polygon clipping operations.
 */
export enum ClipOperation {
  INTERSECTION = "intersection",
  UNION = "union",
  DIFFERENCE = "difference",
  XOR = "xor",
}

/**
 * Configuration options for polygon clipping.
 */
export interface PolygonClippingConfig {
  /**
   * Tolerance for floating point comparisons.
   * @default 1e-10
   */
  tolerance?: number;
  /**
   * Whether to validate input polygons.
   * @default true
   */
  validateInput?: boolean;
  /**
   * Whether to handle self-intersecting polygons.
   * @default false
   */
  handleSelfIntersections?: boolean;
  /**
   * Whether to preserve polygon orientation.
   * @default true
   */
  preserveOrientation?: boolean;
  /**
   * Whether to remove duplicate vertices.
   * @default true
   */
  removeDuplicates?: boolean;
  /**
   * Whether to simplify the result polygon.
   * @default false
   */
  simplifyResult?: boolean;
}

/**
 * Statistics about the clipping operation.
 */
export interface ClippingStats {
  /**
   * Number of vertices in the subject polygon.
   */
  subjectVertices: number;
  /**
   * Number of vertices in the clipping polygon.
   */
  clippingVertices: number;
  /**
   * Number of vertices in the result polygon.
   */
  resultVertices: number;
  /**
   * Number of intersection points found.
   */
  intersectionPoints: number;
  /**
   * Time taken for clipping in milliseconds.
   */
  executionTime: number;
  /**
   * Whether the clipping operation was successful.
   */
  success: boolean;
  /**
   * Error message if clipping failed.
   */
  error?: string;
  /**
   * Algorithm used for clipping.
   */
  algorithm: "sutherland-hodgman" | "weiler-atherton";
}

/**
 * The result of a polygon clipping operation.
 */
export interface ClipResult {
  /**
   * The resulting polygon(s) after clipping.
   */
  polygons: Polygon[];
  /**
   * Statistics about the clipping operation.
   */
  stats: ClippingStats;
  /**
   * Whether the result is empty (no intersection).
   */
  isEmpty: boolean;
  /**
   * Whether the result contains multiple polygons.
   */
  isMultiple: boolean;
}

/**
 * Options for Sutherland-Hodgman clipping.
 */
export interface SutherlandHodgmanOptions extends PolygonClippingConfig {
  /**
   * Array of clipping planes (for convex clipping).
   */
  clippingPlanes?: ClippingPlane[];
  /**
   * Whether to use the convex polygon as a single clipping plane.
   * @default true
   */
  useConvexClipping?: boolean;
}

/**
 * Options for Weiler-Atherton clipping.
 */
export interface WeilerAthertonOptions extends PolygonClippingConfig {
  /**
   * The clipping operation to perform.
   * @default ClipOperation.INTERSECTION
   */
  operation?: ClipOperation;
  /**
   * Whether to handle holes in polygons.
   * @default true
   */
  handleHoles?: boolean;
  /**
   * Whether to merge adjacent edges.
   * @default true
   */
  mergeEdges?: boolean;
}

/**
 * Represents a vertex in the Weiler-Atherton algorithm.
 */
export interface WAVertex {
  /**
   * The point coordinates.
   */
  point: Point;
  /**
   * Whether this is an intersection point.
   */
  isIntersection: boolean;
  /**
   * Whether this vertex is inside the clipping polygon.
   */
  isInside: boolean;
  /**
   * Reference to the corresponding vertex in the other polygon.
   */
  corresponding?: WAVertex;
  /**
   * Whether this vertex has been processed.
   */
  processed: boolean;
  /**
   * Next vertex in the polygon.
   */
  next?: WAVertex;
  /**
   * Previous vertex in the polygon.
   */
  previous?: WAVertex;
}

/**
 * Represents an edge in the Weiler-Atherton algorithm.
 */
export interface WAEdge {
  /**
   * Start vertex of the edge.
   */
  start: WAVertex;
  /**
   * End vertex of the edge.
   */
  end: WAVertex;
  /**
   * Whether this edge is part of the subject polygon.
   */
  isSubject: boolean;
  /**
   * Whether this edge is part of the clipping polygon.
   */
  isClipping: boolean;
  /**
   * Whether this edge is inside the other polygon.
   */
  isInside: boolean;
  /**
   * Intersection point with the other polygon (if any).
   */
  intersection?: Point;
}

/**
 * Represents a polygon in the Weiler-Atherton algorithm.
 */
export interface WAPolygon {
  /**
   * Array of vertices in the polygon.
   */
  vertices: WAVertex[];
  /**
   * Whether this polygon is the subject.
   */
  isSubject: boolean;
  /**
   * Whether this polygon is the clipping polygon.
   */
  isClipping: boolean;
}

/**
 * Options for polygon validation.
 */
export interface PolygonValidationOptions {
  /**
   * Whether to check for self-intersections.
   * @default true
   */
  checkSelfIntersections?: boolean;
  /**
   * Whether to check for duplicate vertices.
   * @default true
   */
  checkDuplicates?: boolean;
  /**
   * Whether to check for minimum vertex count.
   * @default true
   */
  checkMinimumVertices?: boolean;
  /**
   * Minimum number of vertices required.
   * @default 3
   */
  minimumVertices?: number;
  /**
   * Whether to check for collinear vertices.
   * @default true
   */
  checkCollinear?: boolean;
}

/**
 * Result of polygon validation.
 */
export interface PolygonValidationResult {
  /**
   * Whether the polygon is valid.
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
   * Whether the polygon has self-intersections.
   */
  hasSelfIntersections: boolean;
  /**
   * Whether the polygon has duplicate vertices.
   */
  hasDuplicates: boolean;
  /**
   * Whether the polygon has collinear vertices.
   */
  hasCollinear: boolean;
}

/**
 * Options for polygon simplification.
 */
export interface PolygonSimplificationOptions {
  /**
   * Tolerance for removing collinear vertices.
   * @default 1e-6
   */
  collinearTolerance?: number;
  /**
   * Tolerance for removing duplicate vertices.
   * @default 1e-10
   */
  duplicateTolerance?: number;
  /**
   * Whether to remove collinear vertices.
   * @default true
   */
  removeCollinear?: boolean;
  /**
   * Whether to remove duplicate vertices.
   * @default true
   */
  removeDuplicates?: boolean;
  /**
   * Whether to ensure proper polygon orientation.
   * @default true
   */
  ensureOrientation?: boolean;
}

/**
 * Options for polygon serialization.
 */
export interface PolygonSerializationOptions {
  /**
   * Precision for floating point values.
   * @default 6
   */
  precision?: number;
  /**
   * Whether to include validation information.
   * @default false
   */
  includeValidation?: boolean;
  /**
   * Whether to include statistics.
   * @default false
   */
  includeStats?: boolean;
}

/**
 * Serialized polygon data.
 */
export interface PolygonSerialization {
  /**
   * The polygon vertices.
   */
  vertices: Point[];
  /**
   * Optional holes in the polygon.
   */
  holes?: Point[][];
  /**
   * Validation information (if included).
   */
  validation?: PolygonValidationResult;
  /**
   * Statistics (if included).
   */
  stats?: ClippingStats;
}



