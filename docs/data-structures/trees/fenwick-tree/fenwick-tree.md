# Fenwick Tree (Binary Indexed Tree)

Source: `src/data-structures/trees/fenwick-tree/`

A Fenwick tree stores prefix sums in an array where index $i$ covers the range
$(i - \mathrm{lowbit}(i),\, i]$. The function

$$
\mathrm{lowbit}(i) = i \;\&\; (-i)
$$

isolates the lowest set bit, which is the stride for both the update walk and the
query walk.

## Prefix sum

The prefix sum to $i$ is

$$
S(i) = \sum_{j=i}^{j>0} T[j], \qquad j \leftarrow j - \mathrm{lowbit}(j),
$$

which visits one node per set bit of $i$, so $O(\log n)$. A point update adds
$\Delta$ at $i$ and then at $i + \mathrm{lowbit}(i)$ until the end of the array,
also $O(\log n)$.

## Range updates

A range add on $[l, r]$ and a point query use a difference array: add $\Delta$ at
$l$ and $-\Delta$ at $r+1$. Two Fenwick trees over the difference array give
range add with range sum:

$$
\sum_{i=1}^{x} a_i = (x+1)\sum_{i=1}^{x} d_i - \sum_{i=1}^{x} i\,d_i .
$$

The class exposes both modes; the range-update result reports the two internal
arrays so a caller can serialize them.

## Pitfalls

The array is 1-based. Index 0 is the sentinel and `lowbit(0) = 0` would loop
forever, which is why both walks stop at `> 0`.

Sums use JS numbers. Values above $2^{53}$ lose integer precision; a workload
that needs exact 64-bit sums should use a `BigInt` wrapper.

The structure supports point updates and prefix queries, not arbitrary range
assignment. A segment tree with lazy propagation is the right tool when the
update is "set every element in a range".

The `getComplexity` helpers report the asymptotic bounds for documentation; they
do not measure anything.
