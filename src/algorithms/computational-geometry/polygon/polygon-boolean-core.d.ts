/**
 * Polygon Boolean Operations
 *
 * Implementation of polygon boolean operations (union, intersection, difference, XOR).
 * Uses a robust algorithm that handles self-intersections and complex cases.
 */
import type { Polygon, PolygonBooleanConfig, PolygonBooleanResult, PolygonBooleanOptions } from "./polygon-boolean-types.js";
/**
 * Perform boolean operation on two polygons
 * @param poly1
 * @param poly2
 * @param options
 * @example
 */
export declare function performPolygonBoolean(poly1: Polygon, poly2: Polygon, options: PolygonBooleanOptions): PolygonBooleanResult;
/**
 * Polygon boolean operations class for convenient usage
 */
export declare class PolygonBooleanOps {
    private config;
    /**
     *
     * @param config
     * @example
     */
    constructor(config?: Partial<PolygonBooleanConfig>);
    /**
     * Perform union operation
     * @param poly1
     * @param poly2
     * @param options
     * @example
     */
    union(poly1: Polygon, poly2: Polygon, options?: Partial<PolygonBooleanOptions>): PolygonBooleanResult;
    /**
     * Perform intersection operation
     * @param poly1
     * @param poly2
     * @param options
     * @example
     */
    intersection(poly1: Polygon, poly2: Polygon, options?: Partial<PolygonBooleanOptions>): PolygonBooleanResult;
    /**
     * Perform difference operation
     * @param poly1
     * @param poly2
     * @param options
     * @example
     */
    difference(poly1: Polygon, poly2: Polygon, options?: Partial<PolygonBooleanOptions>): PolygonBooleanResult;
    /**
     * Perform XOR operation
     * @param poly1
     * @param poly2
     * @param options
     * @example
     */
    xor(poly1: Polygon, poly2: Polygon, options?: Partial<PolygonBooleanOptions>): PolygonBooleanResult;
}
export { BooleanOperation } from "./polygon-boolean-types.js";
//# sourceMappingURL=polygon-boolean-core.d.ts.map