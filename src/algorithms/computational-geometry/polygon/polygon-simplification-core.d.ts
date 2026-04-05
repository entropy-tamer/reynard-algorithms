/**
 * Polygon Simplification Algorithms
 *
 * Implementation of polygon simplification algorithms including
 * Douglas-Peucker, Visvalingam-Whyatt, and Reumann-Witkam.
 */
import type { Point } from "../../../core/types/index.js";
import type { PolygonSimplificationConfig, PolygonSimplificationResult, PolygonSimplificationOptions } from "./polygon-simplification-types.js";
/**
 * Simplify a polygon using the specified algorithm
 * @param vertices
 * @param options
 * @example
 */
export declare function simplifyPolygon(vertices: Point[], options: PolygonSimplificationOptions): PolygonSimplificationResult;
/**
 * Polygon simplification class for convenient usage
 */
export declare class PolygonSimplifier {
    private config;
    /**
     *
     * @param config
     * @example
     */
    constructor(config?: Partial<PolygonSimplificationConfig>);
    /**
     * Simplify a polygon
     * @param vertices
     * @param options
     * @example
     */
    simplify(vertices: Point[], options?: Partial<PolygonSimplificationOptions>): PolygonSimplificationResult;
}
//# sourceMappingURL=polygon-simplification-core.d.ts.map