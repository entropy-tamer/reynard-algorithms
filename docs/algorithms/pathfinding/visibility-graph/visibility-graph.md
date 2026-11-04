# Visibility Graph

Source: `src/algorithms/pathfinding/visibility-graph/`

A visibility graph has a node for the start, the goal and every obstacle vertex,
and an edge between two nodes when the segment joining them crosses no obstacle.
The shortest path in this graph is the shortest path in the plane around polygon
obstacles.

## Construction

For $n$ vertices the naive construction tests every pair, and each test walks the
segment against every obstacle edge. That is $O(n^3)$ with $n$ obstacles and
$O(n^2 \log n)$ with a sweep for the visibility step. The implementation builds
the graph once and reuses it while the obstacles are static.

## Why only vertices

A shortest path around polygons turns only at vertices. Any other bend can be
shortened by moving the bend toward the segment that contains it, so the optimal
path is a sequence of straight segments between vertices. That is the argument
that keeps the node set finite.

## Query

A* or Dijkstra on the graph returns the path. With $V$ vertices and $E$ edges the
query is $O((V+E)\log V)$. The graph is sparse for scattered obstacles and dense
for a maze, where almost every pair is visible.

## Pitfalls

The segment test must treat touching as blocked or unblocked consistently. A
segment that touches a polygon corner is collinear with an edge; allowing it
produces paths that graze obstacles and are unstable under small perturbations.

The graph is static. Moving an obstacle changes visibility for many pairs, and
an incremental update is a research problem; rebuild instead.

The shortest path in the plane is not the shortest path for an agent with a
radius. Either inflate the obstacles by the radius (Minkowski sum) or test the
segment against the inflated geometry.

Vertex-only paths look angular. A renderer or a steering layer smooths the
corners, which changes the length, so the reported cost is the exact cost of the
unsmoothed path.
