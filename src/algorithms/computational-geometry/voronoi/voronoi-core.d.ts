/**
 * @module algorithms/geometry/algorithms/voronoi/voronoi-core
 * @description Implements Voronoi Diagrams using Delaunay triangulation dual.
 */
import { Point } from "../delaunay/delaunay-types";
import { VoronoiConfig, VoronoiResult, VoronoiQueryOptions, VoronoiQueryResult, LloydRelaxationOptions, LloydRelaxationResult, VoronoiSerializationOptions, VoronoiSerialization } from "./voronoi-types";
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
export declare class VoronoiDiagram {
    private config;
    private delaunay;
    /**
     * Creates an instance of VoronoiDiagram.
     * @param config - Optional configuration for the diagram generation.
     * @example
     */
    constructor(config?: Partial<VoronoiConfig>);
    /**
     * Generates a Voronoi diagram from a set of sites.
     * @param sites - Array of sites (generator points).
     * @returns A VoronoiResult object with cells, edges, vertices, and statistics.
     * @example
     */
    generate(sites: Point[]): VoronoiResult;
    /**
     * Queries the Voronoi diagram for information about a point.
     * @param point - The query point.
     * @param options - Query options.
     * @param _point
     * @param _options
     * @returns A VoronoiQueryResult object with query results.
     * @example
     */
    query(_point: Point, _options?: VoronoiQueryOptions): VoronoiQueryResult;
    /**
     * Performs Lloyd's relaxation on the sites.
     * @param sites - Initial sites.
     * @param options - Relaxation options.
     * @returns The result of Lloyd's relaxation.
     * @example
     */
    performLloydRelaxation(sites: Point[], options?: Partial<LloydRelaxationOptions>): LloydRelaxationResult;
    /**
     * Serializes the Voronoi diagram to a JSON-serializable format.
     * @param result - The Voronoi result to serialize.
     * @param options - Serialization options.
     * @returns Serialized Voronoi diagram data.
     * @example
     */
    serialize(result: VoronoiResult, options?: Partial<VoronoiSerializationOptions>): VoronoiSerialization;
    /**
     * Updates the configuration.
     * @param newConfig - New configuration options.
     * @example
     */
    updateConfig(newConfig: Partial<VoronoiConfig>): void;
    /**
     * Gets the current configuration.
     * @returns The current configuration.
     * @example
     */
    getConfig(): VoronoiConfig;
    /**
     * Validates input sites.
     * @param sites - Array of sites to validate.
     * @throws Error if validation fails.
     * @example
     */
    private validateSites;
    /**
     * Creates an empty result for error cases.
     * @param startTime - Start time for execution time calculation.
     * @param error - Error message.
     * @returns Empty Voronoi result.
     * @example
     */
    private createEmptyResult;
    /**
     * Creates a result for the two-site case.
     * @param sites - Two sites.
     * @param startTime - Start time for execution time calculation.
     * @returns Voronoi result for two sites.
     * @example
     */
    private createTwoSiteResult;
    /**
     * Converts Delaunay triangulation to Voronoi diagram.
     * @param triangles - Delaunay triangles.
     * @param edges - Delaunay edges.
     * @param sites - Original sites.
     * @returns Voronoi diagram data.
     * @example
     */
    private convertDelaunayToVoronoi;
    /**
     * Checks if a triangle contains a specific edge.
     * @param triangle - The triangle to check.
     * @param edge - The edge to look for.
     * @returns True if the triangle contains the edge.
     * @example
     */
    private triangleContainsEdge;
    /**
     * Creates a key for an edge to use in maps.
     * @param edge - The edge.
     * @returns A string key for the edge.
     * @example
     */
    private edgeKey;
    /**
     * Calculates the direction for an infinite Voronoi edge.
     * @param delaunayEdge - The Delaunay edge.
     * @param triangle - The triangle containing the edge.
     * @returns Direction vector for the infinite edge.
     * @example
     */
    private calculateInfiniteEdgeDirection;
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
    private createVoronoiCell;
    /**
     * Checks if a triangle contains a point.
     * @param triangle - The triangle.
     * @param point - The point to check.
     * @returns True if the triangle contains the point.
     * @example
     */
    private triangleContainsPoint;
    /**
     * Gets the three edges of a triangle.
     * @param triangle - The triangle.
     * @returns Array of edges.
     * @example
     */
    private getTriangleEdges;
}
//# sourceMappingURL=voronoi-core.d.ts.map