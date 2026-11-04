# Wave Function Collapse

Source: `src/algorithms/procedural-generation/wave-function-collapse/`

WFC generates a grid consistent with local patterns learned from a sample or
declared by adjacency rules. Each cell holds a set of possible tiles, and the
algorithm repeatedly collapses the cell with the fewest possibilities and
propagates the consequences.

## Entropy

For a cell with tile weights $w_i$ and remaining probability mass
$W = \sum_i w_i$, the Shannon entropy is

$$
H = -\sum_i \frac{w_i}{W}\ln\frac{w_i}{W}.
$$

The cell with the lowest entropy is the most constrained, so collapsing it
resolves the most. Ties are broken by a weighted random choice, which keeps the
output from being deterministic in a way that looks patterned.

## Collapse and propagation

Collapsing picks one tile with probability proportional to its weight. Propagation
removes incompatible tiles from neighbors using the adjacency table, and repeats
along the queue of changed cells. A contradiction is an empty cell: no tile
remains, and the branch must backtrack.

## Complexity

The grid has $N$ cells and each cell has at most $T$ tiles. Propagation visits a
cell once per tile removal in the worst case, so one run is $O(NT)$ plus the cost
of the entropy queue. Backtracking multiplies that by the number of retries; a
hard instance can explore many branches, which is why `wfc-backtrack.ts` caps the
attempt count.

## Weights and patterns

Weights control the frequency of each tile. A tile with weight zero is never
chosen but can still be excluded by adjacency. Pattern extraction from a sample
counts overlapping $k \times k$ windows and derives the adjacency sets, which is
the "learn the rules from an example" mode.

## Pitfalls

A contradiction is normal, not a bug. Unsatisfiable adjacency at the border or an
over-constrained pattern set produces a dead end; the algorithm needs a backtrack
policy instead of a single pass.

The border is a separate constraint. A pattern that requires a specific edge tile
has no solution at a border that does not allow it; declare border tiles or wrap
the grid.

Weights are relative, not absolute. Doubling every weight changes nothing;
zeroing one changes the entire distribution.

The output is locally consistent, not globally meaningful. WFC matches adjacency,
not large-scale structure, so a dungeon needs a post-pass or a higher-order
pattern to get rooms instead of noise.
