# Performance Utilities

Source: `src/utils/performance/`

Measurement primitives for frame budgeting and throttling. Every number here is a
duration in milliseconds unless the name says otherwise.

## Frame budget

At $f$ frames per second the budget per frame is

$$
B = \frac{1000}{f}\ \text{ms}.
$$

`FrameRateMonitor` tracks the frame interval and compares it with $B$. A frame
that exceeds the budget is a dropped frame, and the fraction of dropped frames over
a window is the practical quality metric.

## Averages and percentiles

The mean of $n$ samples is $\bar x = \frac{1}{n}\sum x_i$. The mean hides the
tail, so the monitor also reports the 95th and 99th percentiles: sort the window
or keep a histogram, and read the value below which 95% of the samples fall. A
frame budget is a tail constraint, not a mean constraint.

## Timers

`PerformanceTimer` records start and end marks and derives the elapsed time. The
`performance.now()` clock is monotonic and has sub-millisecond resolution in
browsers and Node; `Date.now()` is wall-clock and moves backward on an NTP
adjustment, so it is the wrong clock for a duration.

## Throttle and debounce

Throttle runs a function at most once per interval $T$:

$$
t_{\text{next}} = t_{\text{last}} + T .
$$

A leading-edge throttle fires immediately and then suppresses; a trailing-edge
throttle fires at the end of the interval with the latest arguments. Debounce
restarts the timer on every call and fires only after the calls stop for $T$.

## Budget checking

`PerformanceBudgetChecker` holds a set of named budgets and reports the
operations that exceed them. A budget is a number per operation, so the checker is
a table lookup plus a comparison, cheap enough to leave on outside the hot loop.

## Pitfalls

Warm-up is real. The first calls include JIT compilation and cache misses, so a
mean over the first hundred calls is not the steady-state cost. Discard a warm-up
window or report it separately.

Timers have resolution limits. A sub-microsecond operation measured with a
millisecond clock reports zero; batch the operation or use a higher-resolution
source.

Throttling changes semantics. A throttled event handler drops intermediate
values, which is fine for a resize and wrong for an accumulator.

A percentile from a small window is noise. Twenty samples cannot distinguish the
95th percentile from the maximum; use a window of hundreds or report the maximum.
