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
export declare class ComplexNumber {
    real: number;
    imag: number;
    /**
     *
     * @param real
     * @param imag
     * @example
     */
    constructor(real?: number, imag?: number);
    /**
     * Set values
     * @param real
     * @param imag
     * @example
     */
    set(real: number, imag: number): void;
    /**
     * Copy from another complex number
     * @param other
     * @example
     */
    copy(other: ComplexNumber): void;
    /**
     * Add another complex number
     * @param other
     * @example
     */
    add(other: ComplexNumber): ComplexNumber;
    /**
     * Subtract another complex number
     * @param other
     * @example
     */
    subtract(other: ComplexNumber): ComplexNumber;
    /**
     * Multiply by another complex number
     * @param other
     * @example
     */
    multiply(other: ComplexNumber): ComplexNumber;
    /**
     * Divide by another complex number
     * @param other
     * @example
     */
    divide(other: ComplexNumber): ComplexNumber;
    /**
     * Complex conjugate
     * @example
     */
    conjugate(): ComplexNumber;
    /**
     * Magnitude (absolute value)
     * @example
     */
    magnitude(): number;
    /**
     * Phase (argument)
     * @example
     */
    phase(): number;
    /**
     * Power (magnitude squared)
     * @example
     */
    power(): number;
    /**
     * Scale by a real number
     * @param factor
     * @example
     */
    scale(factor: number): ComplexNumber;
    /**
     * Static factory methods
     * @param magnitude
     * @param phase
     * @example
     */
    static fromPolar(magnitude: number, phase: number): ComplexNumber;
    /**
     *
     * @example
     */
    static zero(): ComplexNumber;
    /**
     *
     * @example
     */
    static one(): ComplexNumber;
    /**
     *
     * @example
     */
    static i(): ComplexNumber;
    /**
     * Static arithmetic operations (create new instances)
     * @param a
     * @param b
     * @example
     */
    static add(a: ComplexNumber, b: ComplexNumber): ComplexNumber;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static subtract(a: ComplexNumber, b: ComplexNumber): ComplexNumber;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static multiply(a: ComplexNumber, b: ComplexNumber): ComplexNumber;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    static divide(a: ComplexNumber, b: ComplexNumber): ComplexNumber;
}
/**
 * Complex array operations for efficient bulk processing
 */
export declare class ComplexArrayOps {
    /**
     * Create complex array from real and imaginary parts
     * @param size
     * @example
     */
    static create(size: number): ComplexArray;
    /**
     * Copy complex array
     * @param source
     * @param dest
     * @example
     */
    static copy(source: ComplexArray, dest: ComplexArray): void;
    /**
     * Add two complex arrays
     * @param a
     * @param b
     * @param result
     * @example
     */
    static add(a: ComplexArray, b: ComplexArray, result: ComplexArray): void;
    /**
     * Subtract two complex arrays
     * @param a
     * @param b
     * @param result
     * @example
     */
    static subtract(a: ComplexArray, b: ComplexArray, result: ComplexArray): void;
    /**
     * Multiply two complex arrays
     * @param a
     * @param b
     * @param result
     * @example
     */
    static multiply(a: ComplexArray, b: ComplexArray, result: ComplexArray): void;
    /**
     * Scale complex array by real factor
     * @param array
     * @param factor
     * @example
     */
    static scale(array: ComplexArray, factor: number): void;
    /**
     * Compute magnitude array
     * @param array
     * @param result
     * @example
     */
    static magnitude(array: ComplexArray, result: Float32Array): void;
    /**
     * Compute phase array
     * @param array
     * @param result
     * @example
     */
    static phase(array: ComplexArray, result: Float32Array): void;
    /**
     * Compute power array
     * @param array
     * @param result
     * @example
     */
    static power(array: ComplexArray, result: Float32Array): void;
}
//# sourceMappingURL=complex-number.d.ts.map