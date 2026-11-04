# Supercover Line Rasterization

Source: `src/algorithms/computational-geometry/supercover/`

The supercover of a segment is the set of all grid cells the segment intersects,
not only the cells a thin line would pass through. It is what a coverage test, a
line-of-sight query or a voxel traversal needs, and it differs from Bresenham at
the corners.

## Definition

For a segment $[p_0, p_1]$ and the closed unit cells of the grid,

$$
\mathrm{supercover} = \{\, c \in \mathbb{Z}^2 : c \cap [p_0, p_1] \neq \varnothing \,\}.
$$

When the segment passes exactly through a grid corner, it touches four cells. A
thin rasterizer picks one side; the supercover includes both cells on the
diagonal, so the count at a corner is two above the thin line.

## Traversal

The implementation walks the cells in order, tracking the parametric distance to
the next vertical and horizontal grid line:

$$
t_x = \frac{x_{\text{next}} - x_0}{\Delta x}, \qquad
t_y = \frac{y_{\text{next}} - y_0}{\Delta y}.
$$

The next cell is the one with the smaller $t$. Equal $t$ means a corner crossing,
and the walk emits both cells before continuing. That is the Amanatides and Woo
traversal restricted to two dimensions.

## Cost

The walk visits $\Delta x + \Delta y$ cells at most, so the cost is
$O(|\Delta x| + |\Delta y|)$ and the output is that long. Memory matches.

## Pitfalls

Corner policy is visible. Emitting both cells is correct for coverage and draws a
double pixel in a render; emitting one cell makes the coverage test miss the
diagonal touch. The class emits both.

Negative directions need the floor to be applied consistently. A cell index from
`Math.floor` is correct for negative coordinates; a truncation collapses $-0.9$
and $0.9$ into the same cell.

The endpoints are included, and they are floored to grid indices. A segment that
starts at a non-integer position begins in the cell that contains it, which is
what a coverage test expects.

The result is cells, not a path. Converting the cell list to a polyline needs the
cell centers, and that polyline is thicker than the original segment by half a
cell on each side.
