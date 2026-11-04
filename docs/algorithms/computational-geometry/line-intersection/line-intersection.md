# Line Segment Intersection

Source: `src/algorithms/computational-geometry/line-intersection/`

Given a set of segments, report every pair that intersects. The pairwise test is
$O(n^2)$; the sweep-line algorithm is $O((n+k)\log n)$ for $k$ intersections,
which is output-sensitive and wins whenever $k$ is small.

## Segment intersection

For segments $p + t r$ and $q + u s$ with $t, u \in [0,1]$, the parameters are

$$
t = \frac{(q-p)\times s}{r \times s}, \qquad
u = \frac{(q-p)\times r}{r \times s},
$$

where $\times$ is the 2D cross product. A proper crossing has
$0 < t < 1$ and $0 < u < 1$; the endpoints extend the range to $[0,1]$ and
collinear overlap needs a separate interval test.

## Bentley-Ottmann

The sweep moves a vertical line left to right. Segments enter the status
structure at their left endpoint, leave at their right endpoint, and swap order
when they cross. Only segments adjacent in the status order can intersect, so the
algorithm tests $O(n + k)$ pairs instead of $O(n^2)$.

The event queue is a priority queue ordered by $x$; the status is an ordered
structure keyed by the $y$ at the sweep position. Both cost $O(\log n)$ per
event.

## Degeneracies

Vertical segments, shared endpoints and overlapping collinear segments all break
the naive ordering. The implementation handles them by grouping events at the
same $x$ and testing the group before advancing the sweep.

## Pitfalls

The cross product is a difference of products, so nearly parallel segments
produce a denominator near zero. The epsilon on $|r \times s|$ decides whether a
pair is parallel; too small and the parameters explode, too large and real
crossings are missed.

The status order changes as the sweep moves, because the $y$ of a non-vertical
segment depends on $x$. Comparing by the intersection with the sweep line, not by
the endpoint $y$, is what keeps the order consistent.

Output size matters. A scene where every segment crosses every other has
$k = O(n^2)$ and the sweep is no better than the naive test; the algorithm's
advantage is the sparse case.
