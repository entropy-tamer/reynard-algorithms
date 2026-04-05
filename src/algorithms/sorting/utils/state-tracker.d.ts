/**
 * @file State tracking utilities for sorting algorithms
 * Provides utilities for recording sorting states and steps
 */
import type { Comparator, SortingConfig, SortingOperation, SortingState, SortingStep } from "../core/types";
/**
 * State tracker for recording sorting algorithm execution
 */
export declare class StateTracker<T> {
    private steps;
    private currentState;
    private config;
    private comparator;
    private startTime;
    /**
     *
     * @param initialArray
     * @param comparator
     * @param config
     * @example
     */
    constructor(initialArray: T[], comparator: Comparator<T>, config: SortingConfig);
    /**
     * Record a comparison operation
     * @param indices
     * @param description
     * @example
     */
    recordCompare(indices: [number, number], description: string): void;
    /**
     * Record a swap operation
     * @param indices
     * @param description
     * @example
     */
    recordSwap(indices: [number, number], description: string): void;
    /**
     * Record a partition operation
     * @param indices
     * @param pivotIndex
     * @param pivotValue
     * @param description
     * @example
     */
    recordPartition(indices: number[], pivotIndex: number, pivotValue: T, description: string): void;
    /**
     * Record a merge operation
     * @param indices
     * @param leftStart
     * @param leftEnd
     * @param rightStart
     * @param rightEnd
     * @param description
     * @example
     */
    recordMerge(indices: number[], leftStart: number, leftEnd: number, rightStart: number, rightEnd: number, description: string): void;
    /**
     * Record a generic operation
     * @param operation
     * @param indices
     * @param description
     * @param auxiliary
     * @example
     */
    recordOperation(operation: SortingOperation, indices: number[], description: string, auxiliary?: Record<string, unknown>): void;
    /**
     * Update the array state (for algorithms that modify in place)
     * @param newArray
     * @example
     */
    updateArray(newArray: T[]): void;
    /**
     * Get current state
     * @example
     */
    getCurrentState(): SortingState<T>;
    /**
     * Get all recorded steps
     * @example
     */
    getSteps(): SortingStep<T>[];
    /**
     * Add a step to the recording
     * @param operation
     * @param indices
     * @param description
     * @param auxiliary
     * @example
     */
    private addStep;
}
//# sourceMappingURL=state-tracker.d.ts.map