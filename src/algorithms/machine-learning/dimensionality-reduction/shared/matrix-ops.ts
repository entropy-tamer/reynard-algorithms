/**
 * Matrix Operations for Dimensionality Reduction
 *
 * Matrix operations including eigenvalue decomposition, centering, and other
 * linear algebra utilities used in dimensionality reduction algorithms.
 *
 * @module algorithms/machine-learning/dimensionality-reduction/shared
 */

/**
 * Center a matrix by subtracting the mean from each column
 *
 * @param matrix Input matrix (n x m)
 * @returns Centered matrix and mean vector
 */
export function centerMatrix(matrix: number[][]): {
  centered: number[][];
  mean: number[];
} {
  const n = matrix.length;
  const m = matrix[0].length;

  // Calculate mean for each column
  const mean: number[] = Array(m).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      mean[j] += matrix[i][j];
    }
  }
  for (let j = 0; j < m; j++) {
    mean[j] /= n;
  }

  // Center the matrix
  const centered: number[][] = Array(n)
    .fill(0)
    .map(() => Array(m).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      centered[i][j] = matrix[i][j] - mean[j];
    }
  }

  return { centered, mean };
}

/**
 * Compute covariance matrix
 *
 * @param matrix Centered matrix (n x m)
 * @returns Covariance matrix (m x m)
 */
export function computeCovarianceMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  const m = matrix[0].length;
  const cov: number[][] = Array(m)
    .fill(0)
    .map(() => Array(m).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = i; j < m; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += matrix[k][i] * matrix[k][j];
      }
      const value = sum / (n - 1);
      cov[i][j] = value;
      cov[j][i] = value;
    }
  }

  return cov;
}

/**
 * Double-center a squared distance matrix to produce a Gram matrix
 *
 * This is used in classical MDS. The formula is:
 * B = -0.5 * H * D^2 * H
 * where H = I - (1/n) * 1 * 1^T is the centering matrix
 *
 * @param distanceMatrixSquared Squared distance matrix (n x n)
 * @returns Gram matrix (n x n)
 */
export function doubleCenterSquaredDistanceMatrix(
  distanceMatrixSquared: number[][]
): number[][] {
  const n = distanceMatrixSquared.length;

  // Compute row and column means
  const rowMeans: number[] = Array(n).fill(0);
  const colMeans: number[] = Array(n).fill(0);
  let grandMean = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rowMeans[i] += distanceMatrixSquared[i][j];
      colMeans[j] += distanceMatrixSquared[i][j];
      grandMean += distanceMatrixSquared[i][j];
    }
  }

  for (let i = 0; i < n; i++) {
    rowMeans[i] /= n;
    colMeans[i] /= n;
  }
  grandMean /= n * n;

  // Double-center: B = -0.5 * (D^2 - row_means - col_means + grand_mean)
  const gram: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      gram[i][j] = -0.5 * (distanceMatrixSquared[i][j] - rowMeans[i] - colMeans[j] + grandMean);
    }
  }

  return gram;
}

/**
 * Simple eigenvalue decomposition using power iteration
 *
 * For production use, consider using a more robust library like ml-matrix.
 * This is a simplified implementation for educational purposes.
 *
 * @param matrix Symmetric matrix (n x n)
 * @param numComponents Number of components to extract
 * @returns Eigenvalues and eigenvectors
 */
export function eigenvalueDecomposition(
  matrix: number[][],
  numComponents: number
): {
  eigenvalues: number[];
  eigenvectors: number[][];
} {
  const n = matrix.length;
  const eigenvalues: number[] = [];
  const eigenvectors: number[][] = [];

  // For simplicity, we'll use a basic power iteration approach
  // In production, use a proper eigenvalue decomposition library
  const maxIterations = 100;
  const tolerance = 1e-6;

  // Extract top numComponents eigenvalues/eigenvectors
  for (let comp = 0; comp < numComponents && comp < n; comp++) {
    // Initialize random vector
    let v: number[] = Array(n)
      .fill(0)
      .map(() => Math.random() - 0.5);
    let norm = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
    v = v.map((x) => x / norm);

    // Deflate previous eigenvectors if any
    for (let prev = 0; prev < comp; prev++) {
      const prevVec = eigenvectors[prev];
      const dot = v.reduce((sum, x, i) => sum + x * prevVec[i], 0);
      v = v.map((x, i) => x - dot * prevVec[i]);
      norm = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
      if (norm > 1e-10) {
        v = v.map((x) => x / norm);
      }
    }

    // Power iteration
    let prevEigenvalue = 0;
    for (let iter = 0; iter < maxIterations; iter++) {
      // Multiply by matrix: v = A * v
      const newV: number[] = Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          newV[i] += matrix[i][j] * v[j];
        }
      }

      // Compute eigenvalue (Rayleigh quotient)
      const eigenvalue = Math.sqrt(
        newV.reduce((sum, x) => sum + x * x, 0)
      );

      // Normalize
      norm = eigenvalue;
      if (norm > 1e-10) {
        v = newV.map((x) => x / norm);
      } else {
        break;
      }

      // Check convergence
      if (Math.abs(eigenvalue - prevEigenvalue) < tolerance) {
        break;
      }
      prevEigenvalue = eigenvalue;
    }

    eigenvalues.push(prevEigenvalue);
    eigenvectors.push([...v]);
  }

  return { eigenvalues, eigenvectors };
}

/**
 * Matrix multiplication: C = A * B
 *
 * @param a Matrix A (n x m)
 * @param b Matrix B (m x p)
 * @returns Matrix C (n x p)
 */
export function matrixMultiply(a: number[][], b: number[][]): number[][] {
  const n = a.length;
  const m = a[0].length;
  const p = b[0].length;

  if (b.length !== m) {
    throw new Error("Matrix dimensions do not match for multiplication");
  }

  const result: number[][] = Array(n)
    .fill(0)
    .map(() => Array(p).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < m; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }

  return result;
}

/**
 * Transpose a matrix
 *
 * @param matrix Input matrix (n x m)
 * @returns Transposed matrix (m x n)
 */
export function transpose(matrix: number[][]): number[][] {
  const n = matrix.length;
  const m = matrix[0].length;
  const result: number[][] = Array(m)
    .fill(0)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      result[j][i] = matrix[i][j];
    }
  }

  return result;
}

