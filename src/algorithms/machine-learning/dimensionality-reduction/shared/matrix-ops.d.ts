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
 * @example
 */
export declare function centerMatrix(matrix: number[][]): {
    centered: number[][];
    mean: number[];
};
/**
 * Compute covariance matrix
 *
 * @param matrix Centered matrix (n x m)
 * @returns Covariance matrix (m x m)
 * @example
 */
export declare function computeCovarianceMatrix(matrix: number[][]): number[][];
/**
 * Double-center a squared distance matrix to produce a Gram matrix
 *
 * This is used in classical MDS. The formula is:
 * B = -0.5 * H * D^2 * H
 * where H = I - (1/n) * 1 * 1^T is the centering matrix
 *
 * @param distanceMatrixSquared Squared distance matrix (n x n)
 * @returns Gram matrix (n x n)
 * @example
 */
export declare function doubleCenterSquaredDistanceMatrix(distanceMatrixSquared: number[][]): number[][];
/**
 * Simple eigenvalue decomposition using power iteration
 *
 * For production use, consider using a more robust library like ml-matrix.
 * This is a simplified implementation for educational purposes.
 *
 * @param matrix Symmetric matrix (n x n)
 * @param numComponents Number of components to extract
 * @returns Eigenvalues and eigenvectors
 * @example
 */
export declare function eigenvalueDecomposition(matrix: number[][], numComponents: number): {
    eigenvalues: number[];
    eigenvectors: number[][];
};
/**
 * Matrix multiplication: C = A * B
 *
 * @param a Matrix A (n x m)
 * @param b Matrix B (m x p)
 * @returns Matrix C (n x p)
 * @example
 */
export declare function matrixMultiply(a: number[][], b: number[][]): number[][];
/**
 * Transpose a matrix
 *
 * @param matrix Input matrix (n x m)
 * @returns Transposed matrix (m x n)
 * @example
 */
export declare function transpose(matrix: number[][]): number[][];
//# sourceMappingURL=matrix-ops.d.ts.map