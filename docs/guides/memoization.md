# Memoization

Source: `src/utils/memoization.ts`, `src/utils/memo/`, `src/utils/memo-registry.ts`

Memoization stores the output of a pure function by argument. For a cache with hit
rate $h$, the expected cost per call is

$$
\mathbb{E}[T] = h\,c_{\text{hit}} + (1-h)\,c_{\text{miss}} ,
$$

where a miss includes the compute and the store. The cache pays off when
$c_{\text{hit}} + (1-h)c_{\text{miss}}/h$ is below $c_{\text{compute}}$, which is
why the hit rate matters more than the cache size once the working set fits.

## Cache policy

The default cache is bounded. When it is full, an eviction policy decides what
leaves; the LRU policy is the common one, and the registry exposes the hit and
miss counts per memoized function so a policy can be tuned from data.

The registry (`memo-registry.ts`) names each memoized function and lets a caller
enable, disable or reset it. Disabling a memo keeps the wrapper and bypasses the
cache, which is how a production build turns the instrumentation off without
changing the call sites.

## Adaptive memoization

`AdaptiveMemoController` samples the hit rate and changes the policy when the rate
falls below a threshold. The idea is that a workload that has stopped repeating
arguments should stop paying for the cache lookup and the stored entries. The
controller exposes the current mode so the decision is visible.

## Key construction

A memo key is the argument list serialized into a string or a nested map. Numbers
and strings are cheap; objects and arrays need a stable serialization. A key that
collides returns a wrong result, which is worse than a miss, so the key must
include every argument that affects the output.

## Geometry and math memos

`memoizeGeometry` and `memoizeMath` are the wrappers used by the geometry
primitives. They key on the numeric arguments and clear as a group, so a caller
can reset all of them at a frame boundary.

## Pitfalls

Memoization requires purity. A function that reads mutable state, a clock or a
random source returns a stale result for the same arguments.

Unbounded caches grow with the input space. A cache keyed by floating-point
coordinates has an effectively infinite domain; bound it or quantize the key.

The cache hit rate is not the same as the speedup. A hit that costs almost as much
as the compute (a long key serialization) adds overhead without reducing work.

Clearing the cache at the wrong granularity loses the reuse. Clearing per call
makes the cache useless; never clearing makes a stale result permanent.
