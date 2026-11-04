# Isomap

Source: `src/algorithms/machine-learning/dimensionality-reduction/isomap/`

Isomap extends MDS to curved manifolds. Instead of Euclidean distances it uses
geodesic distances along the data, estimated by shortest paths on a
nearest-neighbor graph.

## Algorithm

Build a $k$-nearest-neighbor or $\varepsilon$-neighborhood graph with Euclidean
edge weights. Compute all-pairs shortest paths, by Dijkstra from each source or by
Floyd-Warshall. Feed the resulting distance matrix to classical MDS.

The geodesic estimate is

$$
d_G(i,j) = \min_{\pi} \sum_{(u,v) \in \pi} |x_u - x_v| ,
$$

the shortest path over graph edges. On a densely sampled manifold the graph
distance converges to the true geodesic as the sampling grows.

## Cost

The $k$-NN graph costs $O(n^2 d)$ naively, or $O(n \log n)$ with a k-d tree.
All-pairs shortest paths cost $O(n^2 \log n)$ with $n$ Dijkstra runs, or
$O(n^3)$ with Floyd-Warshall. The final MDS adds $O(n^3)$. The distance matrix is
$O(n^2)$ memory and is the practical limit.

## The neighborhood parameter

Too small a $k$ disconnects the graph, and the shortest path between components
is infinite. Too large a $k$ creates shortcuts between folds of the manifold,
which shorten the geodesic and flatten the embedding. The package exposes a
connectivity check (`isGraphConnected`) so the failure is detected instead of
inferred from a strange picture.

## Pitfalls

A disconnected graph makes the distance matrix contain infinities. The MDS step
then produces NaN or a collapsed embedding; reconnect or drop the component.

Shortcuts are the characteristic failure. A single edge across a fold makes two
distant parts of the manifold look adjacent, and the embedding is wrong in a way
that looks plausible.

Isomap is sensitive to noise. A noisy point adds edges that shorten paths, so
denoise or increase $k$ with care.

The method assumes a single connected manifold. Several clusters need a
per-cluster embedding or a different algorithm.
