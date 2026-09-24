/**
 * Shadowcasting Field-of-View Tests
 *
 * shadowcasting.ts was rewritten (2026-08-24) as classic recursive
 * shadowcasting: slope bounds persist across rows via recursion and octant
 * transforms are disjoint. Opaque tiles now genuinely occlude. The former
 * "documented limitation" block below asserts CORRECT occlusion behavior;
 * these are regression guards for the rewrite, not pins of broken behavior.
 */

import { describe, it, expect } from "vitest";
import { shadowcastingFOV } from "../../algorithms/pathfinding/visibility/shadowcasting";

/** All cells within Euclidean distance <= r of origin (integer coords). */
function euclideanDisk(r: number): Set<string> {
  const disk = new Set<string>();
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (Math.hypot(x, y) <= r + 1e-9) disk.add(`${x},${y}`);
    }
  }
  return disk;
}

describe("shadowcastingFOV", () => {
  it("marks the origin visible", () => {
    const vis = shadowcastingFOV({ x: 3, y: 4 }, 2, () => true);
    expect(vis.get("3,4")).toBe(true);
  });

  it("radius 0 yields exactly the origin", () => {
    const vis = shadowcastingFOV({ x: 0, y: 0 }, 0, () => true);
    expect(vis.size).toBe(1);
    expect(vis.get("0,0")).toBe(true);
  });

  it("empty room: visibility equals the Euclidean disk of the radius", () => {
    // Verified: an unobstructed field produces a perfect Euclidean disk.
    const r = 3;
    const vis = shadowcastingFOV({ x: 0, y: 0 }, r, () => true);
    const disk = euclideanDisk(r);

    expect(vis.size).toBe(disk.size); // 29 for r = 3
    for (const key of disk) {
      expect(vis.get(key), `expected ${key} visible`).toBe(true);
    }
    // Out-of-disk in-range corners must NOT leak in.
    expect(vis.get("3,3")).toBeUndefined(); // hypot ~4.24 > 3
  });

  it("empty room: map is symmetric under axis swap and mirroring", () => {
    const vis = shadowcastingFOV({ x: 0, y: 0 }, 4, () => true);
    for (const key of vis.keys()) {
      const [x, y] = key.split(",").map(Number);
      expect(vis.has(`${y},${x}`), `swap asymmetry at ${key}`).toBe(true);
      expect(vis.has(`${-x},${y}`), `mirror asymmetry at ${key}`).toBe(true);
    }
  });

  it("an opaque tile marks ITSELF visible (walls are seen)", () => {
    const vis = shadowcastingFOV({ x: 0, y: 0 }, 4, (x, y) => !(x === 1 && y === 0));
    expect(vis.get("1,0")).toBe(true);
  });

  it("transparency predicate receives in-range coordinates only", () => {
    const seen: Array<[number, number]> = [];
    shadowcastingFOV({ x: 0, y: 0 }, 2, (x, y) => {
      seen.push([x, y]);
      return true;
    });
    for (const [x, y] of seen) {
      expect(Math.hypot(x, y)).toBeLessThanOrEqual(2 + 1e-9);
    }
    expect(seen.length).toBeGreaterThan(0);
  });
});

// ── Occlusion behavior (correct after recursive-shadowcasting rewrite) ──────

describe("shadowcastingFOV occlusion", () => {
  it("a wall blocks the cells directly behind it", () => {
    const vis = shadowcastingFOV({ x: 0, y: 0 }, 4, (x, y) => !(x === 1 && y === 0));
    // Wall at (1,0) casts shadow over (2,0), (3,0), (4,0).
    expect(vis.get("1,0") ?? false).toBe(true); // walls themselves are seen
    expect(vis.get("2,0") ?? false).toBe(false);
    expect(vis.get("3,0") ?? false).toBe(false);
    expect(vis.get("4,0") ?? false).toBe(false);
    // Cells NOT behind the wall remain visible.
    expect(vis.get("0,2") ?? false).toBe(true);
    expect(vis.get("-3,0") ?? false).toBe(true);
  });

  it("cells adjacent to a wall on its flanks stay lit (no octant bleed INTO shadow)", () => {
    const vis = shadowcastingFOV({ x: 0, y: 0 }, 4, (x, y) => !(x === 1 && y === 0));
    // Flanking cells beside the wall are lit...
    expect(vis.get("1,1") ?? false).toBe(true);
    expect(vis.get("1,-1") ?? false).toBe(true);
    // ...but the deep diagonal wake behind the wall stays dark.
    // (Permissive corner semantics: (2,±1) graze the wall's corners and stay
    // lit; from distance 3 onward the wake is fully dark.)
    expect(vis.get("3,1") ?? false).toBe(false);
    expect(vis.get("3,-1") ?? false).toBe(false);
  });

  it("a fully enclosing wall ring reveals NOTHING outside it", () => {
    // Ring of walls at Chebyshev distance 2 from origin.
    const ring = new Set<string>();
    for (let i = -2; i <= 2; i++) {
      ring.add(`2,${i}`);
      ring.add(`-2,${i}`);
      ring.add(`${i},2`);
      ring.add(`${i},-2`);
    }

    const r = 5;
    const vis = shadowcastingFOV({ x: 0, y: 0 }, r, (x, y) => !ring.has(`${x},${y}`));

    let outsideVisible = 0;
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if ((vis.get(`${x},${y}`) ?? false) && Math.max(Math.abs(x), Math.abs(y)) > 2) {
          outsideVisible++;
        }
      }
    }
    expect(outsideVisible).toBe(0);
    // The ring itself and the interior are visible.
    expect(vis.get("2,2") ?? false).toBe(true);
    expect(vis.get("0,0") ?? false).toBe(true);
  });

  it("two staggered walls leave only a slit of light between them", () => {
    // Walls along x=2 at y=-1..1 and y=3..4 leave gap at (2,2).
    const walls = new Set(["2,-1", "2,0", "2,1", "2,3", "2,4"]);
    const vis = shadowcastingFOV({ x: 0, y: 0 }, 5, (x, y) => !walls.has(`${x},${y}`));
    expect(vis.get("2,2") ?? false).toBe(true); // through the gap
    expect(vis.get("3,0") ?? false).toBe(false); // behind lower wall
    expect(vis.get("4,0") ?? false).toBe(false);
    // Light extends one cell past the gap before the flanking walls' shadows
    // close over it (permissive corner geometry).
    expect(vis.get("3,2") ?? false).toBe(true);
    expect(vis.get("4,2") ?? false).toBe(false);
  });

  it("light returns past an obstacle's trailing edge (shadow has finite width)", () => {
    const vis = shadowcastingFOV({ x: 0, y: 0 }, 6, (x, y) => !(x === 2 && y === 0));
    expect(vis.get("3,3") ?? false).toBe(true);
    expect(vis.get("3,-3") ?? false).toBe(true);
  });
});
