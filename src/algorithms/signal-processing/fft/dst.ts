/**
 * Discrete Sine Transform (DST) Implementation
 *
 * Implements DST Type I, II, III, and IV.
 * DST is related to DCT and is used in signal processing applications.
 */

import type { DCTConfig, DCTResult } from "./dct";
import { DCTBase } from "./dct";

/**
 * DST Type enumeration
 */
export enum DSTType {
  TYPE_I = "dst1",
  TYPE_II = "dst2",
  TYPE_III = "dst3",
  TYPE_IV = "dst4",
}

/**
 * DST Configuration
 */
export interface DSTConfig {
  size: number;
  type: DSTType;
  normalize?: boolean;
}

/**
 * DST Result
 */
export interface DSTResult {
  coefficients: Float32Array;
  size: number;
  type: DSTType;
}

/**
 * Base class for DST implementations
 */
export abstract class DSTBase {
  protected size: number;
  protected config: DSTConfig;
  protected type: DSTType;

  constructor(config: DSTConfig) {
    this.config = { ...config };
    this.size = config.size;
    this.type = config.type;
  }

  /**
   * Forward DST
   */
  abstract forward(input: Float32Array): DSTResult;

  /**
   * Inverse DST
   */
  abstract inverse(coefficients: Float32Array): Float32Array;

  /**
   * Validate input size
   */
  protected validateSize(size: number): void {
    if (size <= 0 || !Number.isInteger(size)) {
      throw new Error(`Invalid DST size: ${size}. Must be a positive integer.`);
    }
  }

  /**
   * Validate input array
   */
  protected validateInput(input: Float32Array, expectedSize?: number): void {
    const size = expectedSize || this.size;
    if (input.length !== size) {
      throw new Error(`Input size mismatch. Expected ${size}, got ${input.length}`);
    }
  }
}

/**
 * DST Type I Implementation
 * DST-I: X[k] = sum(x[n]*sin(π*(k+1)*(n+1)/(N+1)))
 */
export class DSTTypeI extends DSTBase {
  constructor(config: DSTConfig) {
    super({ ...config, type: DSTType.TYPE_I });
    if (this.size < 1) {
      throw new Error("DST-I requires size >= 1");
    }
  }

  forward(input: Float32Array): DSTResult {
    this.validateInput(input);
    const coefficients = new Float32Array(this.size);
    const N = this.size;
    const piOverNPlus1 = Math.PI / (N + 1);

    for (let k = 0; k < N; k++) {
      let sum = 0;
      for (let n = 0; n < N; n++) {
        sum += input[n] * Math.sin(piOverNPlus1 * (k + 1) * (n + 1));
      }
      coefficients[k] = this.config.normalize ? sum * Math.sqrt(2 / (N + 1)) : sum;
    }

    return {
      coefficients,
      size: this.size,
      type: DSTType.TYPE_I,
    };
  }

  inverse(coefficients: Float32Array): Float32Array {
    this.validateInput(coefficients);
    const output = new Float32Array(this.size);
    const N = this.size;
    const piOverNPlus1 = Math.PI / (N + 1);

    // IDST-I is the same as forward DST-I
    for (let n = 0; n < N; n++) {
      let sum = 0;
      for (let k = 0; k < N; k++) {
        sum += coefficients[k] * Math.sin(piOverNPlus1 * (k + 1) * (n + 1));
      }
      output[n] = this.config.normalize ? sum * Math.sqrt(2 / (N + 1)) : sum;
    }

    return output;
  }
}

/**
 * DST Type II Implementation
 * DST-II: X[k] = sum(x[n]*sin(π*(k+1)*(n+0.5)/N))
 */
export class DSTTypeII extends DSTBase {
  constructor(config: DSTConfig) {
    super({ ...config, type: DSTType.TYPE_II });
  }

  forward(input: Float32Array): DSTResult {
    this.validateInput(input);
    const coefficients = new Float32Array(this.size);
    const N = this.size;
    const piOverN = Math.PI / N;

    for (let k = 0; k < N; k++) {
      let sum = 0;
      for (let n = 0; n < N; n++) {
        sum += input[n] * Math.sin(piOverN * (k + 1) * (n + 0.5));
      }
      coefficients[k] = this.config.normalize ? sum * Math.sqrt(2 / N) : sum;
    }

    return {
      coefficients,
      size: this.size,
      type: DSTType.TYPE_II,
    };
  }

  inverse(coefficients: Float32Array): Float32Array {
    this.validateInput(coefficients);
    const output = new Float32Array(this.size);
    const N = this.size;
    const piOverN = Math.PI / N;

    // IDST-II
    for (let n = 0; n < N; n++) {
      let sum = 0;
      for (let k = 0; k < N; k++) {
        sum += coefficients[k] * Math.sin(piOverN * (k + 1) * (n + 0.5));
      }
      output[n] = this.config.normalize ? sum * Math.sqrt(2 / N) : sum;
    }

    return output;
  }
}

/**
 * DST Type III Implementation (Inverse of DST-II)
 * DST-III: X[k] = (-1)^k * x[N-1]/2 + sum(x[n]*sin(π*(k+0.5)*(n+1)/N))
 */
export class DSTTypeIII extends DSTBase {
  constructor(config: DSTConfig) {
    super({ ...config, type: DSTType.TYPE_III });
  }

  forward(input: Float32Array): DSTResult {
    this.validateInput(input);
    const coefficients = new Float32Array(this.size);
    const N = this.size;
    const piOverN = Math.PI / N;

    for (let k = 0; k < N; k++) {
      let sum = ((k % 2 === 0 ? 1 : -1) * input[N - 1]) / 2;
      for (let n = 0; n < N - 1; n++) {
        sum += input[n] * Math.sin(piOverN * (k + 0.5) * (n + 1));
      }
      coefficients[k] = this.config.normalize ? sum * Math.sqrt(2 / N) : sum;
    }

    return {
      coefficients,
      size: this.size,
      type: DSTType.TYPE_III,
    };
  }

  inverse(coefficients: Float32Array): Float32Array {
    this.validateInput(coefficients);
    const output = new Float32Array(this.size);
    const N = this.size;
    const piOverN = Math.PI / N;

    // IDST-III
    for (let n = 0; n < N; n++) {
      let sum = 0;
      for (let k = 0; k < N; k++) {
        sum += coefficients[k] * Math.sin(piOverN * (k + 0.5) * (n + 1));
      }
      output[n] = this.config.normalize ? sum * Math.sqrt(2 / N) : sum;
    }

    return output;
  }
}

/**
 * DST Type IV Implementation
 * DST-IV: X[k] = sum(x[n]*sin(π*(k+0.5)*(n+0.5)/N))
 */
export class DSTTypeIV extends DSTBase {
  constructor(config: DSTConfig) {
    super({ ...config, type: DSTType.TYPE_IV });
  }

  forward(input: Float32Array): DSTResult {
    this.validateInput(input);
    const coefficients = new Float32Array(this.size);
    const N = this.size;
    const piOverN = Math.PI / N;

    for (let k = 0; k < N; k++) {
      let sum = 0;
      for (let n = 0; n < N; n++) {
        sum += input[n] * Math.sin(piOverN * (k + 0.5) * (n + 0.5));
      }
      coefficients[k] = this.config.normalize ? sum * Math.sqrt(2 / N) : sum;
    }

    return {
      coefficients,
      size: this.size,
      type: DSTType.TYPE_IV,
    };
  }

  inverse(coefficients: Float32Array): Float32Array {
    this.validateInput(coefficients);
    const output = new Float32Array(this.size);
    const N = this.size;
    const piOverN = Math.PI / N;

    // IDST-IV is the same as forward DST-IV
    for (let n = 0; n < N; n++) {
      let sum = 0;
      for (let k = 0; k < N; k++) {
        sum += coefficients[k] * Math.sin(piOverN * (k + 0.5) * (n + 0.5));
      }
      output[n] = this.config.normalize ? sum * Math.sqrt(2 / N) : sum;
    }

    return output;
  }
}

/**
 * DST Factory
 */
export class DSTFactory {
  /**
   * Create DST instance based on type
   */
  static create(config: DSTConfig): DSTBase {
    switch (config.type) {
      case DSTType.TYPE_I:
        return new DSTTypeI(config);
      case DSTType.TYPE_II:
        return new DSTTypeII(config);
      case DSTType.TYPE_III:
        return new DSTTypeIII(config);
      case DSTType.TYPE_IV:
        return new DSTTypeIV(config);
      default:
        throw new Error(`Unknown DST type: ${config.type}`);
    }
  }
}

