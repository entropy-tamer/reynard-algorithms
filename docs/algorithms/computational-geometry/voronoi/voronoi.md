# Voronoi Diagram

Source: `src/algorithms/computational-geometry/voronoi/`

The Voronoi diagram of a site set $S$ partitions the plane into cells, one per
site, where a point belongs to the cell of the nearest site:

$$
V_i = \{\, p : |p - s_i| \le |p - s_j| \ \forall j \neq i \,\}.
$$

Each cell is the intersection of half-planes, one per other site, so it is
convex. The diagram is the dual of the Delaunay triangulation: two sites share a
Voronoi edge exactly when they share a Delaunay edge.

## Construction

Building the Delaunay triangulation first and taking its dual is the practical
route. Every Delaunay triangle has a circumcenter, and those centers are the
Voronoi vertices; every Delaunay edge separates two cells, and its dual is a
Voronoi edge. The construction therefore costs the Delaunay cost,
$O(n \log n)$ expected.

## Cell geometry

For two sites $a$ and $b$ the bisector is

$$
(p - \tfrac{a+b}{2}) \cdot (b - a) = 0 ,
$$

a line through the midpoint perpendicular to the segment. Clipping the plane by
the bisectors of all sites gives the cell, and clipping the cell to a bounding
box gives a finite polygon for rendering.

## Nearest-site queries

Point location is a nearest-neighbor query, so a k-d tree over the sites answers
it in $O(\log n)$ expected. Walking the Delaunay triangulation from a random
start also works and is $O(\sqrt{n})$ in practice.

## Pitfalls

Cocircular sites produce Voronoi vertices of degree greater than three, and the
dual construction has to merge them. Treating each Delaunay triangle separately
emits duplicate vertices and a non-manifold cell boundary.

Unbounded cells need a bounding box. Clipping to a box that is too small cuts
cells that should extend beyond it, and the visible diagram changes with the
viewport.

Floating-point circumcenters for nearly collinear triples land far outside the
site cloud. Either compute in a translated frame or reject triangles below an
area threshold and close the cell at the box.
