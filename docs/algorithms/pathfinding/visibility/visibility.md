# Shadowcasting Field of View

Source: `src/algorithms/pathfinding/visibility/`

Shadowcasting computes which cells are visible from a viewer on a grid. It works
one octant at a time and tracks the angular interval that is still visible.

## Slopes

For a row at distance $d$ from the viewer, a column $c$ covers the slope interval

$$
\left[\frac{c - 0.5}{d + 0.5},\ \frac{c + 0.5}{d - 0.5}\right]
$$

depending on the convention for cell edges. A cell is visible when its interval
overlaps the visible interval for the row; a wall narrows the interval, and when
the interval closes the scan stops for the rest of the octant.

The eight octants are reflections of the first, so one implementation covers all
directions. Processing the octants in order avoids double-reporting the axes.

## Cost

The scan visits each cell in the visible radius at most once, so it costs
$O(r^2)$ for radius $r$. That is the same order as a naive ray cast from the
viewer, but with far fewer wasted tests, because a wall stops a whole wedge
instead of one ray.

## Symmetry

A cell exactly on an octant boundary can be reported twice or missed. The
implementation uses a half-open slope interval and processes boundaries in a
fixed direction, which makes the visible set symmetric: if $A$ sees $B$, $B$ sees
$A$ under the same map.

## Pitfalls

The radius is in cells, not in world units. A game with a non-square cell needs
to scale the radius per axis, or the field of view is elliptical.

Rounding slopes to a fixed precision loses narrow gaps. A one-cell door at a
distance is a very small interval; use floating point and test overlap, not a
rounded integer.

Corners are the other ambiguity. A viewer sees around a corner to the diagonal
cell behind it or not, depending on the interval convention; pick one and keep it
in the rendering and the AI.

Occlusion is computed per cell, not per object. A large object that covers
several cells needs its own visibility test, or the field reports the cells it
occupies as partially seen.
