# Polygon Clipping

Source: `src/algorithms/computational-geometry/polygon-clipping/`

Clipping computes the part of a subject polygon inside a clip polygon.
Sutherland-Hodgman handles a convex clip polygon in $O(nm)$; Weiler-Atherton
handles a concave clip polygon by walking the intersection graph.

## Sutherland-Hodgman

Clip the subject against one clip edge at a time. For each subject edge
$s \to e$ and clip half-plane, emit

- $e$ if both endpoints are inside,
- the intersection if the edge crosses inward,
- nothing if both are outside.

After $m$ clip edges the output is the clipped polygon. Each pass costs $O(n)$,
so the total is $O(nm)$.

## Inside test

For a clip edge with outward normal $n$ and point $q$ on the edge, the signed
distance is

$$
d(p) = n \cdot (p - q).
$$

Inside means $d \le 0$ with the orientation convention of the clip ring. The
intersection parameter on the segment is

$$
t = \frac{d(s)}{d(s) - d(e)} .
$$

## Weiler-Atherton

Both polygons contribute vertices and intersection points. The algorithm links
them into a graph, walks the boundary alternating between subject and clip at
each crossing, and collects the rings that lie inside. It handles concave clips
and produces multiple output rings, at the cost of a more involved
implementation.

## Pitfalls

Sutherland-Hodgman produces degenerate edges when the subject is concave and the
clip cuts it into disconnected pieces. The output is a single ring with
zero-width bridges, which is visually wrong for a renderer that fills it. Use the
Weiler-Atherton path when the clip can disconnect the subject.

Intersections that land exactly on a clip vertex are counted twice or not at
all. A consistent half-open rule on the inside test is what makes the output
deterministic.

The clip polygon must be convex for Sutherland-Hodgman; a concave clip produces
regions outside the clip. That is the most common misuse of the algorithm.
