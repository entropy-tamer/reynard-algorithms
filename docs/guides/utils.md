# Utilities

Source: `src/utils/`

The utilities barrel has three jobs: memoize pure functions, reuse allocations,
and measure the outcome. Each has its own guide; this page says which one to read
and how the registry ties them together.

## What is here

`memoize`, `memoizeMath` and `memoizeGeometry` wrap a function with a bounded
cache. `AdaptiveMemoController` changes the policy when the hit rate falls.
`memo-registry.ts` names each memoized function so it can be enabled, disabled,
reset or inspected as a group.

`MemoryPool` and `MemoryPoolManager` reuse objects across frames. The
`create*Pool` helpers are preconfigured for points, vectors, AABBs and spatial
objects.

`PerformanceBenchmark`, `PerformanceTimer`, `FrameRateMonitor`,
`PerformanceBudgetChecker`, `throttle` and `debounce` measure and shape the frame.
`PerformanceProfiler` and `MicroBenchmarkRunner` record where the time went.

## The registry

Every memoized function is registered under a name. The registry stores the hit
and miss counts and the tuning policy, and the four entry points are

$$
\text{getMemoStats}(name),\quad
\text{setMemoPolicy}(name, policy),\quad
\text{enableMemo}(name),\quad
\text{disableMemo}(name).
$$

A production build calls `disableMemo` for the functions whose reuse did not pay,
which removes the lookup cost without touching the call sites. The stats are the
evidence for that decision: a hit rate near zero means the cache is pure
overhead.

## Guides

- [memoization.md](./memoization.md) for the cache policy and the purity rules.
- [memory-pooling.md](./memory-pooling.md) for the pool lifecycle and reset.
- [performance.md](./performance.md) for the frame budget and the timers.
- [profiling.md](./profiling.md) for the instrumentation overhead.

## Pitfalls

The registry is process-wide state. Two tests that enable and disable the same
memoized function interfere; reset the registry in the teardown.

Disabling a memo keeps the wrapper, so call sites are stable but a caller cannot
re-enable it without the registry. That is the intended trade for a production
switch.

The utilities do not know the frame boundary. A pool or a cache that should reset
per frame needs the caller to signal it; the algorithms do not call the reset
themselves.
