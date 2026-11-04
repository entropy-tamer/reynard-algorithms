# Quadtree

Source: `src/data-structures/spatial/quadtree/`

A quadtree is the two-dimensional case of the octree: each node covers a square
and splits into four quadrants when it holds more than its capacity. The node
index for a point relative to the node center $(c_x, c_y)$ is

$$
\text{index} = (p_x > c_x) + 2\,(p_y > c_y),
$$

so the quadrant order is fixed and the descent is branch-free arithmetic.

## Cost

For $n$ points and depth $d$ a point query is $O(d)$. A range query visits the
quadrants that intersect the range, which is $O(\sqrt{n} + m)$ on uniform data
and $O(n)$ when all points share a quadrant. Construction by repeated insertion
is $O(n d)$.

## Queries exposed

`Quadtree` supports point lookup, rectangle and circle queries, nearest neighbor,
and a collision pass that returns candidate pairs. The circle query compares
squared distance to avoid a square root per candidate.

## Pitfalls

An object with size that straddles a quadrant boundary has to be stored in the
parent or duplicated in the children. Storing it in one child makes the query
miss it from the other side, and the defect appears only when the object moves.

Clustered points drive the tree deep. A maximum depth and a capacity together
bound memory; capacity alone does not.

The bounds are compared with $>$ and $\ge$ inconsistently in naive
implementations, which double-counts points exactly on a split line. Pick one
convention and use it in both insert and query.

Rebuilding is cheaper than incremental updates for a scene that changes every
frame; the same rebuild threshold used by the k-d tree applies here.
