/**
 * Performance Timer Utilities
 *
 * High-precision timing utilities for measuring execution time.
 *
 * @module algorithms/performance/timer
 */
/**
 * High-precision performance timer
 */
export declare class PerformanceTimer {
    private startTime;
    private endTime;
    private isRunning;
    /**
     *
     * @example
     */
    start(): void;
    /**
     *
     * @example
     */
    stop(): number;
    /**
     *
     * @example
     */
    getElapsed(): number;
    /**
     *
     * @example
     */
    reset(): void;
}
//# sourceMappingURL=timer.d.ts.map