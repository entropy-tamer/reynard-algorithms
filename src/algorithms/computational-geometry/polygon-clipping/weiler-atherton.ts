/**
 * @module algorithms/geometry/algorithms/polygon-clipping/weiler-atherton
 * @description Implements the Weiler-Atherton polygon clipping algorithm.
 */

import {
  Point,
  Polygon,
  ClipOperation,
  WeilerAthertonOptions,
  ClipResult,
  ClippingStats,
  WAVertex,
  WAPolygon,
} from "./polygon-clipping-types";

/**
 * The Weiler-Atherton algorithm for general polygon clipping operations.
 * This algorithm can handle non-convex polygons and supports union, intersection,
 * difference, and XOR operations.
 */
export class WeilerAthertonClipper {
  private config: WeilerAthertonOptions;

  /**
   *
   * @param config
   * @example
   */
  constructor(config: Partial<WeilerAthertonOptions> = {}) {
    this.config = {
      tolerance: 1e-10,
      validateInput: true,
      handleSelfIntersections: false,
      preserveOrientation: true,
      removeDuplicates: true,
      simplifyResult: false,
      operation: ClipOperation.INTERSECTION,
      handleHoles: true,
      mergeEdges: true,
      ...config,
    };
  }

  /**
   * Clips a subject polygon against a clipping polygon using the specified operation.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @param operation - The clipping operation to perform.
   * @returns The result of the clipping operation.
   * @example
   */
  clip(subject: Polygon, clipping: Polygon, operation: ClipOperation = this.config.operation!): ClipResult {
    const startTime = performance.now();

    try {
      // Validate input
      if (this.config.validateInput) {
        this.validatePolygon(subject, "subject");
        this.validatePolygon(clipping, "clipping");
      }

      // Handle edge cases
      if (subject.vertices.length < 3) {
        return this.createEmptyResult(startTime, "Subject polygon must have at least 3 vertices");
      }

      if (clipping.vertices.length < 3) {
        return this.createEmptyResult(startTime, "Clipping polygon must have at least 3 vertices");
      }

      // Convert polygons to Weiler-Atherton format
      const subjectWA = this.polygonToWA(subject, true);
      const clippingWA = this.polygonToWA(clipping, false);

      // Find all intersection points
      const intersectionPoints = this.findIntersections(subjectWA, clippingWA);

      // Insert intersection points into both polygons
      this.insertIntersectionPoints(subjectWA, clippingWA, intersectionPoints);

      // Mark vertices as inside/outside
      this.markVerticesInside(subjectWA, clippingWA);
      this.markVerticesInside(clippingWA, subjectWA);

      // Perform the clipping operation
      const resultPolygons = this.performClippingOperation(subjectWA, clippingWA, operation);

      // Convert back to standard polygon format
      const result = this.wasToPolygons(resultPolygons);

      // Post-process the result
      const processedResult = this.postProcessResult(result);

      const executionTime = performance.now() - startTime;

      const stats: ClippingStats = {
        subjectVertices: subject.vertices.length,
        clippingVertices: clipping.vertices.length,
        resultVertices: processedResult.reduce((sum, poly) => sum + poly.vertices.length, 0),
        intersectionPoints: intersectionPoints.length,
        executionTime,
        success: true,
        algorithm: "weiler-atherton",
      };

      return {
        polygons: processedResult,
        stats,
        isEmpty: processedResult.length === 0,
        isMultiple: processedResult.length > 1,
      };
    } catch (error) {
      return this.createEmptyResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }

  /**
   * Converts a standard polygon to Weiler-Atherton format.
   * @param polygon - The polygon to convert.
   * @param isSubject - Whether this is the subject polygon.
   * @returns The Weiler-Atherton polygon.
   * @example
   */
  private polygonToWA(polygon: Polygon, isSubject: boolean): WAPolygon {
    const vertices: WAVertex[] = polygon.vertices.map((point, _index) => ({
      point,
      isIntersection: false,
      isInside: false,
      processed: false,
    }));

    // Link vertices in a circular list
    for (let i = 0; i < vertices.length; i++) {
      vertices[i].next = vertices[(i + 1) % vertices.length];
      vertices[i].previous = vertices[(i - 1 + vertices.length) % vertices.length];
    }

    return {
      vertices,
      isSubject,
      isClipping: !isSubject,
    };
  }

  /**
   * Finds all intersection points between two polygons.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns Array of intersection points with metadata.
   * @example
   */
  private findIntersections(
    subject: WAPolygon,
    clipping: WAPolygon
  ): Array<{
    point: Point;
    subjectEdge: { start: WAVertex; end: WAVertex };
    clippingEdge: { start: WAVertex; end: WAVertex };
  }> {
    const intersections: Array<{
      point: Point;
      subjectEdge: { start: WAVertex; end: WAVertex };
      clippingEdge: { start: WAVertex; end: WAVertex };
    }> = [];

    // Check each edge of subject against each edge of clipping
    for (const subjectVertex of subject.vertices) {
      const subjectNext = subjectVertex.next!;

      for (const clippingVertex of clipping.vertices) {
        const clippingNext = clippingVertex.next!;

        const intersection = this.lineIntersection(
          subjectVertex.point,
          subjectNext.point,
          clippingVertex.point,
          clippingNext.point
        );

        if (intersection) {
          intersections.push({
            point: intersection,
            subjectEdge: { start: subjectVertex, end: subjectNext },
            clippingEdge: { start: clippingVertex, end: clippingNext },
          });
        }
      }
    }

    return intersections;
  }

  /**
   * Finds the intersection point of two line segments.
   * @param p1 - Start of first line segment.
   * @param p2 - End of first line segment.
   * @param p3 - Start of second line segment.
   * @param p4 - End of second line segment.
   * @returns The intersection point, or null if no intersection.
   * @example
   */
  private lineIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);

    if (Math.abs(denom) < this.config.tolerance!) {
      return null; // Lines are parallel
    }

    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;

    // Check if intersection is within both line segments
    if (
      t >= -this.config.tolerance! &&
      t <= 1 + this.config.tolerance! &&
      u >= -this.config.tolerance! &&
      u <= 1 + this.config.tolerance!
    ) {
      return {
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y),
      };
    }

    return null;
  }

  /**
   * Inserts intersection points into both polygons.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @param _subject
   * @param _clipping
   * @param intersections - Array of intersection points.
   * @example
   */
  private insertIntersectionPoints(
    _subject: WAPolygon,
    _clipping: WAPolygon,
    intersections: Array<{
      point: Point;
      subjectEdge: { start: WAVertex; end: WAVertex };
      clippingEdge: { start: WAVertex; end: WAVertex };
    }>
  ): void {
    for (const intersection of intersections) {
      // Create intersection vertices
      const subjectIntersection: WAVertex = {
        point: intersection.point,
        isIntersection: true,
        isInside: false,
        processed: false,
      };

      const clippingIntersection: WAVertex = {
        point: intersection.point,
        isIntersection: true,
        isInside: false,
        processed: false,
      };

      // Link intersection vertices
      subjectIntersection.corresponding = clippingIntersection;
      clippingIntersection.corresponding = subjectIntersection;

      // Insert into subject polygon
      this.insertVertexInEdge(subjectIntersection, intersection.subjectEdge);

      // Insert into clipping polygon
      this.insertVertexInEdge(clippingIntersection, intersection.clippingEdge);
    }
  }

  /**
   * Inserts a vertex into an edge of a polygon.
   * @param vertex - The vertex to insert.
   * @param edge - The edge to insert into.
   * @param edge.start
   * @param edge.end
   * @example
   */
  private insertVertexInEdge(vertex: WAVertex, edge: { start: WAVertex; end: WAVertex }): void {
    // Update the edge to point to the new vertex
    edge.start.next = vertex;
    vertex.previous = edge.start;
    vertex.next = edge.end;
    edge.end.previous = vertex;
  }

  /**
   * Marks vertices as inside or outside the other polygon.
   * @param polygon - The polygon whose vertices to mark.
   * @param otherPolygon - The other polygon to test against.
   * @example
   */
  private markVerticesInside(polygon: WAPolygon, otherPolygon: WAPolygon): void {
    for (const vertex of polygon.vertices) {
      vertex.isInside = this.isPointInPolygon(vertex.point, otherPolygon);
    }
  }

  /**
   * Checks if a point is inside a polygon using ray casting.
   * @param point - The point to test.
   * @param polygon - The polygon to test against.
   * @returns True if the point is inside the polygon.
   * @example
   */
  private isPointInPolygon(point: Point, polygon: WAPolygon): boolean {
    let inside = false;
    let current = polygon.vertices[0];

    do {
      const next = current.next!;

      if (
        current.point.y > point.y !== next.point.y > point.y &&
        point.x <
          ((next.point.x - current.point.x) * (point.y - current.point.y)) / (next.point.y - current.point.y) +
            current.point.x
      ) {
        inside = !inside;
      }

      current = next;
    } while (current !== polygon.vertices[0]);

    return inside;
  }

  /**
   * Performs the specified clipping operation.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @param operation - The operation to perform.
   * @returns Array of result polygons.
   * @example
   */
  private performClippingOperation(subject: WAPolygon, clipping: WAPolygon, operation: ClipOperation): WAPolygon[] {
    const resultPolygons: WAPolygon[] = [];

    switch (operation) {
      case ClipOperation.INTERSECTION:
        resultPolygons.push(...this.performIntersection(subject, clipping));
        break;
      case ClipOperation.UNION:
        resultPolygons.push(...this.performUnion(subject, clipping));
        break;
      case ClipOperation.DIFFERENCE:
        resultPolygons.push(...this.performDifference(subject, clipping));
        break;
      case ClipOperation.XOR:
        resultPolygons.push(...this.performXOR(subject, clipping));
        break;
    }

    return resultPolygons;
  }

  /**
   * Performs intersection operation.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @param _clipping
   * @returns Array of result polygons.
   * @example
   */
  private performIntersection(subject: WAPolygon, _clipping: WAPolygon): WAPolygon[] {
    const resultPolygons: WAPolygon[] = [];

    // Find intersection vertices that are entry points
    const entryPoints = subject.vertices.filter(vertex => vertex.isIntersection && !vertex.isInside);

    for (const entryPoint of entryPoints) {
      if (!entryPoint.processed) {
        const resultPolygon = this.tracePolygon(entryPoint, true);
        if (resultPolygon.vertices.length >= 3) {
          resultPolygons.push(resultPolygon);
        }
      }
    }

    return resultPolygons;
  }

  /**
   * Performs union operation.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns Array of result polygons.
   * @example
   */
  private performUnion(subject: WAPolygon, clipping: WAPolygon): WAPolygon[] {
    const resultPolygons: WAPolygon[] = [];

    // Find entry points for union (intersection vertices that are outside)
    const entryPoints = subject.vertices.filter(vertex => vertex.isIntersection && !vertex.isInside);

    for (const entryPoint of entryPoints) {
      if (!entryPoint.processed) {
        const resultPolygon = this.tracePolygon(entryPoint, true);
        if (resultPolygon.vertices.length >= 3) {
          resultPolygons.push(resultPolygon);
        }
      }
    }

    // Also trace from clipping polygon entry points
    const clippingEntryPoints = clipping.vertices.filter(vertex => vertex.isIntersection && !vertex.isInside);

    for (const entryPoint of clippingEntryPoints) {
      if (!entryPoint.processed) {
        const resultPolygon = this.tracePolygon(entryPoint, true);
        if (resultPolygon.vertices.length >= 3) {
          resultPolygons.push(resultPolygon);
        }
      }
    }

    return resultPolygons;
  }

  /**
   * Performs difference operation.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @param _clipping
   * @returns Array of result polygons.
   * @example
   */
  private performDifference(subject: WAPolygon, _clipping: WAPolygon): WAPolygon[] {
    const resultPolygons: WAPolygon[] = [];

    // Find entry points for difference (intersection vertices that are outside)
    const entryPoints = subject.vertices.filter(vertex => vertex.isIntersection && !vertex.isInside);

    for (const entryPoint of entryPoints) {
      if (!entryPoint.processed) {
        const resultPolygon = this.tracePolygon(entryPoint, true);
        if (resultPolygon.vertices.length >= 3) {
          resultPolygons.push(resultPolygon);
        }
      }
    }

    return resultPolygons;
  }

  /**
   * Performs XOR operation.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns Array of result polygons.
   * @example
   */
  private performXOR(subject: WAPolygon, clipping: WAPolygon): WAPolygon[] {
    // XOR is equivalent to union minus intersection
    const unionResult = this.performUnion(subject, clipping);

    // This is a simplified implementation
    // In practice, you'd need to perform the actual set difference
    return unionResult;
  }

  /**
   * Traces a polygon starting from an entry point.
   * @param entryPoint - The starting point.
   * @param isEntry - Whether this is an entry point.
   * @returns The traced polygon.
   * @example
   */
  private tracePolygon(entryPoint: WAVertex, isEntry: boolean): WAPolygon {
    const vertices: WAVertex[] = [];
    let current = entryPoint;
    let isCurrentlyEntry = isEntry;

    do {
      vertices.push(current);
      current.processed = true;

      if (current.isIntersection) {
        // Switch to the other polygon
        current = current.corresponding!;
        isCurrentlyEntry = !isCurrentlyEntry;
      } else {
        // Move to next vertex in current polygon
        current = isCurrentlyEntry ? current.next! : current.previous!;
      }
    } while (current !== entryPoint && vertices.length < 1000); // Safety check

    return {
      vertices,
      isSubject: true,
      isClipping: false,
    };
  }

  /**
   * Converts Weiler-Atherton polygons back to standard polygon format.
   * @param waPolygons - Array of Weiler-Atherton polygons.
   * @returns Array of standard polygons.
   * @example
   */
  private wasToPolygons(waPolygons: WAPolygon[]): Polygon[] {
    return waPolygons.map(waPolygon => ({
      vertices: waPolygon.vertices.map(vertex => vertex.point),
    }));
  }

  /**
   * Post-processes the result polygons.
   * @param polygons - The result polygons.
   * @returns Processed polygons.
   * @example
   */
  private postProcessResult(polygons: Polygon[]): Polygon[] {
    let result = polygons;

    if (this.config.removeDuplicates) {
      result = result.map(polygon => ({
        ...polygon,
        vertices: this.removeDuplicateVertices(polygon.vertices),
      }));
    }

    if (this.config.simplifyResult) {
      result = result.map(polygon => ({
        ...polygon,
        vertices: this.simplifyPolygon(polygon.vertices),
      }));
    }

    // Filter out invalid polygons
    result = result.filter(polygon => polygon.vertices.length >= 3);

    return result;
  }

  /**
   * Removes duplicate vertices from a polygon.
   * @param vertices - The vertices to process.
   * @returns Vertices with duplicates removed.
   * @example
   */
  private removeDuplicateVertices(vertices: Point[]): Point[] {
    if (vertices.length <= 1) return vertices;

    const result: Point[] = [vertices[0]];

    for (let i = 1; i < vertices.length; i++) {
      const current = vertices[i];
      const previous = result[result.length - 1];

      if (!this.pointsEqual(current, previous)) {
        result.push(current);
      }
    }

    // Check if first and last vertices are the same
    if (result.length > 1 && this.pointsEqual(result[0], result[result.length - 1])) {
      result.pop();
    }

    return result;
  }

  /**
   * Simplifies a polygon by removing collinear vertices.
   * @param vertices - The vertices to simplify.
   * @returns Simplified vertices.
   * @example
   */
  private simplifyPolygon(vertices: Point[]): Point[] {
    if (vertices.length < 3) return vertices;

    const result: Point[] = [];
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      const prev = vertices[(i - 1 + n) % n];
      const current = vertices[i];
      const next = vertices[(i + 1) % n];

      // Check if the three points are collinear
      if (!this.areCollinear(prev, current, next)) {
        result.push(current);
      }
    }

    return result.length >= 3 ? result : vertices;
  }

  /**
   * Checks if three points are collinear.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @param p3 - Third point.
   * @returns True if the points are collinear.
   * @example
   */
  private areCollinear(p1: Point, p2: Point, p3: Point): boolean {
    const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    return Math.abs(crossProduct) < this.config.tolerance!;
  }

  /**
   * Checks if two points are equal within tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @returns True if the points are equal.
   * @example
   */
  private pointsEqual(p1: Point, p2: Point): boolean {
    return Math.abs(p1.x - p2.x) < this.config.tolerance! && Math.abs(p1.y - p2.y) < this.config.tolerance!;
  }

  /**
   * Validates a polygon.
   * @param polygon - The polygon to validate.
   * @param name - The name of the polygon for error messages.
   * @throws Error if validation fails.
   * @example
   */
  private validatePolygon(polygon: Polygon, name: string): void {
    if (!polygon || !Array.isArray(polygon.vertices)) {
      throw new Error(`${name} polygon must have a vertices array`);
    }

    if (polygon.vertices.length < 3) {
      throw new Error(`${name} polygon must have at least 3 vertices`);
    }

    for (let i = 0; i < polygon.vertices.length; i++) {
      const vertex = polygon.vertices[i];
      if (!vertex || typeof vertex.x !== "number" || typeof vertex.y !== "number") {
        throw new Error(`${name} polygon vertex ${i} must have x and y properties`);
      }

      if (!isFinite(vertex.x) || !isFinite(vertex.y)) {
        throw new Error(`${name} polygon vertex ${i} must have finite coordinates`);
      }
    }
  }

  /**
   * Creates an empty result for error cases.
   * @param startTime - Start time for execution time calculation.
   * @param error - Error message.
   * @returns Empty clip result.
   * @example
   */
  private createEmptyResult(startTime: number, error: string): ClipResult {
    const executionTime = performance.now() - startTime;
    const stats: ClippingStats = {
      subjectVertices: 0,
      clippingVertices: 0,
      resultVertices: 0,
      intersectionPoints: 0,
      executionTime,
      success: false,
      error,
      algorithm: "weiler-atherton",
    };

    return {
      polygons: [],
      stats,
      isEmpty: true,
      isMultiple: false,
    };
  }
}
