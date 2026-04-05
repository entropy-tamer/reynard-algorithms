/**
 * Memory Monitoring Utilities
 *
 * Memory usage monitoring and leak detection utilities.
 *
 * @module algorithms/performance/memory
 */
/**
 * Memory usage monitor
 */
export declare class MemoryMonitor {
    private measurements;
    /**
     *
     * @example
     */
    measure(): number;
    /**
     *
     * @example
     */
    getDelta(): number;
    /**
     *
     * @example
     */
    getAverageUsage(): number;
    /**
     *
     * @example
     */
    clear(): void;
}
/**
 * Memory leak detector
 */
export declare class MemoryLeakDetector {
    private snapshots;
    private objectCount;
    /**
     *
     * @example
     */
    takeSnapshot(): void;
    /**
     *
     * @example
     */
    detectLeak(): {
        isLeaking: boolean;
        growthRate: number;
        confidence: number;
    };
    /**
     *
     * @example
     */
    private getMemoryUsage;
    /**
     *
     * @example
     */
    clear(): void;
}
//# sourceMappingURL=memory.d.ts.map