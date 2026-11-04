# ReLU Polytopes

Source: `src/algorithms/machine-learning/relu-polytopes/`

A ReLU layer partitions its input space into regions where the set of active
neurons is constant. Within a region the network is affine, so the region is a
polytope and the layer's behavior is piecewise linear.

## Boundaries

Neuron $k$ with weight $w_k \in \mathbb{R}^2$ and bias $b_k$ is active when

$$
w_k \cdot x + b_k > 0 .
$$

The boundary is the line $w_{k1}x + w_{k2}y + b_k = 0$. In the plane that line
has slope $-w_{k1}/w_{k2}$ and intercept $-b_k/w_{k2}$ when $w_{k2} \neq 0$;
when $w_{k2} = 0$ it is vertical at $x = -b_k/w_{k1}$.

## Patterns

The activation pattern of a point is the bitmask of active neurons:

$$
\mathrm{id}(x) = \sum_{k} 2^k\,[w_k \cdot x + b_k > 0].
$$

`ReLUPolytopePartitioner.partition(resolution)` samples a square grid and returns
the pattern id per cell and the boundary lines that cross the sampling
box. The number of distinct patterns is bounded by the number of regions in an
arrangement of $N$ lines:

$$
R \le \frac{N(N+1)}{2} + 1 .
$$

## Why it matters

Inside a region the layer computes $W_A x + b_A$ for the active rows only, which
is an affine map. The Jacobian is constant there, so gradients, robustness
certificates and local linear explanations are exact on the region. The
partition makes the pieces visible.

## Pitfalls

The pattern id is a 32-bit integer. A layer with more than 31 neurons overflows
the shift and two different patterns collapse to the same id; split the layer or
use a wider representation.

Points exactly on a boundary satisfy neither strict inequality. Sampling picks a
side by the floating-point value, so a grid aligned with a line can produce two
adjacent cells with the same pattern. Nudge the sample or treat $= 0$ as active
consistently.

The grid is a sample, not the arrangement. Small regions between grid lines are
missed, and the reported pattern count is a lower bound unless the resolution is
finer than the smallest cell.

`gridResolution` must be at least $2$; a single sample divides by zero in the
coordinate mapping. The class rejects smaller values.
