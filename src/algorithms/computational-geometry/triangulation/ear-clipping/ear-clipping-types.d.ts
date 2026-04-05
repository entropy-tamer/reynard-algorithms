/**
 * @file Type definitions for Ear Clipping triangulation algorithm.
 * @module algorithms/computational-geometry/triangulation/ear-clipping-types
 * @description Type definitions for Ear Clipping triangulation algorithm.
 */
import type { Point } from "../../../../core/types";
/**
 * Configuration options for Ear Clipping triangulation.
 */
export interface EarClippingConfig {
    /**
     * Tolerance for floating point comparisons.
     * @default 1e-10
     */
    tolerance?: number;
    /**
     * Whether to validate input polygon.
     * @default true
     */
    validateInput?: boolean;
    /**
     * Whether to handle holes in the polygon.
     * @default false
     */
    handleHoles?: boolean;
}
/**
 * Statistics about the triangulation process.
 */
export interface EarClippingStats {
    /**
     * Number of input vertices.
     */
    vertexCount: number;
    /**
     * Number of triangles generated.
     */
    triangleCount: number;
    /**
     * Execution time in milliseconds.
     */
    executionTime: number;
    /**
     * Number of ears clipped.
     */
    earsClipped: number;
}
/**
 * Triangle with three vertices.
 */
export interface Triangle {
    a: Point;
    b: Point;
    c: Point;
}
/**
 * Result of Ear Clipping triangulation.
 */
export interface EarClippingResult {
    /**
     * Array of triangles.
     */
    triangles: Triangle[];
    /**
     * Statistics about the triangulation.
     */
    stats: EarClippingStats;
}
/**
 * Options for Ear Clipping triangulation.
 */
export type EarClippingOptions = Partial<EarClippingConfig>;
/**
 * Default configuration.
 */
export declare const DEFAULT_EAR_CLIPPING_CONFIG: Required<EarClippingConfig>;
//# sourceMappingURL=ear-clipping-types.d.ts.map