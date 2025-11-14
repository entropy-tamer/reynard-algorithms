# Multidimensional Scaling (MDS)

MDS is a technique for visualizing similarity or dissimilarity data by finding a low-dimensional representation that preserves distances.

## Overview

MDS takes a distance matrix and finds an embedding that preserves these distances as well as possible.

## Algorithm Steps

### Classical MDS

1. **Square Distances**: Compute squared distance matrix
2. **Double-Center**: Apply double-centering to create Gram matrix
3. **Eigenvalue Decomposition**: Extract eigenvectors and eigenvalues
4. **Embedding**: Scale eigenvectors by square root of eigenvalues

### Metric MDS

Iterative optimization to minimize stress (difference between target and actual distances).

## Usage

```typescript
import { MDS } from "@entropy-tamer/reynard-algorithms";

const mds = new MDS({
  config: {
    dimensions: 2,      // Target dimensions
    classical: true,    // Use classical MDS (faster)
    maxIterations: 1000,
    tolerance: 1e-6
  }
});

const result = mds.fitTransform(distanceMatrix);
// result.embedding contains the low-dimensional coordinates
```

## Parameters

- `dimensions`: Target dimensionality (default: 2)
- `classical`: Use classical MDS (true) or metric MDS (false) (default: true)
- `maxIterations`: Maximum iterations for metric MDS (default: 1000)
- `tolerance`: Convergence tolerance (default: 1e-6)

## Notes

- Classical MDS with Euclidean distances is equivalent to PCA
- Metric MDS can handle non-Euclidean distances but is slower
- Works best when distances are approximately Euclidean

## See Also

- [Isomap Algorithm](./isomap.md)
- [PCA Algorithm](./pca.md)
