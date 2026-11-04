# Polygon Booleans and Simplification

Source: `src/algorithms/computational-geometry/polygon/`

Boolean operations combine two polygons into their union, intersection or
difference. Simplification reduces the vertex count while keeping the shape
within a tolerance. Both start from the same representation: a closed ring of
vertices with a consistent orientation.

## Signed area and orientation

The signed area of a ring is the shoelace sum

$$
A = \frac{1}{2}\sum_{i=0}^{n-1} (x_i y_{i+1} - x_{i+1} y_i),
$$

with indices modulo $n$. A positive value is counter-clockwise. The sign is the
orientation, and booleans depend on it: an outer ring and a hole have opposite
signs.

## Boolean pipeline

The operation splits every edge of $A$ at its intersections with $B$, classifies
each resulting edge as inside, outside or on the boundary of the other polygon,
and keeps the edges the operation asks for. The kept edges form closed rings
after a traversal that matches endpoints. Even-odd and nonzero fill rules differ
in how they treat nested rings, and the output records the rule that was used.

## Simplification

Douglas-Peucker keeps the endpoints of a polyline and recursively keeps the vertex
farthest from the chord when that distance exceeds a tolerance $\varepsilon$:

$$
d(p, \overline{ab}) = \frac{|(b-a)\times(p-a)|}{|b-a|} .
$$

The recursion visits each vertex once, so it costs $O(n \log n)$ on balanced
input and $O(n^2)$ in the worst case. Visvalingam-Whyatt instead removes the
vertex with the smallest triangle area, which is $O(n \log n)$ with a heap and
preserves the visual weight better at low vertex counts.

## Pitfalls

Self-intersecting input has no well-defined inside. The boolean path detects it
and either rejects the polygon or normalizes it first; silently proceeding
produces rings that cross and areas that do not add up.

Collinear consecutive vertices break the edge classification, because the normal
is undefined. Remove them before the boolean, or the intersection parameters
divide by zero.

Holes are separate rings with opposite orientation. A result that concatenates
all rings into one list loses the containment relation, and rendering it with the
nonzero rule fills the holes.

Simplification tolerance is in world units. A tolerance chosen for a large
polygon erases the detail of a small one, so scale it with the feature size.
