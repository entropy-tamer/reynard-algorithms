import {
  DEFAULT_RELU_POLYTOPE_CONFIG,
  type ReLUPolytopeConfig,
  type ReLUPolytopeResult,
} from "./relu-polytopes-types";

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class ReLUPolytopePartitioner {
  private config: ReLUPolytopeConfig;
  private weights: number[][];
  private biases: number[];

  constructor(config: Partial<ReLUPolytopeConfig> = {}) {
    this.config = { ...DEFAULT_RELU_POLYTOPE_CONFIG, ...config };
    const explicitWeights = this.config.weights;
    const explicitBiases = this.config.biases;

    if (explicitWeights || explicitBiases) {
      // Half a layer cannot be reproduced: a boundary needs both its normal and
      // its offset, so refuse rather than silently seeding the missing half.
      if (!explicitWeights || !explicitBiases) {
        throw new Error("weights and biases must be supplied together");
      }
      if (explicitWeights.length !== explicitBiases.length) {
        throw new Error(
          `weights and biases disagree on neuron count: ${explicitWeights.length} vs ${explicitBiases.length}`,
        );
      }
      const malformed = explicitWeights.findIndex(w => w.length !== 2);
      if (malformed !== -1) {
        throw new Error(`weights[${malformed}] must have exactly 2 components`);
      }

      // The supplied layer defines the neuron count; `numNeurons` is derived,
      // so the two can never drift apart.
      this.config.numNeurons = explicitWeights.length;
      this.weights = explicitWeights.map(w => [...w]);
      this.biases = [...explicitBiases];
      return;
    }

    const rng = mulberry32(this.config.seed);
    const n = this.config.numNeurons;
    this.weights = Array.from({ length: n }, () => [rng() * 2 - 1, rng() * 2 - 1]);
    this.biases = Array.from({ length: n }, () => rng() * 2 - 1);
  }

  public getWeights(): number[][] {
    return this.weights;
  }

  public getBiases(): number[] {
    return this.biases;
  }

  public partition(gridResolution: number): ReLUPolytopeResult {
    // A single sample point cannot describe a grid: `i / (resolution - 1)`
    // divides by zero and every coordinate becomes NaN, which silently maps
    // every cell to pattern 0.
    if (!Number.isInteger(gridResolution) || gridResolution < 2) {
      throw new RangeError(
        `gridResolution must be an integer >= 2, received ${gridResolution}`,
      );
    }

    const { min, max } = this.config.bounds;
    const span = max - min;
    const n = this.config.numNeurons;
    const total = gridResolution * gridResolution;
    const patternIds = new Array<number>(total);

    // Precompute
    const xs = new Array<number>(gridResolution);
    const ys = new Array<number>(gridResolution);
    for (let i = 0; i < gridResolution; i++) {
      xs[i] = min + (i / (gridResolution - 1)) * span;
      ys[i] = min + (i / (gridResolution - 1)) * span;
    }

    for (let yi = 0; yi < gridResolution; yi++) {
      for (let xi = 0; xi < gridResolution; xi++) {
        const x = xs[xi];
        const y = ys[yi];
        let id = 0;
        for (let k = 0; k < n; k++) {
          const z = this.weights[k][0] * x + this.weights[k][1] * y + this.biases[k];
          if (z > 0) id |= 1 << k;
        }
        patternIds[yi * gridResolution + xi] = id;
      }
    }

    const boundaryLines = this.weights.map((w, i) => {
      const [w1, w2] = w;
      const b = this.biases[i];
      // w1*x + w2*y + b = 0. A vertical line has no slope, so it is reported
      // as x = verticalX rather than pretending slope 0 / intercept 0 draws it.
      const isVertical = Math.abs(w2) <= 1e-9 && Math.abs(w1) > 1e-9;
      const slope = isVertical || Math.abs(w2) <= 1e-9 ? Infinity : -w1 / w2;
      const intercept = Math.abs(w2) <= 1e-9 ? 0 : -b / w2;
      const verticalX = isVertical ? -b / w1 : null;

      // withinBounds means the activation boundary actually crosses the sampled
      // box, not merely that the line is non-vertical: a line far outside the
      // box cuts nothing and draws nothing.
      let hasPositive = false;
      let hasNegative = false;
      for (const x of [min, max]) {
        for (const y of [min, max]) {
          const value = w1 * x + w2 * y + b;
          if (value > 0) hasPositive = true;
          else if (value < 0) hasNegative = true;
          else {
            // The line passes exactly through a corner: it touches the box.
            hasPositive = true;
            hasNegative = true;
          }
        }
      }

      return {
        slope,
        intercept,
        verticalX,
        withinBounds: hasPositive && hasNegative,
      };
    });

    return {
      weights: this.weights,
      biases: this.biases,
      gridResolution,
      patternIds,
      boundaryLines,
    };
  }
}
