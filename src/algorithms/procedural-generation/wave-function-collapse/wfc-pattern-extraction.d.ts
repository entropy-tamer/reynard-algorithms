/**
 * @file Pattern Extraction Utilities
 *
 * Extracts patterns from 2D and 3D input data for Wave Function Collapse.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */
import type { Pattern } from "./wave-function-collapse-types";
/**
 * Extract patterns from 2D input data
 *
 * @param inputData 2D input data
 * @param patternSize Size of patterns to extract
 * @returns Array of extracted patterns
 * @example
 */
export declare function extractPatterns2D(inputData: string[][], patternSize: number): Pattern[];
/**
 * Extract patterns from 3D input data
 *
 * @param inputData 3D input data
 * @param patternSize Size of patterns to extract
 * @returns Array of extracted patterns
 * @example
 */
export declare function extractPatterns3D(inputData: string[][][], patternSize: number): Pattern[];
/**
 * Extract pattern as string for comparison
 *
 * @param grid Grid data
 * @param x X position
 * @param y Y position
 * @param z Z position
 * @param patternSize Size of pattern
 * @returns Pattern as string
 * @example
 */
export declare function extractPatternString(grid: any[][][], x: number, y: number, z: number, patternSize: number): string;
//# sourceMappingURL=wfc-pattern-extraction.d.ts.map