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
 */
export function calculateEntropy(frequencies: Map<string, number>): number {
  const total = Array.from(frequencies.values()).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;

  let entropy = 0;
  for (const count of frequencies.values()) {
    const probability = count / total;
    if (probability > 0) {
      entropy -= probability * Math.log2(probability);
    }
  }

  return entropy;
}

/**
 * Calculate entropy from tile counts object
 *
 * @param counts Record of tile counts
 * @returns Entropy value
 */
export function calculateEntropyFromCounts(counts: Record<string, number>): number {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;

  let entropy = 0;
  for (const count of Object.values(counts)) {
    const probability = count / total;
    if (probability > 0) {
      entropy -= probability * Math.log2(probability);
    }
  }

  return entropy;
}












