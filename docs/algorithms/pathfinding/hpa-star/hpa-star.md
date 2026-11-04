# Hierarchical Pathfinding A* (HPA*)

Source: `src/algorithms/pathfinding/hpa-star/`

HPA* trades preprocessing for query speed. The grid is split into clusters; the
entrances between clusters become abstract nodes; a shortest path on the abstract
graph gives a corridor, and a low-level search refines it inside each cluster.

## Abstract graph

With cluster size $c$ there are about $(W/c)(H/c)$ clusters. Two adjacent
clusters connect at each pair of facing walkable cells, and each such pair is an
entrance. For $e$ entrances the abstract graph has $O(e)$ nodes and edges, which
is far smaller than the $O(WH)$ grid.

Building the graph costs one pass over the grid plus an intra-cluster search per
entrance pair. With a good cluster size the abstract node count is roughly
$O(WH/c^2)$, so a larger $c$ shrinks the graph and lengthens the refinement.

## Query

The hierarchy is two-level here: find the start and goal clusters, connect the
endpoints to the nearby entrances, search the abstract graph with A*, then expand
each abstract edge into its stored intra-cluster path. The output is a path that
is near-optimal, not guaranteed optimal, because the corridor restricts the
search.

## Choosing the cluster size

A cluster that is too small makes the abstract graph almost as large as the grid.
Too large and the intra-cluster search dominates. Sizes between $8$ and $32$ cells
are the usual range for games; `adaptive-clustering.ts` adjusts the size by
entrance density.

## Pitfalls

The abstract path can pass through an entrance that is narrower than the agent.
The entrance has to carry a width, or the refinement has to reject a corridor
that the agent cannot fit through.

Diagonal entrances need the corner rule from the low-level search. An abstract
edge that assumes a diagonal crossing can be refined into an impossible step.

The hierarchy is static. Terrain changes invalidate the cluster partitions and the
stored paths; the cache has to be keyed by a version, not by a frame count.

Refinement runs one low-level search per abstract edge. For a long path that is
$O(p)$ searches for $p$ edges, each bounded by the cluster size, so the total is
still below a flat A* over the whole grid.
