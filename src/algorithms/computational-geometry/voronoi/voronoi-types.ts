/**
 * @module algorithms/geometry/algorithms/voronoi/types
 * @description Defines the types and interfaces for Voronoi Diagrams.
 */

import { Point, Triangle, Edge } from "../delaunay/delaunay-types";

/**
 * Represents a Voronoi cell (Voronoi region) for a site.
 */
export interface VoronoiCell {
  /**
   * The site (generator point) for this cell.
   */
  site: Point;
  /**
   * Array of vertices that form the boundary of this cell.
   */
  vertices: Point[];
  /**
   * Array of edges that form the boundary of this cell.
   */
  edges: VoronoiEdge[];
  /**
   * The area of this cell.
   */
  area: number;
  /**
   * The centroid of this cell.
   */
  centroid: Point;
  /**
   * Indices of neighboring cells.
   */
  neighbors: number[];
  /**
   * Whether this cell is bounded (finite) or unbounded (infinite).
   */
  bounded: boolean;
}

/**
 * Represents a Voronoi edge.
 */
export interface VoronoiEdge {
  /**
   * Start vertex of the edge.
   */
  start: Point;
  /**
   * End vertex of the edge.
   */
  end: Point;
  /**
   * The two sites that this edge separates.
   */
  sites: [Point, Point];
  /**
   * Whether this edge is infinite (unbounded).
   */
  infinite: boolean;
  /**
   * Direction vector for infinite edges.
   */
  direction?: Point;
}

/**
 * Represents a Voronoi vertex (intersection of three or more edges).
 */
export interface VoronoiVertex {
  /**
   * The position of the vertex.
   */
  position: Point;
  /**
   * The three sites that define this vertex (circumcenter of their triangle).
   */
  sites: [Point, Point, Point];
  /**
   * Indices of edges that meet at this vertex.
   */
  edges: number[];
}

/**
 * Configuration options for Voronoi diagram generation.
 */
export interface VoronoiConfig {
  /**
   * Whether to include unbounded cells in the result.
   * @default true
   */
  includeUnbounded?: boolean;
  /**
   * Whether to calculate cell areas and centroids.
   * @default true
   */
  calculateProperties?: boolean;
  /**
   * Tolerance for floating point comparisons.
   * @default 1e-10
   */
  tolerance?: number;
  /**
   * Whether to validate input points.
   * @default true
   */
  validateInput?: boolean;
  /**
   * Bounding box for clipping unbounded cells.
   */
  boundingBox?: {
    min: Point;
    max: Point;
  };
  /**
   * Whether to perform Lloyd's relaxation iterations.
   * @default false
   */
  lloydRelaxation?: {
    enabled: boolean;
    iterations: number;
    tolerance: number;
  };
}

/**
 * Statistics about the Voronoi diagram generation.
 */
export interface VoronoiStats {
  /**
   * Number of input sites.
   */
  siteCount: number;
  /**
   * Number of Voronoi cells generated.
   */
  cellCount: number;
  /**
   * Number of Voronoi edges generated.
   */
  edgeCount: number;
  /**
   * Number of Voronoi vertices generated.
   */
  vertexCount: number;
  /**
   * Number of bounded cells.
   */
  boundedCellCount: number;
  /**
   * Number of unbounded cells.
   */
  unboundedCellCount: number;
  /**
   * Time taken for diagram generation in milliseconds.
   */
  executionTime: number;
  /**
   * Whether the diagram generation was successful.
   */
  success: boolean;
  /**
   * Error message if generation failed.
   */
  error?: string;
}

/**
 * The result of a Voronoi diagram generation.
 */
export interface VoronoiResult {
  /**
   * Array of Voronoi cells.
   */
  cells: VoronoiCell[];
  /**
   * Array of Voronoi edges.
   */
  edges: VoronoiEdge[];
  /**
   * Array of Voronoi vertices.
   */
  vertices: VoronoiVertex[];
  /**
   * Statistics about the diagram generation.
   */
  stats: VoronoiStats;
  /**
   * The Delaunay triangulation used to generate this diagram.
   */
  delaunayTriangulation?: {
    triangles: Triangle[];
    edges: Edge[];
  };
}

/**
 * Options for querying the Voronoi diagram.
 */
export interface VoronoiQueryOptions {
  /**
   * Whether to return the cell containing the query point.
   * @default true
   */
  findContainingCell?: boolean;
  /**
   * Whether to return all cells within a given radius.
   * @default false
   */
  findCellsInRadius?: boolean;
  /**
   * Radius for cell search.
   * @default 0
   */
  radius?: number;
  /**
   * Whether to return the nearest site.
   * @default false
   */
  findNearestSite?: boolean;
}

/**
 * The result of a Voronoi diagram query.
 */
export interface VoronoiQueryResult {
  /**
   * The cell containing the query point (if found).
   */
  containingCell?: VoronoiCell;
  /**
   * Cells within the specified radius.
   */
  cellsInRadius: VoronoiCell[];
  /**
   * The nearest site to the query point.
   */
  nearestSite?: Point;
  /**
   * Distance to the nearest site.
   */
  nearestDistance?: number;
  /**
   * Time taken for the query in milliseconds.
   */
  executionTime: number;
}

/**
 * Options for Lloyd's relaxation algorithm.
 */
export interface LloydRelaxationOptions {
  /**
   * Maximum number of iterations.
   * @default 10
   */
  maxIterations: number;
  /**
   * Convergence tolerance.
   * @default 1e-6
   */
  tolerance: number;
  /**
   * Whether to clip sites to the bounding box.
   * @default true
   */
  clipToBounds: boolean;
  /**
   * Bounding box for clipping.
   */
  boundingBox?: {
    min: Point;
    max: Point;
  };
}

/**
 * The result of Lloyd's relaxation.
 */
export interface LloydRelaxationResult {
  /**
   * The relaxed sites.
   */
  relaxedSites: Point[];
  /**
   * Number of iterations performed.
   */
  iterations: number;
  /**
   * Final convergence measure.
   */
  convergence: number;
  /**
   * Whether convergence was achieved.
   */
  converged: boolean;
  /**
   * Time taken for relaxation in milliseconds.
   */
  executionTime: number;
}

/**
 * Options for Fortune's algorithm (alternative to Delaunay dual).
 */
export interface FortuneAlgorithmOptions {
  /**
   * Whether to use Fortune's algorithm instead of Delaunay dual.
   * @default false
   */
  enabled: boolean;
  /**
   * Sweep line precision.
   * @default 1e-10
   */
  precision: number;
  /**
   * Whether to handle degenerate cases.
   * @default true
   */
  handleDegenerates: boolean;
}

/**
 * Options for Voronoi diagram serialization.
 */
export interface VoronoiSerializationOptions {
  /**
   * Whether to include cell properties in serialization.
   * @default true
   */
  includeProperties: boolean;
  /**
   * Whether to include the Delaunay triangulation.
   * @default false
   */
  includeDelaunay: boolean;
  /**
   * Precision for floating point values.
   * @default 6
   */
  precision: number;
}

/**
 * Serialized Voronoi diagram data.
 */
export interface VoronoiSerialization {
  /**
   * The Voronoi diagram data.
   */
  voronoi: {
    cells: Array<{
      site: Point;
      vertices: Point[];
      area?: number;
      centroid?: Point;
      neighbors: number[];
      bounded: boolean;
    }>;
    edges: Array<{
      start: Point;
      end: Point;
      sites: [Point, Point];
      infinite: boolean;
      direction?: Point;
    }>;
    vertices: Array<{
      position: Point;
      sites: [Point, Point, Point];
      edges: number[];
    }>;
  };
  /**
   * Statistics.
   */
  stats: VoronoiStats;
  /**
   * Configuration used.
   */
  config: VoronoiConfig;
  /**
   * Delaunay triangulation (if included).
   */
  delaunay?: {
    triangles: Triangle[];
    edges: Edge[];
  };
}
