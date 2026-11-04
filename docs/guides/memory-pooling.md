# Memory Pooling

Source: `src/utils/memory/`, `src/utils/memory-pool.ts`

A memory pool allocates objects in batches and reuses them after release. The
goal is to remove the allocator from a per-frame path, where the cost is not the
allocation itself but the garbage collector's later work.

## Steady state

With $n$ live objects and a pool of capacity $C$, an acquire is a pop from the
free list and a release is a push. Both are $O(1)$ and neither allocates while the
pool has a free object. A workload that returns to the same live count every frame
therefore allocates nothing after the first frame.

## Growth

When the free list is empty the pool allocates a new batch of size
$b$ (the growth factor). The total allocation after $k$ batches is
$b + b g + b g^2 + \dots$, so a growth factor of $2$ doubles the capacity and
keeps the number of reallocations logarithmic in the peak live count.

## Pooled shapes

`createPointPool`, `createVectorPool`, `createAABBPool` and
`createSpatialObjectPool` are preconfigured pools for the types the algorithms
allocate most. `MemoryPoolManager` owns several pools and releases them together
at a frame boundary.

## Reset semantics

`acquire` returns an object in a defined state: either zeroed or carrying the
previous values with a generation counter. A release that does not reset leaves
the next caller holding stale fields, which is the classic pool bug. The pooled
object carries an `inUse` flag so a double release is detectable.

## Pitfalls

A pooled object must not escape to a caller that keeps it past the frame. The
pool cannot know, so the API documents the lifetime and the manager releases
everything it owns at the boundary.

Pools increase memory, not decrease it. The high-water mark stays allocated. A
pool sized for a worst-case frame keeps that memory for the process lifetime.

The collector still sees the pool. Long-lived arrays of objects are promoted to
the old generation, which is good for a pool and bad for a short-lived one; size
the pool for the steady state, not for a one-off spike.

Finalizers and `WeakRef` defeat pooling. A pooled object with a finalizer is
resurrected and the free list no longer reflects the truth.
