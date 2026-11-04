/**
 * Wang Tiles
 *
 * Type definitions for the complete two-color Wang tile set.
 *
 * @module algorithms/procedural-generation/wang-tiles/wang-tiles-types
 */

/**
 * One of the two edge colors of the complete set.
 *
 * The set is complete, so the alphabet is exactly `{0, 1}`: every combination of
 * four edge colors is present as a tile. A larger alphabet is a larger atlas
 * (`k^4` tiles), not a different algorithm.
 */
export type WangColor = 0 | 1;

/**
 * The four edge colors a single tile carries.
 *
 * Tiles are never rotated or reflected, so `top` means the top edge of the tile
 * as authored. A renderer that flips the sprite has left the tile set and is
 * drawing something else.
 */
export interface WangTileEdges {
  /** Color of the top edge. */
  readonly top: WangColor;
  /** Color of the right edge. */
  readonly right: WangColor;
  /** Color of the bottom edge. */
  readonly bottom: WangColor;
  /** Color of the left edge. */
  readonly left: WangColor;
}

/**
 * The dual edge lattice a finite map is read from.
 *
 * Horizontal edges live on a `(rows + 1) x cols` grid and vertical edges on a
 * `rows x (cols + 1)` grid, because a row of `cols` tiles is bounded above and
 * below and a column of `rows` tiles is bounded left and right. Cell `(x, y)`
 * reads `horizontal[y * cols + x]` on top, `horizontal[(y + 1) * cols + x]` on
 * the bottom, `vertical[y * (cols + 1) + x]` on the left and
 * `vertical[y * (cols + 1) + x + 1]` on the right.
 *
 * Both arrays hold `0` or `1`. Neighboring cells read the same array slot for
 * their shared edge, which is what makes the tiling agree by construction rather
 * than by search.
 */
export interface WangEdgeGrid {
  /** Number of tile rows. */
  readonly rows: number;
  /** Number of tile columns. */
  readonly cols: number;
  /** Horizontal edges, `(rows + 1) * cols` values, indexed `y * cols + x`. */
  readonly horizontal: Uint8Array;
  /** Vertical edges, `rows * (cols + 1)` values, indexed `y * (cols + 1) + x`. */
  readonly vertical: Uint8Array;
}

/**
 * Where one tile sits on the packed 4x4 atlas sheet.
 *
 * Index `i` occupies row `i >> 2` and column `i & 3`, which is the layout most
 * tileset authors already use: sixteen 32 px tiles make one 128 px sheet.
 */
export interface WangAtlasCell {
  /** Zero-based column, `0..3`. */
  readonly column: number;
  /** Zero-based row, `0..3`. */
  readonly row: number;
}

/**
 * How to color an edge lattice.
 *
 * The colors are a pure function of the *world* edge coordinate and the seed,
 * so two chunks generated with different origins still agree on the edges they
 * share. A generator that seeded one PRNG per chunk would not: the second chunk
 * would have no way to ask what the first chunk chose along the seam.
 */
export interface WangEdgeGridOptions {
  /** Number of tile rows. Values below `1` produce an empty lattice. */
  readonly rows: number;
  /** Number of tile columns. Values below `1` produce an empty lattice. */
  readonly cols: number;
  /** Hash seed. The same seed and origin always produce the same lattice. */
  readonly seed?: number;
  /** World column of the lattice's first tile. Default `0`. */
  readonly originX?: number;
  /** World row of the lattice's first tile. Default `0`. */
  readonly originY?: number;
  /**
   * Mirror the boundary edges onto the opposite side, so the map is a valid
   * tiling of a torus and repeats seamlessly.
   *
   * The right column of vertical edges is copied from the left column, and the
   * bottom row of horizontal edges from the top row. Interior adjacencies are
   * untouched; only the two wrap pairs change, which is why a wrapped lattice is
   * no longer the same map as {@link wangTileAt} would give at its border.
   *
   * Use this for a single pannable backdrop or a background that scrolls; do not
   * combine it with chunked generation, whose whole point is that the border is
   * *not* copied.
   *
   * Default `false`.
   */
  readonly wrap?: boolean;
}
