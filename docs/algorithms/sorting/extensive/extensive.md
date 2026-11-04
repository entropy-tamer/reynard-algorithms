# Extensive Sorting Algorithms

Source: `src/algorithms/sorting/extensive/`

Sorts that beat the comparison bound by using the key structure. They trade
generality for speed and each has a different precondition.

## Counting sort

Count occurrences, prefix-sum the counts, and place each key:

$$
C[v] = \#\{i : a_i = v\}, \qquad
\text{pos}(v) = \sum_{u<v} C[u].
$$

Cost $O(n + k)$ for $k$ distinct key values, and $O(k)$ extra memory. It is
stable when the placement walks the input backward.

## Radix sort

Sort by one digit at a time from the least significant. Each pass is a stable
counting sort over the digit alphabet, so

$$
O(d(n + b))
$$

for $d$ digits and base $b$. With base $256$ and 32-bit keys that is four passes.
The method is stable and needs $O(n + b)$ auxiliary space.

## Bucket sort

Scatter keys into $k$ buckets by a monotone function of the value, sort each
bucket, and concatenate. With a uniform distribution and $k \approx n$ the
expected cost is

$$
O(n) + n \cdot O\!\left(\frac{n}{k}\log\frac{n}{k}\right) = O(n)
$$

for constant bucket size. A skewed distribution puts everything in one bucket and
the cost returns to the inner sort.

## Shell sort

Insertion sort over decreasing gaps. The complexity depends on the gap sequence;
the Ciura sequence and the Sedgewick sequence are the common choices, giving
roughly $O(n^{4/3})$ and $O(n^{1.5})$ in practice. `shellSortSedgewick` uses the
Sedgewick gaps.

## Tim sort

Tim sort is the merge sort used by Python and Java. It finds natural runs,
extends short runs with insertion sort, and merges runs with a stack that
enforces a balanced merge order. Worst case $O(n\log n)$, best case $O(n)$ on
sorted input, stable, and $O(n)$ auxiliary memory.

## Intro sort

Intro sort starts as quick sort, switches to heap sort when the recursion depth
exceeds $2\log_2 n$, and uses insertion sort for small partitions. The guarantee is
$O(n\log n)$ worst case with quick sort's average performance.

## Pitfalls

The base and the digit extraction must agree. A base-10 pass over a base-256 key
reads the wrong digits and produces a sorted-looking but wrong result.

Counting sort needs a bounded key range. A range of $10^9$ with $10^3$ keys
allocates a huge count array; radix or comparison sort is the right choice.

Tim sort's run stack invariants are the hard part of the implementation. A merge
order that violates them still sorts, but loses the $O(n\log n)$ bound.

Intro sort's depth limit is in terms of $\log_2 n$, not a constant. A fixed limit
turns an adversarial input into a slow heap sort on every branch.
