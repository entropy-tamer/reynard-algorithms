# Wang Tiles

Source: `src/algorithms/procedural-generation/wang-tiles/`

A Wang tile is a unit square whose four edges are each colored from a finite
alphabet $\Sigma$. Tiles are fixed: no rotation, no reflection. A tiling is valid
when every pair of adjacent tiles agrees on the color of the edge they share.

For the complete two-color set, $\Sigma = \{0, 1\}$ and all four edges are
independent, so there are

$$
|\Sigma|^4 = 2^4 = 16
$$

tiles. This module generates a valid tiling of that set in constant time per
cell. It performs no search, no propagation and no backtracking, because a
complete set has nothing to solve.

## Index packing

The index of a tile is its four edge colors packed into a nibble:

$$
i = t + 2r + 4b + 8l, \qquad t, r, b, l \in \{0, 1\},
$$

with $t$ the top edge, $r$ the right, $b$ the bottom and $l$ the left. The mapping
is a bijection between the sixteen edge quadruples and $0 \ldots 15$, so
`wangIndex` and `wangTileEdges` are exact inverses and neither needs a table.

The same packing gives the atlas layout for free: index $i$ is the cell at column
$i \bmod 4$ and row $\lfloor i / 4 \rfloor$ of a $4 \times 4$ sheet. Sixteen tiles
of $32 \times 32$ pixels pack into one $128 \times 128$ texture with no padding.

## The dual lattice

The tiles are not what the generator stores. It stores the *edges*, because an
edge is shared and a tile is not.

Horizontal edges live on a grid of $(R + 1) \times C$ cells and vertical edges on
a grid of $R \times (C + 1)$ cells. Cell $(x, y)$ reads its four bounding edges:

$$
t = H[y][x], \quad b = H[y+1][x], \quad l = V[y][x], \quad r = V[y][x+1].
$$

Two horizontally adjacent cells read the same $V$ slot; two vertically adjacent
cells read the same $H$ slot. The seam is therefore equal by construction, not by
checking. That is the whole algorithm: color the edges, then read the tiles.

Because the set is complete, any assignment of colors to the dual lattice is
realizable, and the resulting tiling is automatically valid. The converse also
holds, which is why the construction is not merely sufficient: every valid tiling
of the complete set induces exactly one edge coloring.

## Coloring the edges

This implementation derives each edge color from a hash of the edge's *world*
coordinate and a seed, one bit of the hash per edge:

$$
c(x, y, \text{horizontal}) = h(x, y, \text{seed}, \text{salt}) \bmod 2 .
$$

Two properties follow from using world coordinates rather than a sequential
PRNG:

- A chunk generated with origin $(x_0, y_0)$ agrees with its neighbors on every
  shared edge, without either chunk being generated first.
- A single cell can be queried with no lattice at all: `wangTileAt(x, y, seed)`
  is four hashes and one addition, and its answer does not depend on what was
  generated before it.

The hash is pure 32-bit integer arithmetic (`Math.imul`, xor, unsigned shift),
so it is identical across engines and platforms. A floating-point PRNG is not.

## Non-periodicity

Random edge colors give a tiling that is non-periodic *almost surely*: for a
uniformly random coloring, the probability that the whole plane repeats with
period $p$ is zero. What remains is the periodicity of the lattice itself -- the
tiles still sit on a square grid, and a viewer can see that grid even when no two
tiles repeat.

"Almost surely" is a statement about probability, not a guarantee about one map.
A short run of identical bits is a run of identical edge colors, and it is a
legal run: a uniform patch of ground with no visible seam is not a bug in the
generator. A generator that promised *every* window of $k \times k$ cells to be
distinct would need a different construction and would no longer be constant
time per cell.

## Complexity

| Operation | Time | Space |
| --- | --- | --- |
| `edgeColor(x, y, seed, horizontal)` | $O(1)$ | $O(1)$ |
| `wangIndex` / `wangTileEdges` | $O(1)$ | $O(1)$ |
| `colorEdges` | $O(RC)$ | $O(RC)$ |
| `generateWangMap` | $O(RC)$ | $O(RC)$ |
| `wangTileAt` | $O(1)$ | $O(1)$ |

The edge lattice holds $(R+1)C + R(C+1) = 2RC + R + C$ colors, so both arrays
together are a little over two bytes per cell. There is no per-cell state beyond
`Uint8Array` storage, which is what makes the module usable for maps in the
millions of cells.

For comparison, a constraint solver on the same set must, per cell, intersect
candidate sets and propagate to neighbors; its cost per cell is bounded below by
the number of tiles it has not yet eliminated. The complete set lets this module
skip that entirely, which is the reason it exists alongside the WFC solver rather
than replacing it: WFC is for incomplete sets and pattern constraints, Wang tiles
are for the case where any arrangement is legal.

## Wrapping

`colorEdges({ ..., wrap: true })` copies the right column of vertical edges onto
the left column's opposite boundary and the bottom row of horizontal edges onto
the top row's, so the map becomes a valid tiling of a torus. Repeated in either
direction, it joins without a seam.

This is the one case where the lattice and `wangTileAt` disagree: the border
cells read copied edges, not hashed ones. It is meant for a single pannable
backdrop, not for chunked generation, whose entire purpose is that the border is
not copied.

## When not to use this

The set must be complete. A hand-authored tileset with a missing combination
turns the generator's guarantee into a silent invalid seam -- the right response
is to complete the set, not to add a fallback tile.

Edge color is a *category*, not a decoration. The tile art supplies the visual
continuity, and it is the edge strips that carry it. An edge prototype taken from
a busy part of an exemplar texture reinstates a lattice: the same flower appears
along every tile boundary.

Feature size is bounded by the tile. A structure wider than one tile is truncated
at every cell boundary. Ground, grass, sand, rubble and water are the intended
subjects; a building spanning four tiles is a decoration layer, not a Wang tile.

The tiles sit on a square grid, so the result is isotropic only in its colors.
A viewer looking for a lattice will still find the grid. Rotating the whole map
by an irrational angle hides it; making the tiles non-square does not.

Rotation and reflection are not part of the set. A renderer that flips a tile has
left the set and is drawing a different edge coloring, and the seams will say
so.

Three colors per direction give $3^4 = 81$ tiles. The authoring cost grows
faster than the variety, and the practical sets used in games are the two-color
one this module implements.

## Background

Hao Wang introduced the tiles in 1961 while studying the domino problem: given a
finite set of tiles, is it decidable whether it tiles the plane? He conjectured
that any tileable set admits a periodic tiling. Berger disproved the conjecture
in 1966 and showed the decision problem undecidable; the smallest known aperiodic
set today has eleven tiles (Jeandel and Rao, 2021). None of that is needed here,
because the complete stochastic set is not aperiodic by construction -- it is
periodic with probability zero, which is a different and much cheaper property.

The graphics use is due to Cohen, Shade, Hiller and Deussen (2003), who applied
Wang tiles to texture, Poisson-disk and geometry filling. The pixel-art
construction that motivates the demo builds sixteen tiles by stitching sampled
interiors to edge strips with the minimum-error boundary cut of Efros and Freeman
(2001), so the grass follows the seam instead of ending at it.

- Wang, H. (1961). *Proving theorems by pattern recognition II.* Bell System
  Technical Journal 40(1), 1--41. doi:10.1002/j.1538-7305.1961.tb03975.x
- Berger, R. (1966). *The undecidability of the domino problem.* Memoirs of the
  American Mathematical Society 66. doi:10.1090/memo/0066
- Cohen, M. F., Shade, J., Hiller, S., Deussen, O. (2003). *Wang tiles for image
  and texture generation.* ACM Transactions on Graphics 22(3), 287--294.
  doi:10.1145/882262.882265
- Efros, A. A., Freeman, W. T. (2001). *Image quilting for texture synthesis and
  transfer.* SIGGRAPH 2001, 341--346. doi:10.1145/383259.383296
- Jeandel, E., Rao, M. (2021). *An aperiodic set of 11 Wang tiles.* Advances in
  Combinatorics. doi:10.19086/aic.18614

## Pitfalls

Completeness is the precondition. `generateWangMap` reads a lattice and assumes
every quadruple has a tile; it never validates that a tileset contains all
sixteen. A caller with a partial tileset must check `fitsHorizontally` and
`fitsVertically` and decide what a missing tile means.

The edge grid is a shared field, not a per-chunk random draw. Seeding one PRNG
per chunk produces valid seams inside each chunk and visible seams at every
chunk border, because the two chunks have no way to agree on a shared edge.

`wangIndex` masks its arguments. That keeps a lattice read out of a `Uint8Array`
usable and keeps a two-bit plane packable into one byte, but it also means
`wangIndex(2, 0, 0, 0)` is not an error. Callers that care about a value outside
`{0, 1}` must check it before packing.

An empty lattice is empty, not padded. Rows or columns below one return zero-length
arrays rather than a lattice with a degenerate border, so a caller that indexes
`horizontal[0]` on a $0 \times C$ grid gets `undefined` instead of a color.

Which orientation an edge is on matters, and the two lattices are hashed with
different salts. Hashing them together gives a diagonal grain that only becomes
visible on a large map, long after a small fixture passes.

`wrap` and chunk borders are mutually exclusive. A wrapped map copies its border
edges; a chunked map derives them. Mixing the two produces a seam exactly one
tile wide, at the wrap.
