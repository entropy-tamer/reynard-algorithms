# Ear Clipping Triangulation

Source: `src/algorithms/computational-geometry/triangulation/ear-clipping/`

Ear clipping triangulates a simple polygon by repeatedly removing an ear: a
triangle of three consecutive vertices that is convex and contains no other
vertex. Removing an ear preserves simplicity, so the process terminates with
$n-2$ triangles.

## Ear test

With vertices $a, b, c$ consecutive and the polygon counter-clockwise, the
triangle is convex when

$$
\operatorname{orient}(a,b,c) > 0 .
$$

It is an ear when no other polygon vertex $p$ lies strictly inside:

$$
p \in \triangle abc .
$$

Point-in-triangle is three orientation tests with the same sign.

## Cost

A naive scan tests every vertex, and each test scans the remaining vertices, so
the cost is $O(n^2)$ for $n$ vertices. Maintaining a linked list of vertices and
candidate ears brings the typical case near $O(n)$, with $O(n^2)$ remaining for
polygons that produce few ears.

## Holes

A polygon with holes is bridged into one simple ring by connecting each hole to
the outer boundary with a pair of coincident edges. The bridge vertices appear
twice, and the triangulation emits zero-area triangles along the bridge that the
caller drops.

## Pitfalls

The winding must be consistent. A clockwise ring makes every ear test fail, and
the algorithm reports no ears on a perfectly valid polygon.

Collinear vertices produce zero-area ears. The orientation test returns zero,
which is neither convex nor reflex, so the vertex is skipped instead of removed;
a polygon made of collinear runs then never shrinks.

A point exactly on an ear edge is inside or outside depending on the strictness
of the test. Use a consistent boundary rule across all three edges or the
triangulation can overlap itself.

Self-intersecting input has no ear decomposition. The validation helper reports
the intersection instead of looping until the vertex list is empty.
