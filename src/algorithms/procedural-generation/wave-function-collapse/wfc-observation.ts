/**
 * @file Wave Function Collapse Observation Operations
 *
 * Handles pattern extraction, analysis, and observation
 * for the Wave Function Collapse algorithm.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */

// Pattern extraction
export { extractPatterns2D, extractPatterns3D, extractPatternString } from "./wfc-pattern-extraction";

// Entropy calculations
export { calculateEntropy, calculateEntropyFromCounts } from "./wfc-entropy";

// Grid utilities
export { getTileFrequencyDistribution, gridContainsTile, getTilePositions } from "./wfc-grid-utils";

// Analysis
export { analyzeResult } from "./wfc-analysis";
