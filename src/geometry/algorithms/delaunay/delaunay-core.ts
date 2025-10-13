/**
 * @module algorithms/geometry/algorithms/delaunay/delaunay-core
 * @description Implements Delaunay Triangulation using the Bowyer-Watson algorithm.
 */

import {
  Point,
  Triangle,
  Edge,
  Circumcircle,
  DelaunayConfig,
  DelaunayResult,
  TriangulationQueryOptions,
  TriangulationQueryResult,
  MeshGenerationOptions,
  Mesh,
  ConstrainedDelaunayOptions,
  ConstrainedDelaunayResult,
} from "./delaunay-types";

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
export class DelaunayTriangulation {
  private config: DelaunayConfig;

  /**
   * Creates an instance of DelaunayTriangulation.
   * @param config - Optional configuration for the triangulation.
   */
  constructor(config: Partial<DelaunayConfig> = {}) {
    this.config = {
      includeSuperTriangle: false,
      validateInput: true,
      tolerance: 1e-10,
      sortPoints: true,
      ...config,
    };
  }

  /**
   * Performs Delaunay triangulation on a set of points.
   * @param points - Array of points to triangulate.
   * @returns A DelaunayResult object with triangles, edges, and statistics.
   */
  triangulate(points: Point[]): DelaunayResult {
    const startTime = performance.now();

    try {
      // Validate input
      if (this.config.validateInput) {
        this.validatePoints(points);
      }

      // Handle edge cases
      if (points.length < 3) {
        return this.createEmptyResult(startTime, "At least 3 points are required for triangulation");
      }

      if (points.length === 3) {
        return this.createSingleTriangleResult(points, startTime);
      }

      // Sort points for better performance
      const sortedPoints = this.config.sortPoints ? this.sortPoints(points) : [...points];

      // Create super triangle
      const superTriangle = this.createSuperTriangle(sortedPoints);

      // Initialize triangulation with super triangle
      let triangles: Triangle[] = [superTriangle];

      // Add each point incrementally
      for (const point of sortedPoints) {
        triangles = this.addPointToTriangulation(triangles, point);
      }

      // Remove triangles that share vertices with the super triangle
      if (!this.config.includeSuperTriangle) {
        triangles = this.removeSuperTriangle(triangles, superTriangle);
      }

      // Generate edges
      const edges = this.generateEdges(triangles);

      const executionTime = performance.now() - startTime;

      return {
        triangles,
        edges,
        stats: {
          pointCount: points.length,
          triangleCount: triangles.length,
          edgeCount: edges.length,
          executionTime,
          success: true,
        },
      };
    } catch (error) {
      return this.createEmptyResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }

  /**
   * Performs constrained Delaunay triangulation with specified edges.
   * @param points - Array of points to triangulate.
   * @param options - Constrained triangulation options.
   * @returns A ConstrainedDelaunayResult object.
   */
  constrainedTriangulate(
    points: Point[],
    options: Partial<ConstrainedDelaunayOptions> = {}
  ): ConstrainedDelaunayResult {
    const startTime = performance.now();
    const constrainedOptions: ConstrainedDelaunayOptions = {
      ...this.config,
      ...options,
    };

    try {
      // First perform regular Delaunay triangulation
      const result = this.triangulate(points);

      if (!result.stats.success) {
        return {
          ...result,
          constrainedEdges: [],
          failedConstraints: constrainedOptions.constrainedEdges || [],
        };
      }

      // Apply constraints
      const { constrainedEdges, failedConstraints } = this.applyConstraints(
        result.triangles,
        constrainedOptions.constrainedEdges || [],
        constrainedOptions.enforceConstraints || true
      );

      return {
        ...result,
        constrainedEdges,
        failedConstraints,
      };
    } catch (error) {
      return {
        triangles: [],
        edges: [],
        stats: {
          pointCount: points.length,
          triangleCount: 0,
          edgeCount: 0,
          executionTime: performance.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        constrainedEdges: [],
        failedConstraints: constrainedOptions.constrainedEdges || [],
      };
    }
  }

  /**
   * Queries the triangulation for triangles containing or near a point.
   * @param triangles - Array of triangles to query.
   * @param queryPoint - The point to query for.
   * @param options - Query options.
   * @returns A TriangulationQueryResult object.
   */
  queryTriangulation(
    triangles: Triangle[],
    queryPoint: Point,
    options: Partial<TriangulationQueryOptions> = {}
  ): TriangulationQueryResult {
    const startTime = performance.now();
    const queryOptions: TriangulationQueryOptions = {
      includeContainingTriangles: true,
      includeAdjacentTriangles: false,
      maxDistance: 0,
      ...options,
    };

    const resultTriangles: Triangle[] = [];

    for (const triangle of triangles) {
      const containsPoint = this.pointInTriangle(queryPoint, triangle);
      const isAdjacent =
        queryOptions.includeAdjacentTriangles &&
        this.isTriangleAdjacentToPoint(triangle, queryPoint, queryOptions.maxDistance!);

      if (containsPoint && queryOptions.includeContainingTriangles) {
        resultTriangles.push(triangle);
      } else if (isAdjacent && queryOptions.includeAdjacentTriangles) {
        resultTriangles.push(triangle);
      }
    }

    return {
      triangles: resultTriangles,
      triangleCount: resultTriangles.length,
      executionTime: performance.now() - startTime,
    };
  }

  /**
   * Generates a mesh from the triangulation.
   * @param triangles - Array of triangles.
   * @param options - Mesh generation options.
   * @returns A Mesh object.
   */
  generateMesh(triangles: Triangle[], options: Partial<MeshGenerationOptions> = {}): Mesh {
    const meshOptions: MeshGenerationOptions = {
      generateIndices: true,
      generateEdges: true,
      generateFaces: true,
      removeDuplicates: true,
      ...options,
    };

    const vertices: Point[] = [];
    const indices: number[][] = [];
    const edges: number[][] = [];
    const faces: number[][] = [];

    // Collect all unique vertices
    const vertexMap = new Map<string, number>();
    let vertexIndex = 0;

    for (const triangle of triangles) {
      const triangleIndices: number[] = [];

      for (const vertex of [triangle.a, triangle.b, triangle.c]) {
        const key = `${vertex.x},${vertex.y}`;
        let index = vertexMap.get(key);

        if (index === undefined) {
          if (meshOptions.removeDuplicates) {
            // Check if vertex already exists
            const existingIndex = vertices.findIndex(
              v =>
                Math.abs(v.x - vertex.x) < this.config.tolerance! && Math.abs(v.y - vertex.y) < this.config.tolerance!
            );

            if (existingIndex !== -1) {
              index = existingIndex;
            } else {
              vertices.push(vertex);
              index = vertexIndex++;
            }
          } else {
            vertices.push(vertex);
            index = vertexIndex++;
          }
          vertexMap.set(key, index);
        }

        triangleIndices.push(index);
      }

      if (meshOptions.generateIndices) {
        indices.push(triangleIndices);
      }

      if (meshOptions.generateFaces) {
        faces.push(triangleIndices);
      }

      if (meshOptions.generateEdges) {
        // Add edges for this triangle
        const triangleEdges = [
          [triangleIndices[0], triangleIndices[1]],
          [triangleIndices[1], triangleIndices[2]],
          [triangleIndices[2], triangleIndices[0]],
        ];

        for (const edge of triangleEdges) {
          // Check if edge already exists (avoid duplicates)
          const edgeExists = edges.some(
            e => (e[0] === edge[0] && e[1] === edge[1]) || (e[0] === edge[1] && e[1] === edge[0])
          );

          if (!edgeExists) {
            edges.push(edge);
          }
        }
      }
    }

    return {
      vertices,
      indices: meshOptions.generateIndices ? indices : [],
      edges: meshOptions.generateEdges ? edges : [],
      faces: meshOptions.generateFaces ? faces : [],
    };
  }

  // Private helper methods

  private validatePoints(points: Point[]): void {
    if (!Array.isArray(points)) {
      throw new Error("Points must be an array");
    }

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (!point || typeof point.x !== "number" || typeof point.y !== "number") {
        throw new Error(`Invalid point at index ${i}: must have x and y properties`);
      }

      if (!isFinite(point.x) || !isFinite(point.y)) {
        throw new Error(`Point at index ${i} has non-finite coordinates`);
      }
    }

    // Check for duplicate points
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (this.pointsEqual(points[i], points[j])) {
          throw new Error(`Duplicate points found at indices ${i} and ${j}`);
        }
      }
    }
  }

  private sortPoints(points: Point[]): Point[] {
    return [...points].sort((a, b) => {
      if (Math.abs(a.x - b.x) < this.config.tolerance!) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });
  }

  private createSuperTriangle(points: Point[]): Triangle {
    // Find bounding box
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    // Create super triangle that encompasses all points
    const dx = maxX - minX;
    const dy = maxY - minY;
    const dmax = Math.max(dx, dy);
    const midx = (minX + maxX) / 2;
    const midy = (minY + maxY) / 2;

    return {
      a: { x: midx - 2 * dmax, y: midy - dmax },
      b: { x: midx + 2 * dmax, y: midy - dmax },
      c: { x: midx, y: midy + 2 * dmax },
    };
  }

  private addPointToTriangulation(triangles: Triangle[], point: Point): Triangle[] {
    const badTriangles: Triangle[] = [];
    const polygon: Edge[] = [];

    // Find all triangles whose circumcircle contains the point
    for (const triangle of triangles) {
      if (this.pointInCircumcircle(point, triangle)) {
        badTriangles.push(triangle);
      }
    }

    // Find the boundary of the polygonal hole
    for (const triangle of badTriangles) {
      for (const edge of this.getTriangleEdges(triangle)) {
        let shared = false;
        for (const otherTriangle of badTriangles) {
          if (triangle !== otherTriangle && this.triangleHasEdge(otherTriangle, edge)) {
            shared = true;
            break;
          }
        }
        if (!shared) {
          polygon.push(edge);
        }
      }
    }

    // Remove bad triangles
    const newTriangles = triangles.filter(triangle => !badTriangles.includes(triangle));

    // Create new triangles from the point to each edge of the polygon
    for (const edge of polygon) {
      newTriangles.push({
        a: point,
        b: edge.p1,
        c: edge.p2,
      });
    }

    return newTriangles;
  }

  private removeSuperTriangle(triangles: Triangle[], superTriangle: Triangle): Triangle[] {
    return triangles.filter(
      triangle =>
        !this.triangleSharesVertex(triangle, superTriangle.a) &&
        !this.triangleSharesVertex(triangle, superTriangle.b) &&
        !this.triangleSharesVertex(triangle, superTriangle.c)
    );
  }

  private generateEdges(triangles: Triangle[]): Edge[] {
    const edges: Edge[] = [];
    const edgeSet = new Set<string>();

    for (const triangle of triangles) {
      const triangleEdges = this.getTriangleEdges(triangle);
      for (const edge of triangleEdges) {
        const key1 = `${edge.p1.x},${edge.p1.y}-${edge.p2.x},${edge.p2.y}`;
        const key2 = `${edge.p2.x},${edge.p2.y}-${edge.p1.x},${edge.p1.y}`;

        if (!edgeSet.has(key1) && !edgeSet.has(key2)) {
          edges.push(edge);
          edgeSet.add(key1);
        }
      }
    }

    return edges;
  }

  private getTriangleEdges(triangle: Triangle): Edge[] {
    return [
      { p1: triangle.a, p2: triangle.b },
      { p1: triangle.b, p2: triangle.c },
      { p1: triangle.c, p2: triangle.a },
    ];
  }

  private triangleHasEdge(triangle: Triangle, edge: Edge): boolean {
    const edges = this.getTriangleEdges(triangle);
    return edges.some(e => this.edgesEqual(e, edge));
  }

  private edgesEqual(edge1: Edge, edge2: Edge): boolean {
    return (
      (this.pointsEqual(edge1.p1, edge2.p1) && this.pointsEqual(edge1.p2, edge2.p2)) ||
      (this.pointsEqual(edge1.p1, edge2.p2) && this.pointsEqual(edge1.p2, edge2.p1))
    );
  }

  private pointsEqual(p1: Point, p2: Point): boolean {
    return Math.abs(p1.x - p2.x) < this.config.tolerance! && Math.abs(p1.y - p2.y) < this.config.tolerance!;
  }

  private triangleSharesVertex(triangle: Triangle, vertex: Point): boolean {
    return (
      this.pointsEqual(triangle.a, vertex) ||
      this.pointsEqual(triangle.b, vertex) ||
      this.pointsEqual(triangle.c, vertex)
    );
  }

  private pointInCircumcircle(point: Point, triangle: Triangle): boolean {
    const circumcircle = this.calculateCircumcircle(triangle);
    const dx = point.x - circumcircle.center.x;
    const dy = point.y - circumcircle.center.y;
    const distanceSquared = dx * dx + dy * dy;
    return distanceSquared < circumcircle.radius * circumcircle.radius - this.config.tolerance!;
  }

  private calculateCircumcircle(triangle: Triangle): Circumcircle {
    const ax = triangle.a.x;
    const ay = triangle.a.y;
    const bx = triangle.b.x;
    const by = triangle.b.y;
    const cx = triangle.c.x;
    const cy = triangle.c.y;

    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));

    if (Math.abs(d) < this.config.tolerance!) {
      // Degenerate triangle - return a large circumcircle
      return {
        center: { x: (ax + bx + cx) / 3, y: (ay + by + cy) / 3 },
        radius: 1e10,
      };
    }

    const ux =
      ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy =
      ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;

    const center = { x: ux, y: uy };
    const radius = Math.sqrt((ax - ux) * (ax - ux) + (ay - uy) * (ay - uy));

    return { center, radius };
  }

  private pointInTriangle(point: Point, triangle: Triangle): boolean {
    const { a, b, c } = triangle;

    const denom = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    if (Math.abs(denom) < this.config.tolerance!) {
      return false; // Degenerate triangle
    }

    const alpha = ((b.y - c.y) * (point.x - c.x) + (c.x - b.x) * (point.y - c.y)) / denom;
    const beta = ((c.y - a.y) * (point.x - c.x) + (a.x - c.x) * (point.y - c.y)) / denom;
    const gamma = 1 - alpha - beta;

    return alpha >= -this.config.tolerance! && beta >= -this.config.tolerance! && gamma >= -this.config.tolerance!;
  }

  private isTriangleAdjacentToPoint(triangle: Triangle, point: Point, maxDistance: number): boolean {
    if (maxDistance <= 0) return false;

    const edges = this.getTriangleEdges(triangle);
    for (const edge of edges) {
      const distance = this.pointToEdgeDistance(point, edge);
      if (distance <= maxDistance) {
        return true;
      }
    }
    return false;
  }

  private pointToEdgeDistance(point: Point, edge: Edge): number {
    const { p1, p2 } = edge;
    const A = point.x - p1.x;
    const B = point.y - p1.y;
    const C = p2.x - p1.x;
    const D = p2.y - p1.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) {
      return Math.sqrt(A * A + B * B);
    }

    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));

    const xx = p1.x + param * C;
    const yy = p1.y + param * D;

    const dx = point.x - xx;
    const dy = point.y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  private applyConstraints(
    triangles: Triangle[],
    constrainedEdges: Edge[],
    enforceConstraints: boolean
  ): { constrainedEdges: Edge[]; failedConstraints: Edge[] } {
    const successfulConstraints: Edge[] = [];
    const failedConstraints: Edge[] = [];

    for (const constraint of constrainedEdges) {
      // Check if the constraint edge exists in the triangulation
      const exists = this.edgeExistsInTriangulation(triangles, constraint);

      if (exists) {
        successfulConstraints.push(constraint);
      } else {
        failedConstraints.push(constraint);

        if (enforceConstraints) {
          // In a full implementation, you would retriangulate to enforce the constraint
          // For now, we'll just mark it as failed
        }
      }
    }

    return {
      constrainedEdges: successfulConstraints,
      failedConstraints,
    };
  }

  private edgeExistsInTriangulation(triangles: Triangle[], edge: Edge): boolean {
    for (const triangle of triangles) {
      if (this.triangleHasEdge(triangle, edge)) {
        return true;
      }
    }
    return false;
  }

  private createEmptyResult(startTime: number, error: string): DelaunayResult {
    return {
      triangles: [],
      edges: [],
      stats: {
        pointCount: 0,
        triangleCount: 0,
        edgeCount: 0,
        executionTime: performance.now() - startTime,
        success: false,
        error,
      },
    };
  }

  private createSingleTriangleResult(points: Point[], startTime: number): DelaunayResult {
    const triangle: Triangle = {
      a: points[0],
      b: points[1],
      c: points[2],
    };

    const edges = this.getTriangleEdges(triangle);

    return {
      triangles: [triangle],
      edges,
      stats: {
        pointCount: 3,
        triangleCount: 1,
        edgeCount: 3,
        executionTime: performance.now() - startTime,
        success: true,
      },
    };
  }
}
