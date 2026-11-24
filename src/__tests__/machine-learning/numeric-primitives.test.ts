/**
 * @file Deterministic tests for ML numeric modules that previously had no
 * direct test: shared matrix operations, PCA, MDS, Isomap, and NEAT.
 */
import { describe, it, expect } from "vitest";
import {
  centerMatrix,
  computeCovarianceMatrix,
  doubleCenterSquaredDistanceMatrix,
  eigenvalueDecomposition,
  matrixMultiply,
  transpose,
} from "../../algorithms/machine-learning/dimensionality-reduction/shared/matrix-ops";
import { PCA } from "../../algorithms/machine-learning/dimensionality-reduction/pca/pca-core";
import { MDS } from "../../algorithms/machine-learning/dimensionality-reduction/mds/mds-core";
import { Isomap } from "../../algorithms/machine-learning/dimensionality-reduction/isomap/isomap-core";
import { NEAT } from "../../algorithms/machine-learning/neat/neat-core";

describe("matrix operations", () => {
  it("transposes a rectangular matrix", () => {
    expect(transpose([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]);
    expect(transpose([])).toEqual([]);
  });

  it("multiplies compatible matrices", () => {
    expect(matrixMultiply([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });

  it("rejects empty matrices", () => {
    expect(() => matrixMultiply([], [[1]])).toThrow();
  });

  it("centers columns to zero mean", () => {
    const { centered, mean } = centerMatrix([[1, 2], [3, 4], [5, 6]]);
    expect(mean).toEqual([3, 4]);
    for (const col of [0, 1]) {
      expect(centered.reduce((sum, row) => sum + row[col]!, 0)).toBeCloseTo(0, 10);
    }
  });

  it("computes the covariance matrix of centered data", () => {
    // computeCovarianceMatrix expects already-centered rows.
    const cov = computeCovarianceMatrix([[-1, -1], [0, 0], [1, 1]]);
    expect(cov[0]![0]).toBeCloseTo(1, 10);
    expect(cov[0]![1]).toBeCloseTo(1, 10);
    expect(cov[1]![0]).toBeCloseTo(1, 10);
    expect(cov[1]![1]).toBeCloseTo(1, 10);
  });

  it("double-centers a squared distance matrix to zero row and column sums", () => {
    const d2 = [
      [0, 1, 4],
      [1, 0, 1],
      [4, 1, 0],
    ];
    const b = doubleCenterSquaredDistanceMatrix(d2);
    for (let i = 0; i < 3; i++) {
      expect(b[i]!.reduce((a, v) => a + v, 0)).toBeCloseTo(0, 10);
      expect(b.reduce((a, row) => a + row[i]!, 0)).toBeCloseTo(0, 10);
    }
  });

  it("returns the requested number of eigencomponents in descending eigenvalue order", () => {
    const { eigenvalues, eigenvectors } = eigenvalueDecomposition([[2, 0], [0, 1]], 2);
    expect(eigenvalues).toHaveLength(2);
    expect(eigenvectors).toHaveLength(2);
    expect(eigenvalues[0]!).toBeGreaterThanOrEqual(eigenvalues[1]!);
  });
});

describe("PCA", () => {
  it("reduces a correlated 2D dataset to one component", () => {
    const data = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]];
    const result = new PCA({ config: { components: 1 } }).fitTransform(data);

    expect(result.transformed).toHaveLength(data.length);
    expect(result.transformed[0]).toHaveLength(1);
    expect(result.components).toHaveLength(1);
    expect(result.explainedVariance).toHaveLength(1);
    expect(result.explainedVarianceRatio[0]!).toBeGreaterThan(0.9);
  });

  it("preserves both components when none are dropped", () => {
    const result = new PCA({ config: { components: 2 } }).fitTransform([[1, 2], [3, 4], [5, 6]]);
    expect(result.transformed[0]).toHaveLength(2);
    expect(result.explainedVarianceRatio.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
  });
});

describe("MDS", () => {
  it("embeds three equidistant points in two dimensions", () => {
    const d = [
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
    ];
    const result = new MDS({ dimensions: 2 }).fitTransform(d);
    expect(result.embedding).toHaveLength(3);
    expect(result.embedding[0]).toHaveLength(2);
  });
});

describe("Isomap", () => {
  it("embeds a small dataset and exposes the neighbor graph", () => {
    const data = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]];
    const result = new Isomap({ config: { dimensions: 1, k: 2 } }).fitTransform(data);
    expect(result.embedding).toHaveLength(data.length);
    expect(result.geodesicDistances).toHaveLength(data.length);
    expect(result.graph).toBeDefined();
    expect(result.graph!.nodes).toBe(data.length);
  });
});

describe("NEAT", () => {
  it("initializes a population with the configured size", () => {
    const neat = new NEAT({ numInputs: 2, numOutputs: 1, populationSize: 10 });
    expect(neat.getPopulation()).toHaveLength(10);
  });

  it("evolves a population against a fitness function", () => {
    const neat = new NEAT({ numInputs: 2, numOutputs: 1, populationSize: 10 });
    neat.evaluateFitness(genome => genome.nodes.length);
    const result = neat.evolve();

    expect(result.bestGenome).toBeDefined();
    expect(result.generation).toBeGreaterThan(0);
    expect(neat.getPopulation().length).toBeGreaterThan(0);
  });
});
