# LRU Cache

Source: `src/data-structures/basic/lru-cache/`

A least-recently-used cache keeps a hash map from key to node and a doubly linked
list ordered by recency. A hit moves the node to the head; an insert at capacity
evicts the tail. Both operations are $O(1)$ expected, which is why the map and
the list are maintained together instead of one being derived from the other.

## Recency order

Write the list from most to least recent as $x_1, \dots, x_n$ with capacity $C$.
A read of $x_i$ produces

$$
x_1, \dots, x_{i-1}, x_i, x_{i+1}, \dots, x_n
\;\longrightarrow\;
x_i, x_1, \dots, x_{i-1}, x_{i+1}, \dots, x_n .
$$

An insert when $n = C$ removes $x_n$ first. The invariant $n \le C$ holds after
every operation, so memory is bounded by the capacity times the entry size, not
by the number of distinct keys the process has ever seen.

## Cost

| Operation | Expected time | Space |
| --- | --- | --- |
| `get` | $O(1)$ | $O(1)$ |
| `set` | $O(1)$ amortized | $O(1)$ |
| eviction | $O(1)$ | $O(1)$ |
| `stats` | $O(1)$ | $O(1)$ |

Node pooling (`lru-cache-pooling.ts`) keeps evicted nodes for reuse, so a
steady-state workload does not allocate on every insert.

## Configuring

`LRUCacheOptions` carries capacity, an optional TTL, an optional size function
for byte-bounded caches, and event hooks. TTL expiry is lazy plus swept: an
expired entry is removed when it is read or when a sweep runs, which avoids a
timer per entry.

## Pitfalls

TTL compares against a clock. A process that suspends or a test that fakes time
can leave entries that look fresh for longer than the TTL suggests.

A custom `sizeCalculation` changes the eviction rule from entry count to a
budget. Mixing the two by setting both capacity and max size is legal, but the
binding constraint is whichever is reached first, and the stats report both.

Iteration order is recency order at the moment the iterator was created. Mutating
the cache during iteration invalidates the positional guarantee even when it does
not corrupt the list.

The cache is not a lock. Concurrent readers need an external guard, or a sharded
cache, because the linked list update is several pointer writes.
