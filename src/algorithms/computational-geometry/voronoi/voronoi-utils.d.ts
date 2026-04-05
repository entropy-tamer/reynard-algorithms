/**
 * @module algorithms/geometry/algorithms/voronoi/utils
 * @description Utility functions for Voronoi diagram operations.
 */
import { Point, Triangle } from "../delaunay/delaunay-types";
import { LloydRelaxationOptions, LloydRelaxationResult, VoronoiCell, VoronoiConfig } from "./voronoi-types";
/**
 * Calculates the circumcenter of a triangle.
 * @param triangle - The triangle to calculate the circumcenter for.
 * @returns The circumcenter point.
 * @example
 */
export declare function calculateCircumcenter(triangle: Triangle): Point;
/**
 * Calculates the area of a polygon defined by vertices.
 * @param vertices - Array of vertices forming the polygon.
 * @returns The area of the polygon.
 * @example
 */
export declare function calculatePolygonArea(vertices: Point[]): number;
/**
 * Calculates the centroid of a polygon defined by vertices.
 * @param vertices - Array of vertices forming the polygon.
 * @returns The centroid point.
 * @example
 */
export declare function calculatePolygonCentroid(vertices: Point[]): Point;
/**
 * Checks if a point is inside a polygon using ray casting algorithm.
 * @param point - The point to test.
 * @param vertices - Array of vertices forming the polygon.
 * @returns True if the point is inside the polygon.
 * @example
 */
export declare function isPointInPolygon(point: Point, vertices: Point[]): boolean;
/**
 * Finds the nearest site to a given point.
 * @param point - The query point.
 * @param sites - Array of sites.
 * @returns The nearest site and its distance.
 * @example
 */
export declare function findNearestSite(point: Point, sites: Point[]): {
    site: Point;
    distance: number;
    index: number;
};
/**
 * Calculates the distance between two points.
 * @param p1 - First point.
 * @param p2 - Second point.
 * @returns The Euclidean distance.
 * @example
 */
export declare function distance(p1: Point, p2: Point): number;
/**
 * Calculates the squared distance between two points (faster than distance).
 * @param p1 - First point.
 * @param p2 - Second point.
 * @returns The squared Euclidean distance.
 * @example
 */
export declare function distanceSquared(p1: Point, p2: Point): number;
/**
 * Clips a Voronoi cell to a bounding box.
 * @param cell - The Voronoi cell to clip.
 * @param boundingBox - The bounding box to clip to.
 * @param boundingBox.min
 * @param boundingBox.max
 * @returns The clipped cell vertices.
 * @example
 */
export declare function clipCellToBounds(cell: VoronoiCell, boundingBox: {
    min: Point;
    max: Point;
}): Point[];
/**
 * Performs Lloyd's relaxation on a set of sites.
 * @param sites - Initial sites.
 * @param options - Relaxation options.
 * @param config - Voronoi configuration.
 * @param _config
 * @returns The result of Lloyd's relaxation.
 * @example
 */
export declare function performLloydRelaxation(sites: Point[], options: LloydRelaxationOptions, _config: VoronoiConfig): LloydRelaxationResult;
/**
 * Validates that points are not collinear (for Delaunay triangulation).
 * @param points - Array of points to validate.
 * @param tolerance - Tolerance for collinearity check.
 * @returns True if points are valid for triangulation.
 * @example
 */
export declare function validatePointsForTriangulation(points: Point[], tolerance?: number): boolean;
/**
 * Creates a bounding box that encompasses all points.
 * @param points - Array of points.
 * @param padding - Padding to add around the points.
 * @returns Bounding box with min and max points.
 * @example
 */
export declare function createBoundingBox(points: Point[], padding?: number): {
    min: Point;
    max: Point;
};
/**
 * Sorts points by x-coordinate, then by y-coordinate.
 * @param points - Array of points to sort.
 * @returns Sorted array of points.
 * @example
 */
export declare function sortPoints(points: Point[]): Point[];
/**
 * Checks if two points are approximately equal.
 * @param p1 - First point.
 * @param p2 - Second point.
 * @param tolerance - Tolerance for comparison.
 * @returns True if points are approximately equal.
 * @example
 */
export declare function pointsEqual(p1: Point, p2: Point, tolerance?: number): boolean;
/**
 * Finds the intersection point of two lines.
 * @param p1 - First point of first line.
 * @param p2 - Second point of first line.
 * @param p3 - First point of second line.
 * @param p4 - Second point of second line.
 * @returns The intersection point, or null if lines don't intersect.
 * @example
 */
export declare function lineIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point | null;
//# sourceMappingURL=voronoi-utils.d.ts.map