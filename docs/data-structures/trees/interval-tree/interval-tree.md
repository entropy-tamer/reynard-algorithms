# Interval Tree

Source: `src/data-structures/trees/interval-tree/`

An interval tree is a balanced binary search tree over interval start points,
augmented with the maximum endpoint in each subtree. The augmentation is what
lets a query discard a whole subtree: if its maximum endpoint is below the query
start, no interval in it can overlap.

## Overlap

Two closed intervals $a = [a_1, a_2]$ and $b = [b_1, b_2]$ overlap exactly when

$$
a_1 \le b_2 \;\wedge\; b_1 \le a_2 .
$$

The query walks the tree, reports every interval that satisfies the predicate,
and prunes a subtree when its stored maximum satisfies

$$
\max_{\text{subtree}} a_2 < b_1 .
$$

With $k$ reported intervals the cost is $O(\log n + k)$ on a balanced tree.

## Balancing

The tree is an AVL tree keyed by start, with rotations that maintain both the
height and the augmented maximum. Insertion, deletion and lookup are
$O(\log n)$.

## Stabbing and range queries

A stabbing query is the single-point case $b_1 = b_2 = x$. A range query returns every
interval that intersects $[x_1, x_2]$, which is the same predicate with both
bounds. The output carries the overlap extent so a caller can rank by how much
of the query is covered.

## Pitfalls

Closed versus open endpoints change the output at the boundary. The class uses
closed intervals; an open interval $[a, b)$ has to be represented with a small
epsilon or with the half-open variant, and mixing the two silently drops
touching intervals.

Equal start points are ordered by end point, or the tree becomes a list. The
comparator has to be total, including the tie case.

The stored maximum is invalid after an in-place endpoint change. Mutating an
interval requires a delete and reinsert, or a full rebuild.

Serialization writes the intervals, not the tree shape; restoring rebuilds the
balance, which is faster than replaying rotations.
