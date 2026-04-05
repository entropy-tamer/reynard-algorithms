/**
 * @module algorithms/geometry/algorithms/delaunay/delaunay-core
 * @description Implements Delaunay Triangulation using the Bowyer-Watson algorithm.
 */
import { Point, Triangle, DelaunayConfig, DelaunayResult, TriangulationQueryOptions, TriangulationQueryResult, MeshGenerationOptions, Mesh, ConstrainedDelaunayOptions, ConstrainedDelaunayResult } from "./delaunay-types";
/**
 * The DelaunayTriangulation class provides an implementation of Delaunay triangulation
 * using the Bowyer-Watson algorithm. It creates a triangulation where no point lies
 * inside the circumcircle of any triangle, ensuring optimal triangle quality.
 *
 * @example
 * ```typescript
 * const delaunay = new DelaunayTriangulation();
 * const points = [
 *   { x: 0, y: 0 },
 *   { x: 1, y: 0 },
 *   { x: 0.5, y: 1 },
 * ];
 * const result = delaunay.triangulate(points);
 * console.log(result.triangles.length); // Should be 1 triangle
 * ```
 */
export declare class DelaunayTriangulation {
    private config;
    /**
     * Creates an instance of DelaunayTriangulation.
     * @param config - Optional configuration for the triangulation.
     * @example
     */
    constructor(config?: Partial<DelaunayConfig>);
    /**
     * Performs Delaunay triangulation on a set of points.
     * @param points - Array of points to triangulate.
     * @returns A DelaunayResult object with triangles, edges, and statistics.
     * @example
     */
    triangulate(points: Point[]): DelaunayResult;
    /**
     * Performs constrained Delaunay triangulation with specified edges.
     * @param points - Array of points to triangulate.
     * @param options - Constrained triangulation options.
     * @returns A ConstrainedDelaunayResult object.
     * @example
     */
    constrainedTriangulate(points: Point[], options?: Partial<ConstrainedDelaunayOptions>): ConstrainedDelaunayResult;
    /**
     * Queries the triangulation for triangles containing or near a point.
     * @param triangles - Array of triangles to query.
     * @param queryPoint - The point to query for.
     * @param options - Query options.
     * @returns A TriangulationQueryResult object.
     * @example
     */
    queryTriangulation(triangles: Triangle[], queryPoint: Point, options?: Partial<TriangulationQueryOptions>): TriangulationQueryResult;
    /**
     * Generates a mesh from the triangulation.
     * @param triangles - Array of triangles.
     * @param options - Mesh generation options.
     * @returns A Mesh object.
     * @example
     */
    generateMesh(triangles: Triangle[], options?: Partial<MeshGenerationOptions>): Mesh;
    /**
     *
     * @param points
     * @example
     */
    private validatePoints;
    /**
     *
     * @param points
     * @example
     */
    private sortPoints;
    /**
     *
     * @param points
     * @example
     */
    private createSuperTriangle;
    /**
     *
     * @param triangles
     * @param point
     * @example
     */
    private addPointToTriangulation;
    /**
     *
     * @param triangles
     * @param superTriangle
     * @example
     */
    private removeSuperTriangle;
    /**
     *
     * @param triangles
     * @example
     */
    private generateEdges;
    /**
     *
     * @param triangle
     * @example
     */
    private getTriangleEdges;
    /**
     *
     * @param triangle
     * @param edge
     * @example
     */
    private triangleHasEdge;
    /**
     *
     * @param edge1
     * @param edge2
     * @example
     */
    private edgesEqual;
    /**
     *
     * @param p1
     * @param p2
     * @example
     */
    private pointsEqual;
    /**
     *
     * @param triangle
     * @param vertex
     * @example
     */
    private triangleSharesVertex;
    /**
     *
     * @param point
     * @param triangle
     * @example
     */
    private pointInCircumcircle;
    /**
     *
     * @param triangle
     * @example
     */
    private calculateCircumcircle;
    /**
     *
     * @param point
     * @param triangle
     * @example
     */
    private pointInTriangle;
    /**
     *
     * @param triangle
     * @param point
     * @param maxDistance
     * @example
     */
    private isTriangleAdjacentToPoint;
    /**
     *
     * @param point
     * @param edge
     * @example
     */
    private pointToEdgeDistance;
    /**
     *
     * @param triangles
     * @param constrainedEdges
     * @param enforceConstraints
     * @example
     */
    private applyConstraints;
    /**
     *
     * @param triangles
     * @param edge
     * @example
     */
    private edgeExistsInTriangulation;
    /**
     *
     * @param startTime
     * @param error
     * @example
     */
    private createEmptyResult;
    /**
     *
     * @param points
     * @param startTime
     * @example
     */
    private createSingleTriangleResult;
}
//# sourceMappingURL=delaunay-core.d.ts.map