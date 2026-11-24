/**
 * @file Deterministic tests for DCT/DST transforms and the BVH spatial
 * structure, which previously had no direct tests.
 */
import { describe, it, expect } from "vitest";
import { DCTFactory, DCTType } from "../../algorithms/signal-processing/fft/dct";
import { DSTFactory, DSTType } from "../../algorithms/signal-processing/fft/dst";
import { BVH } from "../../data-structures/spatial/bvh/bvh-core";
import type { AABB, Primitive, Ray3D } from "../../data-structures/spatial/bvh/bvh-types";

const box = (id: number, min: [number, number, number], max: [number, number, number]): Primitive => ({
  id,
  bounds: { min: { x: min[0], y: min[1], z: min[2] }, max: { x: max[0], y: max[1], z: max[2] } },
});

describe("DCT", () => {
  const signal = Float32Array.from([1, 2, 3, 4, 4, 3, 2, 1]);

  for (const type of [DCTType.TYPE_I, DCTType.TYPE_II, DCTType.TYPE_III, DCTType.TYPE_IV]) {
    it(`type ${type} emits the expected result shape`, () => {
      const dct = DCTFactory.create({ size: 8, type });
      const result = dct.forward(signal);

      expect(result.coefficients).toHaveLength(8);
      expect(result.size).toBe(8);
      expect(result.type).toBe(type);
    });

    it(`type ${type} maps a zero signal to zero coefficients`, () => {
      const dct = DCTFactory.create({ size: 8, type });
      const result = dct.forward(new Float32Array(8));
      for (const coefficient of result.coefficients) expect(coefficient).toBe(0);
    });
  }

  it("concentrates a constant signal in the DC coefficient", () => {
    const dct = DCTFactory.create({ size: 8, type: DCTType.TYPE_II });
    const result = dct.forward(Float32Array.from([5, 5, 5, 5, 5, 5, 5, 5]));
    const dc = Math.abs(result.coefficients[0]!);
    for (let i = 1; i < result.coefficients.length; i++) {
      expect(Math.abs(result.coefficients[i]!)).toBeLessThan(dc);
    }
  });

  it("DCT-II followed by DCT-III reconstructs (N/2) times the signal", () => {
    // Unnormalized transforms are orthogonal up to N/2. This is the stable
    // reconstruction contract; `inverse()` on each class reuses its own
    // forward kernel and is not a true inverse today.
    const forward = DCTFactory.create({ size: 8, type: DCTType.TYPE_II });
    const reverse = DCTFactory.create({ size: 8, type: DCTType.TYPE_III });
    const restored = reverse.forward(forward.forward(signal).coefficients).coefficients;
    for (let i = 0; i < signal.length; i++) {
      expect(restored[i]!).toBeCloseTo(signal[i]! * 4, 3);
    }
  });
});

describe("DST", () => {
  const signal = Float32Array.from([1, 2, 3, 4, 4, 3, 2, 1]);

  for (const type of [DSTType.TYPE_I, DSTType.TYPE_II, DSTType.TYPE_III, DSTType.TYPE_IV]) {
    it(`type ${type} emits the expected result shape`, () => {
      const dst = DSTFactory.create({ size: 8, type });
      const result = dst.forward(signal);

      expect(result.coefficients).toHaveLength(8);
      expect(result.size).toBe(8);
      expect(result.type).toBe(type);
    });

    it(`type ${type} maps a zero signal to zero coefficients`, () => {
      const dst = DSTFactory.create({ size: 8, type });
      const result = dst.forward(new Float32Array(8));
      for (const coefficient of result.coefficients) expect(coefficient).toBe(0);
    });
  }

  it("DST-II followed by DST-III reconstructs (N/2) times the signal", () => {
    const forward = DSTFactory.create({ size: 8, type: DSTType.TYPE_II });
    const reverse = DSTFactory.create({ size: 8, type: DSTType.TYPE_III });
    const restored = reverse.forward(forward.forward(signal).coefficients).coefficients;
    for (let i = 0; i < signal.length; i++) {
      expect(restored[i]!).toBeCloseTo(signal[i]! * 4, 3);
    }
  });
});

describe("BVH", () => {
  const primitives = [
    box(1, [0, 0, 0], [1, 1, 1]),
    box(2, [3, 3, 3], [4, 4, 4]),
    box(3, [6, 0, 0], [7, 1, 1]),
  ];

  it("reports size and emptiness correctly", () => {
    const bvh = new BVH();
    expect(bvh.isEmpty()).toBe(true);
    for (const primitive of primitives) bvh.insert(primitive);
    expect(bvh.size()).toBe(3);
    expect(bvh.isEmpty()).toBe(false);
  });

  it("finds primitives intersecting an AABB query", () => {
    const bvh = new BVH();
    bvh.insertBatch(primitives);
    const query: AABB = { min: { x: -1, y: -1, z: -1 }, max: { x: 2, y: 2, z: 2 } };
    const result = bvh.aabbIntersection(query);

    expect(result.primitives.map(p => p.id)).toContain(1);
    expect(result.primitives.map(p => p.id)).not.toContain(2);
  });

  it("finds a distant primitive that wrong node bounds would prune", () => {
    const bvh = new BVH();
    bvh.insertBatch(primitives);
    const query: AABB = { min: { x: 5, y: -1, z: -1 }, max: { x: 8, y: 2, z: 2 } };
    const result = bvh.aabbIntersection(query);
    expect(result.primitives.map(p => p.id)).toContain(3);
    expect(result.primitives.map(p => p.id)).not.toContain(1);
  });

  it("still finds primitives when a split is forced", () => {
    const many = Array.from({ length: 20 }, (_, i) => box(i, [i * 2, 0, 0], [i * 2 + 1, 1, 1]));
    const bvh = new BVH();
    bvh.insertBatch(many);
    const result = bvh.aabbIntersection({ min: { x: 30, y: 0, z: 0 }, max: { x: 40, y: 2, z: 2 } });
    expect(result.primitives.map(p => p.id)).toContain(15);
    expect(result.primitives.map(p => p.id)).not.toContain(0);
  });

  it("finds a primitive along a ray", () => {
    const bvh = new BVH();
    bvh.insertBatch(primitives);
    const ray: Ray3D = {
      origin: { x: -2, y: 0.5, z: 0.5 },
      direction: { x: 1, y: 0, z: 0 },
    };
    const result = bvh.rayIntersection(ray);

    expect(result.primitives.length).toBeGreaterThan(0);
  });

  it("removes and clears primitives", () => {
    const bvh = new BVH();
    bvh.insertBatch(primitives);
    bvh.remove(2);
    expect(bvh.size()).toBe(2);
    bvh.clear();
    expect(bvh.isEmpty()).toBe(true);
  });
});
