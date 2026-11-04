# Priority Queue

Source: `src/data-structures/basic/priority-queue/`

A binary heap stored in a flat array. For a node at index $i$ the parent is
$\lfloor (i-1)/2 \rfloor$ and the children are $2i+1$ and $2i+2$, so the tree
needs no pointers and stays cache-friendly.

## Heap order

With a comparator $\prec$ the invariant is

$$
A[\lfloor (i-1)/2 \rfloor] \preceq A[i]
\quad \text{for every } i > 0 .
$$

`push` appends and sifts up, `pop` swaps the root with the last element, shrinks
the array and sifts down. Both walk one root-to-leaf path, so both cost
$O(\log n)$.

Building from an existing array costs $O(n)$ instead of $O(n \log n)$ because
sifting down from the last internal node visits at most

$$
\sum_{h=0}^{\lfloor \log_2 n \rfloor} \frac{n}{2^{h+1}}\, h \;=\; O(n)
$$

nodes in total.

| Operation | Time |
| --- | --- |
| `push` | $O(\log n)$ |
| `pop` | $O(\log n)$ |
| `peek` | $O(1)$ |
| build from array | $O(n)$ |

## Comparator contract

The queue is only correct when the comparator is a strict weak ordering. A
comparator that returns `true` for equal priorities breaks the sift loops: a
node can be judged both greater and smaller than its parent, and the heap order
no longer bounds the root.

Ties are resolved by insertion order when the comparator is stable. `PriorityQueue`
does not add a sequence number of its own unless the caller does, so a workload
that needs FIFO among equal priorities should encode the tie-break in the
comparator.

## Pitfalls

Lazy deletion leaves stale entries in the heap until they surface. That is a
valid pattern, but `size` then counts stale entries and the stats need the live
count to stay meaningful.

Changing an element's priority after insertion requires a decrease-key or a
reinsertion. Editing the array in place breaks the invariant silently.

The batch operations drain and rebuild the heap. They are faster than $n$
individual pops for large batches, but they discard the iteration order and fire
the event stream once instead of per element.
