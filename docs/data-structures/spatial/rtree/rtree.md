# R-Tree

Source: `src/data-structures/spatial/rtree/`

An R-tree indexes rectangles instead of points. Each node holds between $m$ and
$M$ entries, where $m \le \lceil M/2 \rceil$, and every entry stores the minimum
bounding rectangle (MBR) of its subtree. A query descends only into MBRs that
intersect the search rectangle.

## Occupancy

The bound $m \le \lceil M/2 \rceil$ is what keeps the tree balanced after a
split. With $M$ entries per node the height is at most $\lceil \log_m n \rceil$,
so a query costs

$$
O\bigl(\log_m n + k\bigr)
$$

for $k$ reported rectangles, plus a factor that grows with MBR overlap. Overlap
is the quality metric: identical rectangles in different subtrees force both
branches to be visited.

## Insert and split

Insertion chooses the child whose MBR needs the least area enlargement:

$$
\Delta A = A(\mathrm{MBR} \cup r) - A(\mathrm{MBR}) .
$$

When a node overflows, a split partitions its entries. The implementation uses a
quadratic split, which picks the pair with the largest wasted area and assigns
the rest greedily. That is $O(M^2)$ per split, negligible for the usual $M$.

## Pitfalls

Deletion has to condense the tree: an underfull node is removed and its entries
are reinserted. Skipping condensation leaves empty branches that cost query time
and never disappear.

Bulk loading by sort-and-pack produces better-packed trees than repeated
insertion, and the difference in query time is measurable on static data.

A rectangle with zero area is legal, but a query that uses strict inequality at
both ends misses it. Use closed intervals for the containment test.

The MBR is an approximation. A tree that stores objects larger than their MBR,
or moves them without an update, returns stale answers; the refit path is the
caller's responsibility.
