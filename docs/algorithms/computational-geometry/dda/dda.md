# DDA Line Rasterization

Source: `src/algorithms/computational-geometry/dda/`

The digital differential analyzer walks the longer axis in unit steps and
accumulates a floating-point increment on the other. It is the direct translation
of the parametric line into discrete steps.

## Step and accumulation

For a segment from $p_0$ to $p_1$ with $n = \max(|\Delta x|, |\Delta y|)$, the
increments are

$$
x_{k+1} = x_k + \frac{\Delta x}{n}, \qquad
y_{k+1} = y_k + \frac{\Delta y}{n}, \qquad k = 0, \dots, n .
$$

Each sample is rounded to the nearest cell for the raster output. `DDALine`
returns both the rounded cells and the unrounded samples, which is what an effect
needs when it wants a sub-cell position along the segment.

## Relation to Bresenham

With the same rounding rule, DDA produces the same cell sequence as Bresenham.
The difference is the arithmetic: DDA carries a float and pays a round per step,
while Bresenham carries an integer error term. On current hardware the float add
is cheap; the reason to prefer Bresenham is determinism across platforms, not
throughput.

## Cost

$n$ steps, each a float add and a round. Memory is $O(n)$ for the result, or
$O(1)$ when streamed.

## Pitfalls

Accumulated floating-point error grows with $n$. At ordinary coordinate ranges
the error stays below half a cell for millions of steps, but a long segment far
from the origin loses precision in the fraction. Recompute the sample from the
parameter for very long lines.

The sample count is the larger axis, not the Euclidean length. A diagonal segment
of $n$ steps is $\sqrt 2$ longer than a horizontal one with the same $n$, so a
step count chosen for pixel spacing is anisotropic.

Rounding versus flooring changes the line by one cell on one side. Use the same
convention as the consumer, especially when DDA output is compared with
Bresenham output.

Zero-length segments divide by zero in $n$. Return the single cell.
