/**
 * Adaptive Memoization Controller
 *
 * Provides a hybrid memoization wrapper with runtime tuning based on
 * observed hit rate and overhead. Falls back to pass-through if memo
 * benefit is not realized over sliding windows.
 */
export interface MemoTuningPolicy {
    name?: string;
    minHitRate: number;
    overheadBudgetMs: number;
    minSamples: number;
    windowSize: number;
    maxSize: number;
    ttlMs: number;
    enabled: boolean;
}
export interface AdaptiveStats {
    calls: number;
    hits: number;
    misses: number;
    hitRate: number;
    avgFnMs: number;
    avgOverheadMs: number;
    enabled: boolean;
}
/**
 *
 */
export declare class AdaptiveMemoController<TArgs extends any[], TResult> {
    private cache;
    private policy;
    private keygen;
    private enabled;
    private winCalls;
    private winHits;
    private winMisses;
    private winExecMs;
    private winOverheadMs;
    /**
     *
     * @param policy
     * @param keygen
     * @example
     */
    constructor(policy?: Partial<MemoTuningPolicy>, keygen?: (...args: TArgs) => string);
    /**
     *
     * @param fn
     * @example
     */
    wrap(fn: (...a: TArgs) => TResult): (...a: TArgs) => TResult;
    /**
     *
     * @param hit
     * @param execMs
     * @param overheadMs
     * @example
     */
    private record;
    /**
     *
     * @param policy
     * @example
     */
    setPolicy(policy: Partial<MemoTuningPolicy>): void;
    /**
     *
     * @example
     */
    getStats(): AdaptiveStats;
}
/**
 *
 * @param fn
 * @param policy
 * @param keygen
 * @example
 */
export declare function adaptiveMemo<TArgs extends any[], TResult>(fn: (...a: TArgs) => TResult, policy?: Partial<MemoTuningPolicy>, keygen?: (...args: TArgs) => string): (...a: TArgs) => TResult;
//# sourceMappingURL=adaptive-memo.d.ts.map