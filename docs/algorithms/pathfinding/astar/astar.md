# A* Search

Source: `src/algorithms/pathfinding/astar/`

A* is best-first search with an estimate of the remaining cost. Each node $n$ has

$$
f(n) = g(n) + h(n),
$$

where $g(n)$ is the cost of the path from the start and $h(n)$ estimates the
cost from $n$ to the goal. The open set is a priority queue keyed by $f$, and the
node with the smallest $f$ is expanded.

## Admissibility and consistency

A heuristic is admissible when it never overestimates:

$$
h(n) \le h^*(n),
$$

the true remaining cost. With non-negative edge costs, admissible $h$ makes A*
return an optimal path. A stronger condition is consistency:

$$
h(n) \le c(n, n') + h(n'),
$$

which also guarantees that each node is expanded once when the closed set is
used. The Manhattan, Euclidean and Chebyshev heuristics are consistent on the
grids they describe.

## Grid heuristics

$$
h_{\text{Manhattan}} = |x_1-x_2| + |y_1-y_2|
$$

for four-neighbor movement, $h_{\text{Euclidean}} = \sqrt{dx^2+dy^2}$ for free
movement, and $h_{\text{Chebyshev}} = \max(|dx|,|dy|)$ for eight-neighbor
movement with uniform diagonal cost.

Weighted A* uses $f = g + w h$ with $w > 1$. It trades optimality for speed and
returns a path within a factor $w$ of optimal.

## Cost

With branching factor $b$ and solution depth $d$ the worst case expands
$O(b^d)$ nodes and stores $O(b^d)$ in the open and closed sets. With a consistent
heuristic the expansion count is bounded by the number of nodes with
$f(n) \le C^*$, which is the effective measure. The open set is a binary heap, so
each expansion costs $O(\log n)$.

## Pitfalls

An inadmissible heuristic still finds a path, just not the shortest one. A tie
broken toward the goal can look better and be worse.

The closed set must store the best $g$ seen. Marking a node closed on first
expansion is only correct with a consistent heuristic; otherwise a cheaper path
can be found later and ignored.

Tie-breaking changes the explored shape. Preferring larger $g$ among equal $f$
usually reduces the expansion count on open grids.

The heuristic must match the movement model. A Manhattan heuristic with diagonal
movement overestimates, which is inadmissible.
