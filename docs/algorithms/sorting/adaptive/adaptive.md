# Adaptive Sorting Algorithms

Source: `src/algorithms/sorting/adaptive/`

An adaptive sort exploits existing order. The measure is the number of inversions
or the number of runs, and the cost improves when the input is already partly
sorted.

## Inversions and runs

The inversion count is

$$
I = \#\{(i,j) : i < j \ \wedge\ a_i > a_j\}.
$$

Insertion sort costs $O(n + I)$, which is why it is linear on a sorted array.
Natural merge sort counts runs: maximal non-decreasing segments are merged
pairwise, so the cost is

$$
O\bigl(n\log r\bigr)
$$

for $r$ runs, which is $O(n)$ when the input is one run.

## Smoothsort

Smoothsort is a heap variant due to Dijkstra. It maintains a forest of Leonardo
trees, whose sizes follow

$$
L(k) = L(k-1) + L(k-2) + 1, \qquad L(0)=L(1)=1 .
$$

The forest is a set of heaps with sizes that sum to the number of elements. The
best case, on sorted input, is $O(n)$; the worst case is $O(n\log n)$; it is in
place and not stable. The Leonardo structure is what lets an already-sorted array
be recognized without the $n\log n$ comparisons a binary heap pays.

## Adaptive quick sort

An adaptive quick sort detects existing runs and falls back to insertion sort
below a threshold. The partition still costs $O(n\log n)$ on random input, but the
small-subarray cutoff removes most of the recursion overhead.

## Pitfalls

Adaptivity is not free on the worst case. Smoothsort retains the $O(n\log n)$
bound, but an adaptive merge that allocates a run index needs $O(r)$ auxiliary
memory in the worst case.

The run definition must be consistent. Counting strictly increasing runs versus
non-decreasing runs changes the run count by the duplicate structure, and the
merge must use the same rule.

Best-case claims are easy to mistest. A sorted input with a small perturbation
in the middle is no longer one run; measure the run count instead of assuming
one.

Stability depends on the merge direction. Merging the left run first on ties
preserves stability; the right-first variant does not.
