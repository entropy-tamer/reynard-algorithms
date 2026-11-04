# Minimum Bounding Box

Source: `src/algorithms/computational-geometry/minimum-bounding-box/`

The minimum-area rectangle enclosing a point set is found by rotating calipers.
The optimal rectangle has a side collinear with an edge of the convex hull, so it
is enough to test one orientation per hull edge.

## Rotation

For a hull edge with direction $u = (\cos\theta, \sin\theta)$ and normal
$n = (-\sin\theta, \cos\theta)$, the extents of the vertex set are

$$
w(\theta) = \max_i (p_i \cdot u) - \min_i (p_i \cdot u),
\qquad
h(\theta) = \max_i (p_i \cdot n) - \min_i (p_i \cdot n),
$$

and the area is $A(\theta) = w(\theta)h(\theta)$. The calipers advance $\theta$
through the hull edge angles, updating the four extreme points as they go, so the
whole scan is $O(h)$ after the hull is built.

## Total cost

Finding the hull costs $O(n \log n)$ and the calipers add $O(h)$, so the
algorithm is dominated by the hull. A brute-force version that tests every edge
against every point is $O(n^2)$.

## Why hull edges suffice

A rectangle that touches the hull at a vertex but no edge can be rotated until a
side meets an edge without increasing its area. The area function between two
edge orientations is a smooth product of sinusoids, and its minimum on that
interval is at an endpoint. That is the argument that makes the finite candidate
set exact instead of heuristic.

## Pitfalls

Collinear hull points produce duplicate edge orientations. The scan is still
correct, but the calipers update nothing and the loop wastes iterations.

The output depends on the hull's boundary policy. A hull that dropped collinear
points has fewer edges, which is fine for area but changes the reported
orientation among ties.

Floating-point angles drift when accumulated. Recompute the direction from the
two edge endpoints instead of incrementing $\theta$, or the extremes and the
edges disagree after a few hundred points.

The minimum-perimeter box is a different problem with the same candidate set; do
not reuse the area result for it.
