# Force-Directed Graph Layout

Source: `src/algorithms/graph/`

A force-directed layout treats the graph as a physical system: edges pull their
endpoints together, all pairs push apart, and the simulation settles into an
arrangement where the drawing is readable. The classic formulation is
Fruchterman-Reingold.

## Forces

With an ideal edge length

$$
k = \sqrt{\frac{A}{n}}
$$

for layout area $A$ and $n$ vertices, the repulsive force between every pair is

$$
f_r(d) = \frac{k^2}{d},
$$

and the attractive force along an edge is

$$
f_a(d) = \frac{d^2}{k}.
$$

Both are applied along the unit vector between the points, repulsion away and
attraction toward. The $k^2/d$ and $d^2/k$ pair is chosen so both forces equal $k$
at $d = k$, which is why the layout spreads to roughly that spacing.

## Annealing

A temperature $T$ starts high and cools each iteration. A displacement is clamped
to $T$, so early steps move vertices far and later steps refine. A linear or
exponential cooling schedule both work; the stopping condition is a small
temperature or a displacement below a threshold.

## Cost

The repulsive term is $O(n^2)$ per iteration, which dominates. Barnes-Hut
approximation reduces it to $O(n \log n)$ by treating distant clusters as one
mass. The implementation evaluates the exact sum, so layouts above a few
thousand vertices need either a spatial approximation or a fixed iteration count.

## Pitfalls

Disconnected components have nothing pulling them together, so they drift apart
under repulsion alone. Add a weak centering force or lay out each component
separately and pack the results.

Coincident vertices produce a zero-distance division. Perturb them by a small
random offset before the first iteration, or the force is NaN from the start.

The layout is not deterministic unless the initial positions and the random seed
are fixed. Two runs on the same graph produce different drawings, which is fine
for exploration and wrong for a snapshot test.

The layout minimizes energy, not a readability metric. Edge crossings and node
overlap can still occur; post-processing or a different force model is needed for
publication-quality drawings.
