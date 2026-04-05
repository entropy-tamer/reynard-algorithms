/**
 * Performance Budget Management
 *
 * Performance budget checking and validation utilities.
 *
 * @module algorithms/performance/budget
 */
import type { PerformanceBudget, PerformanceMetrics } from "./types";
/**
 * Performance budget checker
 */
export declare class PerformanceBudgetChecker {
    private budgets;
    /**
     *
     * @param name
     * @param budget
     * @example
     */
    setBudget(name: string, budget: PerformanceBudget): void;
    /**
     *
     * @param name
     * @param metrics
     * @example
     */
    checkBudget(name: string, metrics: PerformanceMetrics): boolean;
    /**
     *
     * @param name
     * @example
     */
    clearBudget(name: string): void;
    /**
     *
     * @example
     */
    clearAllBudgets(): void;
}
//# sourceMappingURL=budget.d.ts.map