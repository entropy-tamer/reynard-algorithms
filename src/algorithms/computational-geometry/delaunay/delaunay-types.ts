/**
 * @module algorithms/geometry/algorithms/delaunay/types
 * @description Defines the types and interfaces for Delaunay Triangulation.
 */

/**
 * Represents a 2D point with x and y coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents a triangle with three vertices.
 */
export interface Triangle {
  a: Point;
  b: Point;
  c: Point;
}

/**
 * Represents an edge between two points.
 */
export interface Edge {
  p1: Point;
  p2: Point;
}

/**
 * Represents a circumcircle of a triangle.
 */
export interface Circumcircle {
  center: Point;
  radius: number;
}

/**
 * Configuration options for Delaunay Triangulation.
 */
export interface DelaunayConfig {
  /**
   * Whether to include the super triangle in the final result.
   * @default false
   */
  includeSuperTriangle?: boolean;
  /**
   * Whether to validate the input points (check for duplicates, etc.).
   * @default true
   */
  validateInput?: boolean;
  /**
   * Tolerance for floating point comparisons.
   * @default 1e-10
   */
  tolerance?: number;
  /**
   * Whether to sort points before triangulation for better performance.
   * @default true
   */
  sortPoints?: boolean;
}

/**
 * Statistics about the triangulation process.
 */
export interface DelaunayStats {
  /**
   * Number of input points.
   */
  pointCount: number;
  /**
   * Number of triangles generated.
   */
  triangleCount: number;
  /**
   * Number of edges generated.
   */
  edgeCount: number;
  /**
   * Time taken for triangulation in milliseconds.
   */
  executionTime: number;
  /**
   * Whether the triangulation was successful.
   */
  success: boolean;
  /**
   * Error message if triangulation failed.
   */
  error?: string;
}

/**
 * The result of a Delaunay triangulation operation.
 */
export interface DelaunayResult {
  /**
   * Array of triangles in the triangulation.
   */
  triangles: Triangle[];
  /**
   * Array of edges in the triangulation.
   */
  edges: Edge[];
  /**
   * Statistics about the triangulation.
   */
  stats: DelaunayStats;
}

/**
 * Options for querying the triangulation.
 */
export interface TriangulationQueryOptions {
  /**
   * Whether to return triangles that contain the query point.
   * @default true
   */
  includeContainingTriangles?: boolean;
  /**
   * Whether to return triangles that are adjacent to the query point.
   * @default false
   */
  includeAdjacentTriangles?: boolean;
  /**
   * Maximum distance for adjacency queries.
   * @default 0
   */
  maxDistance?: number;
}

/**
 * The result of a triangulation query.
 */
export interface TriangulationQueryResult {
  /**
   * Triangles that match the query criteria.
   */
  triangles: Triangle[];
  /**
   * Number of triangles found.
   */
  triangleCount: number;
  /**
   * Time taken for the query in milliseconds.
   */
  executionTime: number;
}

/**
 * Options for mesh generation from triangulation.
 */
export interface MeshGenerationOptions {
  /**
   * Whether to generate vertex indices.
   * @default true
   */
  generateIndices?: boolean;
  /**
   * Whether to generate edge information.
   * @default true
   */
  generateEdges?: boolean;
  /**
   * Whether to generate face information.
   * @default true
   */
  generateFaces?: boolean;
  /**
   * Whether to remove duplicate vertices.
   * @default true
   */
  removeDuplicates?: boolean;
}

/**
 * A mesh generated from the triangulation.
 */
export interface Mesh {
  /**
   * Array of unique vertices.
   */
  vertices: Point[];
  /**
   * Array of vertex indices for each triangle.
   */
  indices: number[][];
  /**
   * Array of edges with vertex indices.
   */
  edges: number[][];
  /**
   * Array of faces (triangles) with vertex indices.
   */
  faces: number[][];
}

/**
 * Options for constrained Delaunay triangulation.
 */
export interface ConstrainedDelaunayOptions extends DelaunayConfig {
  /**
   * Array of constrained edges that must be present in the triangulation.
   */
  constrainedEdges?: Edge[];
  /**
   * Whether to enforce the constrained edges strictly.
   * @default true
   */
  enforceConstraints?: boolean;
}

/**
 * The result of a constrained Delaunay triangulation.
 */
export interface ConstrainedDelaunayResult extends DelaunayResult {
  /**
   * Array of constrained edges that were successfully included.
   */
  constrainedEdges: Edge[];
  /**
   * Array of edges that could not be constrained.
   */
  failedConstraints: Edge[];
}
