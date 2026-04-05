/**
 * @module algorithms/geometry/algorithms/minimum-bounding-box/minimum-bounding-box-utils
 * @description Utility functions for Minimum Bounding Box with rotating calipers algorithm.
 */
import type { Point, Vector, Rectangle, MinimumBoundingBoxConfig, RotatingCalipersOptions } from "./minimum-bounding-box-types";
/**
 * Utility functions for minimum bounding box computations.
 */
export declare class MinimumBoundingBoxUtils {
    /**
     * Calculates the dot product of two vectors.
     * @param a - First vector.
     * @param b - Second vector.
     * @returns Dot product.
     * @example
     */
    static dotProduct(a: Vector, b: Vector): number;
    /**
     * Calculates the cross product of two vectors.
     * @param a - First vector.
     * @param b - Second vector.
     * @returns Cross product (scalar in 2D).
     * @example
     */
    static crossProduct(a: Vector, b: Vector): number;
    /**
     * Calculates the magnitude of a vector.
     * @param v - Vector.
     * @returns Magnitude.
     * @example
     */
    static magnitude(v: Vector): number;
    /**
     * Normalizes a vector to unit length.
     * @param v - Vector to normalize.
     * @returns Normalized vector.
     * @example
     */
    static normalize(v: Vector): Vector;
    /**
     * Calculates the distance between two points.
     * @param a - First point.
     * @param b - Second point.
     * @returns Distance.
     * @example
     */
    static distance(a: Point, b: Point): number;
    /**
     * Calculates the squared distance between two points.
     * @param a - First point.
     * @param b - Second point.
     * @returns Squared distance.
     * @example
     */
    static distanceSquared(a: Point, b: Point): number;
    /**
     * Creates a vector from two points.
     * @param from - Starting point.
     * @param to - Ending point.
     * @returns Vector from first point to second point.
     * @example
     */
    static vectorFromPoints(from: Point, to: Point): Vector;
    /**
     * Adds a vector to a point.
     * @param point - Point.
     * @param vector - Vector to add.
     * @returns New point.
     * @example
     */
    static addVectorToPoint(point: Point, vector: Vector): Point;
    /**
     * Multiplies a vector by a scalar.
     * @param vector - Vector.
     * @param scalar - Scalar multiplier.
     * @returns Scaled vector.
     * @example
     */
    static multiplyVector(vector: Vector, scalar: number): Vector;
    /**
     * Rotates a vector by an angle.
     * @param vector - Vector to rotate.
     * @param angle - Angle in radians.
     * @returns Rotated vector.
     * @example
     */
    static rotateVector(vector: Vector, angle: number): Vector;
    /**
     * Converts an angle to a unit vector.
     * @param angle - Angle in radians.
     * @returns Unit vector.
     * @example
     */
    static angleToVector(angle: number): Vector;
    /**
     * Converts a vector to an angle.
     * @param vector - Vector.
     * @returns Angle in radians.
     * @example
     */
    static vectorToAngle(vector: Vector): number;
    /**
     * Calculates the area of a rectangle.
     * @param rectangle - Rectangle.
     * @returns Area.
     * @example
     */
    static calculateArea(rectangle: Rectangle): number;
    /**
     * Calculates the perimeter of a rectangle.
     * @param rectangle - Rectangle.
     * @returns Perimeter.
     * @example
     */
    static calculatePerimeter(rectangle: Rectangle): number;
    /**
     * Calculates the aspect ratio of a rectangle.
     * @param rectangle - Rectangle.
     * @returns Aspect ratio (width/height).
     * @example
     */
    static calculateAspectRatio(rectangle: Rectangle): number;
    /**
     * Calculates the bounding box of a set of points.
     * @param points - Array of points.
     * @returns Bounding box rectangle.
     * @example
     */
    static calculateBoundingBox(points: Point[]): Rectangle;
    /**
     * Calculates the convex hull of a set of points using Graham scan.
     * @param points - Array of points.
     * @returns Array of points forming the convex hull.
     * @example
     */
    static calculateConvexHull(points: Point[]): Point[];
    /**
     * Calculates the minimum bounding box using rotating calipers.
     * @param points - Array of points (should be convex hull).
     * @param options - Rotating calipers options.
     * @returns Minimum bounding box rectangle.
     * @example
     */
    static calculateMinimumBoundingBoxRotatingCalipers(points: Point[], options?: RotatingCalipersOptions): Rectangle;
    /**
     * Calculates the bounding box area at a specific angle.
     * @param points - Array of points.
     * @param angle - Angle in radians.
     * @returns Area of the bounding box.
     * @example
     */
    static calculateBoundingBoxArea(points: Point[], angle: number): number;
    /**
     * Calculates the bounding box at a specific angle.
     * @param points - Array of points.
     * @param angle - Angle in radians.
     * @returns Bounding box rectangle.
     * @example
     */
    static calculateBoundingBoxAtAngle(points: Point[], angle: number): Rectangle;
    /**
     * Calculates the fit quality of a rectangle for a set of points.
     * @param points - Array of points.
     * @param rectangle - Rectangle to test.
     * @param tolerance - Numerical tolerance.
     * @returns Fit quality (0-1, higher is better).
     * @example
     */
    static calculateFitQuality(points: Point[], rectangle: Rectangle, tolerance?: number): number;
    /**
     * Tests if a point is inside a rectangle.
     * @param point - Point to test.
     * @param rectangle - Rectangle.
     * @param tolerance - Numerical tolerance.
     * @returns True if point is inside rectangle.
     * @example
     */
    static isPointInsideRectangle(point: Point, rectangle: Rectangle, tolerance?: number): boolean;
    /**
     * Calculates the efficiency compared to AABB.
     * @param rectangle - Rectangle.
     * @param aabb - Axis-aligned bounding box.
     * @returns Efficiency (0-1, higher is better).
     * @example
     */
    static calculateEfficiency(rectangle: Rectangle, aabb: Rectangle): number;
    /**
     * Calculates the compactness of a rectangle.
     * @param rectangle - Rectangle.
     * @returns Compactness measure.
     * @example
     */
    static calculateCompactness(rectangle: Rectangle): number;
    /**
     * Validates a set of points.
     * @param points - Array of points to validate.
     * @param config - Configuration options.
     * @param _config
     * @returns True if points are valid.
     * @example
     */
    static validatePoints(points: Point[], _config: MinimumBoundingBoxConfig): boolean;
    /**
     * Validates a rectangle.
     * @param rectangle - Rectangle to validate.
     * @param config - Configuration options.
     * @param _config
     * @returns True if rectangle is valid.
     * @example
     */
    static validateRectangle(rectangle: Rectangle, _config: MinimumBoundingBoxConfig): boolean;
    /**
     * Removes duplicate points from an array.
     * @param points - Array of points.
     * @param tolerance - Tolerance for considering points as duplicates.
     * @returns Array of unique points.
     * @example
     */
    static removeDuplicatePoints(points: Point[], tolerance?: number): Point[];
    /**
     * Sorts points by angle with respect to a reference point.
     * @param points - Array of points.
     * @param reference - Reference point.
     * @returns Sorted array of points.
     * @example
     */
    static sortPointsByAngle(points: Point[], reference: Point): Point[];
    /**
     * Calculates the centroid of a set of points.
     * @param points - Array of points.
     * @returns Centroid point.
     * @example
     */
    static calculateCentroid(points: Point[]): Point;
}
//# sourceMappingURL=minimum-bounding-box-utils.d.ts.map