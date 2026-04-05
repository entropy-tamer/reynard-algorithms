/**
 * Vector Algorithms
 *
 * Specialized algorithms for vector operations, including mathematical
 * operations, transformations, and geometric calculations.
 *
 * @module algorithms/vector-algorithms
 */
import type { Point, Vector } from "../types";
export type { Vector };
/**
 * Vector operations
 */
export declare class VectorOps {
    private static readonly memoizedCos;
    private static readonly memoizedSin;
    private static readonly memoizedAtan2;
    private static readonly memoizedAcos;
    private static readonly memoizedMagnitude;
    /**
     *
     * @param x
     * @param y
     * @example
     */
    static create(x: number, y: number): Vector;
    /**
     *
     * @param start
     * @param end
     * @example
     */
    static fromPoints(start: Point, end: Point): Vector;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static add(a: Vector, b: Vector): Vector;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static subtract(a: Vector, b: Vector): Vector;
    /**
     *
     * @param a
     * @param scalar
     * @example
     */
    static multiply(a: Vector, scalar: number): Vector;
    /**
     *
     * @param a
     * @param scalar
     * @example
     */
    static divide(a: Vector, scalar: number): Vector;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static dot(a: Vector, b: Vector): number;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static cross(a: Vector, b: Vector): number;
    /**
     *
     * @param vector
     * @example
     */
    static magnitude(vector: Vector): number;
    /**
     *
     * @param vector
     * @example
     */
    static magnitudeSquared(vector: Vector): number;
    /**
     *
     * @param vector
     * @example
     */
    static normalize(vector: Vector): Vector;
    private static _normalizeMemo?;
    /**
     *
     * @param vector
     * @param angle
     * @example
     */
    static rotate(vector: Vector, angle: number): Vector;
    /**
     *
     * @param vector
     * @example
     */
    static angle(vector: Vector): number;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static angleBetween(a: Vector, b: Vector): number;
}
//# sourceMappingURL=vector.d.ts.map