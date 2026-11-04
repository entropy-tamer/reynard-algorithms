# Classical Sorting Algorithms

Source: `src/algorithms/sorting/classical/`

Six comparison sorts, each with a different trade between time, memory and
stability. For $n$ keys a comparison sort cannot beat

$$
\Omega(n\log n)
$$

comparisons in the worst case, which is the information-theoretic bound from the
$\log_2(n!)$ possible orders.

## The algorithms

Bubble sort compares adjacent pairs and swaps, with an early exit when a pass
makes no swap. Worst and average $O(n^2)$, best $O(n)$, stable, in place.

Insertion sort inserts each key into the sorted prefix. Worst and average
$O(n^2)$, best $O(n)$, stable, in place, and the fastest of the quadratic sorts
on small or nearly sorted input. `binaryInsertionSort` uses binary search for the
position and still pays $O(n)$ for the shift.

Selection sort finds the minimum of the unsorted suffix and swaps it forward.
Always $O(n^2)$ comparisons, $O(n)$ swaps, not stable, in place.

Merge sort splits, sorts and merges. Always $O(n\log n)$, stable, and needs
$O(n)$ auxiliary memory. `mergeSort` allocates one buffer instead of one per
merge.

Quick sort partitions around a pivot and recurses. Average $O(n\log n)$, worst
$O(n^2)$ on sorted input with a bad pivot, in place, not stable. The
implementation uses a median-of-three pivot and a three-way partition
(`quickSort3Way`) for duplicate-heavy input.

Heap sort builds a max-heap and repeatedly extracts. Always $O(n\log n)$,
in place, not stable, with poor cache behavior compared with quick sort.

## Choosing

| Input | Choice |
| --- | --- |
| tiny or nearly sorted | insertion sort |
| stable, predictable | merge sort |
| general purpose, in place | quick sort with median-of-three |
| worst-case guarantee, in place | heap sort |

## Pitfalls

The comparator must be a total order. A comparator that returns `0` for unequal
keys makes the sort unstable in an unpredictable way and can make quick sort
recurse forever on a partition that makes no progress.

Stability is a property of the algorithm, not of the comparator. Merge sort
preserves the input order of equal keys; quick sort and heap sort do not.

Recursion depth is $O(\log n)$ only with a balanced pivot. A naive quick sort on
sorted input recurses $n$ deep; the median-of-three pivot and a tail-call loop on
the larger side keep the depth logarithmic.

The `getComplexity` helpers return the documented bounds; they do not measure the
input.

## Instrumentation

`sorting/core/metrics.ts` measures how a sort behaves, not only how long it takes.
The inversion count

$$
I = \#\{(i,j) : i < j \ \wedge\ a_i > a_j\}
$$

decreases monotonically to zero for a correct sort, so the sequence of counts is a
Lyapunov function for the process. `calculateLyapunovValue` reports the ratio
between consecutive counts, and `satisfiesLyapunovCondition` checks that no step
increased the disorder. `StateTracker` records the array after each step, which
is the input to a visualization and to `trackMetrics`.
