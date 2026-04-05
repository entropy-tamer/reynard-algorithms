/**
 * Memo Registry
 *
 * Lightweight registry for managing adaptive memo instances across the codebase.
 * Provides runtime inspection and policy updates for PAW integration.
 */
import { AdaptiveMemoController, MemoTuningPolicy } from "./memo/adaptive-memo";
/**
 *
 */
declare class MemoRegistry {
    private entries;
    /**
     *
     * @param name
     * @param controller
     * @example
     */
    register(name: string, controller: AdaptiveMemoController<any[], any>): void;
    /**
     *
     * @param name
     * @example
     */
    getStats(name: string): import(".").AdaptiveStats | null;
    /**
     *
     * @example
     */
    getAllStats(): Record<string, any>;
    /**
     *
     * @param name
     * @param policy
     * @example
     */
    setPolicy(name: string, policy: Partial<MemoTuningPolicy>): boolean;
    /**
     *
     * @param name
     * @example
     */
    enable(name: string): boolean;
    /**
     *
     * @param name
     * @example
     */
    disable(name: string): boolean;
    /**
     *
     * @param name
     * @example
     */
    resetStats(name?: string): void;
    /**
     *
     * @example
     */
    listEntries(): string[];
}
export declare const memoRegistry: MemoRegistry;
/**
 *
 * @param name
 * @example
 */
export declare function getMemoStats(name?: string): Record<string, any> | import(".").AdaptiveStats | null;
/**
 *
 * @param name
 * @param policy
 * @example
 */
export declare function setMemoPolicy(name: string, policy: Partial<MemoTuningPolicy>): boolean;
/**
 *
 * @param name
 * @example
 */
export declare function resetMemoStats(name?: string): void;
/**
 *
 * @param name
 * @example
 */
export declare function enableMemo(name: string): boolean;
/**
 *
 * @param name
 * @example
 */
export declare function disableMemo(name: string): boolean;
export {};
//# sourceMappingURL=memo-registry.d.ts.map