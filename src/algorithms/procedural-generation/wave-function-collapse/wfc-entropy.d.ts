/**
 * @file Entropy Calculation Utilities
 *
 * Calculates entropy from tile frequencies and counts for Wave Function Collapse analysis.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */
/**
 * Calculate entropy from tile frequencies
 *
 * @param frequencies Map of tile frequencies
 * @returns Entropy value
 * @example
 */
export declare function calculateEntropy(frequencies: Map<string, number>): number;
/**
 * Calculate entropy from tile counts object
 *
 * @param counts Record of tile counts
 * @returns Entropy value
 * @example
 */
export declare function calculateEntropyFromCounts(counts: Record<string, number>): number;
//# sourceMappingURL=wfc-entropy.d.ts.map