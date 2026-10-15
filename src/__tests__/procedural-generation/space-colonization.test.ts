/**
 * @file space-colonization.test.ts
 * @description Tests for the Space Colonization algorithm.
 *
 * The assertions here are geometric wherever they can be -- a segment's length,
 * an attractor's distance to the nearest node -- rather than "a number changed".
 * A run either grew a tree or it did not.
 *
 * The fixtures below **scale the geometry, they do not thin the attractors**.
 * Attractor spacing is what sets every distance in the algorithm, so trimming
 * `attractorCount` on a full-size preset pushes the root out of reach of every
 * attractor: growth dies on the first iteration and the assertions then measure a
 * one-node tree. Shrinking the bounds *with* the count preserves the density and
 * costs a fraction of the work.
 */

import { describe, expect, it } from "vitest";
import {
  SpaceColonization,
  chaikinSubdivide,
  computeBranchRadii,
  createLeafVenationConfig,
  createRootSystemConfig,
  createSeededRandom,
  defaultBounds,
  distributeAttractors,
  extractPaths,
  resolveSpaceColonizationConfig,
  smoothPaths,
} from "../../algorithms/procedural-generation/space-colonization";
import type {
  SpaceColonizationConfig,
  SpaceColonizationNode,
  SpaceColonizationVector,
} from "../../algorithms/procedural-generation/space-colonization";

/** 30x30, 80 attractors, spacing ~3.4 -- the shrub preset's density at 1/16 the work. */
const SMALL_2D: SpaceColonizationConfig = {
  dimensions: 2,
  distribution: "box",
  bounds: { min: { x: -15, y: -15, z: 0 }, max: { x: 15, y: 15, z: 0 } },
  attractorCount: 80,
  influenceRadius: 6,
  killRadius: 1.8,
  segmentLength: 0.9,
  seed: 5,
};

/** 24^3, 120 attractors, spacing ~4.9 -- the tree preset's density. */
const SMALL_3D: SpaceColonizationConfig = {
  dimensions: 3,
  distribution: "box",
  bounds: { min: { x: -12, y: -12, z: -12 }, max: { x: 12, y: 12, z: 12 } },
  attractorCount: 120,
  influenceRadius: 6,
  killRadius: 1.8,
  segmentLength: 0.9,
  seed: 9,
};

/** A small closed-venation plate: 20x20, 100 attractors, spacing ~2. */
const SMALL_CLOSED: SpaceColonizationConfig = {
  dimensions: 2,
  distribution: "box",
  bounds: { min: { x: -10, y: -10, z: 0 }, max: { x: 10, y: 10, z: 0 } },
  attractorCount: 100,
  influenceRadius: 4,
  killRadius: 1.2,
  segmentLength: 0.6,
  mode: "closed",
  closedNeighborLimit: 3,
  seed: 4,
};

/** The root-system preset, shrunk to a 24^3 box without changing its density. */
const SMALL_SOIL: SpaceColonizationConfig = createRootSystemConfig({
  bounds: { min: { x: -12, y: -12, z: -12 }, max: { x: 12, y: 12, z: 12 } },
  attractorCount: 120,
  influenceRadius: 6,
  killRadius: 1.8,
  segmentLength: 0.9,
});

function distance(a: SpaceColonizationVector, b: SpaceColonizationVector): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

describe("SpaceColonization", () => {
  describe("seeded determinism", () => {
    it("grows the same network from the same seed", () => {
      const a = new SpaceColonization({ ...SMALL_2D, seed: 99 }).run();
      const b = new SpaceColonization({ ...SMALL_2D, seed: 99 }).run();
      expect(a.nodes.length).toBe(b.nodes.length);
      for (let i = 0; i < a.nodes.length; i++) {
        expect(a.nodes[i]!.position.x).toBeCloseTo(b.nodes[i]!.position.x, 12);
        expect(a.nodes[i]!.position.y).toBeCloseTo(b.nodes[i]!.position.y, 12);
      }
    });

    it("grows a different network from a different seed", () => {
      const a = new SpaceColonization({ ...SMALL_2D, seed: 1 }).run();
      const b = new SpaceColonization({ ...SMALL_2D, seed: 2 }).run();
      const differs =
        a.nodes.length !== b.nodes.length ||
        a.nodes.some((node, i) => distance(node.position, b.nodes[i]!.position) > 1e-9);
      expect(differs).toBe(true);
    });
  });

  describe("growth invariants", () => {
    it("extends every non-root node exactly one segment length from its parent", () => {
      const config = SMALL_3D;
      const result = new SpaceColonization(config).run();
      const { segmentLength, killRadius } = resolveSpaceColonizationConfig(config);

      // The invariant that makes this algorithm what it is: growth is a fixed
      // step. A floating-point tolerance, not a range.
      let checked = 0;
      for (const segment of result.segments) {
        const parent = result.nodes[segment.from]!.position;
        const child = result.nodes[segment.to]!.position;
        expect(distance(parent, child)).toBeCloseTo(segmentLength, 9);
        checked++;
      }
      expect(checked).toBeGreaterThan(20);
      // Segment length is emphatically NOT the kill distance; assert the two
      // were configured apart so the assertion above is not tautological.
      expect(Math.abs(segmentLength - killRadius)).toBeGreaterThan(0.5);
    });

    it("starts from a single root at the bottom centre of the bounds", () => {
      const config = SMALL_3D;
      const result = new SpaceColonization(config).run();
      const roots = result.nodes.filter((n) => n.parent === -1);
      expect(roots).toHaveLength(1);
      const { bounds } = resolveSpaceColonizationConfig(config);
      expect(roots[0]!.position.y).toBeCloseTo(bounds.min.y, 9);
      expect(roots[0]!.position.x).toBeCloseTo((bounds.min.x + bounds.max.x) / 2, 9);
      expect(roots[0]!.position.z).toBeCloseTo((bounds.min.z + bounds.max.z) / 2, 9);
    });

    it("sets each node's depth to its parent's depth plus one", () => {
      const result = new SpaceColonization(SMALL_3D).run();
      for (const node of result.nodes) {
        if (node.parent === -1) {
          expect(node.depth).toBe(0);
        } else {
          expect(node.depth).toBe(result.nodes[node.parent]!.depth + 1);
        }
      }
    });

    it("keeps every node inside the configured bounds", () => {
      const config = SMALL_2D;
      const result = new SpaceColonization(config).run();
      const { bounds } = resolveSpaceColonizationConfig(config);
      const slack = config.segmentLength! + 1e-9;
      for (const node of result.nodes) {
        expect(node.position.x).toBeGreaterThanOrEqual(bounds.min.x - slack);
        expect(node.position.x).toBeLessThanOrEqual(bounds.max.x + slack);
        expect(node.position.y).toBeGreaterThanOrEqual(bounds.min.y - slack);
        expect(node.position.y).toBeLessThanOrEqual(bounds.max.y + slack);
      }
    });

    it("grows a real network, not one node", () => {
      // Guards the fixture trap: a config whose root is out of reach of every
      // attractor ends after one iteration with a single node and reports
      // nothing wrong. Every other test in this file would pass vacuously.
      const result = new SpaceColonization(SMALL_2D).run();
      expect(result.stats.nodeCount).toBeGreaterThan(50);
      expect(result.stats.associations).toBeGreaterThan(50);
    });
  });

  describe("pruning", () => {
    it("leaves every surviving attractor outside the kill radius of every node", () => {
      const config = SMALL_2D;
      const result = new SpaceColonization(config).run();
      const { killRadius } = resolveSpaceColonizationConfig(config);
      let nearPairs = 0;
      for (const attractor of result.remainingAttractors) {
        for (const node of result.nodes) {
          if (distance(attractor, node.position) < killRadius) nearPairs++;
        }
      }
      expect(nearPairs).toBe(0);
      expect(result.remainingAttractors.length).toBeLessThan(
        result.stats.initialAttractors,
      );
    });

    it("accounts for every attractor exactly once", () => {
      const result = new SpaceColonization(SMALL_2D).run();
      const { initialAttractors, remainingAttractors, consumedAttractors } = result.stats;
      expect(consumedAttractors).toBe(initialAttractors - remainingAttractors);
    });

    it("reports one segment per non-root node", () => {
      const result = new SpaceColonization(SMALL_2D).run();
      const roots = result.nodes.filter((n) => n.parent === -1).length;
      expect(result.stats.segmentCount).toBe(result.stats.nodeCount - roots);
      expect(result.segments).toHaveLength(result.stats.segmentCount);
    });
  });

  describe("growth terminates by consuming, not by running out of iterations", () => {
    it("never chases attractors it cannot reach, and never runs away", () => {
      // Regression cover for the two defects that made this algorithm look slow.
      // Without the per-iteration pull reset, the node count runs away (a child
      // per node per iteration). Without the progress test, nodes orbit attractors
      // whose pulls cancel and the run ends at `maxIterations` with thousands of
      // junk segments. Both show up here as a broken node/consumed ratio.
      const config: SpaceColonizationConfig = { ...SMALL_3D, maxIterations: 5000 };
      const result = new SpaceColonization(config).run();
      const { iterations, initialAttractors, consumedAttractors, nodeCount } = result.stats;

      expect(iterations).toBeLessThan(5000);
      expect(consumedAttractors / initialAttractors).toBeGreaterThan(0.8);
      // A tree is roughly one node per attractor consumed, plus its branches.
      expect(nodeCount / consumedAttractors).toBeLessThan(4);
    });

    it("stops after stallLimit iterations that consume nothing", () => {
      const result = new SpaceColonization({ ...SMALL_3D, stallLimit: 3 }).run();
      // Whatever it lands on, it lands: the run is finite and bounded.
      expect(result.stats.iterations).toBeLessThan(5000);
      expect(Number.isFinite(result.stats.growthTimeMs)).toBe(true);
    });
  });

  describe("the spatial index is an accelerator, not a second algorithm", () => {
    it("produces an identical skeleton with the grid on and off", () => {
      const indexed = new SpaceColonization({ ...SMALL_3D, useSpatialIndex: true }).run();
      const brute = new SpaceColonization({ ...SMALL_3D, useSpatialIndex: false }).run();

      expect(indexed.nodes.length).toBe(brute.nodes.length);
      expect(indexed.stats.consumedAttractors).toBe(brute.stats.consumedAttractors);
      for (let i = 0; i < indexed.nodes.length; i++) {
        expect(indexed.nodes[i]!.position.x).toBeCloseTo(brute.nodes[i]!.position.x, 12);
        expect(indexed.nodes[i]!.position.y).toBeCloseTo(brute.nodes[i]!.position.y, 12);
        expect(indexed.nodes[i]!.position.z).toBeCloseTo(brute.nodes[i]!.position.z, 12);
      }
      expect(indexed.stats.spatialGridCells).toBeGreaterThan(0);
      expect(brute.stats.spatialGridCells).toBe(0);
    });
  });

  describe("growth modes", () => {
    it("closes venation by giving an attractor more than one node", () => {
      const open = new SpaceColonization({ ...SMALL_CLOSED, mode: "open" }).run();
      const closed = new SpaceColonization(SMALL_CLOSED).run();

      // Closed venation forms strictly more associations than open, because an
      // attractor can pull several nodes instead of only its nearest. Same
      // attractors, same seed: the difference is the mode.
      expect(closed.stats.associations).toBeGreaterThan(open.stats.associations);
      expect(closed.stats.initialAttractors).toBe(open.stats.initialAttractors);
    });

    it("bounds a closed node's fan-in at closedNeighborLimit", () => {
      const uncapped = new SpaceColonization({
        ...SMALL_CLOSED,
        closedNeighborLimit: 0,
      }).run();
      const capped = new SpaceColonization(SMALL_CLOSED).run();
      expect(capped.stats.associations).toBeLessThan(uncapped.stats.associations);
    });
  });

  describe("stepping", () => {
    it("reports one step at a time and then stops", () => {
      const grower = new SpaceColonization(SMALL_2D);
      let steps = 0;
      let active = true;
      while (active && steps < 5000) {
        active = grower.step().active;
        steps++;
      }
      expect(active).toBe(false);
      expect(steps).toBeGreaterThan(1);
      expect(steps).toBeLessThan(5000);
      // A stopped grower keeps reporting inactive rather than resuming.
      expect(grower.step().active).toBe(false);
      expect(grower.step().spawned).toHaveLength(0);
      // Stepping to the end and running outright agree on the skeleton.
      expect(grower.result().stats.nodeCount).toBe(
        new SpaceColonization(SMALL_2D).run().stats.nodeCount,
      );
    });
  });

  describe("configuration", () => {
    it("rejects a non-positive influence radius", () => {
      expect(() => new SpaceColonization({ influenceRadius: 0 })).toThrow(
        /influenceRadius/,
      );
    });

    it("rejects a non-positive segment length", () => {
      expect(() => new SpaceColonization({ segmentLength: -1 })).toThrow(
        /segmentLength/,
      );
    });

    it("derives 2D bounds with a flat z axis", () => {
      const resolved = resolveSpaceColonizationConfig({ dimensions: 2 });
      expect(resolved.bounds.min.z).toBe(0);
      expect(resolved.bounds.max.z).toBe(0);
      expect(resolved.stallLimit).toBe(10);
    });
  });
});

describe("attractor distribution", () => {
  it("is deterministic for a given seed", () => {
    const options = {
      distribution: "crown" as const,
      bounds: defaultBounds(3),
      count: 100,
      seed: 17,
    };
    expect(distributeAttractors(options)).toEqual(distributeAttractors(options));
  });

  it("keeps box attractors inside the box", () => {
    const bounds = defaultBounds(3);
    for (const p of distributeAttractors({
      distribution: "box",
      bounds,
      count: 200,
      seed: 1,
    })) {
      expect(p.x).toBeGreaterThanOrEqual(bounds.min.x);
      expect(p.x).toBeLessThanOrEqual(bounds.max.x);
      expect(p.z).toBeGreaterThanOrEqual(bounds.min.z);
      expect(p.z).toBeLessThanOrEqual(bounds.max.z);
    }
  });

  it("keeps sphere attractors inside the inscribed ellipsoid", () => {
    const bounds = defaultBounds(3);
    for (const p of distributeAttractors({
      distribution: "sphere",
      bounds,
      count: 200,
      seed: 2,
    })) {
      expect(Math.hypot(p.x / 50, p.y / 50, p.z / 50)).toBeLessThanOrEqual(1 + 1e-9);
    }
  });

  it("thins the base of a crown rather than cutting it flat", () => {
    const bounds = defaultBounds(3);
    const crown = distributeAttractors({
      distribution: "crown",
      bounds,
      count: 2000,
      seed: 3,
    });
    const lower = crown.filter((p) => p.y < 0).length;
    const upper = crown.filter((p) => p.y > 0).length;
    // The artefact this guards against is a dense plate at the crown floor.
    // Density must rise with height, so the upper half holds more than the
    // lower -- and by a wide margin, not a coin flip.
    expect(upper).toBeGreaterThan(lower * 1.5);
  });

  it("places a root-system's root at the top of the box it was given", () => {
    const bounds = SMALL_SOIL.bounds!;
    const result = new SpaceColonization(SMALL_SOIL).run();
    const root = result.nodes.find((n) => n.parent === -1)!;
    expect(root.position.y).toBeCloseTo(bounds.max.y, 9);
    // And growth went down, not up.
    const leaves = result.nodes.filter((n) => n.children.length === 0);
    expect(leaves.length).toBeGreaterThan(0);
    const meanLeafY = leaves.reduce((sum, n) => sum + n.position.y, 0) / leaves.length;
    expect(meanLeafY).toBeLessThan(root.position.y);
  });

  it("uses explicit attractors verbatim", () => {
    const attractors = [
      { x: 0, y: 20, z: 0 },
      { x: 10, y: 20, z: 0 },
    ];
    const grower = new SpaceColonization({
      dimensions: 2,
      attractors,
      roots: [{ x: 0, y: 0, z: 0 }],
      influenceRadius: 30,
      killRadius: 2,
      segmentLength: 4,
      distribution: "box",
      attractorCount: 999,
    });
    expect(grower.activeAttractors).toHaveLength(2);
    expect(grower.run().stats.initialAttractors).toBe(2);
  });
});

describe("presets", () => {
  it("grow a network and finish in bounded time at their shipped defaults", () => {
    // The presets are the product surface; the fixtures above are shrunk copies
    // of them. This is the one test that runs the real thing, so a preset whose
    // distances do not fit its own attractor spacing fails here.
    for (const config of [
      createLeafVenationConfig(),
      createRootSystemConfig(),
    ]) {
      const result = new SpaceColonization(config).run();
      expect(result.stats.nodeCount).toBeGreaterThan(50);
      expect(result.stats.iterations).toBeLessThan(config.maxIterations ?? 2000);
    }
  });
});

describe("Murray's law radii", () => {
  it("gives a parent the combined thickness of its children", () => {
    const result = new SpaceColonization(SMALL_3D).run();
    computeBranchRadii(result.nodes, { exponent: 2, leafRadius: 0.5 });
    // Children must out-rank parents for the rule to be testable at all.
    const branchPoints = result.nodes.filter((n) => n.children.length > 1);
    expect(branchPoints.length).toBeGreaterThan(0);
    for (const node of branchPoints) {
      const expected = Math.sqrt(
        node.children.reduce((sum, id) => sum + result.nodes[id]!.radius! ** 2, 0),
      );
      expect(node.radius!).toBeCloseTo(expected, 9);
      expect(node.radius!).toBeGreaterThan(result.nodes[node.children[0]!]!.radius!);
    }
  });

  it("honours the exponent", () => {
    const nodes: SpaceColonizationNode[] = [
      { id: 0, parent: -1, children: [1, 2], depth: 0, position: { x: 0, y: 0, z: 0 } },
      { id: 1, parent: 0, children: [], depth: 1, position: { x: 0, y: 0, z: 0 } },
      { id: 2, parent: 0, children: [], depth: 1, position: { x: 0, y: 0, z: 0 } },
    ];
    computeBranchRadii(nodes, { exponent: 3, leafRadius: 1 });
    // 1^3 + 1^3 = 2, so r = 2^(1/3).
    expect(nodes[0]!.radius).toBeCloseTo(Math.cbrt(2), 12);
  });

  it("gives every leaf the leaf radius", () => {
    const result = new SpaceColonization(SMALL_3D).run();
    computeBranchRadii(result.nodes, { leafRadius: 0.75 });
    for (const node of result.nodes) {
      if (node.children.length === 0) expect(node.radius).toBeCloseTo(0.75, 12);
    }
  });
});

describe("curve subdivision", () => {
  const line: SpaceColonizationVector[] = [
    { x: 0, y: 0, z: 0 },
    { x: 10, y: 0, z: 0 },
    { x: 10, y: 10, z: 0 },
  ];

  it("doubles the point count per pass", () => {
    const once = chaikinSubdivide(line, 1);
    // 3 points -> 6: two points per original segment, and the open curve's two
    // endpoints count as points in their own right.
    expect(once).toHaveLength(6);
    expect(chaikinSubdivide(line, 2)).toHaveLength(12);
  });

  it("pins the endpoints of an open polyline", () => {
    const smoothed = chaikinSubdivide(line, 4);
    expect(smoothed[0]).toEqual(line[0]);
    expect(smoothed[smoothed.length - 1]).toEqual(line[line.length - 1]);
  });

  it("cuts the corner rather than interpolating it", () => {
    const smoothed = chaikinSubdivide(line, 1);
    // The sharp corner (10,0) is not on the refined curve.
    expect(smoothed.some((p) => p.x === 10 && p.y === 0)).toBe(false);
  });

  it("refines a closed loop without pinning anything", () => {
    const loop: SpaceColonizationVector[] = [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      { x: 10, y: 10, z: 0 },
      { x: 0, y: 10, z: 0 },
    ];
    expect(chaikinSubdivide(loop, 1, true)).toHaveLength(8);
  });
});

describe("paths", () => {
  it("produces one path per leaf, each starting at a root", () => {
    const result = new SpaceColonization(SMALL_2D).run();
    const paths = extractPaths(result.nodes);
    const leaves = result.nodes.filter((n) => n.children.length === 0);
    expect(paths).toHaveLength(leaves.length);
    const rootPosition = result.nodes.find((n) => n.parent === -1)!.position;
    for (const path of paths) {
      expect(path[0]!.x).toBeCloseTo(rootPosition.x, 9);
      expect(path[0]!.y).toBeCloseTo(rootPosition.y, 9);
      expect(path.length).toBeGreaterThan(1);
    }
  });

  it("smooths every path", () => {
    const result = new SpaceColonization(SMALL_2D).run();
    const smoothed = smoothPaths(result.nodes, 2);
    expect(smoothed).toHaveLength(extractPaths(result.nodes).length);
    for (const path of smoothed) expect(path.length).toBeGreaterThan(2);
  });
});

describe("createSeededRandom", () => {
  it("is reproducible and stays in [0, 1)", () => {
    const a = createSeededRandom(123);
    const b = createSeededRandom(123);
    for (let i = 0; i < 100; i++) {
      const value = a();
      expect(value).toBe(b());
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
