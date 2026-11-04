# BVH (Bounding Volume Hierarchy)

Source: `src/data-structures/spatial/bvh/`

A BVH is a binary tree over bounding volumes. Leaves hold primitives, internal
nodes hold the union of their children's boxes, and a query descends only into
nodes whose box intersects the query. The tree is built by choosing a split that
minimizes the expected traversal cost.

## Surface Area Heuristic

For a node with box area $A$ and children $L$ and $R$ the estimated cost of a
ray crossing the node is

$$
C = C_t + \frac{A_L}{A} C_L + \frac{A_R}{A} C_R ,
$$

where $C_t$ is the cost of a traversal step and $C_L, C_R$ are the child costs.
Minimizing $C$ over candidate splits is the surface area heuristic. A binned
build evaluates a fixed number of bucket boundaries, which costs $O(n \log n)$
for $n$ primitives and avoids testing every possible split.

## Queries

A ray query intersects the node boxes in order of entry distance, so the nearest
hit can stop the descent early. A range query tests the box against the query
volume and recurses. Expected cost for both is $O(\log n)$ on well-distributed
data, with $O(n)$ worst case when the boxes overlap heavily.

`bvh-refit.ts` updates the boxes after primitives move without rebuilding the
topology. Refit costs $O(n)$ and is the right choice for a single frame of small
motion; repeated refits without a rebuild degrade the split quality, because the
topology still reflects the old distribution.

## Pitfalls

A ray that starts inside a box or is exactly parallel to a slab needs an epsilon
on the interval comparisons. Without it, the entry distance can be signed
incorrectly and the primitive is skipped.

Splitting on the centroid instead of the primitive bounds keeps the children
disjoint in the split axis, which is what makes the traversal order meaningful.

An empty child is legal only if the split is adjusted; a node with one empty side
turns the tree into a list and the query cost into $O(n)$.

Floating-point bounds are conservative. A box that is one ulp too small produces
a missed hit that is very hard to reproduce, so the build pads the bounds.
