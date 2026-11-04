# Bresenham Line Rasterization

Source: `src/algorithms/computational-geometry/bresenham/`

Bresenham's algorithm turns a segment between integer endpoints into one grid
cell per column (or per row, whichever axis is longer), using only integer
arithmetic. The companion guides cover [DDA](../dda/dda.md) and the
[supercover](../supercover/supercover.md).

## Decision variable

For a segment with $\Delta x > \Delta y \ge 0$, the error term starts at

$$
D = 2\Delta y - \Delta x .
$$

At each step $x$ advances by one and $y$ advances when $D > 0$. The update is

$$
D \leftarrow D + 2\Delta y - 2\Delta x\,[D > 0],
$$

which keeps every quantity integral. The factor of two removes the division that
the naive midpoint test would need, so the inner loop is an add and a compare.

## Octants

The update above covers the first octant, where $0 \le \Delta y \le \Delta x$.
The other seven follow by reflection: swap the axes for the steep octants, and
negate the step for the negative directions. `BresenhamLine` takes the full
segment and does the reflection internally, so the output is always ordered from
the start point to the end point.

## Cost

The loop runs $\max(\Delta x, \Delta y)$ times, each iteration a constant number
of integer operations. Memory is $O(\max(\Delta x,\Delta y))$ for the emitted
points, or $O(1)$ when the caller consumes them one at a time.

## Pitfalls

Endpoint convention is a decision. The implementation includes both endpoints;
a caller that joins consecutive segments gets a duplicated cell at each joint.

The error term needs a signed type with room for $2\Delta$. In JS the value is a
double, so the bound is safe; in a fixed-width port it overflows on very long
segments.

A vertical or horizontal segment has $\Delta$ zero on one axis. The loop still
runs, and the reflection is the identity; a special case for it is a source of
off-by-one bugs rather than a speedup.

The algorithm produces a thin line. A brush with width needs a second pass or a
different rasterizer; widening by sampling offsets changes the coverage in ways a
renderer cares about.
