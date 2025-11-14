# Isomap Algorithm

Isomap (Isometric Mapping) is a non-linear dimensionality reduction technique that preserves geodesic distances on the data manifold.

## Overview

Isomap extends Multidimensional Scaling (MDS) to non-linear manifolds by replacing Euclidean distances with geodesic distances approximated via shortest paths on a k-nearest neighbor graph.

## Algorithm Steps

1. **Construct k-NN Graph**: Build a k-nearest neighbor graph from the input data
2. **Compute Geodesic Distances**: Use Dijkstra's algorithm to compute shortest paths between all pairs of points
3. **Apply MDS**: Use classical MDS on the geodesic distance matrix to obtain the embedding

## Usage

```typescript
import { Isomap } from "@entropy-tamer/reynard-algorithms";

const isomap = new Isomap({
  config: {
    k: 5,              // Number of nearest neighbors
    dimensions: 2,     // Target dimensions
    checkConnectivity: true
  }
});

const result = isomap.fitTransform(data);
// result.embedding contains the low-dimensional coordinates
```

## Parameters

- `k`: Number of nearest neighbors (default: 5)
- `dimensions`: Target dimensionality (default: 2)
- `distanceMetric`: Distance function (default: euclideanDistance)
- `checkConnectivity`: Whether to verify graph connectivity (default: true)

## Limitations

- Requires connected graph (increase k if disconnected)
- Computationally expensive for large datasets (O(n²) for shortest paths)
- Sensitive to k parameter choice
- Assumes single connected manifold

## See Also

- [MDS Algorithm](./mds.md)
- [PCA Algorithm](./pca.md)
