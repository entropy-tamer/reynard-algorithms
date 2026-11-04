# Line Rasterization

Source: `src/algorithms/computational-geometry/bresenham/`,
`src/algorithms/computational-geometry/dda/`,
`src/algorithms/computational-geometry/supercover/`

Three line rasterizers share one job: turn a segment between integer endpoints
into the set of grid cells the segment touches. They differ in which cells they
include and in whether they use integer arithmetic.

## Bresenham

For a segment with $\Delta x > \Delta y \ge 0$ the integer error term starts at

$$
D = 2\Delta y - \Delta x .
$$

At each step $x$ advances by one and $y$ advances when $D > 0$. The update is

$$
D \leftarrow D + 2\Delta y - 2\Delta x\,[D > 0],
$$

which keeps every quantity integral. The output is one cell per column, $O(\Delta x)$
steps and no division.

## DDA

The digital differential analyzer walks the longer axis in unit steps and
accumulates a floating-point increment on the other:

$$
x_{k+1} = x_k + \frac{\Delta x}{n}, \qquad
y_{k+1} = y_k + \frac{\Delta y}{n}, \qquad n = \max(\Delta x, \Delta y).
$$

It is the same cell sequence as Bresenham when rounding is done the same way, but
it pays one float add and one round per step. `DDALine` exposes the unrounded
samples as well, which is useful for effects that need sub-cell positions.

## Supercover

A segment crossing a grid corner touches cells that neither of the other two
includes. The supercover is the set of all cells the segment intersects:

$$
\text{supercover} = \{\, c \in \mathbb{Z}^2 : c \cap [p_0, p_1] \neq \varnothing \,\}.
$$

The implementation walks the cells and, at an exact corner crossing, emits both
neighboring cells. That is the right choice for collision rasters and line of
sight; it is the wrong choice for drawing, because the extra cells thicken the
line.

## Cost

| Algorithm | Steps | Arithmetic |
| --- | --- | --- |
| Bresenham | $\max(\Delta x, \Delta y)$ | integer |
| DDA | $\max(\Delta x, \Delta y)$ | float |
| supercover | $\Delta x + \Delta y$ | integer |

## Pitfalls

Octant reduction is where implementations break. Reflect the segment into the
first octant, rasterize, then reflect back; handling only the shallow case leaves
the steep and negative directions wrong.

Endpoints are inclusive by convention here. A caller that treats the last cell as
exclusive gets a line one pixel short at every join.

The error term needs a signed type with room for $2\Delta$. In JS the number is a
double, so the bound is safe; in a fixed-width port it overflows on very long
segments.

Supercover at a corner is a policy call. Emitting both cells is correct for
coverage and produces a visible double pixel in a render; emit one and the
coverage test misses the diagonal touch.
