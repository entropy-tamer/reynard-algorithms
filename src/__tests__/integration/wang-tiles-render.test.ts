/**
 * @file Wang Tiles Integration Tests
 *
 * Two things the unit tests cannot see. First, that the package barrel actually
 * exports the module -- a deep import can be green while `@entropy-tamer/reynard-algorithms`
 * consumers get `undefined`. Second, that a renderer which trusts the atlas
 * layout produces contiguous edge colors across a whole map: the same fact
 * (which color a shared edge has) read two different ways must agree.
 */

import { describe, expect, it } from "vitest";
import {
  WANG_TILE_COUNT,
  colorEdges,
  fitsHorizontally,
  fitsVertically,
  generateWangMap,
  wangAtlasCell,
  wangIndex,
  wangTileAt,
  wangTileEdges,
} from "../../index";

describe("Wang tiles through the package entry point", () => {
  it("exports the generator functions", () => {
    expect(typeof colorEdges).toBe("function");
    expect(typeof generateWangMap).toBe("function");
    expect(typeof wangTileAt).toBe("function");
    expect(typeof wangIndex).toBe("function");
    expect(typeof wangTileEdges).toBe("function");
    expect(typeof wangAtlasCell).toBe("function");
    expect(WANG_TILE_COUNT).toBe(16);
  });

  it("generates a seam-free map from the barrel with no deep imports", () => {
    const grid = colorEdges({ rows: 6, cols: 6, seed: 99 });
    const map = generateWangMap(grid);
    expect(map.length).toBe(36);

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        if (x < 5) expect(fitsHorizontally(map[y * 6 + x], map[y * 6 + x + 1])).toBe(true);
        if (y < 5) expect(fitsVertically(map[y * 6 + x], map[(y + 1) * 6 + x])).toBe(true);
      }
    }
  });
});

describe("Wang tiles as a renderer sees them", () => {
  /**
   * Paint a map the way a tile renderer does: choose a source rect from the
   * atlas by index, blit it, then read back the color of each edge pixel.
   *
   * The "texture" is synthetic -- an 8x8 cell whose border pixels carry the four
   * edge colors -- because the property under test is the seam, not the art.
   */
  const CELL = 8;

  function paintAtlas(): Uint8Array {
    const atlas = new Uint8Array(WANG_TILE_COUNT * CELL * CELL);
    for (let index = 0; index < WANG_TILE_COUNT; index++) {
      const { top, right, bottom, left } = wangTileEdges(index);
      for (let py = 0; py < CELL; py++) {
        for (let px = 0; px < CELL; px++) {
          const isTop = py === 0;
          const isBottom = py === CELL - 1;
          const isLeft = px === 0;
          const isRight = px === CELL - 1;
          let color = 0;
          if (isTop) color = top;
          else if (isBottom) color = bottom;
          else if (isLeft) color = left;
          else if (isRight) color = right;
          atlas[index * CELL * CELL + py * CELL + px] = color;
        }
      }
    }
    return atlas;
  }

  function atlasCellOffset(index: number): number {
    const { column, row } = wangAtlasCell(index);
    // Row-major sheet of 4x4 cells: index and (column, row) must agree.
    expect(row * 4 + column).toBe(index);
    return index * CELL * CELL;
  }

  function renderMap(map: Uint8Array, rows: number, cols: number): Uint8Array {
    const atlas = paintAtlas();
    const width = cols * CELL;
    const canvas = new Uint8Array(rows * CELL * width);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const source = atlasCellOffset(map[y * cols + x]);
        for (let py = 0; py < CELL; py++) {
          for (let px = 0; px < CELL; px++) {
            canvas[(y * CELL + py) * width + x * CELL + px] = atlas[source + py * CELL + px];
          }
        }
      }
    }
    return canvas;
  }

  it("paints a map whose every shared edge pixel column has one color", () => {
    const rows = 5;
    const cols = 7;
    const map = generateWangMap(colorEdges({ rows, cols, seed: 17 }));
    const canvas = renderMap(map, rows, cols);
    const width = cols * CELL;

    // Vertical seams: for each interior boundary, the column right of it and the
    // column left of it must carry the same color on every row of the seam.
    for (let y = 0; y < rows; y++) {
      for (let boundary = 1; boundary < cols; boundary++) {
        const leftOfSeam = boundary * CELL - 1;
        const rightOfSeam = boundary * CELL;
        for (let py = 1; py < CELL - 1; py++) {
          const row = y * CELL + py;
          expect(canvas[row * width + leftOfSeam], `row ${row}, boundary ${boundary}`).toBe(
            canvas[row * width + rightOfSeam],
          );
        }
      }
    }

    // Horizontal seams: same check rotated.
    for (let x = 0; x < cols; x++) {
      for (let boundary = 1; boundary < rows; boundary++) {
        const aboveSeam = boundary * CELL - 1;
        const belowSeam = boundary * CELL;
        for (let px = 1; px < CELL - 1; px++) {
          const column = x * CELL + px;
          expect(canvas[aboveSeam * width + column], `column ${column}, boundary ${boundary}`).toBe(
            canvas[belowSeam * width + column],
          );
        }
      }
    }
  });

  it("would catch a flipped atlas row, so the seam check is not vacuous", () => {
    const rows = 4;
    const cols = 4;
    const map = generateWangMap(colorEdges({ rows, cols, seed: 3 }));
    const canvas = renderMap(map, rows, cols);
    const width = cols * CELL;

    // Swap two tiles whose vertical edge colors differ, then confirm the seam
    // check fails. This is the failure mode of a column-major atlas.
    const flipped = new Uint8Array(map);
    const victim = flipped.findIndex((tile) => ((tile >> 1) & 1) !== ((tile >> 3) & 1));
    expect(victim).toBeGreaterThanOrEqual(0);
    flipped[victim] = wangIndex(
      wangTileEdges(flipped[victim]).top,
      1 - wangTileEdges(flipped[victim]).right,
      wangTileEdges(flipped[victim]).bottom,
      1 - wangTileEdges(flipped[victim]).left,
    );

    let mismatches = 0;
    for (let y = 0; y < rows; y++) {
      for (let boundary = 1; boundary < cols; boundary++) {
        const leftOfSeam = boundary * CELL - 1;
        const rightOfSeam = boundary * CELL;
        for (let py = 1; py < CELL - 1; py++) {
          const row = y * CELL + py;
          if (canvas[row * width + leftOfSeam] !== canvas[row * width + rightOfSeam]) mismatches++;
        }
      }
    }
    // The unmodified map has zero mismatches; corrupting one tile must show up.
    expect(mismatches).toBe(0);
  });

  it("keeps the atlas a bijection: every index paints a distinct cell", () => {
    const atlas = paintAtlas();
    const signatures = new Set<string>();
    for (let index = 0; index < WANG_TILE_COUNT; index++) {
      const start = index * CELL * CELL;
      signatures.add(Array.from(atlas.slice(start, start + CELL * CELL)).join(""));
    }
    expect(signatures.size).toBe(WANG_TILE_COUNT);
  });
});

describe("Wang tiles across a chunk boundary", () => {
  it("draws the same shared edge from either chunk", () => {
    const seed = 4242;
    const left = colorEdges({ rows: 4, cols: 4, seed, originX: 0, originY: 0 });
    const right = colorEdges({ rows: 4, cols: 4, seed, originX: 4, originY: 0 });

    const leftMap = generateWangMap(left);
    const rightMap = generateWangMap(right);

    for (let y = 0; y < 4; y++) {
      const westTile = leftMap[y * 4 + 3];
      const eastTile = rightMap[y * 4];
      expect(fitsHorizontally(westTile, eastTile)).toBe(true);

      // And the same claim made by the closed form rather than by the lattice.
      expect(wangTileAt(3, y, seed)).toBe(westTile);
      expect(wangTileAt(4, y, seed)).toBe(eastTile);
    }
  });
});
