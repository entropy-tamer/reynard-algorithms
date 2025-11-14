# Principal Component Analysis (PCA)

PCA is a linear dimensionality reduction technique that finds the directions of maximum variance in high-dimensional data.

## Overview

PCA projects data onto principal components (eigenvectors of the covariance matrix) ordered by explained variance.

## Algorithm Steps

1. **Center Data**: Subtract mean from each feature
2. **Compute Covariance**: Calculate covariance matrix
3. **Eigenvalue Decomposition**: Find eigenvectors and eigenvalues
4. **Project**: Transform data using top eigenvectors

## Usage

```typescript
import { PCA } from "@entropy-tamer/reynard-algorithms";

const pca = new PCA({
  config: {
    components: 2,    // Number of principal components
    center: true,     // Center the data
    scale: false      // Scale the data
  }
});

const result = pca.fitTransform(data);
// result.transformed contains the projected data
// result.components contains the principal components
// result.explainedVarianceRatio shows variance explained by each component
```

## Parameters

- `components`: Number of principal components (default: 2)
- `center`: Whether to center data (default: true)
- `scale`: Whether to scale data (default: false)

## See Also

- [Isomap Algorithm](./isomap.md)
- [MDS Algorithm](./mds.md)
