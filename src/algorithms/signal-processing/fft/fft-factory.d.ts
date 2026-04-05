/**
 * FFT Factory
 *
 * Factory class for creating FFT instances with automatic algorithm selection
 * based on size and performance requirements.
 */
import { FFTAlgorithm, type FFTConfig } from "./fft-types";
import { FFTBase } from "./fft-base";
/**
 * FFT Factory class
 */
export declare class FFTFactory {
    /**
     * Create FFT instance based on configuration
     * @param config
     * @example
     */
    static create(config: FFTConfig): FFTBase;
    /**
     * Create FFT with automatic algorithm selection
     * @param size
     * @param baseConfig
     * @example
     */
    static createAuto(size: number, baseConfig?: Partial<FFTConfig>): FFTBase;
    /**
     * Create FFT with specific algorithm
     * @param algorithm
     * @param size
     * @param baseConfig
     * @example
     */
    static createWithAlgorithm(algorithm: FFTAlgorithm, size: number, baseConfig?: Partial<FFTConfig>): FFTBase;
    /**
     * Get best algorithm for given size
     * @param size
     * @example
     */
    static getBestAlgorithm(size: number): FFTAlgorithm;
    /**
     * Get supported sizes for each algorithm
     * @param algorithm
     * @example
     */
    static getSupportedSizes(algorithm: FFTAlgorithm): number[];
    /**
     * Get power-of-2 sizes
     * @example
     */
    private static getPowerOf2Sizes;
    /**
     * Get power-of-4 sizes
     * @example
     */
    private static getPowerOf4Sizes;
    /**
     * Check if size is supported by algorithm
     * @param algorithm
     * @param size
     * @example
     */
    static isSizeSupported(algorithm: FFTAlgorithm, size: number): boolean;
    /**
     * Get algorithm recommendations for different use cases
     * @example
     */
    static getRecommendations(): {
        [key: string]: {
            algorithm: FFTAlgorithm;
            description: string;
            bestFor: string[];
        };
    };
    /**
     * Get algorithm description
     * @param algorithm
     * @example
     */
    static getAlgorithmDescription(algorithm: FFTAlgorithm): string;
    /**
     * Get factory statistics
     * @example
     */
    static getFactoryStats(): {
        totalAlgorithms: number;
        implementedAlgorithms: number;
        supportedSizes: number;
        recommendations: number;
    };
}
//# sourceMappingURL=fft-factory.d.ts.map