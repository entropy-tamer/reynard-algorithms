/**
 * Wang Tiles
 *
 * The complete two-color Wang tile set: one tile per edge combination,
 * selected in constant time from a hashed edge lattice.
 *
 * @module algorithms/procedural-generation/wang-tiles/wang-tiles-core
 */

import type {
  WangAtlasCell,
  WangColor,
  WangEdgeGrid,
  WangEdgeGridOptions,
  WangTileEdges,
} from "./wang-tiles-types";

/** Number of tiles in the complete two-color set, `2^4`. */
export const WANG_TILE_COUNT = 16;

/** Side of the packed square atlas, in tiles. */
export const WANG_ATLAS_SIDE = 4;

/**
 * Distinguishes the horizontal edge lattice from the vertical one in the hash.
 *
 * Without it, the horizontal edge at `(x, y)` and the vertical edge at `(x, y)`
 * would receive the same color, and the map would develop a diagonal grain.
 */
const HORIZONTAL_SALT = 0x9e3779b1;

/** The vertical lattice's salt; see {@link HORIZONTAL_SALT}. */
const VERTICAL_SALT = 0x85ebca6b;

/**
 * A 32-bit hash of a lattice position and a seed.
 *
 * Deterministic across engines: every operation is `Math.imul`, `^` and an
 * unsigned shift, and the result is read as unsigned, so the same coordinates
 * produce the same color on every machine and in every process. That property
 * is what makes chunked worlds agree -- the edge is a function of where it is,
 * not of the order in which it was visited.
 *
 * @param x - Column of the edge, in world tile units. May be negative.
 * @param y - Row of the edge, in world tile units. May be negative.
 * @param seed - Hash seed.
 * @param salt - Lattice tag, so the two orientations hash differently.
 * @returns An unsigned 32-bit value.
 */
function hashEdge(x: number, y: number, seed: number, salt: number): number {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1);
  h = Math.imul(h ^ (seed | 0), 0x9e3779b1) ^ salt;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * The color of one edge of the dual lattice.
 *
 * The single source of truth for both the finite builder and the infinite
 * query, so the two cannot drift apart. One bit of the hash is the color; the
 * rest is discarded, which is why the tiling is non-periodic only almost surely
 * -- a run of identical bits is a run of identical edge colors, and it is a
 * legal run.
 *
 * @param x - Column of the edge, in world tile units.
 * @param y - Row of the edge, in world tile units.
 * @param seed - Hash seed.
 * @param horizontal - `true` for a horizontal edge, `false` for a vertical one.
 * @returns The edge color, `0` or `1`.
 */
export function edgeColor(
  x: number,
  y: number,
  seed: number,
  horizontal: boolean,
): WangColor {
  const salt = horizontal ? HORIZONTAL_SALT : VERTICAL_SALT;
  return (hashEdge(x, y, seed, salt) & 1) as WangColor;
}

/**
 * The tile index of four edge colors.
 *
 * The packing is `index = top + 2 * right + 4 * bottom + 8 * left`, which is the
 * convention used by the published pixel-art tilesets and by the 4x4 atlas: the
 * low two bits walk around the tile. Every one of the sixteen combinations maps
 * to a distinct index, so the inverse is a table lookup rather than a search.
 *
 * Values outside `{0, 1}` are masked with `& 1` rather than rejected: a lattice
 * read straight out of a `Uint8Array` is already a number, and a caller that
 * packs a two-bit plane into one byte still gets a valid tile.
 *
 * @param top - Color of the top edge.
 * @param right - Color of the right edge.
 * @param bottom - Color of the bottom edge.
 * @param left - Color of the left edge.
 * @returns The tile index, `0..15`.
 *
 * @example
 * ```typescript
 * wangIndex(0, 1, 1, 0); // 2 + 4 = 6
 * ```
 */
export function wangIndex(top: number, right: number, bottom: number, left: number): number {
  return (top & 1) + ((right & 1) << 1) + ((bottom & 1) << 2) + ((left & 1) << 3);
}

/**
 * The four edge colors of a tile index.
 *
 * The inverse of {@link wangIndex}. A renderer uses it to decide which edge
 * strips belong on the tile it is drawing, and a test uses it to prove the
 * packing is a bijection.
 *
 * @param index - A tile index, `0..15`.
 * @returns The tile's edge colors, in top/right/bottom/left order.
 *
 * @example
 * ```typescript
 * wangTileEdges(6); // { top: 0, right: 1, bottom: 1, left: 0 }
 * ```
 */
export function wangTileEdges(index: number): WangTileEdges {
  const i = index & 15;
  return {
    top: (i & 1) as WangColor,
    right: ((i >> 1) & 1) as WangColor,
    bottom: ((i >> 2) & 1) as WangColor,
    left: ((i >> 3) & 1) as WangColor,
  };
}

/**
 * Where a tile index sits on the 4x4 atlas sheet.
 *
 * Row-major, four columns: index `0..3` are the first row. The mapping is part
 * of the public surface because the atlas is a contract between this module and
 * whatever draws it -- a sheet laid out by column would put every tile in the
 * wrong place and every seam would still pass a color test.
 *
 * @param index - A tile index, `0..15`.
 * @returns The atlas column and row.
 */
export function wangAtlasCell(index: number): WangAtlasCell {
  const i = index & 15;
  return { column: i & 3, row: i >> 2 };
}

/**
 * Color an edge lattice from a seed.
 *
 * Produces the dual grid, not the tiles. Every edge is evaluated independently,
 * so the cost is the number of edges -- `(rows + 1) * cols + rows * (cols + 1)`,
 * which is `O(rows * cols)` -- and no two cells ever communicate.
 *
 * A lattice with fewer than one row or one column has no cell to read it, and
 * comes back with empty arrays rather than a partly-filled one.
 *
 * With `wrap`, the right and bottom boundary edges are copied from the left and
 * top edges, making the map a valid tiling of a torus. That is the one case
 * where a lattice is not the same field {@link wangTileAt} describes at the
 * border.
 *
 * @param options - Dimensions, seed and world origin of the lattice.
 * @returns The colored edge lattice.
 *
 * @example
 * ```typescript
 * const grid = colorEdges({ rows: 32, cols: 32, seed: 7 });
 * const map = generateWangMap(grid); // 1024 tile indices
 * ```
 */
export function colorEdges(options: WangEdgeGridOptions): WangEdgeGrid {
  const rows = Math.max(0, Math.floor(options.rows));
  const cols = Math.max(0, Math.floor(options.cols));
  const seed = Math.trunc(options.seed ?? 0) | 0;
  const originX = Math.trunc(options.originX ?? 0);
  const originY = Math.trunc(options.originY ?? 0);

  if (rows < 1 || cols < 1) {
    return { rows, cols, horizontal: new Uint8Array(0), vertical: new Uint8Array(0) };
  }

  const horizontal = new Uint8Array((rows + 1) * cols);
  const vertical = new Uint8Array(rows * (cols + 1));

  for (let y = 0; y <= rows; y++) {
    const row = y * cols;
    for (let x = 0; x < cols; x++) {
      horizontal[row + x] = edgeColor(originX + x, originY + y, seed, true);
    }
  }

  const verticalRow = cols + 1;
  for (let y = 0; y < rows; y++) {
    const row = y * verticalRow;
    for (let x = 0; x <= cols; x++) {
      vertical[row + x] = edgeColor(originX + x, originY + y, seed, false);
    }
  }

  if (options.wrap) {
    const top = 0;
    const bottom = rows * cols;
    for (let x = 0; x < cols; x++) {
      horizontal[bottom + x] = horizontal[top + x];
    }
    for (let y = 0; y < rows; y++) {
      const row = y * verticalRow;
      vertical[row + cols] = vertical[row];
    }
  }

  return { rows, cols, horizontal, vertical };
}

/**
 * Read one tile index per cell from a colored lattice.
 *
 * Constant work per cell: four array reads and one additive packing. There is
 * no compatibility test, no backtracking and no retry, because the set is
 * complete -- every four-edge combination is a tile, so the cell's four edges
 * *are* its tile.
 *
 * @param grid - A lattice produced by {@link colorEdges}.
 * @returns `rows * cols` tile indices in row-major order.
 *
 * @example
 * ```typescript
 * const grid = colorEdges({ rows: 4, cols: 4, seed: 1 });
 * const map = generateWangMap(grid); // length 16, values 0..15
 * ```
 */
export function generateWangMap(grid: WangEdgeGrid): Uint8Array {
  const { rows, cols, horizontal, vertical } = grid;
  if (rows < 1 || cols < 1) return new Uint8Array(0);

  const map = new Uint8Array(rows * cols);
  const verticalRow = cols + 1;
  for (let y = 0; y < rows; y++) {
    const top = y * cols;
    const bottom = (y + 1) * cols;
    const left = y * verticalRow;
    const out = y * cols;
    for (let x = 0; x < cols; x++) {
      map[out + x] = wangIndex(
        horizontal[top + x],
        vertical[left + x + 1],
        horizontal[bottom + x],
        vertical[left + x],
      );
    }
  }
  return map;
}

/**
 * The tile index at one world cell, without building a lattice.
 *
 * Four hashes, one packing, no allocation. This is the infinite and chunked
 * form: the answer depends only on `(x, y, seed)`, so a tile near a chunk border
 * gets the same edges its neighbor across the border computes.
 *
 * @param x - World column of the cell.
 * @param y - World row of the cell.
 * @param seed - Hash seed. Default `0`.
 * @returns The tile index, `0..15`.
 *
 * @example
 * ```typescript
 * wangTileAt(0, 0, 9);
 * ```
 */
export function wangTileAt(x: number, y: number, seed = 0): number {
  return wangIndex(
    edgeColor(x, y, seed, true),
    edgeColor(x + 1, y, seed, false),
    edgeColor(x, y + 1, seed, true),
    edgeColor(x, y, seed, false),
  );
}

/**
 * Whether two tile indices may sit side by side horizontally.
 *
 * A row `b` may follow row `a` to the right when `a`'s right edge equals `b`'s
 * left edge. The complete set makes this true for exactly half of the sixteen
 * candidates, which is the count a solver would have to keep collapsing and a
 * closed-form generator never does.
 *
 * @param left - Tile index of the left-hand tile.
 * @param right - Tile index of the right-hand tile.
 * @returns `true` when the shared edge colors agree.
 */
export function fitsHorizontally(left: number, right: number): boolean {
  return ((left >> 1) & 1) === ((right >> 3) & 1);
}

/**
 * Whether two tile indices may sit one above the other.
 *
 * @param upper - Tile index of the upper tile.
 * @param lower - Tile index of the lower tile.
 * @returns `true` when the shared edge colors agree.
 */
export function fitsVertically(upper: number, lower: number): boolean {
  return ((upper >> 2) & 1) === (lower & 1);
}
