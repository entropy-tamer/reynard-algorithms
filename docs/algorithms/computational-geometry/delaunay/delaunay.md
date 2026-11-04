# Delaunay Triangulation

Source: `src/algorithms/computational-geometry/delaunay/`

A triangulation of a point set is Delaunay when no point lies strictly inside the
circumcircle of any triangle. Equivalently, every triangle maximizes its minimum
angle, which is why the mesh is the default for interpolation and finite
elements.

## Empty circumcircle

For a triangle with vertices $a, b, c$ the circumcenter is the intersection of
the perpendicular bisectors, and the circumradius is

$$
R = \frac{|a-b|\,|b-c|\,|c-a|}{4A},
$$

where $A$ is the triangle area. The in-circle test for a fourth point $d$ is

$$
\begin{vmatrix}
a_x & a_y & a_x^2+a_y^2 & 1\\
b_x & b_y & b_x^2+b_y^2 & 1\\
c_x & c_y & c_x^2+c_y^2 & 1\\
d_x & d_y & d_x^2+d_y^2 & 1
\end{vmatrix} > 0
$$

for a counter-clockwise triangle, meaning $d$ is inside.

## Bowyer-Watson

Start with a super-triangle containing every point. Insert points one at a time,
find every triangle whose circumcircle contains the new point, delete them, and
retriangulate the cavity by connecting the new point to its boundary.
The cavity is star-shaped, so the retriangulation is a fan.

The naive search over all triangles costs $O(n)$ per insertion and $O(n^2)$
total. A point-location structure or a spatial sort brings the expected cost to
$O(n \log n)$.

## Counting

For $n$ points with $h$ on the hull, Euler's relation gives

$$
F = 2n - 2 - h
$$

triangles including the outer face, so the mesh has $2n - 2 - h$ triangles and
$3n - 3 - h$ edges.

## Pitfalls

The super-triangle has to be large enough that no input point lies outside it,
but not so large that its vertices dominate the circumcircle arithmetic. A
common failure is a super-triangle that is only slightly larger than the bounding
box, which leaves sliver triangles at the border after removal.

Four cocircular points make the in-circle test ambiguous. A consistent
tie-break (for example by index) keeps the triangulation deterministic; without
one, two runs on the same input can produce different meshes.

Robustness is the real cost. The determinant above loses precision for nearly
collinear triples, and a single wrong sign produces a non-manifold mesh. The
implementation uses an epsilon on the in-circle value, and constrained variants
need the same care on the edge tests.
