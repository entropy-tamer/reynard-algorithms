/**
 * Discrete Cosine Transform (DCT) Implementation
 *
 * Implements DCT Type I, II, III, and IV.
 * DCT is commonly used in image compression (JPEG) and audio coding.
 */

import { BitReversal } from "./core/bit-reversal";
import type { FFTConfig } from "./fft-types";
import { Radix2FFT } from "./radix2-fft";

/**
 * DCT Type enumeration
 */
export enum DCTType {
  TYPE_I = "dct1",
  TYPE_II = "dct2",
  TYPE_III = "dct3",
  TYPE_IV = "dct4",
}

/**
 * DCT Configuration
 */
export interface DCTConfig {
  size: number;
  type: DCTType;
  normalize?: boolean;
}

/**
 * DCT Result
 */
export interface DCTResult {
  coefficients: Float32Array;
  size: number;
  type: DCTType;
}

/**
 * Base class for DCT implementations
 */
export abstract class DCTBase {
  protected size: number;
  protected config: DCTConfig;
  protected type: DCTType;

  constructor(config: DCTConfig) {
    this.config = { ...config };
    this.size = config.size;
    this.type = config.type;
  }

  /**
   * Forward DCT
   */
  abstract forward(input: Float32Array): DCTResult;

  /**
   * Inverse DCT
   */
  abstract inverse(coefficients: Float32Array): Float32Array;

  /**
   * Validate input size
   */
  protected validateSize(size: number): void {
    if (size <= 0 || !Number.isInteger(size)) {
      throw new Error(`Invalid DCT size: ${size}. Must be a positive integer.`);
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
 * DCT Type I Implementation
 * DCT-I: X[k] = x[0]/2 + sum(x[n]*cos(π*k*n/(N-1))) + x[N-1]*cos(π*k)/(2*(N-1))
 */
export class DCTTypeI extends DCTBase {
  constructor(config: DCTConfig) {
    super({ ...config, type: DCTType.TYPE_I });
    if (this.size < 2) {
      throw new Error("DCT-I requires size >= 2");
    }
  }

  forward(input: Float32Array): DCTResult {
    this.validateInput(input);
    const coefficients = new Float32Array(this.size);
    const N = this.size;
    const piOverNMinus1 = Math.PI / (N - 1);

    for (let k = 0; k < N; k++) {
      let sum = input[0] / 2;
      for (let n = 1; n < N - 1; n++) {
        sum += input[n] * Math.cos(piOverNMinus1 * k * n);
      }
      sum += (input[N - 1] * Math.cos(Math.PI * k)) / 2;
      coefficients[k] = this.config.normalize ? sum * Math.sqrt(2 / (N - 1)) : sum;
    }

    return {
      coefficients,
      size: this.size,
      type: DCTType.TYPE_I,
    };
  }

  inverse(coefficients: Float32Array): Float32Array {
    this.validateInput(coefficients);
    const output = new Float32Array(this.size);
    const N = this.size;
    const piOverNMinus1 = Math.PI / (N - 1);

    for (let n = 0; n < N; n++) {
      let sum = coefficients[0] / 2;
      for (let k = 1; k < N - 1; k++) {
        sum += coefficients[k] * Math.cos(piOverNMinus1 * k * n);
      }
      sum += (coefficients[N - 1] * Math.cos(Math.PI * n)) / 2;
      output[n] = this.config.normalize ? sum * Math.sqrt(2 / (N - 1)) : sum;
    }

    return output;
  }
}

/**
 * DCT Type II Implementation (Most common, used in JPEG)
 * DCT-II: X[k] = sum(x[n]*cos(π*k*(n+0.5)/N))
 */
export class DCTTypeII extends DCTBase {
  private fft!: Radix2FFT;

  constructor(config: DCTConfig) {
    super({ ...config, type: DCTType.TYPE_II });
    this.initialize();
  }

  private initialize(): void {
    // DCT-II can be computed via FFT with appropriate preprocessing
    const paddedSize = BitReversal.nextPowerOf2(2 * this.size);
    this.fft = new Radix2FFT({
      size: paddedSize,
      normalize: false,
    });
  }

  forward(input: Float32Array): DCTResult {
    this.validateInput(input);
    const coefficients = new Float32Array(this.size);
    const N = this.size;
    const piOverN = Math.PI / N;

    // Direct computation
    for (let k = 0; k < N; k++) {
      let sum = 0;
      for (let n = 0; n < N; n++) {
        sum += input[n] * Math.cos(piOverN * k * (n + 0.5));
      }
      coefficients[k] = this.config.normalize ? sum * Math.sqrt(2 / N) : sum;
      if (k === 0 && this.config.normalize) {
        coefficients[k] /= Math.sqrt(2);
      }
    }

    return {
      coefficients,
      size: this.size,
      type: DCTType.TYPE_II,
    };
  }

  inverse(coefficients: Float32Array): Float32Array {
    this.validateInput(coefficients);
    const output = new Float32Array(this.size);
    const N = this.size;
    const piOverN = Math.PI / N;

    // IDCT-II
    for (let n = 0; n < N; n++) {
      let sum = coefficients[0] / 2;
      for (let k = 1; k < N; k++) {
        sum += coefficients[k] * Math.cos(piOverN * k * (n + 0.5));
      }
      output[n] = this.config.normalize ? sum * Math.sqrt(2 / N) : sum;
    }

    return output;
  }
}

/**
 * DCT Type III Implementation (Inverse of DCT-II)
 * DCT-III: X[k] = x[0]/2 + sum(x[n]*cos(π*(k+0.5)*n/N))
 */
export class DCTTypeIII extends DCTBase {
  constructor(config: DCTConfig) {
    super({ ...config, type: DCTType.TYPE_III });
  }

  forward(input: Float32Array): DCTResult {
    this.validateInput(input);
    const coefficients = new Float32Array(this.size);
    const N = this.size;
    const piOverN = Math.PI / N;

    for (let k = 0; k < N; k++) {
      let sum = input[0] / 2;
      for (let n = 1; n < N; n++) {
        sum += input[n] * Math.cos(piOverN * (k + 0.5) * n);
      }
      coefficients[k] = this.config.normalize ? sum * Math.sqrt(2 / N) : sum;
    }

    return {
      coefficients,
      size: this.size,
      type: DCTType.TYPE_III,
    };
  }

  inverse(coefficients: Float32Array): Float32Array {
    this.validateInput(coefficients);
    const output = new Float32Array(this.size);
    const N = this.size;
    const piOverN = Math.PI / N;

    for (let n = 0; n < N; n++) {
      let sum = coefficients[0] / 2;
      for (let k = 1; k < N; k++) {
        sum += coefficients[k] * Math.cos(piOverN * (k + 0.5) * n);
      }
      output[n] = this.config.normalize ? sum * Math.sqrt(2 / N) : sum;
    }

    return output;
  }
}

/**
 * DCT Type IV Implementation
 * DCT-IV: X[k] = sum(x[n]*cos(π*(k+0.5)*(n+0.5)/N))
 */
export class DCTTypeIV extends DCTBase {
  constructor(config: DCTConfig) {
    super({ ...config, type: DCTType.TYPE_IV });
  }

  forward(input: Float32Array): DCTResult {
    this.validateInput(input);
    const coefficients = new Float32Array(this.size);
    const N = this.size;
    const piOverN = Math.PI / N;

    for (let k = 0; k < N; k++) {
      let sum = 0;
      for (let n = 0; n < N; n++) {
        sum += input[n] * Math.cos(piOverN * (k + 0.5) * (n + 0.5));
      }
      coefficients[k] = this.config.normalize ? sum * Math.sqrt(2 / N) : sum;
    }

    return {
      coefficients,
      size: this.size,
      type: DCTType.TYPE_IV,
    };
  }

  inverse(coefficients: Float32Array): Float32Array {
    this.validateInput(coefficients);
    const output = new Float32Array(this.size);
    const N = this.size;
    const piOverN = Math.PI / N;

    // IDCT-IV is the same as forward DCT-IV
    for (let n = 0; n < N; n++) {
      let sum = 0;
      for (let k = 0; k < N; k++) {
        sum += coefficients[k] * Math.cos(piOverN * (k + 0.5) * (n + 0.5));
      }
      output[n] = this.config.normalize ? sum * Math.sqrt(2 / N) : sum;
    }

    return output;
  }
}

/**
 * DCT Factory
 */
export class DCTFactory {
  /**
   * Create DCT instance based on type
   */
  static create(config: DCTConfig): DCTBase {
    switch (config.type) {
      case DCTType.TYPE_I:
        return new DCTTypeI(config);
      case DCTType.TYPE_II:
        return new DCTTypeII(config);
      case DCTType.TYPE_III:
        return new DCTTypeIII(config);
      case DCTType.TYPE_IV:
        return new DCTTypeIV(config);
      default:
        throw new Error(`Unknown DCT type: ${config.type}`);
    }
  }
}

