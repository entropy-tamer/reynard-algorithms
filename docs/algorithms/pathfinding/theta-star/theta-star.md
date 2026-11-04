# Theta* Pathfinding

Source: `src/algorithms/pathfinding/theta-star/`

A* on an eight-neighbor grid produces paths with the grid's 45-degree bias. Theta*
removes the bias by allowing any node to have any other node as parent, provided
the straight segment between them does not cross an obstacle.

## Relaxation

When a node $s$ is expanded, each neighbor $s'$ is considered with two possible
parents. The grid parent is $s$, which gives

$$
g(s') = g(s) + c(s, s') .
$$

The path-2 parent is the parent of $s$, call it $p$, when the segment
$\overline{p s'}$ is clear:

$$
g(s') = g(p) + |p - s'| .
$$

Taking the minimum lets the path turn at any angle, and the resulting path is
shorter than the grid path in most open scenes.

## Line of sight

The clearance test walks the cells the segment crosses and stops at the first
blocked cell. It is a supercover-style traversal, so a segment that grazes a
corner is judged consistently with the movement rule. The test is $O(\ell)$ for a
segment of length $\ell$ and dominates the per-expansion cost.

## Optimality

Theta* is not guaranteed optimal in general. It is optimal on grids where the
line-of-sight test is exact and the cost is Euclidean; with a corner-cutting
policy or a heuristic that does not match the continuous cost, it returns a
near-optimal path. Variants such as Lazy Theta* delay the visibility test until a
node is expanded and preserve the same guarantee at a lower cost.

## Cost

Each expansion performs one visibility test per neighbor, so the cost is
$O(n \log n \cdot \ell)$. The cache (`theta-star-cache.ts`) stores the outcome of
repeated segment tests, which is where most of the time goes in a dense scene.

## Pitfalls

The visibility test must use the same blocked-cell rule as the movement. A test
that allows a diagonal squeeze while the movement forbids it produces a path that
cannot be followed.

The heuristic should be Euclidean, not octile. With any-angle movement the octile
distance is an overestimate in some directions.

Path smoothing is not the same as an any-angle search. A post-process that
simplifies a grid path can cut corners; Theta* only takes a shortcut it can see.
