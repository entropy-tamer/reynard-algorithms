/**
 * Multidimensional Scaling (MDS) Core Implementation
 *
 * Implementation of Multidimensional Scaling for dimensionality reduction.
 * MDS takes a distance matrix and finds a low-dimensional embedding that
 * preserves these distances as well as possible.
 *
 * Mathematical Theory:
 * Classical MDS uses eigenvalue decomposition of the double-centered
 * squared distance matrix to find the embedding:
 * 1. Compute squared distance matrix D^2
 * 2. Double-center: B = -0.5 * H * D^2 * H
 * 3. Eigenvalue decomposition: B = V * Λ * V^T
 * 4. Embedding: Y = V_p * sqrt(Λ_p)
 *
 * @module algorithms/machine-learning/dimensionality-reduction/mds
 */

import type { MDSConfig, MDSResult, MDSOptions } from "./mds-types";
import { DEFAULT_MDS_CONFIG } from "./mds-types";
import { doubleCenterSquaredDistanceMatrix, eigenvalueDecomposition } from "../shared/matrix-ops";

/**
 * Multidimensional Scaling Algorithm
 *
 * Transforms high-dimensional data or distance matrices into
 * lower-dimensional representations while preserving distances.
 */
export class MDS {
  private config: MDSConfig;

  /**
   * Create a new MDS instance
   *
   * @param options Configuration options
   * @example
   */
  constructor(options: MDSOptions = {}) {
    this.config = { ...DEFAULT_MDS_CONFIG, ...options.config };
  }

  /**
   * Perform MDS transformation from distance matrix
   *
   * @param distanceMatrix Distance matrix (n x n)
   * @returns MDS result with embedding
   * @example
   */
  fitTransform(distanceMatrix: number[][]): MDSResult {
    const startTime = performance.now();
    const n = distanceMatrix.length;

    if (n === 0) {
      return {
        embedding: [],
        executionTime: performance.now() - startTime,
      };
    }

    if (this.config.classical) {
      return this.classicalMDS(distanceMatrix, startTime);
    } else {
      return this.metricMDS(distanceMatrix, startTime);
    }
  }

  /**
   * Perform classical MDS using eigenvalue decomposition
   *
   * @param distanceMatrix Distance matrix
   * @param startTime Start time for performance measurement
   * @returns MDS result
   * @example
   */
  private classicalMDS(distanceMatrix: number[][], startTime: number): MDSResult {
    const n = distanceMatrix.length;

    // Square the distance matrix
    const squaredDistances: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      const row = distanceMatrix[i];
      const squaredRow = squaredDistances[i];
      if (row === undefined || squaredRow === undefined) {
        continue;
      }
      for (let j = 0; j < n; j++) {
        const dist = row[j];
        if (dist !== undefined && squaredRow[j] !== undefined) {
          squaredRow[j] = dist * dist;
        }
      }
    }

    // Double-center the squared distance matrix
    const gramMatrix = doubleCenterSquaredDistanceMatrix(squaredDistances);

    // Eigenvalue decomposition
    const { eigenvalues, eigenvectors } = eigenvalueDecomposition(gramMatrix, this.config.dimensions);

    // Sort by eigenvalue magnitude (descending)
    const indices = Array(eigenvalues.length)
      .fill(0)
      .map((_, i) => i);
    indices.sort((a, b) => {
      const valA = eigenvalues[a];
      const valB = eigenvalues[b];
      if (valA === undefined || valB === undefined) {
        return 0;
      }
      return Math.abs(valB) - Math.abs(valA);
    });

    // Extract top dimensions
    const topEigenvalues: number[] = [];
    const topEigenvectors: number[][] = Array(n)
      .fill(0)
      .map(() => Array(this.config.dimensions).fill(0));

    for (let d = 0; d < this.config.dimensions && d < indices.length; d++) {
      const idx = indices[d];
      if (idx === undefined) {
        continue;
      }
      const eigenvalue = eigenvalues[idx];
      const eigenvectorRow = eigenvectors[idx];
      if (eigenvalue !== undefined && eigenvalue > 0 && eigenvectorRow !== undefined) {
        topEigenvalues.push(eigenvalue);
        const sqrtEigenvalue = Math.sqrt(eigenvalue);
        for (let i = 0; i < n; i++) {
          const eigenvectorVal = eigenvectorRow[i];
          const topEigenvectorRow = topEigenvectors[i];
          if (eigenvectorVal !== undefined && topEigenvectorRow !== undefined && topEigenvectorRow[d] !== undefined) {
            topEigenvectorRow[d] = eigenvectorVal * sqrtEigenvalue;
          }
        }
      } else {
        // Fill with zeros if eigenvalue is non-positive
        topEigenvalues.push(0);
      }
    }

    return {
      embedding: topEigenvectors,
      eigenvalues: topEigenvalues,
      executionTime: performance.now() - startTime,
    };
  }

  /**
   * Perform metric MDS using iterative optimization
   *
   * This is a simplified implementation. For production use,
   * consider using a more robust optimization algorithm.
   *
   * @param distanceMatrix Distance matrix
   * @param startTime Start time for performance measurement
   * @returns MDS result
   * @example
   */
  private metricMDS(distanceMatrix: number[][], startTime: number): MDSResult {
    const n = distanceMatrix.length;

    // Initialize embedding randomly
    const embedding: number[][] = Array(n)
      .fill(0)
      .map(() =>
        Array(this.config.dimensions)
          .fill(0)
          .map(() => (Math.random() - 0.5) * 0.1)
      );

    let prevStress = Number.POSITIVE_INFINITY;
    const learningRate = 0.01;

    for (let iter = 0; iter < this.config.maxIterations; iter++) {
      let stress = 0;
      const gradients: number[][] = Array(n)
        .fill(0)
        .map(() => Array(this.config.dimensions).fill(0));

      // Compute stress and gradients
      for (let i = 0; i < n; i++) {
        const embeddingRowI = embedding[i];
        const gradientRowI = gradients[i];
        if (embeddingRowI === undefined || gradientRowI === undefined) {
          continue;
        }
        for (let j = i + 1; j < n; j++) {
          const embeddingRowJ = embedding[j];
          const gradientRowJ = gradients[j];
          const distanceRow = distanceMatrix[i];
          if (embeddingRowJ === undefined || gradientRowJ === undefined || distanceRow === undefined) {
            continue;
          }
          const targetDist = distanceRow[j];
          if (targetDist === undefined) {
            continue;
          }
          // Compute current distance in embedding
          let currentDist = 0;
          for (let d = 0; d < this.config.dimensions; d++) {
            const valI = embeddingRowI[d];
            const valJ = embeddingRowJ[d];
            if (valI !== undefined && valJ !== undefined) {
              const diff = valI - valJ;
              currentDist += diff * diff;
            }
          }
          currentDist = Math.sqrt(currentDist);

          const diff = currentDist - targetDist;

          if (currentDist > 1e-10) {
            // Update gradients
            for (let d = 0; d < this.config.dimensions; d++) {
              const valI = embeddingRowI[d];
              const valJ = embeddingRowJ[d];
              const gradValI = gradientRowI[d];
              const gradValJ = gradientRowJ[d];
              if (valI !== undefined && valJ !== undefined && gradValI !== undefined && gradValJ !== undefined) {
                const grad = (diff / currentDist) * (valI - valJ);
                gradientRowI[d] = gradValI + grad;
                gradientRowJ[d] = gradValJ - grad;
              }
            }
          }

          stress += diff * diff;
        }
      }

      // Update embedding
      for (let i = 0; i < n; i++) {
        const embeddingRow = embedding[i];
        const gradientRow = gradients[i];
        if (embeddingRow === undefined || gradientRow === undefined) {
          continue;
        }
        for (let d = 0; d < this.config.dimensions; d++) {
          const embeddingVal = embeddingRow[d];
          const gradientVal = gradientRow[d];
          if (embeddingVal !== undefined && gradientVal !== undefined) {
            embeddingRow[d] = embeddingVal - learningRate * gradientVal;
          }
        }
      }

      // Check convergence
      if (Math.abs(prevStress - stress) < this.config.tolerance) {
        return {
          embedding,
          stress,
          iterations: iter + 1,
          executionTime: performance.now() - startTime,
        };
      }

      prevStress = stress;
    }

    return {
      embedding,
      stress: prevStress,
      iterations: this.config.maxIterations,
      executionTime: performance.now() - startTime,
    };
  }

  /**
   * Update configuration
   *
   * @param config Partial configuration to update
   * @example
   */
  setConfig(config: Partial<MDSConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   *
   * @returns Current configuration
   * @example
   */
  getConfig(): MDSConfig {
    return { ...this.config };
  }
}
