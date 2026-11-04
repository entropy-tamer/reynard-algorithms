# Segment Tree

Source: `src/data-structures/trees/segment-tree/`

A segment tree answers range queries and range updates over an array. Each node
covers a contiguous segment, the root covers $[0, n)$, and a node splits at the
midpoint. A query decomposes the range into $O(\log n)$ canonical segments, and
each segment contributes its stored aggregate.

## Storage

The flat layout uses an array of size $4n$, indexed as a heap: node $i$ has
children $2i$ and $2i+1$. For a node covering $[l, r)$ with midpoint
$m = \lfloor (l+r)/2 \rfloor$, the children cover $[l, m)$ and $[m, r)$.

## Aggregation

A node's value is $f(\text{left}, \text{right})$ for an associative function $f$
with an identity $e$. Sum, minimum, maximum, gcd and matrix product all qualify;
a non-associative operation needs a different structure or a different query.

## Lazy propagation

A range update stores the pending change at a node and applies it to the node's
aggregate without descending. Before a query or a partial update descends, the
pending value is pushed to both children. The composition rule is

$$
\text{pending}_{\text{child}} \leftarrow
\text{pending}_{\text{child}} \circ \text{pending}_{\text{parent}} ,
$$

so the order of composition matters for non-commutative updates. Assignment
followed by addition is the common case, and the implementation composes in the
order the operations arrived.

| Operation | Time |
| --- | --- |
| build | $O(n)$ |
| point update | $O(\log n)$ |
| range query | $O(\log n)$ |
| range update with lazy | $O(\log n)$ |

## Pitfalls

The identity element depends on the aggregation. Sum uses $0$, minimum uses
$+\infty$, and a custom function needs its own. A wrong identity makes an empty
range contribute a value that changes the aggregate.

Recursion depth is $O(\log n)$, so the recursive form is safe; the iterative
form needs the lazy array indexed consistently with the tree array.

A range update that is not distributive over the aggregate cannot use lazy
propagation. For example, "assign then take max" needs the assignment to
override the child's value, not to combine with it.
