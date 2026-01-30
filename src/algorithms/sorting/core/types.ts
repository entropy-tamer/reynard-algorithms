/**
 * @file Core types and interfaces for sorting algorithms
 * Defines the type system for sorting algorithm implementations and visualizations
 */

/**
 * Complexity analysis for sorting algorithms
 */
export interface ComplexityAnalysis {
  /** Best case time complexity */
  best: string;
  /** Average case time complexity */
  average: string;
  /** Worst case time complexity */
  worst: string;
  /** Space complexity */
  space: string;
  /** Whether the algorithm is stable */
  stable: boolean;
  /** Whether the algorithm is in-place */
  inPlace: boolean;
  /** Whether the algorithm is adaptive */
  adaptive: boolean;
}

/**
 * State of the sorting process at a given step
 */
export interface SortingState<T> {
  /** Current array state */
  array: T[];
  /** Number of comparisons performed */
  comparisons: number;
  /** Number of swaps/moves performed */
  swaps: number;
  /** Current inversion count */
  inversionCount: number;
  /** Current step number */
  step: number;
  /** Timestamp of this state */
  timestamp: number;
}

/**
 * Type of operation performed in a sorting step
 */
export type SortingOperation =
  | 'compare'
  | 'swap'
  | 'partition'
  | 'merge'
  | 'heapify'
  | 'insert'
  | 'select'
  | 'distribute'
  | 'gather';

/**
 * A single step in the sorting process
 */
export interface SortingStep<T> {
  /** State of the array at this step */
  state: SortingState<T>;
  /** Type of operation performed */
  operation: SortingOperation;
  /** Indices involved in the operation */
  indices: number[];
  /** Human-readable description of the operation */
  description: string;
  /** Optional auxiliary data (e.g., pivot value, merge boundaries) */
  auxiliary?: Record<string, unknown>;
}

/**
 * Metrics collected during sorting
 */
export interface SortingMetrics {
  /** Total number of comparisons */
  comparisons: number;
  /** Total number of swaps/moves */
  swaps: number;
  /** Inversion count at each step */
  inversionCounts: number[];
  /** Lyapunov values at each step (stochastic Lyapunov condition) */
  lyapunovValues: number[];
  /** Execution time in milliseconds */
  executionTime: number;
  /** Peak space complexity (extra elements allocated) */
  spaceComplexity: number;
  /** Additional algorithm-specific metrics */
  custom?: Record<string, number | number[]>;
}

/**
 * Complete result of a sorting operation
 */
export interface SortingResult<T> {
  /** Final sorted array */
  sorted: T[];
  /** All steps taken during sorting (if recorded) */
  steps: SortingStep<T>[];
  /** Collected metrics */
  metrics: SortingMetrics;
  /** Complexity analysis */
  timeComplexity: ComplexityAnalysis;
  /** Algorithm name */
  algorithm: string;
}

/**
 * Configuration for sorting algorithm execution
 */
export interface SortingConfig {
  /** Whether to record all steps (required for visualization) */
  recordSteps: boolean;
  /** Whether to calculate detailed metrics (inversion count, Lyapunov) */
  calculateMetrics: boolean;
  /** Maximum number of steps to record (prevents memory issues) */
  maxSteps?: number;
  /** Whether to track execution time */
  trackTime?: boolean;
}

/**
 * Comparator function type
 */
export type Comparator<T> = (a: T, b: T) => number;

/**
 * Test data pattern types
 */
export type DataPattern =
  | 'random'
  | 'sorted'
  | 'reverse'
  | 'nearlySorted'
  | 'fewUnique'
  | 'manyDuplicates'
  | 'mountain'
  | 'valley';

/**
 * Options for generating test data
 */
export interface TestDataOptions {
  /** Size of the array to generate */
  size: number;
  /** Pattern to use */
  pattern: DataPattern;
  /** Minimum value (for numbers) */
  min?: number;
  /** Maximum value (for numbers) */
  max?: number;
  /** Random seed for reproducibility */
  seed?: number;
  /** For 'nearlySorted': percentage of elements to shuffle (0-1) */
  shufflePercentage?: number;
}

/**
 * Animation frame for visualization
 */
export interface AnimationFrame<T> {
  /** Array state at this frame */
  array: T[];
  /** Indices to highlight with colors */
  highlights: Array<{ index: number; color: string; label?: string }>;
  /** Description of what's happening */
  operation: string;
  /** Current metrics */
  metrics: Partial<SortingMetrics>;
}

/**
 * Base interface for all sorting algorithm implementations
 */
export interface SortingAlgorithm<T> {
  /** Name of the algorithm */
  name: string;
  /** Sort the array and return detailed results */
  sort(array: T[], comparator: Comparator<T>, config: SortingConfig): SortingResult<T>;
  /** Get complexity analysis */
  getComplexity(): ComplexityAnalysis;
}
