# A* Search — Core

**Source:** `src/algorithms/pathfinding/astar/*`

## Evaluation function

\[
f(n)=g(n)+h(n),
\]

where \(g(n)\) is cost so far and \(h(n)\) is an admissible heuristic (\(h(n)\le h^*(n)\)).

## Admissibility / Optimality

If \(h\) is admissible and edge costs are non-negative, A* returns an optimal path to the goal.

## Common heuristics (grid)

- Manhattan: \(h=|x_1-x_2|+|y_1-y_2|\) (4-neighbor grids).
- Euclidean: \(h=\sqrt{(x_1-x_2)^2+(y_1-y_2)^2}\).
- Chebyshev (8-neighbor): \(h=\max(|dx|,|dy|)\).

Weighted A*:
\[
f(n)=g(n)+w\,h(n),\quad w>1
\]
trades optimality for speed.

## Complexity

Worst case \(O(b^d)\); with a consistent heuristic, each node expanded once.
Space \(O(|V|)\) for open/closed sets.

## Demo (TRELLIS)

Grid walls, seed, heuristic toggle (Manhattan/Euclidean/Dijkstra via \(h=0\)).
Explored set and path shown; animates 30 expansions/frame.

## Pitfalls

- Heuristic must not overestimate (inadmissible) or optimality is lost.
- Tie-breaking affects path shape and explored count.
- Large grids need binary heap priority queue (not array sort) for performance.
