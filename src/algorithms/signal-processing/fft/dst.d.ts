/**
 * Discrete Sine Transform (DST) Implementation
 *
 * Implements DST Type I, II, III, and IV.
 * DST is related to DCT and is used in signal processing applications.
 */
/**
 * DST Type enumeration
 */
export declare enum DSTType {
    TYPE_I = "dst1",
    TYPE_II = "dst2",
    TYPE_III = "dst3",
    TYPE_IV = "dst4"
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
export declare abstract class DSTBase {
    protected size: number;
    protected config: DSTConfig;
    protected type: DSTType;
    /**
     *
     * @param config
     * @example
     */
    constructor(config: DSTConfig);
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
 * DST Type I Implementation
 * DST-I: X[k] = sum(x[n]*sin(π*(k+1)*(n+1)/(N+1)))
 */
export declare class DSTTypeI extends DSTBase {
    /**
     *
     * @param config
     * @example
     */
    constructor(config: DSTConfig);
    /**
     *
     * @param input
     * @example
     */
    forward(input: Float32Array): DSTResult;
    /**
     *
     * @param coefficients
     * @example
     */
    inverse(coefficients: Float32Array): Float32Array;
}
/**
 * DST Type II Implementation
 * DST-II: X[k] = sum(x[n]*sin(π*(k+1)*(n+0.5)/N))
 */
export declare class DSTTypeII extends DSTBase {
    /**
     *
     * @param config
     * @example
     */
    constructor(config: DSTConfig);
    /**
     *
     * @param input
     * @example
     */
    forward(input: Float32Array): DSTResult;
    /**
     *
     * @param coefficients
     * @example
     */
    inverse(coefficients: Float32Array): Float32Array;
}
/**
 * DST Type III Implementation (Inverse of DST-II)
 * DST-III: X[k] = (-1)^k * x[N-1]/2 + sum(x[n]*sin(π*(k+0.5)*(n+1)/N))
 */
export declare class DSTTypeIII extends DSTBase {
    /**
     *
     * @param config
     * @example
     */
    constructor(config: DSTConfig);
    /**
     *
     * @param input
     * @example
     */
    forward(input: Float32Array): DSTResult;
    /**
     *
     * @param coefficients
     * @example
     */
    inverse(coefficients: Float32Array): Float32Array;
}
/**
 * DST Type IV Implementation
 * DST-IV: X[k] = sum(x[n]*sin(π*(k+0.5)*(n+0.5)/N))
 */
export declare class DSTTypeIV extends DSTBase {
    /**
     *
     * @param config
     * @example
     */
    constructor(config: DSTConfig);
    /**
     *
     * @param input
     * @example
     */
    forward(input: Float32Array): DSTResult;
    /**
     *
     * @param coefficients
     * @example
     */
    inverse(coefficients: Float32Array): Float32Array;
}
/**
 * DST Factory
 */
export declare class DSTFactory {
    /**
     * Create DST instance based on type
     * @param config
     * @example
     */
    static create(config: DSTConfig): DSTBase;
}
//# sourceMappingURL=dst.d.ts.map