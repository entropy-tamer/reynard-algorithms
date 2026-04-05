/**
 * FFT Base Class
 *
 * Abstract base class for all FFT implementations with common functionality,
 * performance monitoring, and integration with Reynard algorithms package.
 */
import { MemoryMonitor } from "../../../utils/memory/memory";
import { PerformanceTimer } from "../../../utils/performance/timer";
import { type DSPStats, type FFTConfig, type FFTPerformanceMetrics, type FFTResult } from "./fft-types";
/**
 * Abstract FFT base class
 */
export declare abstract class FFTBase {
    protected size: number;
    protected config: FFTConfig;
    protected performanceTimer: PerformanceTimer;
    protected memoryMonitor: MemoryMonitor;
    protected stats: DSPStats;
    private lastDuration;
    /**
     *
     * @param config
     * @example
     */
    constructor(config: FFTConfig);
    /**
     * Abstract forward FFT method
     */
    abstract forward(input: Float32Array): FFTResult;
    /**
     * Abstract forward complex FFT method
     */
    abstract forwardComplex(real: Float32Array, imag: Float32Array): FFTResult;
    /**
     * Abstract inverse FFT method
     */
    abstract inverse(real: Float32Array, imag: Float32Array): FFTResult;
    /**
     * Validate input size
     * @param size
     * @example
     */
    protected validateSize(size: number): void;
    /**
     * Validate input arrays
     * @param real
     * @param imag
     * @example
     */
    protected validateInput(real: Float32Array, imag?: Float32Array): void;
    /**
     * Normalize FFT result
     * @param result
     * @example
     */
    protected normalize(result: FFTResult): FFTResult;
    /**
     * Apply normalization, coefficient extraction, and validations to the result.
     * @param result
     * @param options
     * @param options.runValidations
     * @example
     */
    protected finalizeResult(result: FFTResult, options?: {
        runValidations?: boolean;
    }): FFTResult;
    /**
     * Create FFT result structure
     * @param real
     * @param imag
     * @example
     */
    protected createResult(real: Float32Array, imag: Float32Array): FFTResult;
    /**
     *
     * @param result
     * @example
     */
    private attachCoefficients;
    /**
     *
     * @param result
     * @example
     */
    private attachValidationWarnings;
    /**
     *
     * @example
     */
    private getNormalizationMode;
    /**
     * Update configuration
     * @param newConfig
     * @example
     */
    updateConfig(newConfig: Partial<FFTConfig>): void;
    /**
     * Reinitialize FFT for new size
     */
    protected abstract reinitialize(): void;
    /**
     * Get performance metrics
     * @example
     */
    getPerformanceMetrics(): FFTPerformanceMetrics;
    /**
     * Get optimization level (0-1)
     */
    protected abstract getOptimizationLevel(): number;
    /**
     * Get statistics
     * @example
     */
    getStats(): DSPStats;
    /**
     * Reset statistics
     * @example
     */
    resetStats(): void;
    /**
     * Get FFT size
     * @example
     */
    getSize(): number;
    /**
     * Get configuration
     * @example
     */
    getConfig(): FFTConfig;
    /**
     * Check if size is supported
     */
    abstract isSizeSupported(size: number): boolean;
    /**
     * Get supported sizes
     */
    abstract getSupportedSizes(): number[];
    /**
     * Get last duration (for internal use)
     * @example
     */
    protected getLastDuration(): number;
    /**
     * Start performance monitoring
     * @example
     */
    protected startMonitoring(): void;
    /**
     * Stop performance monitoring
     * @example
     */
    protected stopMonitoring(): void;
    /**
     * Update performance statistics
     * @example
     */
    protected updateStats(): void;
    /**
     * Benchmark FFT performance
     * @param iterations
     * @example
     */
    benchmark(iterations?: number): Promise<{
        averageTime: number;
        minTime: number;
        maxTime: number;
        throughput: number;
    }>;
    /**
     * Verify FFT accuracy with known test cases
     * @example
     */
    verifyAccuracy(): {
        dcTest: boolean;
        sineTest: boolean;
        impulseTest: boolean;
        roundTripTest: boolean;
    };
}
//# sourceMappingURL=fft-base.d.ts.map