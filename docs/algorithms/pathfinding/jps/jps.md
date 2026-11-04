# Jump Point Search (JPS)

Source: `src/algorithms/pathfinding/jps/`

JPS is A* on a uniform grid with one addition: it prunes symmetric paths. When
moving in a direction, many paths reach the same cell and differ only by
order. JPS jumps over those cells and only expands a node where the path is
forced to change direction.

## Pruning rule

From a node reached by a cardinal move, the natural neighbor in the same
direction is the only successor, unless a forced neighbor exists. From a
diagonal move both the diagonal and the two adjacent cardinals are successors. A
forced neighbor appears when an obstacle beside the movement direction makes the
straight path invalid, so the step that avoids it is the only continuation.

The rule removes the $O(1)$ duplicate expansions per cell that plain A* performs
on open ground, which on a uniform-cost grid is most of them.

## Jumping

A jump advances in a direction and stops at

- a cell with a forced neighbor (a jump point),
- a cell that reaches the goal,
- a wall.

For a diagonal direction the jump recurses one step cardinally before continuing,
so a jump point hidden behind a diagonal is found. The scan is $O(\ell)$ for a
jump of length $\ell$; the total cost is $O(n \log n)$ in the number of jump
points, which is much smaller than the number of cells.

## Optimality

JPS preserves A* optimality on a uniform-cost grid with an admissible heuristic,
because every pruned path is dominated by a path through the jump point. The
argument depends on the cost model: JPS with non-uniform terrain costs or with a
non-grid movement model is not the same algorithm.

## Pitfalls

The forced-neighbor test is directional and asymmetric. A table that is not
transposed for the four directions produces paths that cut corners.

Diagonal movement must use the same corner rule as the grid movement. If a
diagonal step is allowed to squeeze between two walls, the pruning rule's
dominance argument fails.

The heuristic has to match the cost model. Octile distance is the right one for
eight-neighbor movement with diagonal cost $\sqrt 2$; Manhattan is not.

JPS is a grid algorithm. A navigation mesh needs a different technique, because
the symmetry it exploits does not exist in an irregular graph.
