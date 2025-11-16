/**
 * Complex Number Operations
 *
 * High-performance complex number arithmetic for FFT operations.
 */

/**
 * Complex number representation using separate real and imaginary arrays
 * for efficient memory layout and SIMD optimization potential
 */
export interface ComplexArray {
  real: Float32Array;
  imag: Float32Array;
}

/**
 * Complex number class with efficient operations
 */
export class ComplexNumber {
  public real: number;
  public imag: number;

  constructor(real: number = 0, imag: number = 0) {
    this.real = real;
    this.imag = imag;
  }

  /**
   * Set values
   */
  set(real: number, imag: number): void {
    this.real = real;
    this.imag = imag;
  }

  /**
   * Copy from another complex number
   */
  copy(other: ComplexNumber): void {
    this.real = other.real;
    this.imag = other.imag;
  }

  /**
   * Add another complex number
   */
  add(other: ComplexNumber): ComplexNumber {
    this.real += other.real;
    this.imag += other.imag;
    return this;
  }

  /**
   * Subtract another complex number
   */
  subtract(other: ComplexNumber): ComplexNumber {
    this.real -= other.real;
    this.imag -= other.imag;
    return this;
  }

  /**
   * Multiply by another complex number
   */
  multiply(other: ComplexNumber): ComplexNumber {
    const real = this.real * other.real - this.imag * other.imag;
    const imag = this.real * other.imag + this.imag * other.real;
    this.real = real;
    this.imag = imag;
    return this;
  }

  /**
   * Divide by another complex number
   */
  divide(other: ComplexNumber): ComplexNumber {
    const denominator = other.real * other.real + other.imag * other.imag;
    const real = (this.real * other.real + this.imag * other.imag) / denominator;
    const imag = (this.imag * other.real - this.real * other.imag) / denominator;
    this.real = real;
    this.imag = imag;
    return this;
  }

  /**
   * Complex conjugate
   */
  conjugate(): ComplexNumber {
    this.imag = -this.imag;
    return this;
  }

  /**
   * Magnitude (absolute value)
   */
  magnitude(): number {
    return Math.sqrt(this.real * this.real + this.imag * this.imag);
  }

  /**
   * Phase (argument)
   */
  phase(): number {
    return Math.atan2(this.imag, this.real);
  }

  /**
   * Power (magnitude squared)
   */
  power(): number {
    return this.real * this.real + this.imag * this.imag;
  }

  /**
   * Scale by a real number
   */
  scale(factor: number): ComplexNumber {
    this.real *= factor;
    this.imag *= factor;
    return this;
  }

  /**
   * Static factory methods
   */
  static fromPolar(magnitude: number, phase: number): ComplexNumber {
    return new ComplexNumber(magnitude * Math.cos(phase), magnitude * Math.sin(phase));
  }

  static zero(): ComplexNumber {
    return new ComplexNumber(0, 0);
  }

  static one(): ComplexNumber {
    return new ComplexNumber(1, 0);
  }

  static i(): ComplexNumber {
    return new ComplexNumber(0, 1);
  }

  /**
   * Static arithmetic operations (create new instances)
   */
  static add(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
    return new ComplexNumber(a.real + b.real, a.imag + b.imag);
  }

  static subtract(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
    return new ComplexNumber(a.real - b.real, a.imag - b.imag);
  }

  static multiply(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
    return new ComplexNumber(a.real * b.real - a.imag * b.imag, a.real * b.imag + a.imag * b.real);
  }

  static divide(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
    const denominator = b.real * b.real + b.imag * b.imag;
    return new ComplexNumber(
      (a.real * b.real + a.imag * b.imag) / denominator,
      (a.imag * b.real - a.real * b.imag) / denominator
    );
  }
}

/**
 * Complex array operations for efficient bulk processing
 */
export class ComplexArrayOps {
  /**
   * Create complex array from real and imaginary parts
   */
  static create(size: number): ComplexArray {
    return {
      real: new Float32Array(size),
      imag: new Float32Array(size),
    };
  }

  /**
   * Copy complex array
   */
  static copy(source: ComplexArray, dest: ComplexArray): void {
    dest.real.set(source.real);
    dest.imag.set(source.imag);
  }

  /**
   * Add two complex arrays
   */
  static add(a: ComplexArray, b: ComplexArray, result: ComplexArray): void {
    for (let i = 0; i < a.real.length; i++) {
      result.real[i] = a.real[i] + b.real[i];
      result.imag[i] = a.imag[i] + b.imag[i];
    }
  }

  /**
   * Subtract two complex arrays
   */
  static subtract(a: ComplexArray, b: ComplexArray, result: ComplexArray): void {
    for (let i = 0; i < a.real.length; i++) {
      result.real[i] = a.real[i] - b.real[i];
      result.imag[i] = a.imag[i] - b.imag[i];
    }
  }

  /**
   * Multiply two complex arrays
   */
  static multiply(a: ComplexArray, b: ComplexArray, result: ComplexArray): void {
    for (let i = 0; i < a.real.length; i++) {
      const real = a.real[i] * b.real[i] - a.imag[i] * b.imag[i];
      const imag = a.real[i] * b.imag[i] + a.imag[i] * b.real[i];
      result.real[i] = real;
      result.imag[i] = imag;
    }
  }

  /**
   * Scale complex array by real factor
   */
  static scale(array: ComplexArray, factor: number): void {
    for (let i = 0; i < array.real.length; i++) {
      array.real[i] *= factor;
      array.imag[i] *= factor;
    }
  }

  /**
   * Compute magnitude array
   */
  static magnitude(array: ComplexArray, result: Float32Array): void {
    for (let i = 0; i < array.real.length; i++) {
      result[i] = Math.sqrt(array.real[i] * array.real[i] + array.imag[i] * array.imag[i]);
    }
  }

  /**
   * Compute phase array
   */
  static phase(array: ComplexArray, result: Float32Array): void {
    for (let i = 0; i < array.real.length; i++) {
      result[i] = Math.atan2(array.imag[i], array.real[i]);
    }
  }

  /**
   * Compute power array
   */
  static power(array: ComplexArray, result: Float32Array): void {
    for (let i = 0; i < array.real.length; i++) {
      result[i] = array.real[i] * array.real[i] + array.imag[i] * array.imag[i];
    }
  }
}
