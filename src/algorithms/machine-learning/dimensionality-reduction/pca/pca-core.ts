/**
 * Principal Component Analysis (PCA) Core Implementation
 *
 * Implementation of Principal Component Analysis for dimensionality reduction.
 * PCA finds the directions of maximum variance in the data and projects
 * the data onto these directions.
 *
 * Mathematical Theory:
 * 1. Center the data: X_centered = X - mean(X)
 * 2. Compute covariance matrix: C = (1/(n-1)) * X_centered^T * X_centered
 * 3. Eigenvalue decomposition: C = V * Λ * V^T
 * 4. Project: Y = X_centered * V_p
 *
 * @module algorithms/machine-learning/dimensionality-reduction/pca
 */

import type { PCAConfig, PCAResult, PCAOptions } from "./pca-types";
import { DEFAULT_PCA_CONFIG } from "./pca-types";
import { centerMatrix, computeCovarianceMatrix, eigenvalueDecomposition } from "../shared/matrix-ops";

/**
 * Principal Component Analysis Algorithm
 *
 * Performs linear dimensionality reduction by finding the principal
 * components (directions of maximum variance) in the data.
 */
export class PCA {
  private config: PCAConfig;
  private mean?: number[];
  private scale?: number[];
  private components?: number[][];
  private explainedVariance?: number[];

  /**
   * Create a new PCA instance
   *
   * @param options Configuration options
   */
  constructor(options: PCAOptions = {}) {
    this.config = { ...DEFAULT_PCA_CONFIG, ...options.config };
  }

  /**
   * Fit PCA to data and transform it
   *
   * @param data Input data (n x m), where n is samples and m is features
   * @returns PCA result with transformed data
   */
  fitTransform(data: number[][]): PCAResult {
    const startTime = performance.now();
    const n = data.length;

    if (n === 0) {
      return {
        transformed: [],
        components: [],
        explainedVariance: [],
        explainedVarianceRatio: [],
        executionTime: performance.now() - startTime,
      };
    }

    const m = data[0].length;
    let processedData = data.map((row) => [...row]);

    // Center the data
    if (this.config.center) {
      const { centered, mean } = centerMatrix(processedData);
      processedData = centered;
      this.mean = mean;
    }

    // Scale the data
    if (this.config.scale) {
      this.scale = Array(m).fill(0);
      for (let j = 0; j < m; j++) {
        // Compute standard deviation
        let sum = 0;
        for (let i = 0; i < n; i++) {
          sum += processedData[i][j] * processedData[i][j];
        }
        const std = Math.sqrt(sum / (n - 1));
        this.scale[j] = std > 1e-10 ? std : 1;

        // Scale
        for (let i = 0; i < n; i++) {
          processedData[i][j] /= this.scale[j];
        }
      }
    }

    // Compute covariance matrix
    const covariance = computeCovarianceMatrix(processedData);

    // Eigenvalue decomposition
    const numComponents = Math.min(this.config.components, m, n - 1);
    const { eigenvalues, eigenvectors } = eigenvalueDecomposition(
      covariance,
      numComponents
    );

    // Sort by eigenvalue magnitude (descending)
    const indices = Array(eigenvalues.length)
      .fill(0)
      .map((_, i) => i);
    indices.sort((a, b) => Math.abs(eigenvalues[b]) - Math.abs(eigenvalues[a]));

    // Extract top components
    const topComponents: number[][] = Array(numComponents)
      .fill(0)
      .map(() => Array(m).fill(0));
    const topEigenvalues: number[] = [];

    for (let d = 0; d < numComponents; d++) {
      const idx = indices[d];
      topEigenvalues.push(eigenvalues[idx]);
      for (let j = 0; j < m; j++) {
        topComponents[d][j] = eigenvectors[idx][j];
      }
    }

    this.components = topComponents;
    this.explainedVariance = topEigenvalues;

    // Transform data
    const transformed: number[][] = Array(n)
      .fill(0)
      .map(() => Array(numComponents).fill(0));

    for (let i = 0; i < n; i++) {
      for (let d = 0; d < numComponents; d++) {
        let sum = 0;
        for (let j = 0; j < m; j++) {
          sum += processedData[i][j] * topComponents[d][j];
        }
        transformed[i][d] = sum;
      }
    }

    // Compute explained variance ratio
    const totalVariance = topEigenvalues.reduce((sum, v) => sum + v, 0);
    const explainedVarianceRatio = topEigenvalues.map(
      (v) => (totalVariance > 0 ? v / totalVariance : 0)
    );

    return {
      transformed,
      components: topComponents,
      explainedVariance: topEigenvalues,
      explainedVarianceRatio,
      mean: this.mean,
      scale: this.scale,
      executionTime: performance.now() - startTime,
    };
  }

  /**
   * Transform new data using fitted PCA
   *
   * @param data New data to transform
   * @returns Transformed data
   */
  transform(data: number[][]): number[][] {
    if (!this.components) {
      throw new Error("PCA must be fitted before transform");
    }

    const n = data.length;
    const m = data[0].length;
    let processedData = data.map((row) => [...row]);

    // Apply same preprocessing as fit
    if (this.mean) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
          processedData[i][j] -= this.mean[j];
        }
      }
    }

    if (this.scale) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
          processedData[i][j] /= this.scale[j];
        }
      }
    }

    // Transform
    const numComponents = this.components.length;
    const transformed: number[][] = Array(n)
      .fill(0)
      .map(() => Array(numComponents).fill(0));

    for (let i = 0; i < n; i++) {
      for (let d = 0; d < numComponents; d++) {
        let sum = 0;
        for (let j = 0; j < m; j++) {
          sum += processedData[i][j] * this.components[d][j];
        }
        transformed[i][d] = sum;
      }
    }

    return transformed;
  }

  /**
   * Update configuration
   *
   * @param config Partial configuration to update
   */
  setConfig(config: Partial<PCAConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   *
   * @returns Current configuration
   */
  getConfig(): PCAConfig {
    return { ...this.config };
  }

  /**
   * Get fitted components
   *
   * @returns Principal components
   */
  getComponents(): number[][] | undefined {
    return this.components;
  }

  /**
   * Get explained variance
   *
   * @returns Explained variance for each component
   */
  getExplainedVariance(): number[] | undefined {
    return this.explainedVariance;
  }
}

