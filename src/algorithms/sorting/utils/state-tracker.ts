/**
 * @file State tracking utilities for sorting algorithms
 * Provides utilities for recording sorting states and steps
 */

import { calculateInversionCount } from "../core/metrics";
import type { Comparator, SortingConfig, SortingOperation, SortingState, SortingStep } from "../core/types";

/**
 * State tracker for recording sorting algorithm execution
 */
export class StateTracker<T> {
  private steps: SortingStep<T>[] = [];
  private currentState: SortingState<T>;
  private config: SortingConfig;
  private comparator: Comparator<T>;
  private startTime: number;

  /**
   *
   * @param initialArray
   * @param comparator
   * @param config
   * @example
   */
  constructor(initialArray: T[], comparator: Comparator<T>, config: SortingConfig) {
    this.config = config;
    this.comparator = comparator;
    this.startTime = performance.now();

    const initialInvCount = config.calculateMetrics ? calculateInversionCount([...initialArray], comparator) : 0;

    this.currentState = {
      array: [...initialArray],
      comparisons: 0,
      swaps: 0,
      inversionCount: initialInvCount,
      step: 0,
      timestamp: 0,
    };
  }

  /**
   * Record a comparison operation
   * @param indices
   * @param description
   * @example
   */
  recordCompare(indices: [number, number], description: string): void {
    if (!this.config.recordSteps) return;

    this.currentState.comparisons++;
    this.currentState.timestamp = performance.now() - this.startTime;

    this.addStep("compare", indices, description);
  }

  /**
   * Record a swap operation
   * @param indices
   * @param description
   * @example
   */
  recordSwap(indices: [number, number], description: string): void {
    if (!this.config.recordSteps) return;

    this.currentState.swaps++;
    this.currentState.timestamp = performance.now() - this.startTime;

    // Perform the swap
    const [i, j] = indices;
    const temp = this.currentState.array[i]!;
    this.currentState.array[i] = this.currentState.array[j]!;
    this.currentState.array[j] = temp;

    // Recalculate inversion count if needed
    if (this.config.calculateMetrics) {
      this.currentState.inversionCount = calculateInversionCount([...this.currentState.array], this.comparator);
    }

    this.addStep("swap", indices, description);
  }

  /**
   * Record a partition operation
   * @param indices
   * @param pivotIndex
   * @param pivotValue
   * @param description
   * @example
   */
  recordPartition(indices: number[], pivotIndex: number, pivotValue: T, description: string): void {
    if (!this.config.recordSteps) return;

    this.currentState.timestamp = performance.now() - this.startTime;

    if (this.config.calculateMetrics) {
      this.currentState.inversionCount = calculateInversionCount([...this.currentState.array], this.comparator);
    }

    this.addStep("partition", indices, description, {
      pivotIndex,
      pivotValue,
    });
  }

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
  recordMerge(
    indices: number[],
    leftStart: number,
    leftEnd: number,
    rightStart: number,
    rightEnd: number,
    description: string
  ): void {
    if (!this.config.recordSteps) return;

    this.currentState.timestamp = performance.now() - this.startTime;

    if (this.config.calculateMetrics) {
      this.currentState.inversionCount = calculateInversionCount([...this.currentState.array], this.comparator);
    }

    this.addStep("merge", indices, description, {
      leftStart,
      leftEnd,
      rightStart,
      rightEnd,
    });
  }

  /**
   * Record a generic operation
   * @param operation
   * @param indices
   * @param description
   * @param auxiliary
   * @example
   */
  recordOperation(
    operation: SortingOperation,
    indices: number[],
    description: string,
    auxiliary?: Record<string, unknown>
  ): void {
    if (!this.config.recordSteps) return;

    this.currentState.timestamp = performance.now() - this.startTime;

    if (this.config.calculateMetrics) {
      this.currentState.inversionCount = calculateInversionCount([...this.currentState.array], this.comparator);
    }

    this.addStep(operation, indices, description, auxiliary);
  }

  /**
   * Update the array state (for algorithms that modify in place)
   * @param newArray
   * @example
   */
  updateArray(newArray: T[]): void {
    this.currentState.array = [...newArray];
    this.currentState.timestamp = performance.now() - this.startTime;

    if (this.config.calculateMetrics) {
      this.currentState.inversionCount = calculateInversionCount([...this.currentState.array], this.comparator);
    }
  }

  /**
   * Get current state
   * @example
   */
  getCurrentState(): SortingState<T> {
    return { ...this.currentState };
  }

  /**
   * Get all recorded steps
   * @example
   */
  getSteps(): SortingStep<T>[] {
    return [...this.steps];
  }

  /**
   * Add a step to the recording
   * @param operation
   * @param indices
   * @param description
   * @param auxiliary
   * @example
   */
  private addStep(
    operation: SortingOperation,
    indices: number[],
    description: string,
    auxiliary?: Record<string, unknown>
  ): void {
    if (this.config.maxSteps && this.steps.length >= this.config.maxSteps) {
      return;
    }

    this.currentState.step = this.steps.length;

    const step: SortingStep<T> = {
      state: { ...this.currentState },
      operation,
      indices: [...indices],
      description,
      ...(auxiliary !== undefined && { auxiliary }),
    };

    this.steps.push(step);
  }
}
