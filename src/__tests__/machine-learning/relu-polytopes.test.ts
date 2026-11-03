/**
 * @file relu-polytopes.test.ts
 * @description Tests for ReLU activation-pattern partitioning.
 *
 * The expected patterns are recomputed from the returned weights with the
 * documented grid order (`index = y * resolution + x`), so a transposed grid
 * or a shifted mask fails here instead of producing a plausible-looking
 * picture of the wrong thing.
 */

import { describe, it, expect } from "vitest";
import { ReLUPolytopePartitioner } from "../../algorithms/machine-learning/relu-polytopes/relu-polytopes-core";
import { DEFAULT_RELU_POLYTOPE_CONFIG } from "../../algorithms/machine-learning/relu-polytopes/relu-polytopes-types";

const RESOLUTION = 5;

function expectedPattern(
  weights: number[][],
  biases: number[],
  x: number,
  y: number,
): number {
  let id = 0;
  for (let k = 0; k < weights.length; k += 1) {
    if (weights[k][0] * x + weights[k][1] * y + biases[k] > 0) id |= 1 << k;
  }
  return id;
}

describe("ReLUPolytopePartitioner", () => {
  it("is deterministic for a given seed", () => {
    const first = new ReLUPolytopePartitioner({ seed: 7, numNeurons: 6 });
    const second = new ReLUPolytopePartitioner({ seed: 7, numNeurons: 6 });

    expect(first.getWeights()).toEqual(second.getWeights());
    expect(first.getBiases()).toEqual(second.getBiases());
  });

  it("uses different weights for different seeds", () => {
    const first = new ReLUPolytopePartitioner({ seed: 1, numNeurons: 6 });
    const second = new ReLUPolytopePartitioner({ seed: 2, numNeurons: 6 });

    expect(first.getWeights()).not.toEqual(second.getWeights());
  });

  it("derives every grid pattern from the returned weights and grid order", () => {
    const partitioner = new ReLUPolytopePartitioner({ seed: 42, numNeurons: 8 });
    const result = partitioner.partition(RESOLUTION);
    const { min, max } = DEFAULT_RELU_POLYTOPE_CONFIG.bounds;
    const span = max - min;
    const step = span / (RESOLUTION - 1);

    expect(result.patternIds).toHaveLength(RESOLUTION * RESOLUTION);

    for (let yi = 0; yi < RESOLUTION; yi += 1) {
      for (let xi = 0; xi < RESOLUTION; xi += 1) {
        const x = min + xi * step;
        const y = min + yi * step;
        expect(result.patternIds[yi * RESOLUTION + xi]).toBe(
          expectedPattern(result.weights, result.biases, x, y),
        );
      }
    }
  });

  it("distinguishes x from y, so a transposed grid cannot pass", () => {
    const partitioner = new ReLUPolytopePartitioner({ seed: 42, numNeurons: 8 });
    const result = partitioner.partition(RESOLUTION);

    // If the implementation read xs/ys in the wrong order, the grid would be
    // symmetric under transposition. At least one asymmetric cell must exist.
    let asymmetric = false;
    for (let yi = 0; yi < RESOLUTION && !asymmetric; yi += 1) {
      for (let xi = yi + 1; xi < RESOLUTION; xi += 1) {
        if (result.patternIds[yi * RESOLUTION + xi] !== result.patternIds[xi * RESOLUTION + yi]) {
          asymmetric = true;
        }
      }
    }

    expect(asymmetric).toBe(true);
  });

  it("keeps every pattern inside the neuron mask", () => {
    const result = new ReLUPolytopePartitioner({ seed: 3, numNeurons: 5 }).partition(RESOLUTION);
    const mask = (1 << 5) - 1;

    for (const id of result.patternIds) {
      expect(id & ~mask).toBe(0);
      expect(id).toBeGreaterThanOrEqual(0);
    }
  });

  it("reports a vertical boundary as verticalX with an infinite slope", () => {
    // x = 0 is vertical: drawing it as slope 0 / intercept 0 would draw the
    // horizontal line y = 0 instead.
    const partitioner = new ReLUPolytopePartitioner({
      weights: [[1, 0]],
      biases: [0],
    });
    const result = partitioner.partition(RESOLUTION);
    const [line] = result.boundaryLines;

    expect(line.slope).toBe(Infinity);
    expect(line.verticalX).toBeCloseTo(0, 12);
    expect(line.withinBounds).toBe(true);
  });

  it("marks a boundary that misses the box as outside it", () => {
    // x = 10 is a vertical line, but the box is [-2, 2]: nothing is drawn.
    const result = new ReLUPolytopePartitioner({
      weights: [[1, 0]],
      biases: [-10],
    }).partition(RESOLUTION);
    const [line] = result.boundaryLines;

    expect(line.withinBounds).toBe(false);
    expect(line.verticalX).toBeCloseTo(10, 12);
  });

  it("treats a constant neuron as carrying no boundary", () => {
    const result = new ReLUPolytopePartitioner({
      weights: [[0, 0]],
      biases: [1],
    }).partition(RESOLUTION);
    const [line] = result.boundaryLines;

    expect(line.withinBounds).toBe(false);
    expect(line.verticalX).toBeNull();
    // The neuron is always on, so only one pattern is reachable.
    expect(new Set(result.patternIds).size).toBe(1);
    expect(result.patternIds[0]).toBe(0b1);
  });

  it("rejects a half-supplied layer", () => {
    expect(() => new ReLUPolytopePartitioner({ weights: [[1, 0]] })).toThrow(
      /weights and biases/,
    );
    expect(() => new ReLUPolytopePartitioner({ biases: [0] })).toThrow(
      /weights and biases/,
    );
  });

  it("rejects a layer whose arrays disagree", () => {
    expect(
      () => new ReLUPolytopePartitioner({ weights: [[1, 0], [0, 1]], biases: [0] }),
    ).toThrow(/neuron count/);
    expect(() => new ReLUPolytopePartitioner({ weights: [[1, 0, 0]], biases: [0] })).toThrow(
      /exactly 2 components/,
    );
  });

  it("rejects resolutions that cannot describe a grid", () => {
    const { min, max } = DEFAULT_RELU_POLYTOPE_CONFIG.bounds;
    const partitioner = new ReLUPolytopePartitioner({ seed: 42, numNeurons: 8 });
    const result = partitioner.partition(RESOLUTION);

    result.boundaryLines.forEach((line, index) => {
      const [w1, w2] = result.weights[index];
      const b = result.biases[index];
      const values = [min, max].flatMap(x =>
        [min, max].map(y => w1 * x + w2 * y + b),
      );
      const crosses = values.some(v => v > 0) && values.some(v => v < 0);
      expect(line.withinBounds).toBe(crosses);
    });
  });

  it("rejects resolutions that cannot describe a grid", () => {
    const partitioner = new ReLUPolytopePartitioner({ seed: 42, numNeurons: 8 });

    expect(() => partitioner.partition(1)).toThrow(RangeError);
    expect(() => partitioner.partition(0)).toThrow(RangeError);
    expect(() => partitioner.partition(2.5)).toThrow(RangeError);
  });
});
