/**
 * Distance Metrics for Dimensionality Reduction
 *
 * Common distance calculation functions used across dimensionality reduction algorithms.
 *
 * @module algorithms/machine-learning/dimensionality-reduction/shared
 */

/**
 * Calculate Euclidean distance between two points
 *
 * @param a First point
 * @param b Second point
 * @returns Euclidean distance
 * @example
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Points must have the same dimensionality");
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const aVal = a[i];
    const bVal = b[i];
    if (aVal !== undefined && bVal !== undefined) {
      const diff = aVal - bVal;
      sum += diff * diff;
    }
  }
  return Math.sqrt(sum);
}

/**
 * Calculate squared Euclidean distance (faster, avoids sqrt)
 *
 * @param a First point
 * @param b Second point
 * @returns Squared Euclidean distance
 * @example
 */
export function euclideanDistanceSquared(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Points must have the same dimensionality");
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const aVal = a[i];
    const bVal = b[i];
    if (aVal !== undefined && bVal !== undefined) {
      const diff = aVal - bVal;
      sum += diff * diff;
    }
  }
  return sum;
}

/**
 * Calculate Manhattan distance between two points
 *
 * @param a First point
 * @param b Second point
 * @returns Manhattan distance
 * @example
 */
export function manhattanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Points must have the same dimensionality");
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const aVal = a[i];
    const bVal = b[i];
    if (aVal !== undefined && bVal !== undefined) {
      sum += Math.abs(aVal - bVal);
    }
  }
  return sum;
}

/**
 * Calculate Chebyshev distance between two points
 *
 * @param a First point
 * @param b Second point
 * @returns Chebyshev distance
 * @example
 */
export function chebyshevDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Points must have the same dimensionality");
  }

  let max = 0;
  for (let i = 0; i < a.length; i++) {
    const aVal = a[i];
    const bVal = b[i];
    if (aVal !== undefined && bVal !== undefined) {
      const diff = Math.abs(aVal - bVal);
      if (diff > max) {
        max = diff;
      }
    }
  }
  return max;
}

/**
 * Calculate distance matrix for a set of points
 *
 * @param points Array of points
 * @param distanceFn Distance function to use
 * @returns Distance matrix (n x n)
 * @example
 */
export function computeDistanceMatrix(
  points: number[][],
  distanceFn: (a: number[], b: number[]) => number = euclideanDistance
): number[][] {
  const n = points.length;
  const matrix: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    const pointI = points[i];
    const matrixRowI = matrix[i];
    if (!pointI || !matrixRowI) {
      continue;
    }
    for (let j = i + 1; j < n; j++) {
      const pointJ = points[j];
      const matrixRowJ = matrix[j];
      if (!pointJ || !matrixRowJ) {
        continue;
      }
      const dist = distanceFn(pointI, pointJ);
      matrixRowI[j] = dist;
      matrixRowJ[i] = dist;
    }
  }

  return matrix;
}

/**
 * Distance metric function type
 */
export type DistanceMetric = (a: number[], b: number[]) => number;
