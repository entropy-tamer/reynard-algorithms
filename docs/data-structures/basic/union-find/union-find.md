# Union-Find (Disjoint Set Union)

Source: `src/data-structures/basic/union-find/`

Union-Find maintains a partition of $\{0, \dots, n-1\}$ under two operations:
`union(a, b)` merges the sets containing $a$ and $b$, and `find(a)` returns a
representative for $a$'s set. Two elements are connected exactly when their
representatives agree.

## Two optimizations

Path compression makes `find` point every node on the walked path directly at
the root. Union by rank attaches the shorter tree under the taller one, keeping
the height logarithmic before compression. Together they give an amortized cost
per operation of

$$
O\bigl(\alpha(n)\bigr),
$$

where $\alpha$ is the inverse Ackermann function and is below $5$ for any input
that fits in memory. The pure lower bound is $\Omega(\alpha(n))$ in the cell
probe model, so the bound is tight.

## Cyclic graphs

A graph is acyclic exactly when every edge joins two different components. With
$E$ edges the test is

```ts
for (const [u, v] of edges) {
    if (uf.find(u) === uf.find(v)) return true; // cycle
    uf.union(u, v);
}
```

Each edge costs one or two finds, so detection is $O(E\,\alpha(V))$ and the
number of components at the end is the number of roots.

## Batch work

`BatchUnionFind` applies a list of edges and returns how many components were
merged and which edges were redundant. That is the shape a Kruskal pass or a
flood-fill wants, and it avoids one dispatch per edge.

## Pitfalls

Index base is the first one. The class is 0-based; a graph that uses 1-based
labels has to be shifted, and an off-by-one shows up as a phantom component.

Path compression is recursive in the simple form and can exceed the stack for a
pathologically long chain before compression runs. The implementation iterates
the path twice, so it is safe at depth, but a custom subclass that overrides
`find` can reintroduce the recursion.

Union by rank is not union by size. Both keep the height bounded, but a caller
that expects the larger set's representative to survive needs to read the stats
instead of assume the root identity.

The structure is not safe for concurrent writes without a lock; two unions that
touch the same component can interleave between the find and the pointer write.
