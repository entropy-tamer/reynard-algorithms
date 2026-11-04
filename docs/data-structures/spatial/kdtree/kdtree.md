# K-d Tree

Source: `src/data-structures/spatial/kdtree/`

A k-d tree partitions points by axis-aligned hyperplanes. At depth $d$ the split
axis is $d \bmod k$, and the median point on that axis becomes the node. The
median split keeps the tree balanced, so a point query costs $O(\log n)$
expected and a range query costs $O(\sqrt{n} + m)$ for $m$ reported points in
the average case.

## Nearest neighbor

The search keeps a candidate set of size $k$ and a bound $\rho$, the distance to
the farthest candidate. At each node it compares the split coordinate against the
query: if

$$
|x_{\text{split}} - q_{\text{split}}| < \rho ,
$$

the far subtree can still contain a closer point and is visited. Otherwise it is
pruned. On balanced data this visits $O(\log n)$ nodes; in high dimension the
bound is weak and the search degenerates toward a linear scan.

## Range query

A box query intersects the split plane and recurses into the sides the box
overlaps. Reporting $m$ points costs $O(\sqrt{n} + m)$ on average, $O(n)$ worst
case.

## Rebuilding

`kdtree-removal.ts` marks nodes lazily instead of rebuilding on every delete.
The tree is rebuilt when the stale fraction crosses a threshold, which keeps the
amortized delete cost logarithmic and the query cost close to the fresh tree.

## Pitfalls

Duplicate coordinates make the median split ill-defined unless the build puts
equals on one side consistently. Without that rule, a large cluster of identical
points can produce an unbalanced tree.

The distance metric used for pruning has to match the metric used to rank
results. A Euclidean build with a Manhattan query still returns an answer, but
the pruning bound is no longer valid and the output can be wrong.

The dimension is fixed at construction. Adding a coordinate later changes the
meaning of every split axis, so a different data set needs a new tree.

Dynamic scenes are better served by a rebuild schedule than by per-point
insertion; insertion into a balanced k-d tree is not a logarithmic operation.
