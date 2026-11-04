# Octree

Source: `src/data-structures/spatial/octree/`

An octree subdivides a cubic root volume into eight octants at each level. A node
holds points or objects until it exceeds a capacity, then splits and redistributes.
With maximum depth $d$ the grid has at most $8^d$ leaves, so the depth is the
memory bound.

## Subdivision

A point $p$ inside a node with center $c$ and half-size $h$ maps to an octant by
three comparisons:

$$
\text{index} = (p_x > c_x) + 2\,(p_y > c_y) + 4\,(p_z > c_z) .
$$

The child center and half-size are updated by moving $h/2$ along each axis. The
same rule is used for insertion, lookup and ray traversal.

## Queries

A point query descends one path, $O(d)$. A range or sphere query tests the node
bounds and recurses into the octants the volume overlaps; the cost is
$O(d + m)$ for a well-distributed set and $O(n)$ when the objects cluster into
one corner. Ray casting uses a 3D DDA over the occupied octants.

## Voxel and frustum work

`octree-voxel.ts` treats a full-depth node as a voxel and exposes occupancy
tests. `octree-frustum.ts` culls nodes against the six frustum planes, which is
where the tree pays for itself in a renderer: whole subtrees leave the pipeline
after six plane tests.

## Pitfalls

The root bounds have to contain every insert. An object outside the root is
either rejected or grown into the root, and the two policies give different
query results at the boundary.

Splitting on capacity alone produces deep trees for clustered data. Pair it with
a maximum depth, or the memory grows with the depth instead of with the number
of objects.

Objects with extent are not points. Storing a box in one octant is correct only
if the box fits; otherwise it belongs in the parent or in every overlapped child,
and the query has to deduplicate the reports.

Depth and capacity are a trade, not a default. A tree that splits at four objects
to depth sixteen spends most of its memory on empty nodes.
