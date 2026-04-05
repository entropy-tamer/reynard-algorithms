/**
 * Discrete Cosine Transform (DCT) Implementation
 *
 * Implements DCT Type I, II, III, and IV.
 * DCT is commonly used in image compression (JPEG) and audio coding.
 */
/**
 * DCT Type enumeration
 */
export declare enum DCTType {
    TYPE_I = "dct1",
    TYPE_II = "dct2",
    TYPE_III = "dct3",
    TYPE_IV = "dct4"
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
export declare abstract class DCTBase {
    protected size: number;
    protected config: DCTConfig;
    protected type: DCTType;
    /**
     *
     * @param config
     * @example
     */
    constructor(config: DCTConfig);
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
     * @param size
     * @example
     */
    protected validateSize(size: number): void;
    /**
     * Validate input array
     * @param input
     * @param expectedSize
     * @example
     */
    protected validateInput(input: Float32Array, expectedSize?: number): void;
}
/**
 * DCT Type I Implementation
 * DCT-I: X[k] = x[0]/2 + sum(x[n]*cos(π*k*n/(N-1))) + x[N-1]*cos(π*k)/(2*(N-1))
 */
export declare class DCTTypeI extends DCTBase {
    /**
     *
     * @param config
     * @example
     */
    constructor(config: DCTConfig);
    /**
     *
     * @param input
     * @example
     */
    forward(input: Float32Array): DCTResult;
    /**
     *
     * @param coefficients
     * @example
     */
    inverse(coefficients: Float32Array): Float32Array;
}
/**
 * DCT Type II Implementation (Most common, used in JPEG)
 * DCT-II: X[k] = sum(x[n]*cos(π*k*(n+0.5)/N))
 */
export declare class DCTTypeII extends DCTBase {
    /**
     *
     * @param config
     * @example
     */
    constructor(config: DCTConfig);
    /**
     *
     * @param input
     * @example
     */
    forward(input: Float32Array): DCTResult;
    /**
     *
     * @param coefficients
     * @example
     */
    inverse(coefficients: Float32Array): Float32Array;
}
/**
 * DCT Type III Implementation (Inverse of DCT-II)
 * DCT-III: X[k] = x[0]/2 + sum(x[n]*cos(π*(k+0.5)*n/N))
 */
export declare class DCTTypeIII extends DCTBase {
    /**
     *
     * @param config
     * @example
     */
    constructor(config: DCTConfig);
    /**
     *
     * @param input
     * @example
     */
    forward(input: Float32Array): DCTResult;
    /**
     *
     * @param coefficients
     * @example
     */
    inverse(coefficients: Float32Array): Float32Array;
}
/**
 * DCT Type IV Implementation
 * DCT-IV: X[k] = sum(x[n]*cos(π*(k+0.5)*(n+0.5)/N))
 */
export declare class DCTTypeIV extends DCTBase {
    /**
     *
     * @param config
     * @example
     */
    constructor(config: DCTConfig);
    /**
     *
     * @param input
     * @example
     */
    forward(input: Float32Array): DCTResult;
    /**
     *
     * @param coefficients
     * @example
     */
    inverse(coefficients: Float32Array): Float32Array;
}
/**
 * DCT Factory
 */
export declare class DCTFactory {
    /**
     * Create DCT instance based on type
     * @param config
     * @example
     */
    static create(config: DCTConfig): DCTBase;
}
//# sourceMappingURL=dct.d.ts.map