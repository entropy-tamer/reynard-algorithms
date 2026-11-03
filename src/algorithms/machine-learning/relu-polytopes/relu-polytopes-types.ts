export interface ReLUPolytopeConfig {
  numNeurons: number;
  seed: number;
  bounds: { min: number; max: number };
  /**
   * Explicit first-layer weights, `[numNeurons][2]`. When supplied, the seeded
   * random layer is not generated and `numNeurons` is derived from this array.
   * `weights` and `biases` must be supplied together.
   */
  weights?: number[][];
  /** Explicit first-layer biases, `[numNeurons]`. */
  biases?: number[];
}

/** The activation boundary of one neuron, in the sampled plane. */
export interface ReLUPolytopeBoundaryLine {
  /** Slope of `y = slope * x + intercept`; `Infinity` for a vertical line. */
  slope: number;
  /** Y-intercept; meaningless when `slope` is `Infinity`. */
  intercept: number;
  /** X coordinate of a vertical line, `null` otherwise. */
  verticalX: number | null;
  /** Whether the line actually crosses the configured sampling box. */
  withinBounds: boolean;
}

export interface ReLUPolytopeResult {
  weights: number[][]; // [numNeurons][2]
  biases: number[]; // [numNeurons]
  gridResolution: number;
  patternIds: number[]; // length gridResolution^2, row-major: index = y * resolution + x
  boundaryLines: ReLUPolytopeBoundaryLine[];
}

export const DEFAULT_RELU_POLYTOPE_CONFIG: ReLUPolytopeConfig = {
  numNeurons: 8,
  seed: 42,
  bounds: { min: -2, max: 2 },
};
