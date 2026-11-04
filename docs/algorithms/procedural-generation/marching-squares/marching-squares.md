# Marching Squares (terrain)

Source: `src/algorithms/procedural-generation/marching-squares/`

The procedural-generation variant of marching squares turns a scalar height or
density field into contour segments and, at full resolution, into a triangulated
surface. The computational-geometry guide covers the contour algorithm itself;
this page covers the terrain use and the legacy adapter.

## Field to contour

For a cell with corner values $v_0, v_1, v_2, v_3$ and an iso-level $L$, the
4-bit case index is

$$
c = [v_0 > L] + 2[v_1 > L] + 4[v_2 > L] + 8[v_3 > L].
$$

The lookup table maps each case to the cell edges that the contour crosses. Edge
crossings are interpolated:

$$
t = \frac{L - v_a}{v_b - v_a}, \qquad p = (1-t)p_a + t p_b .
$$

## Triangulation

For a surface, each cell splits into two triangles along a chosen diagonal, and
the corner heights come from the field. The diagonal choice is the ambiguous
case: use the average of the four corners (the asymptotic decider) to decide
which pairing matches the iso-surface, or the mesh has a visible crease at every
saddle.

## Cost

A grid of $N$ cells costs $O(N)$ to classify and emit. Storing the mesh costs
$O(N)$ vertices and $O(N)$ triangles for a height field. The contour-only path
uses $O(N)$ segments.

## The legacy adapter

`marching-squares-legacy.ts` keeps the earlier API for existing callers. It
delegates to the current core and converts the output shape. New code should use
the core directly; the adapter exists so a migration is not forced by a
dependency bump.

## Pitfalls

The iso-level is compared with $>$ consistently. A mix of $>$ and $\ge$ makes a
corner value exactly at the level disappear from one cell and appear in the next.

A flat field produces no contour at all, which is correct and often surprising.
The caller has to handle the empty result instead of assume one segment per
cell.

The sample spacing is not stored in the field. A mesh generated at one spacing
and rendered at another is scaled, not resampled; a caller that changes the grid
resolution has to regenerate.
