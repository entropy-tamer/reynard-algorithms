# AABB Collision Detection

Source: `src/algorithms/collision/narrow-phase/aabb/`

An axis-aligned bounding box is the set

$$
[x_{\min}, x_{\max}] \times [y_{\min}, y_{\max}] .
$$

Two boxes overlap when their projections overlap on every axis. In two dimensions
that is four comparisons and no multiplication:

$$
a_{x\min} \le b_{x\max} \;\wedge\; b_{x\min} \le a_{x\max}
\;\wedge\;
a_{y\min} \le b_{y\max} \;\wedge\; b_{y\min} \le a_{y\max} .
$$

The function returns as soon as one axis separates, so the common disjoint case
costs one or two comparisons.

## Derived measures

Area and perimeter are

$$
A = (x_{\max}-x_{\min})(y_{\max}-y_{\min}),
\qquad
P = 2\bigl((x_{\max}-x_{\min}) + (y_{\max}-y_{\min})\bigr).
$$

The intersection box takes the inner bounds and the union takes the outer bounds.
A negative extent in the intersection means no overlap, which is the same
predicate as the comparison chain, so both forms agree.

## Batch and broad phase

`batchCollisionDetection` runs the pairwise test over a list. That is $O(n^2)$
and is the right baseline for small lists. `batchCollisionWithSpatialHash`
buckets the boxes first, so the pairwise test only runs inside a cell, which is
$O(n + k)$ expected for $k$ candidate pairs.

## Pitfalls

The comparison must be closed on both sides. A box that touches another at an
edge is a collision here; a physics engine that wants strictly positive
penetration filters those pairs afterward.

Boxes with inverted bounds (min above max) pass every test against themselves and
fail mysteriously against everything else. `expandAABB` and the validation helpers
normalize the corners, and a caller that builds boxes by hand should do the same.

Floating-point equality at the boundary is exact for the comparisons above, but a
box computed from transformed coordinates carries rounding, so an epsilon is
needed when the boxes come from different pipelines.

The spatial hash path costs more than the naive path below a few dozen boxes.
The crossover is workload-dependent; the stats include both counts so it can be
measured.
