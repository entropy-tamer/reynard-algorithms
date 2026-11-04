# Trie (Prefix Tree)

Source: `src/data-structures/basic/trie/`

A trie stores keys character by character along root-to-node paths. Every node
owns a map from the next character to a child, and a terminal flag marks a key
that ends there. Lookup, insert and delete all cost $O(m)$ for a key of length
$m$, independent of how many keys the trie holds.

## Node count

For a set of keys $K$ over an alphabet $\Sigma$, the node count is bounded by

$$
1 + \sum_{w \in K} |w| ,
$$

and a shared prefix is stored once. That is the trade: a hash table gives
$O(1)$ expected lookup with no order, a trie gives ordered traversal and prefix
enumeration with one node per character of the shared prefixes.

## Prefix and pattern queries

A prefix query walks $m$ characters and then enumerates the subtree, which costs
$O(m + s)$ for $s$ matching keys. A wildcard query replaces one character with a
branch over every child; a fuzzy query (`FuzzyMatchResult`) allows a bounded
edit distance, which turns the walk into a depth-first search with a distance
budget and costs $O\!\left(m \cdot |\Sigma|^{\,d}\right)$ in the worst case for
distance $d$.

## Compression

`TrieConfig` exposes path compression and node pooling. Compression merges chains
that have one child and no key ending in the middle, which reduces the node count
for sparse alphabets without changing the query cost. Pooling reuses removed
nodes so a workload of insert/delete cycles does not churn the allocator.

## Pitfalls

Unicode is the common failure. A JS string index is a UTF-16 code unit, so a
multi-code-point grapheme is several nodes. Normalize keys to a single form
before insertion or two visually identical keys become two paths.

The traversal result is a snapshot of node references. Mutating the trie during
a traversal can visit a node twice or skip a subtree.

Fuzzy matching returning a candidate list is not the same as ranking it. The
distance is available on each result, and sorting by it is the caller's job.

A trie over a large alphabet with short unique keys uses more memory than the
keys themselves; measure the node count before choosing it over a sorted array.
