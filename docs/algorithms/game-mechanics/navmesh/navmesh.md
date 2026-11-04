# Navmesh

Source: `src/algorithms/game-mechanics/navmesh/`

A navigation mesh represents walkable space as a set of convex polygons. Path
finding runs on the polygon adjacency graph, and the resulting corridor is
smoothed into a path that stays inside the mesh.

## Graph and portals

Each polygon is a node, and each shared edge is a portal with two endpoints. A
path through the graph is a sequence of portals, and the funnel algorithm pulls
the path tight across them. The token is a string of vertices; at each new
portal, the algorithm advances the string while the cross product of the current
edge and the portal endpoint keeps the turn convex.

## Funnel test

With a funnel apex $a$ and edges to $l$ and $r$, a new point $p$ tightens the
left side when

$$
\operatorname{orient}(a, l, p) \le 0
$$

and the right side with the mirrored sign. Popping the string on a violation is
what removes the zigzag that a raw portal path contains.

## Cost

Building the adjacency graph is $O(e)$ for $e$ shared edges. A* over polygons is
$O(n \log n)$ in the number of polygons, and the funnel pass is $O(p)$ for $p$
portals. The path length is then close to the shortest path inside the mesh,
which is shorter than a grid path of the same resolution.

## Pitfalls

Polygons must share edges exactly. Two polygons that touch at a vertex only are
not connected, and a mesh built from a raster often has that defect along
diagonals; weld the vertices before building the graph.

The mesh must be convex for the funnel to be correct. A concave polygon needs to
be decomposed first, or the straight segment between two portal endpoints can
leave the walkable area.

The start and end points are not necessarily inside a polygon. Snap them to the
nearest polygon first, and keep the snap distance so a caller can reject a target
outside the mesh.

Height is a separate axis. A 2D navmesh under a multi-level scene needs either
per-level meshes or a height field, because two polygons can overlap in the
projection.
