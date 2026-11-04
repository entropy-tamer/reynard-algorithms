# Oriented Bounding Box (OBB)

Source: `src/algorithms/collision/narrow-phase/obb/`

An oriented box is a center $c$, two orthonormal axes $u_0, u_1$ and half
extents $h_0, h_1$. The separating axis theorem for two convex polygons says two
boxes are disjoint exactly when some axis separates their projections. For box
pairs in two dimensions, the candidate axes are the four edge normals, which are
the box axes themselves.

## Projection radius

The projection of a box onto a unit axis $u$ is an interval centered at $c \cdot u$
with radius

$$
r(u) = h_0\,|u \cdot u_0| + h_1\,|u \cdot u_1| .
$$

For boxes $A$ and $B$ and axis $u$ the projections are disjoint when

$$
|(c_B - c_A) \cdot u| > r_A(u) + r_B(u).
$$

Testing the four axes is enough. If none separates, the boxes intersect, and the
axis with the smallest overlap is the minimum translation vector.

## Why four axes

Each box has two unique edge normals, and the axes of one box already cover its
own edges. For two boxes that gives four candidate directions. For general convex
polygons the candidate set is the union of both polygons' edge normals, which is
$O(n + m)$ axes.

## Transform and containment

`OBB.transform` rotates and translates the center and axes, and `OBBUtils`
provides point containment in the box frame:

$$
|(p - c) \cdot u_i| \le h_i \quad \text{for } i = 0, 1 .
$$

The same test in world space needs the inverse rotation, which is the transpose
because the axes are orthonormal.

## Pitfalls

The axes must stay orthonormal. Accumulating rotations without renormalizing
turns the projection radius into an overestimate, which makes the box fatter and
the tests conservative in a way that is hard to see.

The overlap depth is measured along a face normal, not along the center line. A
physics response that pushes along the center line produces the wrong direction
for corner contact.

Degenerate boxes with zero extent have a zero-radius projection. The separation
test then reduces to a point-versus-box test, which is correct, but the minimum
translation vector is undefined when the overlap is zero.
