# Convex Hull

Source: `src/algorithms/computational-geometry/convex-hull/`

The convex hull of a point set $P$ is the smallest convex set containing $P$. In
the plane it is a convex polygon whose vertices are a subset of $P$, ordered
counter-clockwise.

## Orientation

The primitive is the signed area of a triangle, the cross product of two edge
vectors:

$$
\operatorname{orient}(a,b,c) =
(b_x-a_x)(c_y-a_y) - (b_y-a_y)(c_x-a_x).
$$

A positive value is a left turn, negative a right turn, zero collinear. Every
hull algorithm is a sequence of these tests.

## Algorithms provided

Graham scan sorts by polar angle around the lowest point and maintains a stack,
popping while the last turn is not a left turn. It costs $O(n \log n)$, dominated
by the sort.

Jarvis march (gift wrapping) starts at the lowest point and repeatedly picks the
most counter-clockwise point. It costs $O(nh)$ for $h$ hull vertices, which wins
when $h$ is small.

QuickHull partitions points by the side of a line and recurses on the farthest
point. Expected $O(n \log n)$, worst $O(n^2)$ on adversarial input.

## Collinear points

The predicate decides the boundary policy. With `> 0` a collinear point is
removed and the hull has no three collinear vertices; with `>= 0` it is kept and
the hull includes the edge points. Both are valid hulls, and mixing the two
inside one algorithm produces a self-intersecting boundary.

## Cost

| Algorithm | Average | Worst |
| --- | --- | --- |
| Graham scan | $O(n \log n)$ | $O(n \log n)$ |
| Jarvis march | $O(nh)$ | $O(n^2)$ |
| QuickHull | $O(n \log n)$ | $O(n^2)$ |

## Pitfalls

Fewer than three distinct points has no polygon. The output reports a degenerate
hull instead of an empty list, and a caller that assumes a polygon will index
past the end.

The sort key is the polar angle, which is not monotone across the branch cut at
$\pi$. Subtract the pivot before sorting, or sort by half-plane and then by cross
product.

Duplicate points survive the sort and produce zero-length edges. Deduplicate
first, or make the orientation test strict enough to pop them.
