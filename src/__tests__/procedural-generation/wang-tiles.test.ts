/**
 * @file Wang Tiles Core Algorithm Tests
 *
 * The complete two-color set has no solver, so the interesting failures are not
 * "did it find a tiling" but "does the arithmetic agree with the geometry":
 * a wrong packing still produces sixteen plausible indices, and a per-chunk PRNG
 * still produces a tile in every cell. The tests below assert agreement across
 * seams, which is the property a wrong implementation loses first.
 */

import { describe, expect, it } from "vitest";
import {
  WANG_ATLAS_SIDE,
  WANG_TILE_COUNT,
  colorEdges,
  edgeColor,
  fitsHorizontally,
  fitsVertically,
  generateWangMap,
  wangAtlasCell,
  wangIndex,
  wangTileAt,
  wangTileEdges,
} from "../../algorithms/procedural-generation/wang-tiles/wang-tiles-core";
import type {
  WangEdgeGrid,
} from "../../algorithms/procedural-generation/wang-tiles/wang-tiles-types";

/** Every ordered quadruple of two colors, in the packing order. */
const ALL_EDGE_QUADRUPLES: Array<[number, number, number, number]> = [];
for (let top = 0; top < 2; top++) {
  for (let right = 0; right < 2; right++) {
    for (let bottom = 0; bottom < 2; bottom++) {
      for (let left = 0; left < 2; left++) {
        ALL_EDGE_QUADRUPLES.push([top, right, bottom, left]);
      }
    }
  }
}

/**
 * Slice a lattice into a sub-lattice, the way a chunk loader does.
 *
 * Reads the shared edges out of the parent instead of re-deriving them, so the
 * helper cannot accidentally make the sub-lattice self-consistent for reasons
 * other than the parent being consistent.
 */
function sliceGrid(
  grid: WangEdgeGrid,
  originX: number,
  originY: number,
  rows: number,
  cols: number,
): WangEdgeGrid {
  const verticalRow = grid.cols + 1;
  const horizontal = new Uint8Array((rows + 1) * cols);
  const vertical = new Uint8Array(rows * (cols + 1));

  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x < cols; x++) {
      horizontal[y * cols + x] = grid.horizontal[(originY + y) * grid.cols + originX + x];
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x <= cols; x++) {
      vertical[y * (cols + 1) + x] = grid.vertical[(originY + y) * verticalRow + originX + x];
    }
  }
  return { rows, cols, horizontal, vertical };
}

describe("Wang tiles", () => {
  describe("wangIndex", () => {
    it("maps the sixteen edge combinations to sixteen distinct indices", () => {
      const seen = new Set<number>();
      for (const [top, right, bottom, left] of ALL_EDGE_QUADRUPLES) {
        seen.add(wangIndex(top, right, bottom, left));
      }
      expect(seen.size).toBe(WANG_TILE_COUNT);
      expect([...seen].sort((a, b) => a - b)).toEqual([...Array(WANG_TILE_COUNT).keys()]);
    });

    it("round-trips through wangTileEdges", () => {
      for (let index = 0; index < WANG_TILE_COUNT; index++) {
        const { top, right, bottom, left } = wangTileEdges(index);
        expect(wangIndex(top, right, bottom, left)).toBe(index);
      }
    });

    it("packs top into bit 0, right into 1, bottom into 2 and left into 3", () => {
      expect(wangIndex(1, 0, 0, 0)).toBe(1);
      expect(wangIndex(0, 1, 0, 0)).toBe(2);
      expect(wangIndex(0, 0, 1, 0)).toBe(4);
      expect(wangIndex(0, 0, 0, 1)).toBe(8);
      expect(wangIndex(1, 1, 1, 1)).toBe(15);
    });

    it("masks values that are not clean colors", () => {
      expect(wangIndex(2, 3, 0, 1)).toBe(wangIndex(0, 1, 0, 1));
      expect(wangIndex(-1, 0, 0, 0)).toBe(1);
    });

    it("clamps an out-of-range index read back", () => {
      expect(wangTileEdges(18)).toEqual(wangTileEdges(2));
    });
  });

  describe("atlas layout", () => {
    it("covers the 4x4 sheet exactly once", () => {
      const cells = new Set<string>();
      for (let index = 0; index < WANG_TILE_COUNT; index++) {
        const { column, row } = wangAtlasCell(index);
        expect(column).toBeGreaterThanOrEqual(0);
        expect(column).toBeLessThan(WANG_ATLAS_SIDE);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(WANG_ATLAS_SIDE);
        cells.add(`${column},${row}`);
      }
      expect(cells.size).toBe(WANG_TILE_COUNT);
    });

    it("lays the sheet out row-major", () => {
      expect(wangAtlasCell(0)).toEqual({ column: 0, row: 0 });
      expect(wangAtlasCell(3)).toEqual({ column: 3, row: 0 });
      expect(wangAtlasCell(4)).toEqual({ column: 0, row: 1 });
      expect(wangAtlasCell(15)).toEqual({ column: 3, row: 3 });
    });
  });

  describe("edge compatibility", () => {
    it("agrees with wangTileEdges for all 256 ordered pairs", () => {
      for (let a = 0; a < WANG_TILE_COUNT; a++) {
        for (let b = 0; b < WANG_TILE_COUNT; b++) {
          const left = wangTileEdges(a);
          const right = wangTileEdges(b);
          expect(fitsHorizontally(a, b)).toBe(left.right === right.left);
          expect(fitsVertically(a, b)).toBe(left.bottom === right.top);
        }
      }
    });

    it("admits exactly half the candidates on each axis", () => {
      for (let a = 0; a < WANG_TILE_COUNT; a++) {
        let horizontal = 0;
        let vertical = 0;
        for (let b = 0; b < WANG_TILE_COUNT; b++) {
          if (fitsHorizontally(a, b)) horizontal++;
          if (fitsVertically(a, b)) vertical++;
        }
        expect(horizontal).toBe(WANG_TILE_COUNT / 2);
        expect(vertical).toBe(WANG_TILE_COUNT / 2);
      }
    });
  });

  describe("edgeColor", () => {
    it("is deterministic", () => {
      for (let i = 0; i < 64; i++) {
        const x = i * 37 - 500;
        const y = i * 11 - 90;
        expect(edgeColor(x, y, 42, true)).toBe(edgeColor(x, y, 42, true));
        expect(edgeColor(x, y, 42, false)).toBe(edgeColor(x, y, 42, false));
      }
    });

    it("never returns anything but 0 or 1", () => {
      for (let i = 0; i < 512; i++) {
        const value = edgeColor(i * 7, i * 13, i, i % 2 === 0);
        expect(value === 0 || value === 1).toBe(true);
      }
    });

    it("separates the two lattice orientations", () => {
      let differ = 0;
      for (let i = 0; i < 256; i++) {
        if (edgeColor(i, i * 3, 5, true) !== edgeColor(i, i * 3, 5, false)) differ++;
      }
      // A shared salt would make this zero; independent salts leave it near half.
      expect(differ).toBeGreaterThan(64);
      expect(differ).toBeLessThan(192);
    });

    it("reaches both colors over a small patch", () => {
      const counts = [0, 0];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          counts[edgeColor(x, y, 3, true)]++;
          counts[edgeColor(x, y, 3, false)]++;
        }
      }
      expect(counts[0]).toBeGreaterThan(40);
      expect(counts[1]).toBeGreaterThan(40);
    });
  });

  describe("colorEdges", () => {
    it("allocates the two dual lattices at their documented sizes", () => {
      const grid = colorEdges({ rows: 5, cols: 7, seed: 1 });
      expect(grid.rows).toBe(5);
      expect(grid.cols).toBe(7);
      expect(grid.horizontal.length).toBe((5 + 1) * 7);
      expect(grid.vertical.length).toBe(5 * (7 + 1));
    });

    it("returns an empty lattice instead of a partly-filled one", () => {
      for (const [rows, cols] of [
        [0, 4],
        [4, 0],
        [-3, 4],
        [4, -3],
        [0, 0],
      ]) {
        const grid = colorEdges({ rows, cols, seed: 2 });
        expect(grid.horizontal.length).toBe(0);
        expect(grid.vertical.length).toBe(0);
        expect(generateWangMap(grid).length).toBe(0);
      }
    });

    it("is reproducible for a seed", () => {
      const a = colorEdges({ rows: 9, cols: 9, seed: 11 });
      const b = colorEdges({ rows: 9, cols: 9, seed: 11 });
      expect(Array.from(a.horizontal)).toEqual(Array.from(b.horizontal));
      expect(Array.from(a.vertical)).toEqual(Array.from(b.vertical));
    });

    it("changes with the seed", () => {
      const a = generateWangMap(colorEdges({ rows: 16, cols: 16, seed: 11 }));
      const b = generateWangMap(colorEdges({ rows: 16, cols: 16, seed: 12 }));
      expect(Array.from(a)).not.toEqual(Array.from(b));
    });

    it("matches wangTileAt for the same origin and seed", () => {
      const seed = 77;
      const originX = -6;
      const originY = 13;
      const grid = colorEdges({ rows: 5, cols: 5, seed, originX, originY });
      const map = generateWangMap(grid);
      for (let y = 0; y < grid.rows; y++) {
        for (let x = 0; x < grid.cols; x++) {
          expect(map[y * grid.cols + x]).toBe(wangTileAt(originX + x, originY + y, seed));
        }
      }
    });

    it("allows negative world origins without wrapping the hash", () => {
      const grid = colorEdges({ rows: 3, cols: 3, seed: 4, originX: -2, originY: -2 });
      const map = generateWangMap(grid);
      expect(map[0]).toBe(wangTileAt(-2, -2, 4));
      expect(map[8]).toBe(wangTileAt(0, 0, 4));
    });
  });

  describe("generateWangMap", () => {
    const grid = colorEdges({ rows: 24, cols: 32, seed: 2026 });
    const map = generateWangMap(grid);

    it("emits one tile per cell", () => {
      expect(map.length).toBe(24 * 32);
      for (const value of map) expect(value).toBeLessThan(WANG_TILE_COUNT);
    });

    it("agrees across every horizontal seam", () => {
      for (let y = 0; y < grid.rows; y++) {
        for (let x = 0; x < grid.cols - 1; x++) {
          const left = map[y * grid.cols + x];
          const right = map[y * grid.cols + x + 1];
          expect(fitsHorizontally(left, right), `row ${y}, seam ${x}`).toBe(true);
        }
      }
    });

    it("agrees across every vertical seam", () => {
      for (let y = 0; y < grid.rows - 1; y++) {
        for (let x = 0; x < grid.cols; x++) {
          const upper = map[y * grid.cols + x];
          const lower = map[(y + 1) * grid.cols + x];
          expect(fitsVertically(upper, lower), `column ${x}, seam ${y}`).toBe(true);
        }
      }
    });

    it("uses all sixteen tiles on a large-enough map", () => {
      const large = generateWangMap(colorEdges({ rows: 64, cols: 64, seed: 2026 }));
      const seen = new Set(large);
      expect(seen.size).toBe(WANG_TILE_COUNT);
    });

    it("is not a repeating tile", () => {
      const distinct = new Set(map);
      expect(distinct.size).toBeGreaterThan(8);
    });

    it("is not periodic with the tile count", () => {
      // A degenerate generator that repeats a 4x4 or 8x8 patch would survive the
      // seam test; compare rows far enough apart that a small period would show.
      let equalRows = 0;
      for (let x = 0; x < grid.cols; x++) {
        if (map[x] === map[8 * grid.cols + x]) equalRows++;
      }
      expect(equalRows).toBeLessThan(grid.cols);
    });
  });

  describe("chunked generation", () => {
    it("reproduces a large map from four independently generated quadrants", () => {
      const seed = 31;
      const rows = 8;
      const cols = 8;
      const whole = generateWangMap(colorEdges({ rows, cols, seed }));

      const quadrants = [
        { originX: 0, originY: 0 },
        { originX: 4, originY: 0 },
        { originX: 0, originY: 4 },
        { originX: 4, originY: 4 },
      ].map(({ originX, originY }) =>
        generateWangMap(colorEdges({ rows: 4, cols: 4, seed, originX, originY })),
      );

      const stitched = new Uint8Array(rows * cols);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const quadrant = (y < 4 ? 0 : 2) + (x < 4 ? 0 : 1);
          const localX = x % 4;
          const localY = y % 4;
          stitched[y * cols + x] = quadrants[quadrant][localY * 4 + localX];
        }
      }

      expect(Array.from(stitched)).toEqual(Array.from(whole));
    });

    it("stitches a sliced lattice back to the same map", () => {
      const seed = 8;
      const whole = colorEdges({ rows: 10, cols: 12, seed });
      const piece = sliceGrid(whole, 3, 2, 4, 5);
      const wholeMap = generateWangMap(whole);
      const pieceMap = generateWangMap(piece);

      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 5; x++) {
          expect(pieceMap[y * 5 + x]).toBe(wholeMap[(y + 2) * 12 + x + 3]);
        }
      }
    });
  });

  describe("wangTileAt", () => {
    it("is a pure function of position and seed", () => {
      expect(wangTileAt(12, -34, 5)).toBe(wangTileAt(12, -34, 5));
      expect(wangTileAt(12, -34, 5)).not.toBe(wangTileAt(12, -34, 6));
    });

    it("defaults to seed zero", () => {
      expect(wangTileAt(7, 9)).toBe(wangTileAt(7, 9, 0));
    });

    it("returns a valid tile index", () => {
      for (let y = -20; y < 20; y++) {
        for (let x = -20; x < 20; x++) {
          const tile = wangTileAt(x, y, 3);
          expect(Number.isInteger(tile)).toBe(true);
          expect(tile).toBeGreaterThanOrEqual(0);
          expect(tile).toBeLessThan(WANG_TILE_COUNT);
        }
      }
    });

    it("agrees with its neighbors across a chunk border", () => {
      for (let y = -8; y < 8; y++) {
        expect(fitsHorizontally(wangTileAt(-1, y, 2), wangTileAt(0, y, 2))).toBe(true);
        expect(fitsVertically(wangTileAt(y, -1, 2), wangTileAt(y, 0, 2))).toBe(true);
      }
    });
  });

  describe("wrapping", () => {
    it("joins the right edge to the left edge", () => {
      const grid = colorEdges({ rows: 9, cols: 11, seed: 6, wrap: true });
      const map = generateWangMap(grid);
      for (let y = 0; y < grid.rows; y++) {
        const last = map[y * grid.cols + grid.cols - 1];
        const first = map[y * grid.cols];
        expect(fitsHorizontally(last, first), `row ${y}`).toBe(true);
      }
    });

    it("joins the bottom edge to the top edge", () => {
      const grid = colorEdges({ rows: 9, cols: 11, seed: 6, wrap: true });
      const map = generateWangMap(grid);
      for (let x = 0; x < grid.cols; x++) {
        const bottom = map[(grid.rows - 1) * grid.cols + x];
        const top = map[x];
        expect(fitsVertically(bottom, top), `column ${x}`).toBe(true);
      }
    });

    it("keeps interior seams valid", () => {
      const grid = colorEdges({ rows: 9, cols: 11, seed: 6, wrap: true });
      const map = generateWangMap(grid);
      for (let y = 0; y < grid.rows; y++) {
        for (let x = 0; x < grid.cols - 1; x++) {
          expect(fitsHorizontally(map[y * grid.cols + x], map[y * grid.cols + x + 1])).toBe(true);
        }
      }
      for (let y = 0; y < grid.rows - 1; y++) {
        for (let x = 0; x < grid.cols; x++) {
          expect(fitsVertically(map[y * grid.cols + x], map[(y + 1) * grid.cols + x])).toBe(true);
        }
      }
    });

    it("differs from the unwrapped border, so the test above is not vacuous", () => {
      const plain = generateWangMap(colorEdges({ rows: 9, cols: 11, seed: 6 }));
      const wrapped = generateWangMap(colorEdges({ rows: 9, cols: 11, seed: 6, wrap: true }));
      expect(Array.from(plain)).not.toEqual(Array.from(wrapped));

      let wrappedSeams = 0;
      let plainSeams = 0;
      for (let y = 0; y < 9; y++) {
        if (fitsHorizontally(wrapped[y * 11 + 10], wrapped[y * 11])) wrappedSeams++;
        if (fitsHorizontally(plain[y * 11 + 10], plain[y * 11])) plainSeams++;
      }
      expect(wrappedSeams).toBe(9);
      expect(plainSeams).toBeLessThan(9);
    });
  });
});
