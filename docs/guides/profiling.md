# Profiling

Source: `src/utils/profiling/`

Profiling records where time and memory go. The two families are instrumentation,
which wraps operations and records each call, and sampling, which observes the
stack at intervals. This module is the instrumentation side plus a micro-benchmark
runner.

## Instrumentation overhead

A wrapped operation pays the clock read and the record. If the operation costs
$c$ and the instrumentation costs $\delta$, the measured value is $c + \delta$ and
the relative error is $\delta/c$. Below a few microseconds the overhead dominates,
which is why `PerformanceProfiler` has an enable flag and a zero-overhead path
when disabled.

## Aggregation

For each operation name the profiler keeps a count, a total, a maximum and a
histogram. The total gives the share of the frame; the maximum finds the outlier;
the histogram shows whether the distribution is one mode or two.

## Micro-benchmarks

`MicroBenchmarkRunner` runs a function a fixed number of times and reports the
mean and standard deviation of the samples. The standard error of the mean is
$\sigma/\sqrt{n}$, so a difference smaller than a few standard errors is not
evidence of a difference.

## Hooks

`useTiming` and `useMemoryTracking` wrap a scope with a name and record it on
exit. They are hooks in the sense of a scope guard, not React hooks; the name is
the aggregation key.

## Pitfalls

The observer changes the observed. Enabling profiling in a hot loop can double the
frame time, and the ranking of the operations can change because the cheap ones
pay a larger relative overhead.

Memory snapshots are expensive. Taking one per frame allocates while measuring
allocation; sample or take them at boundaries.

A profile of a debug build does not describe a release build. Inlining, bounds
checks and assertion removal change the ranking.

The aggregate hides the call path. A total of 10 ms in `intersect` can come from
one slow call or ten thousand fast ones; the count and the maximum separate the
two cases.
