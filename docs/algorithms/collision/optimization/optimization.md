# Collision Detection Optimization

Source: `src/algorithms/collision/optimization/`

The pairwise collision test is $O(n^2)$. For $n$ bodies that is the cost that
dominates a frame, and the optimizer replaces it with a spatial partition plus a
narrow phase on the candidate pairs.

## Two strategies

The naive path tests every unordered pair:

$$
\binom{n}{2} = \frac{n(n-1)}{2}
$$

times. The spatial path buckets bodies by cell, tests pairs inside a cell, and
also tests each body against the neighbors of its cell when the body crosses a
boundary. For $c$ occupied cells and $k$ candidate pairs the cost is

$$
O(n + c + k),
$$

and $k$ is small when the cell size matches the body size.

## Shape dispatch

`collision-algorithms.ts` dispatches on the shape pair: box-box uses the
AABB test, circle-circle compares squared distance against the squared radius
sum, and mixed pairs use the closest-point test. The dispatch is a table lookup,
so the per-pair overhead stays below the geometry.

## Statistics

`SpatialCollisionStats` records pairs tested, pairs reported, average query time
and the cell occupancy histogram. The histogram is the diagnostic that matters:
a single cell holding most of the bodies means the cell size is too large or the
distribution is clustered.

## Pitfalls

The cell size is the whole optimization. Too large and the candidate count
approaches $n^2$; too small and the bookkeeping per body grows with the number of
cells it touches.

Bodies are inserted by their bounding box, so a rotated body needs an enclosing
AABB. Using the unrotated box misses contact at the corners.

The optimizer returns candidate pairs, not contacts. A caller that skips the
narrow phase gets false positives from boxes that share a cell but not a region.

Statistics collection is optional. Enabling it in a hot loop adds a counter
increment per pair, which is measurable at large $n$.
