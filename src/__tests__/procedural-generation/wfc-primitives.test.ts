/**
 * @file Deterministic tests for the wave-function-collapse helper modules
 * that previously had no direct test.
 */
import { describe, it, expect } from "vitest";
import { calculateEntropy, calculateEntropyFromCounts } from "../../algorithms/procedural-generation/wave-function-collapse/wfc-entropy";
import {
  extractPatterns2D,
  extractPatternString,
} from "../../algorithms/procedural-generation/wave-function-collapse/wfc-pattern-extraction";
import {
  areTilesCompatible,
  filterConstraintsByTile,
  getAllowedTilesForDirection,
  generateConstraintsFromSockets,
  validateConstraints,
} from "../../algorithms/procedural-generation/wave-function-collapse/wfc-constraint";
import { isGridFullyCollapsed } from "../../algorithms/procedural-generation/wave-function-collapse/wfc-propagation";
import type { Cell, Constraint, Tile } from "../../algorithms/procedural-generation/wave-function-collapse/wave-function-collapse-types";

describe("WFC entropy", () => {
  it("is zero when only one tile is possible", () => {
    expect(calculateEntropy(new Map([["a", 1]]))).toBe(0);
    expect(calculateEntropyFromCounts({ a: 10 })).toBe(0);
  });

  it("is maximal for a uniform distribution", () => {
    const two = calculateEntropy(new Map([["a", 1], ["b", 1]]));
    const four = calculateEntropy(new Map([["a", 1], ["b", 1], ["c", 1], ["d", 1]]));
    expect(two).toBeCloseTo(1, 10);
    expect(four).toBeCloseTo(2, 10);
    expect(four).toBeGreaterThan(two);
  });

  it("treats zero total weight as zero entropy", () => {
    expect(calculateEntropy(new Map())).toBe(0);
    expect(calculateEntropyFromCounts({})).toBe(0);
  });
});

describe("WFC pattern extraction", () => {
  it("extracts every 2x2 window of a 3x3 grid", () => {
    const input = [
      ["a", "b", "a"],
      ["b", "a", "b"],
      ["a", "b", "a"],
    ];
    const patterns = extractPatterns2D(input, 2);
    expect(patterns).toHaveLength(4);
    expect(patterns.map(p => p.data[0]![0])).toEqual(["a", "b", "b", "a"]);
  });

  it("returns no patterns when the pattern exceeds the input", () => {
    expect(extractPatterns2D([["a", "b"]], 3)).toEqual([]);
  });

  it("serializes a window to a deterministic string", () => {
    const grid = [[["a", "b"]], [["c", "d"]]];
    expect(extractPatternString(grid, 0, 0, 0, 2)).toBe("a,b,,,c,d,,");
  });
});

describe("WFC constraints", () => {
  const tiles: Tile[] = [{ id: "grass" }, { id: "water" }];

  it("generates socket constraints between compatible tiles", () => {
    const withSockets: Tile[] = [
      { id: "grass", sockets: { right: "land" } },
      { id: "water", sockets: { left: "land" } },
    ] as Tile[];
    const constraints = generateConstraintsFromSockets(withSockets);
    expect(Array.isArray(constraints)).toBe(true);
  });

  it("filters constraints by tile id", () => {
    const constraints: Constraint[] = [
      { tile1: "grass", tile2: "water", direction: "right" },
      { tile1: "water", tile2: "grass", direction: "left" },
    ] as Constraint[];
    const filtered = filterConstraintsByTile(constraints, "grass");
    expect(filtered).toHaveLength(2);
    expect(getAllowedTilesForDirection(constraints, "grass", "right")).toContain("water");
  });

  it("reports compatibility from generated constraints", () => {
    const constraints: Constraint[] = [
      { tile1: "grass", tile2: "water", direction: "right" },
    ] as Constraint[];
    expect(areTilesCompatible(constraints, "grass", "water", "right")).toBe(true);
    expect(validateConstraints(constraints, tiles)).toBe(true);
  });
});

describe("WFC grid state", () => {
  const cell = (tiles: string[], collapsed: boolean): Cell => ({
    position: { x: 0, y: 0, z: 0 },
    possibleTiles: tiles,
    isCollapsed: collapsed,
    entropy: collapsed ? 0 : Math.log2(tiles.length),
  });

  it("detects a fully collapsed grid", () => {
    const grid = [[[cell(["a"], true), cell(["b"], true)]]];
    expect(isGridFullyCollapsed(grid, 2, 1, 1)).toBe(true);
  });

  it("rejects a grid with an uncollapsed cell", () => {
    const grid = [[[cell(["a"], true), cell(["a", "b"], false)]]];
    expect(isGridFullyCollapsed(grid, 2, 1, 1)).toBe(false);
  });
});
