# Flow Field Pathfinding

Source: `src/algorithms/pathfinding/flow-field/`

A flow field precomputes a direction for every cell on the grid, so any number of
agents can follow it with one lookup each. The work happens once per goal rather
than once per agent.

## Cost and integration fields

The cost field stores the terrain cost per cell. The integration field is the
cheapest path cost from the goal, computed by Dijkstra:

$$
I(\text{goal}) = 0, \qquad
I(c) = \min_{c' \in N(c)} \bigl(I(c') + w(c, c')\bigr),
$$

where $w$ is the cost of stepping from $c$ to $c'$. With a binary cost field the
same pass is a breadth-first search, because every step costs one.

The flow field is the discrete gradient: each cell points at the neighbor with
the smallest integration value,

$$
\vec{F}(c) = \arg\min_{c' \in N(c)} I(c') - c .
$$

Following the gradient from any reachable cell descends the integration field to
the goal, so the path is optimal for the cost model.

## Cost

Building the field is $O(N \log N)$ with a heap for $N$ cells, or $O(N)$ with a
bucket queue because the edge weights are small integers. An agent lookup is
$O(1)$ per step. The field is shared, so $m$ agents cost $O(N \log N + m)$
instead of $m$ separate searches.

## Diagonal movement

`allowDiagonal` adds eight neighbors; `diagonalOnlyWhenClear` forbids a diagonal
step that cuts a corner between two blocked cells. The corner rule matters for
movement: without it an agent can slip through a wall junction that looks closed.

## Pitfalls

The field is tied to a goal. Moving the goal invalidates it; the cache
(`flow-field-cache.ts`) keys fields by goal and cell version so a rebuilt terrain
does not reuse stale estimates.

The gradient is discrete. An agent that follows the arrow exactly moves on the
grid and looks mechanical; interpolating between the two best neighbors smooths
the path without breaking the descent.

An unreachable region has an infinite or maximum integration value. The field
reports the unreachable cells, and the agent needs a fallback instead of
following a default arrow.

A cost field with zero-cost edges breaks Dijkstra's assumption. Keep every step
positive, or use a different algorithm for the zero-cost case.
