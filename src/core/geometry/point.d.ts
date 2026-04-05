/**
 * Point Algorithms
 *
 * Specialized algorithms for point operations, including mathematical
 * operations, distance calculations, and geometric transformations.
 *
 * @module algorithms/point-algorithms
 */
import type { Point } from "../types";
export type { Point };
/**
 * Point operations
 */
export declare class PointOps {
    private static readonly memoizedDistance;
    /**
     *
     * @param x
     * @param y
     * @example
     */
    static create(x: number, y: number): Point;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static add(a: Point, b: Point): Point;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static subtract(a: Point, b: Point): Point;
    /**
     *
     * @param a
     * @param scalar
     * @example
     */
    static multiply(a: Point, scalar: number): Point;
    /**
     *
     * @param a
     * @param scalar
     * @example
     */
    static divide(a: Point, scalar: number): Point;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static distance(a: Point, b: Point): number;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static distanceSquared(a: Point, b: Point): number;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static midpoint(a: Point, b: Point): Point;
    /**
     *
     * @param a
     * @param b
     * @param t
     * @example
     */
    static lerp(a: Point, b: Point, t: number): Point;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static equals(a: Point, b: Point): boolean;
    /**
     *
     * @param point
     * @example
     */
    static clone(point: Point): Point;
}
//# sourceMappingURL=point.d.ts.map