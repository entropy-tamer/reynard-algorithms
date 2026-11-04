# Marching Squares (contours)

Source: `src/algorithms/computational-geometry/marching-squares/`

Marching squares extracts iso-contours from a 2D scalar field. Each grid cell has
four corner values; comparing each to the iso-level gives a 4-bit case index, and
the case determines which cell edges the contour crosses.

## Case table

With corners labeled

$$
\begin{matrix}
v_3 & & v_2\\
 & & \\
v_0 & & v_1
\end{matrix}
$$

the case index is

$$
c = [v_0 > L] + 2[v_1 > L] + 4[v_2 > L] + 8[v_3 > L],
$$

which yields 16 cases, two of them ambiguous (5 and 10) because the contour can
connect either pair of edges. The ambiguity is resolved by the cell-center
average: compare $\bar v$ to $L$ and pick the connection that matches.

## Interpolation

A crossing on an edge between values $v_a$ and $v_b$ sits at

$$
t = \frac{L - v_a}{v_b - v_a}, \qquad p = (1-t)p_a + t p_b ,
$$

which places the vertex on the true iso-level instead of at the cell midpoint.
That is the difference between a smooth contour and a staircase.

## Cost

For a grid of $N$ cells the sweep is $O(N)$ time. Storing the contour as a
segment list costs $O(N)$ in the worst case; linking segments into polylines is
an additional pass over the segment endpoints, which can be hashed in $O(1)$ per
segment.

## Pitfalls

The ambiguous cases are the whole difficulty. Choosing the connection by a fixed
rule produces closed loops that pinch, and the artifact is visible at every
saddle. Use the center average or a consistent asymptotic decider.

The iso-level equal to a corner value produces a zero denominator. Nudge the
level by an epsilon or treat the equality as a case of its own.

The contour is a set of segments, not a set of polylines. A renderer that draws
each segment separately is correct but slow; joining them needs an endpoint index
and careful handling of the open contours at the border.
