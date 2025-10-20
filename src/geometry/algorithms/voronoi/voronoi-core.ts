/**
 * @module algorithms/geometry/algorithms/voronoi/voronoi-core
 * @description Implements Voronoi Diagrams using Delaunay triangulation dual.
 */

import { DelaunayTriangulation } from "../delaunay/delaunay-core";
import { Point, Triangle, Edge } from "../delaunay/delaunay-types";
import {
  VoronoiCell,
  VoronoiEdge,
  VoronoiVertex,
  VoronoiConfig,
  VoronoiResult,
  VoronoiStats,
  VoronoiQueryOptions,
  VoronoiQueryResult,
  LloydRelaxationOptions,
  LloydRelaxationResult,
  VoronoiSerializationOptions,
  VoronoiSerialization,
} from "./voronoi-types";
import {
  calculateCircumcenter,
  calculatePolygonArea,
  calculatePolygonCentroid,
  performLloydRelaxation,
  pointsEqual,
} from "./voronoi-utils";

/**
 * The VoronoiDiagram class provides an implementation of Voronoi diagrams
 * using the dual relationship with Delaunay triangulation. It creates
 * a diagram where each cell contains all points closer to its site than
 * to any other site.
 *
 * @example
 * ```typescript
 * const voronoi = new VoronoiDiagram();
 * const sites = [
 *   { x: 0, y: 0 },
 *   { x: 1, y: 0 },
 *   { x: 0.5, y: 1 },
 * ];
 * const result = voronoi.generate(sites);
 * console.log(result.cells.length); // Should be 3 cells
 * ```
 */
export class VoronoiDiagram {
  private config: VoronoiConfig;
  private delaunay: DelaunayTriangulation;

  /**
   * Creates an instance of VoronoiDiagram.
   * @param config - Optional configuration for the diagram generation.
   * @example
   */
  constructor(config: Partial<VoronoiConfig> = {}) {
    this.config = {
      includeUnbounded: true,
      calculateProperties: true,
      tolerance: 1e-10,
      validateInput: true,
      lloydRelaxation: {
        enabled: false,
        iterations: 10,
        tolerance: 1e-6,
      },
      ...config,
    };

    this.delaunay = new DelaunayTriangulation({
      includeSuperTriangle: false,
      validateInput: this.config.validateInput,
      tolerance: this.config.tolerance,
      sortPoints: true,
    });
  }

  /**
   * Generates a Voronoi diagram from a set of sites.
   * @param sites - Array of sites (generator points).
   * @returns A VoronoiResult object with cells, edges, vertices, and statistics.
   * @example
   */
  generate(sites: Point[]): VoronoiResult {
    const startTime = performance.now();

    try {
      // Validate input
      if (this.config.validateInput) {
        this.validateSites(sites);
      }

      // Handle edge cases
      if (sites.length < 2) {
        return this.createEmptyResult(startTime, "At least 2 sites are required for Voronoi diagram");
      }

      if (sites.length === 2) {
        return this.createTwoSiteResult(sites, startTime);
      }

      // Perform Lloyd's relaxation if enabled
      let finalSites = sites;
      if (this.config.lloydRelaxation?.enabled) {
        const relaxationResult = this.performLloydRelaxation(sites);
        finalSites = relaxationResult.relaxedSites;
      }

      // Generate Delaunay triangulation
      const delaunayResult = this.delaunay.triangulate(finalSites);
      if (!delaunayResult.stats.success) {
        return this.createEmptyResult(startTime, delaunayResult.stats.error || "Delaunay triangulation failed");
      }

      // Convert Delaunay triangulation to Voronoi diagram
      const voronoiData = this.convertDelaunayToVoronoi(delaunayResult.triangles, delaunayResult.edges, finalSites);

      const executionTime = performance.now() - startTime;

      const stats: VoronoiStats = {
        siteCount: finalSites.length,
        cellCount: voronoiData.cells.length,
        edgeCount: voronoiData.edges.length,
        vertexCount: voronoiData.vertices.length,
        boundedCellCount: voronoiData.cells.filter(cell => cell.bounded).length,
        unboundedCellCount: voronoiData.cells.filter(cell => !cell.bounded).length,
        executionTime,
        success: true,
      };

      return {
        cells: voronoiData.cells,
        edges: voronoiData.edges,
        vertices: voronoiData.vertices,
        stats,
        delaunayTriangulation: {
          triangles: delaunayResult.triangles,
          edges: delaunayResult.edges,
        },
      };
    } catch (error) {
      return this.createEmptyResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }

  /**
   * Queries the Voronoi diagram for information about a point.
   * @param point - The query point.
   * @param options - Query options.
   * @param _point
   * @param _options
   * @returns A VoronoiQueryResult object with query results.
   * @example
   */
  query(_point: Point, _options: VoronoiQueryOptions = {}): VoronoiQueryResult {
    const startTime = performance.now();

    const result: VoronoiQueryResult = {
      cellsInRadius: [],
      executionTime: 0,
    };

    // This is a simplified implementation
    // In a real implementation, you'd need to maintain the diagram structure
    // and perform efficient spatial queries

    result.executionTime = performance.now() - startTime;
    return result;
  }

  /**
   * Performs Lloyd's relaxation on the sites.
   * @param sites - Initial sites.
   * @param options - Relaxation options.
   * @returns The result of Lloyd's relaxation.
   * @example
   */
  performLloydRelaxation(sites: Point[], options?: Partial<LloydRelaxationOptions>): LloydRelaxationResult {
    const relaxationOptions: LloydRelaxationOptions = {
      maxIterations: 10,
      tolerance: 1e-6,
      clipToBounds: true,
      boundingBox: this.config.boundingBox,
      ...options,
    };

    return performLloydRelaxation(sites, relaxationOptions, this.config);
  }

  /**
   * Serializes the Voronoi diagram to a JSON-serializable format.
   * @param result - The Voronoi result to serialize.
   * @param options - Serialization options.
   * @returns Serialized Voronoi diagram data.
   * @example
   */
  serialize(result: VoronoiResult, options: Partial<VoronoiSerializationOptions> = {}): VoronoiSerialization {
    const serializationOptions: VoronoiSerializationOptions = {
      includeProperties: true,
      includeDelaunay: false,
      precision: 6,
      ...options,
    };

    const round = (value: number) => {
      return (
        Math.round(value * Math.pow(10, serializationOptions.precision)) / Math.pow(10, serializationOptions.precision)
      );
    };

    const roundPoint = (point: Point) => ({
      x: round(point.x),
      y: round(point.y),
    });

    const serializedCells = result.cells.map(cell => ({
      site: roundPoint(cell.site),
      vertices: cell.vertices.map(roundPoint),
      ...(serializationOptions.includeProperties && {
        area: round(cell.area),
        centroid: roundPoint(cell.centroid),
      }),
      neighbors: cell.neighbors,
      bounded: cell.bounded,
    }));

    const serializedEdges = result.edges.map(edge => ({
      start: roundPoint(edge.start),
      end: roundPoint(edge.end),
      sites: [roundPoint(edge.sites[0]), roundPoint(edge.sites[1])] as [Point, Point],
      infinite: edge.infinite,
      ...(edge.direction && { direction: roundPoint(edge.direction) }),
    }));

    const serializedVertices = result.vertices.map(vertex => ({
      position: roundPoint(vertex.position),
      sites: [roundPoint(vertex.sites[0]), roundPoint(vertex.sites[1]), roundPoint(vertex.sites[2])] as [
        Point,
        Point,
        Point,
      ],
      edges: vertex.edges,
    }));

    return {
      voronoi: {
        cells: serializedCells,
        edges: serializedEdges,
        vertices: serializedVertices,
      },
      stats: result.stats,
      config: this.config,
      ...(serializationOptions.includeDelaunay &&
        result.delaunayTriangulation && {
          delaunay: {
            triangles: result.delaunayTriangulation.triangles.map(triangle => ({
              a: roundPoint(triangle.a),
              b: roundPoint(triangle.b),
              c: roundPoint(triangle.c),
            })),
            edges: result.delaunayTriangulation.edges.map(edge => ({
              p1: roundPoint(edge.p1),
              p2: roundPoint(edge.p2),
            })),
          },
        }),
    };
  }

  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   * @example
   */
  updateConfig(newConfig: Partial<VoronoiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets the current configuration.
   * @returns The current configuration.
   * @example
   */
  getConfig(): VoronoiConfig {
    return { ...this.config };
  }

  /**
   * Validates input sites.
   * @param sites - Array of sites to validate.
   * @throws Error if validation fails.
   * @example
   */
  private validateSites(sites: Point[]): void {
    if (!Array.isArray(sites)) {
      throw new Error("Sites must be an array");
    }

    if (sites.length === 0) {
      throw new Error("At least one site is required");
    }

    for (let i = 0; i < sites.length; i++) {
      const site = sites[i];
      if (!site || typeof site.x !== "number" || typeof site.y !== "number") {
        throw new Error(`Invalid site at index ${i}: must have x and y properties`);
      }

      if (!isFinite(site.x) || !isFinite(site.y)) {
        throw new Error(`Invalid site at index ${i}: coordinates must be finite numbers`);
      }
    }

    // Check for duplicate sites
    for (let i = 0; i < sites.length; i++) {
      for (let j = i + 1; j < sites.length; j++) {
        if (pointsEqual(sites[i], sites[j], this.config.tolerance)) {
          throw new Error(`Duplicate sites at indices ${i} and ${j}`);
        }
      }
    }
  }

  /**
   * Creates an empty result for error cases.
   * @param startTime - Start time for execution time calculation.
   * @param error - Error message.
   * @returns Empty Voronoi result.
   * @example
   */
  private createEmptyResult(startTime: number, error: string): VoronoiResult {
    const executionTime = performance.now() - startTime;
    const stats: VoronoiStats = {
      siteCount: 0,
      cellCount: 0,
      edgeCount: 0,
      vertexCount: 0,
      boundedCellCount: 0,
      unboundedCellCount: 0,
      executionTime,
      success: false,
      error,
    };

    return {
      cells: [],
      edges: [],
      vertices: [],
      stats,
    };
  }

  /**
   * Creates a result for the two-site case.
   * @param sites - Two sites.
   * @param startTime - Start time for execution time calculation.
   * @returns Voronoi result for two sites.
   * @example
   */
  private createTwoSiteResult(sites: Point[], startTime: number): VoronoiResult {
    const [site1, site2] = sites;

    // For two sites, the Voronoi diagram is a line perpendicular to the line
    // connecting the sites, passing through the midpoint
    const midpoint = {
      x: (site1.x + site2.x) / 2,
      y: (site1.y + site2.y) / 2,
    };

    const dx = site2.x - site1.x;
    const dy = site2.y - site1.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < (this.config.tolerance ?? 1e-10)) {
      return this.createEmptyResult(startTime, "Sites are too close together");
    }

    // Direction perpendicular to the line between sites
    const perpX = -dy / length;
    const perpY = dx / length;

    // Create infinite edges extending from the midpoint
    const edge1: VoronoiEdge = {
      start: midpoint,
      end: { x: midpoint.x + perpX * 1000, y: midpoint.y + perpY * 1000 },
      sites: [site1, site2],
      infinite: true,
      direction: { x: perpX, y: perpY },
    };

    const edge2: VoronoiEdge = {
      start: midpoint,
      end: { x: midpoint.x - perpX * 1000, y: midpoint.y - perpY * 1000 },
      sites: [site2, site1],
      infinite: true,
      direction: { x: -perpX, y: -perpY },
    };

    // Create unbounded cells
    const cell1: VoronoiCell = {
      site: site1,
      vertices: [midpoint],
      edges: [edge1, edge2],
      area: Infinity,
      centroid: site1,
      neighbors: [1],
      bounded: false,
    };

    const cell2: VoronoiCell = {
      site: site2,
      vertices: [midpoint],
      edges: [edge2, edge1],
      area: Infinity,
      centroid: site2,
      neighbors: [0],
      bounded: false,
    };

    const executionTime = performance.now() - startTime;
    const stats: VoronoiStats = {
      siteCount: 2,
      cellCount: 2,
      edgeCount: 2,
      vertexCount: 1,
      boundedCellCount: 0,
      unboundedCellCount: 2,
      executionTime,
      success: true,
    };

    return {
      cells: [cell1, cell2],
      edges: [edge1, edge2],
      vertices: [
        {
          position: midpoint,
          sites: [site1, site2, site1], // Simplified for two sites
          edges: [0, 1],
        },
      ],
      stats,
    };
  }

  /**
   * Converts Delaunay triangulation to Voronoi diagram.
   * @param triangles - Delaunay triangles.
   * @param edges - Delaunay edges.
   * @param sites - Original sites.
   * @returns Voronoi diagram data.
   * @example
   */
  private convertDelaunayToVoronoi(
    triangles: Triangle[],
    edges: Edge[],
    sites: Point[]
  ): { cells: VoronoiCell[]; edges: VoronoiEdge[]; vertices: VoronoiVertex[] } {
    const voronoiVertices: VoronoiVertex[] = [];
    const voronoiEdges: VoronoiEdge[] = [];
    const voronoiCells: VoronoiCell[] = [];

    // Create Voronoi vertices from triangle circumcenters
    const triangleToVertex = new Map<Triangle, number>();

    for (let i = 0; i < triangles.length; i++) {
      const triangle = triangles[i];
      const circumcenter = calculateCircumcenter(triangle);

      const vertex: VoronoiVertex = {
        position: circumcenter,
        sites: [triangle.a, triangle.b, triangle.c],
        edges: [],
      };

      voronoiVertices.push(vertex);
      triangleToVertex.set(triangle, i);
    }

    // Create Voronoi edges from Delaunay edges
    const edgeMap = new Map<string, VoronoiEdge>();

    for (const delaunayEdge of edges) {
      // Find triangles sharing this edge
      const adjacentTriangles = triangles.filter(triangle => this.triangleContainsEdge(triangle, delaunayEdge));

      if (adjacentTriangles.length === 2) {
        // Internal edge - create finite Voronoi edge
        const triangle1 = adjacentTriangles[0];
        const triangle2 = adjacentTriangles[1];

        const vertex1Index = triangleToVertex.get(triangle1)!;
        const vertex2Index = triangleToVertex.get(triangle2)!;

        const vertex1 = voronoiVertices[vertex1Index];
        const vertex2 = voronoiVertices[vertex2Index];

        const edge: VoronoiEdge = {
          start: vertex1.position,
          end: vertex2.position,
          sites: [delaunayEdge.p1, delaunayEdge.p2],
          infinite: false,
        };

        voronoiEdges.push(edge);
        edgeMap.set(this.edgeKey(delaunayEdge), edge);

        // Update vertex edge references
        vertex1.edges.push(voronoiEdges.length - 1);
        vertex2.edges.push(voronoiEdges.length - 1);
      } else if (adjacentTriangles.length === 1) {
        // Boundary edge - create infinite Voronoi edge
        const triangle = adjacentTriangles[0];
        const vertexIndex = triangleToVertex.get(triangle)!;
        const vertex = voronoiVertices[vertexIndex];

        // Calculate direction for infinite edge
        const direction = this.calculateInfiniteEdgeDirection(delaunayEdge, triangle);

        const edge: VoronoiEdge = {
          start: vertex.position,
          end: {
            x: vertex.position.x + direction.x * 1000,
            y: vertex.position.y + direction.y * 1000,
          },
          sites: [delaunayEdge.p1, delaunayEdge.p2],
          infinite: true,
          direction,
        };

        voronoiEdges.push(edge);
        edgeMap.set(this.edgeKey(delaunayEdge), edge);

        vertex.edges.push(voronoiEdges.length - 1);
      }
    }

    // Create Voronoi cells for each site
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i];
      const cell = this.createVoronoiCell(site, triangles, voronoiVertices, voronoiEdges, i);
      voronoiCells.push(cell);
    }

    return {
      cells: voronoiCells,
      edges: voronoiEdges,
      vertices: voronoiVertices,
    };
  }

  /**
   * Checks if a triangle contains a specific edge.
   * @param triangle - The triangle to check.
   * @param edge - The edge to look for.
   * @returns True if the triangle contains the edge.
   * @example
   */
  private triangleContainsEdge(triangle: Triangle, edge: Edge): boolean {
    const vertices = [triangle.a, triangle.b, triangle.c];
    const edgeVertices = [edge.p1, edge.p2];

    return edgeVertices.every(edgeVertex =>
      vertices.some(vertex => pointsEqual(edgeVertex, vertex, this.config.tolerance))
    );
  }

  /**
   * Creates a key for an edge to use in maps.
   * @param edge - The edge.
   * @returns A string key for the edge.
   * @example
   */
  private edgeKey(edge: Edge): string {
    // Sort points to ensure consistent key regardless of order
    const p1 = edge.p1.x < edge.p2.x || (edge.p1.x === edge.p2.x && edge.p1.y < edge.p2.y) ? edge.p1 : edge.p2;
    const p2 = p1 === edge.p1 ? edge.p2 : edge.p1;

    return `${p1.x},${p1.y}-${p2.x},${p2.y}`;
  }

  /**
   * Calculates the direction for an infinite Voronoi edge.
   * @param delaunayEdge - The Delaunay edge.
   * @param triangle - The triangle containing the edge.
   * @returns Direction vector for the infinite edge.
   * @example
   */
  private calculateInfiniteEdgeDirection(delaunayEdge: Edge, triangle: Triangle): Point {
    // Find the third vertex of the triangle
    const vertices = [triangle.a, triangle.b, triangle.c];
    const edgeVertices = [delaunayEdge.p1, delaunayEdge.p2];
    const thirdVertex = vertices.find(
      vertex => !edgeVertices.some(edgeVertex => pointsEqual(vertex, edgeVertex, this.config.tolerance))
    )!;

    // Calculate perpendicular direction
    const dx = delaunayEdge.p2.x - delaunayEdge.p1.x;
    const dy = delaunayEdge.p2.y - delaunayEdge.p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < (this.config.tolerance ?? 1e-10)) {
      return { x: 1, y: 0 }; // Default direction
    }

    // Perpendicular direction
    const perpX = -dy / length;
    const perpY = dx / length;

    // Determine which side the third vertex is on
    const cross =
      (delaunayEdge.p2.x - delaunayEdge.p1.x) * (thirdVertex.y - delaunayEdge.p1.y) -
      (delaunayEdge.p2.y - delaunayEdge.p1.y) * (thirdVertex.x - delaunayEdge.p1.x);

    // Return direction pointing away from the triangle
    return cross > 0 ? { x: perpX, y: perpY } : { x: -perpX, y: -perpY };
  }

  /**
   * Creates a Voronoi cell for a site.
   * @param site - The site.
   * @param triangles - All Delaunay triangles.
   * @param voronoiVertices - Voronoi vertices.
   * @param _voronoiVertices
   * @param voronoiEdges - Voronoi edges.
   * @param siteIndex - Index of the site.
   * @param _siteIndex
   * @returns The Voronoi cell.
   * @example
   */
  private createVoronoiCell(
    site: Point,
    triangles: Triangle[],
    _voronoiVertices: VoronoiVertex[],
    voronoiEdges: VoronoiEdge[],
    _siteIndex: number
  ): VoronoiCell {
    // Find triangles that contain this site
    const containingTriangles = triangles.filter(triangle => this.triangleContainsPoint(triangle, site));

    // Get vertices of these triangles
    const cellVertices = containingTriangles.map(triangle => {
      const circumcenter = calculateCircumcenter(triangle);
      return circumcenter;
    });

    // Get edges of these triangles
    const cellEdges: VoronoiEdge[] = [];
    const neighbors: number[] = [];

    for (const triangle of containingTriangles) {
      // Find edges of this triangle
      const triangleEdges = this.getTriangleEdges(triangle);

      for (const edge of triangleEdges) {
        // Find the Voronoi edge corresponding to this Delaunay edge
        const voronoiEdge = voronoiEdges.find(
          ve =>
            (pointsEqual(ve.sites[0], edge.p1, this.config.tolerance) &&
              pointsEqual(ve.sites[1], edge.p2, this.config.tolerance)) ||
            (pointsEqual(ve.sites[0], edge.p2, this.config.tolerance) &&
              pointsEqual(ve.sites[1], edge.p1, this.config.tolerance))
        );

        if (voronoiEdge && !cellEdges.includes(voronoiEdge)) {
          cellEdges.push(voronoiEdge);

          // Find neighbor site
          const neighborSite = pointsEqual(voronoiEdge.sites[0], site, this.config.tolerance)
            ? voronoiEdge.sites[1]
            : voronoiEdge.sites[0];

          // Find neighbor index
          const neighborIndex = triangles.findIndex(t => this.triangleContainsPoint(t, neighborSite));

          if (neighborIndex !== -1 && !neighbors.includes(neighborIndex)) {
            neighbors.push(neighborIndex);
          }
        }
      }
    }

    // Calculate area and centroid if requested
    let area = 0;
    let centroid = site;

    if (this.config.calculateProperties && cellVertices.length > 2) {
      area = calculatePolygonArea(cellVertices);
      centroid = calculatePolygonCentroid(cellVertices);
    }

    // Determine if cell is bounded
    const bounded = cellEdges.every(edge => !edge.infinite);

    return {
      site,
      vertices: cellVertices,
      edges: cellEdges,
      area,
      centroid,
      neighbors,
      bounded,
    };
  }

  /**
   * Checks if a triangle contains a point.
   * @param triangle - The triangle.
   * @param point - The point to check.
   * @returns True if the triangle contains the point.
   * @example
   */
  private triangleContainsPoint(triangle: Triangle, point: Point): boolean {
    const { a, b, c } = triangle;

    // Check if point is one of the triangle vertices
    if (
      pointsEqual(point, a, this.config.tolerance) ||
      pointsEqual(point, b, this.config.tolerance) ||
      pointsEqual(point, c, this.config.tolerance)
    ) {
      return true;
    }

    // Use barycentric coordinates to check if point is inside triangle
    const denom = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);

    if (Math.abs(denom) < (this.config.tolerance ?? 1e-10)) {
      return false; // Degenerate triangle
    }

    const alpha = ((b.y - c.y) * (point.x - c.x) + (c.x - b.x) * (point.y - c.y)) / denom;
    const beta = ((c.y - a.y) * (point.x - c.x) + (a.x - c.x) * (point.y - c.y)) / denom;
    const gamma = 1 - alpha - beta;

    return alpha >= 0 && beta >= 0 && gamma >= 0;
  }

  /**
   * Gets the three edges of a triangle.
   * @param triangle - The triangle.
   * @returns Array of edges.
   * @example
   */
  private getTriangleEdges(triangle: Triangle): Edge[] {
    return [
      { p1: triangle.a, p2: triangle.b },
      { p1: triangle.b, p2: triangle.c },
      { p1: triangle.c, p2: triangle.a },
    ];
  }
}
